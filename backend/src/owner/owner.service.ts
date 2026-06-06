import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, HotelApprovalStatus, OwnerApplicationStatus, Role, TourApprovalStatus, TourRegion, TourType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const HOTEL_FIELDS = ['name', 'description', 'address', 'city', 'country', 'lat', 'lng', 'type', 'images', 'policies'];
const ROOM_FIELDS = ['name', 'description', 'type', 'basePrice', 'capacity', 'totalRooms', 'images'];
const TOUR_FIELDS = ['name', 'description', 'location', 'type', 'region', 'durationDays', 'durationNights', 'basePrice', 'images', 'includes', 'excludes'];
const REQUIRED_APPLICATION_FIELDS = ['businessName', 'contactName', 'phone', 'address', 'city'];

@Injectable()
export class OwnerService {
  constructor(private prisma: PrismaService) {}

  private pick(data: any, fields: string[]) {
    return fields.reduce((acc, field) => {
      if (data[field] !== undefined) acc[field] = data[field];
      return acc;
    }, {} as any);
  }

  private async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('Người dùng không tồn tại');
    return user;
  }

  private async assertVerifiedUser(userId: string) {
    const user = await this.getUser(userId);
    if (!user.isVerified) {
      throw new ForbiddenException('Vui lòng xác thực email trước khi đăng ký làm đối tác.');
    }
    return user;
  }

  private async assertOwner(userId: string) {
    const user = await this.getUser(userId);
    if (user.role !== Role.OWNER && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Chỉ chủ homestay mới có quyền truy cập');
    }
    return user;
  }

  private async assertHotelOwner(userId: string, hotelId: string) {
    await this.assertOwner(userId);
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel || hotel.ownerId !== userId || hotel.approvalStatus === HotelApprovalStatus.ARCHIVED) {
      throw new NotFoundException('Không tìm thấy homestay thuộc quyền quản lý của bạn');
    }
    return hotel;
  }

  private async assertTourOwner(userId: string, tourId: string) {
    await this.assertOwner(userId);
    const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });
    if (!tour || tour.ownerId !== userId || tour.approvalStatus === TourApprovalStatus.ARCHIVED) {
      throw new NotFoundException('KhÃ´ng tÃ¬m tháº¥y tour thuá»™c quyá»n quáº£n lÃ½ cá»§a báº¡n');
    }
    return tour;
  }

  private normalizeTourPayload(data: any, requireBaseFields = false) {
    const payload = this.pick(data, TOUR_FIELDS);
    if (requireBaseFields) {
      if (!payload.name) throw new BadRequestException('TÃªn tour lÃ  báº¯t buá»™c');
      if (!payload.location) throw new BadRequestException('Äá»‹a Ä‘iá»ƒm tour lÃ  báº¯t buá»™c');
      if (payload.basePrice === undefined) throw new BadRequestException('GiÃ¡ tour lÃ  báº¯t buá»™c');
    }
    if (payload.durationDays !== undefined) payload.durationDays = Number(payload.durationDays) || 1;
    if (payload.durationNights !== undefined) payload.durationNights = Number(payload.durationNights) || 0;
    if (payload.basePrice !== undefined) payload.basePrice = Number(payload.basePrice) || 0;
    if (payload.type !== undefined && !Object.values(TourType).includes(payload.type)) delete payload.type;
    if (payload.region !== undefined && !Object.values(TourRegion).includes(payload.region)) delete payload.region;
    if (payload.type === undefined && requireBaseFields) payload.type = TourType.CULTURE;
    if (payload.region === undefined && requireBaseFields) payload.region = TourRegion.BAC;
    if (payload.images === undefined && requireBaseFields) payload.images = [];
    if (payload.includes === undefined && requireBaseFields) payload.includes = [];
    if (payload.excludes === undefined && requireBaseFields) payload.excludes = [];
    return payload;
  }

  async createApplication(userId: string, data: any) {
    const user = await this.assertVerifiedUser(userId);
    if (user.role === Role.OWNER || user.role === Role.ADMIN) {
      throw new BadRequestException('Tài khoản đã có quyền chủ dịch vụ');
    }

    REQUIRED_APPLICATION_FIELDS.forEach((field) => {
      if (!data[field]) throw new BadRequestException(`${field} là bắt buộc`);
    });

    const applicationData = {
      businessName: data.businessName,
      contactName: data.contactName,
      phone: data.phone,
      address: data.address,
      city: data.city,
      note: data.note || null,
      status: OwnerApplicationStatus.PENDING,
      rejectionReason: null,
      reviewedAt: null,
    };

    return this.prisma.ownerApplication.upsert({
      where: { userId },
      create: {
        userId,
        ...applicationData,
      },
      update: applicationData,
    });
  }

  async getMyApplication(userId: string) {
    return this.prisma.ownerApplication.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true, role: true, isVerified: true } } },
    });
  }

  async getStats(userId: string) {
    await this.assertOwner(userId);

    const hotelWhere = {
      ownerId: userId,
      approvalStatus: { not: HotelApprovalStatus.ARCHIVED },
    };
    const tourWhere = {
      ownerId: userId,
      approvalStatus: { not: TourApprovalStatus.ARCHIVED },
    };

    const [totalHotels, pendingHotels, totalRooms, totalTours, pendingTours, pendingBookings, confirmedBookings, revenue] = await Promise.all([
      this.prisma.hotel.count({ where: hotelWhere }),
      this.prisma.hotel.count({ where: { ...hotelWhere, approvalStatus: HotelApprovalStatus.PENDING_REVIEW } }),
      this.prisma.room.count({ where: { hotel: hotelWhere } }),
      this.prisma.tour.count({ where: tourWhere }),
      this.prisma.tour.count({ where: { ...tourWhere, approvalStatus: TourApprovalStatus.PENDING_REVIEW } }),
      this.prisma.booking.count({
        where: {
          status: BookingStatus.PENDING,
          OR: [{ hotel: hotelWhere }, { tour: tourWhere }],
        },
      }),
      this.prisma.booking.count({
        where: {
          status: BookingStatus.CONFIRMED,
          OR: [{ hotel: hotelWhere }, { tour: tourWhere }],
        },
      }),
      this.prisma.booking.aggregate({
        where: {
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
          OR: [{ hotel: hotelWhere }, { tour: tourWhere }],
        },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalHotels,
      pendingHotels,
      totalRooms,
      totalTours,
      pendingTours,
      pendingBookings,
      confirmedBookings,
      revenue: Number(revenue._sum.totalAmount || 0),
    };
  }

  async getHotels(userId: string) {
    await this.assertOwner(userId);
    return this.prisma.hotel.findMany({
      where: {
        ownerId: userId,
        approvalStatus: { not: HotelApprovalStatus.ARCHIVED },
      },
      include: {
        rooms: { orderBy: { name: 'asc' } },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createHotel(userId: string, data: any) {
    await this.assertOwner(userId);
    const payload = this.pick(data, HOTEL_FIELDS);
    if (!payload.name) throw new BadRequestException('Tên homestay là bắt buộc');
    if (!payload.address) throw new BadRequestException('Địa chỉ là bắt buộc');
    if (!payload.city) throw new BadRequestException('Thành phố là bắt buộc');

    return this.prisma.hotel.create({
      data: {
        ...payload,
        description: payload.description || '',
        country: payload.country || 'Việt Nam',
        type: payload.type || 'HOMESTAY',
        images: payload.images || [],
        ownerId: userId,
        approvalStatus: HotelApprovalStatus.PENDING_REVIEW,
        approvalNote: null,
        reviewedAt: null,
      },
      include: { rooms: true, _count: { select: { bookings: true, reviews: true } } },
    });
  }

  async updateHotel(userId: string, hotelId: string, data: any) {
    await this.assertHotelOwner(userId, hotelId);
    const payload = this.pick(data, HOTEL_FIELDS);
    if (Object.keys(payload).length === 0) throw new BadRequestException('Không có dữ liệu cập nhật');

    return this.prisma.hotel.update({
      where: { id: hotelId },
      data: {
        ...payload,
        approvalStatus: HotelApprovalStatus.PENDING_REVIEW,
        approvalNote: null,
        reviewedAt: null,
      },
      include: { rooms: true, _count: { select: { bookings: true, reviews: true } } },
    });
  }

  async archiveHotel(userId: string, hotelId: string) {
    await this.assertHotelOwner(userId, hotelId);
    return this.prisma.hotel.update({
      where: { id: hotelId },
      data: { approvalStatus: HotelApprovalStatus.ARCHIVED },
    });
  }

  async getTours(userId: string) {
    await this.assertOwner(userId);
    return this.prisma.tour.findMany({
      where: {
        ownerId: userId,
        approvalStatus: { not: TourApprovalStatus.ARCHIVED },
      },
      include: {
        itineraries: { orderBy: { dayNumber: 'asc' } },
        availability: { orderBy: { startDate: 'asc' } },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createTour(userId: string, data: any) {
    await this.assertOwner(userId);
    const payload = this.normalizeTourPayload(data, true);

    return this.prisma.tour.create({
      data: {
        ...payload,
        description: payload.description || '',
        ownerId: userId,
        approvalStatus: TourApprovalStatus.PENDING_REVIEW,
        approvalNote: null,
        reviewedAt: null,
      },
      include: {
        itineraries: { orderBy: { dayNumber: 'asc' } },
        availability: { orderBy: { startDate: 'asc' } },
        _count: { select: { bookings: true, reviews: true } },
      },
    });
  }

  async updateTour(userId: string, tourId: string, data: any) {
    await this.assertTourOwner(userId, tourId);
    const payload = this.normalizeTourPayload(data);
    if (Object.keys(payload).length === 0) throw new BadRequestException('KhÃ´ng cÃ³ dá»¯ liá»‡u cáº­p nháº­t');

    return this.prisma.tour.update({
      where: { id: tourId },
      data: {
        ...payload,
        approvalStatus: TourApprovalStatus.PENDING_REVIEW,
        approvalNote: null,
        reviewedAt: null,
      },
      include: {
        itineraries: { orderBy: { dayNumber: 'asc' } },
        availability: { orderBy: { startDate: 'asc' } },
        _count: { select: { bookings: true, reviews: true } },
      },
    });
  }

  async archiveTour(userId: string, tourId: string) {
    await this.assertTourOwner(userId, tourId);
    return this.prisma.tour.update({
      where: { id: tourId },
      data: { approvalStatus: TourApprovalStatus.ARCHIVED },
    });
  }

  async getRooms(userId: string, hotelId: string) {
    await this.assertHotelOwner(userId, hotelId);
    return this.prisma.room.findMany({
      where: { hotelId },
      orderBy: { name: 'asc' },
    });
  }

  async createRoom(userId: string, hotelId: string, data: any) {
    await this.assertHotelOwner(userId, hotelId);
    const payload = this.pick(data, ROOM_FIELDS);
    if (!payload.name) throw new BadRequestException('Tên phòng là bắt buộc');
    if (payload.basePrice === undefined) throw new BadRequestException('Giá phòng là bắt buộc');

    const room = await this.prisma.room.create({
      data: {
        ...payload,
        hotelId,
        basePrice: Number(payload.basePrice),
        capacity: payload.capacity ? Number(payload.capacity) : 2,
        totalRooms: payload.totalRooms ? Number(payload.totalRooms) : 1,
        images: payload.images || [],
      },
    });

    await this.prisma.hotel.update({
      where: { id: hotelId },
      data: { approvalStatus: HotelApprovalStatus.PENDING_REVIEW, approvalNote: null, reviewedAt: null },
    });

    return room;
  }

  async updateRoom(userId: string, hotelId: string, roomId: string, data: any) {
    await this.assertHotelOwner(userId, hotelId);
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room || room.hotelId !== hotelId) throw new NotFoundException('Không tìm thấy phòng');

    const payload = this.pick(data, ROOM_FIELDS);
    if (payload.basePrice !== undefined) payload.basePrice = Number(payload.basePrice);
    if (payload.capacity !== undefined) payload.capacity = Number(payload.capacity);
    if (payload.totalRooms !== undefined) payload.totalRooms = Number(payload.totalRooms);

    const updatedRoom = await this.prisma.room.update({
      where: { id: roomId },
      data: payload,
    });

    await this.prisma.hotel.update({
      where: { id: hotelId },
      data: { approvalStatus: HotelApprovalStatus.PENDING_REVIEW, approvalNote: null, reviewedAt: null },
    });

    return updatedRoom;
  }

  async deleteRoom(userId: string, hotelId: string, roomId: string) {
    await this.assertHotelOwner(userId, hotelId);
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { _count: { select: { bookingRooms: true } } },
    });
    if (!room || room.hotelId !== hotelId) throw new NotFoundException('Không tìm thấy phòng');
    if (room._count.bookingRooms > 0) {
      throw new BadRequestException('Không thể xoá phòng đã từng có booking');
    }

    await this.prisma.room.delete({ where: { id: roomId } });
    await this.prisma.hotel.update({
      where: { id: hotelId },
      data: { approvalStatus: HotelApprovalStatus.PENDING_REVIEW, approvalNote: null, reviewedAt: null },
    });

    return { message: 'Xoá phòng thành công' };
  }

  async getRoomAvailability(userId: string, hotelId: string, roomId: string, startDate: string, endDate: string) {
    await this.assertHotelOwner(userId, hotelId);
    
    return this.prisma.roomAvailability.findMany({
      where: {
        roomId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        }
      },
      orderBy: { date: 'asc' }
    });
  }

  async setRoomAvailability(userId: string, hotelId: string, roomId: string, data: any) {
    await this.assertHotelOwner(userId, hotelId);
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room || room.hotelId !== hotelId) throw new NotFoundException('Không tìm thấy phòng');

    // data is array of { date, price, available }
    const results: any[] = [];
    for (const item of data) {
      const d = new Date(item.date);
      // Avoid time zone issues by matching exact date
      d.setUTCHours(0,0,0,0);
      
      const record = await this.prisma.roomAvailability.upsert({
        where: {
          roomId_date: {
            roomId,
            date: d
          }
        },
        update: {
          price: item.price !== undefined ? Number(item.price) : undefined,
          available: item.available !== undefined ? Number(item.available) : undefined,
        },
        create: {
          roomId,
          date: d,
          price: item.price !== undefined ? Number(item.price) : Number(room.basePrice),
          available: item.available !== undefined ? Number(item.available) : Number(room.totalRooms),
        }
      });
      results.push(record);
    }
    return results;
  }

  async getBookings(userId: string) {
    await this.assertOwner(userId);
    return this.prisma.booking.findMany({
      where: {
        OR: [
          {
            hotel: {
              ownerId: userId,
              approvalStatus: { not: HotelApprovalStatus.ARCHIVED },
            },
          },
          {
            tour: {
              ownerId: userId,
              approvalStatus: { not: TourApprovalStatus.ARCHIVED },
            },
          },
        ],
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        hotel: { select: { id: true, name: true, city: true } },
        tour: { select: { id: true, name: true, location: true } },
        bookingRooms: { include: { room: true } },
        bookingTours: { include: { tour: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async updateBookingStatus(userId: string, bookingId: string, nextStatus: string) {
    await this.assertOwner(userId);
    if (!['CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(nextStatus)) {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { hotel: { select: { ownerId: true } }, tour: { select: { ownerId: true } } },
    });

    if (!booking || (booking.hotel?.ownerId !== userId && booking.tour?.ownerId !== userId)) {
      throw new NotFoundException('Không tìm thấy booking thuộc homestay của bạn');
    }

    const transitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
    };

    if (!transitions[booking.status]?.includes(nextStatus)) {
      throw new BadRequestException('Không thể chuyển trạng thái booking theo yêu cầu');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: nextStatus as BookingStatus },
    });
  }
}

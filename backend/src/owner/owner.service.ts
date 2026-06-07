import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, HotelApprovalStatus, OwnerApplicationStatus, Role, TourApprovalStatus, TourRegion, TourType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const HOTEL_FIELDS = ['name', 'description', 'address', 'city', 'country', 'lat', 'lng', 'type', 'images', 'policies'];
const ROOM_FIELDS = ['name', 'description', 'type', 'basePrice', 'capacity', 'totalRooms', 'images'];
const TOUR_FIELDS = ['name', 'description', 'location', 'type', 'region', 'durationDays', 'durationNights', 'basePrice', 'images', 'includes', 'excludes'];
const REQUIRED_APPLICATION_FIELDS = ['businessName', 'contactName', 'phone', 'address', 'city'];

@Injectable()
export class OwnerService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private pick(data: any, fields: string[]) {
    return fields.reduce((acc, field) => {
      if (data[field] !== undefined) acc[field] = data[field];
      return acc;
    }, {} as any);
  }

  private async notifyAdmins(type: string, title: string, content: string, link = '/admin') {
    const admins = await this.prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: { id: true },
    });
    if (admins.length === 0) return;
    await this.notificationsService.createMany(admins.map((admin) => ({
      userId: admin.id,
      type,
      title,
      content,
      link,
    })));
  }

  private notifyUser(userId: string, type: string, title: string, content: string, link = '/owner') {
    this.notificationsService.create({ userId, type, title, content, link })
      .catch((err) => console.error('[Notification] owner request failed:', err?.message));
  }

  private notifyAdminsPending(type: string, title: string, content: string, link = '/admin') {
    this.notifyAdmins(type, title, content, link)
      .catch((err) => console.error('[Notification] admin pending request failed:', err?.message));
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

    const application = await this.prisma.ownerApplication.upsert({
      where: { userId },
      create: {
        userId,
        ...applicationData,
      },
      update: applicationData,
    });

    this.notifyAdminsPending(
      'OWNER_APPLICATION_REQUESTED',
      'Có hồ sơ owner mới cần duyệt',
      `${data.contactName || user.name || 'Người dùng'} vừa gửi yêu cầu làm owner cho ${data.businessName}.`,
      '/admin'
    );
    this.notifyUser(
      userId,
      'OWNER_APPLICATION_SUBMITTED',
      'Đã gửi yêu cầu làm owner',
      'Hồ sơ đối tác của bạn đã được gửi tới admin và đang chờ duyệt.',
      '/owner'
    );

    return application;
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

  async getAnalytics(userId: string, range = '30d') {
    await this.assertOwner(userId);
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);

    const hotelWhere = {
      ownerId: userId,
      approvalStatus: { not: HotelApprovalStatus.ARCHIVED },
    };
    const tourWhere = {
      ownerId: userId,
      approvalStatus: { not: TourApprovalStatus.ARCHIVED },
    };
    const bookingWhere = {
      createdAt: { gte: from },
      OR: [{ hotel: hotelWhere }, { tour: tourWhere }],
    };

    const [bookings, rooms, hotels, tours, reviews, listingViews] = await Promise.all([
      this.prisma.booking.findMany({
        where: bookingWhere,
        include: {
          hotel: { select: { id: true, name: true } },
          tour: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.room.findMany({
        where: { hotel: hotelWhere },
        include: {
          hotel: { select: { id: true, name: true } },
          availability: { where: { date: { gte: from } }, orderBy: { date: 'asc' } },
        },
        take: 50,
      }),
      this.prisma.hotel.findMany({
        where: hotelWhere,
        include: {
          _count: { select: { bookings: true, reviews: true, listingViews: true } },
          bookings: {
            where: { createdAt: { gte: from }, status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] } },
            select: { totalAmount: true },
          },
        },
      }),
      this.prisma.tour.findMany({
        where: tourWhere,
        include: {
          _count: { select: { bookings: true, reviews: true, listingViews: true } },
          bookings: {
            where: { createdAt: { gte: from }, status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] } },
            select: { totalAmount: true },
          },
        },
      }),
      this.prisma.review.findMany({
        where: {
          OR: [{ hotel: hotelWhere }, { tour: tourWhere }],
          createdAt: { gte: from },
        },
        select: { rating: true, comment: true, hotelId: true, tourId: true, createdAt: true },
      }),
      this.prisma.listingView.findMany({
        where: {
          createdAt: { gte: from },
          OR: [{ hotel: hotelWhere }, { tour: tourWhere }],
        },
        select: { id: true, hotelId: true, tourId: true, createdAt: true },
      }),
    ]);

    const revenueSeries = Array.from({ length: days }).map((_, idx) => {
      const date = new Date(from);
      date.setDate(from.getDate() + idx);
      const key = date.toISOString().slice(0, 10);
      const dayBookings = bookings.filter((booking) => booking.createdAt.toISOString().slice(0, 10) === key);
      return {
        date: key,
        revenue: dayBookings
          .filter((booking) => ['CONFIRMED', 'COMPLETED'].includes(booking.status))
          .reduce((sum, booking) => sum + Number(booking.totalAmount), 0),
        bookings: dayBookings.length,
      };
    });

    const occupancy = rooms.map((room) => {
      const totalCapacity = Math.max(1, Number(room.totalRooms || 1));
      const usedDays = room.availability.length || 1;
      const booked = room.availability.reduce((sum, item) => sum + Number(item.booked || 0), 0);
      return {
        roomId: room.id,
        roomName: room.name,
        hotelName: room.hotel.name,
        occupancyRate: Math.round((booked / (totalCapacity * usedDays)) * 100),
        days: room.availability.map((item) => ({
          date: item.date.toISOString().slice(0, 10),
          booked: item.booked,
          available: item.available,
        })),
      };
    });

    const topPerforming = [
      ...hotels.map((hotel) => ({
        id: hotel.id,
        type: 'hotel',
        name: hotel.name,
        bookings: hotel._count.bookings,
        reviews: hotel._count.reviews,
        views: hotel._count.listingViews,
        revenue: hotel.bookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0),
      })),
      ...tours.map((tour) => ({
        id: tour.id,
        type: 'tour',
        name: tour.name,
        bookings: tour._count.bookings,
        reviews: tour._count.reviews,
        views: tour._count.listingViews,
        revenue: tour.bookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0),
      })),
    ].sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings).slice(0, 8);

    const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((review) => review.rating === rating).length,
    }));
    const positive = reviews.filter((review) => review.rating >= 4).length;
    const negative = reviews.filter((review) => review.rating <= 2).length;

    return {
      range,
      revenueSeries,
      occupancy,
      topPerforming,
      reviewSummary: {
        total: reviews.length,
        averageRating: reviews.length
          ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
          : 0,
        positive,
        negative,
        neutral: reviews.length - positive - negative,
        distribution: ratingDistribution,
      },
      funnel: {
        views: listingViews.length,
        bookings: bookings.length,
        completed: bookings.filter((booking) => booking.status === BookingStatus.COMPLETED).length,
        conversionRate: listingViews.length ? Number(((bookings.length / listingViews.length) * 100).toFixed(1)) : 0,
      },
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

    const hotel = await this.prisma.hotel.create({
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

    this.notifyAdminsPending(
      'LISTING_REVIEW_REQUESTED',
      'Co homestay moi can duyet',
      `Owner vua gui homestay "${hotel.name}" cho admin duyet.`,
      '/admin'
    );
    this.notifyUser(
      userId,
      'LISTING_REVIEW_SUBMITTED',
      'Da gui homestay cho duyet',
      `Homestay "${hotel.name}" da duoc gui toi admin va dang cho duyet.`,
      '/owner'
    );

    return hotel;
  }

  async updateHotel(userId: string, hotelId: string, data: any) {
    await this.assertHotelOwner(userId, hotelId);
    const payload = this.pick(data, HOTEL_FIELDS);
    if (Object.keys(payload).length === 0) throw new BadRequestException('Không có dữ liệu cập nhật');

    const hotel = await this.prisma.hotel.update({
      where: { id: hotelId },
      data: {
        ...payload,
        approvalStatus: HotelApprovalStatus.PENDING_REVIEW,
        approvalNote: null,
        reviewedAt: null,
      },
      include: { rooms: true, _count: { select: { bookings: true, reviews: true } } },
    });

    this.notifyAdminsPending(
      'LISTING_REVIEW_REQUESTED',
      'Homestay cap nhat can duyet',
      `Owner vua cap nhat homestay "${hotel.name}" va gui lai cho admin duyet.`,
      '/admin'
    );
    this.notifyUser(
      userId,
      'LISTING_REVIEW_SUBMITTED',
      'Da gui homestay cap nhat cho duyet',
      `Ban da gui ban cap nhat cua "${hotel.name}" toi admin.`,
      '/owner'
    );

    return hotel;
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

    const tour = await this.prisma.tour.create({
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

    this.notifyAdminsPending(
      'LISTING_REVIEW_REQUESTED',
      'Co tour moi can duyet',
      `Owner vua gui tour "${tour.name}" cho admin duyet.`,
      '/admin'
    );
    this.notifyUser(
      userId,
      'LISTING_REVIEW_SUBMITTED',
      'Da gui tour cho duyet',
      `Tour "${tour.name}" da duoc gui toi admin va dang cho duyet.`,
      '/owner'
    );

    return tour;
  }

  async updateTour(userId: string, tourId: string, data: any) {
    await this.assertTourOwner(userId, tourId);
    const payload = this.normalizeTourPayload(data);
    if (Object.keys(payload).length === 0) throw new BadRequestException('KhÃ´ng cÃ³ dá»¯ liá»‡u cáº­p nháº­t');

    const tour = await this.prisma.tour.update({
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

    this.notifyAdminsPending(
      'LISTING_REVIEW_REQUESTED',
      'Tour cap nhat can duyet',
      `Owner vua cap nhat tour "${tour.name}" va gui lai cho admin duyet.`,
      '/admin'
    );
    this.notifyUser(
      userId,
      'LISTING_REVIEW_SUBMITTED',
      'Da gui tour cap nhat cho duyet',
      `Ban da gui ban cap nhat cua "${tour.name}" toi admin.`,
      '/owner'
    );

    return tour;
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

    const hotel = await this.prisma.hotel.update({
      where: { id: hotelId },
      data: { approvalStatus: HotelApprovalStatus.PENDING_REVIEW, approvalNote: null, reviewedAt: null },
    });

    this.notifyAdminsPending(
      'LISTING_REVIEW_REQUESTED',
      'Homestay co phong moi can duyet',
      `Owner vua them phong "${room.name}" cho homestay "${hotel.name}" va gui admin duyet.`,
      '/admin'
    );
    this.notifyUser(
      userId,
      'LISTING_REVIEW_SUBMITTED',
      'Da gui thay doi phong cho duyet',
      `Thay doi phong cua homestay "${hotel.name}" da duoc gui toi admin.`,
      '/owner'
    );

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

    const hotel = await this.prisma.hotel.update({
      where: { id: hotelId },
      data: { approvalStatus: HotelApprovalStatus.PENDING_REVIEW, approvalNote: null, reviewedAt: null },
    });

    this.notifyAdminsPending(
      'LISTING_REVIEW_REQUESTED',
      'Homestay co phong cap nhat can duyet',
      `Owner vua cap nhat phong "${updatedRoom.name}" cua homestay "${hotel.name}" va gui admin duyet.`,
      '/admin'
    );
    this.notifyUser(
      userId,
      'LISTING_REVIEW_SUBMITTED',
      'Da gui cap nhat phong cho duyet',
      `Cap nhat phong cua homestay "${hotel.name}" da duoc gui toi admin.`,
      '/owner'
    );

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
    const hotel = await this.prisma.hotel.update({
      where: { id: hotelId },
      data: { approvalStatus: HotelApprovalStatus.PENDING_REVIEW, approvalNote: null, reviewedAt: null },
    });

    this.notifyAdminsPending(
      'LISTING_REVIEW_REQUESTED',
      'Homestay co phong bi xoa can duyet lai',
      `Owner vua xoa phong "${room.name}" cua homestay "${hotel.name}" va gui admin duyet lai.`,
      '/admin'
    );
    this.notifyUser(
      userId,
      'LISTING_REVIEW_SUBMITTED',
      'Da gui thay doi xoa phong cho duyet',
      `Thay doi phong cua homestay "${hotel.name}" da duoc gui toi admin.`,
      '/owner'
    );

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

  async getReviews(userId: string) {
    await this.assertOwner(userId);
    const hotelWhere = {
      ownerId: userId,
      approvalStatus: { not: HotelApprovalStatus.ARCHIVED },
    };
    const tourWhere = {
      ownerId: userId,
      approvalStatus: { not: TourApprovalStatus.ARCHIVED },
    };

    return this.prisma.review.findMany({
      where: {
        OR: [{ hotel: hotelWhere }, { tour: tourWhere }],
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        hotel: { select: { id: true, name: true, city: true } },
        tour: { select: { id: true, name: true, location: true } },
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

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: nextStatus as BookingStatus },
    });

    this.notificationsService.create({
      userId: updated.userId,
      type: nextStatus === 'CONFIRMED' ? 'BOOKING_CONFIRMED' : nextStatus === 'CANCELLED' ? 'BOOKING_CANCELLED' : 'BOOKING_COMPLETED',
      title: 'Trạng thái booking đã cập nhật',
      content: `Booking ${updated.shortId} hiện là ${nextStatus}.`,
      link: '/dashboard',
    }).catch((err) => console.error('[Notification] owner booking status failed:', err?.message));

    return updated;
  }

  async replyReview(userId: string, reviewId: string, content: string) {
    await this.assertOwner(userId);
    if (!content?.trim()) throw new BadRequestException('Nội dung phản hồi là bắt buộc');

    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        hotel: { select: { ownerId: true, name: true } },
        tour: { select: { ownerId: true, name: true } },
      },
    });

    if (!review || (review.hotel?.ownerId !== userId && review.tour?.ownerId !== userId)) {
      throw new NotFoundException('Không tìm thấy review thuộc dịch vụ của bạn');
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        replyContent: content.trim(),
        repliedAt: new Date(),
      },
      include: {
        user: { select: { name: true, avatar: true } },
      },
    });

    this.notificationsService.create({
      userId: review.userId,
      type: 'REVIEW_REPLY',
      title: 'Owner đã phản hồi đánh giá của bạn',
      content: `${review.hotel?.name || review.tour?.name || 'Dịch vụ'} vừa phản hồi đánh giá của bạn.`,
      link: review.hotelId ? `/homestays/${review.hotelId}` : `/tours/${review.tourId}`,
    }).catch((err) => console.error('[Notification] review reply failed:', err?.message));

    return updated;
  }
}

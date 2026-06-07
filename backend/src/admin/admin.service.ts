import { Injectable, ForbiddenException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HotelApprovalStatus, OwnerApplicationStatus, TourApprovalStatus, TourRegion, TourType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private async assertAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Chỉ admin mới có quyền truy cập');
    }
    return user;
  }

  async getOverviewStats(userId: string) {
    await this.assertAdmin(userId);

    const [
      totalUsers,
      totalBookings,
      totalTours,
      totalHotels,
      totalRevenue,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      newUsersThisMonth,
      revenueThisMonth,
      pendingOwnerApplications,
      pendingHotels,
      pendingTours,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.booking.count(),
      this.prisma.tour.count(),
      this.prisma.hotel.count({ where: { approvalStatus: { not: HotelApprovalStatus.ARCHIVED } } }),
      this.prisma.booking.aggregate({
        where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
        _sum: { totalAmount: true },
      }),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.booking.count({ where: { status: 'CANCELLED' } }),
      this.prisma.booking.count({ where: { status: 'COMPLETED' } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      this.prisma.booking.aggregate({
        where: {
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.ownerApplication.count({ where: { status: OwnerApplicationStatus.PENDING } }),
      this.prisma.hotel.count({ where: { approvalStatus: HotelApprovalStatus.PENDING_REVIEW } }),
      this.prisma.tour.count({ where: { approvalStatus: TourApprovalStatus.PENDING_REVIEW } }),
    ]);

    // Monthly revenue for chart (last 6 months)
    const monthlyRevenue: { month: string; revenue: number; bookings: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      const res = await this.prisma.booking.aggregate({
        where: {
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          createdAt: { gte: start, lte: end },
        },
        _sum: { totalAmount: true },
      });
      monthlyRevenue.push({
        month: start.toLocaleString('vi-VN', { month: 'short' }),
        revenue: Number(res._sum.totalAmount || 0),
        bookings: await this.prisma.booking.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
      });
    }

    return {
      totalUsers,
      totalBookings,
      totalTours,
      totalHotels,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      newUsersThisMonth,
      revenueThisMonth: Number(revenueThisMonth._sum.totalAmount || 0),
      pendingOwnerApplications,
      pendingHotels,
      pendingTours,
      monthlyRevenue,
    };
  }

  // ===================== OWNER APPLICATIONS =====================

  async getOwnerApplications(userId: string) {
    await this.assertAdmin(userId);
    return this.prisma.ownerApplication.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, role: true, isVerified: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOwnerApplicationStatus(
    userId: string,
    applicationId: string,
    status: string,
    rejectionReason?: string,
  ) {
    await this.assertAdmin(userId);
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new BadRequestException('Trạng thái hồ sơ không hợp lệ');
    }

    const application = await this.prisma.ownerApplication.findUnique({ where: { id: applicationId } });
    if (!application) throw new NotFoundException('Hồ sơ đối tác không tồn tại');

    const updated = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.ownerApplication.update({
        where: { id: applicationId },
        data: {
          status: status as OwnerApplicationStatus,
          rejectionReason: status === 'REJECTED' ? rejectionReason || null : null,
          reviewedAt: new Date(),
        },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, role: true, isVerified: true } },
        },
      });

      if (status === 'APPROVED') {
        await tx.user.update({
          where: { id: application.userId },
          data: { role: 'OWNER' },
        });
      }

      return updated;
    });

    this.notificationsService.create({
      userId: application.userId,
      type: status === 'APPROVED' ? 'OWNER_APPROVED' : 'OWNER_REJECTED',
      title: status === 'APPROVED' ? 'Hồ sơ owner đã được duyệt' : 'Hồ sơ owner bị từ chối',
      content: status === 'APPROVED'
        ? 'Bạn đã trở thành chủ dịch vụ trên VietJourney.'
        : (rejectionReason || 'Hồ sơ cần bổ sung thông tin trước khi duyệt.'),
      link: status === 'APPROVED' ? '/owner' : '/dashboard',
    }).catch((err) => console.error('[Notification] owner application failed:', err?.message));

    return updated;
  }

  // ===================== BOOKINGS =====================

  async getAllBookings(userId: string) {
    await this.assertAdmin(userId);
    return this.prisma.booking.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        hotel: { select: { id: true, name: true, city: true } },
        tour: { select: { id: true, name: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async updateBookingStatus(userId: string, bookingId: string, status: string) {
    await this.assertAdmin(userId);
    const booking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: status as any },
    });

    const type = status === 'CONFIRMED'
      ? 'BOOKING_CONFIRMED'
      : status === 'CANCELLED'
        ? 'BOOKING_CANCELLED'
        : status === 'COMPLETED'
          ? 'BOOKING_COMPLETED'
          : 'BOOKING_CONFIRMED';

    this.notificationsService.create({
      userId: booking.userId,
      type,
      title: 'Trạng thái booking đã cập nhật',
      content: `Booking ${booking.shortId} hiện là ${status}.`,
      link: '/dashboard',
    }).catch((err) => console.error('[Notification] admin booking status failed:', err?.message));

    return booking;
  }

  // ===================== USERS =====================

  async getAllUsers(userId: string) {
    await this.assertAdmin(userId);
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        phone: true,
        createdAt: true,
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUser(adminId: string, data: any) {
    await this.assertAdmin(adminId);
    
    if (!data.email) throw new BadRequestException('Email là bắt buộc');
    if (!data.password && data.role !== 'USER') {
      // For owners/admins, maybe we want to force a password, but let's default for now
    }

    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email đã tồn tại');

    const hashedPassword = await bcrypt.hash(data.password || '123456', 10);

    try {
      return await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name || '',
          phone: data.phone || '',
          role: data.role || 'USER',
          isVerified: true,
          emailVerified: new Date(),
        },
        select: { id: true, name: true, email: true, role: true, phone: true }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(adminId: string, userId: string, data: any) {
    await this.assertAdmin(adminId);
    
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const updateData: any = {};
    if (data.email !== undefined && data.email !== user.email) {
      if (!data.email) throw new BadRequestException('Email không được để trống');
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existing) throw new ConflictException('Email đã tồn tại');
      updateData.email = data.email;
    }

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.role !== undefined) {
      // Basic validation for role
      const validRoles = ['ADMIN', 'USER', 'OWNER'];
      if (validRoles.includes(data.role)) {
        updateData.role = data.role;
      }
    }
    
    if (data.password && data.password.trim() !== '') {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, name: true, email: true, role: true, phone: true }
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(adminId: string, targetUserId: string) {
    await this.assertAdmin(adminId);
    
    if (adminId === targetUserId) {
      throw new ForbiddenException('Không thể tự xoá chính mình');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({ 
      where: { id: targetUserId },
      include: { _count: { select: { bookings: true, ownedHotels: true, ownedTours: true } } }
    });
    
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    // If user has hotels or tours, prevent deletion to avoid orphan records
    if (user._count.ownedHotels > 0 || user._count.ownedTours > 0) {
      throw new BadRequestException('Không thể xoá người dùng này vì họ đang sở hữu Homestay hoặc Tour. Vui lòng chuyển quyền sở hữu hoặc xoá các dịch vụ đó trước.');
    }

    try {
      // Manual cascade for related entities that don't have it in schema
      await this.prisma.$transaction([
        this.prisma.wishlist.deleteMany({ where: { userId: targetUserId } }),
        this.prisma.review.deleteMany({ where: { userId: targetUserId } }),
        this.prisma.session.deleteMany({ where: { userId: targetUserId } }),
        this.prisma.booking.deleteMany({ where: { userId: targetUserId } }), // In a real app, we might want to keep these but anonymize them
        this.prisma.user.delete({ where: { id: targetUserId } }),
      ]);
      return { message: 'Xoá người dùng thành công' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new BadRequestException('Không thể xoá người dùng này do có ràng buộc dữ liệu phức tạp.');
    }
  }

  async updateUserRole(adminId: string, targetUserId: string, role: string) {
    await this.assertAdmin(adminId);
    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: role as any },
    });
  }

  // ===================== TOURS CRUD =====================

  async getAllTours(userId: string) {
    await this.assertAdmin(userId);
    return this.prisma.tour.findMany({
      where: { approvalStatus: { not: TourApprovalStatus.ARCHIVED } },
      include: {
        itineraries: { orderBy: { dayNumber: 'asc' } },
        availability: { orderBy: { startDate: 'asc' } },
        owner: { select: { name: true, email: true, avatar: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTour(userId: string, data: any) {
    const admin = await this.assertAdmin(userId);
    const tour = await this.prisma.tour.create({
      data: {
        name: data.name,
        description: data.description || '',
        location: data.location || '',
        type: Object.values(TourType).includes(data.type) ? data.type : TourType.CULTURE,
        region: Object.values(TourRegion).includes(data.region) ? data.region : TourRegion.BAC,
        durationDays: parseInt(data.durationDays) || 1,
        durationNights: parseInt(data.durationNights) || 0,
        basePrice: parseFloat(data.basePrice) || 0,
        images: data.images || [],
        includes: data.includes || [],
        excludes: data.excludes || [],
        ownerId: userId,
        approvalStatus: TourApprovalStatus.APPROVED,
        reviewedAt: new Date(),
      },
    });

    if (data.startDate) {
      await this.prisma.tourAvailability.create({
        data: {
          tourId: tour.id,
          startDate: new Date(data.startDate),
          price: tour.basePrice,
          capacity: 10,
          booked: 0,
          available: 10,
        }
      });
    }

    return tour;
  }

  async updateTour(userId: string, tourId: string, data: any) {
    await this.assertAdmin(userId);
    const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });
    if (!tour) throw new NotFoundException('Tour không tồn tại');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.type !== undefined && Object.values(TourType).includes(data.type)) updateData.type = data.type;
    if (data.region !== undefined && Object.values(TourRegion).includes(data.region)) updateData.region = data.region;
    if (data.durationDays !== undefined) updateData.durationDays = parseInt(data.durationDays);
    if (data.durationNights !== undefined) updateData.durationNights = parseInt(data.durationNights);
    if (data.basePrice !== undefined) updateData.basePrice = parseFloat(data.basePrice);
    if (data.images !== undefined) updateData.images = data.images;
    if (data.includes !== undefined) updateData.includes = data.includes;
    if (data.excludes !== undefined) updateData.excludes = data.excludes;

    const updated = await this.prisma.tour.update({ where: { id: tourId }, data: updateData });

    if (data.startDate) {
      const startD = new Date(data.startDate);
      const existing = await this.prisma.tourAvailability.findFirst({
        where: { tourId, startDate: startD }
      });
      if (!existing) {
        // Clear old ones and write the new active start date
        await this.prisma.tourAvailability.deleteMany({ where: { tourId } });
        await this.prisma.tourAvailability.create({
          data: {
            tourId,
            startDate: startD,
            price: updated.basePrice,
            capacity: 10,
            booked: 0,
            available: 10,
          }
        });
      }
    }

    return updated;
  }

  async updateTourApproval(userId: string, tourId: string, status: string, note?: string) {
    await this.assertAdmin(userId);
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new BadRequestException('Tráº¡ng thÃ¡i duyá»‡t tour khÃ´ng há»£p lá»‡');
    }

    const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });
    if (!tour || tour.approvalStatus === TourApprovalStatus.ARCHIVED) {
      throw new NotFoundException('Tour khÃ´ng tá»“n táº¡i');
    }

    const updated = await this.prisma.tour.update({
      where: { id: tourId },
      data: {
        approvalStatus: status as TourApprovalStatus,
        approvalNote: note || null,
        reviewedAt: new Date(),
      },
      include: {
        itineraries: { orderBy: { dayNumber: 'asc' } },
        availability: { orderBy: { startDate: 'asc' } },
        owner: { select: { name: true, email: true, avatar: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
    });

    this.notificationsService.create({
      userId: tour.ownerId,
      type: status === 'APPROVED' ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
      title: status === 'APPROVED' ? 'Tour đã được duyệt' : 'Tour bị từ chối',
      content: status === 'APPROVED'
        ? `${tour.name} đã được hiển thị công khai.`
        : (note || `${tour.name} cần chỉnh sửa trước khi duyệt.`),
      link: '/owner',
    }).catch((err) => console.error('[Notification] tour approval failed:', err?.message));

    return updated;
  }

  async deleteTour(userId: string, tourId: string) {
    await this.assertAdmin(userId);
    const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });
    if (!tour) throw new NotFoundException('Tour không tồn tại');
    return this.prisma.tour.update({
      where: { id: tourId },
      data: { approvalStatus: TourApprovalStatus.ARCHIVED },
    });
  }

  // ===================== HOTELS/HOMESTAYS CRUD =====================

  async getAllHotels(userId: string) {
    await this.assertAdmin(userId);
    return this.prisma.hotel.findMany({
      where: { approvalStatus: { not: HotelApprovalStatus.ARCHIVED } },
      include: {
        rooms: { select: { id: true, name: true, basePrice: true } },
        owner: { select: { name: true, email: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createHotel(userId: string, data: any) {
    await this.assertAdmin(userId);
    const hotel = await this.prisma.hotel.create({
      data: {
        name: data.name,
        description: data.description || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || 'Việt Nam',
        type: data.type || 'HOMESTAY',
        images: data.images || [],
        ownerId: userId,
        approvalStatus: HotelApprovalStatus.APPROVED,
        reviewedAt: new Date(),
      },
    });

    const price = parseFloat(data.basePrice) || 0;
    await this.prisma.room.create({
      data: {
        hotelId: hotel.id,
        name: 'Standard Room',
        basePrice: price,
        capacity: 2,
        totalRooms: 1,
      }
    });

    return hotel;
  }

  async updateHotel(userId: string, hotelId: string, data: any) {
    await this.assertAdmin(userId);
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      include: { rooms: true }
    });
    if (!hotel) throw new NotFoundException('Homestay không tồn tại');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.policies !== undefined) updateData.policies = data.policies;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.lat !== undefined) updateData.lat = parseFloat(data.lat);
    if (data.lng !== undefined) updateData.lng = parseFloat(data.lng);

    const updated = await this.prisma.hotel.update({ where: { id: hotelId }, data: updateData });

    if (data.basePrice !== undefined) {
      const price = parseFloat(data.basePrice) || 0;
      if (hotel.rooms.length > 0) {
        await this.prisma.room.update({
          where: { id: hotel.rooms[0].id },
          data: { basePrice: price }
        });
      } else {
        await this.prisma.room.create({
          data: {
            hotelId: hotelId,
            name: 'Standard Room',
            basePrice: price,
            capacity: 2,
            totalRooms: 1,
          }
        });
      }
    }

    return updated;
  }

  async updateHotelApproval(userId: string, hotelId: string, status: string, note?: string) {
    await this.assertAdmin(userId);
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new BadRequestException('Trạng thái duyệt homestay không hợp lệ');
    }

    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel || hotel.approvalStatus === HotelApprovalStatus.ARCHIVED) {
      throw new NotFoundException('Homestay không tồn tại');
    }

    const updated = await this.prisma.hotel.update({
      where: { id: hotelId },
      data: {
        approvalStatus: status as HotelApprovalStatus,
        approvalNote: note || null,
        reviewedAt: new Date(),
      },
      include: {
        rooms: { select: { id: true, name: true, basePrice: true } },
        owner: { select: { name: true, email: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
    });

    this.notificationsService.create({
      userId: hotel.ownerId,
      type: status === 'APPROVED' ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
      title: status === 'APPROVED' ? 'Homestay đã được duyệt' : 'Homestay bị từ chối',
      content: status === 'APPROVED'
        ? `${hotel.name} đã được hiển thị công khai.`
        : (note || `${hotel.name} cần chỉnh sửa trước khi duyệt.`),
      link: '/owner',
    }).catch((err) => console.error('[Notification] hotel approval failed:', err?.message));

    return updated;
  }

  async deleteHotel(userId: string, hotelId: string) {
    await this.assertAdmin(userId);
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('Homestay không tồn tại');
    return this.prisma.hotel.delete({ where: { id: hotelId } });
  }

  // ===================== REVIEWS =====================

  async getAllReviews(userId: string) {
    await this.assertAdmin(userId);
    return this.prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        hotel: { select: { id: true, name: true } },
        tour: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteReview(adminId: string, reviewId: string) {
    await this.assertAdmin(adminId);
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review không tồn tại');

    // Recalculate hotel/tour rating if needed
    const deleted = await this.prisma.review.delete({ where: { id: reviewId } });

    if (deleted.hotelId) {
      const agg = await this.prisma.review.aggregate({
        where: { hotelId: deleted.hotelId },
        _avg: { rating: true },
      });
      await this.prisma.hotel.update({
        where: { id: deleted.hotelId },
        data: { rating: agg._avg.rating || 0 },
      });
    }

    return { message: 'Xoá review thành công' };
  }
}

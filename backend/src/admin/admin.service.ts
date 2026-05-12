import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private async assertAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
      throw new ForbiddenException('Chỉ admin hoặc owner mới có quyền truy cập');
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
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.booking.count(),
      this.prisma.tour.count(),
      this.prisma.hotel.count(),
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
      monthlyRevenue,
    };
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
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: status as any },
    });
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
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTour(userId: string, data: any) {
    const admin = await this.assertAdmin(userId);
    return this.prisma.tour.create({
      data: {
        name: data.name,
        description: data.description || '',
        location: data.location || '',
        durationDays: parseInt(data.durationDays) || 1,
        durationNights: parseInt(data.durationNights) || 0,
        basePrice: parseFloat(data.basePrice) || 0,
        images: data.images || [],
        includes: data.includes || [],
        excludes: data.excludes || [],
        ownerId: userId,
      },
    });
  }

  async updateTour(userId: string, tourId: string, data: any) {
    await this.assertAdmin(userId);
    const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });
    if (!tour) throw new NotFoundException('Tour không tồn tại');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.durationDays !== undefined) updateData.durationDays = parseInt(data.durationDays);
    if (data.durationNights !== undefined) updateData.durationNights = parseInt(data.durationNights);
    if (data.basePrice !== undefined) updateData.basePrice = parseFloat(data.basePrice);
    if (data.images !== undefined) updateData.images = data.images;

    return this.prisma.tour.update({ where: { id: tourId }, data: updateData });
  }

  async deleteTour(userId: string, tourId: string) {
    await this.assertAdmin(userId);
    const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });
    if (!tour) throw new NotFoundException('Tour không tồn tại');
    return this.prisma.tour.delete({ where: { id: tourId } });
  }

  // ===================== HOTELS/HOMESTAYS CRUD =====================

  async getAllHotels(userId: string) {
    await this.assertAdmin(userId);
    return this.prisma.hotel.findMany({
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
    return this.prisma.hotel.create({
      data: {
        name: data.name,
        description: data.description || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || 'Việt Nam',
        type: data.type || 'HOMESTAY',
        images: data.images || [],
        ownerId: userId,
      },
    });
  }

  async updateHotel(userId: string, hotelId: string, data: any) {
    await this.assertAdmin(userId);
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('Homestay không tồn tại');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.images !== undefined) updateData.images = data.images;

    return this.prisma.hotel.update({ where: { id: hotelId }, data: updateData });
  }

  async deleteHotel(userId: string, hotelId: string) {
    await this.assertAdmin(userId);
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('Homestay không tồn tại');
    return this.prisma.hotel.delete({ where: { id: hotelId } });
  }
}

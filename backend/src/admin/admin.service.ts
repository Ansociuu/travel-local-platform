import { Injectable, ForbiddenException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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

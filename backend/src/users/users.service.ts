import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateData: any): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async changePassword(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }
    const isMatch = await bcrypt.compare(data.oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async getDashboardStats(userId: string) {
    const totalBookings = await this.prisma.booking.count({ where: { userId } });
    const completedBookings = await this.prisma.booking.count({ 
      where: { userId, status: 'COMPLETED' } 
    });
    const totalSpent = await this.prisma.booking.aggregate({
      where: { userId, status: { in: ['CONFIRMED', 'COMPLETED'] } },
      _sum: { totalAmount: true }
    });
    const reviewsCount = await this.prisma.review.count({ where: { userId } });
    const wishlistCount = await this.prisma.wishlist.count({ where: { userId } });

    return {
      totalBookings,
      completedBookings,
      totalSpent: totalSpent._sum.totalAmount || 0,
      reviewsCount,
      wishlistCount
    };
  }
}

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HotelApprovalStatus, Prisma, TourApprovalStatus, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private excerpt(text = '') {
    const compact = text.replace(/\s+/g, ' ').trim();
    return compact.length > 160 ? `${compact.slice(0, 157)}...` : compact;
  }

  private cover(images: any, fallback: string) {
    return Array.isArray(images) && images.length > 0 ? images[0] : fallback;
  }

  private servicePostFromTour(tour: any) {
    return {
      id: `tour-${tour.id}`,
      sourceType: 'TOUR',
      sourceId: tour.id,
      title: `Kinh nghiệm khám phá ${tour.name}`,
      excerpt: this.excerpt(tour.description),
      category: 'Tour',
      date: tour.updatedAt,
      coverImage: this.cover(tour.images, 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80'),
      href: `/tours/${tour.id}`,
    };
  }

  private servicePostFromHotel(hotel: any) {
    return {
      id: `hotel-${hotel.id}`,
      sourceType: 'HOTEL',
      sourceId: hotel.id,
      title: `Gợi ý lưu trú tại ${hotel.name}`,
      excerpt: this.excerpt(hotel.description),
      category: hotel.type || 'Homestay',
      date: hotel.updatedAt,
      coverImage: this.cover(hotel.images, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80'),
      href: `/homestays/${hotel.id}`,
    };
  }

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

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, avatar: true, role: true, createdAt: true },
    });
  }

  async update(id: string, updateData: any) {
    const payload: any = {};
    ['name', 'phone', 'avatar'].forEach((field) => {
      if (updateData[field] !== undefined) payload[field] = updateData[field];
    });

    return this.prisma.user.update({
      where: { id },
      data: payload,
      select: { id: true, email: true, name: true, phone: true, avatar: true, role: true, isVerified: true },
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

  async getPublicProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        posts: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const [reviewsCount, hotels, tours] = await Promise.all([
      this.prisma.review.count({ where: { userId: id } }),
      this.prisma.hotel.findMany({
        where: { ownerId: id, approvalStatus: HotelApprovalStatus.APPROVED },
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          images: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 12,
      }),
      this.prisma.tour.findMany({
        where: { ownerId: id, approvalStatus: TourApprovalStatus.APPROVED },
        select: {
          id: true,
          name: true,
          description: true,
          images: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 12,
      }),
    ]);

    const servicePosts = [
      ...tours.map((tour) => this.servicePostFromTour(tour)),
      ...hotels.map((hotel) => this.servicePostFromHotel(hotel)),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
      stats: {
        postsCount: user.posts.length,
        servicePostsCount: servicePosts.length,
        reviewsCount,
      },
      posts: user.posts,
      servicePosts,
    };
  }

  async createPost(authorId: string, data: any) {
    const content = String(data.content || '').trim();
    const images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];

    if (!content && images.length === 0) {
      throw new BadRequestException('Bài đăng cần có nội dung hoặc hình ảnh');
    }

    return this.prisma.userPost.create({
      data: {
        authorId,
        content,
        images,
      },
    });
  }

  async updatePost(authorId: string, postId: string, data: any) {
    const post = await this.prisma.userPost.findUnique({ where: { id: postId } });
    if (!post || post.authorId !== authorId) {
      throw new NotFoundException('Không tìm thấy bài đăng của bạn');
    }

    const payload: any = {};
    if (data.content !== undefined) payload.content = String(data.content || '').trim();
    if (data.images !== undefined) payload.images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('Không có dữ liệu cập nhật');
    }

    const nextContent = payload.content !== undefined ? payload.content : post.content;
    const nextImages = payload.images !== undefined ? payload.images : post.images;
    if (!nextContent && (!Array.isArray(nextImages) || nextImages.length === 0)) {
      throw new BadRequestException('Bài đăng cần có nội dung hoặc hình ảnh');
    }

    return this.prisma.userPost.update({
      where: { id: postId },
      data: payload,
    });
  }

  async deletePost(authorId: string, postId: string) {
    const post = await this.prisma.userPost.findUnique({ where: { id: postId } });
    if (!post || post.authorId !== authorId) {
      throw new NotFoundException('Không tìm thấy bài đăng của bạn');
    }

    await this.prisma.userPost.delete({ where: { id: postId } });
    return { message: 'Đã xoá bài đăng' };
  }
}

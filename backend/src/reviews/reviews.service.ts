import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { bookingId, rating, comment, images, hotelId, tourId } = createReviewDto;

    // Check if booking exists and belongs to user
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.userId !== userId) {
      throw new BadRequestException('Booking not found or does not belong to you');
    }

    // Check if already reviewed
    const existingReview = await this.prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this booking');
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        bookingId,
        rating,
        comment,
        images,
        hotelId: hotelId || booking.hotelId,
        tourId: tourId || booking.tourId,
      },
      include: {
        hotel: { select: { id: true, name: true, ownerId: true } },
        tour: { select: { id: true, name: true, ownerId: true } },
        user: { select: { name: true, avatar: true } },
      },
    });

    const ownerId = review.hotel?.ownerId || review.tour?.ownerId;
    if (ownerId && ownerId !== userId) {
      this.notificationsService.create({
        userId: ownerId,
        type: 'NEW_REVIEW',
        title: 'Có đánh giá mới',
        content: `${review.user?.name || 'Khách hàng'} vừa đánh giá ${rating} sao cho ${review.hotel?.name || review.tour?.name || 'dịch vụ'}.`,
        link: review.hotelId ? `/homestays/${review.hotelId}` : `/tours/${review.tourId}`,
      }).catch((err) => console.error('[Notification] new review failed:', err?.message));
    }

    return review;
  }

  async findMyReviews(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        hotel: { select: { name: true, images: true } },
        tour: { select: { name: true, images: true } },
        booking: { select: { shortId: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByHotel(hotelId: string) {
    return this.prisma.review.findMany({
      where: { hotelId },
      include: {
        user: { select: { name: true, avatar: true } },
        helpfulVotes: { select: { userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTour(tourId: string) {
    return this.prisma.review.findMany({
      where: { tourId },
      include: {
        user: { select: { name: true, avatar: true } },
        helpfulVotes: { select: { userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleHelpful(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review không tồn tại');

    const existing = await this.prisma.reviewHelpfulVote.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.reviewHelpfulVote.delete({ where: { id: existing.id } }),
        this.prisma.review.update({ where: { id: reviewId }, data: { helpfulCount: { decrement: 1 } } }),
      ]);
      const updated = await this.prisma.review.findUnique({ where: { id: reviewId } });
      return { status: 'removed', helpfulCount: updated?.helpfulCount || 0 };
    }

    await this.prisma.$transaction([
      this.prisma.reviewHelpfulVote.create({ data: { reviewId, userId } }),
      this.prisma.review.update({ where: { id: reviewId }, data: { helpfulCount: { increment: 1 } } }),
    ]);
    const updated = await this.prisma.review.findUnique({ where: { id: reviewId } });
    return { status: 'added', helpfulCount: updated?.helpfulCount || 0 };
  }
}

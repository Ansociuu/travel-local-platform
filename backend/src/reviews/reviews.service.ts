import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.review.create({
      data: {
        userId,
        bookingId,
        rating,
        comment,
        images,
        hotelId: hotelId || booking.hotelId,
        tourId: tourId || booking.tourId,
      },
    });
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTour(tourId: string) {
    return this.prisma.review.findMany({
      where: { tourId },
      include: {
        user: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

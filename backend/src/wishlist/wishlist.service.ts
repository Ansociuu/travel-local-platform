import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async toggle(userId: string, dto: CreateWishlistDto) {
    const { hotelId, tourId } = dto;
    if (!hotelId && !tourId) {
      throw new BadRequestException('Either hotelId or tourId must be provided');
    }

    const existing = await this.prisma.wishlist.findFirst({
      where: {
        userId,
        hotelId: hotelId || null,
        tourId: tourId || null,
      }
    });

    if (existing) {
      await this.prisma.wishlist.delete({ where: { id: existing.id } });
      return { status: 'unliked' };
    } else {
      await this.prisma.wishlist.create({
        data: {
          userId,
          hotelId: hotelId || null,
          tourId: tourId || null,
        },
      });
      return { status: 'liked' };
    }
  }

  async findMyWishlist(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            images: true,
            address: true,
            city: true,
            rating: true,
            type: true,
            rooms: { select: { basePrice: true }, take: 1 }
          }
        },
        tour: {
          select: {
            id: true,
            name: true,
            images: true,
            location: true,
            basePrice: true,
            durationDays: true,
            durationNights: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ToursService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const { location, maxPrice, minDuration } = query;
    const where: any = {};
    
    if (location) {
      where.location = { contains: location };
    }
    if (maxPrice) {
      where.basePrice = { lte: parseFloat(maxPrice) };
    }
    if (minDuration) {
      where.durationDays = { gte: parseInt(minDuration) };
    }

    const tours = await this.prisma.tour.findMany({
      where,
      include: {
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return tours.map(tour => {
      const avgRating = tour.reviews.length > 0 
        ? tour.reviews.reduce((acc, curr) => acc + curr.rating, 0) / tour.reviews.length 
        : 0;
      return {
        ...tour,
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: tour.reviews.length
      };
    });
  }

  async findOne(id: string) {
    const tour = await this.prisma.tour.findUnique({
      where: { id },
      include: {
        itineraries: {
          orderBy: { dayNumber: 'asc' }
        },
        availability: {
          where: {
            startDate: { gte: new Date() }
          },
          orderBy: { startDate: 'asc' }
        },
        owner: {
          select: { name: true, email: true, avatar: true }
        },
        reviews: {
          include: {
            user: {
              select: { name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
    });

    if (!tour) {
      throw new NotFoundException('Không tìm thấy tour này');
    }
    
    // Calculate average rating
    const avgRating = tour.reviews.length > 0 
      ? tour.reviews.reduce((acc, curr) => acc + curr.rating, 0) / tour.reviews.length 
      : 0;
      
    return {
      ...tour,
      rating: parseFloat(avgRating.toFixed(1)),
      reviewCount: tour.reviews.length
    };
  }
}

import { Injectable } from '@nestjs/common';
import { HotelApprovalStatus, TourApprovalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BlogService } from '../blog/blog.service';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private blogService: BlogService,
  ) {}

  async search(q = '') {
    const query = q.trim();
    if (query.length < 2) {
      return { tours: [], homestays: [], blog: [], recommendations: await this.recommendations() };
    }

    const [tours, hotels, posts] = await Promise.all([
      this.prisma.tour.findMany({
        where: {
          approvalStatus: TourApprovalStatus.APPROVED,
          OR: [
            { name: { contains: query } },
            { location: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: { reviews: { select: { rating: true } } },
        take: 8,
      }),
      this.prisma.hotel.findMany({
        where: {
          approvalStatus: HotelApprovalStatus.APPROVED,
          OR: [
            { name: { contains: query } },
            { city: { contains: query } },
            { address: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: {
          rooms: { select: { basePrice: true }, orderBy: { basePrice: 'asc' }, take: 1 },
          reviews: { select: { rating: true } },
        },
        take: 8,
      }),
      this.blogService.findAll(),
    ]);

    return {
      tours: tours.map((tour) => ({
        id: tour.id,
        title: tour.name,
        subtitle: tour.location,
        price: Number(tour.basePrice),
        image: Array.isArray(tour.images) ? tour.images[0] : null,
        href: `/tours/${tour.id}`,
        rating: this.rating(tour.reviews),
      })),
      homestays: hotels.map((hotel) => ({
        id: hotel.id,
        title: hotel.name,
        subtitle: hotel.city,
        price: hotel.rooms?.[0]?.basePrice ? Number(hotel.rooms[0].basePrice) : 0,
        image: Array.isArray(hotel.images) ? hotel.images[0] : null,
        href: `/homestays/${hotel.id}`,
        rating: this.rating(hotel.reviews) || hotel.rating,
      })),
      blog: posts
        .filter((post: any) =>
          [post.title, post.excerpt, post.category].some((value) =>
            String(value || '').toLowerCase().includes(query.toLowerCase())
          )
        )
        .slice(0, 6)
        .map((post: any) => ({
          id: post.id,
          title: post.title,
          subtitle: post.category,
          image: post.coverImage,
          href: `/blog/${post.id}`,
        })),
      recommendations: await this.recommendations(),
    };
  }

  private rating(reviews: { rating: number }[]) {
    return reviews.length
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
      : 0;
  }

  private async recommendations() {
    const [tours, hotels] = await Promise.all([
      this.prisma.tour.findMany({
        where: { approvalStatus: TourApprovalStatus.APPROVED },
        include: { reviews: { select: { rating: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 4,
      }),
      this.prisma.hotel.findMany({
        where: { approvalStatus: HotelApprovalStatus.APPROVED },
        include: {
          rooms: { select: { basePrice: true }, orderBy: { basePrice: 'asc' }, take: 1 },
          reviews: { select: { rating: true } },
        },
        orderBy: { rating: 'desc' },
        take: 4,
      }),
    ]);

    return [
      ...tours.map((tour) => ({
        id: tour.id,
        type: 'tour',
        title: tour.name,
        subtitle: tour.location,
        href: `/tours/${tour.id}`,
        image: Array.isArray(tour.images) ? tour.images[0] : null,
        price: Number(tour.basePrice),
        rating: this.rating(tour.reviews),
      })),
      ...hotels.map((hotel) => ({
        id: hotel.id,
        type: 'homestay',
        title: hotel.name,
        subtitle: hotel.city,
        href: `/homestays/${hotel.id}`,
        image: Array.isArray(hotel.images) ? hotel.images[0] : null,
        price: hotel.rooms?.[0]?.basePrice ? Number(hotel.rooms[0].basePrice) : 0,
        rating: this.rating(hotel.reviews) || hotel.rating,
      })),
    ].sort((a, b) => b.rating - a.rating).slice(0, 6);
  }
}

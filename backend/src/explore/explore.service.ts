import { Injectable } from '@nestjs/common';
import { HotelApprovalStatus, TourApprovalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const TOUR_COORDS: Record<string, { lat: number; lng: number }> = {
  'hà nội': { lat: 21.0278, lng: 105.8342 },
  'ha noi': { lat: 21.0278, lng: 105.8342 },
  'sapa': { lat: 22.3364, lng: 103.8438 },
  'sa pa': { lat: 22.3364, lng: 103.8438 },
  'hạ long': { lat: 20.9101, lng: 107.1839 },
  'ha long': { lat: 20.9101, lng: 107.1839 },
  'đà nẵng': { lat: 16.0544, lng: 108.2022 },
  'da nang': { lat: 16.0544, lng: 108.2022 },
  'hội an': { lat: 15.8801, lng: 108.338 },
  'hoi an': { lat: 15.8801, lng: 108.338 },
  'huế': { lat: 16.4637, lng: 107.5909 },
  'hue': { lat: 16.4637, lng: 107.5909 },
  'đà lạt': { lat: 11.9404, lng: 108.4583 },
  'da lat': { lat: 11.9404, lng: 108.4583 },
  'nha trang': { lat: 12.2388, lng: 109.1967 },
  'phú quốc': { lat: 10.2899, lng: 103.984 },
  'phu quoc': { lat: 10.2899, lng: 103.984 },
  'tp hcm': { lat: 10.8231, lng: 106.6297 },
  'hồ chí minh': { lat: 10.8231, lng: 106.6297 },
  'ho chi minh': { lat: 10.8231, lng: 106.6297 },
};

@Injectable()
export class ExploreService {
  constructor(private prisma: PrismaService) {}

  private tourCoordinates(location = '') {
    const normalized = location.toLowerCase();
    const key = Object.keys(TOUR_COORDS).find((candidate) => normalized.includes(candidate));
    return key ? TOUR_COORDS[key] : null;
  }

  async findAll(query: any) {
    const type = query.type || 'all';
    const minPrice = query.minPrice ? Number(query.minPrice) : null;
    const maxPrice = query.maxPrice ? Number(query.maxPrice) : null;
    const rating = query.rating ? Number(query.rating) : null;
    const bounds = ['north', 'south', 'east', 'west'].every((key) => query[key] !== undefined)
      ? {
          north: Number(query.north),
          south: Number(query.south),
          east: Number(query.east),
          west: Number(query.west),
        }
      : null;

    const [hotels, tours] = await Promise.all([
      type === 'tour' ? Promise.resolve([]) : this.prisma.hotel.findMany({
        where: {
          approvalStatus: HotelApprovalStatus.APPROVED,
          ...(rating ? { rating: { gte: rating } } : {}),
          ...(bounds ? {
            lat: { gte: bounds.south, lte: bounds.north },
            lng: { gte: bounds.west, lte: bounds.east },
          } : {}),
        },
        include: {
          rooms: { select: { basePrice: true }, orderBy: { basePrice: 'asc' }, take: 1 },
          reviews: { select: { rating: true } },
        },
        take: 100,
      }),
      type === 'hotel' || type === 'homestay' ? Promise.resolve([]) : this.prisma.tour.findMany({
        where: {
          approvalStatus: TourApprovalStatus.APPROVED,
          ...(maxPrice ? { basePrice: { lte: maxPrice } } : {}),
          ...(minPrice ? { basePrice: { gte: minPrice } } : {}),
        },
        include: { reviews: { select: { rating: true } } },
        take: 100,
      }),
    ]);

    const hotelItems = hotels
      .map((hotel) => {
        const price = hotel.rooms?.[0]?.basePrice ? Number(hotel.rooms[0].basePrice) : 0;
        const reviewCount = hotel.reviews.length;
        const avgRating = reviewCount ? hotel.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : hotel.rating;
        return {
          id: hotel.id,
          type: 'hotel',
          name: hotel.name,
          description: hotel.description,
          city: hotel.city,
          location: `${hotel.address}, ${hotel.city}`,
          lat: hotel.lat,
          lng: hotel.lng,
          rating: Number(avgRating || 0),
          reviewCount,
          price,
          images: hotel.images,
          href: `/homestays/${hotel.id}`,
        };
      })
      .filter((item) => (minPrice === null || item.price >= minPrice) && (maxPrice === null || item.price <= maxPrice));

    const tourItems = tours.map((tour) => {
      const coords = this.tourCoordinates(tour.location);
      const reviewCount = tour.reviews.length;
      const avgRating = reviewCount ? tour.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : 0;
      return {
        id: tour.id,
        type: 'tour',
        name: tour.name,
        description: tour.description,
        city: tour.location,
        location: tour.location,
        lat: coords?.lat || null,
        lng: coords?.lng || null,
        rating: Number(avgRating.toFixed(1)),
        reviewCount,
        price: Number(tour.basePrice),
        images: tour.images,
        href: `/tours/${tour.id}`,
      };
    }).filter((item) => {
      if (rating && item.rating < rating) return false;
      if (!bounds || item.lat === null || item.lng === null) return true;
      return item.lat >= bounds.south && item.lat <= bounds.north && item.lng >= bounds.west && item.lng <= bounds.east;
    });

    const items = [...hotelItems, ...tourItems].sort((a, b) => b.rating - a.rating || a.price - b.price);
    return {
      items,
      markers: items.filter((item) => item.lat !== null && item.lng !== null),
    };
  }

  async trackView(body: { hotelId?: string; tourId?: string }, userId?: string) {
    if (!body.hotelId && !body.tourId) return { tracked: false };
    await this.prisma.listingView.create({
      data: {
        userId: userId || null,
        hotelId: body.hotelId || null,
        tourId: body.tourId || null,
      },
    });
    return { tracked: true };
  }
}

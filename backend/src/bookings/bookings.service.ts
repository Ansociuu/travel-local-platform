import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { HotelApprovalStatus, TourApprovalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.cleanupStaleBookings().catch(err => console.error('[Booking Cleanup Init Error]:', err));
    setInterval(() => {
      this.cleanupStaleBookings().catch(err => console.error('[Booking Cleanup Interval Error]:', err));
    }, 5 * 60 * 1000);
  }

  async cleanupStaleBookings() {
    try {
      const expirationTime = new Date(Date.now() - 30 * 60 * 1000); // 30 mins
      const staleBookings = await this.prisma.booking.findMany({
        where: {
          status: 'PENDING',
          createdAt: { lt: expirationTime }
        }
      });
      if (staleBookings.length > 0) {
        await this.prisma.booking.updateMany({
          where: { id: { in: staleBookings.map(b => b.id) } },
          data: { status: 'CANCELLED' }
        });
      }
    } catch (err) {
      console.error('[Booking Cleanup Error]:', err);
    }
  }

  async create(userId: string, createBookingDto: CreateBookingDto) {
    const { 
      hotelId, 
      tourId, 
      checkIn, 
      checkOut, 
      totalAmount, 
      guestName, 
      guestEmail, 
      guestPhone, 
      specialRequest, 
      bookingRooms, 
      bookingTours 
    } = createBookingDto;

    // Generate short ID e.g., MT-A1B2C3
    const shortId = 'MT-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    if (hotelId) {
      const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
      if (!hotel || hotel.approvalStatus !== HotelApprovalStatus.APPROVED) {
        throw new NotFoundException('Homestay not found');
      }
    }

    if (tourId) {
      const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });
      if (!tour || tour.approvalStatus !== TourApprovalStatus.APPROVED) {
        throw new NotFoundException('Tour not found');
      }
    }

    const booking = await this.prisma.booking.create({
      data: {
        shortId,
        userId,
        hotelId,
        tourId,
        checkIn: new Date(checkIn),
        checkOut: checkOut ? new Date(checkOut) : null,
        totalAmount,
        guestName,
        guestEmail,
        guestPhone,
        specialRequest,
        bookingRooms: bookingRooms ? {
          create: bookingRooms.map(room => ({
            roomId: room.roomId,
            quantity: room.quantity,
            priceAtBooking: room.priceAtBooking,
          }))
        } : undefined,
        bookingTours: bookingTours ? {
          create: bookingTours.map(tour => ({
            tourId: tour.tourId,
            quantity: tour.quantity,
            priceAtBooking: tour.priceAtBooking,
          }))
        } : undefined,
      },
      include: {
        bookingRooms: { include: { room: { include: { hotel: true } } } },
        bookingTours: { include: { tour: true } },
        hotel: true,
        tour: true,
      }
    });

    return booking;
  }

  async findMyBookings(userId: string) {
    await this.cleanupStaleBookings();
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        hotel: true,
        tour: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    await this.cleanupStaleBookings();
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        hotel: true,
        tour: true,
        bookingRooms: { include: { room: true } },
        bookingTours: { include: { tour: true } },
      }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async cancel(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    
    if (booking.userId !== userId) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'PENDING') {
      throw new Error('Only PENDING bookings can be cancelled');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
  }
}

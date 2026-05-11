import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

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

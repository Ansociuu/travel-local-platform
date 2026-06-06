import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HotelApprovalStatus, TourApprovalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  @Cron('*/5 * * * *')
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
      guestName, 
      guestEmail, 
      guestPhone, 
      specialRequest,
      couponCode,
      bookingRooms,
      bookingTours 
    } = createBookingDto;

    // Generate short ID e.g., MT-A1B2C3
    const shortId = 'MT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    let calculatedTotalAmount = 0;
    const finalBookingRooms: any[] = [];
    const finalBookingTours: any[] = [];
    const checkInDate = new Date(checkIn);
    const checkOutDate = checkOut ? new Date(checkOut) : null;

    if (hotelId) {
      const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
      if (!hotel || hotel.approvalStatus !== HotelApprovalStatus.APPROVED) {
        throw new NotFoundException('Homestay not found');
      }

      if (!bookingRooms || bookingRooms.length === 0) throw new BadRequestException('Vui lòng chọn phòng');
      if (!checkOutDate) throw new BadRequestException('Thiếu ngày trả phòng');

      const roomIds = bookingRooms.map(r => r.roomId);
      const validRooms = await this.prisma.room.findMany({
        where: { id: { in: roomIds }, hotelId }
      });
      if (validRooms.length !== roomIds.length) {
        throw new BadRequestException('Một hoặc nhiều phòng không thuộc homestay này');
      }

      const numNights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      if (numNights <= 0) throw new BadRequestException('Ngày trả phòng phải sau ngày nhận phòng');

      for (const reqRoom of bookingRooms) {
        const room = validRooms.find(r => r.id === reqRoom.roomId);
        let roomTotal = 0;

        for (let i = 0; i < numNights; i++) {
          const currentDate = new Date(checkInDate.getTime() + i * 24 * 60 * 60 * 1000);
          currentDate.setUTCHours(0, 0, 0, 0);

          const avail = await this.prisma.roomAvailability.findUnique({
            where: { roomId_date: { roomId: room.id, date: currentDate } }
          });

          if (avail) {
            if (avail.available < reqRoom.quantity) {
              throw new BadRequestException(`Phòng ${room.name} đã hết hoặc không đủ số lượng vào ngày ${currentDate.toLocaleDateString('vi-VN')}`);
            }
            roomTotal += Number(avail.price) * reqRoom.quantity;
            await this.prisma.roomAvailability.update({
              where: { id: avail.id },
              data: { available: { decrement: reqRoom.quantity }, booked: { increment: reqRoom.quantity } }
            });
          } else {
            if (room.totalRooms < reqRoom.quantity) {
              throw new BadRequestException(`Phòng ${room.name} không đủ số lượng`);
            }
            roomTotal += Number(room.basePrice) * reqRoom.quantity;
            await this.prisma.roomAvailability.create({
              data: {
                roomId: room.id,
                date: currentDate,
                price: room.basePrice,
                available: room.totalRooms - reqRoom.quantity,
                booked: reqRoom.quantity
              }
            });
          }
        }
        calculatedTotalAmount += roomTotal;
        finalBookingRooms.push({
          roomId: room.id,
          quantity: reqRoom.quantity,
          priceAtBooking: roomTotal / (numNights * reqRoom.quantity), // Store avg price per night
        });
      }
    }

    if (tourId) {
      const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });
      if (!tour || tour.approvalStatus !== TourApprovalStatus.APPROVED) {
        throw new NotFoundException('Tour not found');
      }
      if (!bookingTours || bookingTours.length === 0) throw new BadRequestException('Vui lòng chọn số lượng tour');

      const reqTour = bookingTours[0];
      const startD = new Date(checkInDate);
      startD.setUTCHours(0, 0, 0, 0);

      const avail = await this.prisma.tourAvailability.findFirst({
        where: { tourId, startDate: startD }
      });

      if (avail) {
        if (avail.available < reqTour.quantity) {
          throw new BadRequestException('Tour đã hết chỗ cho ngày này');
        }
        calculatedTotalAmount += Number(avail.price) * reqTour.quantity;
        await this.prisma.tourAvailability.update({
          where: { id: avail.id },
          data: { available: { decrement: reqTour.quantity }, booked: { increment: reqTour.quantity } }
        });
        finalBookingTours.push({
          tourId,
          quantity: reqTour.quantity,
          priceAtBooking: avail.price,
        });
      } else {
        calculatedTotalAmount += Number(tour.basePrice) * reqTour.quantity;
        finalBookingTours.push({
          tourId,
          quantity: reqTour.quantity,
          priceAtBooking: tour.basePrice,
        });
      }
    }

    if (couponCode) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (!coupon || !coupon.isActive) throw new BadRequestException('Mã giảm giá không tồn tại hoặc đã bị vô hiệu hoá');
      
      const now = new Date();
      if (now < coupon.startDate || now > coupon.endDate) throw new BadRequestException('Mã giảm giá đã hết hạn hoặc chưa có hiệu lực');
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
      if (coupon.minOrder !== null && calculatedTotalAmount < Number(coupon.minOrder)) throw new BadRequestException(`Đơn hàng phải từ ${Number(coupon.minOrder).toLocaleString('vi-VN')}₫ để áp dụng mã này`);
      
      let discount = 0;
      const value = Number(coupon.value);
      if (coupon.discountType === 'PERCENTAGE') {
        discount = (calculatedTotalAmount * value) / 100;
        if (coupon.maxDiscount !== null && discount > Number(coupon.maxDiscount)) {
          discount = Number(coupon.maxDiscount);
        }
      } else {
        discount = value;
      }
      
      calculatedTotalAmount = Math.max(0, calculatedTotalAmount - discount);

      try {
        await this.prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } }
        });
      } catch (err) {
        console.error('Failed to update coupon usage:', err);
      }
    }

    const booking = await this.prisma.booking.create({
      data: {
        shortId,
        userId,
        hotelId,
        tourId,
        checkIn: new Date(checkIn),
        checkOut: checkOutDate,
        totalAmount: calculatedTotalAmount,
        guestName,
        guestEmail,
        guestPhone,
        specialRequest,
        bookingRooms: finalBookingRooms.length > 0 ? {
          create: finalBookingRooms.map(room => ({
            roomId: room.roomId,
            quantity: room.quantity,
            priceAtBooking: room.priceAtBooking,
          }))
        } : undefined,
        bookingTours: finalBookingTours.length > 0 ? {
          create: finalBookingTours.map(tour => ({
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

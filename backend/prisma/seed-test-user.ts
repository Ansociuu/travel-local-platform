import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'testuser@gmail.com';
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create or update test user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name: 'Nguyễn Văn Test',
      phone: '0987654321',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
    },
    create: {
      email,
      password: hashedPassword,
      name: 'Nguyễn Văn Test',
      phone: '0987654321',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
    },
  });

  console.log('Created test user:', user.email);

  // Clean up existing data for this user to avoid duplicates
  await prisma.review.deleteMany({ where: { userId: user.id } });
  await prisma.wishlist.deleteMany({ where: { userId: user.id } });
  await prisma.booking.deleteMany({ where: { userId: user.id } });

  // Get some hotels and tours
  const hotels = await prisma.hotel.findMany({ take: 3 });
  const tours = await prisma.tour.findMany({ take: 3 });

  if (hotels.length === 0 || tours.length === 0) {
    console.error('No hotels or tours found to seed dashboard data. Please run the main seed first.');
    return;
  }

  // 2. Add Wishlist items
  await prisma.wishlist.createMany({
    data: [
      { userId: user.id, hotelId: hotels[0].id },
      { userId: user.id, hotelId: hotels[1].id },
      { userId: user.id, tourId: tours[0].id },
      { userId: user.id, tourId: tours[1].id },
    ]
  });

  // 3. Add Bookings
  // Booking 1: Confirmed Tour
  const booking1 = await prisma.booking.create({
    data: {
      userId: user.id,
      shortId: 'BK' + Math.floor(1000 + Math.random() * 9000),
      status: 'COMPLETED',
      totalAmount: 2500000,
      paymentStatus: 'PAID',
      guestName: user.name || 'Test',
      guestEmail: user.email,
      checkIn: new Date(),
      tourId: tours[0].id,
      bookingTours: {
        create: {
          tourId: tours[0].id,
          quantity: 2,
          priceAtBooking: 1250000,
        }
      }
    }
  });

  // Booking 2: Completed Hotel
  const hotelRooms = await prisma.room.findMany({ where: { hotelId: hotels[0].id } });
  const booking2 = await prisma.booking.create({
    data: {
      userId: user.id,
      shortId: 'BK' + Math.floor(1000 + Math.random() * 9000),
      status: 'COMPLETED',
      totalAmount: 1200000,
      paymentStatus: 'PAID',
      guestName: user.name || 'Test',
      guestEmail: user.email,
      checkIn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      checkOut: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      hotelId: hotels[0].id,
      bookingRooms: {
        create: {
          roomId: hotelRooms[0].id,
          quantity: 1,
          priceAtBooking: 600000,
        }
      }
    }
  });

  // Booking 3: Cancelled
  const booking3 = await prisma.booking.create({
    data: {
      userId: user.id,
      shortId: 'BK' + Math.floor(1000 + Math.random() * 9000),
      status: 'CANCELLED',
      totalAmount: 500000,
      paymentStatus: 'REFUNDED',
      guestName: user.name || 'Test',
      guestEmail: user.email,
      checkIn: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      tourId: tours[1].id,
      bookingTours: {
        create: {
          tourId: tours[1].id,
          quantity: 1,
          priceAtBooking: 500000,
        }
      }
    }
  });

  // 4. Add Reviews
  await prisma.review.create({
    data: {
      userId: user.id,
      hotelId: hotels[0].id,
      bookingId: booking2.id,
      rating: 5,
      comment: 'Trải nghiệm tuyệt vời! Phòng sạch sẽ, nhân viên phục vụ rất tận tình. Chắc chắn sẽ quay lại.',
    }
  });

  await prisma.review.create({
    data: {
      userId: user.id,
      tourId: tours[0].id,
      bookingId: booking1.id,
      rating: 4,
      comment: 'Chuyến đi rất vui, hướng dẫn viên nhiệt tình. Tuy nhiên thời tiết hơi nóng một chút.',
    }
  });

  console.log('Successfully seeded dashboard test data for testuser@gmail.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

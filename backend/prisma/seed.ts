import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu dọn dẹp dữ liệu cũ (Xóa Hotel, Room, Tour, User)...');
  await prisma.review.deleteMany();
  await prisma.bookingTour.deleteMany();
  await prisma.bookingRoom.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.tourAvailability.deleteMany();
  await prisma.tourItinerary.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.roomAmenity.deleteMany();
  await prisma.hotelAmenity.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.user.deleteMany({ where: { role: 'OWNER' } });
  await prisma.amenity.deleteMany();

  console.log('Seeding dữ liệu phong phú mới...');

  // 1. Create Amenities
  const amenityList = [
    { name: 'Wifi tốc độ cao', icon: 'Wifi' },
    { name: 'Hồ bơi vô cực', icon: 'Waves' },
    { name: 'Bếp tiện nghi', icon: 'Coffee' },
    { name: 'Bãi đậu xe miễn phí', icon: 'Car' },
    { name: 'Điều hòa nhiệt độ', icon: 'Wind' },
    { name: 'Smart TV', icon: 'Tv' },
    { name: 'Lễ tân 24/7', icon: 'CheckCircle2' },
  ];

  const createdAmenities: Record<string, string> = {};
  for (const item of amenityList) {
    const amenity = await prisma.amenity.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
    createdAmenities[item.name] = amenity.id;
  }

  // 2. Create Owners
  const hashedPassword = await bcrypt.hash('123456', 10);
  const owner1 = await prisma.user.create({
    data: {
      email: 'owner1@vietjourney.com',
      password: hashedPassword,
      name: 'Nguyễn Trường Giang',
      role: 'OWNER',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: 'owner2@vietjourney.com',
      password: hashedPassword,
      name: 'Trần Mai Phương',
      role: 'OWNER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    },
  });

  // 3. Create Hotels
  const hotelsData = [
    {
      name: 'Sapa Highland Eco-Lodge',
      description: 'Nằm ẩn mình giữa những thửa ruộng bậc thang tuyệt đẹp của bản Tả Van. Mang đến trải nghiệm văn hoá bản địa kết hợp với tiện nghi cao cấp. Mỗi buổi sáng bạn sẽ được đánh thức bởi tiếng chim hót và mây trôi ngoài cửa sổ.',
      address: 'Bản Tả Van, Sapa',
      city: 'Sapa',
      country: 'Việt Nam',
      lat: 22.3364,
      lng: 103.8438,
      type: 'RESORT',
      rating: 4.9,
      ownerId: owner1.id,
      images: [
        'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80',
        'https://images.unsplash.com/photo-1572791870574-8a7b7b3d2dd3?w=800&q=80'
      ],
      amenities: ['Wifi tốc độ cao', 'Bếp tiện nghi', 'Bãi đậu xe miễn phí'],
      rooms: [
        { name: 'Bungalow View Núi', basePrice: 1500000, capacity: 2, totalRooms: 10 },
        { name: 'Family Suite', basePrice: 2800000, capacity: 4, totalRooms: 3 }
      ]
    },
    {
      name: 'Hội An Lantern Villa',
      description: 'Villa mang đậm nét kiến trúc cổ kính của Hội An. Chỉ cách Chùa Cầu 5 phút đi bộ. Cung cấp xe đạp miễn phí để bạn vi vu khám phá phố cổ.',
      address: '122 Nguyễn Thái Học, Hội An',
      city: 'Hội An',
      country: 'Việt Nam',
      lat: 15.8777,
      lng: 108.3275,
      type: 'VILLA',
      rating: 4.8,
      ownerId: owner2.id,
      images: [
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
        'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80'
      ],
      amenities: ['Wifi tốc độ cao', 'Hồ bơi vô cực', 'Smart TV', 'Điều hòa nhiệt độ'],
      rooms: [
        { name: 'Phòng Cổ Điển', basePrice: 850000, capacity: 2, totalRooms: 5 },
        { name: 'Biệt Thự Nguyên Căn', basePrice: 4500000, capacity: 8, totalRooms: 1 }
      ]
    },
    {
      name: 'Đà Nẵng Ocean View',
      description: 'Khách sạn ven biển đẳng cấp quốc tế. Tất cả các phòng đều có ban công hướng biển Mỹ Khê. Thưởng thức buffet sáng chuẩn 5 sao.',
      address: 'Đường Võ Nguyên Giáp, Đà Nẵng',
      city: 'Đà Nẵng',
      country: 'Việt Nam',
      lat: 16.0664,
      lng: 108.2435,
      type: 'HOTEL',
      rating: 4.6,
      ownerId: owner1.id,
      images: [
        'https://images.unsplash.com/photo-1564596823821-79b7a0314a52?w=1200&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
        'https://images.unsplash.com/photo-1505691938895-1758d7def511?w=800&q=80'
      ],
      amenities: ['Wifi tốc độ cao', 'Hồ bơi vô cực', 'Lễ tân 24/7', 'Smart TV'],
      rooms: [
        { name: 'Superior Sea View', basePrice: 1200000, capacity: 2, totalRooms: 20 },
        { name: 'Presidential Suite', basePrice: 5500000, capacity: 4, totalRooms: 2 }
      ]
    },
    {
      name: 'Đà Lạt Pine Forest Retreat',
      description: 'Căn nhà gỗ lãng mạn lọt thỏm giữa rừng thông. Tách biệt hoàn toàn khỏi sự ồn ào của phố thị. Nơi lý tưởng để "chữa lành" và tổ chức tiệc BBQ ngoài trời.',
      address: 'Đường Trại Mát, Đà Lạt',
      city: 'Đà Lạt',
      country: 'Việt Nam',
      lat: 11.9404,
      lng: 108.4583,
      type: 'HOMESTAY',
      rating: 4.7,
      ownerId: owner2.id,
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'
      ],
      amenities: ['Wifi tốc độ cao', 'Bếp tiện nghi', 'Bãi đậu xe miễn phí'],
      rooms: [
        { name: 'Nhà Gỗ Nhỏ', basePrice: 650000, capacity: 2, totalRooms: 8 },
        { name: 'Nhà Gỗ Lớn (Family)', basePrice: 1800000, capacity: 6, totalRooms: 4 }
      ]
    }
  ];

  for (const h of hotelsData) {
    const hotel = await prisma.hotel.create({
      data: {
        name: h.name,
        description: h.description,
        address: h.address,
        city: h.city,
        country: h.country,
        lat: h.lat,
        lng: h.lng,
        type: h.type as any,
        rating: h.rating,
        ownerId: h.ownerId,
        images: h.images,
      },
    });

    // Add Amenities
    for (const am of h.amenities) {
      await (prisma as any).hotelAmenity.create({
        data: {
          hotelId: hotel.id,
          amenityId: createdAmenities[am],
        }
      });
    }

    // Add Rooms
    for (const r of h.rooms) {
      const room = await prisma.room.create({
        data: {
          hotelId: hotel.id,
          name: r.name,
          basePrice: r.basePrice,
          capacity: r.capacity,
          totalRooms: r.totalRooms,
        }
      });

      // Assign all hotel amenities to the room for simplicity
      for (const am of h.amenities) {
        await (prisma as any).roomAmenity.create({
          data: {
            roomId: room.id,
            amenityId: createdAmenities[am],
          }
        });
      }
    }
  }

  // 4. Create Tours
  const toursData = [
    {
      name: 'Khám phá Hà Giang Loop - Cực Bắc Tổ Quốc',
      description: 'Hành trình chinh phục những cung đường đèo hùng vĩ nhất Việt Nam. Trải nghiệm văn hóa đặc sắc của đồng bào dân tộc thiểu số và check-in Cột cờ Lũng Cú.',
      location: 'Hà Giang',
      durationDays: 3,
      durationNights: 2,
      basePrice: 2500000,
      ownerId: owner1.id,
      images: [
        'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&q=80',
        'https://images.unsplash.com/photo-1574872288019-9eb101b4c95f?w=800&q=80'
      ],
      includes: ['Xe máy di chuyển', 'Homestay 2 đêm', 'Các bữa ăn theo lịch trình', 'Vé tham quan'],
      excludes: ['Chi phí cá nhân', 'Đồ uống gọi thêm'],
      itineraries: [
        { dayNumber: 1, title: 'Hà Giang - Quản Bạ - Yên Minh', description: 'Bắt đầu hành trình chinh phục dốc Bắc Sum, cổng trời Quản Bạ. Chiều đến rừng thông Yên Minh.' },
        { dayNumber: 2, title: 'Yên Minh - Đồng Văn - Lũng Cú', description: 'Khám phá cao nguyên đá Đồng Văn, dinh thự họ Vương và cột cờ Lũng Cú cực Bắc.' },
        { dayNumber: 3, title: 'Đồng Văn - Mã Pì Lèng - Mèo Vạc', description: 'Chinh phục tứ đại đỉnh đèo Mã Pì Lèng, đi thuyền trên sông Nho Quế và trở về Hà Giang.' }
      ]
    },
    {
      name: 'Trekking Sapa - Chinh phục Fansipan',
      description: 'Hành trình leo núi 2 ngày 1 đêm dành cho những người yêu thích mạo hiểm. Băng qua những khu rừng nguyên sinh và đón bình minh trên nóc nhà Đông Dương.',
      location: 'Sapa',
      durationDays: 2,
      durationNights: 1,
      basePrice: 1800000,
      ownerId: owner2.id,
      images: [
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80',
        'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80'
      ],
      includes: ['Hướng dẫn viên người bản địa', 'Porter mang đồ', 'Giấy phép leo núi', 'Trại ngủ đêm trên núi', 'Các bữa ăn'],
      excludes: ['Túi ngủ cá nhân (có thể thuê thêm)', 'Cáp treo chiều về (nếu cần)'],
      itineraries: [
        { dayNumber: 1, title: 'Trạm Tôn - Trạm nghỉ 2800m', description: 'Bắt đầu trek từ Trạm Tôn, xuyên qua rừng trúc và rừng đỗ quyên. Cắm trại qua đêm tại cao độ 2800m.' },
        { dayNumber: 2, title: 'Đỉnh Fansipan - Sapa', description: 'Dậy sớm đón bình minh, tiếp tục lên đỉnh 3143m. Chạm tay vào cột mốc và di chuyển xuống núi.' }
      ]
    },
    {
      name: 'Du thuyền Vịnh Lan Hạ 5 Sao',
      description: 'Nghỉ dưỡng đẳng cấp trên du thuyền sang trọng. Khám phá vẻ đẹp hoang sơ của Vịnh Lan Hạ, chèo kayak và tận hưởng tiệc Sunset Party.',
      location: 'Cát Bà, Hải Phòng',
      durationDays: 2,
      durationNights: 1,
      basePrice: 3200000,
      ownerId: owner1.id,
      images: [
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
      ],
      includes: ['Phòng suite trên du thuyền', '4 bữa ăn cao cấp', 'Vé chèo Kayak', 'Trà chiều Sunset', 'Hướng dẫn viên'],
      excludes: ['Đồ uống có cồn', 'Dịch vụ Spa'],
      itineraries: [
        { dayNumber: 1, title: 'Tuần Châu - Vịnh Lan Hạ - Hang Sáng Tối', description: 'Check-in du thuyền, thưởng thức bữa trưa. Chiều đi đò nan thăm Hang Sáng Tối. Tối dự tiệc BBQ trên boong tàu.' },
        { dayNumber: 2, title: 'Làng chài Trà Báu - Tuần Châu', description: 'Đón bình minh với bài tập Tai Chi. Chèo Kayak tại khu vực Trà Báu. Trả phòng và dùng bữa trưa sớm trước khi cập bến.' }
      ]
    },
    {
      name: 'Khám phá Miền Tây Sông Nước',
      description: 'Trải nghiệm cuộc sống dân dã của người dân Nam Bộ. Đi chợ nổi, thăm miệt vườn và thưởng thức đờn ca tài tử.',
      location: 'Cần Thơ',
      durationDays: 1,
      durationNights: 0,
      basePrice: 850000,
      ownerId: owner2.id,
      images: [
        'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=1200&q=80',
        'https://images.unsplash.com/photo-1572791870574-8a7b7b3d2dd3?w=800&q=80'
      ],
      includes: ['Thuyền tham quan chợ nổi', 'Xe đưa đón tại Cần Thơ', 'Bữa trưa đặc sản', 'Trái cây miệt vườn'],
      excludes: ['VAT', 'Tiền tip cho HDV'],
      itineraries: [
        { dayNumber: 1, title: 'Chợ nổi Cái Răng - Miệt vườn - Lò kẹo dừa', description: 'Đi thuyền sáng sớm xem cảnh buôn bán trên sông. Thăm lò kẹo dừa truyền thống. Trưa ăn tại miệt vườn, nghe đờn ca tài tử và kết thúc tour vào chiều muộn.' }
      ]
    }
  ];

  for (const t of toursData) {
    const tour = await prisma.tour.create({
      data: {
        name: t.name,
        description: t.description,
        location: t.location,
        durationDays: t.durationDays,
        durationNights: t.durationNights,
        basePrice: t.basePrice,
        ownerId: t.ownerId,
        images: t.images,
        includes: t.includes,
        excludes: t.excludes,
      }
    });

    for (const it of t.itineraries) {
      await prisma.tourItinerary.create({
        data: {
          tourId: tour.id,
          dayNumber: it.dayNumber,
          title: it.title,
          description: it.description,
        }
      });
    }

    // Add 5 availabilities starting from tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    for (let i = 0; i < 5; i++) {
      const startDate = new Date(tomorrow);
      startDate.setDate(tomorrow.getDate() + (i * 3)); // every 3 days
      await prisma.tourAvailability.create({
        data: {
          tourId: tour.id,
          startDate: startDate,
          price: t.basePrice,
          capacity: 15,
          available: 15,
          booked: 0
        }
      });
    }
  }

  console.log('Seed dữ liệu MỚI cực kỳ phong phú thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

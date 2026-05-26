/**
 * Seed bổ sung an toàn: thêm hoặc cập nhật dữ liệu mẫu, không xoá dữ liệu cũ.
 * Chạy: npx ts-node prisma/seed-data.ts
 */
import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

type HotelTypeValue = 'HOTEL' | 'VILLA' | 'HOMESTAY' | 'RESORT';
type TourTypeValue = 'TREKKING' | 'RESORT' | 'CULTURE' | 'CRUISE';
type TourRegionValue = 'BAC' | 'TRUNG' | 'NAM';

type RoomSeed = {
  name: string;
  basePrice: number;
  capacity: number;
  totalRooms: number;
};

type HotelSeed = {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  type: HotelTypeValue;
  rating: number;
  ownerId: string;
  images: string[];
  amenityList: string[];
  rooms: RoomSeed[];
};

type TourItinerarySeed = {
  dayNumber: number;
  title: string;
  description: string;
};

type TourSeed = {
  name: string;
  description: string;
  location: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  ownerId: string;
  type: TourTypeValue;
  region: TourRegionValue;
  images: string[];
  includes: string[];
  excludes: string[];
  itineraries: TourItinerarySeed[];
};

function shortId() {
  return 'BK' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function stripAccents(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd');
}

function toLegacyMojibake(value: string) {
  return Buffer.from(value, 'utf8').toString('latin1');
}

function legacyCandidates(value: string) {
  const ascii = stripAccents(value);
  const mojibakeOnce = toLegacyMojibake(value);
  const mojibakeTwice = toLegacyMojibake(mojibakeOnce);

  return unique([value, ascii, mojibakeOnce, mojibakeTwice]);
}

async function upsertAmenity(seed: { name: string; icon: string }) {
  const existing = await prisma.amenity.findFirst({
    where: { name: { in: legacyCandidates(seed.name) } },
  });

  if (existing) {
    return prisma.amenity.update({
      where: { id: existing.id },
      data: { name: seed.name, icon: seed.icon },
    });
  }

  return prisma.amenity.create({ data: seed });
}

async function findHotelByName(name: string) {
  return prisma.hotel.findFirst({
    where: { name: { in: legacyCandidates(name) } },
  });
}

async function findRoomByName(hotelId: string, name: string) {
  return prisma.room.findFirst({
    where: {
      hotelId,
      name: { in: legacyCandidates(name) },
    },
  });
}

async function findTourByName(name: string) {
  return prisma.tour.findFirst({
    where: { name: { in: legacyCandidates(name) } },
  });
}

async function main() {
  console.log('Bắt đầu seed dữ liệu bổ sung, giữ nguyên dữ liệu hiện có...\n');
  const hashedPassword = await bcrypt.hash('123456', 10);

  // ============ 1. TIỆN ÍCH ============
  const amenitySeeds = [
    { name: 'Wifi tốc độ cao', icon: 'Wifi' },
    { name: 'Hồ bơi vô cực', icon: 'Waves' },
    { name: 'Bếp tiện nghi', icon: 'Coffee' },
    { name: 'Bãi đậu xe miễn phí', icon: 'Car' },
    { name: 'Điều hòa nhiệt độ', icon: 'Wind' },
    { name: 'Smart TV', icon: 'Tv' },
    { name: 'Lễ tân 24/7', icon: 'CheckCircle2' },
    { name: 'Máy giặt', icon: 'Shirt' },
    { name: 'BBQ ngoài trời', icon: 'Flame' },
    { name: 'Ban công view đẹp', icon: 'Mountain' },
  ];

  const amenities: Record<string, string> = {};
  for (const amenity of amenitySeeds) {
    const record = await upsertAmenity(amenity);
    amenities[amenity.name] = record.id;
  }
  console.log(`Đã chuẩn hoá ${amenitySeeds.length} tiện ích`);

  // ============ 2. CHỦ CƠ SỞ ============
  const owner1 = await prisma.user.upsert({
    where: { email: 'owner1@vietjourney.com' },
    update: {
      name: 'Nguyễn Trường Giang',
      role: 'OWNER',
      isVerified: true,
      avatar:
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80',
    },
    create: {
      email: 'owner1@vietjourney.com',
      password: hashedPassword,
      name: 'Nguyễn Trường Giang',
      role: 'OWNER',
      isVerified: true,
      avatar:
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80',
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: 'owner2@vietjourney.com' },
    update: {
      name: 'Trần Mai Phương',
      role: 'OWNER',
      isVerified: true,
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    },
    create: {
      email: 'owner2@vietjourney.com',
      password: hashedPassword,
      name: 'Trần Mai Phương',
      role: 'OWNER',
      isVerified: true,
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    },
  });
  console.log('Đã chuẩn hoá 2 chủ cơ sở');

  // ============ 3. NGƯỜI DÙNG MẪU ============
  const sampleUsers = [
    { email: 'user1@gmail.com', name: 'Lê Văn An', phone: '0901234567' },
    { email: 'user2@gmail.com', name: 'Phạm Thị Bình', phone: '0912345678' },
    { email: 'user3@gmail.com', name: 'Hoàng Minh Châu', phone: '0923456789' },
    { email: 'user4@gmail.com', name: 'Nguyễn Thu Dung', phone: '0934567890' },
    { email: 'user5@gmail.com', name: 'Đặng Quốc Bảo', phone: '0945678901' },
  ];

  const createdUsers: string[] = [];
  for (const user of sampleUsers) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        phone: user.phone,
        role: 'USER',
        isVerified: true,
      },
      create: {
        email: user.email,
        password: hashedPassword,
        name: user.name,
        phone: user.phone,
        role: 'USER',
        isVerified: true,
      },
    });
    createdUsers.push(record.id);
  }
  console.log(`Đã chuẩn hoá ${sampleUsers.length} người dùng mẫu`);

  // ============ 4. HOMESTAY / KHÁCH SẠN ============
  const hotelsData: HotelSeed[] = [
    {
      name: 'Mộc Châu Garden Homestay',
      description:
        'Homestay xinh xắn giữa đồi chè Mộc Châu. Sáng thức dậy ngắm sương mù bao phủ những đồi chè xanh mướt. Phòng thiết kế tối giản, ấm cúng với chất liệu gỗ tự nhiên.',
      address: 'Bản Áng, Mộc Châu',
      city: 'Mộc Châu',
      country: 'Việt Nam',
      lat: 20.83,
      lng: 104.68,
      type: 'HOMESTAY',
      rating: 4.8,
      ownerId: owner1.id,
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80',
      ],
      amenityList: [
        'Wifi tốc độ cao',
        'Bếp tiện nghi',
        'BBQ ngoài trời',
        'Ban công view đẹp',
      ],
      rooms: [
        {
          name: 'Phòng Đôi View Đồi Chè',
          basePrice: 550000,
          capacity: 2,
          totalRooms: 6,
        },
        {
          name: 'Phòng Gia Đình',
          basePrice: 950000,
          capacity: 4,
          totalRooms: 3,
        },
      ],
    },
    {
      name: 'Phú Quốc Sunset Resort',
      description:
        'Resort đẳng cấp bên bãi biển Ông Lang. Tận hưởng hoàng hôn tuyệt đẹp từ hồ bơi vô cực. Spa và nhà hàng hải sản tươi sống phục vụ cả ngày.',
      address: 'Bãi Ông Lang, Phú Quốc',
      city: 'Phú Quốc',
      country: 'Việt Nam',
      lat: 10.32,
      lng: 103.85,
      type: 'RESORT',
      rating: 4.9,
      ownerId: owner2.id,
      images: [
        'https://images.unsplash.com/photo-1564596823821-79b7a0314a52?w=1200&q=80',
        'https://images.unsplash.com/photo-1505691938895-1758d7def511?w=800&q=80',
      ],
      amenityList: [
        'Wifi tốc độ cao',
        'Hồ bơi vô cực',
        'Lễ tân 24/7',
        'Smart TV',
        'Điều hòa nhiệt độ',
      ],
      rooms: [
        {
          name: 'Deluxe Ocean View',
          basePrice: 2200000,
          capacity: 2,
          totalRooms: 15,
        },
        { name: 'Pool Villa', basePrice: 6500000, capacity: 4, totalRooms: 5 },
      ],
    },
    {
      name: 'Ninh Bình Ancient House',
      description:
        'Nhà cổ truyền thống Việt Nam được phục dựng. Nằm ngay cạnh khu Tràng An, thuận tiện di chuyển đến các điểm tham quan. Khu vườn rộng rãi với ao cá Koi.',
      address: 'Trường Yên, Hoa Lư',
      city: 'Ninh Bình',
      country: 'Việt Nam',
      lat: 20.26,
      lng: 105.97,
      type: 'HOMESTAY',
      rating: 4.6,
      ownerId: owner1.id,
      images: [
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
      ],
      amenityList: ['Wifi tốc độ cao', 'Bãi đậu xe miễn phí', 'Bếp tiện nghi'],
      rooms: [
        {
          name: 'Phòng Truyền Thống',
          basePrice: 450000,
          capacity: 2,
          totalRooms: 8,
        },
        {
          name: 'Phòng VIP Sân Vườn',
          basePrice: 850000,
          capacity: 3,
          totalRooms: 4,
        },
      ],
    },
    {
      name: 'Quy Nhơn Beach Villa',
      description:
        'Villa trắng tinh khôi sát biển Kỳ Co. Check-in nổi bật với phòng thoáng đãng, cửa kính lớn nhìn ra biển xanh ngọc bích.',
      address: 'Bãi Kỳ Co, Quy Nhơn',
      city: 'Quy Nhơn',
      country: 'Việt Nam',
      lat: 13.68,
      lng: 109.25,
      type: 'VILLA',
      rating: 4.7,
      ownerId: owner2.id,
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
      ],
      amenityList: [
        'Wifi tốc độ cao',
        'Hồ bơi vô cực',
        'Smart TV',
        'Điều hòa nhiệt độ',
        'Ban công view đẹp',
      ],
      rooms: [
        {
          name: 'Studio Ocean',
          basePrice: 1600000,
          capacity: 2,
          totalRooms: 10,
        },
        {
          name: 'Penthouse Suite',
          basePrice: 4200000,
          capacity: 6,
          totalRooms: 2,
        },
      ],
    },
  ];

  const hotelIds: string[] = [];
  for (const hotelSeed of hotelsData) {
    const existing = await findHotelByName(hotelSeed.name);
    const data = {
      name: hotelSeed.name,
      description: hotelSeed.description,
      address: hotelSeed.address,
      city: hotelSeed.city,
      country: hotelSeed.country,
      lat: hotelSeed.lat,
      lng: hotelSeed.lng,
      type: hotelSeed.type,
      rating: hotelSeed.rating,
      ownerId: hotelSeed.ownerId,
      images: hotelSeed.images as Prisma.InputJsonValue,
      approvalStatus: 'APPROVED' as const,
    };

    const hotel = existing
      ? await prisma.hotel.update({ where: { id: existing.id }, data })
      : await prisma.hotel.create({ data });

    hotelIds.push(hotel.id);

    for (const amenityName of hotelSeed.amenityList) {
      const amenityId = amenities[amenityName];
      if (amenityId) {
        await prisma.hotelAmenity
          .create({
            data: { hotelId: hotel.id, amenityId },
          })
          .catch(() => undefined);
      }
    }

    for (const roomSeed of hotelSeed.rooms) {
      const existingRoom = await findRoomByName(hotel.id, roomSeed.name);
      const roomData = {
        hotelId: hotel.id,
        name: roomSeed.name,
        basePrice: roomSeed.basePrice,
        capacity: roomSeed.capacity,
        totalRooms: roomSeed.totalRooms,
      };

      if (existingRoom) {
        await prisma.room.update({
          where: { id: existingRoom.id },
          data: roomData,
        });
      } else {
        await prisma.room.create({ data: roomData });
      }
    }
  }
  console.log(`Đã chuẩn hoá ${hotelsData.length} homestay/khách sạn`);

  // ============ 5. TOUR ============
  const toursData: TourSeed[] = [
    {
      name: 'Phú Yên - Xứ Nẫu Hoa Vàng Cỏ Xanh',
      description:
        'Khám phá vẻ đẹp thơ mộng của Phú Yên qua Gành Đá Đĩa, Bãi Xép, Mũi Điện và những câu chuyện văn hoá xứ Nẫu ven biển.',
      location: 'Phú Yên',
      durationDays: 2,
      durationNights: 1,
      basePrice: 1950000,
      ownerId: owner1.id,
      type: 'CULTURE',
      region: 'TRUNG',
      images: [
        'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&q=80',
      ],
      includes: [
        'Xe di chuyển',
        'Khách sạn 1 đêm',
        'Bữa ăn địa phương',
        'Vé tham quan',
      ],
      excludes: ['Chi phí cá nhân', 'Đồ uống ngoài bữa'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Tuy Hòa - Gành Đá Đĩa - Bãi Xép',
          description:
            'Tham quan Gành Đá Đĩa kỳ vĩ, ghé làng chài ven biển và ngắm hoàng hôn ở Bãi Xép.',
        },
        {
          dayNumber: 2,
          title: 'Mũi Điện - Nhà thờ Mằng Lăng',
          description:
            'Leo Mũi Điện đón bình minh, thăm nhà thờ cổ Mằng Lăng và thưởng thức đặc sản cá ngừ.',
        },
      ],
    },
    {
      name: 'Đảo Lý Sơn - Vương Quốc Tỏi',
      description:
        'Hành trình khám phá hòn đảo tiền tiêu với miệng núi lửa triệu năm, cổng Tò Vò, ruộng tỏi và đời sống ngư dân Lý Sơn.',
      location: 'Quảng Ngãi',
      durationDays: 3,
      durationNights: 2,
      basePrice: 2800000,
      ownerId: owner2.id,
      type: 'CRUISE',
      region: 'TRUNG',
      images: [
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&q=80',
      ],
      includes: [
        'Tàu cao tốc',
        'Homestay 2 đêm',
        'Xe máy thuê',
        'Bữa ăn hải sản',
      ],
      excludes: ['Lặn biển chuyên sâu', 'Chi phí cá nhân'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Sa Kỳ - Đảo Lớn Lý Sơn',
          description:
            'Đáp tàu cao tốc ra đảo, nhận phòng, khám phá chùa Hang và miệng núi lửa Thới Lới.',
        },
        {
          dayNumber: 2,
          title: 'Đảo Bé - Lặn ngắm san hô',
          description:
            'Đi thuyền sang Đảo Bé, lặn ngắm san hô tại Bãi Sau và ngắm hoàng hôn ở cổng Tò Vò.',
        },
        {
          dayNumber: 3,
          title: 'Cánh đồng tỏi - Về đất liền',
          description:
            'Thăm vườn tỏi, nghe người dân kể chuyện mùa vụ, mua đặc sản và đáp tàu về Sa Kỳ.',
        },
      ],
    },
    {
      name: 'Huế - Cố Đô Ngàn Năm',
      description:
        'Tìm hiểu lịch sử, nghi lễ và ẩm thực Huế qua Đại Nội, lăng tẩm triều Nguyễn, chùa Thiên Mụ và ca Huế trên sông Hương.',
      location: 'Huế',
      durationDays: 2,
      durationNights: 1,
      basePrice: 1650000,
      ownerId: owner1.id,
      type: 'CULTURE',
      region: 'TRUNG',
      images: [
        'https://images.unsplash.com/photo-1574872288019-9eb101b4c95f?w=1200&q=80',
      ],
      includes: [
        'Xe đưa đón',
        'Khách sạn 3 sao',
        'Vé tham quan',
        'Ca Huế trên sông Hương',
      ],
      excludes: ['Ăn uống tự túc', 'Chi phí cá nhân'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Đại Nội - Lăng Khải Định - Chùa Thiên Mụ',
          description:
            'Tham quan Hoàng Thành, lăng Khải Định, chùa Thiên Mụ và nghe ca Huế trên thuyền buổi tối.',
        },
        {
          dayNumber: 2,
          title: 'Lăng Tự Đức - Chợ Đông Ba',
          description:
            'Khám phá lăng Tự Đức, dạo chợ Đông Ba mua quà và thưởng thức bún bò Huế.',
        },
      ],
    },
    {
      name: 'Hà Giang Chợ Phiên Và Nhà Trình Tường',
      description:
        'Sống chậm trong bản người Mông, đi chợ phiên, thử món thắng cố và tìm hiểu nghề dệt lanh, trình tường của cao nguyên đá.',
      location: 'Hà Giang',
      durationDays: 3,
      durationNights: 2,
      basePrice: 2550000,
      ownerId: owner1.id,
      type: 'TREKKING',
      region: 'BAC',
      images: [
        'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&q=80',
        'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
      ],
      includes: [
        'Xe đưa đón tại Hà Giang',
        'Homestay cộng đồng 2 đêm',
        'Hướng dẫn viên bản địa',
        'Bữa ăn theo lịch trình',
        'Vé tham quan',
      ],
      excludes: ['Chi phí cá nhân', 'Đồ uống ngoài chương trình'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Hà Giang - Quản Bạ - Làng lanh Lùng Tám',
          description:
            'Qua cổng trời Quản Bạ, gặp nghệ nhân dệt lanh và dùng bữa tối cùng gia đình người Mông trong nhà trình tường.',
        },
        {
          dayNumber: 2,
          title: 'Yên Minh - Đồng Văn - Chợ phiên',
          description:
            'Đi bộ qua bản nhỏ, ghé chợ phiên địa phương, nghe chuyện khèn Mông và thử nấu thắng cố theo cách bản địa.',
        },
        {
          dayNumber: 3,
          title: 'Mã Pí Lèng - Sông Nho Quế',
          description:
            'Trekking nhẹ trên cung đường nhìn xuống hẻm Tu Sản, ăn trưa với món ngô men và trở về thành phố Hà Giang.',
        },
      ],
    },
    {
      name: 'Sapa Làng Dao Đỏ Và Tắm Lá Thuốc',
      description:
        'Trekking qua ruộng bậc thang và bản người Dao Đỏ, học cách nhuộm vải, nấu cơm lam và trải nghiệm tắm lá thuốc truyền thống.',
      location: 'Sapa, Lào Cai',
      durationDays: 2,
      durationNights: 1,
      basePrice: 1650000,
      ownerId: owner2.id,
      type: 'TREKKING',
      region: 'BAC',
      images: [
        'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80',
      ],
      includes: [
        'Hướng dẫn viên người Dao',
        'Homestay 1 đêm',
        'Bữa ăn bản địa',
        'Trải nghiệm tắm lá thuốc',
        'Xe trung chuyển Sapa',
      ],
      excludes: ['Đồ dùng cá nhân', 'Tiền tip tự nguyện'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Sapa - Tả Phìn',
          description:
            'Trekking qua thung lũng, tham quan xưởng thêu tay và cùng chủ nhà chuẩn bị bữa tối với nồi lá thuốc.',
        },
        {
          dayNumber: 2,
          title: 'Tả Phìn - Ruộng bậc thang - Sapa',
          description:
            'Dậy sớm ngắm ruộng bậc thang, học nhuộm chàm và trở lại trung tâm Sapa sau bữa trưa.',
        },
      ],
    },
    {
      name: 'Mai Châu Nhịp Chiêng Mường',
      description:
        'Ở nhà sàn người Thái, đạp xe qua bản Lác, học múa xoè, dệt thổ cẩm và thưởng thức mâm cơm vùng cao cùng rượu cần.',
      location: 'Mai Châu, Hòa Bình',
      durationDays: 2,
      durationNights: 1,
      basePrice: 1450000,
      ownerId: owner1.id,
      type: 'CULTURE',
      region: 'BAC',
      images: [
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80',
      ],
      includes: [
        'Xe Hà Nội - Mai Châu',
        'Nhà sàn 1 đêm',
        'Workshop dệt thổ cẩm',
        'Đạp xe trong bản',
        'Bữa ăn đặc sản',
      ],
      excludes: ['Đồ uống gọi thêm', 'Chi phí cá nhân'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Hà Nội - Bản Lác',
          description:
            'Đến Mai Châu, đạp xe qua cánh đồng, thăm khung cửi truyền thống và dùng bữa tối nhà sàn.',
        },
        {
          dayNumber: 2,
          title: 'Pom Coọng - Hang Chiều',
          description:
            'Học múa xoè, leo Hang Chiều ngắm thung lũng và ghé chợ địa phương trước khi về Hà Nội.',
        },
      ],
    },
    {
      name: 'Ninh Bình Làng Nghề Cói Và Bếp Quê',
      description:
        'Kết hợp Tràng An với làng nghề cói Kim Sơn, học đan chiếu, đi chợ quê và nấu mâm cơm Bắc Bộ trong sân nhà cổ.',
      location: 'Ninh Bình',
      durationDays: 1,
      durationNights: 0,
      basePrice: 890000,
      ownerId: owner2.id,
      type: 'CULTURE',
      region: 'BAC',
      images: [
        'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80',
      ],
      includes: [
        'Xe đưa đón Ninh Bình',
        'Thuyền Tràng An',
        'Workshop đan cói',
        'Bữa trưa nhà dân',
        'Vé tham quan',
      ],
      excludes: ['Thuế VAT', 'Đồ uống cá nhân'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Tràng An - Kim Sơn - Nhà cổ',
          description:
            'Đi thuyền Tràng An buổi sáng, chiều ghé làng cói học đan chiếu và nấu mâm cơm quê cùng chủ nhà.',
        },
      ],
    },
    {
      name: 'Huế Làng Hương Và Ẩm Thực Cung Đình',
      description:
        'Đi sâu vào di sản Huế qua làng hương Thủy Xuân, pháp lam, ẩm thực cung đình và ca Huế trên sông Hương với nghệ nhân địa phương.',
      location: 'Huế',
      durationDays: 2,
      durationNights: 1,
      basePrice: 1720000,
      ownerId: owner1.id,
      type: 'CULTURE',
      region: 'TRUNG',
      images: [
        'https://images.unsplash.com/photo-1574872288019-9eb101b4c95f?w=1200&q=80',
        'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
      ],
      includes: [
        'Khách sạn 1 đêm',
        'Xe đưa đón',
        'Ca Huế trên sông Hương',
        'Workshop làm hương',
        'Vé tham quan',
      ],
      excludes: ['Bữa tối tự chọn', 'Chi phí cá nhân'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Đại Nội - Thủy Xuân - Ca Huế',
          description:
            'Thăm Đại Nội, tự tay se hương ở Thủy Xuân và nghe ca Huế trên thuyền rồng buổi tối.',
        },
        {
          dayNumber: 2,
          title: 'Lăng Tự Đức - Chợ Đông Ba',
          description:
            'Khám phá kiến trúc lăng tẩm, ăn sáng bún bò, dạo chợ Đông Ba cùng hướng dẫn viên.',
        },
      ],
    },
    {
      name: 'Hội An Đêm Lồng Đèn Và Làng Mộc Kim Bồng',
      description:
        'Trải nghiệm phố cổ qua xưởng đèn lồng, làng mộc Kim Bồng, lớp nấu mì Quảng và buổi tối thả hoa đăng cùng người địa phương.',
      location: 'Hội An, Quảng Nam',
      durationDays: 2,
      durationNights: 1,
      basePrice: 1580000,
      ownerId: owner2.id,
      type: 'CULTURE',
      region: 'TRUNG',
      images: [
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&q=80',
        'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
        'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80',
      ],
      includes: [
        'Homestay phố cổ 1 đêm',
        'Workshop đèn lồng',
        'Lớp nấu ăn',
        'Thuyền sông Hoài',
        'Xe đạp',
      ],
      excludes: ['Vé show nghệ thuật', 'Đồ uống ngoài bữa'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Phố cổ - Xưởng đèn lồng',
          description:
            'Đi bộ qua các hội quán, làm đèn lồng mini và thả hoa đăng trên sông Hoài.',
        },
        {
          dayNumber: 2,
          title: 'Kim Bồng - Lớp nấu mì Quảng',
          description:
            'Đạp xe ra bến thuyền sang làng mộc Kim Bồng, học nấu mì Quảng và dùng bữa trưa tại nhà dân.',
        },
      ],
    },
    {
      name: 'Tây Nguyên Cồng Chiêng Và Cà Phê Buôn Làng',
      description:
        'Nghỉ tại buôn làng Ê Đê, nghe cồng chiêng, rang cà phê thủ công, đi bộ qua rẫy và tìm hiểu kiến trúc nhà dài.',
      location: 'Buôn Ma Thuột, Đắk Lắk',
      durationDays: 3,
      durationNights: 2,
      basePrice: 2450000,
      ownerId: owner1.id,
      type: 'RESORT',
      region: 'TRUNG',
      images: [
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&q=80',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80',
      ],
      includes: [
        'Eco-lodge 2 đêm',
        'Trình diễn cồng chiêng',
        'Workshop cà phê',
        'Xe đưa đón sân bay',
        'Bữa ăn địa phương',
      ],
      excludes: ['Vé máy bay', 'Đồ uống tại bar'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Buôn Ako Dhong - Nhà dài',
          description:
            'Nhận phòng eco-lodge, thăm nhà dài Ê Đê và dùng bữa tối với các món rừng núi.',
        },
        {
          dayNumber: 2,
          title: 'Rẫy cà phê - Cồng chiêng',
          description:
            'Theo chủ rẫy hái cà phê, học rang xay thủ công và giao lưu cồng chiêng quanh bếp lửa buổi tối.',
        },
        {
          dayNumber: 3,
          title: 'Thác Dray Nur - Chợ Buôn Ma Thuột',
          description:
            'Dạo thác Dray Nur, ghé chợ mua cà phê và đặc sản trước khi kết thúc.',
        },
      ],
    },
    {
      name: 'Lý Sơn Thuyền Thúng Và Làng Chài An Hải',
      description:
        'Du thuyền nhỏ quanh đảo, theo ngư dân ra thúng, ăn bữa cơm cá tươi và nghe chuyện đội Hoàng Sa trong làng chài An Hải.',
      location: 'Lý Sơn, Quảng Ngãi',
      durationDays: 2,
      durationNights: 1,
      basePrice: 2250000,
      ownerId: owner2.id,
      type: 'CRUISE',
      region: 'TRUNG',
      images: [
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
      ],
      includes: [
        'Tàu cao tốc khứ hồi',
        'Homestay 1 đêm',
        'Thuyền thúng làng chài',
        'Bữa hải sản',
        'Xe máy trên đảo',
      ],
      excludes: ['Lặn biển chuyên sâu', 'Chi phí cá nhân'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Sa Kỳ - An Hải - Cổng Tò Vò',
          description:
            'Ra đảo, gặp ngư dân An Hải, thử chèo thúng và ngắm hoàng hôn ở cổng Tò Vò.',
        },
        {
          dayNumber: 2,
          title: 'Đảo Bé - Ruộng tỏi',
          description:
            'Đi thuyền sang Đảo Bé, ghé ruộng tỏi, dùng bữa trưa hải sản rồi về đất liền.',
        },
      ],
    },
    {
      name: 'Cần Thơ Chợ Nổi Và Đờn Ca Tài Tử',
      description:
        'Dậy sớm đi chợ nổi Cái Răng, ăn hủ tiếu trên ghe, thăm vườn trái cây và nghe đờn ca tài tử trong nhà vườn ven sông.',
      location: 'Cần Thơ',
      durationDays: 1,
      durationNights: 0,
      basePrice: 780000,
      ownerId: owner1.id,
      type: 'CRUISE',
      region: 'NAM',
      images: [
        'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=1200&q=80',
        'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
      ],
      includes: [
        'Thuyền chợ nổi',
        'Ăn sáng trên ghe',
        'Vườn trái cây',
        'Bữa trưa miền Tây',
        'Đờn ca tài tử',
      ],
      excludes: ['Thuế VAT', 'Tiền tip tự nguyện'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Cái Răng - Vườn trái cây - Nhà vườn',
          description:
            'Đi chợ nổi lúc bình minh, thưởng thức hủ tiếu ghe, thăm vườn và nghe đờn ca tài tử sau bữa trưa.',
        },
      ],
    },
    {
      name: 'An Giang Miền Thất Sơn Và Chăm Châu Giang',
      description:
        'Khám phá văn hoá Chăm ven sông Hậu, làng dệt thổ cẩm, chợ Châu Đốc và hành trình nhẹ qua vùng Thất Sơn.',
      location: 'Châu Đốc, An Giang',
      durationDays: 2,
      durationNights: 1,
      basePrice: 1380000,
      ownerId: owner2.id,
      type: 'CULTURE',
      region: 'NAM',
      images: [
        'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80',
      ],
      includes: [
        'Khách sạn 1 đêm',
        'Thuyền sang Châu Giang',
        'Workshop dệt Chăm',
        'Bữa ăn địa phương',
        'Xe đưa đón',
      ],
      excludes: ['Vé cáp treo Núi Sam', 'Chi phí mua sắm'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Chợ Châu Đốc - Làng Chăm',
          description:
            'Dạo chợ mắm Châu Đốc, đi thuyền sang Châu Giang, học dệt thổ cẩm và thưởng thức cà ri Chăm.',
        },
        {
          dayNumber: 2,
          title: 'Núi Sam - Thất Sơn',
          description:
            'Thăm miếu Bà Chúa Xứ, đi cung đường Thất Sơn và kết thúc sau bữa trưa địa phương.',
        },
      ],
    },
    {
      name: 'Bến Tre Làng Dừa Và Bánh Dân Gian',
      description:
        'Len lỏi rạch dừa bằng xuồng chèo, làm kẹo dừa, đổ bánh xèo miền Tây và ngủ homestay trong vườn cây.',
      location: 'Bến Tre',
      durationDays: 2,
      durationNights: 1,
      basePrice: 1250000,
      ownerId: owner1.id,
      type: 'RESORT',
      region: 'NAM',
      images: [
        'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=1200&q=80',
        'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      ],
      includes: [
        'Homestay vườn 1 đêm',
        'Xuồng chèo rạch dừa',
        'Workshop kẹo dừa',
        'Lớp bánh xèo',
        'Xe đạp trong làng',
      ],
      excludes: ['Đồ uống gọi thêm', 'Chi phí cá nhân'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Rạch dừa - Lò kẹo',
          description:
            'Đi xuồng chèo, ghé lò kẹo dừa, đạp xe qua vườn cây và dùng bữa tối cùng chủ nhà.',
        },
        {
          dayNumber: 2,
          title: 'Chợ quê - Bánh dân gian',
          description:
            'Đi chợ sớm, học đổ bánh xèo và bánh lá dừa trước khi rời Bến Tre.',
        },
      ],
    },
    {
      name: 'Côn Đảo Biển Làng Chài Và Ký Ức Đảo',
      description:
        'Nghỉ dưỡng biển có chiều sâu văn hoá: thăm làng chài, nghe chuyện lịch sử Côn Đảo, đi thuyền ngắm san hô và ăn bữa cơm ngư dân.',
      location: 'Côn Đảo, Bà Rịa - Vũng Tàu',
      durationDays: 3,
      durationNights: 2,
      basePrice: 3650000,
      ownerId: owner2.id,
      type: 'RESORT',
      region: 'NAM',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&q=80',
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
      ],
      includes: [
        'Resort 2 đêm',
        'Thuyền ngắm san hô',
        'Bữa cơm làng chài',
        'Vé tham quan di tích',
        'Xe đưa đón sân bay',
      ],
      excludes: ['Vé máy bay', 'Chi phí lặn bình khí'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Nhận phòng - Làng chài',
          description:
            'Nhận phòng resort, đi dạo làng chài và dùng bữa tối hải sản cùng ngư dân.',
        },
        {
          dayNumber: 2,
          title: 'Di tích - Biển san hô',
          description:
            'Thăm các di tích lịch sử buổi sáng, chiều đi thuyền ngắm san hô và bãi biển hoang sơ.',
        },
        {
          dayNumber: 3,
          title: 'Chợ Côn Đảo - Trả phòng',
          description:
            'Ghé chợ mua đặc sản, cà phê ven biển và kết thúc hành trình.',
        },
      ],
    },
    {
      name: 'Phú Quốc Nhà Thùng Và Làng Chài Hàm Ninh',
      description:
        'Khám phá Phú Quốc qua nước mắm nhà thùng, vườn tiêu, làng chài Hàm Ninh và chuyến thuyền hoàng hôn cùng bữa tối hải sản.',
      location: 'Phú Quốc',
      durationDays: 2,
      durationNights: 1,
      basePrice: 2350000,
      ownerId: owner1.id,
      type: 'CRUISE',
      region: 'NAM',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&q=80',
        'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
      ],
      includes: [
        'Khách sạn 1 đêm',
        'Thuyền hoàng hôn',
        'Nhà thùng nước mắm',
        'Vườn tiêu',
        'Bữa hải sản Hàm Ninh',
      ],
      excludes: ['Vé máy bay', 'Đồ uống ngoài chương trình'],
      itineraries: [
        {
          dayNumber: 1,
          title: 'Nhà thùng - Vườn tiêu - Hàm Ninh',
          description:
            'Tìm hiểu nghề làm nước mắm, ghé vườn tiêu và ăn tối tại làng chài Hàm Ninh.',
        },
        {
          dayNumber: 2,
          title: 'Thuyền hoàng hôn - Chợ Dương Đông',
          description:
            'Ra thuyền ngắm biển, ghé chợ Dương Đông mua đặc sản và kết thúc sau bữa trưa.',
        },
      ],
    },
  ];

  const tourIds: string[] = [];
  for (const tourSeed of toursData) {
    const existing = await findTourByName(tourSeed.name);
    const data = {
      name: tourSeed.name,
      description: tourSeed.description,
      location: tourSeed.location,
      type: tourSeed.type,
      region: tourSeed.region,
      durationDays: tourSeed.durationDays,
      durationNights: tourSeed.durationNights,
      basePrice: tourSeed.basePrice,
      ownerId: tourSeed.ownerId,
      images: tourSeed.images as Prisma.InputJsonValue,
      includes: tourSeed.includes as Prisma.InputJsonValue,
      excludes: tourSeed.excludes as Prisma.InputJsonValue,
      approvalStatus: 'APPROVED' as const,
    };

    const tour = existing
      ? await prisma.tour.update({ where: { id: existing.id }, data })
      : await prisma.tour.create({ data });

    tourIds.push(tour.id);

    for (const itinerary of tourSeed.itineraries) {
      await prisma.tourItinerary.upsert({
        where: {
          tourId_dayNumber: {
            tourId: tour.id,
            dayNumber: itinerary.dayNumber,
          },
        },
        update: {
          title: itinerary.title,
          description: itinerary.description,
        },
        create: {
          tourId: tour.id,
          dayNumber: itinerary.dayNumber,
          title: itinerary.title,
          description: itinerary.description,
        },
      });
    }

    const startOffsets = [2, 7, 13, 19, 26];
    for (let i = 0; i < startOffsets.length; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + startOffsets[i]);
      startDate.setHours(8, 0, 0, 0);

      const capacity = 12 + (i % 3) * 4;
      await prisma.tourAvailability
        .create({
          data: {
            tourId: tour.id,
            startDate,
            price: tourSeed.basePrice,
            capacity,
            available: capacity,
            booked: 0,
          },
        })
        .catch(() => undefined);
    }
  }
  console.log(`Đã chuẩn hoá ${toursData.length} tour`);

  // ============ 6. BOOKING MẪU ============
  const allHotels = await prisma.hotel.findMany({
    select: { id: true },
    take: 10,
  });
  const allTours = await prisma.tour.findMany({
    select: { id: true },
    take: 10,
  });

  const bookingCount = await prisma.booking.count();
  const statuses = [
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'CONFIRMED',
    'COMPLETED',
    'PENDING',
    'COMPLETED',
  ] as const;
  const guestNames = [
    'Trần Văn Hùng',
    'Lê Thị Hoa',
    'Phạm Quang Minh',
    'Nguyễn Bảo Ngọc',
    'Đỗ Thanh Tùng',
    'Vũ Thị Mai',
    'Bùi Đức Long',
    'Hà Minh Anh',
  ];
  const guestEmails = guestNames.map(
    (_, index) => `guest${index + 1}@email.com`,
  );

  if (bookingCount < 5) {
    for (let i = 0; i < 8; i++) {
      const isHotel = i % 2 === 0 && allHotels.length > 0;
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() - 30 + i * 5);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkIn.getDate() + 2);
      const amount = isHotel ? 800000 + i * 350000 : 1200000 + i * 400000;

      await prisma.booking.create({
        data: {
          shortId: shortId(),
          userId: createdUsers[i % createdUsers.length],
          hotelId: isHotel ? allHotels[i % allHotels.length]?.id : null,
          tourId:
            !isHotel && allTours.length > 0
              ? allTours[i % allTours.length]?.id
              : null,
          checkIn,
          checkOut,
          totalAmount: amount,
          status: statuses[i],
          paymentStatus:
            statuses[i] === 'COMPLETED' || statuses[i] === 'CONFIRMED'
              ? 'PAID'
              : 'UNPAID',
          guestName: guestNames[i],
          guestEmail: guestEmails[i],
          guestPhone: `090${1000000 + i * 111111}`,
          specialRequest: i % 3 === 0 ? 'Phòng view đẹp, tầng cao' : null,
        },
      });
    }
    console.log('Đã tạo 8 booking mẫu');
  } else {
    console.log(
      `Đã có ${bookingCount} booking, chỉ chuẩn hoá nội dung booking mẫu`,
    );
  }

  for (let i = 0; i < guestEmails.length; i++) {
    await prisma.booking.updateMany({
      where: { guestEmail: guestEmails[i] },
      data: {
        guestName: guestNames[i],
        specialRequest: i % 3 === 0 ? 'Phòng view đẹp, tầng cao' : null,
      },
    });
  }

  // ============ 7. Mã giảm giá ============
  const coupons = [
    {
      code: 'WELCOME10',
      description: 'Giảm 10% cho đơn đầu tiên',
      discountType: 'PERCENTAGE',
      value: 10,
      minOrder: 500000,
      maxDiscount: 200000,
    },
    {
      code: 'SUMMER50K',
      description: 'Giảm 50K cho mùa hè',
      discountType: 'FIXED_AMOUNT',
      value: 50000,
      minOrder: 300000,
      maxDiscount: null,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {
        description: coupon.description,
        discountType: coupon.discountType,
        value: coupon.value,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
        isActive: true,
      },
      create: {
        ...coupon,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 3600 * 1000),
        usageLimit: 100,
        isActive: true,
      },
    });
  }
  console.log('Đã chuẩn hoá 2 mã giảm giá');

  console.log(
    '\nSeed hoàn tất. Các bản ghi mẫu cũ đã được cập nhật sang tiếng Việt có dấu.',
  );
}

main()
  .catch((error) => {
    console.error('Lỗi seed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

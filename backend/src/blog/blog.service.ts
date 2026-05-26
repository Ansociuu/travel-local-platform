import { Injectable, NotFoundException } from '@nestjs/common';
import { HotelApprovalStatus, TourApprovalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  private excerpt(text = '') {
    const compact = text.replace(/\s+/g, ' ').trim();
    return compact.length > 180 ? `${compact.slice(0, 177)}...` : compact;
  }

  private escapeHtml(text = '') {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private cover(images: any, fallback: string) {
    return Array.isArray(images) && images.length > 0 ? images[0] : fallback;
  }

  private tourPost(tour: any) {
    return {
      id: `tour-${tour.id}`,
      sourceType: 'TOUR',
      sourceId: tour.id,
      title: `Kinh nghiệm khám phá ${tour.name}`,
      excerpt: this.excerpt(tour.description),
      category: 'Tour',
      date: tour.updatedAt,
      readTime: `${Math.max(3, Math.ceil((tour.description || '').length / 700))} phút đọc`,
      coverImage: this.cover(tour.images, 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80'),
      author: {
        id: tour.owner?.id,
        name: tour.owner?.name || 'VietJourney',
        avatar: tour.owner?.avatar || 'https://ui-avatars.com/api/?name=VietJourney',
        role: tour.owner?.role || 'OWNER',
      },
      content: [
        `<p>${this.escapeHtml(tour.description || 'Thông tin tour đang được cập nhật.')}</p>`,
        tour.includes?.length
          ? `<h3>Dịch vụ bao gồm</h3><ul>${tour.includes
              .map((item) => `<li>${this.escapeHtml(String(item))}</li>`)
              .join('')}</ul>`
          : '',
        tour.excludes?.length
          ? `<h3>Lưu ý chi phí chưa bao gồm</h3><ul>${tour.excludes
              .map((item) => `<li>${this.escapeHtml(String(item))}</li>`)
              .join('')}</ul>`
          : '',
      ].join(''),
      href: `/tours/${tour.id}`,
    };
  }

  private hotelPost(hotel: any) {
    const minPrice = hotel.rooms?.length ? Math.min(...hotel.rooms.map((room) => Number(room.basePrice))) : 0;

    return {
      id: `hotel-${hotel.id}`,
      sourceType: 'HOTEL',
      sourceId: hotel.id,
      title: `Gợi ý lưu trú tại ${hotel.name}`,
      excerpt: this.excerpt(hotel.description),
      category: hotel.type || 'Homestay',
      date: hotel.updatedAt,
      readTime: `${Math.max(3, Math.ceil((hotel.description || '').length / 700))} phút đọc`,
      coverImage: this.cover(hotel.images, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80'),
      author: {
        id: hotel.owner?.id,
        name: hotel.owner?.name || 'VietJourney Host',
        avatar: hotel.owner?.avatar || 'https://ui-avatars.com/api/?name=Host',
        role: hotel.owner?.role || 'OWNER',
      },
      content: [
        `<p>${this.escapeHtml(hotel.description || 'Thông tin homestay đang được cập nhật.')}</p>`,
        `<h3>Vị trí</h3><p>${this.escapeHtml(`${hotel.address}, ${hotel.city}, ${hotel.country}`)}</p>`,
        minPrice ? `<h3>Giá tham khảo</h3><p>Từ ${minPrice.toLocaleString('vi-VN')}₫/đêm.</p>` : '',
        hotel.amenities?.length
          ? `<h3>Tiện nghi nổi bật</h3><ul>${hotel.amenities
              .map(({ amenity }) => `<li>${this.escapeHtml(amenity.name)}</li>`)
              .join('')}</ul>`
          : '',
      ].join(''),
      href: `/homestays/${hotel.id}`,
    };
  }

  async findAll() {
    const [tours, hotels] = await Promise.all([
      this.prisma.tour.findMany({
        where: { approvalStatus: TourApprovalStatus.APPROVED },
        include: { owner: { select: { id: true, name: true, avatar: true, role: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 8,
      }),
      this.prisma.hotel.findMany({
        where: { approvalStatus: HotelApprovalStatus.APPROVED },
        include: {
          rooms: { select: { basePrice: true } },
          amenities: { include: { amenity: true } },
          owner: { select: { id: true, name: true, avatar: true, role: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 8,
      }),
    ]);

    return [...tours.map((tour) => this.tourPost(tour)), ...hotels.map((hotel) => this.hotelPost(hotel))].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  async findOne(id: string) {
    if (id.startsWith('tour-')) {
      const sourceId = id.replace('tour-', '');
      const tour = await this.prisma.tour.findFirst({
        where: { id: sourceId, approvalStatus: TourApprovalStatus.APPROVED },
        include: { owner: { select: { id: true, name: true, avatar: true, role: true } } },
      });
      if (!tour) throw new NotFoundException('Không tìm thấy bài viết');
      return this.tourPost(tour);
    }

    if (id.startsWith('hotel-')) {
      const sourceId = id.replace('hotel-', '');
      const hotel = await this.prisma.hotel.findFirst({
        where: { id: sourceId, approvalStatus: HotelApprovalStatus.APPROVED },
        include: {
          rooms: { select: { basePrice: true } },
          amenities: { include: { amenity: true } },
          owner: { select: { id: true, name: true, avatar: true, role: true } },
        },
      });
      if (!hotel) throw new NotFoundException('Không tìm thấy bài viết');
      return this.hotelPost(hotel);
    }

    throw new NotFoundException('Không tìm thấy bài viết');
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HotelApprovalStatus, HotelType } from '@prisma/client';

export class CreateHotelDto {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  lat?: number;
  lng?: number;
  type?: HotelType;
  images?: string[];
  policies?: any;
}

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

  async create(createHotelDto: CreateHotelDto, ownerId: string) {
    return this.prisma.hotel.create({
      data: {
        ...createHotelDto,
        ownerId,
        approvalStatus: HotelApprovalStatus.PENDING_REVIEW,
        approvalNote: null,
        reviewedAt: null,
      },
    });
  }

  async findAll(query: any) {
    const { city, type } = query;
    const where: any = { approvalStatus: HotelApprovalStatus.APPROVED };
    
    if (city) {
      where.city = { contains: city };
    }
    if (type) {
      where.type = type;
    }

    return this.prisma.hotel.findMany({
      where,
      include: {
        amenities: {
          include: {
            amenity: true
          }
        },
        rooms: {
          select: {
            basePrice: true,
          },
          orderBy: {
            basePrice: 'asc'
          },
          take: 1
        }
      },
      orderBy: {
        rating: 'desc'
      }
    });
  }

  async findOne(id: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id },
      include: {
        amenities: {
          include: {
            amenity: true
          }
        },
        rooms: true,
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

    if (!hotel) {
      throw new NotFoundException('Không tìm thấy cơ sở lưu trú này');
    }
    if (hotel.approvalStatus !== HotelApprovalStatus.APPROVED) {
      throw new NotFoundException('Không tìm thấy cơ sở lưu trú này');
    }
    return hotel;
  }

  async update(id: string, updateData: any, ownerId: string) {
    const hotel = await this.findOne(id);
    if (hotel.ownerId !== ownerId) {
      throw new NotFoundException('Bạn không có quyền chỉnh sửa cơ sở này');
    }

    return this.prisma.hotel.update({
      where: { id },
      data: {
        ...updateData,
        approvalStatus: HotelApprovalStatus.PENDING_REVIEW,
        approvalNote: null,
        reviewedAt: null,
      },
    });
  }

  async remove(id: string, ownerId: string) {
    const hotel = await this.findOne(id);
    if (hotel.ownerId !== ownerId) {
      throw new NotFoundException('Bạn không có quyền xóa cơ sở này');
    }

    return this.prisma.hotel.update({
      where: { id },
      data: { approvalStatus: HotelApprovalStatus.ARCHIVED },
    });
  }
}

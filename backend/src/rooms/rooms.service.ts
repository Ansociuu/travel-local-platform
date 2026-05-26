import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { HotelApprovalStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class CreateRoomDto {
  hotelId: string;
  name: string;
  description?: string;
  type?: string;
  basePrice: number;
  capacity?: number;
  totalRooms?: number;
  images?: string[];
}

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  private async verifyHotelOwner(hotelId: string, userId: string) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('Khách sạn không tồn tại');
    if (hotel.ownerId !== userId) throw new UnauthorizedException('Bạn không có quyền thao tác trên khách sạn này');
  }

  async create(createRoomDto: CreateRoomDto, ownerId: string) {
    await this.verifyHotelOwner(createRoomDto.hotelId, ownerId);
    
    const room = await this.prisma.room.create({
      data: createRoomDto,
    });

    await this.prisma.hotel.update({
      where: { id: createRoomDto.hotelId },
      data: { approvalStatus: HotelApprovalStatus.PENDING_REVIEW, approvalNote: null, reviewedAt: null },
    });

    return room;
  }

  async findAllByHotel(hotelId: string) {
    return this.prisma.room.findMany({
      where: { hotelId },
      include: {
        amenities: {
          include: { amenity: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        hotel: { select: { ownerId: true, name: true } },
        amenities: {
          include: { amenity: true }
        }
      }
    });
    if (!room) throw new NotFoundException('Phòng không tồn tại');
    return room;
  }

  async update(id: string, updateData: any, ownerId: string) {
    const room = await this.findOne(id);
    if (room.hotel.ownerId !== ownerId) {
      throw new UnauthorizedException('Bạn không có quyền chỉnh sửa phòng này');
    }

    const updated = await this.prisma.room.update({
      where: { id },
      data: updateData,
    });

    await this.prisma.hotel.update({
      where: { id: room.hotelId },
      data: { approvalStatus: HotelApprovalStatus.PENDING_REVIEW, approvalNote: null, reviewedAt: null },
    });

    return updated;
  }

  async remove(id: string, ownerId: string) {
    const room = await this.findOne(id);
    if (room.hotel.ownerId !== ownerId) {
      throw new UnauthorizedException('Bạn không có quyền xóa phòng này');
    }

    const bookingRooms = await this.prisma.bookingRoom.count({ where: { roomId: id } });
    if (bookingRooms > 0) {
      throw new UnauthorizedException('Không thể xóa phòng đã từng có booking');
    }

    const deleted = await this.prisma.room.delete({
      where: { id },
    });

    await this.prisma.hotel.update({
      where: { id: room.hotelId },
      data: { approvalStatus: HotelApprovalStatus.PENDING_REVIEW, approvalNote: null, reviewedAt: null },
    });

    return deleted;
  }
}

import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  private async assertAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') throw new ForbiddenException('Only admin can manage coupons');
  }

  async create(userId: string, data: any) {
    await this.assertAdmin(userId);
    return this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description || '',
        discountType: data.discountType || 'PERCENTAGE',
        value: parseFloat(data.value),
        minOrder: data.minOrder ? parseFloat(data.minOrder) : null,
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        usedCount: 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      }
    });
  }

  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { startDate: 'desc' }
    });
  }

  async findPublicActive() {
    const now = new Date();
    const coupons = await this.prisma.coupon.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { endDate: 'asc' },
    });
    return coupons.filter((coupon) => coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit);
  }

  async update(userId: string, id: string, data: any) {
    await this.assertAdmin(userId);
    const updateData: any = {};
    if (data.code) updateData.code = data.code.toUpperCase();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.discountType) updateData.discountType = data.discountType;
    if (data.value !== undefined) updateData.value = parseFloat(data.value);
    if (data.minOrder !== undefined) updateData.minOrder = data.minOrder ? parseFloat(data.minOrder) : null;
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount ? parseFloat(data.maxDiscount) : null;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit ? parseInt(data.usageLimit) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.prisma.coupon.update({
      where: { id },
      data: updateData
    });
  }

  async remove(userId: string, id: string) {
    await this.assertAdmin(userId);
    return this.prisma.coupon.delete({ where: { id } });
  }

  async validate(code: string, orderAmount: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    
    if (!coupon || !coupon.isActive) throw new BadRequestException('Mã giảm giá không tồn tại hoặc đã bị vô hiệu hoá');
    
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new BadRequestException('Mã giảm giá đã hết hạn hoặc chưa có hiệu lực');
    }
    
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }
    
    if (coupon.minOrder !== null && orderAmount < Number(coupon.minOrder)) {
      throw new BadRequestException(`Đơn hàng phải từ ${Number(coupon.minOrder).toLocaleString('vi-VN')}₫ để áp dụng mã này`);
    }
    
    let discount = 0;
    const value = Number(coupon.value);
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderAmount * value) / 100;
      if (coupon.maxDiscount !== null && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    } else {
      discount = value;
    }
    
    // Ensure discount doesn't exceed order amount
    if (discount > orderAmount) discount = orderAmount;
    
    return {
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      value: value,
      discountAmount: discount,
      finalAmount: orderAmount - discount
    };
  }
}

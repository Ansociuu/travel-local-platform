import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { HotelsService, CreateHotelDto } from './hotels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createHotelDto: CreateHotelDto, @Request() req) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Chỉ chủ homestay mới có quyền tạo cơ sở lưu trú');
    }
    return this.hotelsService.create(createHotelDto, req.user.id);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.hotelsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateData: any, @Request() req) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Chỉ chủ homestay mới có quyền chỉnh sửa cơ sở lưu trú');
    }
    return this.hotelsService.update(id, updateData, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    if (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Chỉ chủ homestay mới có quyền xóa cơ sở lưu trú');
    }
    return this.hotelsService.remove(id, req.user.id);
  }
}

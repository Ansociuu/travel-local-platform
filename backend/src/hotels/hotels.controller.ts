import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { HotelsService, CreateHotelDto } from './hotels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createHotelDto: CreateHotelDto, @Request() req) {
    // Tạm thời chỉ cần là USER đăng nhập là được tạo (thực tế sẽ cần role OWNER/ADMIN)
    return this.hotelsService.create(createHotelDto, req.user.sub);
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
    return this.hotelsService.update(id, updateData, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.hotelsService.remove(id, req.user.sub);
  }
}

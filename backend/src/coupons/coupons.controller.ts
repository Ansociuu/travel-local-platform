import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('public')
  findPublic() {
    return this.couponsService.findPublicActive();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createCouponDto: any) {
    return this.couponsService.create(req.user.id, createCouponDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateCouponDto: any) {
    return this.couponsService.update(req.user.id, id, updateCouponDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.couponsService.remove(req.user.id, id);
  }

  @Post('validate')
  validate(@Body() body: { code: string, orderAmount: number }) {
    return this.couponsService.validate(body.code, body.orderAmount);
  }
}

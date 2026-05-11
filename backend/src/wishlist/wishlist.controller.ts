import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post('toggle')
  toggle(@Request() req, @Body() createWishlistDto: CreateWishlistDto) {
    return this.wishlistService.toggle(req.user.id, createWishlistDto);
  }

  @Get('me')
  findMyWishlist(@Request() req) {
    return this.wishlistService.findMyWishlist(req.user.id);
  }
}

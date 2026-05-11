import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMyReviews(@Request() req) {
    return this.reviewsService.findMyReviews(req.user.id);
  }

  @Get('hotel/:id')
  findByHotel(@Param('id') id: string) {
    return this.reviewsService.findByHotel(id);
  }

  @Get('tour/:id')
  findByTour(@Param('id') id: string) {
    return this.reviewsService.findByTour(id);
  }
}

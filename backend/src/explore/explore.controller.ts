import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { ExploreService } from './explore.service';

@Controller('explore')
export class ExploreController {
  constructor(private readonly exploreService: ExploreService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.exploreService.findAll(query);
  }

  @Post('view')
  trackView(@Body() body: { hotelId?: string; tourId?: string }, @Request() req: any) {
    return this.exploreService.trackView(body, req?.user?.id);
  }
}

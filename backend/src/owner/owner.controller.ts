import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnerService } from './owner.service';

@UseGuards(JwtAuthGuard)
@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post('applications')
  createApplication(@Request() req, @Body() body: any) {
    return this.ownerService.createApplication(req.user.id, body);
  }

  @Get('applications/me')
  getMyApplication(@Request() req) {
    return this.ownerService.getMyApplication(req.user.id);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.ownerService.getStats(req.user.id);
  }

  @Get('hotels')
  getHotels(@Request() req) {
    return this.ownerService.getHotels(req.user.id);
  }

  @Post('hotels')
  createHotel(@Request() req, @Body() body: any) {
    return this.ownerService.createHotel(req.user.id, body);
  }

  @Patch('hotels/:hotelId')
  updateHotel(@Request() req, @Param('hotelId') hotelId: string, @Body() body: any) {
    return this.ownerService.updateHotel(req.user.id, hotelId, body);
  }

  @Delete('hotels/:hotelId')
  archiveHotel(@Request() req, @Param('hotelId') hotelId: string) {
    return this.ownerService.archiveHotel(req.user.id, hotelId);
  }

  @Get('tours')
  getTours(@Request() req) {
    return this.ownerService.getTours(req.user.id);
  }

  @Post('tours')
  createTour(@Request() req, @Body() body: any) {
    return this.ownerService.createTour(req.user.id, body);
  }

  @Patch('tours/:tourId')
  updateTour(@Request() req, @Param('tourId') tourId: string, @Body() body: any) {
    return this.ownerService.updateTour(req.user.id, tourId, body);
  }

  @Delete('tours/:tourId')
  archiveTour(@Request() req, @Param('tourId') tourId: string) {
    return this.ownerService.archiveTour(req.user.id, tourId);
  }

  @Get('hotels/:hotelId/rooms')
  getRooms(@Request() req, @Param('hotelId') hotelId: string) {
    return this.ownerService.getRooms(req.user.id, hotelId);
  }

  @Post('hotels/:hotelId/rooms')
  createRoom(@Request() req, @Param('hotelId') hotelId: string, @Body() body: any) {
    return this.ownerService.createRoom(req.user.id, hotelId, body);
  }

  @Patch('hotels/:hotelId/rooms/:roomId')
  updateRoom(
    @Request() req,
    @Param('hotelId') hotelId: string,
    @Param('roomId') roomId: string,
    @Body() body: any,
  ) {
    return this.ownerService.updateRoom(req.user.id, hotelId, roomId, body);
  }

  @Delete('hotels/:hotelId/rooms/:roomId')
  deleteRoom(@Request() req, @Param('hotelId') hotelId: string, @Param('roomId') roomId: string) {
    return this.ownerService.deleteRoom(req.user.id, hotelId, roomId);
  }

  @Get('hotels/:hotelId/rooms/:roomId/availability')
  getRoomAvailability(
    @Request() req,
    @Param('hotelId') hotelId: string,
    @Param('roomId') roomId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.ownerService.getRoomAvailability(req.user.id, hotelId, roomId, startDate, endDate);
  }

  @Post('hotels/:hotelId/rooms/:roomId/availability')
  setRoomAvailability(
    @Request() req,
    @Param('hotelId') hotelId: string,
    @Param('roomId') roomId: string,
    @Body() body: { data: any[] },
  ) {
    return this.ownerService.setRoomAvailability(req.user.id, hotelId, roomId, body.data);
  }

  @Get('bookings')
  getBookings(@Request() req) {
    return this.ownerService.getBookings(req.user.id);
  }

  @Patch('bookings/:bookingId/status')
  updateBookingStatus(@Request() req, @Param('bookingId') bookingId: string, @Body() body: { status: string }) {
    return this.ownerService.updateBookingStatus(req.user.id, bookingId, body.status);
  }
}

import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats(@Request() req) {
    return this.adminService.getOverviewStats(req.user.id);
  }

  // --- Bookings ---
  @Get('bookings')
  getAllBookings(@Request() req) {
    return this.adminService.getAllBookings(req.user.id);
  }

  @Patch('bookings/:id/status')
  updateBookingStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.adminService.updateBookingStatus(req.user.id, id, body.status);
  }

  // --- Users ---
  @Get('users')
  getAllUsers(@Request() req) {
    return this.adminService.getAllUsers(req.user.id);
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { role: string },
  ) {
    return this.adminService.updateUserRole(req.user.id, id, body.role);
  }

  // --- Tours CRUD ---
  @Get('tours')
  getAllTours(@Request() req) {
    return this.adminService.getAllTours(req.user.id);
  }

  @Post('tours')
  createTour(@Request() req, @Body() body: any) {
    return this.adminService.createTour(req.user.id, body);
  }

  @Patch('tours/:id')
  updateTour(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.adminService.updateTour(req.user.id, id, body);
  }

  @Delete('tours/:id')
  deleteTour(@Request() req, @Param('id') id: string) {
    return this.adminService.deleteTour(req.user.id, id);
  }

  // --- Hotels/Homestays CRUD ---
  @Get('hotels')
  getAllHotels(@Request() req) {
    return this.adminService.getAllHotels(req.user.id);
  }

  @Post('hotels')
  createHotel(@Request() req, @Body() body: any) {
    return this.adminService.createHotel(req.user.id, body);
  }

  @Patch('hotels/:id')
  updateHotel(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.adminService.updateHotel(req.user.id, id, body);
  }

  @Delete('hotels/:id')
  deleteHotel(@Request() req, @Param('id') id: string) {
    return this.adminService.deleteHotel(req.user.id, id);
  }
}

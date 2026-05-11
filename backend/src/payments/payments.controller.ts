import { Controller, Post, Get, Body, Query, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('vnpay/create-url')
  createVNPayUrl(@Body() body: { bookingId: string }, @Req() req: Request) {
    const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const origin = req.headers.origin || 'http://localhost:3000';
    return this.paymentsService.createVNPayUrl(body.bookingId, ipAddr as string, origin);
  }

  @Get('vnpay/vnpay_return')
  verifyVNPayReturn(@Query() query: any) {
    // This is called when user returns from VNPay to our site
    // Normally we should also have an IPN webhook endpoint, but for MVP we use ReturnUrl
    return this.paymentsService.verifyVNPayReturn(query);
  }
}

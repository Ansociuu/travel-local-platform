import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createVNPayUrl(bookingId: string, ipAddr: string, origin: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new BadRequestException('Booking not found');

    const tmnCode = process.env.VNP_TMNCODE || 'DUMMYCODE';
    const secretKey = process.env.VNP_HASHSECRET || 'DUMMYSECRET';
    const vnpUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl = process.env.VNP_RETURNURL || `${origin}/success`;

    let vnp_Params: any = {};
    const date = new Date();
    const createDate = this.formatDate(date);
    const orderId = booking.shortId + '_' + createDate; // Unique reference

    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + booking.shortId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = Number(booking.totalAmount) * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    const signData = this.sortAndStringify(vnp_Params, false);
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex'); 
    
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = vnpUrl + '?' + this.sortAndStringify(vnp_Params, true);

    // Create a pending Payment record
    await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        provider: 'VNPAY',
        method: 'VNPAY',
        status: 'PENDING',
        transactionId: orderId, // storing unique ref to map back in return
      }
    });

    return { paymentUrl };
  }

  async verifyVNPayReturn(query: any) {
    let vnp_Params = { ...query };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const signData = this.sortAndStringify(vnp_Params, false);

    const secretKey = process.env.VNP_HASHSECRET || 'DUMMYSECRET';
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');     

    if (secureHash === signed) {
      const orderId = vnp_Params['vnp_TxnRef'];
      const rspCode = vnp_Params['vnp_ResponseCode'];
      
      const payment = await this.prisma.payment.findUnique({ where: { transactionId: orderId } });
      
      if (payment) {
        if (rspCode === '00') {
          // Success
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'SUCCESS' }
          });
          await this.prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'CONFIRMED', paymentStatus: 'PAID' }
          });
          return { code: '00', message: 'Success', bookingId: payment.bookingId };
        } else {
          // Failed
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' }
          });
          await this.prisma.booking.update({
            where: { id: payment.bookingId },
            data: { paymentStatus: 'FAILED' }
          });
          return { code: rspCode, message: 'Payment failed', bookingId: payment.bookingId };
        }
      }
    } else {
      throw new BadRequestException('Invalid signature');
    }
  }

  private sortAndStringify(obj: any, encode: boolean) {
    let keys = Object.keys(obj).sort();
    let qs: string[] = [];
    for (let key of keys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
        const val = encode 
          ? encodeURIComponent(String(obj[key])).replace(/%20/g, '+')
          : String(obj[key]);
        qs.push(encodeURIComponent(key) + '=' + val);
      }
    }
    return qs.join('&');
  }

  private formatDate(date: Date) {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }

  async getSepayPaymentInfo(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new BadRequestException('Booking not found');

    const bankBin = process.env.SEPAY_BANK_BIN || '970422';
    const accountNumber = process.env.SEPAY_ACCOUNT_NUMBER || '038283xxxx';
    const accountName = process.env.SEPAY_ACCOUNT_NAME || 'YOUR BANK ACCOUNT NAME';
    const qrTemplate = process.env.SEPAY_QR_TEMPLATE || 'compact2';
    const memo = booking.shortId;

    const qrUrl = `https://img.vietqr.io/image/${bankBin}-${accountNumber}-${qrTemplate}.png?amount=${booking.totalAmount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(accountName)}`;

    return {
      bookingId: booking.id,
      shortId: booking.shortId,
      totalAmount: booking.totalAmount,
      bankBin,
      accountNumber,
      accountName,
      memo,
      qrUrl
    };
  }

  async getBookingStatus(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, shortId: true, status: true, paymentStatus: true }
    });
    if (!booking) throw new BadRequestException('Booking not found');
    return booking;
  }

  async handleSepayWebhook(body: any) {
    if (body.transferType !== 'in') {
      return { success: true, message: 'Ignored outgoing transaction' };
    }

    const amount = Number(body.transferAmount);
    const transactionContent = body.content || body.description || body.transactionContent || '';
    const sepayTransactionId = String(body.id);

    // 1. Sanitize transfer content: remove all non-alphanumeric chars
    const cleanContent = transactionContent.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // 2. Fetch all pending/unpaid bookings
    const pendingBookings = await this.prisma.booking.findMany({
      where: {
        status: 'PENDING',
        paymentStatus: { in: ['UNPAID', 'PARTIAL'] }
      }
    });

    // 3. Match booking by sanitized shortId
    let booking: any = null;
    for (const b of pendingBookings) {
      const cleanShortId = b.shortId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (cleanShortId && cleanContent.includes(cleanShortId)) {
        booking = b;
        break;
      }
    }

    // 4. Fallback: If not found in pending, try matching by splitting words
    if (!booking) {
      const words = transactionContent.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ').split(/\s+/);
      for (const word of words) {
        if (word.length >= 5 && word.length <= 10) {
          // Search in all bookings
          let found = await this.prisma.booking.findFirst({
            where: {
              OR: [
                { shortId: word },
                { shortId: `MT-${word}` },
                { shortId: `BKN-${word}` },
                { shortId: word.startsWith('MT') ? `MT-${word.substring(2)}` : word }
              ]
            }
          });
          if (found) {
            booking = found;
            break;
          }
        }
      }
    }

    if (!booking) {
      return { success: false, message: `Booking not found for content: "${transactionContent}"` };
    }

    if (booking.paymentStatus === 'PAID') {
      return { success: true, message: 'Booking already paid' };
    }

    const existingPayment = await this.prisma.payment.findUnique({
      where: { transactionId: sepayTransactionId }
    });

    if (existingPayment) {
      return { success: true, message: 'Transaction already processed' };
    }

    if (amount < Number(booking.totalAmount)) {
      await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: amount,
          provider: 'SEPAY',
          method: 'TRANSFER',
          status: 'PARTIAL',
          transactionId: sepayTransactionId,
        }
      });

      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: 'PARTIAL' }
      });

      return { success: true, message: 'Underpaid. Marked as partial' };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID'
        }
      });

      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: amount,
          provider: 'SEPAY',
          method: 'TRANSFER',
          status: 'SUCCESS',
          transactionId: sepayTransactionId,
        }
      });
    });

    return { success: true, message: 'Payment confirmed successfully' };
  }
}

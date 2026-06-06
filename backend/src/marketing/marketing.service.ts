import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);
  // Lưu giữ email đã gửi trong RAM để tránh gửi trùng lặp mỗi 5 phút trong bản Demo
  private readonly sentEmails = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  // Chạy mỗi 5 phút (*/5 * * * *)
  @Cron('*/5 * * * *')
  async handleCron() {
    this.logger.debug('Marketing Cron Job Đang quét người dùng để gửi email chăm sóc...');

    try {
      // Tìm các user đã xác thực email
      const verifiedUsers = await this.prisma.user.findMany({
        where: {
          isVerified: true,
        },
        select: {
          email: true,
        },
      });

      // Lọc ra các user chưa được gửi trong phiên chạy (RAM) này
      const targetEmails = verifiedUsers
        .map(user => user.email)
        .filter(email => !this.sentEmails.has(email));

      if (targetEmails.length === 0) {
        this.logger.debug('Không có user mới nào cần nhận email Marketing.');
        return;
      }

      this.logger.log(`Đang gửi thư cho ${targetEmails.length} người dùng...`);

      // Gửi email
      await this.mailService.sendMarketingBlast(targetEmails);

      // Lưu lại vào Set để không gửi lại nữa
      targetEmails.forEach(email => this.sentEmails.add(email));

      this.logger.log('Đã gửi xong chiến dịch Marketing.');
    } catch (error) {
      this.logger.error('Lỗi khi chạy Marketing Cron Job', error);
    }
  }
}

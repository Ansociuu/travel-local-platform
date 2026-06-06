import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  providers: [MarketingService],
})
export class MarketingModule {}

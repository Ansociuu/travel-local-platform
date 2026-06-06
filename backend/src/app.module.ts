import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { UploadModule } from './upload/upload.module';
import { HotelsModule } from './hotels/hotels.module';
import { RoomsModule } from './rooms/rooms.module';
import { ToursModule } from './tours/tours.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './chat/chat.module';
import { OwnerModule } from './owner/owner.module';
import { BlogModule } from './blog/blog.module';
import { MarketingModule } from './marketing/marketing.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, 
    UsersModule, 
    AuthModule, 
    MailModule,
    UploadModule,
    HotelsModule,
    RoomsModule,
    ToursModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    WishlistModule,
    AdminModule,
    ChatModule,
    OwnerModule,
    BlogModule,
    ScheduleModule.forRoot(),
    MarketingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TranslationService } from './translation.service';
import { AiChatService } from './ai-chat.service';
import { AiController } from './ai.controller';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'mood-travel-secret-key-2026',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [ChatController, AiController],
  providers: [ChatGateway, ChatService, TranslationService, AiChatService],
  exports: [AiChatService],
})
export class ChatModule {}

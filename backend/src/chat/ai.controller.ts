import { Controller, Post, Body } from '@nestjs/common';
import { IsString, IsArray, IsOptional } from 'class-validator';
import { AiChatService } from './ai-chat.service';

class QuickChatDto {
  @IsString()
  message: string;

  @IsArray()
  @IsOptional()
  history?: any[];
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('quick-chat')
  async quickChat(@Body() body: QuickChatDto) {
    const reply = await this.aiChatService.getQuickReply(body.message || '', body.history || []);
    return { reply };
  }
}

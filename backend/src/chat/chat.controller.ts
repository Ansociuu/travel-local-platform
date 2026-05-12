import { Controller, Get, Post, Param, Query, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@Req() req: any) {
    return this.chatService.getConversations(req.user.id);
  }

  @Post('conversations')
  async createConversation(@Req() req: any, @Body() body: { participantId: string }) {
    return this.chatService.getOrCreateConversation(req.user.id, body.participantId);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Req() req: any,
    @Param('id') id: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.chatService.getMessages(id, req.user.id, parseInt(take || '50'), parseInt(skip || '0'));
  }

  @Get('unread')
  async getUnreadCount(@Req() req: any) {
    const count = await this.chatService.getUnreadCount(req.user.id);
    return { count };
  }

  @Get('users/search')
  async searchUsers(@Req() req: any, @Query('q') q: string) {
    return this.chatService.searchUsers(q || '', req.user.id);
  }
}

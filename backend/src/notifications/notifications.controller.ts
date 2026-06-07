import { Controller, Get, Patch, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMine(@Request() req: any, @Query('take') take?: string) {
    return this.notificationsService.findForUser(req.user.id, take ? Math.min(Number(take) || 20, 50) : 20);
  }

  @Get('unread-count')
  async unreadCount(@Request() req: any) {
    const unreadCount = await this.notificationsService.getUnreadCount(req.user.id);
    return { unreadCount };
  }

  @Patch(':id/read')
  markRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markRead(req.user.id, id);
  }

  @Patch('read-all')
  markAllRead(@Request() req: any) {
    return this.notificationsService.markAllRead(req.user.id);
  }
}

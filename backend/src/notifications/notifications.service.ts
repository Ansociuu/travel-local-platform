import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';

export type NotificationType =
  | 'BOOKING_CREATED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_COMPLETED'
  | 'NEW_MESSAGE'
  | 'NEW_REVIEW'
  | 'OWNER_APPROVED'
  | 'OWNER_REJECTED'
  | 'OWNER_APPLICATION_REQUESTED'
  | 'OWNER_APPLICATION_SUBMITTED'
  | 'PAYMENT_RECEIVED'
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED'
  | 'LISTING_REVIEW_REQUESTED'
  | 'LISTING_REVIEW_SUBMITTED'
  | 'REVIEW_REPLY';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType | string;
  title: string;
  content: string;
  link?: string | null;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  async create(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        content: input.content,
        link: input.link || null,
      },
    });

    this.realtime.emitToUser(input.userId, 'notification:new', notification);
    const unreadCount = await this.getUnreadCount(input.userId);
    this.realtime.emitToUser(input.userId, 'notification:unread-count', { unreadCount });

    return notification;
  }

  async createMany(inputs: CreateNotificationInput[]) {
    const uniqueInputs = inputs.filter((item, index, arr) =>
      item.userId && arr.findIndex((candidate) =>
        candidate.userId === item.userId &&
        candidate.type === item.type &&
        candidate.title === item.title &&
        candidate.content === item.content &&
        candidate.link === item.link
      ) === index
    );

    return Promise.all(uniqueInputs.map((input) => this.create(input)));
  }

  findForUser(userId: string, take = 20) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async markRead(userId: string, id: string) {
    const notification = await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
    const unreadCount = await this.getUnreadCount(userId);
    this.realtime.emitToUser(userId, 'notification:unread-count', { unreadCount });
    return { updated: notification.count, unreadCount };
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    this.realtime.emitToUser(userId, 'notification:unread-count', { unreadCount: 0 });
    return { updated: result.count, unreadCount: 0 };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateConversation(userId1: string, userId2: string) {
    // Find existing conversation between these two users
    const conversations = await this.prisma.conversation.findMany({
      where: {
        AND: [
          { participants: { path: '$', array_contains: userId1 } },
          { participants: { path: '$', array_contains: userId2 } },
        ],
      },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (conversations.length > 0) {
      return conversations[0];
    }

    return this.prisma.conversation.create({
      data: {
        participants: [userId1, userId2],
      },
    });
  }

  async getConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: { path: '$', array_contains: userId },
      },
      orderBy: { lastAt: 'desc' },
    });

    // Enrich with participant info and unread count
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const participantIds = conv.participants as string[];
        const otherIds = participantIds.filter((id) => id !== userId);

        const otherUsers = await this.prisma.user.findMany({
          where: { id: { in: otherIds } },
          select: { id: true, name: true, avatar: true, role: true },
        });

        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            read: false,
          },
        });

        return { ...conv, otherUsers, unreadCount };
      }),
    );

    return enriched;
  }

  async getMessages(conversationId: string, userId: string, take = 50, skip = 0) {
    // Verify user is participant
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv) return [];
    const participants = conv.participants as string[];
    if (!participants.includes(userId)) return [];

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take,
      skip,
    });
  }

  async createMessage(conversationId: string, senderId: string, content: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv) throw new Error('Conversation not found');
    const participants = conv.participants as string[];
    if (!participants.includes(senderId)) throw new Error('Not a participant');

    const message = await this.prisma.message.create({
      data: { conversationId, senderId, content },
    });

    // Update conversation lastMessage
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: content, lastAt: new Date() },
    });

    return message;
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    const conversations = await this.prisma.conversation.findMany({
      where: { participants: { path: '$', array_contains: userId } },
      select: { id: true },
    });

    const convIds = conversations.map((c) => c.id);
    if (convIds.length === 0) return 0;

    return this.prisma.message.count({
      where: {
        conversationId: { in: convIds },
        senderId: { not: userId },
        read: false,
      },
    });
  }

  async getUserInfo(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, avatar: true, role: true },
    });
  }

  async searchUsers(query: string, currentUserId: string) {
    return this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
        ],
      },
      select: { id: true, name: true, avatar: true, email: true, role: true },
      take: 10,
    });
  }
}

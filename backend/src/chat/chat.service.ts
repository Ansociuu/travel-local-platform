import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationService } from './translation.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private translationService: TranslationService,
  ) {}

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

  async createMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: any = 'TEXT',
    fileUrl?: string,
    replyToId?: string
  ) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv) throw new Error('Conversation not found');
    const participants = conv.participants as string[];
    if (!participants.includes(senderId)) throw new Error('Not a participant');

    // Get sender language
    const sender = await this.prisma.user.findUnique({ where: { id: senderId }, select: { preferredLanguage: true } });
    const senderLang = sender?.preferredLanguage || 'en';

    const message = await this.prisma.message.create({
      data: { 
        conversationId, 
        senderId, 
        content,
        type,
        fileUrl,
        replyToId,
        originalLanguage: senderLang,
      },
    });

    // Update conversation lastMessage
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: content, lastAt: new Date() },
    });

    return message;
  }

  async translateMessageAsync(messageId: string) {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
      });
      if (!message) return null;

      // Fetch conversation separately (avoid include issues)
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: message.conversationId },
      });
      if (!conversation) return null;

      const participants = conversation.participants as string[];
      const senderLang = message.originalLanguage || 'en';

      const otherUsers = await this.prisma.user.findMany({
        where: { id: { in: participants.filter((id) => id !== message.senderId) } },
        select: { preferredLanguage: true },
      });

      const targetLangs = [
        ...new Set(otherUsers.map((u) => u.preferredLanguage || 'en')),
      ].filter((lang) => lang !== senderLang);

      console.log(`[Translation] messageId=${messageId} senderLang=${senderLang} targetLangs=${targetLangs}`);

      if (targetLangs.length === 0) {
        console.log(`[Translation] No translation needed (same language)`);
        return null;
      }

      const existingTranslations: Record<string, string> =
        message.translatedContent ? (message.translatedContent as Record<string, string>) : {};

      let detectedSourceLanguage = senderLang;
      let hasNewTranslation = false;

      for (const targetLang of targetLangs) {
        if (existingTranslations[targetLang]) continue;

        const { translatedText, detectedSourceLanguage: detected } =
          await this.translationService.translateText(message.content, targetLang);

        // Skip if translation is identical to original (means same language was detected)
        if (translatedText === message.content) {
          console.log(`[Translation] Skipped [${targetLang}]: same as original (likely same language)`);
          continue;
        }

        existingTranslations[targetLang] = translatedText;
        hasNewTranslation = true;
        if (detected !== 'unknown') detectedSourceLanguage = detected;

        console.log(`[Translation] "${message.content}" -> [${targetLang}]: "${translatedText}"`);
      }

      if (!hasNewTranslation) return null;

      const updated = await this.prisma.message.update({
        where: { id: messageId },
        data: {
          originalLanguage: detectedSourceLanguage,
          translatedContent: existingTranslations,
        },
      });

      console.log(`[Translation] DB updated successfully for messageId=${messageId}`);
      return updated;
    } catch (err) {
      console.error('[Translation] translateMessageAsync error:', err.message);
      return null;
    }
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

  async reactMessage(messageId: string, userId: string, reaction: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) return null;
    
    let reactions = (message.reactions as Record<string, string>) || {};
    if (reactions[userId] === reaction) {
      delete reactions[userId]; // toggle off
    } else {
      reactions[userId] = reaction;
    }
    
    return this.prisma.message.update({
      where: { id: messageId },
      data: { reactions },
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

  async getConversationParticipants(conversationId: string): Promise<string[]> {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    return conv ? (conv.participants as string[]) : [];
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

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Groq from 'groq-sdk';

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);
  private groq: Groq;
  private readonly BOT_ID = 'vietjourney-ai-bot';

  constructor(private prisma: PrismaService) {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async ensureBotUserExists() {
    const existing = await this.prisma.user.findUnique({ where: { id: this.BOT_ID } });
    if (!existing) {
      await this.prisma.user.create({
        data: {
          id: this.BOT_ID,
          email: 'bot@vietjourney.vn',
          name: 'VietJourney Support Bot',
          role: 'ADMIN',
          isVerified: true,
          avatar: 'https://cdn-icons-png.flaticon.com/512/8943/8943377.png',
          password: 'no-password-needed',
        },
      });
      this.logger.log('VietJourney AI Bot created in database.');
    }
    return this.BOT_ID;
  }

  async getQuickReply(userMessage: string): Promise<string> {
    try {
      const systemPrompt = {
        role: 'system',
        content:
          'Ban la tro ly AI cua VietJourney. Tra loi bang tieng Viet ngan gon, than thien, huu ich va uu tien tu van du lich Viet Nam.',
      };

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [systemPrompt, { role: 'user', content: userMessage }] as any,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 200,
      });

      return chatCompletion.choices[0]?.message?.content || 'Xin loi, toi khong the xu ly yeu cau luc nay.';
    } catch (error) {
      this.logger.error('Error getting quick AI reply', error);
      return 'Xin loi, he thong AI dang gap su co. Vui long lien he nhan vien ho tro.';
    }
  }

  async getBotResponse(conversationId: string, userMessage: string): Promise<string> {
    try {
      const [tours, hotels, messages] = await Promise.all([
        this.prisma.tour.findMany({
          where: { approvalStatus: 'APPROVED' as any },
          include: { reviews: { select: { rating: true } } },
          orderBy: { updatedAt: 'desc' },
          take: 6,
        }),
        this.prisma.hotel.findMany({
          where: { approvalStatus: 'APPROVED' as any },
          include: {
            rooms: { select: { basePrice: true }, orderBy: { basePrice: 'asc' }, take: 1 },
            reviews: { select: { rating: true } },
          },
          orderBy: { rating: 'desc' },
          take: 6,
        }),
        this.prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ]);

      const avgRating = (reviews: { rating: number }[]) =>
        reviews.length
          ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
          : 'chua co';

      const travelContext = [
        'Du lieu VietJourney hien co:',
        'Tours:',
        ...tours.map(
          (tour) =>
            `- ${tour.name} | ${tour.location} | tu ${Number(tour.basePrice).toLocaleString('vi-VN')} VND | rating ${avgRating(tour.reviews)} | /tours/${tour.id}`,
        ),
        'Homestays:',
        ...hotels.map(
          (hotel) =>
            `- ${hotel.name} | ${hotel.city} | tu ${Number(hotel.rooms?.[0]?.basePrice || 0).toLocaleString('vi-VN')} VND/dem | rating ${hotel.rating || avgRating(hotel.reviews)} | /homestays/${hotel.id}`,
        ),
      ].join('\n');

      const chatHistory = messages.reverse().map((msg) => ({
        role: msg.senderId === this.BOT_ID ? 'assistant' : 'user',
        content: msg.content,
      }));

      if (chatHistory.length === 0 || chatHistory[chatHistory.length - 1].content !== userMessage) {
        chatHistory.push({ role: 'user', content: userMessage });
      }

      const systemPrompt = {
        role: 'system',
        content: `Ban la tro ly du lich AI cua VietJourney. Tra loi bang tieng Viet tu nhien, ngan gon va huu ich.
Khi khach hoi goi y tour/homestay, hay uu tien du lieu that ben duoi, neu phu hop thi dua link chi tiet.
Neu khach hoi tinh trang phong/tour theo ngay cu the, hay de nghi mo trang chi tiet de kiem tra lich va dat cho.

${travelContext}`,
      };

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [systemPrompt, ...chatHistory] as any,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 500,
      });

      return chatCompletion.choices[0]?.message?.content || 'Xin loi, toi khong the xu ly yeu cau cua ban luc nay.';
    } catch (error) {
      this.logger.error('Error getting AI response', error);
      return 'Xin loi, he thong AI dang gap su co. Vui long thu lai sau hoac lien he nhan vien ho tro.';
    }
  }
}

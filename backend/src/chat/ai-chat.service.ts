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
          role: 'ADMIN', // Bot can be considered an admin/support staff
          isVerified: true,
          avatar: 'https://cdn-icons-png.flaticon.com/512/8943/8943377.png', // Robot icon
          password: 'no-password-needed',
        }
      });
      this.logger.log('VietJourney AI Bot created in database.');
    }
    return this.BOT_ID;
  }

  async getQuickReply(userMessage: string): Promise<string> {
    try {
      const systemPrompt = {
        role: 'system',
        content: `Bạn là trợ lý AI ảo của VietJourney - Nền tảng đặt phòng Homestay và Tour Du Lịch hàng đầu.
Nhiệm vụ của bạn là hỗ trợ khách hàng trả lời các câu hỏi thường gặp, tư vấn tìm chỗ ở, tour du lịch một cách nhiệt tình, thân thiện và chuyên nghiệp.
Hãy trả lời ngắn gọn, súc tích (1-3 câu), và sử dụng emoji cho sinh động.`,
      };

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [systemPrompt, { role: 'user', content: userMessage }] as any,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 200,
      });

      return chatCompletion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể xử lý yêu cầu lúc này.';
    } catch (error) {
      this.logger.error('Error getting quick AI reply', error);
      return 'Xin lỗi, hệ thống AI đang gặp chút sự cố. Vui lòng liên hệ qua Zalo!';
    }
  }

  async getBotResponse(conversationId: string, userMessage: string): Promise<string> {
    try {
      // 1. Fetch recent conversation history to give AI context
      const messages = await this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Format for Groq (reverse to chronological order)
      const chatHistory = messages.reverse().map(msg => ({
        role: msg.senderId === this.BOT_ID ? 'assistant' : 'user',
        content: msg.content,
      }));

      // Add the current message
      if (chatHistory.length === 0 || chatHistory[chatHistory.length - 1].content !== userMessage) {
         chatHistory.push({ role: 'user', content: userMessage });
      }

      // System Prompt
      const systemPrompt = {
        role: 'system',
        content: `Bạn là trợ lý AI ảo của VietJourney - Nền tảng đặt phòng Homestay và Tour Du Lịch hàng đầu.
Nhiệm vụ của bạn là hỗ trợ khách hàng trả lời các câu hỏi thường gặp, tư vấn tìm chỗ ở, tour du lịch một cách nhiệt tình, thân thiện và chuyên nghiệp.
Hãy trả lời ngắn gọn, súc tích, và sử dụng emoji cho sinh động.
Nếu khách hàng hỏi về giá cả cụ thể hoặc tình trạng phòng theo ngày, hãy hướng dẫn họ sử dụng thanh tìm kiếm trên website vì bạn không truy cập được database trực tiếp ở phiên bản này.`
      };

      // Call Groq API
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [systemPrompt, ...chatHistory] as any,
        model: 'llama-3.3-70b-versatile', // Or 'mixtral-8x7b-32768'
        temperature: 0.7,
        max_tokens: 500,
      });

      return chatCompletion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.';
    } catch (error) {
      this.logger.error('Error getting AI response', error);
      return 'Xin lỗi, hệ thống AI đang gặp chút sự cố. Vui lòng thử lại sau hoặc liên hệ nhân viên qua Zalo.';
    }
  }
}

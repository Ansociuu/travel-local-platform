import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://mood-travel.vercel.app'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'mood-travel-secret-key-2026',
      });

      const userId = payload.sub;
      (client as any).userId = userId;
      this.onlineUsers.set(userId, client.id);

      // Join personal room
      client.join(`user:${userId}`);

      // Notify online status
      this.server.emit('userOnline', { userId });

      console.log(`[Chat] User ${userId} connected`);
    } catch (err) {
      console.log('[Chat] Auth failed:', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId) {
      this.onlineUsers.delete(userId);
      this.server.emit('userOffline', { userId });
      console.log(`[Chat] User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const userId = (client as any).userId;
    if (!userId) return;

    try {
      const message = await this.chatService.createMessage(
        data.conversationId,
        userId,
        data.content,
      );

      const sender = await this.chatService.getUserInfo(userId);

      const payload = { ...message, sender };

      // Emit to all participants in the conversation
      const conv = await this.chatService.getMessages(data.conversationId, userId, 0, 0);
      // Instead, get conversation to find participants
      this.server.to(`conv:${data.conversationId}`).emit('newMessage', payload);

      // Also emit conversationUpdated for sidebar refresh
      this.server.emit('conversationUpdated', {
        conversationId: data.conversationId,
        lastMessage: data.content,
        lastAt: message.createdAt,
      });

      return { success: true, message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = (client as any).userId;
    if (!userId) return;

    client.join(`conv:${data.conversationId}`);

    // Mark messages as read
    await this.chatService.markAsRead(data.conversationId, userId);

    return { success: true };
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conv:${data.conversationId}`);
    return { success: true };
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = (client as any).userId;
    if (!userId) return;

    await this.chatService.markAsRead(data.conversationId, userId);
    return { success: true };
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = (client as any).userId;
    if (!userId) return;

    client.to(`conv:${data.conversationId}`).emit('userTyping', {
      conversationId: data.conversationId,
      userId,
    });
  }

  @SubscribeMessage('stopTyping')
  async handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = (client as any).userId;
    if (!userId) return;

    client.to(`conv:${data.conversationId}`).emit('userStopTyping', {
      conversationId: data.conversationId,
      userId,
    });
  }
}

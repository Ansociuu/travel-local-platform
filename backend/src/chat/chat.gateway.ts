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

      // Channel 1: Conversation room (users who have this chat open)
      this.server.to(`conv:${data.conversationId}`).emit('newMessage', payload);

      // Channel 2 & 3: Emit to each participant's personal room AND direct socket ID
      this.chatService.getConversationParticipants(data.conversationId).then((participantIds) => {
        participantIds.forEach((uid) => {
          // Channel 2: Personal room (always joined on connect)
          this.server.to(`user:${uid}`).emit('newMessage', payload);

          // Channel 3: Direct socket ID (most reliable fallback)
          const socketId = this.onlineUsers.get(uid);
          if (socketId) {
            this.server.to(socketId).emit('newMessage', payload);
          }

          console.log(`[Gateway] newMessage -> uid=${uid}, room=user:${uid}, socketId=${this.onlineUsers.get(uid) || 'offline'}`);
        });
      }).catch((err) => console.error('[Gateway] getParticipants error:', err));

      // Sidebar update for all users
      this.server.emit('conversationUpdated', {
        conversationId: data.conversationId,
        lastMessage: data.content,
        lastAt: message.createdAt,
      });

      // Async translation — does NOT block the message being sent
      this.chatService.translateMessageAsync(message.id).then((updatedMessage) => {
        if (updatedMessage) {
          console.log(`[Gateway] Emitting messageUpdated for ${message.id}`);
          const updatedPayload = {
            ...updatedMessage,
            sender,
            // Ensure translatedContent is a plain object for socket serialization
            translatedContent: updatedMessage.translatedContent
              ? JSON.parse(JSON.stringify(updatedMessage.translatedContent))
              : null,
          };
          // Emit to the conversation room (both participants if both have chat open)
          this.server.to(`conv:${data.conversationId}`).emit('messageUpdated', updatedPayload);
          // Also emit to each participant's personal room as fallback
          const participants = updatedMessage.conversationId
            ? this.chatService.getConversationParticipants(updatedMessage.conversationId)
            : Promise.resolve([]);
          participants.then((ids) => {
            ids.forEach((uid) => {
              this.server.to(`user:${uid}`).emit('messageUpdated', updatedPayload);
            });
          }).catch(() => {});
        }
      }).catch((err) => {
        console.error('[Gateway] translateMessageAsync failed:', err?.message);
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

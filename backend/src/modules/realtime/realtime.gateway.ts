import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { RealtimeService } from './realtime.service';

/**
 * WebSocket Gateway for real-time features
 * Handles connections, rooms, and events
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly realtimeService: RealtimeService) {}

  /**
   * Handle client connection
   */
  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake auth or query
      const token = client.handshake.auth?.token || client.handshake.query?.token;

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token (guest mode)`);
        client.data.userId = null;
        return;
      }

      // Verify token and attach user to socket
      const user = await this.realtimeService.authenticateSocket(token as string);

      if (user) {
        client.data.userId = user.id;
        client.data.user = user;
        this.logger.log(`Client ${client.id} connected as user ${user.id}`);

        // Join user to their personal room
        client.join(`user:${user.id}`);
      } else {
        this.logger.warn(`Client ${client.id} connected with invalid token`);
        client.data.userId = null;
      }
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}: ${error.message}`);
      client.data.userId = null;
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.logger.log(`Client ${client.id} (user ${userId}) disconnected`);
    } else {
      this.logger.log(`Client ${client.id} (guest) disconnected`);
    }

    // Cleanup is automatic (Socket.io removes from all rooms)
  }

  /**
   * Join a reel room to receive real-time updates
   */
  @SubscribeMessage('reel:join')
  handleJoinReel(
    @ConnectedSocket() client: Socket,
    @MessageBody() reelId: string,
  ) {
    if (!reelId) {
      return { error: 'Reel ID is required' };
    }

    const roomName = `reel:${reelId}`;
    client.join(roomName);

    this.logger.log(`Client ${client.id} joined reel room: ${roomName}`);

    return {
      event: 'reel:joined',
      data: { reelId, roomName },
    };
  }

  /**
   * Leave a reel room
   */
  @SubscribeMessage('reel:leave')
  handleLeaveReel(
    @ConnectedSocket() client: Socket,
    @MessageBody() reelId: string,
  ) {
    if (!reelId) {
      return { error: 'Reel ID is required' };
    }

    const roomName = `reel:${reelId}`;
    client.leave(roomName);

    this.logger.log(`Client ${client.id} left reel room: ${roomName}`);

    return {
      event: 'reel:left',
      data: { reelId },
    };
  }

  /**
   * Subscribe to order updates
   */
  @SubscribeMessage('order:subscribe')
  handleSubscribeOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() orderId: string,
  ) {
    if (!orderId) {
      return { error: 'Order ID is required' };
    }

    const roomName = `order:${orderId}`;
    client.join(roomName);

    this.logger.log(`Client ${client.id} subscribed to order: ${roomName}`);

    return {
      event: 'order:subscribed',
      data: { orderId, roomName },
    };
  }

  /**
   * Unsubscribe from order updates
   */
  @SubscribeMessage('order:unsubscribe')
  handleUnsubscribeOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() orderId: string,
  ) {
    if (!orderId) {
      return { error: 'Order ID is required' };
    }

    const roomName = `order:${orderId}`;
    client.leave(roomName);

    this.logger.log(`Client ${client.id} unsubscribed from order: ${roomName}`);

    return {
      event: 'order:unsubscribed',
      data: { orderId },
    };
  }

  /**
   * Subscribe to seller orders (for seller dashboard)
   */
  @SubscribeMessage('seller:subscribe')
  handleSubscribeSeller(
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    if (!userId) {
      return { error: 'Authentication required' };
    }

    const roomName = `seller:${userId}`;
    client.join(roomName);

    this.logger.log(`Client ${client.id} subscribed to seller updates: ${roomName}`);

    return {
      event: 'seller:subscribed',
      data: { sellerId: userId, roomName },
    };
  }

  /**
   * Ping-pong for connection health check
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    return {
      event: 'pong',
      data: { timestamp: Date.now() },
    };
  }

  // ============================
  // Broadcast Methods (called from services)
  // ============================

  /**
   * Broadcast reel like event
   */
  broadcastReelLike(reelId: string, data: any) {
    this.server.to(`reel:${reelId}`).emit('reel:liked', {
      reelId,
      ...data,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast reel unlike event
   */
  broadcastReelUnlike(reelId: string, data: any) {
    this.server.to(`reel:${reelId}`).emit('reel:unliked', {
      reelId,
      ...data,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast new comment
   */
  broadcastReelComment(reelId: string, comment: any) {
    this.server.to(`reel:${reelId}`).emit('reel:commented', {
      reelId,
      comment,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast comment deletion
   */
  broadcastReelCommentDeleted(reelId: string, commentId: string) {
    this.server.to(`reel:${reelId}`).emit('reel:comment-deleted', {
      reelId,
      commentId,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast view count update
   */
  broadcastReelView(reelId: string, viewCount: number) {
    this.server.to(`reel:${reelId}`).emit('reel:view', {
      reelId,
      viewCount,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast order status update
   */
  broadcastOrderStatusUpdate(orderId: string, status: string, order: any) {
    // Emit to order room
    this.server.to(`order:${orderId}`).emit('order:status-updated', {
      orderId,
      status,
      order,
      timestamp: Date.now(),
    });

    // Also emit to customer and seller rooms
    if (order.user_id) {
      this.server.to(`user:${order.user_id}`).emit('order:status-updated', {
        orderId,
        status,
        order,
        timestamp: Date.now(),
      });
    }

    if (order.seller_id) {
      this.server.to(`seller:${order.seller_id}`).emit('order:status-updated', {
        orderId,
        status,
        order,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Broadcast new order to seller
   */
  broadcastNewOrder(sellerId: string, order: any) {
    this.server.to(`seller:${sellerId}`).emit('order:new', {
      order,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast product update
   */
  broadcastProductUpdate(productId: string, product: any) {
    this.server.emit('product:updated', {
      productId,
      product,
      timestamp: Date.now(),
    });
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.server.sockets.sockets.size;
  }

  /**
   * Get room size
   */
  getRoomSize(roomName: string): number {
    const room = this.server.sockets.adapter.rooms.get(roomName);
    return room ? room.size : 0;
  }
}

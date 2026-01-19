import { Injectable, Logger } from '@nestjs/common';
import { ClerkService } from '../auth/clerk.service';
import { RedisConfig } from '../../config/redis.config';
import { User } from '../users/entities/user.entity';

/**
 * Service for real-time operations
 * Handles authentication, Redis pub/sub, and counter management
 */
@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private redis;

  constructor(
    private clerkService: ClerkService,
    private redisConfig: RedisConfig,
  ) {
    this.redis = this.redisConfig.getClient();
  }

  /**
   * Authenticate socket connection using Clerk JWT
   */
  async authenticateSocket(token: string): Promise<User | null> {
    try {
      // Verify token with Clerk
      const payload = await this.clerkService.verifyToken(token);

      // Get or create user
      const user = await this.clerkService.findOrCreateUser(payload.userId || payload.sub);

      if (!user.is_active) {
        this.logger.warn(`Inactive user attempted to connect: ${user.id}`);
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error(`Socket authentication failed: ${error.message}`);
      return null;
    }
  }

  // ============================
  // Redis Counter Management
  // ============================

  /**
   * Increment reel likes counter in Redis
   */
  async incrementReelLikes(reelId: string): Promise<number> {
    const key = `counter:reel:${reelId}:likes`;
    return await this.redis.incr(key);
  }

  /**
   * Decrement reel likes counter in Redis
   */
  async decrementReelLikes(reelId: string): Promise<number> {
    const key = `counter:reel:${reelId}:likes`;
    const value = await this.redis.decr(key);

    // Don't allow negative values
    if (value < 0) {
      await this.redis.set(key, 0);
      return 0;
    }

    return value;
  }

  /**
   * Increment reel comments counter
   */
  async incrementReelComments(reelId: string): Promise<number> {
    const key = `counter:reel:${reelId}:comments`;
    return await this.redis.incr(key);
  }

  /**
   * Decrement reel comments counter
   */
  async decrementReelComments(reelId: string): Promise<number> {
    const key = `counter:reel:${reelId}:comments`;
    const value = await this.redis.decr(key);

    if (value < 0) {
      await this.redis.set(key, 0);
      return 0;
    }

    return value;
  }

  /**
   * Increment reel views counter
   */
  async incrementReelViews(reelId: string): Promise<number> {
    const key = `counter:reel:${reelId}:views`;
    return await this.redis.incr(key);
  }

  /**
   * Get reel counters
   */
  async getReelCounters(reelId: string): Promise<{
    likes: number;
    comments: number;
    views: number;
  }> {
    const [likes, comments, views] = await Promise.all([
      this.redis.get(`counter:reel:${reelId}:likes`),
      this.redis.get(`counter:reel:${reelId}:comments`),
      this.redis.get(`counter:reel:${reelId}:views`),
    ]);

    return {
      likes: parseInt(likes || '0', 10),
      comments: parseInt(comments || '0', 10),
      views: parseInt(views || '0', 10),
    };
  }

  /**
   * Initialize reel counters from database values
   */
  async initializeReelCounters(
    reelId: string,
    likes: number,
    comments: number,
    views: number,
  ): Promise<void> {
    await Promise.all([
      this.redis.set(`counter:reel:${reelId}:likes`, likes),
      this.redis.set(`counter:reel:${reelId}:comments`, comments),
      this.redis.set(`counter:reel:${reelId}:views`, views),
    ]);
  }

  // ============================
  // Redis Pub/Sub for Horizontal Scaling
  // ============================

  /**
   * Publish event to Redis (for scaling across multiple servers)
   */
  async publishEvent(channel: string, data: any): Promise<void> {
    try {
      await this.redis.publish(channel, JSON.stringify(data));
      this.logger.debug(`Published event to channel: ${channel}`);
    } catch (error) {
      this.logger.error(`Failed to publish event: ${error.message}`);
    }
  }

  /**
   * Subscribe to Redis channel (for scaling)
   */
  async subscribeToChannel(channel: string, callback: (data: any) => void): Promise<void> {
    try {
      // Create a separate Redis client for pub/sub
      const subscriber = this.redis.duplicate();

      subscriber.subscribe(channel);

      subscriber.on('message', (ch: string, message: string) => {
        if (ch === channel) {
          try {
            const data = JSON.parse(message);
            callback(data);
          } catch (error) {
            this.logger.error(`Failed to parse message from ${channel}: ${error.message}`);
          }
        }
      });

      this.logger.log(`Subscribed to Redis channel: ${channel}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to channel ${channel}: ${error.message}`);
    }
  }

  // ============================
  // Rate Limiting
  // ============================

  /**
   * Check if action is rate limited
   */
  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<boolean> {
    const count = await this.redis.incr(key);

    if (count === 1) {
      await this.redis.expire(key, windowSeconds);
    }

    return count <= limit;
  }

  /**
   * Rate limit for likes (prevent spam)
   */
  async checkLikeRateLimit(userId: string): Promise<boolean> {
    const key = `ratelimit:like:${userId}`;
    // Allow 10 likes per minute
    return this.checkRateLimit(key, 10, 60);
  }

  /**
   * Rate limit for comments (prevent spam)
   */
  async checkCommentRateLimit(userId: string): Promise<boolean> {
    const key = `ratelimit:comment:${userId}`;
    // Allow 5 comments per minute
    return this.checkRateLimit(key, 5, 60);
  }
}

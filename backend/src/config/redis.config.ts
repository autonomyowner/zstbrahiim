import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisConfig {
  private client: Redis;
  private publisher: Redis;
  private subscriber: Redis;

  constructor(private configService: ConfigService) {
    const redisOptions = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    };

    // Main client
    this.client = new Redis(redisOptions);

    // Publisher for pub/sub
    this.publisher = new Redis(redisOptions);

    // Subscriber for pub/sub
    this.subscriber = new Redis(redisOptions);

    // Error handling
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('✓ Redis Client Connected');
    });
  }

  getClient(): Redis {
    return this.client;
  }

  getPublisher(): Redis {
    return this.publisher;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}

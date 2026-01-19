import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfig } from './config/database.config';
import { RedisConfig } from './config/redis.config';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CartModule } from './modules/cart/cart.module';
import { AuthModule } from './modules/auth/auth.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { ReelsModule } from './modules/reels/reels.module';
import { StorageModule } from './modules/storage/storage.module';
import { B2BModule } from './modules/b2b/b2b.module';
import { SellerModule } from './modules/seller/seller.module';
import { FreelanceModule } from './modules/freelance/freelance.module';

@Module({
  imports: [
    // Configuration - load both env files for fallback
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env',
      ],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // Task scheduling
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL) || 60,
      limit: parseInt(process.env.THROTTLE_LIMIT) || 100,
    }]),

    // Background jobs with Bull (Redis-backed)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
    }),

    // Application modules
    AuthModule, // Must be first to provide auth services globally
    RealtimeModule, // Real-time WebSocket support
    ProductsModule,
    OrdersModule,
    CartModule,
    ReelsModule,
    StorageModule,
    B2BModule,
    SellerModule,
    FreelanceModule,
    // UsersModule,
    // NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module, Global } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { AuthModule } from '../auth/auth.module';
import { RedisConfig } from '../../config/redis.config';

/**
 * Global Realtime module
 * Provides WebSocket gateway and real-time services to all modules
 */
@Global()
@Module({
  imports: [AuthModule],
  providers: [RealtimeGateway, RealtimeService, RedisConfig],
  exports: [RealtimeGateway, RealtimeService],
})
export class RealtimeModule {}

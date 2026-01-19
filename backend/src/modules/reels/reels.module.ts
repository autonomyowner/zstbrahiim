import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReelsController } from './reels.controller';
import { InteractionsController } from './interactions.controller';
import { ReelsService } from './reels.service';
import { InteractionsService } from './interactions.service';
import { ProductReel } from './entities/product-reel.entity';
import { ReelLike } from './entities/reel-like.entity';
import { ReelComment } from './entities/reel-comment.entity';
import { Product } from '../products/entities/product.entity';
import { RealtimeModule } from '../realtime/realtime.module';
import { SyncCountersJob } from './jobs/sync-counters.job';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductReel,
      ReelLike,
      ReelComment,
      Product,
    ]),
    RealtimeModule, // For real-time broadcasting
  ],
  controllers: [ReelsController, InteractionsController],
  providers: [ReelsService, InteractionsService, SyncCountersJob],
  exports: [ReelsService, InteractionsService],
})
export class ReelsModule {}

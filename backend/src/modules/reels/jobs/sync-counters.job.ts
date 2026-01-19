import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductReel } from '../entities/product-reel.entity';
import { RealtimeService } from '../../realtime/realtime.service';

@Injectable()
export class SyncCountersJob {
  private readonly logger = new Logger(SyncCountersJob.name);

  constructor(
    @InjectRepository(ProductReel)
    private reelsRepository: Repository<ProductReel>,
    private realtimeService: RealtimeService,
  ) {}

  /**
   * Sync Redis counters to database every 10 seconds
   * This ensures eventual consistency and data durability
   */
  @Cron(CronExpression.EVERY_10_SECONDS)
  async syncReelCounters() {
    try {
      this.logger.debug('Starting Redis counter sync...');

      // Get all reels (paginated to avoid memory issues)
      const batchSize = 100;
      let page = 0;
      let processedCount = 0;
      let updatedCount = 0;

      while (true) {
        const reels = await this.reelsRepository.find({
          select: ['id', 'likes_count', 'comments_count', 'views_count'],
          skip: page * batchSize,
          take: batchSize,
        });

        if (reels.length === 0) break;

        // Process each reel
        for (const reel of reels) {
          try {
            const counters = await this.realtimeService.getReelCounters(reel.id);

            // Only update if values differ
            if (
              counters.likes !== reel.likes_count ||
              counters.comments !== reel.comments_count ||
              counters.views !== reel.views_count
            ) {
              await this.reelsRepository.update(reel.id, {
                likes_count: counters.likes,
                comments_count: counters.comments,
                views_count: counters.views,
              });

              updatedCount++;
            }

            processedCount++;
          } catch (error) {
            this.logger.error(
              `Failed to sync counters for reel ${reel.id}: ${error.message}`,
            );
          }
        }

        page++;
      }

      if (updatedCount > 0) {
        this.logger.log(
          `Synced ${updatedCount} reels out of ${processedCount} processed`,
        );
      } else {
        this.logger.debug(`No updates needed (${processedCount} reels checked)`);
      }
    } catch (error) {
      this.logger.error(`Redis counter sync failed: ${error.message}`);
    }
  }

  /**
   * Initialize Redis counters from database on startup
   * Run once when the application starts
   */
  async onModuleInit() {
    try {
      this.logger.log('Initializing Redis counters from database...');

      const reels = await this.reelsRepository.find({
        select: ['id', 'likes_count', 'comments_count', 'views_count'],
      });

      let initializedCount = 0;

      for (const reel of reels) {
        try {
          await this.realtimeService.initializeReelCounters(
            reel.id,
            reel.likes_count || 0,
            reel.comments_count || 0,
            reel.views_count || 0,
          );
          initializedCount++;
        } catch (error) {
          this.logger.error(
            `Failed to initialize counters for reel ${reel.id}: ${error.message}`,
          );
        }
      }

      this.logger.log(`Initialized Redis counters for ${initializedCount} reels`);
    } catch (error) {
      this.logger.error(`Failed to initialize Redis counters: ${error.message}`);
    }
  }
}

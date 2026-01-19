import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { ThumbnailGeneratorProcessor } from './jobs/thumbnail-generator.processor';
import { R2Config } from '../../config/r2.config';

@Module({
  imports: [
    // Register Bull queue for thumbnail generation
    BullModule.registerQueue({
      name: 'thumbnails',
    }),
  ],
  controllers: [StorageController],
  providers: [StorageService, ThumbnailGeneratorProcessor, R2Config],
  exports: [StorageService],
})
export class StorageModule {}

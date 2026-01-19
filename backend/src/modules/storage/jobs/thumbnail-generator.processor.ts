import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { StorageService } from '../storage.service';

export interface ThumbnailJob {
  fileBuffer: Buffer;
  originalPath: string;
  mimetype: string;
}

@Processor('thumbnails')
export class ThumbnailGeneratorProcessor extends WorkerHost {
  private readonly logger = new Logger(ThumbnailGeneratorProcessor.name);

  constructor(private readonly storageService: StorageService) {
    super();
  }

  async process(job: Job<ThumbnailJob>): Promise<any> {
    this.logger.log(`Processing thumbnail job ${job.id}`);

    try {
      const { fileBuffer, originalPath, mimetype } = job.data;

      // Create a file object similar to Multer's
      const file: Express.Multer.File = {
        buffer: fileBuffer,
        originalname: originalPath.split('/').pop(),
        mimetype: mimetype,
        fieldname: 'file',
        encoding: '7bit',
        size: fileBuffer.length,
        stream: null,
        destination: null,
        filename: null,
        path: null,
      };

      // Generate thumbnail
      const result = await this.storageService.generateThumbnail(
        file,
        originalPath,
      );

      this.logger.log(
        `Thumbnail generated successfully for ${originalPath}: ${result.url}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to generate thumbnail for job ${job.id}: ${error.message}`,
      );
      throw error;
    }
  }
}

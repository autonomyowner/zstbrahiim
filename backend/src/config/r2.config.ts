import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

/**
 * Cloudflare R2 Configuration
 * R2 is S3-compatible, so we use the AWS SDK
 */
@Injectable()
export class R2Config {
  private readonly client: S3Client;

  constructor(private configService: ConfigService) {
    // Initialize S3 client for R2
    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
  }

  get endpoint(): string {
    return this.configService.get('R2_ENDPOINT');
  }

  get accessKeyId(): string {
    return this.configService.get('R2_ACCESS_KEY_ID');
  }

  get secretAccessKey(): string {
    return this.configService.get('R2_SECRET_ACCESS_KEY');
  }

  get bucketName(): string {
    return this.configService.get('R2_BUCKET_NAME', 'zst-media');
  }

  get publicUrl(): string {
    return this.configService.get('R2_PUBLIC_URL');
  }

  get region(): string {
    return 'auto';
  }

  /**
   * Get S3 client instance
   */
  getClient(): S3Client {
    return this.client;
  }

  /**
   * Generate public URL for a file
   */
  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  /**
   * Generate storage path for product images
   */
  getProductImagePath(productId: string, filename: string): string {
    const timestamp = Date.now();
    const ext = filename.split('.').pop();
    return `products/${productId}/images/${timestamp}.${ext}`;
  }

  /**
   * Generate storage path for reel videos
   */
  getReelVideoPath(productId: string, filename: string): string {
    const timestamp = Date.now();
    const ext = filename.split('.').pop();
    return `reels/${productId}/video-${timestamp}.${ext}`;
  }

  /**
   * Generate storage path for thumbnails
   */
  getThumbnailPath(originalPath: string): string {
    const pathParts = originalPath.split('/');
    const filename = pathParts.pop();
    const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
    return [...pathParts, `${nameWithoutExt}-thumb.jpg`].join('/');
  }
}

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { R2Config } from '../../config/r2.config';
import * as sharp from 'sharp';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly r2Config: R2Config) {}

  /**
   * Upload file to R2
   */
  async uploadFile(
    file: Express.Multer.File,
    path: string,
    contentType?: string,
  ): Promise<{ url: string; key: string }> {
    try {
      const client = this.r2Config.getClient();
      const bucket = this.r2Config.bucketName;

      this.logger.log(`Uploading to bucket: ${bucket}, path: ${path}`);

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: path,
        Body: file.buffer,
        ContentType: contentType || file.mimetype,
      });

      await client.send(command);

      const url = this.r2Config.getPublicUrl(path);

      this.logger.log(`File uploaded successfully: ${path}`);

      return { url, key: path };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new BadRequestException('File upload failed');
    }
  }

  /**
   * Upload product image
   */
  async uploadProductImage(
    file: Express.Multer.File,
    productId: string,
  ): Promise<{ url: string; key: string }> {
    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Image size must not exceed 10MB');
    }

    const path = this.r2Config.getProductImagePath(productId, file.originalname);
    return this.uploadFile(file, path);
  }

  /**
   * Upload reel video
   */
  async uploadReelVideo(
    file: Express.Multer.File,
    productId: string,
  ): Promise<{ url: string; key: string }> {
    // Validate file type
    if (!file.mimetype.startsWith('video/')) {
      throw new BadRequestException('Only video files are allowed');
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Video size must not exceed 100MB');
    }

    const path = this.r2Config.getReelVideoPath(productId, file.originalname);
    return this.uploadFile(file, path);
  }

  /**
   * Generate and upload thumbnail
   */
  async generateThumbnail(
    file: Express.Multer.File,
    originalPath: string,
  ): Promise<{ url: string; key: string }> {
    try {
      // Resize image to 400x400 thumbnail
      const thumbnail = await sharp(file.buffer)
        .resize(400, 400, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbnailPath = this.r2Config.getThumbnailPath(originalPath);

      const client = this.r2Config.getClient();
      const command = new PutObjectCommand({
        Bucket: this.r2Config.bucketName,
        Key: thumbnailPath,
        Body: thumbnail,
        ContentType: 'image/jpeg',
      });

      await client.send(command);

      const url = this.r2Config.getPublicUrl(thumbnailPath);

      this.logger.log(`Thumbnail generated successfully: ${thumbnailPath}`);

      return { url, key: thumbnailPath };
    } catch (error) {
      this.logger.error(`Failed to generate thumbnail: ${error.message}`);
      throw new BadRequestException('Thumbnail generation failed');
    }
  }

  /**
   * Delete file from R2
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const client = this.r2Config.getClient();

      const command = new DeleteObjectCommand({
        Bucket: this.r2Config.bucketName,
        Key: key,
      });

      await client.send(command);

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new BadRequestException('File deletion failed');
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const client = this.r2Config.getClient();

      const command = new HeadObjectCommand({
        Bucket: this.r2Config.bucketName,
        Key: key,
      });

      await client.send(command);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file URL
   */
  getFileUrl(key: string): string {
    return this.r2Config.getPublicUrl(key);
  }

  /**
   * Upload generic file (for general uploads)
   */
  async uploadGenericFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string; key: string }> {
    // Validate file size (max 10MB for images, 100MB for videos)
    const isVideo = file.mimetype.startsWith('video/');
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size must not exceed ${isVideo ? '100MB' : '10MB'}`,
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.originalname.split('.').pop() || 'bin';
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;
    const path = `uploads/${userId}/${filename}`;

    return this.uploadFile(file, path);
  }
}

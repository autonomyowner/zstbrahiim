import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('storage')
@Controller('v1/storage')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Generic file upload endpoint - accepts ANY field name
   */
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: 'Upload a file (accepts any field name)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (any field name works: file, image, photo, etc.)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      example: {
        url: 'https://pub-xxx.r2.dev/uploads/123456.jpg',
        key: 'uploads/123456.jpg',
      },
    },
  })
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User,
    @Req() req: any,
  ) {
    console.log('[StorageController] Upload request received');
    console.log('[StorageController] Files:', files?.length || 0);
    console.log('[StorageController] Content-Type:', req.headers['content-type']);
    console.log('[StorageController] Body keys:', Object.keys(req.body || {}));

    let file = files?.[0];

    // If no file from multipart, check for base64 in body
    if (!file && req.body) {
      const base64Data = req.body.image || req.body.file || req.body.photo || req.body.uri || req.body.base64;
      if (base64Data && typeof base64Data === 'string') {
        console.log('[StorageController] Found base64 data, converting...');

        // Handle data URI format: data:image/jpeg;base64,/9j/4AAQ...
        let base64String = base64Data;
        let mimeType = 'image/jpeg';

        if (base64Data.startsWith('data:')) {
          const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            mimeType = matches[1];
            base64String = matches[2];
          }
        }

        const buffer = Buffer.from(base64String, 'base64');
        const ext = mimeType.split('/')[1] || 'jpg';

        file = {
          buffer,
          originalname: `upload-${Date.now()}.${ext}`,
          mimetype: mimeType,
          size: buffer.length,
        } as Express.Multer.File;

        console.log('[StorageController] Converted base64 to file:', file.originalname, file.size, 'bytes');
      }
    }

    if (!file) {
      throw new BadRequestException('No file received. Send as multipart file or base64 in body (field: image, file, photo, uri, or base64)');
    }

    console.log('[StorageController] Processing file:', file.originalname, file.size, 'bytes');

    const result = await this.storageService.uploadGenericFile(file, user.id);

    return {
      success: true,
      message: 'File uploaded successfully',
      url: result.url,
      key: result.key,
    };
  }

  /**
   * Generic file upload endpoint (alternative with 'image' field)
   */
  @Post('upload-image')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload an image (uses "image" field name)' })
  @ApiConsumes('multipart/form-data')
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    console.log('[StorageController] Upload-image request, file:', file ? `${file.originalname} (${file.size} bytes)` : 'NO FILE');

    if (!file) {
      throw new BadRequestException('Image is required. Send the file with field name "image"');
    }

    const result = await this.storageService.uploadGenericFile(file, user.id);

    return {
      success: true,
      message: 'Image uploaded successfully',
      url: result.url,
      key: result.key,
    };
  }

  /**
   * Upload product image (seller only)
   */
  @Post('products/:productId/images')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('seller', 'admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload product image (seller only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (max 10MB, JPEG/PNG)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      example: {
        url: 'https://pub-xxx.r2.dev/products/uuid/images/123456.jpg',
        key: 'products/uuid/images/123456.jpg',
        thumbnailUrl: 'https://pub-xxx.r2.dev/products/uuid/images/123456-thumb.jpg',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or file too large',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Only sellers can upload product images',
  })
  async uploadProductImage(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Upload original image
    const result = await this.storageService.uploadProductImage(file, productId);

    // Generate thumbnail
    const thumbnail = await this.storageService.generateThumbnail(
      file,
      result.key,
    );

    return {
      message: 'Image uploaded successfully',
      url: result.url,
      key: result.key,
      thumbnailUrl: thumbnail.url,
      thumbnailKey: thumbnail.key,
    };
  }

  /**
   * Upload reel video (seller only)
   */
  @Post('reels/:productId/video')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('seller', 'admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload reel video (seller only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Video file (max 100MB, MP4/MOV)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Video uploaded successfully',
    schema: {
      example: {
        url: 'https://pub-xxx.r2.dev/reels/uuid/video-123456.mp4',
        key: 'reels/uuid/video-123456.mp4',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or file too large',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Only sellers can upload reel videos',
  })
  async uploadReelVideo(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const result = await this.storageService.uploadReelVideo(file, productId);

    return {
      message: 'Video uploaded successfully',
      url: result.url,
      key: result.key,
    };
  }

  /**
   * Delete file (admin or owner)
   */
  @Delete('files/:key')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('seller', 'admin')
  @ApiOperation({ summary: 'Delete file from storage' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async deleteFile(@Param('key') key: string) {
    // Decode the key (in case it was URL-encoded)
    const decodedKey = decodeURIComponent(key);

    await this.storageService.deleteFile(decodedKey);

    return {
      message: 'File deleted successfully',
      key: decodedKey,
    };
  }
}

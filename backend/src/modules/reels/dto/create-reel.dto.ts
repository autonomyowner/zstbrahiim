import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReelDto {
  @ApiProperty({ description: 'Product UUID this reel belongs to' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ description: 'Video URL (will be uploaded to R2)' })
  @IsString()
  video_url: string;

  @ApiProperty({ description: 'Video storage path in R2' })
  @IsString()
  video_storage_path: string;

  @ApiPropertyOptional({ description: 'Video thumbnail URL' })
  @IsOptional()
  @IsString()
  thumbnail_url?: string;

  @ApiPropertyOptional({ description: 'Video duration in seconds' })
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ description: 'Reel caption/description', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;
}

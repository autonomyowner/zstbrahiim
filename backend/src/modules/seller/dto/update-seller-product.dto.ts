import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUrl,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSellerProductDto {
  @ApiPropertyOptional({ description: 'Product name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Product price in DZD' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Stock quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: 'Is product in stock' })
  @IsOptional()
  @IsBoolean()
  in_stock?: boolean;

  @ApiPropertyOptional({ description: 'Brand name' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Product category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Array of product image URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Primary/main image URL' })
  @IsOptional()
  @IsString()
  primary_image?: string;

  @ApiPropertyOptional({ description: 'Video URL for reel' })
  @IsOptional()
  @IsString()
  video_url?: string;

  @ApiPropertyOptional({ description: 'Product tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Is product new' })
  @IsOptional()
  @IsBoolean()
  is_new?: boolean;

  @ApiPropertyOptional({ description: 'Is product on promotion' })
  @IsOptional()
  @IsBoolean()
  is_promo?: boolean;

  @ApiPropertyOptional({ description: 'Original price (for promotions)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  original_price?: number;
}

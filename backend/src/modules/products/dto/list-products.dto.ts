import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory, SellerCategory } from './create-product.dto';

export enum SortBy {
  CREATED_AT = 'created_at',
  PRICE = 'price',
  NAME = 'name',
  RATING = 'rating',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class ListProductsDto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search by product name or brand' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category', enum: ProductCategory })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({ description: 'Filter by seller category', enum: SellerCategory })
  @IsOptional()
  @IsEnum(SellerCategory)
  seller_category?: SellerCategory;

  @ApiPropertyOptional({ description: 'Filter by seller ID' })
  @IsOptional()
  @IsString()
  seller_id?: string;

  @ApiPropertyOptional({ description: 'Minimum price in DZD' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @ApiPropertyOptional({ description: 'Maximum price in DZD' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;

  @ApiPropertyOptional({ description: 'Filter by stock availability', default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  in_stock?: boolean = true;

  @ApiPropertyOptional({ description: 'Sort by field', enum: SortBy, default: SortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(SortBy)
  sort_by?: SortBy = SortBy.CREATED_AT;

  @ApiPropertyOptional({ description: 'Sort order', enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sort_order?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: 'Filter by brand' })
  @IsOptional()
  @IsString()
  brand?: string;
}

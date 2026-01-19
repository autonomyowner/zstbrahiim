import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  MinLength,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductCategory {
  PERFUME = 'perfume',
  MAKEUP = 'makeup',
  SKINCARE = 'skincare',
  HAIRCARE = 'haircare',
  FASHION = 'fashion',
  ACCESSORIES = 'accessories',
  ELECTRONICS = 'electronics',
  FOOD = 'food',
  HOME = 'home',
  BEAUTY = 'beauty',
  HEALTH = 'health',
  SPORTS = 'sports',
  TOYS = 'toys',
  BOOKS = 'books',
  AUTOMOTIVE = 'automotive',
  GARDEN = 'garden',
  PETS = 'pets',
  BABY = 'baby',
  OFFICE = 'office',
  OTHER = 'other',
}

export enum SellerCategory {
  FOURNISSEUR = 'fournisseur',
  IMPORTATEUR = 'importateur',
  GROSSISTE = 'grossiste',
}

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', minLength: 3, maxLength: 200 })
  @IsString()
  @MinLength(3, { message: 'Product name must be at least 3 characters' })
  @MaxLength(200, { message: 'Product name must not exceed 200 characters' })
  name: string;

  @ApiPropertyOptional({ description: 'Product description', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @ApiProperty({ description: 'Product price in DZD', minimum: 0 })
  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price must be at least 0' })
  price: number;

  @ApiProperty({ description: 'Product category', enum: ProductCategory })
  @IsEnum(ProductCategory, { message: 'Invalid product category' })
  category: ProductCategory;

  @ApiPropertyOptional({ description: 'Target seller category (auto-filled from user profile if not provided)', enum: SellerCategory })
  @IsOptional()
  @IsEnum(SellerCategory, { message: 'Invalid seller category' })
  seller_category?: SellerCategory;

  @ApiPropertyOptional({ description: 'Brand name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiProperty({ description: 'Stock quantity', minimum: 0 })
  @IsNumber()
  @Min(0, { message: 'Stock must be at least 0' })
  stock: number;

  @ApiPropertyOptional({ description: 'Is product in stock', default: true })
  @IsOptional()
  @IsBoolean()
  in_stock?: boolean;

  @ApiPropertyOptional({ description: 'Product specifications as JSON' })
  @IsOptional()
  specifications?: any;

  @ApiPropertyOptional({ description: 'Array of product image URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Product tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Product SKU', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ description: 'Product weight in kg', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Minimum order quantity', minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  min_order_quantity?: number;
}

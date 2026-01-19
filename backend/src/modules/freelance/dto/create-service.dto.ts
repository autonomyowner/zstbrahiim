import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceCategory } from '../entities/freelancer-service.entity';

export class CreateServiceDto {
  @ApiProperty({ example: 'Professional Logo Design' })
  @IsString()
  @MinLength(10)
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'I will create a stunning logo for your business...' })
  @IsString()
  @MinLength(50)
  @MaxLength(5000)
  description: string;

  @ApiProperty({ enum: ServiceCategory, example: ServiceCategory.DESIGN })
  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @ApiPropertyOptional({ example: ['logo', 'branding', 'design'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Basic tier (required)
  @ApiProperty({ example: 2500, description: 'Basic package price in DZD' })
  @IsNumber()
  @Min(100)
  price_basic: number;

  @ApiProperty({ example: 'Simple logo with 2 revisions' })
  @IsString()
  @MaxLength(500)
  basic_description: string;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(1)
  basic_delivery_days: number;

  // Standard tier (optional)
  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  price_standard?: number;

  @ApiPropertyOptional({ example: 'Logo + business card design with 5 revisions' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  standard_description?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  standard_delivery_days?: number;

  // Premium tier (optional)
  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  price_premium?: number;

  @ApiPropertyOptional({ example: 'Full branding package with unlimited revisions' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  premium_description?: string;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  premium_delivery_days?: number;
}

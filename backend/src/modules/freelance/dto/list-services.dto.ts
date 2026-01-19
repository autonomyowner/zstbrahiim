import { IsEnum, IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ServiceCategory } from '../entities/freelancer-service.entity';

export class ListServicesDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ServiceCategory })
  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by freelancer ID' })
  @IsOptional()
  @IsString()
  freelancer_id?: string;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_price?: number;

  @ApiPropertyOptional({ enum: ['newest', 'popular', 'rating', 'price_low', 'price_high'] })
  @IsOptional()
  @IsString()
  sort?: 'newest' | 'popular' | 'rating' | 'price_low' | 'price_high' = 'newest';
}

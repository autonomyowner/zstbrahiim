import { IsOptional, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListReelsDto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by product ID' })
  @IsOptional()
  @IsUUID()
  product_id?: string;

  @ApiPropertyOptional({ description: 'Filter by seller ID' })
  @IsOptional()
  @IsUUID()
  seller_id?: string;
}

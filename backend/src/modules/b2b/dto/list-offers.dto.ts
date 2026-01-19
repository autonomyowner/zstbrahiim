import { IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  B2BOfferType,
  B2BOfferStatus,
} from '../entities/b2b-offer.entity';
import { SellerCategory } from '../../users/entities/user.entity';

export class ListOffersDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiProperty({
    description: 'Filter by offer type',
    enum: B2BOfferType,
    required: false,
  })
  @IsOptional()
  @IsEnum(B2BOfferType)
  offer_type?: B2BOfferType;

  @ApiProperty({
    description: 'Filter by status',
    enum: B2BOfferStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(B2BOfferStatus)
  status?: B2BOfferStatus;

  @ApiProperty({
    description: 'Filter by target category',
    enum: SellerCategory,
    required: false,
  })
  @IsOptional()
  @IsEnum(SellerCategory)
  target_category?: SellerCategory;
}

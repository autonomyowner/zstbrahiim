import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  Min,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  B2BOfferType,
  B2BOfferStatus,
} from '../entities/b2b-offer.entity';
import { SellerCategory } from '../../users/entities/user.entity';

export class CreateOfferDto {
  @ApiProperty({
    description: 'Offer title',
    example: '100 units of premium perfume',
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Offer description',
    example: 'High-quality French perfume, bulk wholesale',
  })
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({
    description: 'Image URLs',
    example: ['https://...', 'https://...'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    description: 'Tags for filtering',
    example: ['perfume', 'wholesale', 'premium'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Base price per unit (DZD)',
    example: 5000,
  })
  @IsNumber()
  @Min(0)
  base_price: number;

  @ApiProperty({
    description: 'Minimum order quantity',
    example: 10,
  })
  @IsNumber()
  @Min(1)
  min_quantity: number;

  @ApiProperty({
    description: 'Available quantity',
    example: 100,
  })
  @IsNumber()
  @Min(1)
  available_quantity: number;

  @ApiProperty({
    description: 'Offer type',
    enum: B2BOfferType,
    example: B2BOfferType.NEGOTIABLE,
  })
  @IsEnum(B2BOfferType)
  offer_type: B2BOfferType;

  @ApiProperty({
    description: 'Target seller category (who can see this offer)',
    enum: SellerCategory,
    example: SellerCategory.GROSSISTE,
  })
  @IsEnum(SellerCategory)
  target_category: SellerCategory;

  @ApiProperty({
    description: 'Auction start time (required for auction type)',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  starts_at?: string;

  @ApiProperty({
    description: 'Auction end time (required for auction type)',
    example: '2024-01-10T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  ends_at?: string;
}

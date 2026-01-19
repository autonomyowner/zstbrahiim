import {
  IsString,
  IsEnum,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PricingTier } from '../entities/freelancer-order.entity';

export class CreateFreelancerOrderDto {
  @ApiProperty({ description: 'Service ID to order' })
  @IsUUID()
  service_id: string;

  @ApiProperty({ enum: PricingTier, example: PricingTier.BASIC })
  @IsEnum(PricingTier)
  pricing_tier: PricingTier;

  @ApiProperty({ example: 'I need a logo for my coffee shop. The name is...' })
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  requirements: string;
}

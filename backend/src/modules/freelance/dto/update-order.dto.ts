import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FreelancerOrderStatus } from '../entities/freelancer-order.entity';

export class UpdateFreelancerOrderDto {
  @ApiPropertyOptional({ enum: FreelancerOrderStatus })
  @IsOptional()
  @IsEnum(FreelancerOrderStatus)
  status?: FreelancerOrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  freelancer_notes?: string;
}

export class DeliverOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}

export class ReviewOrderDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  review?: string;
}

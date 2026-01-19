import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PortfolioItemType } from '../entities/freelancer-portfolio.entity';

export class CreatePortfolioDto {
  @ApiProperty({ enum: PortfolioItemType })
  @IsEnum(PortfolioItemType)
  type: PortfolioItemType;

  @ApiPropertyOptional({ example: 'E-commerce website redesign' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'Complete redesign of an online store...' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Link to a service (optional)' })
  @IsOptional()
  @IsUUID()
  service_id?: string;

  @ApiPropertyOptional({ description: 'Display order (lower = first)' })
  @IsOptional()
  @IsNumber()
  display_order?: number;
}

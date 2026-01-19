import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AnalyticsPeriod {
  WEEK = '7d',
  MONTH = '30d',
  QUARTER = '90d',
  YEAR = '365d',
}

export class AnalyticsQueryDto {
  @ApiProperty({
    description: 'Time period for analytics',
    enum: AnalyticsPeriod,
    example: AnalyticsPeriod.MONTH,
    required: false,
  })
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period: AnalyticsPeriod = AnalyticsPeriod.MONTH;
}

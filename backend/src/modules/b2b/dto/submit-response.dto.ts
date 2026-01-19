import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { B2BResponseType } from '../entities/b2b-response.entity';

export class SubmitResponseDto {
  @ApiProperty({
    description: 'Response type (bid or negotiation)',
    enum: B2BResponseType,
    example: B2BResponseType.BID,
  })
  @IsEnum(B2BResponseType)
  response_type: B2BResponseType;

  @ApiProperty({
    description: 'Offered amount per unit (DZD)',
    example: 4800,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Quantity to purchase',
    example: 50,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Optional message for negotiation',
    example: 'Can we discuss bulk discount for larger orders?',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

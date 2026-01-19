import { IsString, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ description: 'Quantity to order', minimum: 1 })
  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

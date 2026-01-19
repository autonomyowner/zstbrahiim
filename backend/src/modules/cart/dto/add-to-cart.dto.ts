import { IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ description: 'Quantity to add', minimum: 1, default: 1 })
  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

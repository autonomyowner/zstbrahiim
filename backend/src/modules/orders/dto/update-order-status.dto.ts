import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'New order status', enum: OrderStatus })
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  status: OrderStatus;
}

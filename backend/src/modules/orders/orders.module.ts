import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import {
  OrdersController,
  SellerOrdersController,
  GuestOrdersController,
} from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product])],
  controllers: [OrdersController, SellerOrdersController, GuestOrdersController],
  providers: [OrdersService],
  exports: [OrdersService], // Export for use in other modules
})
export class OrdersModule {}

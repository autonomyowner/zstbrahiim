import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { ProductReel } from '../reels/entities/product-reel.entity';
import { RedisConfig } from '../../config/redis.config';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, ProductImage, ProductReel])],
  controllers: [SellerController],
  providers: [SellerService, RedisConfig],
  exports: [SellerService],
})
export class SellerModule {}

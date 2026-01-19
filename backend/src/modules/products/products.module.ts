import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController, SellerProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { RedisConfig } from '../../config/redis.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
  ],
  controllers: [ProductsController, SellerProductsController],
  providers: [ProductsService, RedisConfig],
  exports: [ProductsService], // Export for use in other modules
})
export class ProductsModule {}

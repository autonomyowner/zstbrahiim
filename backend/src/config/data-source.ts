import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Import all entities explicitly for TypeORM CLI
import { User } from '../modules/users/entities/user.entity';
import { Product } from '../modules/products/entities/product.entity';
import { ProductImage } from '../modules/products/entities/product-image.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { OrderItem } from '../modules/orders/entities/order-item.entity';
import { CartItem } from '../modules/cart/entities/cart-item.entity';
import { ProductReel } from '../modules/reels/entities/product-reel.entity';
import { ReelLike } from '../modules/reels/entities/reel-like.entity';
import { ReelComment } from '../modules/reels/entities/reel-comment.entity';
import { B2BOffer } from '../modules/b2b/entities/b2b-offer.entity';
import { B2BResponse } from '../modules/b2b/entities/b2b-response.entity';
import { FreelancerService } from '../modules/freelance/entities/freelancer-service.entity';
import { FreelancerPortfolio } from '../modules/freelance/entities/freelancer-portfolio.entity';
import { FreelancerOrder } from '../modules/freelance/entities/freelancer-order.entity';

// Load environment variables
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'zst_user',
  password: process.env.DATABASE_PASSWORD || 'zst_password',
  database: process.env.DATABASE_NAME || 'zst_db',
  entities: [
    User,
    Product,
    ProductImage,
    Order,
    OrderItem,
    CartItem,
    ProductReel,
    ReelLike,
    ReelComment,
    B2BOffer,
    B2BResponse,
    FreelancerService,
    FreelancerPortfolio,
    FreelancerOrder,
  ],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
  } : false,
});

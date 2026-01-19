import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { SellerCategory } from '../../../shared/enums';
import { User } from '../../users/entities/user.entity';
import { ProductImage } from './product-image.entity';
import { ProductReel } from '../../reels/entities/product-reel.entity';

@Entity('products')
@Index(['seller_id', 'category'])
@Index(['seller_category'])
@Index(['created_at'])
@Index(['in_stock'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  original_price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ nullable: true })
  sku: string;

  @Column({ type: 'int', default: 1 })
  min_order_quantity: number;

  @Column()
  category: string;

  @Column({ nullable: true })
  product_type: string;

  @Column('uuid')
  seller_id: string;

  @Column({
    type: 'enum',
    enum: SellerCategory,
    nullable: true,
  })
  seller_category: SellerCategory;

  @Column({ default: true })
  in_stock: boolean;

  @Column({ default: false })
  is_new: boolean;

  @Column({ default: false })
  is_promo: boolean;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  rating: number;

  @Column({ default: 0 })
  viewers_count: number;

  @Column({ type: 'timestamp', nullable: true })
  countdown_end_date: Date;

  @Column('simple-array', { nullable: true })
  benefits: string[];

  @Column({ type: 'text', nullable: true })
  ingredients: string;

  @Column({ type: 'text', nullable: true })
  usage_instructions: string;

  @Column({ type: 'text', nullable: true })
  delivery_estimate: string;

  @Column({ type: 'text', nullable: true })
  shipping_info: string;

  @Column({ type: 'text', nullable: true })
  returns_info: string;

  @Column({ type: 'text', nullable: true })
  payment_info: string;

  @Column({ type: 'text', nullable: true })
  exclusive_offers: string;

  @Column({ nullable: true })
  primary_image: string;

  @Column({ nullable: true })
  video_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.products)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
    eager: true,
  })
  images: ProductImage[];

  @OneToMany(() => ProductReel, (reel) => reel.product)
  reels: ProductReel[];
}

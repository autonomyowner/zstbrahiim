import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
@Index(['product_id'])
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  product_id: string;

  @Column()
  image_url: string;

  @Column({ default: false })
  is_primary: boolean;

  @Column({ default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

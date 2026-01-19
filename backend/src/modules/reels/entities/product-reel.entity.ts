import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { ReelLike } from './reel-like.entity';
import { ReelComment } from './reel-comment.entity';

@Entity('product_reels')
@Index(['product_id'])
export class ProductReel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  product_id: string;

  @Column('uuid')
  seller_id: string;

  @Column({ type: 'text', nullable: true })
  caption: string;

  @Column()
  video_url: string;

  @Column()
  video_storage_path: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ nullable: true })
  thumbnail_storage_path: string;

  @Column({ default: 30 })
  duration_seconds: number;

  @Column('bigint')
  file_size_bytes: number;

  // Cached counts (synced from Redis periodically)
  @Column({ default: 0 })
  likes_count: number;

  @Column({ default: 0 })
  comments_count: number;

  @Column({ default: 0 })
  views_count: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Product, (product) => product.reels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @OneToMany(() => ReelLike, (like) => like.reel)
  likes: ReelLike[];

  @OneToMany(() => ReelComment, (comment) => comment.reel)
  comments: ReelComment[];
}

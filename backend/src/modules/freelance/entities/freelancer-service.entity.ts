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
import { User } from '../../users/entities/user.entity';
import { FreelancerPortfolio } from './freelancer-portfolio.entity';
import { FreelancerOrder } from './freelancer-order.entity';

export enum ServiceCategory {
  DESIGN = 'design',
  DEVELOPMENT = 'development',
  MARKETING = 'marketing',
  WRITING = 'writing',
  VIDEO = 'video',
  PHOTOGRAPHY = 'photography',
  MUSIC = 'music',
  BUSINESS = 'business',
  LIFESTYLE = 'lifestyle',
  OTHER = 'other',
}

export enum ServiceStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DELETED = 'deleted',
}

@Entity('freelancer_services')
@Index(['freelancer_id'])
@Index(['category'])
@Index(['status'])
@Index(['created_at'])
export class FreelancerService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  freelancer_id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ServiceCategory,
    default: ServiceCategory.OTHER,
  })
  category: ServiceCategory;

  @Column('simple-array', { nullable: true })
  tags: string[];

  // Pricing tiers
  @Column('decimal', { precision: 10, scale: 2 })
  price_basic: number;

  @Column({ nullable: true })
  basic_description: string;

  @Column({ default: 3 })
  basic_delivery_days: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price_standard: number;

  @Column({ nullable: true })
  standard_description: string;

  @Column({ nullable: true })
  standard_delivery_days: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price_premium: number;

  @Column({ nullable: true })
  premium_description: string;

  @Column({ nullable: true })
  premium_delivery_days: number;

  // Cover image for the service card
  @Column({ nullable: true })
  cover_image_url: string;

  @Column({ nullable: true })
  cover_image_storage_path: string;

  // Video intro (optional)
  @Column({ nullable: true })
  intro_video_url: string;

  @Column({ nullable: true })
  intro_video_storage_path: string;

  @Column({
    type: 'enum',
    enum: ServiceStatus,
    default: ServiceStatus.ACTIVE,
  })
  status: ServiceStatus;

  // Stats
  @Column({ default: 0 })
  views_count: number;

  @Column({ default: 0 })
  orders_count: number;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  rating: number;

  @Column({ default: 0 })
  reviews_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'freelancer_id' })
  freelancer: User;

  @OneToMany(() => FreelancerPortfolio, (portfolio) => portfolio.service)
  portfolio_items: FreelancerPortfolio[];

  @OneToMany(() => FreelancerOrder, (order) => order.service)
  orders: FreelancerOrder[];
}

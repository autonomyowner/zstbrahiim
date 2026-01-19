import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { FreelancerService } from './freelancer-service.entity';

export enum PortfolioItemType {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity('freelancer_portfolio')
@Index(['freelancer_id'])
@Index(['service_id'])
@Index(['created_at'])
export class FreelancerPortfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  freelancer_id: string;

  @Column('uuid', { nullable: true })
  service_id: string;

  @Column({
    type: 'enum',
    enum: PortfolioItemType,
  })
  type: PortfolioItemType;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Media URLs
  @Column()
  media_url: string;

  @Column()
  storage_path: string;

  // For videos - thumbnail
  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ nullable: true })
  thumbnail_storage_path: string;

  // Video metadata
  @Column({ nullable: true })
  duration_seconds: number;

  @Column('bigint', { nullable: true })
  file_size_bytes: number;

  // Display order
  @Column({ default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'freelancer_id' })
  freelancer: User;

  @ManyToOne(() => FreelancerService, (service) => service.portfolio_items, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'service_id' })
  service: FreelancerService;
}

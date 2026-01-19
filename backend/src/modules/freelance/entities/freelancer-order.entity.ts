import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { FreelancerService } from './freelancer-service.entity';

export enum FreelancerOrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  REVISION_REQUESTED = 'revision_requested',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export enum PricingTier {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

@Entity('freelancer_orders')
@Index(['freelancer_id'])
@Index(['client_id'])
@Index(['service_id'])
@Index(['status'])
@Index(['created_at'])
export class FreelancerOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  service_id: string;

  @Column('uuid')
  freelancer_id: string;

  @Column('uuid')
  client_id: string;

  @Column({
    type: 'enum',
    enum: PricingTier,
    default: PricingTier.BASIC,
  })
  pricing_tier: PricingTier;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: FreelancerOrderStatus,
    default: FreelancerOrderStatus.PENDING,
  })
  status: FreelancerOrderStatus;

  @Column('text')
  requirements: string;

  @Column({ type: 'text', nullable: true })
  freelancer_notes: string;

  @Column({ type: 'timestamp', nullable: true })
  due_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  // Delivery files
  @Column('simple-json', { nullable: true })
  delivery_files: { url: string; name: string; type: string }[];

  // Rating after completion
  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  review: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => FreelancerService, (service) => service.orders)
  @JoinColumn({ name: 'service_id' })
  service: FreelancerService;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'freelancer_id' })
  freelancer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  client: User;
}

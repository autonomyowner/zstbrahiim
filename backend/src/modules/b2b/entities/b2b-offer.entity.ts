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
import { B2BOfferType, B2BOfferStatus, SellerCategory } from '../../../shared/enums';
import { User } from '../../users/entities/user.entity';
import { B2BResponse } from './b2b-response.entity';

// Re-export for convenience
export { B2BOfferType, B2BOfferStatus };

@Entity('b2b_offers')
@Index(['seller_id'])
@Index(['target_category'])
@Index(['status'])
export class B2BOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  seller_id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('decimal', { precision: 10, scale: 2 })
  base_price: number;

  @Column('int')
  min_quantity: number;

  @Column('int')
  available_quantity: number;

  @Column({
    type: 'enum',
    enum: B2BOfferType,
    default: B2BOfferType.NEGOTIABLE,
  })
  offer_type: B2BOfferType;

  @Column({
    type: 'enum',
    enum: B2BOfferStatus,
    default: B2BOfferStatus.ACTIVE,
  })
  status: B2BOfferStatus;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  current_bid: number;

  @Column({ type: 'uuid', nullable: true })
  highest_bidder_id: string;

  @Column({ type: 'timestamp', nullable: true })
  starts_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  ends_at: Date;

  @Column({
    type: 'enum',
    enum: SellerCategory,
  })
  target_category: SellerCategory;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'highest_bidder_id' })
  highest_bidder: User;

  @OneToMany(() => B2BResponse, (response) => response.offer)
  responses: B2BResponse[];
}

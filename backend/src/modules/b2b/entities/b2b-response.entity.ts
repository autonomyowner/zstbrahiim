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
import { B2BResponseType, B2BResponseStatus } from '../../../shared/enums';
import { B2BOffer } from './b2b-offer.entity';
import { User } from '../../users/entities/user.entity';

// Re-export for convenience
export { B2BResponseType, B2BResponseStatus };

@Entity('b2b_offer_responses')
@Index(['offer_id'])
@Index(['buyer_id'])
export class B2BResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  offer_id: string;

  @Column('uuid')
  buyer_id: string;

  @Column({
    type: 'enum',
    enum: B2BResponseType,
  })
  response_type: B2BResponseType;

  @Column({
    type: 'enum',
    enum: B2BResponseStatus,
    default: B2BResponseStatus.PENDING,
  })
  status: B2BResponseStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('int')
  quantity: number;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => B2BOffer, (offer) => offer.responses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'offer_id' })
  offer: B2BOffer;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;
}

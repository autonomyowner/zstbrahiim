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
import { OrderStatus, PaymentStatus } from '../../../shared/enums';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

// Re-export for convenience
export { OrderStatus, PaymentStatus };

@Entity('orders')
@Index(['user_id'])
@Index(['seller_id'])
@Index(['status'])
@Index(['customer_phone'])
@Index(['order_number'], { unique: true })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  order_number: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  seller_id: string;

  @Column()
  customer_name: string;

  @Column({ nullable: true })
  customer_email: string;

  @Column()
  customer_phone: string;

  @Column('text')
  customer_address: string;

  @Column('text')
  shipping_address: string;

  @Column()
  customer_wilaya: string;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  shipping_cost: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status: PaymentStatus;

  @Column({ default: 'cod' })
  payment_method: string;

  @Column({ type: 'timestamp', nullable: true })
  delivery_date: Date;

  @Column({ nullable: true })
  tracking_number: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserRole, SellerCategory } from '../../../shared/enums';

// Re-export for convenience
export { UserRole, SellerCategory };

@Entity('users')
@Index(['clerk_id'], { unique: true })
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  clerk_id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  wilaya: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: SellerCategory,
    nullable: true,
  })
  seller_category: SellerCategory;

  @Column({ nullable: true })
  push_token: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relations defined via inverse side
  @OneToMany('Product', 'seller')
  products: any[];

  @OneToMany('Order', 'user')
  orders: any[];
}

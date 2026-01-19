import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ProductReel } from './product-reel.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reel_likes')
@Index(['reel_id', 'user_id'])
@Unique(['reel_id', 'user_id'])
export class ReelLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  reel_id: string;

  @Column('uuid')
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => ProductReel, (reel) => reel.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reel_id' })
  reel: ProductReel;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

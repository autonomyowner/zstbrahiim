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
import { ProductReel } from './product-reel.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reel_comments')
@Index(['reel_id', 'created_at'])
export class ReelComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  reel_id: string;

  @Column('uuid')
  user_id: string;

  @Column('text')
  content: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => ProductReel, (reel) => reel.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reel_id' })
  reel: ProductReel;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  action: string;

  @Column()
  resource: string;

  @Column()
  resourceId: string;

  @Column('simple-json', { nullable: true })
  details: unknown;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => User)
  user: User;
}

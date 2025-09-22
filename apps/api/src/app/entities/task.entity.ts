import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskStatus, TaskCategory } from '@task-management/data';
import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'varchar',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({
    type: 'varchar',
    enum: TaskCategory,
  })
  category: TaskCategory;

  @Column()
  assigneeId: string;

  @Column()
  organizationId: string;

  @Column()
  createdBy: string;

  @ManyToOne(() => User)
  assignee: User;

  @ManyToOne(() => Organization)
  organization: Organization;

  @ManyToOne(() => User)
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

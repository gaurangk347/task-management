import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Permission, RoleType } from '@task-management/data';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    enum: RoleType,
  })
  name: RoleType;

  @Column('simple-json', { nullable: true })
  permissions: Permission[];
}

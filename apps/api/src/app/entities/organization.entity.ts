import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  parentId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Organization, (org) => org.parentId)
  children: Organization[];
}

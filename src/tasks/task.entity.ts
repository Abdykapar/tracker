import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TaskCategory } from './task-category.entity.js';
import { User } from '../auth/user.entity.js';

export type DocumentStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: 0 })
  deadlineDays: number;

  @Column({ type: 'date', nullable: true })
  startDate: string | null;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({ default: 0 })
  completionPercent: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'in-progress', 'completed', 'overdue'],
    default: 'pending',
  })
  status: DocumentStatus;

  @Column({ type: 'varchar', nullable: true })
  executorGO: string | null;

  @Column({ type: 'varchar', nullable: true })
  executorNurzaman: string | null;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ default: false })
  isParallel: boolean;

  @Column({ type: 'int', nullable: true })
  parallelGroupId: number | null;

  @Column({ type: 'jsonb', default: '[]' })
  attachments: string[];

  @Column({ default: 0 })
  orderIndex: number;

  @ManyToOne(() => TaskCategory, cat => cat.tasks, { nullable: true })
  @JoinColumn()
  category: TaskCategory | null;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn()
  assignee: User | null;
}

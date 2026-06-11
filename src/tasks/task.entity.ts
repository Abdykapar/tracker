import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'planned' | 'in-progress' | 'review' | 'completed';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: ['high', 'medium', 'low'] })
  priority: Priority;

  @Column({ type: 'enum', enum: ['planned', 'in-progress', 'review', 'completed'], default: 'planned' })
  status: TaskStatus;

  @Column()
  estimatedMin: number;

  @Column({ nullable: true })
  actualMin: number;

  @Column({ type: 'jsonb', default: '[]' })
  tags: string[];

  @Column()
  deadline: string;

  @Column({ default: false })
  timerRunning: boolean;

  @Column({ default: 0 })
  progress: number;

  @Column()
  assignedDate: string;
}

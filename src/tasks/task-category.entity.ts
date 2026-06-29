import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from './task.entity.js';

@Entity()
export class TaskCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 0 })
  orderIndex: number;

  @OneToMany(() => Task, task => task.category)
  tasks: Task[];
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class FocusSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  taskId: number;

  @Column()
  startTime: string;

  @Column({ nullable: true })
  endTime: string;

  @Column({ default: false })
  paused: boolean;

  @Column({ nullable: true })
  durationMin: number;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../roles/role.entity.js';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column({ unique: true })
  login: string;

  @Column()
  password: string;

  @ManyToOne(() => Role, { nullable: true, eager: true })
  @JoinColumn()
  role: Role | null;
}

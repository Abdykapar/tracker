import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Task } from './task.entity.js';
import type { Priority, TaskStatus } from './task.entity.js';

export type { Priority, TaskStatus };
export { Task };

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly repo: Repository<Task>,
  ) {}

  findAll(status?: TaskStatus, priority?: Priority): Promise<Task[]> {
    const where: FindOptionsWhere<Task> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    return this.repo.find({ where });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.repo.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  create(dto: Omit<Task, 'id' | 'timerRunning' | 'progress'>): Promise<Task> {
    const task = this.repo.create({ ...dto, timerRunning: false, progress: 0 });
    return this.repo.save(task);
  }

  async update(id: number, dto: Partial<Task>): Promise<Task> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Task ${id} not found`);
  }

  search(q: string): Promise<Task[]> {
    return this.repo.find({ where: { title: ILike(`%${q}%`) } });
  }
}

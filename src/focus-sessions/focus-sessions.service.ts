import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FocusSession } from './focus-session.entity.js';

export { FocusSession };

@Injectable()
export class FocusSessionsService {
  constructor(
    @InjectRepository(FocusSession)
    private readonly repo: Repository<FocusSession>,
  ) {}

  create(taskId?: number): Promise<FocusSession> {
    const session = this.repo.create({
      taskId,
      startTime: new Date().toISOString(),
      paused: false,
    });
    return this.repo.save(session);
  }

  async update(
    id: number,
    dto: Partial<Pick<FocusSession, 'endTime' | 'paused' | 'durationMin'>>,
  ): Promise<FocusSession> {
    await this.repo.update(id, dto);
    const session = await this.repo.findOne({ where: { id } });
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    return session;
  }

  findAll(): Promise<FocusSession[]> {
    return this.repo.find();
  }
}

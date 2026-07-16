import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Task } from './task.entity.js';
import { TaskCategory } from './task-category.entity.js';
import { User } from '../auth/user.entity.js';
import type { DocumentStatus } from './task.entity.js';

export type CreateTaskDto = Omit<Task, 'id' | 'assignee'> & { assigneeId?: number | null };
export type UpdateTaskDto = Partial<Omit<Task, 'id' | 'category' | 'assignee'>> & { assigneeId?: number | null };

export type { DocumentStatus };
export { Task };

const SEED_CATEGORIES = [
  { name: 'Правоустанавливающие и разрешительные документы', orderIndex: 1 },
  { name: 'Проект внутренних инженерных систем', orderIndex: 2 },
  { name: 'Проект наружных инженерных систем', orderIndex: 3 },
];

const SEED_TASKS: Array<{
  categoryIndex: number | null;
  title: string;
  deadlineDays: number;
  orderIndex: number;
  isParallel?: boolean;
  parallelGroupId?: number;
}> = [
  // Category 1: Правоустанавливающие и разрешительные документы
  { categoryIndex: 0, title: 'Государственный акт на право собственности участка', deadlineDays: 14, orderIndex: 1 },
  { categoryIndex: 0, title: 'Топографическая съемка участка', deadlineDays: 10, orderIndex: 2 },
  { categoryIndex: 0, title: 'Акт установления границ земельного участка', deadlineDays: 14, orderIndex: 3 },
  { categoryIndex: 0, title: 'Договор на разработку проекта и ведения авторского надзора', deadlineDays: 3, orderIndex: 4 },
  { categoryIndex: 0, title: 'Разработка ЭП и ГП/Расчет нагрузок', deadlineDays: 30, orderIndex: 5 },
  { categoryIndex: 0, title: 'Инженерно-геологические изыскания', deadlineDays: 30, orderIndex: 6 },
  { categoryIndex: 0, title: 'СТУ (спецтехусловие) ГИССИП', deadlineDays: 30, orderIndex: 7 },
  { categoryIndex: 0, title: 'Выкопировка из эскиза застройки (ДГА,Минстрой) ПДП', deadlineDays: 30, orderIndex: 8 },
  { categoryIndex: 0, title: 'Решение градсовета/БГА', deadlineDays: 30, orderIndex: 9 },
  { categoryIndex: 0, title: 'Разработка АГЗ', deadlineDays: 28, orderIndex: 10 },
  { categoryIndex: 0, title: 'Согласование АР части проекта', deadlineDays: 28, orderIndex: 11 },
  { categoryIndex: 0, title: 'Разработка ИТУ (Инженерно-технические условия)', deadlineDays: 28, orderIndex: 12 },
  { categoryIndex: 0, title: 'ТУ на электроснабжения', deadlineDays: 28, orderIndex: 13, isParallel: true, parallelGroupId: 1 },
  { categoryIndex: 0, title: 'ТУ на отопление', deadlineDays: 28, orderIndex: 14, isParallel: true, parallelGroupId: 1 },
  { categoryIndex: 0, title: 'ТУ на газификацию', deadlineDays: 28, orderIndex: 15, isParallel: true, parallelGroupId: 1 },
  { categoryIndex: 0, title: 'ТУ на водопровод и канализацию', deadlineDays: 28, orderIndex: 16, isParallel: true, parallelGroupId: 1 },
  // Category 2: Проект внутренних инженерных систем
  { categoryIndex: 1, title: 'Проект внутреннего отопления и вентиляции', deadlineDays: 28, orderIndex: 1, isParallel: true, parallelGroupId: 2 },
  { categoryIndex: 1, title: 'Проект внутреннего электроснабжения', deadlineDays: 28, orderIndex: 2, isParallel: true, parallelGroupId: 2 },
  { categoryIndex: 1, title: 'Проект внутреннего водопровода и канализации', deadlineDays: 28, orderIndex: 3, isParallel: true, parallelGroupId: 2 },
  { categoryIndex: 1, title: 'Проект внутреннего газоснабжения', deadlineDays: 28, orderIndex: 4, isParallel: true, parallelGroupId: 2 },
  { categoryIndex: 1, title: 'Проект внутренней автоматики', deadlineDays: 28, orderIndex: 5, isParallel: true, parallelGroupId: 2 },
  { categoryIndex: 1, title: 'Проект внутренней охранно-пожарной сигнализации', deadlineDays: 28, orderIndex: 6, isParallel: true, parallelGroupId: 2 },
  // Category 3: Проект наружных инженерных систем
  { categoryIndex: 2, title: 'Наружные сети водопровода и канализации', deadlineDays: 30, orderIndex: 1 },
  { categoryIndex: 2, title: 'Наружные сети электроснабжения', deadlineDays: 30, orderIndex: 2 },
  { categoryIndex: 2, title: 'Наружные сети отопления', deadlineDays: 30, orderIndex: 3 },
  { categoryIndex: 2, title: 'Наружные сети газификации', deadlineDays: 30, orderIndex: 4 },
  // Standalone items
  { categoryIndex: null, title: 'Прохождение Госэкспертизы КС части проекта', deadlineDays: 30, orderIndex: 4 },
  { categoryIndex: null, title: 'Прохождение Госэкспертизы инженерных сетей проекта', deadlineDays: 30, orderIndex: 5 },
  { categoryIndex: null, title: 'Согласованный СтройГенплан', deadlineDays: 14, orderIndex: 6 },
  { categoryIndex: null, title: 'АКТ выноса проекта в натуру', deadlineDays: 14, orderIndex: 7 },
  { categoryIndex: null, title: 'Включение в реестр строящихся объектов', deadlineDays: 5, orderIndex: 8 },
];

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    @InjectRepository(Task)
    private readonly repo: Repository<Task>,
    @InjectRepository(TaskCategory)
    private readonly categoryRepo: Repository<TaskCategory>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count > 0) return;

    const categories: TaskCategory[] = [];
    for (const seed of SEED_CATEGORIES) {
      categories.push(await this.categoryRepo.save(this.categoryRepo.create(seed)));
    }

    for (const { categoryIndex, ...rest } of SEED_TASKS) {
      await this.repo.save(
        this.repo.create({
          ...rest,
          isParallel: rest.isParallel ?? false,
          parallelGroupId: rest.parallelGroupId ?? null,
          status: 'pending',
          completionPercent: 0,
          attachments: [],
          startDate: null,
          endDate: null,
          executorGO: null,
          executorNurzaman: null,
          comment: null,
          category: categoryIndex !== null ? categories[categoryIndex] : null,
        }),
      );
    }
  }

  findAll(status?: DocumentStatus, assigneeId?: number): Promise<Task[]> {
    const where: { status?: DocumentStatus; assignee?: { id: number } } = {};
    if (status) where.status = status;
    if (assigneeId) where.assignee = { id: assigneeId };
    return this.repo.find({ where, order: { orderIndex: 'ASC' }, relations: { category: true } });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.repo.findOne({ where: { id }, relations: { category: true } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    const { assigneeId, ...rest } = dto;
    const assignee = assigneeId != null ? await this.userRepo.findOne({ where: { id: assigneeId } }) : null;
    return this.repo.save(this.repo.create({ ...rest, assignee }));
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const { assigneeId, ...rest } = dto;
    if (rest.startDate !== undefined || rest.deadlineDays !== undefined) {
      const current = await this.findOne(id);
      const startDate = rest.startDate ?? current.startDate;
      const deadlineDays = rest.deadlineDays ?? current.deadlineDays;
      if (startDate) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + deadlineDays);
        rest.endDate = d.toISOString().split('T')[0];
      }
    }
    if (assigneeId !== undefined) {
      const assignee = assigneeId != null ? await this.userRepo.findOne({ where: { id: assigneeId } }) : null;
      await this.repo.save({ id, ...rest, assignee });
    } else {
      await this.repo.update(id, rest);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Task ${id} not found`);
  }

  search(q: string): Promise<Task[]> {
    return this.repo.find({ where: { title: ILike(`%${q}%`) }, relations: { category: true } });
  }

  async addAttachment(id: number, filename: string): Promise<Task> {
    const task = await this.findOne(id);
    const attachments = [...(task.attachments ?? []), filename];
    await this.repo.update(id, { attachments });
    return this.findOne(id);
  }

  async removeAttachment(id: number, filename: string): Promise<void> {
    const task = await this.findOne(id);
    const attachments = (task.attachments ?? []).filter(a => a !== filename);
    await this.repo.update(id, { attachments });
  }
}

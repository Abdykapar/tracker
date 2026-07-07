import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity.js';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(@InjectRepository(Role) private readonly repo: Repository<Role>) {}

  async onModuleInit() {
    for (const name of ['admin', 'user']) {
      const exists = await this.repo.findOne({ where: { name } });
      if (!exists) await this.repo.save(this.repo.create({ name }));
    }
  }

  findAll(): Promise<Role[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.repo.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return role;
  }

  create(dto: { name: string }): Promise<Role> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: { name: string }): Promise<Role> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Role ${id} not found`);
  }
}

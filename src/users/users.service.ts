import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity.js';
import { Role } from '../roles/role.entity.js';

export class CreateUserDto {
  name: string;
  surname: string;
  login: string;
  password: string;
  roleId?: number;
}

type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
  ) {}

  async findAll(): Promise<SafeUser[]> {
    const users = await this.repo.find({ relations: { role: true } });
    return users.map(({ password: _, ...u }) => u);
  }

  async findOne(id: number): Promise<SafeUser> {
    const user = await this.repo.findOne({ where: { id }, relations: { role: true } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    const { password: _, ...safe } = user;
    return safe;
  }

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const role = dto.roleId ? await this.roleRepo.findOne({ where: { id: dto.roleId } }) : null;
    const user = await this.repo.save(this.repo.create({ ...dto, role }));
    const { password: _, ...safe } = user;
    return safe;
  }

  async update(id: number, dto: Partial<CreateUserDto>): Promise<SafeUser> {
    const { roleId, ...rest } = dto;
    if (roleId !== undefined) {
      const role = await this.roleRepo.findOne({ where: { id: roleId } });
      await this.repo.save({ id, ...rest, role });
    } else {
      await this.repo.update(id, rest);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`User ${id} not found`);
  }
}

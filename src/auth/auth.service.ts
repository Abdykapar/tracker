import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from './user.entity.js';
import { Role } from '../roles/role.entity.js';

@Injectable()
export class AuthService implements OnModuleInit {
  private tokens = new Map<string, number>();

  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async onModuleInit() {
    const adminRole = await this.roleRepo.findOne({ where: { name: 'admin' } });
    const userRole = await this.roleRepo.findOne({ where: { name: 'user' } });

    const seeds = [
      { name: 'Admin', surname: 'System', login: 'admin', password: 'admin123', role: adminRole },
      { name: 'Alex', surname: 'Johnson', login: 'alex', password: 'password', role: userRole },
    ];
    for (const seed of seeds) {
      const exists = await this.repo.findOne({ where: { login: seed.login } });
      if (!exists) await this.repo.save(this.repo.create(seed));
    }
  }

  async login(login: string, password: string) {
    const user = await this.repo.findOne({ where: { login, password } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const token = randomUUID();
    this.tokens.set(token, user.id);
    const { password: _, ...profile } = user;
    return { access_token: token, user: profile };
  }

  logout(token: string) {
    this.tokens.delete(token);
  }

  async getMe(token: string) {
    const userId = this.tokens.get(token);
    if (!userId) throw new UnauthorizedException();
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const { password: _, ...profile } = user;
    return profile;
  }
}

import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from './user.entity.js';

@Injectable()
export class AuthService implements OnModuleInit {
  private tokens = new Map<string, number>();

  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async onModuleInit() {
    const seeds = [
      { name: 'Admin', email: 'admin@tracker.com', password: 'admin123', streak: 0, planType: 'pro', role: 'admin' as const },
      { name: 'Alex Johnson', email: 'alex@example.com', password: 'password', streak: 7, planType: 'pro', role: 'user' as const },
    ];
    for (const seed of seeds) {
      const exists = await this.repo.findOne({ where: { email: seed.email } });
      if (!exists) await this.repo.save(this.repo.create(seed));
    }
  }

  async login(email: string, password: string) {
    const user = await this.repo.findOne({ where: { email, password } });
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

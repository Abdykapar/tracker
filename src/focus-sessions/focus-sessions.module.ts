import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FocusSessionsController } from './focus-sessions.controller.js';
import { FocusSessionsService } from './focus-sessions.service.js';
import { FocusSession } from './focus-session.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([FocusSession])],
  controllers: [FocusSessionsController],
  providers: [FocusSessionsService],
  exports: [FocusSessionsService],
})
export class FocusSessionsModule {}

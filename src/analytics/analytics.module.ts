import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';
import { TasksModule } from '../tasks/tasks.module.js';
import { FocusSessionsModule } from '../focus-sessions/focus-sessions.module.js';

@Module({
  imports: [TasksModule, FocusSessionsModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}

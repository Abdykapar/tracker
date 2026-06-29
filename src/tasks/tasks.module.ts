import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { Task } from './task.entity.js';
import { TaskCategory } from './task-category.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskCategory])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

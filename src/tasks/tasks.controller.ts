import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, ParseIntPipe, HttpCode,
} from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import type { Task, Priority, TaskStatus } from './tasks.service.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('search')
  search(@Query('q') q: string) {
    return this.tasksService.search(q ?? '');
  }

  @Get()
  findAll(@Query('status') status?: TaskStatus, @Query('priority') priority?: Priority) {
    return this.tasksService.findAll(status, priority);
  }

  @Post()
  create(@Body() body: Omit<Task, 'id' | 'timerRunning' | 'progress'>) {
    return this.tasksService.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<Task>) {
    return this.tasksService.update(id, body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: TaskStatus) {
    return this.tasksService.update(id, { status });
  }

  @Patch(':id/progress')
  updateProgress(@Param('id', ParseIntPipe) id: number, @Body('progress') progress: number) {
    return this.tasksService.update(id, { progress });
  }

  @Patch(':id/timer')
  async toggleTimer(@Param('id', ParseIntPipe) id: number) {
    const task = await this.tasksService.findOne(id);
    return this.tasksService.update(id, { timerRunning: !task.timerRunning });
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.tasksService.remove(id);
  }
}

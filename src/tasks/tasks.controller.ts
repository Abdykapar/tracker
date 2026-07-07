import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, ParseIntPipe, HttpCode,
} from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import type { CreateTaskDto, UpdateTaskDto, DocumentStatus } from './tasks.service.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('search')
  search(@Query('q') q: string) {
    return this.tasksService.search(q ?? '');
  }

  @Get()
  findAll(@Query('status') status?: DocumentStatus) {
    return this.tasksService.findAll(status);
  }

  @Post()
  create(@Body() body: CreateTaskDto) {
    return this.tasksService.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTaskDto) {
    return this.tasksService.update(id, body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: DocumentStatus) {
    return this.tasksService.update(id, { status });
  }

  @Patch(':id/completion')
  updateCompletion(@Param('id', ParseIntPipe) id: number, @Body('completionPercent') completionPercent: number) {
    return this.tasksService.update(id, { completionPercent });
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.tasksService.remove(id);
  }
}

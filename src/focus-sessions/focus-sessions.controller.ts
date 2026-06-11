import { Controller, Post, Patch, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { FocusSessionsService } from './focus-sessions.service.js';

@Controller('focus-sessions')
export class FocusSessionsController {
  constructor(private readonly service: FocusSessionsService) {}

  @Post()
  create(@Body() body: { taskId?: number }) {
    return this.service.create(body.taskId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { endTime?: string; paused?: boolean; durationMin?: number },
  ) {
    return this.service.update(id, body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
}

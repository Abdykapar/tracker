import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, ParseIntPipe, HttpCode,
  UseInterceptors, UploadedFile, Res, NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Response } from 'express';
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

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadAttachment(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.tasksService.addAttachment(id, file.filename);
  }

  @Get(':id/attachments/:filename')
  async downloadAttachment(
    @Param('id', ParseIntPipe) id: number,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const task = await this.tasksService.findOne(id);
    if (!task.attachments.includes(filename)) throw new NotFoundException('Attachment not found');
    res.download(join(process.cwd(), 'uploads', filename), filename);
  }

  @Delete(':id/attachments/:filename')
  @HttpCode(204)
  removeAttachment(
    @Param('id', ParseIntPipe) id: number,
    @Param('filename') filename: string,
  ) {
    return this.tasksService.removeAttachment(id, filename);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.tasksService.remove(id);
  }
}

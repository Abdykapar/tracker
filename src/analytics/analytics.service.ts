import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service.js';
import { FocusSessionsService } from '../focus-sessions/focus-sessions.service.js';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly tasksService: TasksService,
    private readonly focusSessionsService: FocusSessionsService,
  ) {}

  async getActivity() {
    const tasks = await this.tasksService.findAll();
    const map: Record<string, { completed: number; created: number }> = {};
    for (const task of tasks) {
      const day = task.startDate?.slice(0, 10);
      if (!day) continue;
      map[day] ??= { completed: 0, created: 0 };
      map[day].created++;
      if (task.status === 'completed') map[day].completed++;
    }
    return Object.entries(map).map(([day, v]) => ({ day, ...v }));
  }

  async getPlannedVsActual() {
    const tasks = await this.tasksService.findAll();
    const map: Record<string, { plannedDays: number; completionPercent: number; count: number }> = {};
    for (const task of tasks) {
      const week = task.startDate ? `W${isoWeek(task.startDate)}` : 'unknown';
      map[week] ??= { plannedDays: 0, completionPercent: 0, count: 0 };
      map[week].plannedDays += task.deadlineDays ?? 0;
      map[week].completionPercent += task.completionPercent ?? 0;
      map[week].count++;
    }
    return Object.entries(map).map(([week, v]) => ({
      week,
      plannedDays: v.plannedDays,
      avgCompletion: v.count > 0 ? Math.round(v.completionPercent / v.count) : 0,
    }));
  }

  async getFocusScore() {
    const sessions = await this.focusSessionsService.findAll();
    const map: Record<string, number> = {};
    for (const s of sessions) {
      const day = s.startTime?.slice(0, 10);
      if (!day) continue;
      map[day] = (map[day] ?? 0) + (s.durationMin ?? 25);
    }
    return Object.entries(map).map(([day, totalMin]) => ({
      day,
      score: Math.min(100, Math.round((totalMin / 240) * 100)),
    }));
  }

  async getHeatmap() {
    const tasks = await this.tasksService.findAll();
    const map: Record<string, number> = {};
    for (const task of tasks) {
      const date = task.startDate?.slice(0, 10);
      if (!date) continue;
      map[date] = (map[date] ?? 0) + (task.status === 'completed' ? 1 : 0);
    }
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }

  async getCategories() {
    const tasks = await this.tasksService.findAll();
    const map: Record<string, number> = {};
    for (const task of tasks) {
      const name = task.category?.name ?? 'Без категории';
      map[name] = (map[name] ?? 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }
}

function isoWeek(dateStr: string): number {
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
}

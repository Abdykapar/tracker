import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('activity')
  getActivity() {
    return this.analyticsService.getActivity();
  }

  @Get('planned-vs-actual')
  getPlannedVsActual() {
    return this.analyticsService.getPlannedVsActual();
  }

  @Get('focus-score')
  getFocusScore() {
    return this.analyticsService.getFocusScore();
  }

  @Get('heatmap')
  getHeatmap() {
    return this.analyticsService.getHeatmap();
  }

  @Get('categories')
  getCategories() {
    return this.analyticsService.getCategories();
  }
}

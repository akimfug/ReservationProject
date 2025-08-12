import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AnalyticsService, DailyAnalytics } from './analytics.service';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('daily')
  async getDailyAnalytics(@Query('day') day?: string): Promise<DailyAnalytics> {
    try {
      // Если день не указан, используем сегодняшний день
      const targetDay = day || new Date().toISOString().split('T')[0];
      return await this.analyticsService.getDailyAnalytics(targetDay);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      throw new HttpException(
        'Ошибка получения аналитики: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

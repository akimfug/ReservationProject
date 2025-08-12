import { AnalyticsService, DailyAnalytics } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDailyAnalytics(day?: string): Promise<DailyAnalytics>;
}

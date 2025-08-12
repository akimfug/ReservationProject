import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export interface DailyAnalytics {
    dailyCovers: number;
    peakHours: string;
    averageDiningTime: string;
    totalReservations: number;
    occupancyRate: number;
    averagePartySize: number;
}
export declare class AnalyticsService {
    private prisma;
    private realtimeGateway;
    constructor(prisma: PrismaService, realtimeGateway: RealtimeGateway);
    getDailyAnalytics(day?: string): Promise<DailyAnalytics>;
}

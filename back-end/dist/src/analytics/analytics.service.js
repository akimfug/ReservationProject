"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
let AnalyticsService = class AnalyticsService {
    prisma;
    realtimeGateway;
    constructor(prisma, realtimeGateway) {
        this.prisma = prisma;
        this.realtimeGateway = realtimeGateway;
    }
    async getDailyAnalytics(day) {
        const targetDate = day ? new Date(day) : new Date();
        if (isNaN(targetDate.getTime())) {
            throw new Error('Некорректная дата');
        }
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        const allReservations = await this.prisma.reservation.findMany({
            where: {
                startAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });
        const completedReservations = allReservations.filter((r) => r.status === client_1.ReservationStatus.SEATED ||
            r.status === client_1.ReservationStatus.COMPLETED ||
            r.status === client_1.ReservationStatus.CONFIRMED);
        const dailyCovers = completedReservations.reduce((total, reservation) => total + reservation.partySize, 0);
        const hourlyCovers = {};
        completedReservations.forEach((reservation) => {
            const hour = reservation.startAt.getHours();
            hourlyCovers[hour] = (hourlyCovers[hour] || 0) + reservation.partySize;
        });
        const peakHoursArray = Object.entries(hourlyCovers)
            .map(([hour, covers]) => ({
            hour: parseInt(hour),
            covers,
        }))
            .sort((a, b) => b.covers - a.covers);
        const peakHours = peakHoursArray.length > 0
            ? `${peakHoursArray[0].hour}:00 - ${peakHoursArray[0].hour + 1}:00`
            : 'Нет данных';
        const diningReservations = allReservations.filter((r) => r.status === client_1.ReservationStatus.COMPLETED && r.seatedAt && r.completedAt);
        let averageDiningTime = '0 мин';
        if (diningReservations.length > 0) {
            const totalMinutes = diningReservations.reduce((total, reservation) => {
                if (reservation.seatedAt && reservation.completedAt) {
                    const diningTime = reservation.completedAt.getTime() - reservation.seatedAt.getTime();
                    return total + diningTime / (1000 * 60);
                }
                return total;
            }, 0);
            const avgMinutes = Math.round(totalMinutes / diningReservations.length);
            const hours = Math.floor(avgMinutes / 60);
            const minutes = avgMinutes % 60;
            if (hours > 0) {
                averageDiningTime = `${hours} ч ${minutes} мин`;
            }
            else {
                averageDiningTime = `${minutes} мин`;
            }
        }
        const totalReservations = allReservations.length;
        const averagePartySize = totalReservations > 0
            ? Math.round((allReservations.reduce((sum, r) => sum + r.partySize, 0) /
                totalReservations) *
                10) / 10
            : 0;
        const occupancyRate = Math.min(Math.round((dailyCovers / 100) * 100), 100);
        const analytics = {
            dailyCovers: isNaN(dailyCovers) ? 0 : dailyCovers,
            peakHours,
            averageDiningTime,
            totalReservations: isNaN(totalReservations) ? 0 : totalReservations,
            occupancyRate: isNaN(occupancyRate) ? 0 : occupancyRate,
            averagePartySize: isNaN(averagePartySize) ? 0 : averagePartySize,
        };
        this.realtimeGateway.notifyAnalyticsUpdate(analytics);
        return analytics;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map
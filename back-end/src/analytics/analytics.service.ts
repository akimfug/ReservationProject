import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationStatus } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';

export interface DailyAnalytics {
  dailyCovers: number;
  peakHours: string;
  averageDiningTime: string;
  totalReservations: number;
  occupancyRate: number;
  averagePartySize: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  async getDailyAnalytics(day?: string): Promise<DailyAnalytics> {
    // Если день не указан или некорректен, используем сегодняшний день
    const targetDate = day ? new Date(day) : new Date();
    // Проверяем, что дата корректна
    if (isNaN(targetDate.getTime())) {
      throw new Error('Некорректная дата');
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Получаем все бронирования за день
    const allReservations = await this.prisma.reservation.findMany({
      where: {
        startAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Получаем завершенные бронирования для расчета covers
    const completedReservations = allReservations.filter(
      (r) =>
        r.status === ReservationStatus.SEATED ||
        r.status === ReservationStatus.COMPLETED ||
        r.status === ReservationStatus.CONFIRMED,
    );

    // Считаем общее количество гостей (covers)
    const dailyCovers = completedReservations.reduce(
      (total, reservation) => total + reservation.partySize,
      0,
    );

    // Считаем пиковые часы
    const hourlyCovers: { [hour: number]: number } = {};
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

    // Форматируем пиковые часы
    const peakHours =
      peakHoursArray.length > 0
        ? `${peakHoursArray[0].hour}:00 - ${peakHoursArray[0].hour + 1}:00`
        : 'Нет данных';

    // Считаем среднее время обеда
    const diningReservations = allReservations.filter(
      (r) =>
        r.status === ReservationStatus.COMPLETED && r.seatedAt && r.completedAt,
    );

    let averageDiningTime = '0 мин';
    if (diningReservations.length > 0) {
      const totalMinutes = diningReservations.reduce((total, reservation) => {
        if (reservation.seatedAt && reservation.completedAt) {
          const diningTime =
            reservation.completedAt.getTime() - reservation.seatedAt.getTime();
          return total + diningTime / (1000 * 60); // конвертируем в минуты
        }
        return total;
      }, 0);

      const avgMinutes = Math.round(totalMinutes / diningReservations.length);
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;

      if (hours > 0) {
        averageDiningTime = `${hours} ч ${minutes} мин`;
      } else {
        averageDiningTime = `${minutes} мин`;
      }
    }

    // Общее количество бронирований
    const totalReservations = allReservations.length;

    // Средний размер компании
    const averagePartySize =
      totalReservations > 0
        ? Math.round(
            (allReservations.reduce((sum, r) => sum + r.partySize, 0) /
              totalReservations) *
              10,
          ) / 10
        : 0;

    // Заполненность зала (упрощенная формула)
    const occupancyRate = Math.min(Math.round((dailyCovers / 100) * 100), 100); // предполагаем максимум 100 гостей в день

    const analytics = {
      dailyCovers: isNaN(dailyCovers) ? 0 : dailyCovers,
      peakHours,
      averageDiningTime,
      totalReservations: isNaN(totalReservations) ? 0 : totalReservations,
      occupancyRate: isNaN(occupancyRate) ? 0 : occupancyRate,
      averagePartySize: isNaN(averagePartySize) ? 0 : averagePartySize,
    };

    // Отправляем real-time обновление аналитики
    this.realtimeGateway.notifyAnalyticsUpdate(analytics);

    return analytics;
  }
}

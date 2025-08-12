import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TableStatus } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class TablesService {
  constructor(
    private prisma: PrismaService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  async findAll(restaurantId: string = 'restaurant-1') {
    return this.prisma.table.findMany({
      where: { restaurantId },
      include: {
        reservations: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED', 'SEATED'],
            },
          },
          orderBy: { startAt: 'asc' },
        },
      },
      orderBy: { number: 'asc' },
    });
  }

  async updateStatus(id: string, status: TableStatus) {
    const updatedTable = await this.prisma.table.update({
      where: { id },
      data: { status },
      include: {
        reservations: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED', 'SEATED'],
            },
          },
        },
      },
    });

    // Отправляем real-time обновление
    this.realtimeGateway.notifyTableUpdate(id, {
      id: updatedTable.id,
      status: updatedTable.status,
      reservations: updatedTable.reservations,
    });

    return updatedTable;
  }

  async assignToReservation(tableId: string, reservationId: string) {
    // Обновляем резервацию
    await this.prisma.reservation.update({
      where: { id: reservationId },
      data: { tableId },
    });

    // Обновляем статус стола
    return this.updateStatus(tableId, TableStatus.RESERVED);
  }
}

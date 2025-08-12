import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationStatus, TableStatus } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';

export interface CreateReservationDto {
  guestName: string;
  phone?: string;
  partySize: number;
  startAt: string;
  expectedEnd?: string;
  specialReq?: string;
  tableId?: string;
  isWalkIn?: boolean;
}

export interface UpdateReservationDto {
  status?: ReservationStatus;
  tableId?: string;
  seatedAt?: string;
  completedAt?: string;
  guestName?: string;
  phone?: string;
  partySize?: number;
  startAt?: string;
  specialReq?: string;
}

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  async findAll(day?: string, restaurantId: string = 'restaurant-1') {
    interface WhereClause {
      restaurantId: string;
      startAt?: {
        gte: Date;
        lte: Date;
      };
    }

    const whereClause: WhereClause = { restaurantId };

    if (day) {
      const startOfDay = new Date(day);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.startAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.reservation.findMany({
      where: whereClause,
      include: {
        table: true,
      },
      orderBy: { startAt: 'asc' },
    });
  }

  async create(
    data: CreateReservationDto,
    restaurantId: string = 'restaurant-1',
  ) {
    const startAt = new Date(data.startAt);

    // Проверяем пересечения если указан стол
    if (data.tableId) {
      await this.checkTimeConflict(data.tableId, startAt, data.expectedEnd);
    }

    const reservation = await this.prisma.reservation.create({
      data: {
        restaurantId,
        guestName: data.guestName,
        phone: data.phone,
        partySize: data.partySize,
        startAt,
        expectedEnd: data.expectedEnd ? new Date(data.expectedEnd) : undefined,
        specialReq: data.specialReq,
        tableId: data.tableId,
        isWalkIn: data.isWalkIn || false,
        status: data.isWalkIn
          ? ReservationStatus.SEATED
          : ReservationStatus.PENDING,
        seatedAt: data.isWalkIn ? new Date() : undefined,
      },
      include: {
        table: true,
      },
    });

    // Обновляем статус стола если это walk-in или подтвержденная бронь
    if (
      data.tableId &&
      (data.isWalkIn || reservation.status === ReservationStatus.CONFIRMED)
    ) {
      await this.prisma.table.update({
        where: { id: data.tableId },
        data: {
          status: data.isWalkIn ? TableStatus.OCCUPIED : TableStatus.RESERVED,
        },
      });
    }

    // Отправляем real-time уведомление о создании бронирования
    this.realtimeGateway.notifyReservationCreated({
      id: reservation.id,
      status: reservation.status,
      guestName: reservation.guestName,
      tableId: reservation.tableId || undefined,
      startAt: reservation.startAt.toISOString(),
      partySize: reservation.partySize,
    });

    return reservation;
  }

  async update(id: string, data: UpdateReservationDto) {
    interface UpdateData {
      status?: ReservationStatus;
      tableId?: string;
      guestName?: string;
      phone?: string;
      partySize?: number;
      specialReq?: string;
      startAt?: Date;
      seatedAt?: Date;
      completedAt?: Date;
    }

    const updateData: UpdateData = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.tableId !== undefined) updateData.tableId = data.tableId;
    if (data.guestName !== undefined) updateData.guestName = data.guestName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.partySize !== undefined) updateData.partySize = data.partySize;
    if (data.specialReq !== undefined) updateData.specialReq = data.specialReq;
    if (data.startAt !== undefined) updateData.startAt = new Date(data.startAt);
    if (data.seatedAt !== undefined)
      updateData.seatedAt = new Date(data.seatedAt);
    if (data.completedAt !== undefined)
      updateData.completedAt = new Date(data.completedAt);

    // Проверяем пересечения если меняется стол или время
    if ((data.tableId || data.startAt) && updateData.tableId) {
      const current = await this.prisma.reservation.findUnique({
        where: { id },
      });
      if (current) {
        await this.checkTimeConflict(
          updateData.tableId,
          updateData.startAt || current.startAt,
          undefined,
          id,
        );
      }
    }

    const reservation = await this.prisma.reservation.update({
      where: { id },
      data: updateData,
      include: {
        table: true,
      },
    });

    // Обновляем статус стола в зависимости от статуса бронирования
    if (reservation.tableId) {
      let tableStatus: TableStatus;
      switch (reservation.status) {
        case ReservationStatus.SEATED:
          tableStatus = TableStatus.OCCUPIED;
          break;
        case ReservationStatus.COMPLETED:
        case ReservationStatus.CANCELED:
        case ReservationStatus.NO_SHOW:
          tableStatus = TableStatus.AVAILABLE;
          break;
        case ReservationStatus.CONFIRMED:
          tableStatus = TableStatus.RESERVED;
          break;
        default:
          tableStatus = TableStatus.AVAILABLE;
      }

      await this.prisma.table.update({
        where: { id: reservation.tableId },
        data: { status: tableStatus },
      });
    }

    // Отправляем real-time уведомление об обновлении бронирования
    this.realtimeGateway.notifyReservationUpdate(reservation.id, {
      id: reservation.id,
      status: reservation.status,
      guestName: reservation.guestName,
      tableId: reservation.tableId || undefined,
      startAt: reservation.startAt.toISOString(),
      partySize: reservation.partySize,
    });

    return reservation;
  }

  async delete(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { table: true },
    });

    if (reservation?.tableId) {
      // Освобождаем стол
      await this.prisma.table.update({
        where: { id: reservation.tableId },
        data: { status: TableStatus.AVAILABLE },
      });
    }

    const deletedReservation = await this.prisma.reservation.delete({
      where: { id },
    });

    // Отправляем real-time уведомление об удалении бронирования
    this.realtimeGateway.notifyReservationDeleted(id);

    return deletedReservation;
  }

  private async checkTimeConflict(
    tableId: string,
    startAt: Date,
    expectedEnd?: string,
    excludeReservationId?: string,
  ) {
    const endAt = expectedEnd
      ? new Date(expectedEnd)
      : new Date(startAt.getTime() + 2 * 60 * 60 * 1000);

    interface ConflictWhereClause {
      tableId: string;
      status: {
        in: ReservationStatus[];
      };
      OR: Array<{
        startAt?: {
          lt?: Date;
          gte?: Date;
        };
        expectedEnd?: {
          gt?: Date;
        };
      }>;
      NOT?: {
        id: string;
      };
    }

    const whereClause: ConflictWhereClause = {
      tableId,
      status: {
        in: [
          ReservationStatus.PENDING,
          ReservationStatus.CONFIRMED,
          ReservationStatus.SEATED,
        ],
      },
      OR: [
        {
          startAt: {
            lt: endAt,
          },
          expectedEnd: {
            gt: startAt,
          },
        },
        {
          startAt: {
            gte: startAt,
            lt: endAt,
          },
        },
      ],
    };

    if (excludeReservationId) {
      whereClause.NOT = { id: excludeReservationId };
    }

    const conflictingReservations = await this.prisma.reservation.findMany({
      where: whereClause,
    });

    if (conflictingReservations.length > 0) {
      throw new BadRequestException(
        'Time slot conflicts with existing reservation',
      );
    }
  }
}

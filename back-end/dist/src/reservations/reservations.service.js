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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
let ReservationsService = class ReservationsService {
    prisma;
    realtimeGateway;
    constructor(prisma, realtimeGateway) {
        this.prisma = prisma;
        this.realtimeGateway = realtimeGateway;
    }
    async findAll(day, restaurantId = 'restaurant-1') {
        const whereClause = { restaurantId };
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
    async create(data, restaurantId = 'restaurant-1') {
        const startAt = new Date(data.startAt);
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
                    ? client_1.ReservationStatus.SEATED
                    : client_1.ReservationStatus.PENDING,
                seatedAt: data.isWalkIn ? new Date() : undefined,
            },
            include: {
                table: true,
            },
        });
        if (data.tableId &&
            (data.isWalkIn || reservation.status === client_1.ReservationStatus.CONFIRMED)) {
            await this.prisma.table.update({
                where: { id: data.tableId },
                data: {
                    status: data.isWalkIn ? client_1.TableStatus.OCCUPIED : client_1.TableStatus.RESERVED,
                },
            });
        }
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
    async update(id, data) {
        const updateData = {};
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.tableId !== undefined)
            updateData.tableId = data.tableId;
        if (data.guestName !== undefined)
            updateData.guestName = data.guestName;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.partySize !== undefined)
            updateData.partySize = data.partySize;
        if (data.specialReq !== undefined)
            updateData.specialReq = data.specialReq;
        if (data.startAt !== undefined)
            updateData.startAt = new Date(data.startAt);
        if (data.seatedAt !== undefined)
            updateData.seatedAt = new Date(data.seatedAt);
        if (data.completedAt !== undefined)
            updateData.completedAt = new Date(data.completedAt);
        if ((data.tableId || data.startAt) && updateData.tableId) {
            const current = await this.prisma.reservation.findUnique({
                where: { id },
            });
            if (current) {
                await this.checkTimeConflict(updateData.tableId, updateData.startAt || current.startAt, undefined, id);
            }
        }
        const reservation = await this.prisma.reservation.update({
            where: { id },
            data: updateData,
            include: {
                table: true,
            },
        });
        if (reservation.tableId) {
            let tableStatus;
            switch (reservation.status) {
                case client_1.ReservationStatus.SEATED:
                    tableStatus = client_1.TableStatus.OCCUPIED;
                    break;
                case client_1.ReservationStatus.COMPLETED:
                case client_1.ReservationStatus.CANCELED:
                case client_1.ReservationStatus.NO_SHOW:
                    tableStatus = client_1.TableStatus.AVAILABLE;
                    break;
                case client_1.ReservationStatus.CONFIRMED:
                    tableStatus = client_1.TableStatus.RESERVED;
                    break;
                default:
                    tableStatus = client_1.TableStatus.AVAILABLE;
            }
            await this.prisma.table.update({
                where: { id: reservation.tableId },
                data: { status: tableStatus },
            });
        }
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
    async delete(id) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: { table: true },
        });
        if (reservation?.tableId) {
            await this.prisma.table.update({
                where: { id: reservation.tableId },
                data: { status: client_1.TableStatus.AVAILABLE },
            });
        }
        const deletedReservation = await this.prisma.reservation.delete({
            where: { id },
        });
        this.realtimeGateway.notifyReservationDeleted(id);
        return deletedReservation;
    }
    async checkTimeConflict(tableId, startAt, expectedEnd, excludeReservationId) {
        const endAt = expectedEnd
            ? new Date(expectedEnd)
            : new Date(startAt.getTime() + 2 * 60 * 60 * 1000);
        const whereClause = {
            tableId,
            status: {
                in: [
                    client_1.ReservationStatus.PENDING,
                    client_1.ReservationStatus.CONFIRMED,
                    client_1.ReservationStatus.SEATED,
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
            throw new common_1.BadRequestException('Time slot conflicts with existing reservation');
        }
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map
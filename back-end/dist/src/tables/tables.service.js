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
exports.TablesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
let TablesService = class TablesService {
    prisma;
    realtimeGateway;
    constructor(prisma, realtimeGateway) {
        this.prisma = prisma;
        this.realtimeGateway = realtimeGateway;
    }
    async findAll(restaurantId = 'restaurant-1') {
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
    async updateStatus(id, status) {
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
        this.realtimeGateway.notifyTableUpdate(id, {
            id: updatedTable.id,
            status: updatedTable.status,
            reservations: updatedTable.reservations,
        });
        return updatedTable;
    }
    async assignToReservation(tableId, reservationId) {
        await this.prisma.reservation.update({
            where: { id: reservationId },
            data: { tableId },
        });
        return this.updateStatus(tableId, client_1.TableStatus.RESERVED);
    }
};
exports.TablesService = TablesService;
exports.TablesService = TablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], TablesService);
//# sourceMappingURL=tables.service.js.map
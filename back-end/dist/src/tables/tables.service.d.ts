import { PrismaService } from '../prisma/prisma.service';
import { TableStatus } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export declare class TablesService {
    private prisma;
    private realtimeGateway;
    constructor(prisma: PrismaService, realtimeGateway: RealtimeGateway);
    findAll(restaurantId?: string): Promise<({
        reservations: {
            id: string;
            createdAt: Date;
            restaurantId: string;
            status: import(".prisma/client").$Enums.ReservationStatus;
            updatedAt: Date;
            guestName: string;
            phone: string | null;
            partySize: number;
            startAt: Date;
            expectedEnd: Date | null;
            seatedAt: Date | null;
            completedAt: Date | null;
            specialReq: string | null;
            isWalkIn: boolean;
            tableId: string | null;
        }[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        restaurantId: string;
        seats: number;
        status: import(".prisma/client").$Enums.TableStatus;
        posX: number | null;
        posY: number | null;
    })[]>;
    updateStatus(id: string, status: TableStatus): Promise<{
        reservations: {
            id: string;
            createdAt: Date;
            restaurantId: string;
            status: import(".prisma/client").$Enums.ReservationStatus;
            updatedAt: Date;
            guestName: string;
            phone: string | null;
            partySize: number;
            startAt: Date;
            expectedEnd: Date | null;
            seatedAt: Date | null;
            completedAt: Date | null;
            specialReq: string | null;
            isWalkIn: boolean;
            tableId: string | null;
        }[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        restaurantId: string;
        seats: number;
        status: import(".prisma/client").$Enums.TableStatus;
        posX: number | null;
        posY: number | null;
    }>;
    assignToReservation(tableId: string, reservationId: string): Promise<{
        reservations: {
            id: string;
            createdAt: Date;
            restaurantId: string;
            status: import(".prisma/client").$Enums.ReservationStatus;
            updatedAt: Date;
            guestName: string;
            phone: string | null;
            partySize: number;
            startAt: Date;
            expectedEnd: Date | null;
            seatedAt: Date | null;
            completedAt: Date | null;
            specialReq: string | null;
            isWalkIn: boolean;
            tableId: string | null;
        }[];
    } & {
        number: string;
        id: string;
        createdAt: Date;
        restaurantId: string;
        seats: number;
        status: import(".prisma/client").$Enums.TableStatus;
        posX: number | null;
        posY: number | null;
    }>;
}

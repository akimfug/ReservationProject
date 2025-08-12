import { TablesService } from './tables.service';
import { TableStatus } from '@prisma/client';
export declare class TablesController {
    private readonly tablesService;
    constructor(tablesService: TablesService);
    findAll(): Promise<({
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
    updateStatus(id: string, body: {
        status: TableStatus;
        reservationId?: string;
    }): Promise<{
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

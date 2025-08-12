import { PrismaService } from '../prisma/prisma.service';
import { ReservationStatus } from '@prisma/client';
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
export declare class ReservationsService {
    private prisma;
    private realtimeGateway;
    constructor(prisma: PrismaService, realtimeGateway: RealtimeGateway);
    findAll(day?: string, restaurantId?: string): Promise<({
        table: {
            number: string;
            id: string;
            createdAt: Date;
            restaurantId: string;
            seats: number;
            status: import(".prisma/client").$Enums.TableStatus;
            posX: number | null;
            posY: number | null;
        } | null;
    } & {
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
    })[]>;
    create(data: CreateReservationDto, restaurantId?: string): Promise<{
        table: {
            number: string;
            id: string;
            createdAt: Date;
            restaurantId: string;
            seats: number;
            status: import(".prisma/client").$Enums.TableStatus;
            posX: number | null;
            posY: number | null;
        } | null;
    } & {
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
    }>;
    update(id: string, data: UpdateReservationDto): Promise<{
        table: {
            number: string;
            id: string;
            createdAt: Date;
            restaurantId: string;
            seats: number;
            status: import(".prisma/client").$Enums.TableStatus;
            posX: number | null;
            posY: number | null;
        } | null;
    } & {
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
    }>;
    delete(id: string): Promise<{
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
    }>;
    private checkTimeConflict;
}

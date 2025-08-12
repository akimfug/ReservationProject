import { ReservationsService, CreateReservationDto, UpdateReservationDto } from './reservations.service';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    findAll(day?: string): Promise<({
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
    create(createReservationDto: CreateReservationDto): Promise<{
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
    update(id: string, updateReservationDto: UpdateReservationDto): Promise<{
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
    remove(id: string): Promise<{
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
}

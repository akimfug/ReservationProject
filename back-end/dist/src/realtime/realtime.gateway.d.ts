import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
interface TableUpdateData {
    id: string;
    status: string;
    reservations?: any[];
}
interface ReservationUpdateData {
    id: string;
    status: string;
    guestName: string;
    tableId?: string;
    startAt: string;
    partySize: number;
}
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    notifyTableUpdate(tableId: string, tableData: TableUpdateData): void;
    notifyReservationUpdate(reservationId: string, reservationData: ReservationUpdateData): void;
    notifyReservationCreated(reservationData: ReservationUpdateData): void;
    notifyReservationDeleted(reservationId: string): void;
    notifyAnalyticsUpdate(analyticsData: Record<string, any>): void;
}
export {};

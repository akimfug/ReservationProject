import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

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

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Методы для отправки обновлений
  notifyTableUpdate(tableId: string, tableData: TableUpdateData) {
    this.server.emit('table-updated', { tableId, tableData });
  }

  notifyReservationUpdate(
    reservationId: string,
    reservationData: ReservationUpdateData,
  ) {
    this.server.emit('reservation-updated', { reservationId, reservationData });
  }

  notifyReservationCreated(reservationData: ReservationUpdateData) {
    this.server.emit('reservation-created', reservationData);
  }

  notifyReservationDeleted(reservationId: string) {
    this.server.emit('reservation-deleted', { reservationId });
  }

  notifyAnalyticsUpdate(analyticsData: Record<string, any>) {
    this.server.emit('analytics-updated', analyticsData);
  }
}

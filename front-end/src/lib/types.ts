export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SEATED"
  | "COMPLETED"
  | "CANCELED"
  | "NO_SHOW";

export type TableStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "OCCUPIED"
  | "OUT_OF_SERVICE";

export interface Reservation {
  id: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  restaurantId: string;
  tableId: string;
  status: ReservationStatus;
  guestName: string;
  phone: string | null;
  partySize: number;
  startAt: string; // ISO date
  expectedEnd: string | null; // ISO date or null
  seatedAt: string | null; // ISO date or null
  completedAt: string | null; // ISO date or null
  specialReq: string | null;
  isWalkIn: boolean;
}

export interface Table {
  id: string;
  createdAt: string; // ISO date
  restaurantId: string;
  number: string;
  seats: number;
  status: TableStatus;
  posX: number;
  posY: number;
  reservations: Reservation[];
}

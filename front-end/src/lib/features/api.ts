import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Table, Reservation, TableStatus, ReservationStatus } from '../types.ts'

export interface Analytics {
  dailyCovers: number
  peakHours: string
  averageDiningTime: string
  totalReservations: number
  occupancyRate: number
  averagePartySize: number
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001',
    credentials: 'include',
  }),
  tagTypes: ['Tables', 'Table', 'Reservations', 'Reservation'],
  endpoints: (build) => ({

    // ----- Tables -----
    getTables: build.query<Table[], void>({
      query: () => 'api/tables',
      providesTags: (result) =>
        result
          ? [
              ...result.map(t => ({ type: 'Table' as const, id: t.id })),
              { type: 'Tables', id: 'LIST' },
            ]
          : [{ type: 'Tables', id: 'LIST' }],
    }),

    getTable: build.query<Table, string>({
      query: (tableId) => `api/tables/${tableId}`,
      providesTags: (_res, _err, id) => [{ type: 'Table', id }],
    }),

    updateTableStatus: build.mutation<
      { ok: true; table: Table },
      { tableId: string; status: TableStatus }
    >({
      query: ({ tableId, status }) => ({
        url: `api/tables/${tableId}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_res, _err, { tableId }) => [
        { type: 'Table', id: tableId },
        { type: 'Tables', id: 'LIST' },
      ],
    }),

    // ----- Reservations -----
    createReservation: build.mutation<
      { ok: true; reservation: Reservation },
      Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>
    >({
      query: (body) => ({
        url: 'api/reservations',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Reservations', id: 'LIST' }, { type: 'Tables', id: 'LIST' }],
    }),

    updateReservationStatus: build.mutation<
      { ok: true; reservation: Reservation },
      { reservationId: string; status: ReservationStatus; seatedAt?: string; completedAt?: string }
    >({
      query: ({ reservationId, ...rest }) => ({
        url: `api/reservations/${reservationId}`,
        method: 'PATCH',
        body: rest,
      }),
      invalidatesTags: (_r, _e, { reservationId }) => [
        { type: 'Reservation', id: reservationId },
        { type: 'Reservations', id: 'LIST' },
        { type: 'Tables', id: 'LIST' },
      ],
    }),

    removeReservation: build.mutation<
      Reservation,
      { reservationId: string }
    >({
      query: ({ reservationId }) => ({
        url: `api/reservations/${reservationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { reservationId }) => [
        { type: 'Reservation', id: reservationId },
        { type: 'Reservations', id: 'LIST' },
        { type: 'Tables', id: 'LIST' },
      ],
    }),

    // ----- Analytics -----
    getAnalytics: build.query<Analytics, void>({
      query: () => 'api/analytics/daily',
      providesTags: [{ type: 'Tables', id: 'ANALYTICS' }],
    }),

  }),
})

export const {
  useGetTablesQuery,
  useGetTableQuery,
  useUpdateTableStatusMutation,
  useCreateReservationMutation,
  useUpdateReservationStatusMutation,
  useRemoveReservationMutation,
  useGetAnalyticsQuery,
} = api
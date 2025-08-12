import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Table, Reservation, ReservationStatus, TableStatus } from '../types'
type Tables = { value: Table[] }
const initialState: Tables = { value: [] }

const tablesSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    setTables: (state, action: PayloadAction<Table[]>) => {
      state.value = action.payload
    },

    // Добавить бронь к столу
    addReservation: (
      state,
      action: PayloadAction<{ tableId: string; reservation: Reservation }>
    ) => {
      const table = state.value.find(t => t.id === action.payload.tableId)
      if (table) {
        table.reservations.push(action.payload.reservation)
      }
    },

    // Удалить бронь из стола
    removeReservation: (
      state,
      action: PayloadAction<{ tableId: string; reservationId: string }>
    ) => {
      const table = state.value.find(t => t.id === action.payload.tableId)
      if (table) {
        table.reservations = table.reservations.filter(
          r => r.id !== action.payload.reservationId
        )
      }
    },

    // Обновить статус стола
    updateTableStatus: (
      state,
      action: PayloadAction<{ tableId: string; status: TableStatus }>
    ) => {
      const table = state.value.find(t => t.id === action.payload.tableId)
      if (table) {
        table.status = action.payload.status
      }
    },

    // Обновить статус брони
    updateReservationStatus: (
      state,
      action: PayloadAction<{
        tableId: string
        reservationId: string
        status: ReservationStatus
      }>
    ) => {
      const table = state.value.find(t => t.id === action.payload.tableId)
      if (table) {
        const reservation = table.reservations.find(
          r => r.id === action.payload.reservationId
        )
        if (reservation) {
          reservation.status = action.payload.status
        }
      }
    }
  },
})
export const {
  setTables,
  addReservation,
  removeReservation,
  updateTableStatus,
  updateReservationStatus
} = tablesSlice.actions

export default tablesSlice.reducer
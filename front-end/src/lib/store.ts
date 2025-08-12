import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import restaurant from './features/tablesSlice'
import { api } from './features/api' // опц.

export const makeStore = () => configureStore({
  reducer: {
    restaurant,
    [api.reducerPath]: api.reducer, // опц.
  },
  middleware: (gDM) => gDM().concat(api.middleware), // опц.
})

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
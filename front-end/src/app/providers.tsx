'use client'
import { Provider } from 'react-redux'
import { makeStore } from '@/lib/store'
import WebSocketProvider from './websocket-provider'

const store = makeStore()
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <WebSocketProvider>
        {children}
      </WebSocketProvider>
    </Provider>
  )
}
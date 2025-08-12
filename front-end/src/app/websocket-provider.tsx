'use client'
import { useWebSocket } from '@/lib/hooks/useWebSocket'

export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
  // Инициализируем WebSocket подключение
  useWebSocket()
  
  return <>{children}</>
}

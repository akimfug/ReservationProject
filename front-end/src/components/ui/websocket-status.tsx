'use client'
import { useState, useEffect } from 'react'
import { Badge } from './badge'
import { Wifi, WifiOff } from 'lucide-react'
import { io } from 'socket.io-client'

export function WebSocketStatus() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    return () => {
      newSocket.close()
    }
  }, [])

  return (
    <Badge 
      variant={isConnected ? 'default' : 'destructive'}
      className="flex items-center gap-1 text-xs"
    >
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          Онлайн
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          Оффлайн
        </>
      )}
    </Badge>
  )
}

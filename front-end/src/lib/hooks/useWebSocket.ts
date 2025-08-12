'use client'
import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppDispatch } from '../store'
import { api } from '../features/api'
import { useToast } from './use-toast'

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null)
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  useEffect(() => {
    // Создаем подключение к WebSocket
    socketRef.current = io('http://localhost:3001', {
      transports: ['websocket'],
    })

    const socket = socketRef.current

    // Обработка событий подключения
    socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    // Обработка обновлений столов
    socket.on('table-updated', ({ tableId, tableData }) => {
      console.log('Table updated:', tableId, tableData)
      // Инвалидируем кэш столов для обновления данных
      dispatch(api.util.invalidateTags(['Tables', { type: 'Table', id: tableId }]))
    })

    // Обработка обновлений бронирований
    socket.on('reservation-updated', ({ reservationId, reservationData }) => {
      console.log('Reservation updated:', reservationId, reservationData)
      // Инвалидируем кэш бронирований и столов
      dispatch(api.util.invalidateTags([
        'Reservations',
        'Tables',
        { type: 'Reservation', id: reservationId }
      ]))
      
      // Показываем уведомление
      toast({
        title: 'Бронирование обновлено',
        description: `Статус бронирования ${reservationData.guestName} изменен`,
        variant: 'default',
      })
    })

    // Обработка создания новых бронирований
    socket.on('reservation-created', (reservationData) => {
      console.log('New reservation created:', reservationData)
      // Инвалидируем кэш для обновления данных
      dispatch(api.util.invalidateTags(['Reservations', 'Tables']))
      
      // Показываем уведомление
      toast({
        title: 'Новое бронирование',
        description: `Создано бронирование для ${reservationData.guestName}`,
        variant: 'default',
      })
    })

    // Обработка удаления бронирований
    socket.on('reservation-deleted', ({ reservationId }) => {
      console.log('Reservation deleted:', reservationId)
      // Инвалидируем кэш для обновления данных
      dispatch(api.util.invalidateTags([
        'Reservations',
        'Tables',
        { type: 'Reservation', id: reservationId }
      ]))
      
      // Показываем уведомление
      toast({
        title: 'Бронирование удалено',
        description: 'Бронирование было успешно удалено',
        variant: 'default',
      })
    })

    // Обработка обновлений аналитики
    socket.on('analytics-updated', (analyticsData) => {
      console.log('Analytics updated:', analyticsData)
      // Инвалидируем кэш аналитики
      dispatch(api.util.invalidateTags([{ type: 'Tables', id: 'ANALYTICS' }]))
    })

    // Очистка при размонтировании компонента
    return () => {
      socket.disconnect()
    }
  }, [dispatch, toast])

  return socketRef.current
}

// Hook для использования в компонентах без toast
export function useWebSocketConnection() {
  const socketRef = useRef<Socket | null>(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:3001', {
        transports: ['websocket'],
      })

      const socket = socketRef.current

      socket.on('connect', () => {
        console.log('WebSocket connected')
      })

      socket.on('table-updated', ({ tableId }) => {
        dispatch(api.util.invalidateTags(['Tables', { type: 'Table', id: tableId }]))
      })

      socket.on('reservation-updated', ({ reservationId }) => {
        dispatch(api.util.invalidateTags([
          'Reservations',
          'Tables',
          { type: 'Reservation', id: reservationId }
        ]))
      })

      socket.on('reservation-created', () => {
        dispatch(api.util.invalidateTags(['Reservations', 'Tables']))
      })

      socket.on('reservation-deleted', ({ reservationId }) => {
        dispatch(api.util.invalidateTags([
          'Reservations',
          'Tables',
          { type: 'Reservation', id: reservationId }
        ]))
      })

      socket.on('analytics-updated', () => {
        dispatch(api.util.invalidateTags([{ type: 'Tables', id: 'ANALYTICS' }]))
      })
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [dispatch])

  return socketRef.current
}

'use client'
import { useUpdateReservationStatusMutation, useRemoveReservationMutation } from '@/lib/features/api'
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/lib/hooks/use-toast"
import { useState } from "react"
import { 
  UserCheck, 
  CheckCircle, 
  XCircle, 
  Trash2,
  Clock
} from "lucide-react"
import type { Reservation, ReservationStatus } from '@/lib/types'

interface ReservationActionsProps {
  reservation: Reservation
}

export function ReservationActions({ reservation }: ReservationActionsProps) {
  const [updateRes, { isLoading: isUpdating }] = useUpdateReservationStatusMutation()
  const [removeRes, { isLoading: isDeleting }] = useRemoveReservationMutation()
  const { toast } = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const updateStatus = async (status: ReservationStatus, additionalData?: object) => {
    try {
      await updateRes({ 
        reservationId: reservation.id, 
        status,
        ...additionalData 
      }).unwrap()
      
      toast({
        title: "Статус обновлен",
        description: getStatusMessage(status),
        variant: "success",
      })
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус бронирования",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    try {
      await removeRes({ reservationId: reservation.id }).unwrap()
      toast({
        title: "Бронирование удалено",
        description: `Бронирование ${reservation.guestName} было удалено`,
        variant: "success",
      })
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить бронирование",
        variant: "destructive",
      })
    }
  }

  const seat = () => updateStatus('SEATED', { seatedAt: new Date().toISOString() })
  const complete = () => updateStatus('COMPLETED', { completedAt: new Date().toISOString() })
  const confirm = () => updateStatus('CONFIRMED')
  const cancel = () => updateStatus('CANCELED')
  const noShow = () => updateStatus('NO_SHOW')

  const getStatusMessage = (status: ReservationStatus) => {
    switch (status) {
      case 'SEATED': return 'Гости посажены за стол'
      case 'COMPLETED': return 'Обслуживание завершено'
      case 'CONFIRMED': return 'Бронирование подтверждено'
      case 'CANCELED': return 'Бронирование отменено'
      case 'NO_SHOW': return 'Гости не явились'
      default: return 'Статус обновлен'
    }
  }

  const isLoading = isUpdating || isDeleting

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {reservation.status === 'PENDING' && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={confirm}
              disabled={isLoading}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Подтвердить
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={seat}
              disabled={isLoading}
            >
              <UserCheck className="w-4 h-4 mr-1" />
              Посадить
            </Button>
          </>
        )}

        {reservation.status === 'CONFIRMED' && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={seat}
              disabled={isLoading}
            >
              <UserCheck className="w-4 h-4 mr-1" />
              Посадить
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={noShow}
              disabled={isLoading}
            >
              <Clock className="w-4 h-4 mr-1" />
              No Show
            </Button>
          </>
        )}

        {reservation.status === 'SEATED' && (
          <Button
            size="sm"
            variant="outline"
            onClick={complete}
            disabled={isLoading}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Завершить
          </Button>
        )}

        {['PENDING', 'CONFIRMED'].includes(reservation.status) && (
          <Button
            size="sm"
            variant="outline"
            onClick={cancel}
            disabled={isLoading}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Отменить
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => setConfirmDelete(true)}
          disabled={isLoading}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Удалить
        </Button>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить бронирование?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить бронирование для {reservation.guestName}? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
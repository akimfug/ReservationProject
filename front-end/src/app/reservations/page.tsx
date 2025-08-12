'use client'
import { useGetTablesQuery } from '@/lib/features/api'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReservationActions } from "@/components/ReservationActions/reservationActions"
import { Spinner } from "@/components/ui/spinner"
import { 
  Users, 
  Clock, 
  Calendar,
  Phone,
  MessageCircle,
  ArrowLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { Reservation, Table } from '@/lib/types'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'SEATED': return 'bg-green-100 text-green-800 border-green-200'
    case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'CANCELED': return 'bg-red-100 text-red-800 border-red-200'
    case 'NO_SHOW': return 'bg-orange-100 text-orange-800 border-orange-200'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING': return 'Ожидает'
    case 'CONFIRMED': return 'Подтверждено'
    case 'SEATED': return 'Посажены'
    case 'COMPLETED': return 'Завершено'
    case 'CANCELED': return 'Отменено'
    case 'NO_SHOW': return 'Не явились'
    default: return status
  }
}

export default function ReservationsPage() {
  const { data: tables, isLoading, isError } = useGetTablesQuery()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center text-red-600 min-h-[50vh] flex items-center justify-center">
        Ошибка загрузки данных
      </div>
    )
  }

  // Собираем все бронирования из всех столов
  const allReservations: (Reservation & { table: Table })[] = []
  tables?.forEach(table => {
    if (table.reservations) {
      table.reservations.forEach(reservation => {
        allReservations.push({
          ...reservation,
          table
        })
      })
    }
  })

  // Сортируем бронирования по дате
  allReservations.sort((a, b) => 
    new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  )

  const today = new Date().toDateString()
  const todayReservations = allReservations.filter(res => 
    new Date(res.startAt).toDateString() === today
  )
  const futureReservations = allReservations.filter(res => 
    new Date(res.startAt).toDateString() > today
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к столам
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Все бронирования</h1>
          <p className="text-muted-foreground">
            Управление всеми бронированиями ресторана
          </p>
        </div>
      </div>

      {allReservations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет бронирований</h3>
            <p className="text-muted-foreground">
              Пока что нет активных бронирований
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Сегодняшние бронирования */}
          {todayReservations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Сегодня ({todayReservations.length})
              </h2>
              <div className="grid gap-4">
                {todayReservations.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))}
              </div>
            </div>
          )}

          {/* Будущие бронирования */}
          {futureReservations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Предстоящие ({futureReservations.length})
              </h2>
              <div className="grid gap-4">
                {futureReservations.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReservationCard({ reservation }: { reservation: Reservation & { table?: Table } }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{reservation.guestName}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(reservation.startAt).toLocaleDateString('ru', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })} в {new Date(reservation.startAt).toLocaleTimeString('ru', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              {reservation.table && (
                <div className="flex items-center gap-1">
                  <span>Стол {reservation.table.number}</span>
                </div>
              )}
            </div>
          </div>
          <Badge className={cn("text-xs", getStatusColor(reservation.status))}>
            {getStatusText(reservation.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{reservation.partySize} {reservation.partySize === 1 ? 'гость' : reservation.partySize < 5 ? 'гостя' : 'гостей'}</span>
            </div>
            {reservation.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{reservation.phone}</span>
              </div>
            )}
          </div>
          
          {reservation.specialReq && (
            <div className="flex items-start gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span className="text-muted-foreground">{reservation.specialReq}</span>
            </div>
          )}
        </div>
        
        <ReservationActions reservation={reservation} />
      </CardContent>
    </Card>
  )
}

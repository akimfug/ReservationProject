'use client'
import { useGetTablesQuery, useUpdateTableStatusMutation } from '@/lib/features/api'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ReservationActions } from "@/components/ReservationActions/reservationActions"
import { 
  Users, 
  Clock, 
  MoreVertical, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Settings,
  Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"
import ReservationModal from "@/components/ReservationModal"
import type { Table, TableStatus } from '@/lib/types'
import { useToast } from "@/lib/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"

const getStatusColor = (status: TableStatus) => {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'RESERVED':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'OCCUPIED':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'OUT_OF_SERVICE':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusText = (status: TableStatus) => {
  switch (status) {
    case 'AVAILABLE':
      return 'Свободен'
    case 'RESERVED':
      return 'Забронирован'
    case 'OCCUPIED':
      return 'Занят'
    case 'OUT_OF_SERVICE':
      return 'Не работает'
    default:
      return 'Неизвестно'
  }
}

const getStatusIcon = (status: TableStatus) => {
  switch (status) {
    case 'AVAILABLE':
      return <UserPlus className="w-4 h-4" />
    case 'RESERVED':
      return <Calendar className="w-4 h-4" />
    case 'OCCUPIED':
      return <UserCheck className="w-4 h-4" />
    case 'OUT_OF_SERVICE':
      return <Settings className="w-4 h-4" />
    default:
      return <UserX className="w-4 h-4" />
  }
}

function TableCard({ table }: { table: Table }) {
  const [updateTableStatus, { isLoading: isUpdating }] = useUpdateTableStatusMutation()
  const { toast } = useToast()

  const handleStatusChange = async (status: TableStatus) => {
    try {
      await updateTableStatus({ 
        tableId: table.id, 
        status 
      }).unwrap()
      
      toast({
        title: "Статус обновлен",
        description: `Стол ${table.number} теперь ${getStatusText(status).toLowerCase()}`,
        variant: "success",
      })
    } catch (error) {
      console.error('Ошибка обновления статуса стола:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус стола",
        variant: "destructive",
      })
    }
  }

  const activeReservations = table.reservations?.filter(
    r => ['PENDING', 'CONFIRMED', 'SEATED'].includes(r.status)
  ) || []

  return (
    <Card className={cn(
      "relative transition-all duration-200 hover:shadow-md",
      table.status === 'AVAILABLE' && "hover:shadow-green-200",
      table.status === 'RESERVED' && "hover:shadow-yellow-200", 
      table.status === 'OCCUPIED' && "hover:shadow-red-200",
      table.status === 'OUT_OF_SERVICE' && "opacity-75",
      isUpdating && "opacity-50 pointer-events-none"
    )}>
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
          <Spinner size="sm" className="text-blue-600" />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            Стол {table.number}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table.status === 'AVAILABLE' && (
                <>
                  <ReservationModal
                    table={table}
                    trigger={
                      <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Забронировать
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuItem onClick={() => handleStatusChange('OCCUPIED')}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Посадить (Walk-in)
                  </DropdownMenuItem>
                </>
              )}
              
              {table.status === 'RESERVED' && (
                <DropdownMenuItem onClick={() => handleStatusChange('OCCUPIED')}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Посадить
                </DropdownMenuItem>
              )}
              
              {table.status === 'OCCUPIED' && (
                <DropdownMenuItem onClick={() => handleStatusChange('AVAILABLE')}>
                  <UserX className="mr-2 h-4 w-4" />
                  Освободить
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => handleStatusChange('AVAILABLE')}>
                <UserPlus className="mr-2 h-4 w-4" />
                Свободен
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleStatusChange('OUT_OF_SERVICE')}
                className="text-red-600"
              >
                <Settings className="mr-2 h-4 w-4" />
                В ремонт
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={cn("text-xs", getStatusColor(table.status))}>
            {getStatusIcon(table.status)}
            <span className="ml-1">{getStatusText(table.status)}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <Users className="w-4 h-4" />
          <span>{table.seats} {table.seats === 1 ? 'место' : table.seats < 5 ? 'места' : 'мест'}</span>
        </div>

        {activeReservations.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Активные бронирования:
            </div>
            {activeReservations.slice(0, 2).map((reservation) => (
              <div key={reservation.id} className="bg-muted/50 p-2 rounded text-xs">
                <div className="font-medium">{reservation.guestName}</div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(reservation.startAt).toLocaleTimeString('ru', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  <span className="mx-1">•</span>
                  <Users className="w-3 h-3" />
                  {reservation.partySize}
                </div>
                <div className="flex items-center justify-between mt-2">
                  {reservation.status && (
                    <Badge variant="outline" className="text-xs">
                      {reservation.status === 'PENDING' && 'Ожидает'}
                      {reservation.status === 'CONFIRMED' && 'Подтверждено'}
                      {reservation.status === 'SEATED' && 'Посажены'}
                      {reservation.status === 'COMPLETED' && 'Завершено'}
                      {reservation.status === 'CANCELED' && 'Отменено'}
                      {reservation.status === 'NO_SHOW' && 'Не явились'}
                    </Badge>
                  )}
                </div>
                <div className="mt-2">
                  <ReservationActions reservation={reservation} />
                </div>
              </div>
            ))}
            {activeReservations.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{activeReservations.length - 2} еще
              </div>
            )}
          </div>
        )}

        {table.status === 'AVAILABLE' && activeReservations.length === 0 && (
          <div className="space-y-2">
            <ReservationModal
              table={table}
              trigger={
                <Button variant="outline" size="sm" className="w-full">
                  <Calendar className="w-4 h-4 mr-1" />
                  Забронировать
                </Button>
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function TablesView() {
  const { data: tables, isLoading, isError } = useGetTablesQuery()

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Загрузка столов...</p>
          </div>
        </div>
      </div>
    )
  }
  
  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">Ошибка загрузки данных</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Попробовать еще раз
          </Button>
        </div>
      </div>
    )
  }

  if (!tables || tables.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Столы не найдены</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">План зала</h2>
          <p className="text-gray-600">Всего столов: {tables.length}</p>
        </div>
        
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <UserPlus className="w-3 h-3 mr-1" />
            Свободных: {tables.filter(t => t.status === 'AVAILABLE').length}
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Calendar className="w-3 h-3 mr-1" />
            Забронированных: {tables.filter(t => t.status === 'RESERVED').length}
          </Badge>
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <UserCheck className="w-3 h-3 mr-1" />
            Занятых: {tables.filter(t => t.status === 'OCCUPIED').length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <TableCard key={table.id} table={table} />
        ))}
      </div>
    </div>
  )
}
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import { useCreateReservationMutation } from "@/lib/features/api"
import type { Table } from "@/lib/types"
import { useToast } from "@/lib/hooks/use-toast"

const reservationSchema = z.object({
  guestName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().optional(),
  partySize: z.number().min(1, "Минимум 1 человек").max(10, "Максимум 10 человек"),
  date: z.date({ message: "Выберите дату" }),
  time: z.string().min(1, "Выберите время"),
  specialReq: z.string().optional(),
})

type ReservationFormData = z.infer<typeof reservationSchema>

interface ReservationModalProps {
  table: Table
  trigger: React.ReactNode
}

export default function ReservationModal({ table, trigger }: ReservationModalProps) {
  const [open, setOpen] = useState(false)
  const [createReservation, { isLoading }] = useCreateReservationMutation()
  const { toast } = useToast()
  
  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      guestName: "",
      phone: "",
      partySize: 2,
      specialReq: "",
    },
  })

  const onSubmit = async (data: ReservationFormData) => {
    try {
      const startAt = new Date(data.date)
      const [hours, minutes] = data.time.split(':').map(Number)
      startAt.setHours(hours, minutes, 0, 0)

      await createReservation({
        guestName: data.guestName,
        phone: data.phone || null,
        partySize: data.partySize,
        startAt: startAt.toISOString(),
        expectedEnd: new Date(startAt.getTime() + 2 * 60 * 60 * 1000).toISOString(), // +2 часа
        specialReq: data.specialReq || null,
        tableId: table.id,
        restaurantId: "default", // TODO: получать из контекста
        status: "PENDING",
        seatedAt: null,
        completedAt: null,
        isWalkIn: false,
      }).unwrap()

      setOpen(false)
      form.reset()
      
      toast({
        title: "Бронирование создано!",
        description: `Стол ${table.number} забронирован на ${data.guestName}`,
        variant: "success",
      })
    } catch (error) {
      console.error('Ошибка создания бронирования:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось создать бронирование. Попробуйте еще раз.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Забронировать стол {table.number}</DialogTitle>
          <DialogDescription>
            Стол на {table.seats} {table.seats === 1 ? 'место' : table.seats < 5 ? 'места' : 'мест'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя гостя *</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите имя" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон</FormLabel>
                  <FormControl>
                    <Input placeholder="+7 (999) 123-45-67" {...field} />
                  </FormControl>
                  <FormDescription>
                    Необязательное поле
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partySize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Количество гостей *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value)
                        field.onChange(isNaN(value) ? 0 : value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Дата *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        {...field}
                        value={field.value ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null
                          field.onChange(date)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Время *</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="specialReq"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Особые пожелания</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Столик у окна, детский стульчик..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Любые особые требования или пожелания
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Создание..." : "Забронировать"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

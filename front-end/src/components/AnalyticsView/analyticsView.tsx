'use client'

import React from 'react'
import { useGetAnalyticsQuery } from '@/lib/features/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'

interface MetricCardProps {
  title: string
  value: number
  trend?: 'up' | 'down' | 'stable'
  description: string
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, description }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'bg-green-100 text-green-800'
      case 'down':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗'
      case 'down':
        return '↘'
      default:
        return '→'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {trend && (
          <Badge className={getTrendColor()}>
            {getTrendIcon()}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{isNaN(value) ? '0' : value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

const AnalyticsView: React.FC = () => {
  const { data, error, isLoading } = useGetAnalyticsQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
        <span className="ml-2">Загрузка аналитики...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Ошибка загрузки аналитики</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Нет данных для отображения</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Аналитика ресторана</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Дневные covers"
          value={data.dailyCovers}
          description="Общее количество гостей за день"
        />
        
        <MetricCard
          title="Всего бронирований"
          value={data.totalReservations}
          description="За сегодня"
        />
        
        <MetricCard
          title="Заполненность"
          value={data.occupancyRate}
          trend={data.occupancyRate > 70 ? 'up' : data.occupancyRate > 40 ? 'stable' : 'down'}
          description="% заполненности зала"
        />
        
        <MetricCard
          title="Средний размер компании"
          value={data.averagePartySize}
          description="Человек на бронирование"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Временные показатели</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Пиковое время:</span>
              <Badge variant="outline">{data.peakHours}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Среднее время обеда:</span>
              <Badge className="bg-blue-100 text-blue-800">{data.averageDiningTime}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Общие показатели</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Заполненность зала:</span>
              <Badge variant="outline">{data.occupancyRate}%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Средний размер компании:</span>
              <Badge variant="outline">{data.averagePartySize} чел.</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsView

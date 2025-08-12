'use client'
import TablesView from '@/components/TablesView/tablesView'
import AnalyticsView from '@/components/AnalyticsView/analyticsView'
import { WebSocketStatus } from '@/components/ui/websocket-status'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BarChart3, Layout, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [activeView, setActiveView] = useState<'tables' | 'analytics'>('tables')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Система бронирования</h1>
                <p className="text-gray-600 mt-1">Управление столами и аналитика</p>
              </div>
              <WebSocketStatus />
            </div>
            
            {/* Navigation */}
            <div className="flex space-x-2">
              <Button
                variant={activeView === 'tables' ? 'default' : 'outline'}
                onClick={() => setActiveView('tables')}
              >
                <Layout className="w-4 h-4 mr-2" />
                План зала
              </Button>
              <Button
                variant={activeView === 'analytics' ? 'default' : 'outline'}
                onClick={() => setActiveView('analytics')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Аналитика
              </Button>
              <Link href="/reservations">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Все бронирования
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {activeView === 'tables' ? (
            <TablesView />
          ) : (
            <AnalyticsView />
          )}
        </div>
      </div>
    </main>
  )
}
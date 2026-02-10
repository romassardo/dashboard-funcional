import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'

interface DateRangeFilterProps {
  onFilterChange: (from: string, to: string) => void
}

export function DateRangeFilter({ onFilterChange }: DateRangeFilterProps) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const handleApply = () => {
    if (from && to) {
      onFilterChange(from, to)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Rango de Fechas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Desde</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Hasta</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApply}
              disabled={!from || !to}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

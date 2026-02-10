import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'

interface PeriodFiltersProps {
  onFilterChange: (year?: number, month?: number, day?: number) => void
}

export function PeriodFilters({ onFilterChange }: PeriodFiltersProps) {
  const [year, setYear] = useState<string>('')
  const [month, setMonth] = useState<string>('')
  const [day, setDay] = useState<string>('')

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ]

  const handleApply = () => {
    onFilterChange(
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
      day ? parseInt(day) : undefined
    )
  }

  const handleClear = () => {
    setYear('')
    setMonth('')
    setDay('')
    onFilterChange(undefined, undefined, undefined)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros por Período</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Año</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleccionar...</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mes</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleccionar...</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Día</label>
            <input
              type="number"
              min="1"
              max="31"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="1-31"
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Aplicar
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

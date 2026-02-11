import { useState, useEffect } from 'react'
import { dashboardApi } from '../../services/api'
import { CalendarDays, Loader2 } from 'lucide-react'

interface SummaryItem {
  name: string
  cantidad: number
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

function SummaryTable({ title, data, color }: { title: string; data: SummaryItem[]; color: string }) {
  const total = data.reduce((s, i) => s + i.cantidad, 0)

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 backdrop-blur-sm">
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">{title}</h4>
      {data.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">Sin datos para el período seleccionado</p>
      ) : (
        <div className="space-y-2">
          {data.map((item, idx) => {
            const pct = total > 0 ? (item.cantidad / total) * 100 : 0
            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600 dark:text-slate-300 truncate mr-2">{item.name}</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {item.cantidad} <span className="text-slate-400 font-normal">({pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
          <div className="pt-2 mt-2 border-t border-slate-200/50 dark:border-slate-700/30 flex justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{total}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function MonthlySummaryCard() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{
    tickets_por_sector: SummaryItem[]
    tickets_por_tipificacion: SummaryItem[]
    tickets_por_sistema: SummaryItem[]
  }>({ tickets_por_sector: [], tickets_por_tipificacion: [], tickets_por_sistema: [] })

  const loadSummary = async () => {
    setLoading(true)
    try {
      const result = await dashboardApi.getMonthlySummary(year, month)
      setData({
        tickets_por_sector: (result.tickets_por_sector || []).map((i: any) => ({ name: i.sector, cantidad: Number(i.cantidad) })),
        tickets_por_tipificacion: (result.tickets_por_tipificacion || []).map((i: any) => ({ name: i.tipificacion, cantidad: Number(i.cantidad) })),
        tickets_por_sistema: (result.tickets_por_sistema || []).map((i: any) => ({ name: i.sistema, cantidad: Number(i.cantidad) }))
      })
    } catch (error) {
      console.error('Error loading monthly summary:', error)
      setData({ tickets_por_sector: [], tickets_por_tipificacion: [], tickets_por_sistema: [] })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSummary()
  }, [year, month])

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/40 p-6 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-500" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Detalle Mensual — {MONTH_NAMES[month - 1]} {year}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-white"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx} value={idx + 1}>{name}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SummaryTable title="Por Sector" data={data.tickets_por_sector} color="#3B82F6" />
          <SummaryTable title="Por Tipificación" data={data.tickets_por_tipificacion} color="#6366F1" />
          <SummaryTable title="Por Sistema" data={data.tickets_por_sistema} color="#10B981" />
        </div>
      )}
    </div>
  )
}

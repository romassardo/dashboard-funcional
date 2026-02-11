import { useState, useEffect, useCallback } from 'react'
import { dashboardApi } from '../../services/api'
import { CalendarDays, Loader2, X } from 'lucide-react'

interface SummaryItem {
  id: number
  name: string
  cantidad: number
}

interface ActiveFilter {
  field: number
  itemId: number
  name: string
  tableTitle: string
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const FIELD_IDS: Record<string, number> = {
  sector: 61,
  tipificacion: 57,
  sistema: 55
}

function SummaryTable({ title, data, color, fieldKey, isSource, onItemClick }: {
  title: string
  data: SummaryItem[]
  color: string
  fieldKey: string
  isSource: boolean
  onItemClick: (item: SummaryItem, fieldKey: string) => void
}) {
  const total = data.reduce((s, i) => s + i.cantidad, 0)

  return (
    <div className={`bg-white dark:bg-slate-800/50 rounded-xl border p-5 backdrop-blur-sm transition-all duration-200 ${
      isSource ? 'border-blue-400 dark:border-blue-500 ring-1 ring-blue-400/30' : 'border-slate-200 dark:border-slate-700/50'
    }`}>
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">{title}</h4>
      {data.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">Sin datos para el período seleccionado</p>
      ) : (
        <div className="space-y-2">
          {data.map((item) => {
            const pct = total > 0 ? (item.cantidad / total) * 100 : 0
            return (
              <div
                key={item.id}
                onClick={() => onItemClick(item, fieldKey)}
                className="cursor-pointer rounded-lg px-2 py-1 -mx-2 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
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

function parseResult(result: any) {
  return {
    tickets_por_sector: (result.tickets_por_sector || []).map((i: any) => ({ id: i.id, name: i.sector, cantidad: Number(i.cantidad) })),
    tickets_por_tipificacion: (result.tickets_por_tipificacion || []).map((i: any) => ({ id: i.id, name: i.tipificacion, cantidad: Number(i.cantidad) })),
    tickets_por_sistema: (result.tickets_por_sistema || []).map((i: any) => ({ id: i.id, name: i.sistema, cantidad: Number(i.cantidad) }))
  }
}

export function MonthlySummaryCard() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<ActiveFilter | null>(null)
  const emptyData = { tickets_por_sector: [] as SummaryItem[], tickets_por_tipificacion: [] as SummaryItem[], tickets_por_sistema: [] as SummaryItem[] }
  const [data, setData] = useState(emptyData)
  const [baseData, setBaseData] = useState(emptyData)

  const loadSummary = useCallback(async () => {
    setLoading(true)
    try {
      const result = await dashboardApi.getMonthlySummary(year, month)
      const parsed = parseResult(result)
      setData(parsed)
      setBaseData(parsed)
    } catch (error) {
      console.error('Error loading monthly summary:', error)
      setData(emptyData)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    setActiveFilter(null)
    loadSummary()
  }, [year, month, loadSummary])

  const handleItemClick = useCallback(async (item: SummaryItem, fieldKey: string) => {
    const fieldId = FIELD_IDS[fieldKey]
    const tableTitle = fieldKey === 'sector' ? 'Sector' : fieldKey === 'tipificacion' ? 'Tipificación' : 'Sistema'

    if (activeFilter && activeFilter.field === fieldId && activeFilter.itemId === item.id) {
      setActiveFilter(null)
      setData(baseData)
      return
    }

    setActiveFilter({ field: fieldId, itemId: item.id, name: item.name, tableTitle })
    setLoading(true)
    try {
      const result = await dashboardApi.getMonthlySummary(year, month, fieldId, item.id)
      setData(parseResult(result))
    } catch (error) {
      console.error('Error loading filtered summary:', error)
    } finally {
      setLoading(false)
    }
  }, [activeFilter, baseData, year, month])

  const clearFilter = () => {
    setActiveFilter(null)
    setData(baseData)
  }

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

      {activeFilter && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Filtrando por {activeFilter.tableTitle}:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-500/20">
            {activeFilter.name}
            <button onClick={clearFilter} className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SummaryTable title="Por Sector" data={data.tickets_por_sector} color="#3B82F6" fieldKey="sector" isSource={activeFilter?.field === 61} onItemClick={handleItemClick} />
          <SummaryTable title="Por Tipificación" data={data.tickets_por_tipificacion} color="#6366F1" fieldKey="tipificacion" isSource={activeFilter?.field === 57} onItemClick={handleItemClick} />
          <SummaryTable title="Por Sistema" data={data.tickets_por_sistema} color="#10B981" fieldKey="sistema" isSource={activeFilter?.field === 55} onItemClick={handleItemClick} />
        </div>
      )}
    </div>
  )
}

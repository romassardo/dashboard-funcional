import { useState, useEffect } from 'react'
import { dashboardApi, DateFilter } from './services/api'
import { PieChartCard } from './components/charts/PieChartCard'
import { BarChartCard } from './components/charts/BarChartCard'
import { MonthlySummaryCard } from './components/tables/MonthlySummaryCard'
import { Loader2, Moon, Sun, Filter, RotateCcw, Ticket, Users, AlertTriangle } from 'lucide-react'

function App() {
  const [filters, setFilters] = useState<DateFilter>({})
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : true
  })
  const [data, setData] = useState<any>({
    ticketsBySystem: [],
    ticketsByType: [],
    topUsers: [],
    topDepartments: [],
    incidentsStatus: [],
  })

  const COLORS = {
    system: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4'],
    type: ['#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'],
    status: ['#10B981', '#F59E0B', '#EF4444'],
    users: '#6366F1',
    departments: '#3B82F6'
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [system, type, users, departments, incidents] = await Promise.all([
        dashboardApi.getTicketsBySystem(filters),
        dashboardApi.getTicketsByType(filters),
        dashboardApi.getTopUsers(filters),
        dashboardApi.getTopDepartments(filters),
        dashboardApi.getIncidentsStatus(filters)
      ])

      setData({
        ticketsBySystem: system.map((s: any) => ({ name: s.sistema, value: Number(s.cantidad), percentage: Number(s.porcentaje) })),
        ticketsByType: type.map((t: any) => ({ name: t.tipificacion, value: Number(t.cantidad), percentage: Number(t.porcentaje) })),
        topUsers: users.map((u: any) => ({ name: u.nombre, value: Number(u.cantidad) })),
        topDepartments: departments.map((d: any) => ({ name: d.nombre, value: Number(d.cantidad) })),
        incidentsStatus: incidents.map((i: any) => ({ name: i.estado, value: Number(i.cantidad), percentage: Number(i.porcentaje) }))
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const statCards = [
    { label: 'Tickets Sistema', value: data.ticketsBySystem.reduce((s: number, i: any) => s + i.value, 0), icon: Ticket, color: 'blue' },
    { label: 'Tickets Tipificación', value: data.ticketsByType.reduce((s: number, i: any) => s + i.value, 0), icon: AlertTriangle, color: 'indigo' },
    { label: 'Usuarios Activos', value: data.topUsers.length, icon: Users, color: 'violet' },
  ]

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    indigo: 'from-indigo-500 to-indigo-600',
    violet: 'from-violet-500 to-violet-600',
    emerald: 'from-emerald-500 to-emerald-600',
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0f172a] transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Panel de Control — Soporte Funcional & Data</h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Filter Bar + Logo */}
        <div className="flex items-center gap-4">
        <div className="flex-1 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/40 p-4 backdrop-blur-sm">
          <div className="flex flex-wrap items-end gap-2">
            <Filter className="w-4 h-4 text-slate-400 mb-2" />
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Desde</label>
              <input type="date" className="px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-white" value={filters.from || ''} onChange={(e) => setFilters({ from: e.target.value, to: filters.to })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Hasta</label>
              <input type="date" className="px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-white" value={filters.to || ''} onChange={(e) => setFilters({ from: filters.from, to: e.target.value })} />
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700/50 mx-1" />
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Año</label>
              <select className="px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-white" value={filters.year || ''} onChange={(e) => { const v = e.target.value ? parseInt(e.target.value) : undefined; setFilters({ year: v, month: filters.month, day: filters.day }) }}>
                <option value="">Todos</option>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Mes</label>
              <select className="px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-white" value={filters.month || ''} onChange={(e) => { const v = e.target.value ? parseInt(e.target.value) : undefined; setFilters({ year: filters.year, month: v, day: filters.day }) }}>
                <option value="">Todos</option>
                {['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'].map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Día</label>
              <select className="px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-white" value={filters.day || ''} onChange={(e) => { const v = e.target.value ? parseInt(e.target.value) : undefined; setFilters({ year: filters.year, month: filters.month, day: v }) }}>
                <option value="">Todos</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <button onClick={loadData} className="px-4 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-medium shadow-sm shadow-blue-500/20">Aplicar</button>
            <button onClick={() => { setFilters({}); setTimeout(loadData, 50); }} className="px-2 py-1.5 text-sm bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-all"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>
        <img src="/logo.svg" alt="Soporte Funcional & Data" className="h-16 flex-shrink-0" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
            <span className="text-sm text-slate-500 dark:text-slate-400">Cargando datos...</span>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4">
              {statCards.map((card) => (
                <div key={card.label} className="relative overflow-hidden bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/40 p-5 backdrop-blur-sm group hover:shadow-lg transition-all duration-300">
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorMap[card.color]} opacity-10 rounded-bl-[40px] group-hover:opacity-20 transition-opacity`} />
                  <div className={`w-9 h-9 bg-gradient-to-br ${colorMap[card.color]} rounded-lg flex items-center justify-center mb-3 shadow-sm`}>
                    <card.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Row 1: System Donut + Tipification Bars */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PieChartCard
                title="Tickets por Sistema"
                data={data.ticketsBySystem}
                colors={COLORS.system}
                centerLabel="Tickets"
              />
              <BarChartCard
                title="Tickets por Tipificación"
                data={data.ticketsByType}
                color="#6366F1"
                layout="vertical"
              />
            </div>

            {/* Row 2: Incidents + Top Users */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PieChartCard
                title="Estado Incidentes"
                data={data.incidentsStatus}
                colors={COLORS.status}
                centerLabel="Incidentes"
              />
              <div className="lg:col-span-2">
                <BarChartCard
                  title="Top 5 Usuarios con más Tickets"
                  data={data.topUsers}
                  color={COLORS.users}
                />
              </div>
            </div>

            {/* Row 3: Departments */}
            <BarChartCard
              title="Top 5 Departamentos con más Tickets"
              data={data.topDepartments}
              color={COLORS.departments}
              showPercentage
              totalForPercentage={data.ticketsBySystem.reduce((s: number, i: any) => s + i.value, 0)}
            />

            {/* Monthly Summary */}
            <MonthlySummaryCard />
          </>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 dark:text-slate-500 py-4 border-t border-slate-200/50 dark:border-slate-700/30">
          Dashboard Soporte Funcional y Data &copy; {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  )
}

export default App

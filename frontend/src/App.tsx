import { useState, useEffect } from 'react'
import { dashboardApi, DateFilter } from './services/api'
import { PieChartCard } from './components/charts/PieChartCard'
import { BarChartCard } from './components/charts/BarChartCard'
import { RequirementsTable } from './components/tables/RequirementsTable'
import { BarChart3, Loader2, Calendar, TrendingUp, Users, Building2, Moon, Sun } from 'lucide-react'

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
    functionalRequirements: []
  })

  const CHART_COLORS = {
    system: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
    type: ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#EFF6FF'],
    status: ['#10B981', '#EF4444'],
    users: '#2563EB',
    departments: '#7C3AED'
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [system, type, users, departments, incidents, requirements] = await Promise.all([
        dashboardApi.getTicketsBySystem(filters),
        dashboardApi.getTicketsByType(filters),
        dashboardApi.getTopUsers(filters),
        dashboardApi.getTopDepartments(filters),
        dashboardApi.getIncidentsStatus(filters),
        dashboardApi.getFunctionalRequirements(filters)
      ])

      setData({
        ticketsBySystem: system.map(s => ({ name: s.sistema, value: s.cantidad, percentage: s.porcentaje })),
        ticketsByType: type.map(t => ({ name: t.tipificacion, value: t.cantidad, percentage: t.porcentaje })),
        topUsers: users.map(u => ({ name: u.nombre, value: u.cantidad })),
        topDepartments: departments.map(d => ({ name: d.nombre, value: d.cantidad })),
        incidentsStatus: incidents.map(i => ({ name: i.estado, value: i.cantidad, percentage: i.porcentaje })),
        functionalRequirements: requirements
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Soporte Funcional</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Métricas y análisis de tickets</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Unified Filter Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Desde
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
                value={filters.from || ''}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Hasta</label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
                value={filters.to || ''}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadData}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Aplicar
              </button>
              <button
                onClick={() => { setFilters({}); loadData(); }}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors font-medium"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-lg text-slate-700 dark:text-slate-300">Cargando datos...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tickets por Sistema</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{data.ticketsBySystem.reduce((sum: number, item: any) => sum + Number(item.value), 0)}</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Top Usuarios</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{data.topUsers.reduce((sum: number, item: any) => sum + Number(item.value), 0)}</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Departamentos</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{data.topDepartments.reduce((sum: number, item: any) => sum + Number(item.value), 0)}</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <PieChartCard
                title="Tickets por Sistema"
                data={data.ticketsBySystem}
                colors={CHART_COLORS.system}
              />
              <PieChartCard
                title="Tickets por Tipificación"
                data={data.ticketsByType}
                colors={CHART_COLORS.type}
              />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <PieChartCard
                title="Incidentes Funcionales"
                data={data.incidentsStatus}
                colors={CHART_COLORS.status}
              />
              <div className="lg:col-span-2">
                <BarChartCard
                  title="Top 5 Usuarios con más Tickets"
                  data={data.topUsers}
                  color={CHART_COLORS.users}
                />
              </div>
            </div>

            {/* Departments Chart */}
            <div className="mb-6">
              <BarChartCard
                title="Top 5 Departamentos con más Tickets"
                data={data.topDepartments}
                color={CHART_COLORS.departments}
              />
            </div>

            {/* Requirements Table */}
            <RequirementsTable requirements={data.functionalRequirements} />
          </>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 py-6">
          <p>Dashboard Soporte Funcional y Data © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  )
}

export default App

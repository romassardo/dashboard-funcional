import { useState, useEffect } from 'react'
import { dashboardApi, DateFilter } from './services/api'
import { PieChartCard } from './components/charts/PieChartCard'
import { BarChartCard } from './components/charts/BarChartCard'
import { DateRangeFilter } from './components/filters/DateRangeFilter'
import { PeriodFilters } from './components/filters/PeriodFilters'
import { RequirementsTable } from './components/tables/RequirementsTable'
import { Activity, Loader2 } from 'lucide-react'

function App() {
  const [filters, setFilters] = useState<DateFilter>({})
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>({
    ticketsBySystem: [],
    ticketsByType: [],
    topUsers: [],
    topDepartments: [],
    incidentsStatus: [],
    functionalRequirements: []
  })

  const CHART_COLORS = {
    system: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1'],
    type: ['#06B6D4', '#8B5CF6', '#F97316', '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#EC4899'],
    status: ['#10B981', '#3B82F6'],
    users: '#3B82F6',
    departments: '#8B5CF6'
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

  const handleDateRangeChange = (from: string, to: string) => {
    setFilters({ from, to })
    setTimeout(() => loadData(), 100)
  }

  const handlePeriodChange = (year?: number, month?: number, day?: number) => {
    setFilters({ year, month, day })
    setTimeout(() => loadData(), 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dashboard Soporte Funcional
            </h1>
          </div>
          <p className="text-muted-foreground">Panel de métricas y análisis de tickets</p>
        </header>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DateRangeFilter onFilterChange={handleDateRangeChange} />
          <PeriodFilters onFilterChange={handlePeriodChange} />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Cargando datos...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Pie Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
              <PieChartCard
                title="Incidentes Funcionales"
                data={data.incidentsStatus}
                colors={CHART_COLORS.status}
              />
            </div>

            {/* Bar Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <BarChartCard
                title="Top 5 Usuarios con más Tickets"
                data={data.topUsers}
                color={CHART_COLORS.users}
              />
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
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Dashboard Soporte Funcional y Data - {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  )
}

export default App

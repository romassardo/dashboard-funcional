import { useState, useEffect, useCallback } from 'react'
import { dashboardApi } from '../../services/api'
import { TicketDetailModal } from './TicketDetailModal'
import { Search, Filter, Loader2, ChevronLeft, ChevronRight, FileText, X } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  'Open': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Closed': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  'Resolved': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'En curso': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Cumplido': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

export function TicketListPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(100)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [fromFilter, setFromFilter] = useState('')
  const [toFilter, setToFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)

  const loadTickets = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (fromFilter) params.from = fromFilter
      if (toFilter) params.to = toFilter
      const result = await dashboardApi.getTicketList(params)
      setTickets(result.tickets)
      setTotal(result.total)
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, statusFilter, fromFilter, toFilter])

  useEffect(() => { loadTickets() }, [loadTickets])

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const clearFilters = () => {
    setSearch('')
    setSearchInput('')
    setStatusFilter('')
    setFromFilter('')
    setToFilter('')
    setPage(1)
  }

  const totalPages = Math.ceil(total / limit)
  const hasFilters = search || statusFilter || fromFilter || toFilter

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-500" />
          Tickets
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gestión de tickets de soporte para el departamento de Soporte Funcional</p>
      </div>

      {/* Search + Filters Toggle */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número, asunto, usuario, agente o sector"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-white placeholder-slate-400"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 text-sm rounded-xl border flex items-center gap-2 transition-all ${showFilters ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-white dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/40 text-slate-600 dark:text-slate-300'}`}
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/40 p-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Estado</label>
            <select className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-lg text-slate-900 dark:text-white" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">Todos</option>
              <option value="Open">Open</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Desde</label>
            <input type="date" className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-lg text-slate-900 dark:text-white" value={fromFilter} onChange={(e) => { setFromFilter(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Hasta</label>
            <input type="date" className="px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-lg text-slate-900 dark:text-white" value={toFilter} onChange={(e) => { setToFilter(e.target.value); setPage(1) }} />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
              <X className="w-3 h-3" /> Limpiar
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/40 backdrop-blur-sm overflow-hidden">
        {/* Table Header Info */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/50 dark:border-slate-700/30">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-slate-800 dark:text-white">Tickets</span>
            <span className="text-xs bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">{limit}</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">{total.toLocaleString()} resultados</span>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-[80px_1fr_130px_100px_140px_130px_140px] gap-2 px-5 py-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/20">
          <div>Número</div>
          <div>Asunto</div>
          <div>SLA</div>
          <div>Estado</div>
          <div>Agente</div>
          <div>Sector</div>
          <div>Usuario</div>
        </div>

        {/* Rows */}
        <div className="relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 z-10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}
          {tickets.map((ticket) => (
            <div
              key={ticket.ticket_id}
              onClick={() => setSelectedTicketId(ticket.ticket_id)}
              className="grid grid-cols-[80px_1fr_130px_100px_140px_130px_140px] gap-2 px-5 py-2.5 border-b border-slate-100/50 dark:border-slate-700/15 hover:bg-slate-50 dark:hover:bg-slate-700/20 cursor-pointer transition-colors items-center"
            >
              <div className="text-sm font-mono text-cyan-500">#{ticket.number}</div>
              <div className="text-sm text-slate-700 dark:text-slate-200 truncate">{ticket.asunto || '(sin asunto)'}</div>
              <div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">{ticket.sla}</span>
              </div>
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[ticket.estado] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>{ticket.estado}</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 truncate">{ticket.agente}</div>
              <div>
                {ticket.sector && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 truncate inline-block max-w-full">{ticket.sector}</span>}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 truncate">{ticket.usuario}</div>
            </div>
          ))}
          {!loading && tickets.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">No se encontraron tickets</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200/50 dark:border-slate-700/30">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTicketId && (
        <TicketDetailModal ticketId={selectedTicketId} onClose={() => setSelectedTicketId(null)} />
      )}
    </div>
  )
}

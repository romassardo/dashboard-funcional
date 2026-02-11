import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/metrics`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface DateFilter {
  from?: string
  to?: string
  year?: number
  month?: number
  day?: number
}

export interface TicketsBySystem {
  sistema: string
  cantidad: number
  porcentaje: number
}

export interface TicketsByType {
  tipificacion: string
  cantidad: number
  porcentaje: number
}

export interface TopUser {
  user_id: number
  nombre: string
  email: string
  cantidad: number
}

export interface TopDepartment {
  dept_id: number
  nombre: string
  cantidad: number
  porcentaje: number
}

export interface IncidentStatus {
  estado: string
  cantidad: number
  porcentaje: number
}

export interface FunctionalRequirement {
  ticket_number: string
  titulo: string
  descripcion: string
  fecha_solicitud: string
  fecha_implementacion: string | null
  comentarios_solicitud: string | null
  comentarios_implementacion: string | null
}

export interface MonthlySummary {
  mes: number
  anio: number
  tickets_por_sector: { sector: string; cantidad: number }[]
  tickets_por_tipificacion: { tipificacion: string; cantidad: number }[]
  tickets_por_sistema: { sistema: string; cantidad: number }[]
}

export const dashboardApi = {
  getTicketsBySystem: async (filters: DateFilter) => {
    const response = await api.get<{ success: boolean; data: TicketsBySystem[] }>(
      '/tickets-by-system',
      { params: filters }
    )
    return response.data.data
  },

  getTicketsByType: async (filters: DateFilter) => {
    const response = await api.get<{ success: boolean; data: TicketsByType[] }>(
      '/tickets-by-type',
      { params: filters }
    )
    return response.data.data
  },

  getTopUsers: async (filters: DateFilter, limit: number = 10) => {
    const response = await api.get<{ success: boolean; data: TopUser[] }>(
      '/top-users',
      { params: { ...filters, limit } }
    )
    return response.data.data
  },

  getTopDepartments: async (filters: DateFilter, limit: number = 5) => {
    const response = await api.get<{ success: boolean; data: TopDepartment[] }>(
      '/top-departments',
      { params: { ...filters, limit } }
    )
    return response.data.data
  },

  getIncidentsStatus: async (filters: DateFilter) => {
    const response = await api.get<{ success: boolean; data: IncidentStatus[] }>(
      '/incidents-status',
      { params: filters }
    )
    return response.data.data
  },

  getFunctionalRequirements: async (filters: DateFilter) => {
    const response = await api.get<{ success: boolean; data: FunctionalRequirement[] }>(
      '/functional-requirements',
      { params: filters }
    )
    return response.data.data
  },

  getOpenTicketCount: async () => {
    const response = await api.get('/open-ticket-count')
    return response.data.data.total
  },

  getTicketList: async (params: { page?: number; limit?: number; search?: string; status?: string; tipificacion?: string; from?: string; to?: string; year?: number; month?: number; day?: number }) => {
    const response = await api.get('/tickets', { params })
    return response.data.data
  },

  getTicketDetail: async (ticketId: number) => {
    const response = await api.get(`/tickets/${ticketId}`)
    return response.data.data
  },

  getAttachmentUrl: (fileId: number) => {
    return `${API_BASE_URL}/api/metrics/attachments/${fileId}`
  },

  getMonthlySummary: async (year: number, month: number, filterField?: number, filterItemId?: number) => {
    const params: any = { year, month };
    if (filterField && filterItemId) {
      params.filterField = filterField;
      params.filterItemId = filterItemId;
    }
    const response = await api.get<{ success: boolean; data: MonthlySummary }>(
      '/monthly-summary',
      { params }
    )
    return response.data.data
  }
}

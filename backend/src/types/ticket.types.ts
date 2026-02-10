export interface TicketsBySystem {
  sistema: string;
  cantidad: number;
  porcentaje: number;
}

export interface TicketsByType {
  tipificacion: string;
  cantidad: number;
  porcentaje: number;
}

export interface TopUser {
  user_id: number;
  nombre: string;
  email: string;
  cantidad: number;
}

export interface TopDepartment {
  dept_id: number;
  nombre: string;
  cantidad: number;
  porcentaje: number;
}

export interface IncidentStatus {
  estado: string;
  cantidad: number;
  porcentaje: number;
}

export interface FunctionalRequirement {
  ticket_number: string;
  titulo: string;
  descripcion: string;
  fecha_solicitud: string;
  fecha_implementacion: string | null;
  comentarios_solicitud: string | null;
  comentarios_implementacion: string | null;
}

export interface MonthlySummary {
  mes: number;
  anio: number;
  tickets_por_sector: { sector: string; cantidad: number }[];
  tickets_por_tipificacion: { tipificacion: string; cantidad: number }[];
  tickets_por_sistema: { sistema: string; cantidad: number }[];
}

export interface DateFilter {
  from?: string;
  to?: string;
  year?: number;
  month?: number;
  day?: number;
}

import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import {
  TicketsBySystem,
  TicketsByType,
  TopUser,
  TopDepartment,
  IncidentStatus,
  FunctionalRequirement,
  DateFilter
} from '../types/ticket.types';

export class TicketService {
  private buildDateFilter(filters: DateFilter): string {
    const conditions: string[] = [];
    
    if (filters.from && filters.to) {
      conditions.push(`t.created BETWEEN '${filters.from}' AND '${filters.to} 23:59:59'`);
    }
    
    if (filters.year) {
      conditions.push(`YEAR(t.created) = ${filters.year}`);
    }
    
    if (filters.month) {
      conditions.push(`MONTH(t.created) = ${filters.month}`);
    }
    
    if (filters.day) {
      conditions.push(`DAY(t.created) = ${filters.day}`);
    }
    
    return conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
  }

  async getTicketsBySystem(filters: DateFilter): Promise<TicketsBySystem[]> {
    const dateFilter = this.buildDateFilter(filters);
    
    const query = `
      SELECT 
        li.value as sistema,
        COUNT(t.ticket_id) as cantidad,
        ROUND((COUNT(t.ticket_id) * 100.0 / (SELECT COUNT(*) FROM ost_ticket t2 WHERE 1=1 ${dateFilter})), 2) as porcentaje
      FROM ost_ticket t
      JOIN ost_form_entry fe ON t.ticket_id = fe.object_id AND fe.object_type = 'T'
      JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
      JOIN ost_list_items li ON JSON_UNQUOTE(JSON_EXTRACT(fev.value, CONCAT('$."', li.id, '"'))) = li.value
      WHERE fev.field_id = 55
        AND li.id IN (86, 88, 89, 90, 91, 106)
        AND fev.value LIKE CONCAT('%"', li.id, '"%')
        ${dateFilter}
      GROUP BY li.value, li.id
      ORDER BY cantidad DESC;
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows as TicketsBySystem[];
  }

  async getTicketsByType(filters: DateFilter): Promise<TicketsByType[]> {
    const dateFilter = this.buildDateFilter(filters);
    
    const query = `
      SELECT 
        li.value as tipificacion,
        COUNT(t.ticket_id) as cantidad,
        ROUND((COUNT(t.ticket_id) * 100.0 / (SELECT COUNT(*) FROM ost_ticket t2 WHERE 1=1 ${dateFilter})), 2) as porcentaje
      FROM ost_ticket t
      JOIN ost_form_entry fe ON t.ticket_id = fe.object_id AND fe.object_type = 'T'
      JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
      JOIN ost_list_items li ON JSON_UNQUOTE(JSON_EXTRACT(fev.value, CONCAT('$."', li.id, '"'))) = li.value
      WHERE li.id IN (92, 93, 94, 107, 127, 129, 131, 132)
        AND fev.value LIKE CONCAT('%"', li.id, '"%')
        ${dateFilter}
      GROUP BY li.value, li.id
      ORDER BY cantidad DESC;
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows as TicketsByType[];
  }

  async getTopUsers(filters: DateFilter, limit: number = 5): Promise<TopUser[]> {
    const dateFilter = this.buildDateFilter(filters);
    
    const query = `
      SELECT 
        u.id as user_id,
        u.name as nombre,
        ue.address as email,
        COUNT(t.ticket_id) as cantidad
      FROM ost_ticket t
      JOIN ost_user u ON t.user_id = u.id
      JOIN ost_user_email ue ON u.id = ue.user_id
      WHERE 1=1 ${dateFilter}
      GROUP BY u.id, u.name, ue.address
      ORDER BY cantidad DESC
      LIMIT ${limit};
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows as TopUser[];
  }

  async getTopDepartments(filters: DateFilter, limit: number = 5): Promise<TopDepartment[]> {
    const dateFilter = this.buildDateFilter(filters);
    
    const query = `
      SELECT 
        d.id as dept_id,
        d.name as nombre,
        COUNT(t.ticket_id) as cantidad,
        ROUND((COUNT(t.ticket_id) * 100.0 / (SELECT COUNT(*) FROM ost_ticket t2 WHERE 1=1 ${dateFilter})), 2) as porcentaje
      FROM ost_ticket t
      JOIN ost_department d ON t.dept_id = d.id
      WHERE 1=1 ${dateFilter}
      GROUP BY d.id, d.name
      ORDER BY cantidad DESC
      LIMIT ${limit};
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows as TopDepartment[];
  }

  async getIncidentsStatus(filters: DateFilter): Promise<IncidentStatus[]> {
    const dateFilter = this.buildDateFilter(filters);
    
    const query = `
      SELECT 
        ts.name as estado,
        COUNT(t.ticket_id) as cantidad,
        ROUND((COUNT(t.ticket_id) * 100.0 / (
          SELECT COUNT(*) 
          FROM ost_ticket t2
          JOIN ost_form_entry fe2 ON t2.ticket_id = fe2.object_id AND fe2.object_type = 'T'
          JOIN ost_form_entry_values fev2 ON fe2.id = fev2.entry_id
          WHERE fev2.value = 92 AND t2.status_id IN (2, 3) ${dateFilter}
        )), 2) as porcentaje
      FROM ost_ticket t
      JOIN ost_form_entry fe ON t.ticket_id = fe.object_id AND fe.object_type = 'T'
      JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
      JOIN ost_ticket_status ts ON t.status_id = ts.id
      WHERE fev.value = 92
        AND t.status_id IN (2, 3)
        ${dateFilter}
      GROUP BY ts.name, t.status_id
      ORDER BY t.status_id;
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows as IncidentStatus[];
  }

  async getFunctionalRequirements(filters: DateFilter): Promise<FunctionalRequirement[]> {
    const dateFilter = this.buildDateFilter(filters);
    
    const query = `
      SELECT 
        t.number as ticket_number,
        fev_titulo.value as titulo,
        fev_desc.value as descripcion,
        DATE_FORMAT(t.created, '%Y-%m-%d %H:%i:%s') as fecha_solicitud,
        DATE_FORMAT(t.closed, '%Y-%m-%d %H:%i:%s') as fecha_implementacion,
        NULL as comentarios_solicitud,
        NULL as comentarios_implementacion
      FROM ost_ticket t
      JOIN ost_form_entry fe ON t.ticket_id = fe.object_id AND fe.object_type = 'T'
      JOIN ost_form_entry_values fev_tipo ON fe.id = fev_tipo.entry_id
      LEFT JOIN ost_form_entry_values fev_titulo ON fe.id = fev_titulo.entry_id AND fev_titulo.field_id = 20
      LEFT JOIN ost_form_entry_values fev_desc ON fe.id = fev_desc.entry_id AND fev_desc.field_id = 21
      WHERE fev_tipo.value = 127
        ${dateFilter}
      ORDER BY t.created DESC;
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows as FunctionalRequirement[];
  }

  async getMonthlySummary(year: number, month: number): Promise<any> {
    const query = `
      SELECT 
        'por_sector' as tipo,
        d.name as valor,
        COUNT(t.ticket_id) as cantidad
      FROM ost_ticket t
      JOIN ost_department d ON t.dept_id = d.id
      WHERE YEAR(t.created) = ${year} AND MONTH(t.created) = ${month}
      GROUP BY d.name
      
      UNION ALL
      
      SELECT 
        'por_tipificacion' as tipo,
        li.value as valor,
        COUNT(t.ticket_id) as cantidad
      FROM ost_ticket t
      JOIN ost_form_entry fe ON t.ticket_id = fe.object_id
      JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
      JOIN ost_list_items li ON fev.value = li.id
      WHERE li.id IN (92, 93, 94, 107, 127, 129, 131, 132)
        AND YEAR(t.created) = ${year} AND MONTH(t.created) = ${month}
      GROUP BY li.value
      
      UNION ALL
      
      SELECT 
        'por_sistema' as tipo,
        li.value as valor,
        COUNT(t.ticket_id) as cantidad
      FROM ost_ticket t
      JOIN ost_form_entry fe ON t.ticket_id = fe.object_id
      JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
      JOIN ost_list_items li ON fev.value = li.id
      WHERE fev.field_id = 55
        AND li.id IN (86, 88, 89, 90, 91, 106)
        AND YEAR(t.created) = ${year} AND MONTH(t.created) = ${month}
      GROUP BY li.value;
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query);
    
    const summary = {
      mes: month,
      anio: year,
      tickets_por_sector: rows.filter((r: any) => r.tipo === 'por_sector').map((r: any) => ({ sector: r.valor, cantidad: r.cantidad })),
      tickets_por_tipificacion: rows.filter((r: any) => r.tipo === 'por_tipificacion').map((r: any) => ({ tipificacion: r.valor, cantidad: r.cantidad })),
      tickets_por_sistema: rows.filter((r: any) => r.tipo === 'por_sistema').map((r: any) => ({ sistema: r.valor, cantidad: r.cantidad }))
    };
    
    return summary;
  }
}

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
  private buildDateFilter(filters: DateFilter): { clause: string; params: any[] } {
    const conditions: string[] = ['t.number >= 5000'];
    const params: any[] = [];
    
    if (filters.from && filters.to) {
      conditions.push(`t.created BETWEEN ? AND ?`);
      params.push(filters.from, `${filters.to} 23:59:59`);
    }
    
    if (filters.year) {
      conditions.push(`YEAR(t.created) = ?`);
      params.push(filters.year);
    }
    
    if (filters.month) {
      conditions.push(`MONTH(t.created) = ?`);
      params.push(filters.month);
    }
    
    if (filters.day) {
      conditions.push(`DAY(t.created) = ?`);
      params.push(filters.day);
    }
    
    return {
      clause: conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '',
      params
    };
  }

  async getTicketsBySystem(filters: DateFilter): Promise<TicketsBySystem[]> {
    const { clause, params } = this.buildDateFilter(filters);
    
    const query = `
      SELECT 
        li.value as sistema,
        COUNT(DISTINCT t.ticket_id) as cantidad,
        ROUND((COUNT(DISTINCT t.ticket_id) * 100.0 / (SELECT COUNT(*) FROM ost_ticket t2 WHERE 1=1 ${clause})), 2) as porcentaje
      FROM ost_ticket t
      JOIN ost_form_entry fe ON t.ticket_id = fe.object_id AND fe.object_type = 'T'
      JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
      JOIN ost_list_items li ON JSON_EXTRACT(fev.value, CONCAT('$."', li.id, '"')) IS NOT NULL
      WHERE fev.field_id = 55
        AND li.id IN (86, 88, 89, 90, 91, 106)
        AND fev.value LIKE CONCAT('%"', li.id, '"%')
        ${clause}
      GROUP BY li.value, li.id
      ORDER BY cantidad DESC;
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, [...params, ...params]);
    return rows as TicketsBySystem[];
  }

  async getTicketsByType(filters: DateFilter): Promise<TicketsByType[]> {
    const { clause, params } = this.buildDateFilter(filters);
    
    const query = `
      SELECT 
        li.value as tipificacion,
        COUNT(DISTINCT t.ticket_id) as cantidad,
        ROUND((COUNT(DISTINCT t.ticket_id) * 100.0 / (SELECT COUNT(*) FROM ost_ticket t2 WHERE 1=1 ${clause})), 2) as porcentaje
      FROM ost_ticket t
      JOIN ost_form_entry fe ON t.ticket_id = fe.object_id AND fe.object_type = 'T'
      JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
      JOIN ost_list_items li ON JSON_EXTRACT(fev.value, CONCAT('$."', li.id, '"')) IS NOT NULL
      WHERE fev.field_id = 57
        AND li.id IN (92, 93, 94, 107, 127, 129, 131, 132)
        AND fev.value LIKE CONCAT('%"', li.id, '"%')
        ${clause}
      GROUP BY li.value, li.id
      ORDER BY cantidad DESC;
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, [...params, ...params]);
    return rows as TicketsByType[];
  }

  async getTopUsers(filters: DateFilter, limit: number = 5): Promise<TopUser[]> {
    const { clause, params } = this.buildDateFilter(filters);
    
    const query = `
      SELECT 
        u.id as user_id,
        u.name as nombre,
        ue.address as email,
        COUNT(t.ticket_id) as cantidad
      FROM ost_ticket t
      JOIN ost_user u ON t.user_id = u.id
      JOIN ost_user_email ue ON u.id = ue.user_id
      WHERE u.name NOT IN ('Gianfranco Policari', 'Sebastian Gaston', 'Rodrigo Massardo')
        AND u.name NOT LIKE 'Agustina Prei%'
        AND u.name NOT LIKE 'Roberto%'
        ${clause}
      GROUP BY u.id, u.name, ue.address
      ORDER BY cantidad DESC
      LIMIT ?;
    `;
    
    console.log('DEBUG getTopUsers query:', query);
    console.log('DEBUG getTopUsers params:', [...params, limit]);
    try {
      const [rows] = await pool.query<RowDataPacket[]>(query, [...params, limit]);
      return rows as TopUser[];
    } catch (err) {
      console.error('DEBUG SQL ERROR:', err);
      throw err;
    }
  }

  async getTopDepartments(filters: DateFilter, limit: number = 5): Promise<TopDepartment[]> {
    const { clause, params } = this.buildDateFilter(filters);
    
    const query = `
      SELECT 
        li.id as dept_id,
        li.value as nombre,
        COUNT(DISTINCT t.ticket_id) as cantidad,
        ROUND((COUNT(DISTINCT t.ticket_id) * 100.0 / (SELECT COUNT(*) FROM ost_ticket t2 WHERE 1=1 ${clause})), 2) as porcentaje
      FROM ost_ticket t
      JOIN ost_form_entry fe ON t.ticket_id = fe.object_id AND fe.object_type = 'T'
      JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
      JOIN ost_list_items li ON JSON_EXTRACT(fev.value, CONCAT('$."', li.id, '"')) IS NOT NULL
      WHERE fev.field_id = 61
        AND fev.value IS NOT NULL AND fev.value != ''
        ${clause}
      GROUP BY li.id, li.value
      ORDER BY cantidad DESC
      LIMIT ?;
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, [...params, ...params, limit]);
    return rows as TopDepartment[];
  }

  async getIncidentsStatus(filters: DateFilter): Promise<IncidentStatus[]> {
    const { clause, params } = this.buildDateFilter(filters);
    
    const query = `
      SELECT 
        ts.name as estado,
        COUNT(t.ticket_id) as cantidad,
        ROUND((COUNT(t.ticket_id) * 100.0 / (
          SELECT COUNT(*) 
          FROM ost_ticket t2
          JOIN ost_form_entry fe2 ON t2.ticket_id = fe2.object_id AND fe2.object_type = 'T'
          JOIN ost_form_entry_values fev2 ON fe2.id = fev2.entry_id
          WHERE fev2.value LIKE '%"92"%' AND t2.status_id IN (2, 3) ${clause}
        )), 2) as porcentaje
      FROM ost_ticket t
      JOIN ost_form_entry fe ON t.ticket_id = fe.object_id AND fe.object_type = 'T'
      JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
      JOIN ost_ticket_status ts ON t.status_id = ts.id
      WHERE fev.value LIKE '%"92"%'
        AND t.status_id IN (2, 3)
        ${clause}
      GROUP BY ts.name, t.status_id
      ORDER BY t.status_id;
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, [...params, ...params]);
    return rows as IncidentStatus[];
  }

  async getFunctionalRequirements(filters: DateFilter): Promise<FunctionalRequirement[]> {
    const { clause, params } = this.buildDateFilter(filters);
    
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
        ${clause}
      ORDER BY t.created DESC;
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
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
      WHERE t.number >= 5000 AND YEAR(t.created) = ? AND MONTH(t.created) = ?
      GROUP BY d.name
      
      UNION ALL
      
      SELECT 
        'por_tipificacion' as tipo,
        li.value as valor,
        COUNT(DISTINCT t.ticket_id) as cantidad
      FROM ost_ticket t
      JOIN ost_form_entry fe ON t.ticket_id = fe.object_id AND fe.object_type = 'T'
      JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
      JOIN ost_list_items li ON JSON_EXTRACT(fev.value, CONCAT('$."', li.id, '"')) IS NOT NULL
      WHERE t.number >= 5000 AND fev.field_id = 57
        AND li.id IN (92, 93, 94, 107, 127, 129, 131, 132)
        AND fev.value LIKE CONCAT('%"', li.id, '"%')
        AND YEAR(t.created) = ? AND MONTH(t.created) = ?
      GROUP BY li.value, li.id
      
      UNION ALL
      
      SELECT 
        'por_sistema' as tipo,
        li.value as valor,
        COUNT(DISTINCT t.ticket_id) as cantidad
      FROM ost_ticket t
      JOIN ost_form_entry fe ON t.ticket_id = fe.object_id AND fe.object_type = 'T'
      JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
      JOIN ost_list_items li ON JSON_EXTRACT(fev.value, CONCAT('$."', li.id, '"')) IS NOT NULL
      WHERE t.number >= 5000 AND fev.field_id = 55
        AND li.id IN (86, 88, 89, 90, 91, 106)
        AND fev.value LIKE CONCAT('%"', li.id, '"%')
        AND YEAR(t.created) = ? AND MONTH(t.created) = ?
      GROUP BY li.value, li.id;
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, [year, month, year, month, year, month]);
    
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

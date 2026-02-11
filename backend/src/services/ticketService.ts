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
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [...params, ...params]);
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
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [...params, ...params]);
    return rows as TicketsByType[];
  }

  async getTopUsers(filters: DateFilter, limit: number = 10): Promise<TopUser[]> {
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
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [...params, limit]);
    return rows as TopUser[];
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
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [...params, ...params, limit]);
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
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [...params, ...params]);
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
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows as FunctionalRequirement[];
  }

  async getTicketList(params: {
    page?: number; limit?: number; search?: string;
    status?: string; tipificacion?: string; from?: string; to?: string;
    year?: number; month?: number; day?: number;
  }): Promise<{ tickets: any[]; total: number; page: number; limit: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions: string[] = ['t.number >= 5000'];
    const queryParams: any[] = [];

    if (params.tipificacion) {
      conditions.push(`EXISTS (
        SELECT 1 FROM ost_form_entry fe_t
        JOIN ost_form_entry_values fev_t ON fe_t.id = fev_t.entry_id AND fev_t.field_id = 57
        JOIN ost_list_items li_t ON fev_t.value LIKE CONCAT('%"', li_t.id, '"%')
        WHERE fe_t.object_id = t.ticket_id AND fe_t.object_type = 'T' AND li_t.value = ?
      )`);
      queryParams.push(params.tipificacion);
    }

    if (params.search) {
      const s = `%${params.search}%`;
      conditions.push(`(t.number LIKE ? OR u.name LIKE ? OR CONCAT(s.firstname, ' ', s.lastname) LIKE ? OR EXISTS (
        SELECT 1 FROM ost_form_entry fe_x
        JOIN ost_form_entry_values fev_x ON fe_x.id = fev_x.entry_id AND fev_x.field_id IN (61, 57)
        JOIN ost_list_items li_x ON fev_x.value LIKE CONCAT('%"', li_x.id, '"%')
        WHERE fe_x.object_id = t.ticket_id AND fe_x.object_type = 'T' AND li_x.value LIKE ?
      ))`);
      queryParams.push(s, s, s, s);
    }
    if (params.status) {
      const statusMap: Record<string, string> = { 'Abierto': 'Open', 'Resuelto': 'Resolved', 'Cerrado': 'Closed' };
      conditions.push(`ts.name = ?`);
      queryParams.push(statusMap[params.status] || params.status);
    }
    if (params.from && params.to) {
      conditions.push(`t.created BETWEEN ? AND ?`);
      queryParams.push(params.from, `${params.to} 23:59:59`);
    }
    if (params.year) { conditions.push(`YEAR(t.created) = ?`); queryParams.push(params.year); }
    if (params.month) { conditions.push(`MONTH(t.created) = ?`); queryParams.push(params.month); }
    if (params.day) { conditions.push(`DAY(t.created) = ?`); queryParams.push(params.day); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Step 1: Fast count (no sector JOINs)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ost_ticket t
      LEFT JOIN ost_ticket__cdata tc ON t.ticket_id = tc.ticket_id
      JOIN ost_ticket_status ts ON t.status_id = ts.id
      JOIN ost_user u ON t.user_id = u.id
      LEFT JOIN ost_staff s ON t.staff_id = s.staff_id
      ${where}
    `;

    // Step 2: Fast list (no sector JOINs)
    const listQuery = `
      SELECT 
        t.ticket_id, t.number,
        CASE ts.name
          WHEN 'Open' THEN 'Abierto'
          WHEN 'Resolved' THEN 'Resuelto'
          WHEN 'Closed' THEN 'Cerrado'
          ELSE ts.name
        END as estado,
        COALESCE(CONCAT(s.firstname, ' ', s.lastname), 'Sin asignar') as agente,
        u.name as usuario,
        DATE_FORMAT(t.created, '%Y-%m-%d %H:%i') as fecha_creacion
      FROM ost_ticket t
      LEFT JOIN ost_ticket__cdata tc ON t.ticket_id = tc.ticket_id
      JOIN ost_ticket_status ts ON t.status_id = ts.id
      JOIN ost_user u ON t.user_id = u.id
      LEFT JOIN ost_staff s ON t.staff_id = s.staff_id
      ${where}
      ORDER BY t.created DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;

    const [[countRows], [rows]] = await Promise.all([
      pool.query<RowDataPacket[]>(countQuery, queryParams),
      pool.query<RowDataPacket[]>(listQuery, queryParams)
    ]);

    const tickets = rows as any[];

    // Step 3: Batch-resolve sector (61) and tipificacion (57)
    if (tickets.length > 0) {
      const ticketIds = tickets.map((t: any) => t.ticket_id);
      const placeholders = ticketIds.map(() => '?').join(',');
      const [fieldRows] = await pool.query<RowDataPacket[]>(`
        SELECT fe.object_id as ticket_id, fev.field_id, li.value as val
        FROM ost_form_entry fe
        JOIN ost_form_entry_values fev ON fe.id = fev.entry_id AND fev.field_id IN (61, 57)
        JOIN ost_list_items li ON fev.value LIKE CONCAT('%"', li.id, '"%')
        WHERE fe.object_id IN (${placeholders}) AND fe.object_type = 'T'
      `, ticketIds);
      const sectorMap: Record<number, string> = {};
      const tipifMap: Record<number, string> = {};
      (fieldRows as any[]).forEach((r: any) => {
        if (r.field_id === 61) sectorMap[r.ticket_id] = r.val;
        if (r.field_id === 57) tipifMap[r.ticket_id] = r.val;
      });
      tickets.forEach((t: any) => {
        t.sector = sectorMap[t.ticket_id] || null;
        t.tipificacion = tipifMap[t.ticket_id] || null;
      });
    }

    return { tickets, total: (countRows[0] as any).total, page, limit };
  }

  async getTicketDetail(ticketId: number): Promise<any> {
    const ticketQuery = `
      SELECT 
        t.ticket_id, t.number, t.created, t.updated, t.closed, t.isoverdue,
        tc.subject as asunto,
        COALESCE(sla.name, 'Sin SLA') as sla,
        ts.name as estado,
        d.name as departamento,
        COALESCE(CONCAT(s.firstname, ' ', s.lastname), 'Sin asignar') as agente,
        u.name as usuario,
        ue.address as usuario_email
      FROM ost_ticket t
      LEFT JOIN ost_ticket__cdata tc ON t.ticket_id = tc.ticket_id
      LEFT JOIN ost_sla sla ON t.sla_id = sla.id
      JOIN ost_ticket_status ts ON t.status_id = ts.id
      LEFT JOIN ost_department d ON t.dept_id = d.id
      JOIN ost_user u ON t.user_id = u.id
      LEFT JOIN ost_user_email ue ON u.id = ue.user_id
      LEFT JOIN ost_staff s ON t.staff_id = s.staff_id
      WHERE t.ticket_id = ?
    `;

    const formFieldsQuery = `
      SELECT ff.label, fev.value, ff.type
      FROM ost_form_entry fe
      JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
      JOIN ost_form_field ff ON fev.field_id = ff.id
      WHERE fe.object_id = ? AND fe.object_type = 'T'
      ORDER BY ff.sort
    `;

    const threadQuery = `
      SELECT 
        te.id, te.type, te.title, te.body, te.poster,
        DATE_FORMAT(te.created, '%Y-%m-%d %H:%i') as created,
        CASE WHEN te.staff_id > 0 THEN CONCAT(s.firstname, ' ', s.lastname) ELSE u.name END as author
      FROM ost_thread th
      JOIN ost_thread_entry te ON th.id = te.thread_id
      LEFT JOIN ost_staff s ON te.staff_id = s.staff_id
      LEFT JOIN ost_user u ON te.user_id = u.id
      WHERE th.object_id = ? AND th.object_type = 'T'
      ORDER BY te.created ASC
    `;

    const attachmentsQuery = `
      SELECT 
        a.object_id as thread_entry_id,
        f.id as file_id, f.name, f.type as mime_type, f.size
      FROM ost_thread th
      JOIN ost_thread_entry te ON th.id = te.thread_id
      JOIN ost_attachment a ON te.id = a.object_id AND a.type = 'H'
      JOIN ost_file f ON a.file_id = f.id
      WHERE th.object_id = ? AND th.object_type = 'T'
    `;

    const [[ticket], [fields], [threads], [attachments]] = await Promise.all([
      pool.execute<RowDataPacket[]>(ticketQuery, [ticketId]),
      pool.execute<RowDataPacket[]>(formFieldsQuery, [ticketId]),
      pool.execute<RowDataPacket[]>(threadQuery, [ticketId]),
      pool.execute<RowDataPacket[]>(attachmentsQuery, [ticketId])
    ]);

    if (!ticket.length) return null;

    const attachmentMap: Record<number, any[]> = {};
    (attachments as any[]).forEach((a: any) => {
      if (!attachmentMap[a.thread_entry_id]) attachmentMap[a.thread_entry_id] = [];
      attachmentMap[a.thread_entry_id].push({ file_id: a.file_id, name: a.name, mime_type: a.mime_type, size: a.size });
    });

    const threadEntries = (threads as any[]).map((t: any) => ({
      ...t,
      attachments: attachmentMap[t.id] || []
    }));

    return { ...ticket[0], fields, thread: threadEntries };
  }

  async getAttachmentFile(fileId: number): Promise<{ name: string; type: string; data: Buffer } | null> {
    const [fileRows] = await pool.execute<RowDataPacket[]>(
      'SELECT name, type, size FROM ost_file WHERE id = ?', [fileId]
    );
    if (!(fileRows as any[]).length) return null;
    const file = (fileRows as any[])[0];

    const [chunkRows] = await pool.execute<RowDataPacket[]>(
      'SELECT filedata FROM ost_file_chunk WHERE file_id = ? ORDER BY chunk_id ASC', [fileId]
    );
    const chunks = (chunkRows as any[]).map((c: any) => c.filedata);
    const data = Buffer.concat(chunks);

    return { name: file.name, type: file.type, data };
  }

  async getMonthlySummary(year: number, month: number, filterField?: number, filterItemId?: number): Promise<any> {
    const buildFilterJoin = (currentField: number): { join: string; params: any[] } => {
      if (!filterField || !filterItemId || filterField === currentField) {
        return { join: '', params: [] };
      }
      return {
        join: `JOIN ost_form_entry_values fev_filter ON fe.id = fev_filter.entry_id AND fev_filter.field_id = ? AND fev_filter.value LIKE CONCAT('%"', ?, '"%')`,
        params: [filterField, filterItemId]
      };
    };

    const sectorFilter = buildFilterJoin(61);
    const sectorQuery = `
      SELECT li.id as item_id, li.value as valor, COUNT(DISTINCT t.ticket_id) as cantidad
      FROM ost_ticket t
      JOIN ost_form_entry fe ON t.ticket_id = fe.object_id AND fe.object_type = 'T'
      JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
      JOIN ost_list_items li ON JSON_EXTRACT(fev.value, CONCAT('$."', li.id, '"')) IS NOT NULL
      ${sectorFilter.join}
      WHERE t.number >= 5000 AND fev.field_id = 61
        AND fev.value IS NOT NULL AND fev.value != ''
        AND t.created >= ? AND t.created < ?
      GROUP BY li.id, li.value ORDER BY cantidad DESC;
    `;

    const tipoFilter = buildFilterJoin(57);
    const tipoQuery = `
      SELECT li.id as item_id, li.value as valor, COUNT(DISTINCT t.ticket_id) as cantidad
      FROM ost_ticket t
      JOIN ost_form_entry fe ON t.ticket_id = fe.object_id AND fe.object_type = 'T'
      JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
      JOIN ost_list_items li ON JSON_EXTRACT(fev.value, CONCAT('$."', li.id, '"')) IS NOT NULL
      ${tipoFilter.join}
      WHERE t.number >= 5000 AND fev.field_id = 57
        AND li.id IN (92, 93, 94, 107, 127, 129, 131, 132)
        AND fev.value LIKE CONCAT('%"', li.id, '"%')
        AND t.created >= ? AND t.created < ?
      GROUP BY li.value, li.id ORDER BY cantidad DESC;
    `;

    const sistemaFilter = buildFilterJoin(55);
    const sistemaQuery = `
      SELECT li.id as item_id, li.value as valor, COUNT(DISTINCT t.ticket_id) as cantidad
      FROM ost_ticket t
      JOIN ost_form_entry fe ON t.ticket_id = fe.object_id AND fe.object_type = 'T'
      JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
      JOIN ost_list_items li ON JSON_EXTRACT(fev.value, CONCAT('$."', li.id, '"')) IS NOT NULL
      ${sistemaFilter.join}
      WHERE t.number >= 5000 AND fev.field_id = 55
        AND li.id IN (86, 88, 89, 90, 91, 106)
        AND fev.value LIKE CONCAT('%"', li.id, '"%')
        AND t.created >= ? AND t.created < ?
      GROUP BY li.value, li.id ORDER BY cantidad DESC;
    `;

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const [sectorRows, tipoRows, sistemaRows] = await Promise.all([
      pool.execute<RowDataPacket[]>(sectorQuery, [...sectorFilter.params, startDate, endDate]),
      pool.execute<RowDataPacket[]>(tipoQuery, [...tipoFilter.params, startDate, endDate]),
      pool.execute<RowDataPacket[]>(sistemaQuery, [...sistemaFilter.params, startDate, endDate])
    ]).then(results => results.map(r => r[0]));

    return {
      mes: month,
      anio: year,
      tickets_por_sector: sectorRows.map((r: any) => ({ id: r.item_id, sector: r.valor, cantidad: r.cantidad })),
      tickets_por_tipificacion: tipoRows.map((r: any) => ({ id: r.item_id, tipificacion: r.valor, cantidad: r.cantidad })),
      tickets_por_sistema: sistemaRows.map((r: any) => ({ id: r.item_id, sistema: r.valor, cantidad: r.cantidad }))
    };
  }
}

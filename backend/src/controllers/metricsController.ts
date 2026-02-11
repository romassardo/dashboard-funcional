import { Request, Response } from 'express';
import { TicketService } from '../services/ticketService';
import { DateFilter } from '../types/ticket.types';

const ticketService = new TicketService();

function parseFilters(query: Request['query']): DateFilter {
  return {
    from: query.from as string,
    to: query.to as string,
    year: query.year ? parseInt(query.year as string) : undefined,
    month: query.month ? parseInt(query.month as string) : undefined,
    day: query.day ? parseInt(query.day as string) : undefined
  };
}

function handleError(res: Response, method: string, message: string, error: unknown): void {
  console.error(`Error in ${method}:`, error);
  res.status(500).json({ success: false, error: message });
}

export class MetricsController {
  async getTicketsBySystem(req: Request, res: Response): Promise<void> {
    try {
      const data = await ticketService.getTicketsBySystem(parseFilters(req.query));
      res.json({ success: true, data });
    } catch (error) {
      handleError(res, 'getTicketsBySystem', 'Error al obtener tickets por sistema', error);
    }
  }

  async getTicketsByType(req: Request, res: Response): Promise<void> {
    try {
      const data = await ticketService.getTicketsByType(parseFilters(req.query));
      res.json({ success: true, data });
    } catch (error) {
      handleError(res, 'getTicketsByType', 'Error al obtener tickets por tipificación', error);
    }
  }

  async getTopUsers(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const data = await ticketService.getTopUsers(parseFilters(req.query), limit);
      res.json({ success: true, data });
    } catch (error) {
      handleError(res, 'getTopUsers', 'Error al obtener top usuarios', error);
    }
  }

  async getTopDepartments(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const data = await ticketService.getTopDepartments(parseFilters(req.query), limit);
      res.json({ success: true, data });
    } catch (error) {
      handleError(res, 'getTopDepartments', 'Error al obtener top departamentos', error);
    }
  }

  async getIncidentsStatus(req: Request, res: Response): Promise<void> {
    try {
      const data = await ticketService.getIncidentsStatus(parseFilters(req.query));
      res.json({ success: true, data });
    } catch (error) {
      handleError(res, 'getIncidentsStatus', 'Error al obtener estado de incidentes', error);
    }
  }

  async getFunctionalRequirements(req: Request, res: Response): Promise<void> {
    try {
      const data = await ticketService.getFunctionalRequirements(parseFilters(req.query));
      res.json({ success: true, data });
    } catch (error) {
      handleError(res, 'getFunctionalRequirements', 'Error al obtener requerimientos funcionales', error);
    }
  }

  async getOpenTicketCount(_req: Request, res: Response): Promise<void> {
    try {
      const total = await ticketService.getOpenTicketCount();
      console.log('[Controller] getOpenTicketCount result:', total, 'type:', typeof total);
      res.json({ success: true, data: { total } });
    } catch (error: any) {
      console.error('[Controller] getOpenTicketCount ERROR:', error?.message, error?.stack);
      handleError(res, 'getOpenTicketCount', 'Error al obtener tickets abiertos', error);
    }
  }

  async getTicketList(req: Request, res: Response): Promise<void> {
    try {
      const data = await ticketService.getTicketList({
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
        search: req.query.search as string,
        status: req.query.status as string,
        tipificacion: req.query.tipificacion as string,
        from: req.query.from as string,
        to: req.query.to as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        month: req.query.month ? parseInt(req.query.month as string) : undefined,
        day: req.query.day ? parseInt(req.query.day as string) : undefined,
      });
      res.json({ success: true, data });
    } catch (error) {
      handleError(res, 'getTicketList', 'Error al obtener listado de tickets', error);
    }
  }

  async getTicketDetail(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.ticketId);
      if (!ticketId) { res.status(400).json({ success: false, error: 'ticketId inválido' }); return; }
      const data = await ticketService.getTicketDetail(ticketId);
      if (!data) { res.status(404).json({ success: false, error: 'Ticket no encontrado' }); return; }
      res.json({ success: true, data });
    } catch (error) {
      handleError(res, 'getTicketDetail', 'Error al obtener detalle del ticket', error);
    }
  }

  async getAttachment(req: Request, res: Response): Promise<void> {
    try {
      const fileId = parseInt(req.params.fileId);
      if (!fileId) { res.status(400).json({ success: false, error: 'fileId inválido' }); return; }
      const file = await ticketService.getAttachmentFile(fileId);
      if (!file) { res.status(404).json({ success: false, error: 'Archivo no encontrado' }); return; }
      res.setHeader('Content-Type', file.type);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
      res.setHeader('Content-Length', file.data.length);
      res.send(file.data);
    } catch (error) {
      handleError(res, 'getAttachment', 'Error al obtener archivo adjunto', error);
    }
  }

  async getMonthlySummary(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.query.year as string);
      const month = parseInt(req.query.month as string);

      if (!year || !month) {
        res.status(400).json({ success: false, error: 'Se requieren parámetros year y month' });
        return;
      }

      const filterField = req.query.filterField ? parseInt(req.query.filterField as string) : undefined;
      const filterItemId = req.query.filterItemId ? parseInt(req.query.filterItemId as string) : undefined;
      const data = await ticketService.getMonthlySummary(year, month, filterField, filterItemId);
      res.json({ success: true, data });
    } catch (error) {
      handleError(res, 'getMonthlySummary', 'Error al obtener resumen mensual', error);
    }
  }
}

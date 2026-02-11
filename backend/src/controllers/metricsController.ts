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

  async getMonthlySummary(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.query.year as string);
      const month = parseInt(req.query.month as string);

      if (!year || !month) {
        res.status(400).json({ success: false, error: 'Se requieren parámetros year y month' });
        return;
      }

      const data = await ticketService.getMonthlySummary(year, month);
      res.json({ success: true, data });
    } catch (error) {
      handleError(res, 'getMonthlySummary', 'Error al obtener resumen mensual', error);
    }
  }
}

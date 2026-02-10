import { Request, Response } from 'express';
import { TicketService } from '../services/ticketService';
import { DateFilter } from '../types/ticket.types';

const ticketService = new TicketService();

export class MetricsController {
  async getTicketsBySystem(req: Request, res: Response): Promise<void> {
    try {
      const filters: DateFilter = {
        from: req.query.from as string,
        to: req.query.to as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        month: req.query.month ? parseInt(req.query.month as string) : undefined,
        day: req.query.day ? parseInt(req.query.day as string) : undefined
      };

      const data = await ticketService.getTicketsBySystem(filters);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getTicketsBySystem:', error);
      res.status(500).json({ success: false, error: 'Error al obtener tickets por sistema' });
    }
  }

  async getTicketsByType(req: Request, res: Response): Promise<void> {
    try {
      const filters: DateFilter = {
        from: req.query.from as string,
        to: req.query.to as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        month: req.query.month ? parseInt(req.query.month as string) : undefined,
        day: req.query.day ? parseInt(req.query.day as string) : undefined
      };

      const data = await ticketService.getTicketsByType(filters);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getTicketsByType:', error);
      res.status(500).json({ success: false, error: 'Error al obtener tickets por tipificación' });
    }
  }

  async getTopUsers(req: Request, res: Response): Promise<void> {
    try {
      const filters: DateFilter = {
        from: req.query.from as string,
        to: req.query.to as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        month: req.query.month ? parseInt(req.query.month as string) : undefined,
        day: req.query.day ? parseInt(req.query.day as string) : undefined
      };
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      const data = await ticketService.getTopUsers(filters, limit);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getTopUsers:', error);
      res.status(500).json({ success: false, error: 'Error al obtener top usuarios' });
    }
  }

  async getTopDepartments(req: Request, res: Response): Promise<void> {
    try {
      const filters: DateFilter = {
        from: req.query.from as string,
        to: req.query.to as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        month: req.query.month ? parseInt(req.query.month as string) : undefined,
        day: req.query.day ? parseInt(req.query.day as string) : undefined
      };
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      const data = await ticketService.getTopDepartments(filters, limit);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getTopDepartments:', error);
      res.status(500).json({ success: false, error: 'Error al obtener top departamentos' });
    }
  }

  async getIncidentsStatus(req: Request, res: Response): Promise<void> {
    try {
      const filters: DateFilter = {
        from: req.query.from as string,
        to: req.query.to as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        month: req.query.month ? parseInt(req.query.month as string) : undefined,
        day: req.query.day ? parseInt(req.query.day as string) : undefined
      };

      const data = await ticketService.getIncidentsStatus(filters);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getIncidentsStatus:', error);
      res.status(500).json({ success: false, error: 'Error al obtener estado de incidentes' });
    }
  }

  async getFunctionalRequirements(req: Request, res: Response): Promise<void> {
    try {
      const filters: DateFilter = {
        from: req.query.from as string,
        to: req.query.to as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        month: req.query.month ? parseInt(req.query.month as string) : undefined,
        day: req.query.day ? parseInt(req.query.day as string) : undefined
      };

      const data = await ticketService.getFunctionalRequirements(filters);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getFunctionalRequirements:', error);
      res.status(500).json({ success: false, error: 'Error al obtener requerimientos funcionales' });
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
      console.error('Error in getMonthlySummary:', error);
      res.status(500).json({ success: false, error: 'Error al obtener resumen mensual' });
    }
  }
}

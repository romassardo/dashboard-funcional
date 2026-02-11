import { Router } from 'express';
import { MetricsController } from '../controllers/metricsController';

const router = Router();
const metricsController = new MetricsController();

router.get('/tickets-by-system', (req, res) => metricsController.getTicketsBySystem(req, res));
router.get('/tickets-by-type', (req, res) => metricsController.getTicketsByType(req, res));
router.get('/top-users', (req, res) => metricsController.getTopUsers(req, res));
router.get('/top-departments', (req, res) => metricsController.getTopDepartments(req, res));
router.get('/incidents-status', (req, res) => metricsController.getIncidentsStatus(req, res));
router.get('/functional-requirements', (req, res) => metricsController.getFunctionalRequirements(req, res));
router.get('/monthly-summary', (req, res) => metricsController.getMonthlySummary(req, res));
router.get('/tickets', (req, res) => metricsController.getTicketList(req, res));
router.get('/tickets/:ticketId', (req, res) => metricsController.getTicketDetail(req, res));
router.get('/attachments/:fileId', (req, res) => metricsController.getAttachment(req, res));

export default router;

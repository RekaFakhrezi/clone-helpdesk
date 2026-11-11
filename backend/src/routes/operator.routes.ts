import { Router } from 'express';
import { getOperatorDashboard, getTicketById, updateTicket, getAllOperatorTickets } from '../controllers/operatorController';

const router = Router();

// /api/operator/dashboard
router.get('/dashboard', getOperatorDashboard);
router.get('/tickets/all', getAllOperatorTickets);
router.get('/tickets/:id', getTicketById);
router.patch('/tickets/:id', updateTicket);

export default router;

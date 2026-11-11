import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import {
  getTicketsForDashboard,
  getTicketByNum,
  updateTicketByStaff,
  getTicketMessages,
  sendStaffResponse,
  sendWaMessage,
  deleteTicketPermanently
} from '../controllers/ticketController';

const router = Router();

// Semua endpoint tiket di bawah mewajibkan header "Authorization: Bearer <token>"
router.use(requireAuth);

// 1. GET /api/admin/tickets - Ambil daftar tiket
router.get('/', getTicketsForDashboard);

// 2. GET /api/admin/tickets/:ticketNum - Ambil detail tiket berdasarkan nomor tiket
router.get('/:ticketNum', getTicketByNum);

// 3. PATCH /api/admin/tickets/:id - Ubah status / disposisi tiket
router.patch(
  '/:id',
  requireRole(['admin', 'operator', 'teknisi']),
  updateTicketByStaff
);

// 4. GET /api/admin/tickets/:ticketId/messages - Ambil riwayat pesan tiket
router.get('/:ticketId/messages', getTicketMessages);

// 5. POST /api/admin/tickets/:ticketId/messages - Kirim balasan pesan tiket
router.post(
  '/:ticketId/messages',
  requireRole(['admin', 'operator', 'teknisi']),
  sendStaffResponse
);

// 6. POST /api/admin/tickets/:ticketId/messages/wa - Kirim WA langsung
router.post('/:ticketId/messages/wa', requireRole(['admin', 'operator', 'teknisi']), sendWaMessage);

// 7. DELETE /api/admin/tickets/:id - Hapus permanen tiket
router.delete(
  '/:id',
  requireRole(['admin']),
  deleteTicketPermanently
);

export default router;

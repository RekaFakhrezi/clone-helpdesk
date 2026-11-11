import { Router, Request, Response } from 'express';
import { pushSimulatorLog, simulatorLogs } from '../services/wasender';
import { handleIncomingMessage } from '../services/botService';

const router = Router();

// GET /api/simulator/messages/:phone
// Mendapatkan riwayat percakapan dari memory berdasarkan nomor telepon
router.get('/messages/:phone', (req: Request, res: Response) => {
  const { phone } = req.params;
  const msgs = simulatorLogs.filter(m => m.phone === phone);
  res.json({ success: true, data: msgs });
});

// POST /api/simulator/send
// Mengirim pesan dari "pengguna" (user) ke bot
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { phone, message, mediaUrl, mediaType } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone wajib diisi' });
    }

    // Simpan pesan user ke memory agar muncul di UI simulator
    pushSimulatorLog({
      phone,
      message: message || '',
      timestamp: new Date().toISOString(),
      sender: 'user',
      mediaUrl,
      mediaType
    });

    // Trigger logika bot secara async (gabungkan mediaUrl ke text jika ada, agar botService sederhana)
    let combinedMessage = message || '';
    if (mediaUrl) {
      combinedMessage += `\n\n[Lampiran: ${mediaUrl}]`;
    }
    // Panggil botService
    handleIncomingMessage(phone, combinedMessage.trim(), mediaUrl);

    res.json({ success: true });
  } catch (error) {
    console.error('Simulator Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import axios from 'axios';
import { setTimeout as sleep } from 'node:timers/promises';
import { supabase } from '../config/supabase';

interface SendMessageResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

// Memory untuk Simulator
export interface SimulatorLogEntry {
  phone: string;
  message: string;
  timestamp: string;
  sender: 'bot' | 'user';
  mediaUrl?: string;
  mediaType?: string;
}

export const simulatorLogs: SimulatorLogEntry[] = [];

/** Simpan pesan ke memory simulator (maks 100 pesan). */
export function pushSimulatorLog(entry: SimulatorLogEntry) {
  simulatorLogs.push(entry);
  if (simulatorLogs.length > 100) simulatorLogs.shift();
}

/**
 * Kirim pesan via WASender API dengan retry otomatis.
 * Jika WASender return 429 (rate limit) atau error jaringan sementara,
 * akan dicoba ulang hingga MAX_RETRIES kali dengan jeda exponential.
 */
export async function sendMessage(to: string, text: string): Promise<SendMessageResponse | undefined> {
  console.log('\n================ WASENDER OUTGOING MESSAGE ================');
  console.log(`Penerima : ${to}`);
  console.log(`Pesan    :\n${text}`);
  console.log('===========================================================\n');

  pushSimulatorLog({ phone: to, message: text, timestamp: new Date().toISOString(), sender: 'bot' });

  const MAX_RETRIES = 3;
  const BASE_DELAY_MS = 1000; // 1 detik, berlipat setiap retry

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post<SendMessageResponse>(
        `${process.env.WASENDER_BASE_URL || 'https://www.wasenderapi.com/api'}/send-message`,
        { to, text },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.WASENDER_BEARER_TOKEN}`,
          },
          timeout: 10000, // 10 detik timeout
        }
      );
      if (attempt > 1) {
        console.log(`[WASender] Berhasil kirim ke ${to} pada percobaan ke-${attempt}`);
      }
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const errBody = JSON.stringify(error?.response?.data || {});
      const errMsg = error?.message || 'Unknown error';

      console.error(`[WASender] Percobaan ${attempt}/${MAX_RETRIES} GAGAL kirim ke ${to}`);
      console.error(`  Status  : ${status || 'No response (network error)'}`);
      console.error(`  Message : ${errMsg}`);
      console.error(`  Body    : ${errBody}`);

      // Jika masih ada percobaan tersisa DAN errornya bukan 4xx permanen (selain 429)
      const isRetryable = !status || status === 429 || status >= 500;
      if (attempt < MAX_RETRIES && isRetryable) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1); // 1s, 2s, 4s
        console.warn(`[WASender] Mencoba ulang dalam ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      // Jika 401/403 — token salah, tidak perlu retry
      if (status === 401 || status === 403) {
        console.error('[WASender] ❌ AUTENTIKASI GAGAL! Periksa WASENDER_BEARER_TOKEN di Environment Variables Render.');
      }

      return undefined;
    }
  }

  return undefined;
}

interface NotifiableTicket {
  id: string;
  phone?: string | null;
  ticket_num?: string | null;
  reporter_name?: string | null;
}

/**
 * Kirim notifikasi WhatsApp saat status tiket berubah.
 * Bila status menjadi RESOLVED/CLOSED, sesi pelapor diarahkan ke WAITING_RATING.
 */
export async function notifyStatusChange(
  ticket: NotifiableTicket,
  status: string,
  opts: { isReopen?: boolean; confirmWord?: string } = {}
) {
  const { phone } = ticket;
  if (!phone) return;

  const { isReopen = false, confirmWord = 'thanks' } = opts;
  const ticketLabel = ticket.ticket_num || ticket.id;
  const reporter = ticket.reporter_name || 'Pelapor';

  if (status === 'WAITING CONFIRMATION') {
    const confirmLink = `${process.env.FRONTEND_URL || 'https://helpdesk-it-jet.vercel.app'}/ticket/confirm/${ticket.id}`;
    const msg = `Halo ${reporter},\n\nTiket pengaduan Anda dengan nomor *${ticketLabel}* telah selesai ditangani oleh teknisi kami.\n\nMohon konfirmasi apakah masalah sudah benar-benar teratasi melalui tautan berikut:\n${confirmLink}\n\n*ATAU balas pesan ini* dengan mengetik kata _selesai_, _ok_, atau _${confirmWord}_.\n\nTerima kasih.`;
    await sendMessage(phone, msg).catch(e => console.error('Gagal kirim WA konfirmasi:', e));
    return;
  }

  let msg = `Halo ${reporter},\n\nStatus tiket pengaduan Anda (*${ticketLabel}*) telah diperbarui menjadi: *${status}*.`;
  if (status === 'Open' || status === 'OPEN') {
    if (isReopen) {
      msg += '\n\nTiket Anda telah dibuka kembali dan akan segera ditangani ulang oleh teknisi kami.';
    } else {
      msg += '\n\nTiket Anda telah berhasil diverifikasi oleh operator dan akan segera diteruskan ke departemen/teknisi terkait.';
    }
  } else if (status === 'IN PROGRESS' || status === 'Diproses') {
    msg += '\n\nTeknisi kami saat ini sedang mengerjakan dan menangani kendala Anda.';
  } else if (status === 'RESOLVED' || status === 'CLOSED') {
    await supabase.from('wa_sessions').upsert({
      phone,
      step: 'WAITING_RATING',
      data: { ticket_id: ticket.id },
      updated_at: new Date().toISOString(),
    });
    msg = `Halo ${reporter},\n\nTiket pengaduan Anda (*${ticketLabel}*) telah resmi diselesaikan oleh tim IT HelpDesk kami. ✅\n\nBantu kami meningkatkan layanan dengan memberikan *RATING (1-5)* beserta ulasan Anda dalam 1 pesan balasan.\n\nContoh balasan:\n_5 Pelayanan sangat cepat dan teknisi ramah_`;
  } else if (status === 'REJECTED' || status === 'Ditolak') {
    msg += '\n\nMohon maaf, tiket Anda ditolak karena alasan tertentu. Silakan cek detail tiket atau hubungi Helpdesk.';
  }

  await sendMessage(phone, msg).catch(e => console.error('Gagal kirim WA notif status:', e));
}

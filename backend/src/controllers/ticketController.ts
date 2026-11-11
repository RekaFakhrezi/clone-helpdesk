import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { notifyStatusChange, sendMessage } from '../services/wasender';
import { TICKET_SELECT } from '../services/ticketQueries';

/**
 * 1. Mengambil semua tiket untuk Dashboard (Admin/Staf)
 * Endpoint: GET /api/tickets
 */
export const getTicketsForDashboard = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(TICKET_SELECT)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Mengambil detail 1 tiket berdasarkan Ticket Number
 * Endpoint: GET /api/tickets/:ticketNum
 */
export const getTicketByNum = async (req: Request, res: Response) => {
  try {
    const { ticketNum } = req.params;

    const { data, error } = await supabase
      .from('tickets')
      .select(`${TICKET_SELECT}, attachments:ticket_attachments(*)`)
      .eq('ticket_num', ticketNum)
      .single();

    if (error) {
      return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Update status & penanggung jawab tiket oleh Staf/Admin
 * Endpoint: PUT /api/tickets/:id
 */
export const updateTicketByStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, tech_id, dept_id, priority, category_id, isReopen } = req.body;

    const updatePayload: any = {
      updated_at: new Date().toISOString()
    };

    if (status) updatePayload.status = status;
    if (tech_id !== undefined) updatePayload.tech_id = tech_id;
    if (dept_id !== undefined) updatePayload.dept_id = dept_id;
    if (priority) updatePayload.priority = priority;
    if (category_id !== undefined) updatePayload.category_id = category_id;

    const { data, error } = await supabase
      .from('tickets')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    // Auto send WhatsApp for status changes (tidak menahan respons endpoint)
    if (status && data.phone) {
      notifyStatusChange(data, status, { isReopen, confirmWord: 'thanks' }).catch(e =>
        console.error('Gagal kirim WA notif status:', e)
      );
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Mengambil riwayat pesan/obrolan pada tiket
 * Endpoint: GET /api/tickets/:ticketId/messages
 */
export const getTicketMessages = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*, tech:staff_profiles!ticket_messages_sender_id_fkey(name, role)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Mengirim respon/balasan pesan tiket
 * Endpoint: POST /api/tickets/:ticketId/messages
 */
export const sendStaffResponse = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    
    // Gunakan user ID dari token JWT (AuthRequest)
    const sender_id = (req as any).user?.id;
    if (!sender_id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('ticket_messages')
      .insert([
        {
          ticket_id: ticketId,
          sender_id: sender_id,
          sender_type: 'ADMIN',
          message: message
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendWaMessage = async (req: Request, res: Response) => {
  try {
    const { message, phone } = req.body;
    if (!message || !phone) {
      return res.status(400).json({ success: false, message: 'Message and phone are required' });
    }

    await sendMessage(phone, message);
    return res.status(200).json({ success: true, message: 'WA message sent' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmTicketPublic = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { action } = req.body;

    if (!ticketId || !action) {
      return res.status(400).json({ success: false, message: 'Invalid data' });
    }

    const { error: updateError } = await supabase
      .from('tickets')
      .update({ status: action })
      .eq('id', ticketId);

    if (updateError) throw updateError;

    // Tambah pesan internal
    await supabase.from('ticket_messages').insert({
      ticket_id: ticketId,
      sender_type: 'USER',
      message: `[KONFIRMASI PELAPOR] Pelapor menyatakan tiket ini: ${action === 'RESOLVED' ? 'SUDAH SELESAI' : 'BELUM SELESAI'}`
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTicketPermanently = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid ticket ID' });
    }

    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, message: 'Ticket permanently deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
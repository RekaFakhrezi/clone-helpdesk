import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { applySortOrders } from './metadataController';

export const getBotMenus = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('bot_menus').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createBotMenu = async (req: Request, res: Response) => {
  try {
    const { title, action_type, content, parent_id, sort_order, is_active } = req.body;
    const { data, error } = await supabaseAdmin.from('bot_menus').insert([{ 
      title, action_type, content, parent_id, sort_order, is_active 
    }]).select().single();
    
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBotMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, action_type, content, parent_id, sort_order, is_active } = req.body;
    
    const { data, error } = await supabaseAdmin.from('bot_menus').update({ 
      title, action_type, content, parent_id, sort_order, is_active, updated_at: new Date().toISOString()
    }).eq('id', id).select().single();
    
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBotMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('bot_menus').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const reorderBotMenus = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body; // array of { id, sort_order }
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'Format updates tidak valid' });
    }

    const errors = await applySortOrders('bot_menus', updates);
    if (errors.length > 0) {
      console.error("Errors reordering bot menus:", errors);
      return res.status(500).json({ success: false, message: 'Gagal memperbarui beberapa urutan' });
    }

    res.json({ success: true, message: 'Urutan berhasil disimpan' });
  } catch (error: any) {
    console.error('Error in reorderBotMenus:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal server' });
  }
};

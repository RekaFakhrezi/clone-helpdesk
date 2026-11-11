import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import fs from 'fs';
import path from 'path';

interface SortOrderUpdate {
  id: number;
  sort_order: number;
  parent_id?: number | null;
}

/**
 * Terapkan urutan (dan parent opsional) untuk tabel yang punya kolom sort_order.
 * Mengembalikan daftar update yang gagal.
 */
export async function applySortOrders(table: 'categories' | 'bot_menus', updates: SortOrderUpdate[]) {
  const results = await Promise.all(
    updates.map((u) => {
      const payload: Record<string, unknown> = { sort_order: u.sort_order };
      if (u.parent_id !== undefined) payload.parent_id = u.parent_id;
      return supabaseAdmin.from(table).update(payload).eq('id', u.id);
    })
  );

  return results.filter((r) => r.error);
}

/**
 * GET /api/admin/departments
 */
export const getDepartments = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name')
      .eq('status', true)
      .order('name');
    
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/categories
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id');
      
    if (error) throw error;
    
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/admin/categories/reorder
 */
export const reorderCategories = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ success: false, message: 'Updates array is required' });
    }

    const errors = await applySortOrders('categories', updates);
    if (errors.length > 0) {
      console.error("Errors reordering:", errors);
      return res.status(500).json({ success: false, message: 'Partial failure updating sort orders' });
    }

    res.status(200).json({ success: true, message: 'Urutan berhasil disimpan' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/admin/categories
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { data, error } = await supabaseAdmin.from('categories').insert([payload]).select();
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/admin/categories/:id
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { data, error } = await supabaseAdmin.from('categories').update(payload).eq('id', id).select();
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/admin/categories/:id
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Data berhasil dihapus' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/bot-templates
 */
export const getBotTemplates = async (req: Request, res: Response) => {
  try {
    const filePath = path.join(__dirname, '../bot_settings.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/admin/bot-templates
 */
export const updateBotTemplates = async (req: Request, res: Response) => {
  try {
    const filePath = path.join(__dirname, '../bot_settings.json');
    const payload = req.body;
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
    res.status(200).json({ success: true, message: 'Template berhasil disimpan', data: payload });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

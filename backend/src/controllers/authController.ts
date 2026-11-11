import { Request, Response } from 'express';
// 1. Import fungsi loginStaff dari file authService kamu (sesuaikan path-nya jika perlu)
import { loginStaff, updateStaffProfile } from '../services/AuthService';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * POST /api/auth/login
 * Handler untuk memproses login staf/admin Helpdesk
 */
export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validasi input dasar
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email dan password wajib diisi.'
      });
    }

    // Panggil fungsi login dari AuthService
    const authData = await loginStaff(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: authData
    });
  } catch (error: any) {
    console.error('Error pada loginHandler:', error.message);
    return res.status(401).json({
      error: error.message || 'Login gagal. Periksa email dan password Anda.'
    });
  }
};

/**
 * PUT /api/auth/profile
 * Handler untuk update profil staf (dan password)
 */
export const updateProfileHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, ext, mobile, username, password } = req.body;

    await updateStaffProfile(req.token!, req.user!.id, { name, phone, ext, mobile, username, password });

    return res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui.',
    });
  } catch (error: any) {
    console.error('Error pada updateProfileHandler:', error.message);
    return res.status(500).json({
      error: error.message || 'Gagal memperbarui profil.',
    });
  }
};

/**
 * GET /api/auth/me
 * Mendapatkan data user saat ini berdasarkan token
 */
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.authUser!;

    // Ambil profile
    const { data: profile } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return res.status(200).json({
      success: true,
      data: { user, profile }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// Mengembangkan (extend) Express Request agar bisa menyimpan data user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'operator' | 'teknisi' | 'admin' | 'pimpinan';
    dept_id: number | null;
  };
}

// ============================================================================
// 1. MIDDLEWARE AUTENTIKASI (Untuk Dashboard Staf)
// ============================================================================

/**
 * Memastikan user yang mengakses API sudah login dan memiliki token yang valid.
 * Sekaligus mengambil data 'role' dan 'dept_id' dari tabel staff_profiles.
 */
export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Ambil token dari header Authorization (Bearer Token)
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });
    }

    // Verifikasi token ke Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Token tidak valid atau sudah kedaluwarsa.' });
    }

    // Ambil detail profil (role & dept_id) dari database
    const { data: profile, error: profileError } = await supabase
      .from('staff_profiles')
      .select('role, dept_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: 'Profil staf tidak ditemukan.' });
    }

    // Sisipkan data user ke dalam request agar bisa dipakai oleh controller selanjutnya
    req.user = {
      id: user.id,
      email: user.email!,
      role: profile.role,
      dept_id: profile.dept_id,
    };

    next(); // Lanjut ke proses berikutnya
  } catch (error) {
    console.error('Error pada requireAuth:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
};

// ============================================================================
// 2. MIDDLEWARE OTORISASI RBAC (Role-Based Access Control)
// ============================================================================

/**
 * Membatasi akses rute API hanya untuk peran (role) tertentu.
 * WAJIB dipanggil setelah `requireAuth`.
 * 
 * @param allowedRoles Array berisi role yang diizinkan (contoh: ['admin', 'pimpinan'])
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User belum terautentikasi.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Akses ditolak. Peran '${req.user.role}' tidak memiliki izin untuk tindakan ini.` 
      });
    }

    next();
  };
};

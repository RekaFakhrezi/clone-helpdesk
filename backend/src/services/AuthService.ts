import { supabase } from '../config/supabase';

// 2. SERVICES: AUTHENTICATION (KHUSUS STAFF INTERNAL)

/**
 * Login untuk Staff (Web Dashboard).
 * Memvalidasi kredensial sekaligus menarik data profil (role & departemen).
 */
export const loginStaff = async (emailOrUsername: string, password: string) => {
  let loginEmail = emailOrUsername;

  // Jika input bukan format email (tidak mengandung '@'), anggap sebagai username
  if (!emailOrUsername.includes('@')) {
    const { data: userData, error: userError } = await supabase
      .from('staff_profiles')
      .select('email')
      .eq('username', emailOrUsername)
      .single();
    
    if (userError || !userData?.email) {
      console.error('Username tidak ditemukan:', userError?.message);
      throw new Error('Username tidak terdaftar.');
    }
    loginEmail = userData.email;
  }

  // A. Proses login via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
  });

  if (authError) {
    console.error('Proses verifikasi login gagal:', authError.message);
    throw authError;
  }

  // B. Ambil data tambahan (semua profil) dari staff_profiles agar bisa dipakai di frontend
  if (authData.user) {
    const { data: profileData, error: profileError } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Gagal mengambil profil staf:', profileError.message);
      // Tetap return authData agar user tidak stuck, walau profil gagal diambil
      return authData; 
    }

    // Gabungkan response auth asli dengan sisipan data profil
    return {
      ...authData,
      profile: profileData
    };
  }

  return authData;
};

/**
 * Update Profile for Staff
 */
export const updateStaffProfile = async (
  token: string,
  userId: string,
  updateData: {
    name?: string;
    phone?: string;
    ext?: string;
    mobile?: string;
    username?: string;
    password?: string;
  }
) => {
  // 1. Update password using raw Supabase Auth REST API to bypass session requirements of the JS SDK
  if (updateData.password) {
    const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: updateData.password })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Gagal update password:', err);
      throw new Error(err.msg || err.message || 'Gagal update password');
    }
  }

  // 3. Update staff_profiles table menggunakan userSupabase (terotentikasi)
  // Membutuhkan RLS Policy di Supabase agar berhasil
  const profilePayload: any = {};
  if (updateData.name !== undefined) profilePayload.name = updateData.name;
  if (updateData.phone !== undefined) profilePayload.phone = updateData.phone;
  if (updateData.ext !== undefined) profilePayload.ext = updateData.ext;
  if (updateData.mobile !== undefined) profilePayload.mobile = updateData.mobile;
  if (updateData.username !== undefined) profilePayload.username = updateData.username;

  if (Object.keys(profilePayload).length > 0) {
    const { createClient } = require('@supabase/supabase-js');
    const userSupabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { error: profileError } = await userSupabase
      .from('staff_profiles')
      .update(profilePayload)
      .eq('id', userId);

    if (profileError) {
      // Jika error karena unique constraint username
      if (profileError.code === '23505') {
         throw new Error('Username sudah digunakan oleh akun lain.');
      }
      console.error('Gagal update profile:', profileError.message);
      throw profileError;
    }
  }

  return { success: true };
};
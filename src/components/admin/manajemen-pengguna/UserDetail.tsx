'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import StatusBadge from '@/components/admin/tickets/StatusBadge';
import { useSearchParams, useRouter } from 'next/navigation';
import Toast, { useToast } from '@/components/ui/Toast';
import { fetchClient } from '@/lib/apiClient';

export default function UserDetail({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast, showToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(searchParams?.get('edit') === 'true');
  
  const [formData, setFormData] = useState({
    name: '',
    nim_nip: '',
    unit: '',
    phone: '',
    status: 'Aktif'
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const decodedId = decodeURIComponent(userId);
        
        // Check if decodedId is a valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const isUuid = uuidRegex.test(decodedId);
        
        let query = supabase.from('reporters').select('*');
        if (isUuid) {
            query = query.or(`id.eq.${decodedId},phone.eq.${decodedId}`);
        } else {
            query = query.eq('phone', decodedId);
        }
        
        const { data: userData, error } = await query.maybeSingle();
        
        if (error) throw error;

        if (userData) {
          setUser(userData);
          setFormData({
            name: userData.name || '',
            nim_nip: userData.nim_nip || '',
            unit: userData.unit || userData.reporter_type || '',
            phone: userData.phone || '',
            status: userData.status || 'Aktif'
          });
          
          let orConditions = [];
          
          // Only use unique/strong identifiers to avoid fetching unrelated tickets
          if (userData.phone && userData.phone !== '-') {
              orConditions.push(`phone.eq."${userData.phone}"`);
          }
          
          if (userData.nim_nip && userData.nim_nip !== '-' && userData.nim_nip !== '0') {
              orConditions.push(`nim_nip.eq."${userData.nim_nip}"`);
          }
          
          // Only fallback to name if both phone and nim_nip are missing or generic,
          // but avoid generic names like 'Anonim', 'Umum', dll.
          if (orConditions.length === 0 && userData.name && userData.name.length > 3 && !userData.name.toLowerCase().includes('anonim')) {
              orConditions.push(`reporter_name.eq."${userData.name}"`);
          }
          
          if (orConditions.length > 0) {
              const { data: ticketsData } = await supabase
                .from('tickets')
                .select('*, category:categories(name)')
                .or(orConditions.join(','))
                .order('created_at', { ascending: false });
                
              if (ticketsData) setTickets(ticketsData);
          }
        }
      } catch (err) {
        console.error('Error fetching user detail:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    try {
      await fetchClient(`/admin/reporters/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
            phone: formData.phone,
            name: formData.name,
            nim_nip: formData.nim_nip,
            unit: formData.unit,
            status: formData.status
        })
      });
      
      setUser({ ...user, ...formData });
      setIsEditing(false);
      showToast("Berhasil menyimpan perubahan data pelapor.");
      router.replace(`/dashboard/administrasi/users/${user.id}`);
    } catch (err: any) {
      alert("Gagal menyimpan data: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: user.name || '',
      nim_nip: user.nim_nip || '',
      unit: user.unit || user.reporter_type || '',
      phone: user.phone || '',
      status: user.status || 'Aktif'
    });
    setIsEditing(false);
    router.replace(`/dashboard/administrasi/users/${user.id}`);
  };

  if (isLoading) {
    return (
      <div className="p-8 md:p-10 animate-pulse flex flex-col gap-8 max-w-[1200px]">
        <div className="h-10 w-48 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-16 text-center">
        <h2 className="text-xl font-bold">Pelapor tidak ditemukan</h2>
        <Link href="/dashboard/administrasi/users" className="text-[#0059BB] font-bold mt-2 inline-block hover:underline">
          Kembali ke Manajemen Pengguna
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300 p-6 md:p-10 w-full max-w-[1200px]">
      
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500 mb-1 font-iBMPlexSans">
          <Link href="/dashboard/administrasi/users" className="hover:text-gray-900 transition-colors">
            Manajemen Pengguna
          </Link>
          <span>/</span>
          <span className="text-gray-900">Detail Pelapor</span>
        </div>
        <div className="flex justify-between items-center w-full">
            <h1 className="text-[#001E40] font-iBMPlexSans text-[32px] font-semibold leading-10 tracking-[-0.02em]">
            Profil Pelapor
            </h1>
            {!isEditing && (
                <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-[#C3C6D1] rounded bg-white hover:bg-gray-50 text-sm text-[#43474F] font-iBMPlexSans font-medium transition-colors cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    Edit Data
                </button>
            )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#C3C6D1] p-8 shadow-sm flex flex-col relative w-full">
        
        {isEditing ? (
            <form onSubmit={handleSave} className="flex flex-col gap-6 w-full">
                <div className="flex flex-col md:flex-row gap-8 w-full">
                    {/* Avatar placeholder during edit */}
                    <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-4xl font-bold shrink-0 self-start mt-2">
                        {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex flex-col gap-4 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#43474F] font-iBMPlexSans tracking-wide">NAMA LENGKAP</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="px-4 py-2.5 text-sm border border-[#C3C6D1] rounded-md focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-shadow text-[#1A1C1E] font-iBMPlexSans"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#43474F] font-iBMPlexSans tracking-wide">NIM / NIP</label>
                                <input 
                                    type="text" 
                                    value={formData.nim_nip}
                                    onChange={e => setFormData({...formData, nim_nip: e.target.value})}
                                    className="px-4 py-2.5 text-sm border border-[#C3C6D1] rounded-md focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-shadow text-[#1A1C1E] font-iBMPlexSans"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#43474F] font-iBMPlexSans tracking-wide">NO. WHATSAPP</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    className="px-4 py-2.5 text-sm border border-[#C3C6D1] rounded-md focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-shadow text-[#1A1C1E] font-iBMPlexSans"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#43474F] font-iBMPlexSans tracking-wide">FAKULTAS / UNIT KERJA</label>
                                <input 
                                    type="text" 
                                    value={formData.unit}
                                    onChange={e => setFormData({...formData, unit: e.target.value})}
                                    className="px-4 py-2.5 text-sm border border-[#C3C6D1] rounded-md focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-shadow text-[#1A1C1E] font-iBMPlexSans"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#43474F] font-iBMPlexSans tracking-wide">STATUS AKUN</label>
                                <select 
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value})}
                                    className="px-4 py-2.5 text-sm border border-[#C3C6D1] rounded-md focus:outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-shadow bg-white text-[#1A1C1E] font-iBMPlexSans cursor-pointer"
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Tidak Aktif">Tidak Aktif</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                    <button 
                        type="button"
                        onClick={cancelEdit}
                        disabled={isSaving}
                        className="px-5 py-2 text-sm font-semibold text-[#43474F] border border-[#C3C6D1] bg-white hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 font-iBMPlexSans cursor-pointer"
                    >
                        Batal
                    </button>
                    <button 
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2 text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-blue-900 rounded-md transition-colors disabled:opacity-70 flex items-center gap-2 font-iBMPlexSans shadow-sm cursor-pointer"
                    >
                        {isSaving ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Menyimpan...</>
                        ) : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        ) : (
            <div className="flex flex-col md:flex-row gap-8 w-full">
                <div className="w-24 h-24 rounded-full bg-[#E5EDFF] text-[#1E3A8A] flex items-center justify-center text-[40px] font-bold shrink-0">
                    {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex flex-col justify-center flex-1 w-full gap-5">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-[#1A1C1E] font-iBMPlexSans">{user.name}</h2>
                        <p className="text-[#43474F] font-medium text-sm font-iBMPlexSans">{user.nim_nip ? `${user.nim_nip} • ` : ''}{user.unit || user.reporter_type}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-4 w-full pt-4 border-t border-gray-100">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider font-iBMPlexSans">No. WhatsApp</span>
                            <span className="text-[15px] font-semibold text-[#1A1C1E] font-iBMPlexSans">{user.phone || '-'}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider font-iBMPlexSans">Status Akun</span>
                            <span className="text-[15px] font-semibold text-[#1A1C1E] font-iBMPlexSans">{user.status}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider font-iBMPlexSans">Total Tiket Dibuat</span>
                            <span className="text-[15px] font-semibold text-[#1A1C1E] font-iBMPlexSans">{tickets.length} Tiket</span>
                        </div>
                        <div className="flex flex-col gap-1.5 sm:col-span-3">
                            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider font-iBMPlexSans">Bergabung Sejak</span>
                            <span className="text-[15px] font-semibold text-[#1A1C1E] font-iBMPlexSans">{new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#C3C6D1] shadow-sm flex flex-col overflow-hidden w-full">
        <div className="px-6 py-5 border-b border-[#C3C6D1]">
          <h3 className="text-lg font-bold text-[#1A1C1E] font-iBMPlexSans">Riwayat Tiket Pelapor</h3>
        </div>
        
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-[#43474F] font-medium font-iBMPlexSans">Belum ada tiket yang dibuat.</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left">
              <thead className="bg-[#F3F3F6] border-b border-[#C3C6D1]">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-[#43474F] tracking-[0.05em] font-iBMPlexSans select-none">NO. TIKET</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#43474F] tracking-[0.05em] font-iBMPlexSans select-none">SUBJECT</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#43474F] tracking-[0.05em] font-iBMPlexSans select-none">KATEGORI</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#43474F] tracking-[0.05em] font-iBMPlexSans select-none">TANGGAL</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#43474F] tracking-[0.05em] font-iBMPlexSans select-none">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/administrasi/tickets/${t.id}`} className="text-sm font-bold text-[#1E3A8A] hover:underline font-iBMPlexSans">
                        {t.ticket_num || t.ticket_number || '–'}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/administrasi/tickets/${t.id}`} className="text-sm font-medium text-[#1A1C1E] truncate max-w-[200px] block hover:text-[#1E3A8A] hover:underline font-iBMPlexSans">
                        {t.subject}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#43474F] font-iBMPlexSans">{t.category?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-[#43474F] font-iBMPlexSans">{new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <Toast toast={toast} />
    </div>
  );
}

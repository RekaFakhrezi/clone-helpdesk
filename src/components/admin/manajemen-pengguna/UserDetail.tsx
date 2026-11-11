'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import StatusBadge from '@/components/admin/tickets/StatusBadge';
import { useSearchParams, useRouter } from 'next/navigation';
import Toast, { useToast } from '@/components/ui/Toast';
import { fetchClient } from '@/lib/apiClient';

const FIELD_LABEL = 'text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]';
const FIELD_VALUE = 'text-[13px] text-[var(--fg)]';
const INPUT_CLASS = 'h-9 w-full rounded-[4px] border border-[var(--rule-strong)] bg-transparent px-3 text-[12px] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]';

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
      <div className="flex flex-col gap-6 w-full max-w-[1200px] animate-pulse">
        <div className="h-8 w-48 rounded-[4px] bg-[var(--canvas)]"></div>
        <div className="h-64 rounded-[4px] border border-[var(--rule)] bg-[var(--canvas)]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <h2 className="text-[15px] font-medium text-[var(--fg)]">Pelapor tidak ditemukan</h2>
        <Link href="/dashboard/administrasi/users" className="text-[12.5px] font-medium text-[var(--accent)] hover:underline">
          Kembali ke Manajemen Pengguna
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full max-w-[1200px]">
      
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/administrasi/users" className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] transition-colors hover:text-[var(--fg-dim)]">
            Manajemen Pengguna
          </Link>
          <span className="text-[10px] text-[var(--fg-faint)]">/</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">Detail Pelapor</span>
        </div>
        <div className="flex justify-between items-center w-full">
            <h1 className="text-[22px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg)]">
            Profil Pelapor
            </h1>
            {!isEditing && (
                <button 
                    onClick={() => setIsEditing(true)}
                    className="flex h-9 items-center gap-1.5 px-3 rounded-[4px] border border-[var(--rule-strong)] text-[12px] font-medium text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)] cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    Edit Data
                </button>
            )}
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-[4px] border border-[var(--rule)] p-6 flex flex-col relative w-full">
        
        {isEditing ? (
            <form onSubmit={handleSave} className="flex flex-col gap-6 w-full">
                <div className="flex flex-col md:flex-row gap-6 w-full">
                    {/* Avatar placeholder during edit */}
                    <div className="w-12 h-12 rounded-[4px] border border-[var(--rule)] bg-[var(--canvas)] text-[var(--fg-dim)] flex items-center justify-center text-[15px] font-medium shrink-0 self-start">
                        {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex flex-col gap-4 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className={FIELD_LABEL}>NAMA LENGKAP</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className={INPUT_CLASS}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={FIELD_LABEL}>NIM / NIP</label>
                                <input 
                                    type="text" 
                                    value={formData.nim_nip}
                                    onChange={e => setFormData({...formData, nim_nip: e.target.value})}
                                    className={INPUT_CLASS}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className={FIELD_LABEL}>NO. WHATSAPP</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    className={INPUT_CLASS}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={FIELD_LABEL}>FAKULTAS / UNIT KERJA</label>
                                <input 
                                    type="text" 
                                    value={formData.unit}
                                    onChange={e => setFormData({...formData, unit: e.target.value})}
                                    className={INPUT_CLASS}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className={FIELD_LABEL}>STATUS AKUN</label>
                                <select 
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value})}
                                    className={`${INPUT_CLASS} cursor-pointer`}
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Tidak Aktif">Tidak Aktif</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[var(--rule)]">
                    <button 
                        type="button"
                        onClick={cancelEdit}
                        disabled={isSaving}
                        className="h-9 px-3 rounded-[4px] border border-[var(--rule-strong)] text-[12px] font-medium text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)] disabled:opacity-50 cursor-pointer"
                    >
                        Batal
                    </button>
                    <button 
                        type="submit"
                        disabled={isSaving}
                        className="h-9 px-3 flex items-center gap-2 rounded-[4px] bg-[var(--accent)] text-[12px] font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50 cursor-pointer"
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        ) : (
            <div className="flex flex-col md:flex-row gap-6 w-full">
                <div className="w-12 h-12 rounded-[4px] border border-[var(--rule)] bg-[var(--canvas)] text-[var(--fg-dim)] flex items-center justify-center text-[15px] font-medium shrink-0">
                    {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex flex-col flex-1 w-full gap-5">
                    <div className="flex flex-col gap-1 pb-5 border-b border-[var(--rule)]">
                        <h2 className="text-[17px] font-medium tracking-[-0.01em] text-[var(--fg)]">{user.name}</h2>
                        <p className="text-[12px] text-[var(--fg-dim)]">{user.nim_nip ? `${user.nim_nip} • ` : ''}{user.unit || user.reporter_type}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-5 gap-x-4 w-full">
                        <div className="flex flex-col gap-1">
                            <span className={FIELD_LABEL}>No. WhatsApp</span>
                            <span className={`${FIELD_VALUE} tabular-nums`}>{user.phone || '-'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className={FIELD_LABEL}>Status Akun</span>
                            <span className={FIELD_VALUE}>{user.status}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className={FIELD_LABEL}>Total Tiket Dibuat</span>
                            <span className={`${FIELD_VALUE} tabular-nums`}>{tickets.length} Tiket</span>
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-3">
                            <span className={FIELD_LABEL}>Bergabung Sejak</span>
                            <span className={`${FIELD_VALUE} tabular-nums`}>{new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="bg-[var(--surface)] rounded-[4px] border border-[var(--rule)] flex flex-col overflow-hidden w-full">
        <div className="px-4 py-3 border-b border-[var(--rule)]">
          <h3 className="text-[13px] font-medium text-[var(--fg)]">Riwayat Tiket Pelapor</h3>
        </div>
        
        {tickets.length === 0 ? (
          <div className="py-10 text-center text-[12.5px] text-[var(--fg-dim)]">Belum ada tiket yang dibuat.</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left">
              <thead className="border-b border-[var(--rule)]">
                <tr>
                  <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] select-none">NO. TIKET</th>
                  <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] select-none">SUBJECT</th>
                  <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] select-none">KATEGORI</th>
                  <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] select-none">TANGGAL</th>
                  <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] select-none">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} className="border-b border-[var(--rule)] transition-colors hover:bg-[var(--canvas)]">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/administrasi/tickets/${t.id}`} className="text-[12px] font-medium tabular-nums text-[var(--accent)] hover:underline">
                        {t.ticket_num || t.ticket_number || '–'}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/administrasi/tickets/${t.id}`} className="text-[12.5px] font-medium text-[var(--fg)] truncate max-w-[200px] block hover:text-[var(--accent)]">
                        {t.subject}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[var(--fg-dim)]">{t.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-[12px] text-[var(--fg-dim)] tabular-nums">{new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-3">
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

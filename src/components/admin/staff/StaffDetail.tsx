'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import StatusBadge from '@/components/admin/tickets/StatusBadge';
import { useSearchParams, useRouter } from 'next/navigation';

const FIELD_LABEL = 'text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]';
const FIELD_VALUE = 'text-[13px] text-[var(--fg)]';
const INPUT_CLASS = 'h-9 w-full rounded-[4px] border border-[var(--rule-strong)] bg-transparent px-3 text-[12px] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]';
const TH_CLASS = 'px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] select-none';

export default function StaffDetail({ staffId }: { staffId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [staff, setStaff] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isEditing, setIsEditing] = useState(searchParams?.get('edit') === 'true');
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teknisi',
    dept_id: ''
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const decodedId = decodeURIComponent(staffId);
        
        // Fetch departments for dropdown
        const { data: deptData } = await supabase.from('departments').select('*').order('name');
        if (deptData) setDepartments(deptData);

        const { data: staffData, error } = await supabase
          .from('staff_profiles')
          .select('*, dept:departments(name)')
          .eq('id', decodedId)
          .maybeSingle();

        if (error) {
           console.error("Error fetching staff:", error);
           setStaff({ error: error.message });
           return;
        }

        if (staffData) {
          setStaff(staffData);
          setFormData({
            name: staffData.name || '',
            email: staffData.email || '',
            phone: staffData.phone || '',
            role: staffData.role || 'teknisi',
            dept_id: staffData.dept_id ? String(staffData.dept_id) : ''
          });
          
          const { data: ticketsData } = await supabase
            .from('tickets')
            .select('*, category:categories(name)')
            .eq('tech_id', decodedId)
            .order('created_at', { ascending: false });
            
          if (ticketsData) setTickets(ticketsData);
        }
      } catch (err) {
        console.error('Error fetching staff detail:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [staffId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff || staff.error) return;
    
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        dept_id: formData.dept_id ? parseInt(formData.dept_id) : null
      };

      const { fetchClient } = await import('@/lib/apiClient');
      await fetchClient(`/admin/staff/${staff.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      
      // Update local state smoothly
      const selectedDept = departments.find(d => d.id === payload.dept_id);
      setStaff({ 
        ...staff, 
        ...payload,
        dept: selectedDept ? { name: selectedDept.name } : null
      });
      
      setIsEditing(false);
      router.replace(`/dashboard/administrasi/staff/${staff.id}`);
    } catch (err: any) {
      alert("Gagal menyimpan data: " + (err.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: staff.name || '',
      email: staff.email || '',
      phone: staff.phone || '',
      role: staff.role || 'teknisi',
      dept_id: staff.dept_id ? String(staff.dept_id) : ''
    });
    setIsEditing(false);
    router.replace(`/dashboard/administrasi/staff/${staff.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-[1200px] animate-pulse">
        <div className="h-8 w-48 rounded-[4px] bg-[var(--canvas)]"></div>
        <div className="h-64 rounded-[4px] border border-[var(--rule)] bg-[var(--canvas)]"></div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <h2 className="text-[15px] font-medium text-[var(--fg)]">Staf tidak ditemukan</h2>
        <Link href="/dashboard/administrasi/staff" className="text-[12.5px] font-medium text-[var(--accent)] hover:underline">
          Kembali ke Manajemen Staf
        </Link>
      </div>
    );
  }

  if (staff.error) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <h2 className="text-[15px] font-medium text-[var(--danger)]">Error: {staff.error}</h2>
        <Link href="/dashboard/administrasi/staff" className="text-[12.5px] font-medium text-[var(--accent)] hover:underline">
          Kembali ke Manajemen Staf
        </Link>
      </div>
    );
  }

  // Hitung performa
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED' || t.status === 'WAITING CONFIRMATION');
  const activeTickets = tickets.filter(t => !(t.status === 'RESOLVED' || t.status === 'CLOSED' || t.status === 'WAITING CONFIRMATION'));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full max-w-[1200px]">
      
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/administrasi/staff" className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] transition-colors hover:text-[var(--fg-dim)]">
            Manajemen Staf
          </Link>
          <span className="text-[10px] text-[var(--fg-faint)]">/</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">Detail Staf</span>
        </div>
        <div className="flex justify-between items-center w-full">
            <h1 className="text-[22px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg)]">
            Profil Staf
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
                        {formData.name?.charAt(0)?.toUpperCase() || 'S'}
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
                                <label className={FIELD_LABEL}>EMAIL</label>
                                <input 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
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
                                <label className={FIELD_LABEL}>PERAN (ROLE)</label>
                                <select 
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                    className={`${INPUT_CLASS} cursor-pointer`}
                                >
                                    <option value="admin">Administrator</option>
                                    <option value="operator">Operator (Agent)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className={FIELD_LABEL}>DEPARTEMEN / LAYANAN</label>
                                <select 
                                    value={formData.dept_id}
                                    onChange={e => setFormData({...formData, dept_id: e.target.value})}
                                    className={`${INPUT_CLASS} cursor-pointer`}
                                >
                                    <option value="">Pilih Departemen...</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
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
                    {staff.name?.charAt(0)?.toUpperCase()}
                </div>
                
                <div className="flex flex-col flex-1 w-full gap-5 pr-4 md:border-r border-[var(--rule)]">
                    <div className="flex flex-col gap-1 pb-5 border-b border-[var(--rule)]">
                        <h2 className="text-[17px] font-medium tracking-[-0.01em] text-[var(--fg)]">{staff.name}</h2>
                        <p className="text-[12px] text-[var(--fg-dim)]">{staff.email} • {staff.dept?.name || '-'}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4 w-full">
                        <div className="flex flex-col gap-1">
                            <span className={FIELD_LABEL}>No. WhatsApp</span>
                            <span className={`${FIELD_VALUE} tabular-nums`}>{staff.phone || '-'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className={FIELD_LABEL}>Peran (Role)</span>
                            <span className={`${FIELD_VALUE} uppercase`}>{staff.role}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className={FIELD_LABEL}>Bergabung Sejak</span>
                            <span className={`${FIELD_VALUE} tabular-nums`}>{new Date(staff.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                {/* Metric Performa */}
                <div className="flex flex-col justify-center gap-1 shrink-0 min-w-[160px]">
                  <span className={FIELD_LABEL}>Tiket Selesai</span>
                  <span className="text-[30px] leading-none font-medium tabular-nums text-[var(--fg)]">{resolvedTickets.length}</span>
                </div>
            </div>
        )}
      </div>

      <div className="bg-[var(--surface)] rounded-[4px] border border-[var(--rule)] flex flex-col overflow-hidden w-full">
        <div className="flex items-center border-b border-[var(--rule)] px-4">
          <button 
            onClick={() => setActiveTab('active')}
            className={`cursor-pointer whitespace-nowrap px-3 py-2.5 -mb-px border-b text-[12.5px] transition-colors ${activeTab === 'active' ? 'border-[var(--accent)] text-[var(--fg)] font-medium' : 'border-transparent text-[var(--fg-dim)] hover:text-[var(--fg)]'}`}
          >
            Tiket Sedang Ditangani ({activeTickets.length})
          </button>
          <button 
            onClick={() => setActiveTab('resolved')}
            className={`cursor-pointer whitespace-nowrap px-3 py-2.5 -mb-px border-b text-[12.5px] transition-colors ${activeTab === 'resolved' ? 'border-[var(--accent)] text-[var(--fg)] font-medium' : 'border-transparent text-[var(--fg-dim)] hover:text-[var(--fg)]'}`}
          >
            Tiket Diselesaikan ({resolvedTickets.length})
          </button>
        </div>
        
        {activeTab === 'active' && (
          activeTickets.length === 0 ? (
            <div className="py-10 text-center text-[12.5px] text-[var(--fg-dim)]">Tidak ada tiket yang sedang ditangani.</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left">
                <thead className="border-b border-[var(--rule)]">
                  <tr>
                    <th className={TH_CLASS}>NO. TIKET</th>
                    <th className={TH_CLASS}>SUBJECT</th>
                    <th className={TH_CLASS}>KATEGORI</th>
                    <th className={TH_CLASS}>TANGGAL</th>
                    <th className={TH_CLASS}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTickets.map(t => (
                    <tr key={t.id} className="border-b border-[var(--rule)] transition-colors hover:bg-[var(--canvas)]">
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/administrasi/tickets/${t.id}`} className="text-[12px] font-medium tabular-nums text-[var(--accent)] hover:underline">
                          {t.ticket_num || t.ticket_number || '–'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[12.5px] font-medium text-[var(--fg)] truncate max-w-[200px]">{t.subject}</td>
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
          )
        )}

        {activeTab === 'resolved' && (
          resolvedTickets.length === 0 ? (
            <div className="py-10 text-center text-[12.5px] text-[var(--fg-dim)]">Belum ada tiket yang diselesaikan.</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left">
                <thead className="border-b border-[var(--rule)]">
                  <tr>
                    <th className={TH_CLASS}>NO. TIKET</th>
                    <th className={TH_CLASS}>SUBJECT</th>
                    <th className={TH_CLASS}>KATEGORI</th>
                    <th className={TH_CLASS}>TANGGAL</th>
                    <th className={TH_CLASS}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedTickets.map(t => (
                    <tr key={t.id} className="border-b border-[var(--rule)] transition-colors hover:bg-[var(--canvas)]">
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/administrasi/tickets/${t.id}`} className="text-[12px] font-medium tabular-nums text-[var(--accent)] hover:underline">
                          {t.ticket_num || t.ticket_number || '–'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[12.5px] font-medium text-[var(--fg)] truncate max-w-[200px]">{t.subject}</td>
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
          )
        )}
      </div>
    </div>
  );
}

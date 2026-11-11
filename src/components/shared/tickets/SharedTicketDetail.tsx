'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchClient } from '@/lib/apiClient';
import StatusBadge from '@/components/admin/tickets/StatusBadge';
import PriorityBadge from '@/components/admin/tickets/PriorityBadge';
import type { TicketStatus, TicketPriority } from '@/lib/mock/tickets';
import { FaWhatsapp } from 'react-icons/fa';
import Modal, { ModalCancelButton, ModalPrimaryButton } from '@/components/ui/Modal';
import Toast, { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/context/LanguageContext';

type Ticket = {
  id: string;
  ticket_num?: string;
  ticket_number?: string;
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  category_id?: number;
  category?: { name?: string };
  dept?: { name?: string };
  tech?: { name?: string };
  reporter_name?: string;
  phone?: string;
  reporter_type?: string;
  unit?: string;
  created_at?: string;
  updated_at?: string;
  tech_id?: string;
  dept_id?: number | string;
  attachment?: string | null;
  attachments?: { file_url: string; file_name?: string }[];
};

type Message = {
  id: string;
  sender_type?: string;
  sender_name?: string;
  message?: string;
  created_at?: string;
  tech?: { name?: string };
};

/** Baris select standar di panel Informasi Tiket. */
function RowSelect({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string | number;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`h-9 w-full min-w-0 rounded-[4px] border border-[var(--rule-strong)] bg-transparent px-2.5 text-[12.5px] text-[var(--fg)] outline-none transition-colors duration-150 focus:border-[var(--accent)] ${disabled ? 'cursor-not-allowed text-[var(--fg-dim)]' : 'cursor-pointer hover:border-[var(--fg-faint)]'}`}
    >
      {children}
    </select>
  );
}

const STATUS_BADGE_MAP: Record<string, TicketStatus> = {
  'WAITING VERIFICATION': 'Waiting',
  'WAITING CONFIRMATION': 'Waiting',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  'IN PROGRESS': 'In Progress',
  OPEN: 'New',
  NEW: 'New',
};

const PRIORITY_BADGE_MAP: Record<string, TicketPriority> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

const LABEL_MICRO = 'text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]';
const PANEL = 'flex flex-col rounded-[4px] border border-[var(--rule)] bg-[var(--surface)]';
const PANEL_HEAD = 'flex items-center gap-1.5 border-b border-[var(--rule)] px-5 py-3';
const PANEL_TITLE = 'text-[13px] font-medium text-[var(--fg)]';
const FIELD_ROW = 'flex flex-col gap-1.5 border-b border-[var(--rule)] px-5 py-3';
const BTN_SECONDARY =
  'inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-[var(--rule-strong)] px-3 text-[12px] font-medium transition-colors duration-150 hover:bg-[var(--canvas)] disabled:opacity-50';
const BTN_PRIMARY =
  'inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-[var(--accent)] px-3 text-[12px] font-medium text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] disabled:opacity-50';

export default function SharedTicketDetail({ ticketId }: { ticketId: string }) {
  const { t } = useLanguage();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  
  const isTeknisi = typeof window !== 'undefined' && window.location.pathname.includes('/teknisi');
  const isOperator = typeof window !== 'undefined' && window.location.pathname.includes('/operator');
  const ticketApiUrl = isOperator ? `/operator/tickets/${ticketId}` : `/admin/tickets/${ticketId}`;
  
  // Disposisi state
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { toast, showToast } = useToast(5000);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    async function loadTicket() {
      setIsLoading(true);

      try {
        let foundTicket = null;
        if (isOperator) {
          const detailResponse = await fetchClient(`/operator/tickets/${ticketId}`);
          foundTicket = detailResponse.data?.ticket || detailResponse.data;
        } else {
          const listResponse = await fetchClient('/admin/tickets');
          const tickets: Ticket[] = Array.isArray(listResponse.data) ? listResponse.data : [];
          foundTicket = tickets.find(
            (item) => String(item.id) === String(ticketId) || item.ticket_num === ticketId || item.ticket_number === ticketId
          );
        }

        if (!foundTicket) {
          console.warn('Ticket not found in list, unable to resolve by ID or ticket number.');
        }

        if (foundTicket) {
          setTicket(foundTicket);
          if (foundTicket.dept_id) setSelectedDeptId(String(foundTicket.dept_id));
          if (foundTicket.tech_id) setSelectedTechId(String(foundTicket.tech_id));
        }

        // Fetch categories to build full path
        const catsResponse = await fetchClient('/admin/categories').catch(() => ({ data: [] }));
        if (Array.isArray(catsResponse.data)) {
          setCategories(catsResponse.data);
        }

        // Fetch technicians and departments for disposisi
        import('@/lib/supabase').then(({ supabase }) => {
          supabase.from('staff_profiles').select('id, name, role, dept_id').in('role', ['teknisi', 'agent', 'operator']).order('name').then(({ data }) => {
            if (data) setTechnicians(data);
          });
          supabase.from('departments').select('id, name').order('name').then(({ data }) => {
            if (data) setDepartments(data);
          });
        });
      } catch (error) {
        console.error('Error loading ticket detail:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTicket();
  }, [ticketId]);

  const handleVerify = () => {
    setConfirmModal({
      isOpen: true,
      title: t('ticket_detail.confirm_verify_title', 'Konfirmasi Verifikasi'),
      message: t('ticket_detail.confirm_verify_msg', 'Apakah Anda yakin ingin memverifikasi tiket ini dan mengubah statusnya menjadi Terbuka (Open)?'),
      onConfirm: async () => {
        setIsUpdatingStatus(true);
        try {
          await fetchClient(ticketApiUrl, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'Open' })
          });
          setTicket((prev) => prev ? { ...prev, status: 'Open' } : null);
          showToast(t('ticket_detail.toast_verified', 'Tiket berhasil diverifikasi!'), 'success');
        } catch (error) {
          console.error('Gagal verifikasi tiket:', error);
          showToast(t('ticket_detail.toast_update_fail', 'Gagal memverifikasi tiket.'), 'error');
        } finally {
          setIsUpdatingStatus(false);
        }
      }
    });
  };

  const handleReject = () => {
    setConfirmModal({
      isOpen: true,
      title: t('ticket_detail.confirm_reject_title', 'Konfirmasi Tolak Tiket'),
      message: t('ticket_detail.confirm_reject_msg', 'Apakah Anda yakin ingin menolak tiket ini? Status tiket akan diubah menjadi Ditolak.'),
      onConfirm: async () => {
        setIsUpdatingStatus(true);
        try {
          await fetchClient(ticketApiUrl, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'REJECTED' })
          });
          setTicket((prev) => prev ? { ...prev, status: 'REJECTED' } : null);
          showToast(t('ticket_detail.toast_rejected', 'Tiket berhasil ditolak.'), 'success');
        } catch (error) {
          console.error('Gagal menolak tiket:', error);
          showToast(t('ticket_detail.toast_update_fail', 'Gagal menolak tiket.'), 'error');
        } finally {
          setIsUpdatingStatus(false);
        }
      }
    });
  };

  const handleDisposisi = async () => {
    if (!selectedDeptId) return;
    
    setIsAssigning(true);
    try {
      await fetchClient(ticketApiUrl, {
        method: 'PATCH',
        body: JSON.stringify({ 
          tech_id: selectedTechId || null, 
          dept_id: selectedDeptId,
          status: 'Open'
        })
      });

      showToast(t('ticket_detail.toast_disposisi_ok', 'Tiket berhasil di-disposisi!'), 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      showToast(t('ticket_detail.toast_disposisi_fail', 'Gagal melakukan disposisi.'), 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateStatus = (newStatus: string) => {
    const isResolving = newStatus === 'WAITING CONFIRMATION' || newStatus === 'RESOLVED';

    setConfirmModal({
      isOpen: true,
      title: t('ticket_detail.confirm_status', 'Konfirmasi Status'),
      message: isResolving
        ? t('ticket_detail.confirm_msg_resolve', 'Apakah Anda yakin ingin menyelesaikan tiket ini?')
        : t('ticket_detail.confirm_msg_reopen', 'Apakah Anda yakin ingin membuka kembali tiket ini?'),
      onConfirm: async () => {
        setIsUpdatingStatus(true);
        try {
          await fetchClient(ticketApiUrl, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
          });

          setTicket((prev) => prev ? { ...prev, status: newStatus } : null);
          showToast(isResolving ? t('ticket_detail.toast_resolved', 'Tiket berhasil diselesaikan!') : t('ticket_detail.toast_reopened', 'Tiket berhasil dibuka kembali!'), 'success');
        } catch (error) {
          console.error('Gagal update status:', error);
          showToast(t('ticket_detail.toast_update_fail', 'Gagal mengubah status tiket.'), 'error');
        } finally {
          setIsUpdatingStatus(false);
        }
      }
    });
  };

  const handleUpdateField = (field: string, value: string | number | null) => {
    setConfirmModal({
      isOpen: true,
      title: t('ticket_detail.confirm_change', 'Konfirmasi Perubahan'),
      message: t('ticket_detail.confirm_msg_change', 'Apakah Anda yakin ingin mengubah data ini?'),
      onConfirm: async () => {
        try {
          await fetchClient(ticketApiUrl, {
            method: 'PATCH',
            body: JSON.stringify({ [field]: value })
          });
          setTicket((prev) => {
            if (!prev) return null;
            const updated = { ...prev, [field]: value };
            if (field === 'dept_id') {
              updated.dept = departments.find(d => String(d.id) === String(value));
            }
            if (field === 'tech_id') {
              updated.tech = technicians.find(t => String(t.id) === String(value));
            }
            return updated;
          });
          showToast(`Berhasil memperbarui data!`, 'success');
        } catch (error) {
          console.error(`Gagal update ${field}:`, error);
          showToast(`Gagal memperbarui data.`, 'error');
        }
      }
    });
  };

  const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleString('id-ID') : '-';

  const statusUpper = (ticket?.status || '').toUpperCase();
  const isWaitingVerification = statusUpper === 'WAITING VERIFICATION';
  const displayStatus = ticket?.status ? ticket.status.toUpperCase() : 'WAITING VERIFICATION';
  const ticketNumber = ticket?.ticket_number || ticket?.ticket_num || '–';
  const requester = ticket?.reporter_name || '-';
  const statusBadgeValue = STATUS_BADGE_MAP[statusUpper];
  const priorityBadgeValue = PRIORITY_BADGE_MAP[(ticket?.priority || '').toUpperCase()];

  // Build full category path
  let categoryPath = ticket?.category?.name || '-';
  if (ticket?.category_id && categories.length > 0) {
    let currentCat = categories.find(c => c.id === ticket.category_id);
    if (currentCat) {
      const pathArr = [currentCat.name];
      while (currentCat?.parent_id) {
        currentCat = categories.find(c => c.id === currentCat.parent_id);
        if (currentCat) pathArr.unshift(currentCat.name);
      }
      categoryPath = pathArr.join(' / ');
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] animate-pulse flex-col gap-5">
        <div className="h-8 w-2/3 rounded-[4px] bg-[var(--canvas)]"></div>
        <div className="h-60 rounded-[4px] border border-[var(--rule)] bg-[var(--canvas)]"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-2 py-16 text-center">
        <h2 className="text-[15px] font-medium text-[var(--fg)]">{t('ticket_detail.not_found', 'Tiket tidak ditemukan')}</h2>
        <Link href="/dashboard" className="text-[12.5px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]">
          {t('ticket_detail.back_to_dashboard', 'Kembali ke Dashboard')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 border-b border-[var(--rule)] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
            <button onClick={() => window.history.back()} className="transition-colors duration-150 hover:text-[var(--fg)]">
              {t('ticket_detail.back', 'Kembali')}
            </button>
            <span>/</span>
            <span>{t('ticket_detail.detail', 'Detail Tiket')}</span>
          </div>
          <span className="text-[11.5px] font-medium tabular-nums text-[var(--accent)]">#{ticketNumber}</span>
          <h1 className="text-[20px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg)]">{ticket.subject}</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {statusBadgeValue ? (
            <StatusBadge status={statusBadgeValue} />
          ) : (
            <span className="inline-flex items-center rounded-[3px] border border-[var(--rule-strong)] bg-[var(--canvas)] px-1.5 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.02em] text-[var(--danger)]">
              {displayStatus}
            </span>
          )}
          {priorityBadgeValue ? <PriorityBadge priority={priorityBadgeValue} /> : null}
          
          <span className="mx-1 h-5 w-px bg-[var(--rule)]" aria-hidden="true"></span>
          
          {isWaitingVerification ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReject}
                disabled={isUpdatingStatus}
                className={`${BTN_SECONDARY} text-[var(--danger)]`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12"></path></svg>
                {t('ticket_detail.reject', 'TOLAK TIKET')}
              </button>
              <button
                onClick={handleVerify}
                disabled={isUpdatingStatus}
                className={BTN_PRIMARY}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7"></path></svg>
                {isUpdatingStatus ? t('ticket_detail.processing', 'MEMPROSES...') : t('ticket_detail.verify', 'TERIMA & VERIFIKASI')}
              </button>
            </div>
          ) : (statusUpper === 'RESOLVED' || statusUpper === 'CLOSED' || statusUpper === 'WAITING CONFIRMATION' || statusUpper === 'REJECTED' || statusUpper === 'DITOLAK') ? (
            <button
              onClick={() => handleUpdateStatus(ticket.tech_id || ticket.tech?.name ? 'IN PROGRESS' : 'Open')}
              disabled={isUpdatingStatus}
              className={`${BTN_SECONDARY} text-[var(--fg-dim)] hover:text-[var(--fg)]`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              {isUpdatingStatus ? t('ticket_detail.processing', 'MEMPROSES...') : t('ticket_detail.reopen', 'BUKA KEMBALI')}
            </button>
          ) : (
            <button
              onClick={() => handleUpdateStatus('RESOLVED')}
              disabled={isUpdatingStatus}
              className={BTN_PRIMARY}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7"></path></svg>
              {isUpdatingStatus ? t('ticket_detail.processing', 'MEMPROSES...') : t('ticket_detail.resolve', 'SELESAIKAN TIKET')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          
          {/* INFORMASI TIKET */}
          <section className={PANEL}>
            <div className={PANEL_HEAD}>
              <h2 className={PANEL_TITLE}>{t('ticket_detail.info_title', 'Informasi Tiket')}</h2>
            </div>
            
            <div className="flex flex-col">
              <div className={FIELD_ROW}>
                <span className={LABEL_MICRO}>{t('ticket_detail.status_label', 'Status')}</span>
                <span className="text-[12.5px] font-medium text-[var(--fg)]">{displayStatus}</span>
              </div>
              <div className={FIELD_ROW}>
                <span className={LABEL_MICRO}>{t('ticket_detail.dept_label', 'Departemen')}</span>
                <RowSelect
                  value={ticket.dept_id || ''}
                  onChange={(v) => handleUpdateField('dept_id', v ? Number(v) : null)}
                  disabled={isTeknisi}
                >
                  <option value="">{t('ticket_detail.select_dept', '-- Pilih Departemen --')}</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </RowSelect>
              </div>
              <div className={FIELD_ROW}>
                <span className={LABEL_MICRO}>{t('ticket_detail.assigned_label', 'Ditugaskan ke')}</span>
                <RowSelect
                  value={ticket.tech_id || ''}
                  onChange={(v) => handleUpdateField('tech_id', v || null)}
                  disabled={isTeknisi}
                >
                  <option value="">{t('ticket_detail.not_assigned', '-- Belum Ditugaskan --')}</option>
                  {technicians.map((tech: any) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} {tech.dept?.name ? `(${tech.dept.name})` : (tech.role ? `(${tech.role})` : '')}
                    </option>
                  ))}
                </RowSelect>
              </div>
              <div className={FIELD_ROW}>
                <span className={LABEL_MICRO}>{t('ticket_detail.priority_label', 'Prioritas')}</span>
                <RowSelect
                  value={ticket.priority || ''}
                  onChange={(v) => handleUpdateField('priority', v)}
                  disabled={isTeknisi}
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </RowSelect>
              </div>
              <div className="flex flex-col gap-1.5 px-5 py-3">
                <span className={LABEL_MICRO}>{t('ticket_detail.category_label', 'Kategori')}</span>
                <RowSelect
                  value={ticket.category_id || ''}
                  onChange={(v) => handleUpdateField('category_id', Number(v))}
                  disabled={isTeknisi}
                >
                  <option value="">{t('ticket_detail.select_category', '-- Pilih --')}</option>
                  {categories.map(cat => {
                    let path = cat.name;
                    let curr = cat;
                    while(curr.parent_id) {
                      curr = categories.find(c => c.id === curr.parent_id);
                      if (curr) path = curr.name + ' / ' + path;
                    }
                    return <option key={cat.id} value={cat.id}>{path}</option>;
                  })}
                </RowSelect>
              </div>
            </div>
          </section>

          {/* PELAPOR */}
          <section className={PANEL}>
            <div className={PANEL_HEAD}>
              <h2 className={PANEL_TITLE}>{t('ticket_detail.reporter_label', 'Pelapor')}</h2>
            </div>

            <div className="flex flex-col">
              <div className={FIELD_ROW}>
                <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--fg)]">
                  <svg className="h-4 w-4 shrink-0 text-[var(--fg-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  {ticket.phone ? (
                    <Link href={`/dashboard/administrasi/users/${encodeURIComponent(ticket.phone)}`} className="truncate transition-colors duration-150 hover:text-[var(--accent)]">
                      {requester}
                    </Link>
                  ) : (
                    <span className="truncate">{requester}</span>
                  )}
                </span>
              </div>
              <div className={FIELD_ROW}>
                <span className={LABEL_MICRO}>{t('ticket_detail.phone_label', 'No HP')}</span>
                <span className="flex items-center gap-1.5 text-[12.5px] tabular-nums text-[var(--fg)]">
                  {ticket.phone || '-'}
                  {ticket.phone && (
                    <a href={`https://wa.me/${ticket.phone.replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noopener noreferrer" className="text-[var(--fg-faint)] transition-colors duration-150 hover:text-[var(--accent)]">
                      <svg className="h-4 w-4 cursor-pointer" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"></path></svg>
                    </a>
                  )}
                </span>
              </div>
              <div className={FIELD_ROW}>
                <span className={LABEL_MICRO}>{t('ticket_detail.unit_label', 'Unit/Dep.')}</span>
                <span className="text-[12.5px] text-[var(--fg)]">{ticket.unit || ticket.reporter_type || '-'}</span>
              </div>
              <div className={FIELD_ROW}>
                <span className={LABEL_MICRO}>{t('ticket_detail.created_label', 'Dibuat')}</span>
                <span className="text-[12.5px] tabular-nums text-[var(--fg-dim)]">{formatDate(ticket.created_at)}</span>
              </div>
              <div className="flex flex-col gap-1.5 px-5 py-3">
                <span className={LABEL_MICRO}>{t('ticket_detail.updated_label', 'Diperbarui')}</span>
                <span className="text-[12.5px] tabular-nums text-[var(--fg-dim)]">{formatDate(ticket.updated_at || ticket.created_at)}</span>
              </div>
            </div>
          </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          {/* ISI TIKET SECTION */}
          <section className={`${PANEL} lg:col-span-2`}>
            <div className={PANEL_HEAD}>
              <h2 className={PANEL_TITLE}>{t('ticket_detail.content_title', 'Isi Tiket')}</h2>
            </div>
            
            <div className="flex flex-col">
              <div className={FIELD_ROW}>
                <span className={LABEL_MICRO}>{t('ticket_detail.subject_label', 'Subjek')}</span>
                <span className="text-[12.5px] font-medium text-[var(--fg)]">{ticket.subject}</span>
              </div>
              <div className="flex flex-col gap-1.5 px-5 py-3">
                <span className={LABEL_MICRO}>{t('ticket_detail.desc_label', 'Deskripsi')}</span>
                <div className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-[var(--fg-dim)]">
                  {ticket.description || '-'}
                </div>
              </div>
            </div>
          </section>

          {/* LAMPIRAN */}
          <section className={PANEL}>
            <div className={PANEL_HEAD}>
              <svg className="h-4 w-4 text-[var(--fg-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
              <h2 className={PANEL_TITLE}>{t('ticket_detail.attachment_label', 'Lampiran')}</h2>
            </div>
            
            <div className="flex flex-col gap-2 px-5 py-4">
              {(!ticket.attachment && (!ticket.attachments || ticket.attachments.length === 0)) ? (
                <p className="text-[12px] text-[var(--fg-faint)]">
                  {t('ticket_detail.no_attachment', 'Tidak ada lampiran')}
                </p>
              ) : (
                <>
                  {/* Single Attachment (if any) */}
                  {ticket.attachment && (
                    <a href={ticket.attachment} target="_blank" rel="noopener noreferrer" className="flex w-full items-center gap-3 overflow-hidden rounded-[4px] border border-[var(--rule)] p-2 transition-colors duration-150 hover:border-[var(--rule-strong)] hover:bg-[var(--canvas)]">
                      {/\.(jpeg|jpg|gif|png|webp)$/i.test(ticket.attachment) ? (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[3px] bg-[var(--canvas)]">
                          <img src={ticket.attachment} alt={t('ticket_detail.attachment_label', 'Lampiran')} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[3px] bg-[var(--canvas)] text-[var(--fg-faint)]">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                      )}
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="truncate text-[12.5px] font-medium text-[var(--fg)]">
                          {ticket.attachment.split('/').pop() || t('ticket_detail.attachment_label', 'Lampiran')}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[var(--fg-faint)]">{t('ticket_detail.view_file', 'Lihat file')}</div>
                      </div>
                    </a>
                  )}
                  
                  {/* Multiple Attachments (ticket_attachments) */}
                  {ticket.attachments && ticket.attachments.map((att, idx) => (
                    <a key={idx} href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex w-full items-center gap-3 overflow-hidden rounded-[4px] border border-[var(--rule)] p-2 transition-colors duration-150 hover:border-[var(--rule-strong)] hover:bg-[var(--canvas)]">
                      {/\.(jpeg|jpg|gif|png|webp)$/i.test(att.file_url) ? (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[3px] bg-[var(--canvas)]">
                          <img src={att.file_url} alt={att.file_name || t('ticket_detail.attachment_label', 'Lampiran')} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[3px] bg-[var(--canvas)] text-[var(--fg-faint)]">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                      )}
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="truncate text-[12.5px] font-medium text-[var(--fg)]">
                          {att.file_name || att.file_url.split('/').pop() || t('ticket_detail.attachment_label', 'Lampiran')}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[var(--fg-faint)]">{t('ticket_detail.view_file', 'Lihat file')}</div>
                      </div>
                    </a>
                  ))}
                </>
              )}
            </div>
          </section>
      </div>
      
      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <Modal
          title={confirmModal.title}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          zIndex="z-[100]"
          footer={
            <>
              <ModalCancelButton onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}>
                {t('common.cancel', 'Batal')}
              </ModalCancelButton>
              <ModalPrimaryButton
                onClick={() => {
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  confirmModal.onConfirm();
                }}
              >
                {t('ticket_detail.confirm_yes', 'Ya, Lanjutkan')}
              </ModalPrimaryButton>
            </>
          }
        >
          <p className="text-[12.5px] leading-relaxed text-[var(--fg-dim)]">{confirmModal.message}</p>
        </Modal>
      )}

      {/* Toast Notifications */}
      <Toast toast={toast} />
    </div>
  );
}

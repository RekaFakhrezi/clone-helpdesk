'use client';
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { translateCategoryName, translateTicketSubject } from '@/lib/translations';

const BADGE_BASE =
  'inline-flex items-center px-1.5 py-0.5 rounded-[3px] border text-[10.5px] font-medium tracking-[0.02em] whitespace-nowrap';

const MICRO_LABEL =
  'text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]';

export default function PimpinanTicketTable({ 
  tickets, 
  isEscalatedTab = false, 
  onAction 
}: { 
  tickets: any[]; 
  isEscalatedTab?: boolean; 
  onAction?: (id: string, action: 'CLOSE' | 'RETURN') => void;
}) {
  const { t, language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(tickets.length / itemsPerPage) || 1;
  
  const paginatedTickets = tickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Warna hanya dipakai untuk status yang membawa makna (menunggu / selesai / eskalasi).
  const getStatusBadge = (status: string) => {
    const s = (status || 'OPEN').toUpperCase();
    switch (s) {
      case 'WAITING VERIFICATION':
        return <span className={`${BADGE_BASE} bg-[rgba(178,107,0,.08)] text-[var(--warn)] border-[rgba(178,107,0,.18)]`}>{t('pimpinan.badge_verified', 'Verifikasi')}</span>;
      case 'NEW':
      case 'OPEN':
        return <span className={`${BADGE_BASE} bg-[rgba(0,45,114,.07)] text-[var(--accent)] border-[rgba(0,45,114,.18)]`}>{t('pimpinan.badge_new_open', 'Baru / Open')}</span>;
      case 'IN PROGRESS':
      case 'DIPROSES':
        return <span className={`${BADGE_BASE} bg-[var(--canvas)] text-[var(--fg-dim)] border-[var(--rule-strong)]`}>{t('pimpinan.badge_in_progress', 'Diproses')}</span>;
      case 'WAITING CONFIRMATION':
        return <span className={`${BADGE_BASE} bg-[var(--canvas)] text-[var(--fg-dim)] border-[var(--rule-strong)]`}>{t('pimpinan.badge_wait_confirm', 'Konfirmasi Pelapor')}</span>;
      case 'RESOLVED':
        return <span className={`${BADGE_BASE} bg-[rgba(15,123,79,.08)] text-[var(--ok)] border-[rgba(15,123,79,.18)]`}>{t('pimpinan.badge_resolved', 'Diselesaikan')}</span>;
      case 'CLOSED':
        return <span className={`${BADGE_BASE} bg-[var(--canvas)] text-[var(--fg-faint)] border-[var(--rule)]`}>{t('pimpinan.badge_closed', 'Ditutup')}</span>;
      case 'ESCALATED':
        return <span className={`${BADGE_BASE} bg-[rgba(179,33,27,.08)] text-[var(--danger)] border-[rgba(179,33,27,.18)]`}>{t('pimpinan.badge_escalated', 'Eskalasi')}</span>;
      case 'DITOLAK':
      case 'REJECTED':
        return <span className={`${BADGE_BASE} bg-[rgba(179,33,27,.08)] text-[var(--danger)] border-[rgba(179,33,27,.18)]`}>{t('pimpinan.badge_rejected', 'Ditolak')}</span>;
      default:
        return <span className={`${BADGE_BASE} bg-[var(--canvas)] text-[var(--fg-dim)] border-[var(--rule)]`}>{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const p = (priority || 'SEDANG').toUpperCase();
    const isEn = language === 'en';
    switch (p) {
      case 'KRITIS':
      case 'CRITICAL':
        return <span className={`${BADGE_BASE} bg-[rgba(179,33,27,.08)] text-[var(--danger)] border-[rgba(179,33,27,.18)]`}>{isEn ? 'CRITICAL' : 'KRITIS'}</span>;
      case 'TINGGI':
      case 'HIGH':
        return <span className={`${BADGE_BASE} bg-[rgba(178,107,0,.08)] text-[var(--warn)] border-[rgba(178,107,0,.18)]`}>{isEn ? 'HIGH' : 'TINGGI'}</span>;
      case 'SEDANG':
      case 'MEDIUM':
        return <span className={`${BADGE_BASE} bg-[var(--canvas)] text-[var(--fg-dim)] border-[var(--rule-strong)]`}>{isEn ? 'MEDIUM' : 'SEDANG'}</span>;
      case 'RENDAH':
      case 'LOW':
        return <span className={`${BADGE_BASE} bg-[var(--canvas)] text-[var(--fg-faint)] border-[var(--rule)]`}>{isEn ? 'LOW' : 'RENDAH'}</span>;
      default:
        return <span className={`${BADGE_BASE} bg-[var(--canvas)] text-[var(--fg-faint)] border-[var(--rule)]`}>{priority}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy, HH:mm', { locale: language === 'en' ? enUS : id });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--rule)]">
              <th className="px-4 py-2.5"><span className={MICRO_LABEL}>{t('pimpinan.col_ticket_num', 'No. Tiket')}</span></th>
              <th className="px-4 py-2.5"><span className={MICRO_LABEL}>{t('pimpinan.col_time', 'Waktu')}</span></th>
              <th className="px-4 py-2.5"><span className={MICRO_LABEL}>{t('pimpinan.col_reporter', 'Pelapor')}</span></th>
              <th className="px-4 py-2.5"><span className={MICRO_LABEL}>{t('pimpinan.col_cat_topic', 'Kategori & Topik')}</span></th>
              <th className="px-4 py-2.5 text-center"><span className={MICRO_LABEL}>{t('pimpinan.col_priority', 'Prioritas')}</span></th>
              <th className="px-4 py-2.5 text-center"><span className={MICRO_LABEL}>{t('pimpinan.col_status', 'Status')}</span></th>
              <th className="px-4 py-2.5"><span className={MICRO_LABEL}>{t('pimpinan.col_tech', 'Teknisi / Petugas')}</span></th>
              {isEscalatedTab && <th className="px-4 py-2.5 text-center"><span className={MICRO_LABEL}>{t('pimpinan.col_action', 'Aksi Pimpinan')}</span></th>}
            </tr>
          </thead>
          <tbody>
            {paginatedTickets.length === 0 ? (
              <tr>
                <td colSpan={isEscalatedTab ? 8 : 7} className="px-4 py-10 text-center text-[12.5px] text-[var(--fg-dim)]">
                  {t('pimpinan.empty_table', 'Tidak ada data tiket yang sesuai kriteria.')}
                </td>
              </tr>
            ) : (
              paginatedTickets.map((t) => {
                const reporterName = t.reporter_name || t.reporters?.name || 'Anonim';
                const reporterInfo = t.nim_nip || t.reporters?.phone || t.phone || '';
                const categoryName = translateCategoryName(t.category?.name || t.categories?.name || '-', language);
                const subject = translateCategoryName(translateTicketSubject(t.subject || t.title || (language === 'en' ? 'Untitled' : 'Tanpa Judul'), language), language);
                // API mengembalikan alias `tech` dari query: tech:staff_profiles!tickets_tech_id_fkey(name)
                const technicianName = t.tech?.name || t.technician?.name || t.assigned_technician?.name || '-';

                return (
                  <tr key={t.id} className="border-b border-[var(--rule)] transition-colors hover:bg-[var(--canvas)] last:border-b-0">
                    {/* No. Tiket */}
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[12px] font-medium tabular-nums text-[var(--accent)]">
                      {t.ticket_num || `#${t.id.slice(0, 8)}`}
                    </td>

                    {/* Waktu */}
                    <td className="px-4 py-3 whitespace-nowrap text-[11.5px] tabular-nums text-[var(--fg-dim)]">
                      {formatDate(t.created_at)}
                    </td>

                    {/* Pelapor */}
                    <td className="px-4 py-3">
                      <div className="text-[12.5px] text-[var(--fg)]">{reporterName}</div>
                      {reporterInfo && <div className="text-[11.5px] text-[var(--fg-faint)]">{reporterInfo}</div>}
                    </td>

                    {/* Kategori & Topik */}
                    <td className="max-w-xs px-4 py-3">
                      <div className="truncate text-[12.5px] font-medium text-[var(--fg)]" title={subject}>{subject}</div>
                      <div className="text-[11.5px] text-[var(--fg-faint)]">{categoryName}</div>
                    </td>

                    {/* Prioritas */}
                    <td className="px-4 py-3 text-center">
                      {getPriorityBadge(t.priority)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {getStatusBadge(t.status)}
                    </td>

                    {/* Teknisi */}
                    <td className="px-4 py-3 text-[12px] text-[var(--fg-dim)]">
                      {technicianName !== '-' ? (
                        technicianName
                      ) : (
                        <span className="text-[var(--fg-faint)] italic">{language === 'en' ? 'Unassigned' : 'Belum ditugaskan'}</span>
                      )}
                    </td>

                    {/* Aksi Eskalasi */}
                    {isEscalatedTab && (
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => onAction && onAction(t.id, 'CLOSE')}
                            className="h-9 rounded-[4px] border border-[rgba(179,33,27,.18)] px-3 text-[12px] font-medium text-[var(--danger)] transition-colors hover:bg-[rgba(179,33,27,.08)]"
                          >
                            {language === 'en' ? 'Force Close' : 'Tutup Paksa'}
                          </button>
                          <button 
                            onClick={() => onAction && onAction(t.id, 'RETURN')}
                            className="h-9 rounded-[4px] border border-[var(--rule-strong)] px-3 text-[12px] font-medium text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)]"
                          >
                            {language === 'en' ? 'Return' : 'Kembalikan'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--rule)] px-4 py-3 sm:flex-row">
          <p className="text-[11.5px] text-[var(--fg-dim)]">
            {t('tickets.showing', 'Menampilkan')} <span className="tabular-nums text-[var(--fg)]">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="tabular-nums text-[var(--fg)]">{Math.min(currentPage * itemsPerPage, tickets.length)}</span> {t('tickets.of', 'dari')} <span className="tabular-nums text-[var(--fg)]">{tickets.length}</span> {t('tickets.tickets_count', 'tiket')}
          </p>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-[var(--rule-strong)] text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <span className="px-2 text-[11.5px] tabular-nums text-[var(--fg-dim)]">
              {language === 'en' ? `Page ${currentPage} of ${totalPages}` : `Halaman ${currentPage} dari ${totalPages}`}
            </span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-[var(--rule-strong)] text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

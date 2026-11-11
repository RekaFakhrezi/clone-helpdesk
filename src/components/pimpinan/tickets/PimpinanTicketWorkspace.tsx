'use client';
import React, { useState, useEffect, useMemo } from 'react';
import PimpinanTicketTable from "./PimpinanTicketTable";
import { fetchClient } from '@/lib/apiClient';
import { Search, Printer, AlertTriangle, CheckCircle2, Clock, Inbox } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PimpinanTicketWorkspace() {
  const { t, language } = useLanguage();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unhandled' | 'inprogress' | 'resolved' | 'escalated'>('all');

  useEffect(() => {
    fetchTicketsData();
  }, []);

  const fetchTicketsData = async () => {
    try {
      setLoading(true);
      const res = await fetchClient('/admin/tickets');
      // API mengembalikan { success: true, data: [...] }
      const ticketList = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setTickets(ticketList);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    let list = tickets;

    // Filter berdasarkan tab aktif
    if (activeTab === 'unhandled') {
      list = list.filter(t =>
        ['WAITING VERIFICATION', 'NEW', 'OPEN'].includes(t.status)
      );
    } else if (activeTab === 'inprogress') {
      list = list.filter(t =>
        ['IN PROGRESS', 'DIPROSES', 'WAITING CONFIRMATION'].includes(
          (t.status || '').toUpperCase()
        )
      );
    } else if (activeTab === 'resolved') {
      list = list.filter(t =>
        ['RESOLVED', 'CLOSED', 'RESOLVED_BY_SYSTEM'].includes(
          (t.status || '').toUpperCase()
        )
      );
    } else if (activeTab === 'escalated') {
      list = list.filter(
        t =>
          t.status === 'ESCALATED' ||
          (t.sla_due &&
            new Date(t.sla_due).getTime() < Date.now() &&
            !['RESOLVED', 'CLOSED'].includes(t.status))
      );
    }

    // Filter live search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        ticket =>
          (ticket.ticket_num || '').toLowerCase().includes(q) ||
          (ticket.id || '').toLowerCase().includes(q) ||
          (ticket.reporter_name || ticket.reporters?.name || '')
            .toLowerCase()
            .includes(q) ||
          (ticket.subject || ticket.title || '').toLowerCase().includes(q) ||
          (ticket.category?.name || ticket.categories?.name || '')
            .toLowerCase()
            .includes(q) ||
          (ticket.tech?.name || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [tickets, activeTab, searchQuery]);

  const escalatedCount = useMemo(() => {
    return tickets.filter(
      t =>
        t.status === 'ESCALATED' ||
        (t.sla_due &&
          new Date(t.sla_due).getTime() < Date.now() &&
          !['RESOLVED', 'CLOSED'].includes(t.status))
    ).length;
  }, [tickets]);

  const getTabLabel = () => {
    switch (activeTab) {
      case 'unhandled':
        return 'Belum Ditangani';
      case 'inprogress':
        return 'Sedang Diproses';
      case 'resolved':
        return 'Selesai';
      case 'escalated':
        return 'Tiket Eskalasi & Terlambat';
      default:
        return 'Semua Tiket';
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tabLabel = getTabLabel();
    doc.setFontSize(14);
    doc.text(`Laporan Tiket IT Helpdesk`, 14, 14);
    doc.setFontSize(11);
    doc.text(`Filter: ${tabLabel}`, 14, 21);
    doc.setFontSize(9);
    doc.text(
      `Dicetak pada: ${new Date().toLocaleString('id-ID')}`,
      14,
      27
    );

    const tableData = filteredTickets.map(ticket => [
      ticket.ticket_num || '-',
      ticket.reporter_name || ticket.reporters?.name || '-',
      ticket.subject || ticket.title || '-',
      ticket.category?.name || ticket.categories?.name || '-',
      ticket.status || '-',
      ticket.tech?.name || '-',
      ticket.created_at
        ? new Date(ticket.created_at).toLocaleDateString('id-ID')
        : '-',
    ]);

    autoTable(doc, {
      head: [
        ['No Tiket', 'Pelapor', 'Subjek', 'Kategori', 'Status', 'Teknisi', 'Tanggal'],
      ],
      body: tableData,
      startY: 32,
    });

    doc.save(`Laporan_Tiket_${activeTab}.pdf`);
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-10 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 w-full md:flex-row md:items-end">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-[22px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg)]">
            {t('pimpinan.report_title', 'Laporan Tiket')}
          </h1>
          <p className="mt-1 text-[13px] text-[var(--fg-dim)]">
            {t(
              'pimpinan.report_desc',
              'Pemantauan seluruh tiket pengaduan IT Helpdesk secara waktu nyata.'
            )}
          </p>
        </div>
        <button
          onClick={exportPDF}
          className="h-9 inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--rule-strong)] px-3 text-[12px] font-medium text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)]"
        >
          <Printer className="h-4 w-4" strokeWidth={1.75} />
          {t('pimpinan.print_report', 'Cetak Laporan')}
        </button>
      </div>

      {/* Main Container Card */}
      <div className="w-full overflow-hidden rounded-[4px] border border-[var(--rule)] bg-[var(--surface)]">
        {/* Navigation Tabs */}
        <div className="flex items-end gap-1 overflow-x-auto border-b border-[var(--rule)] px-4 no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`-mb-px inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-b px-3 py-2.5 text-[12.5px] transition-colors ${
              activeTab === 'all'
                ? 'border-[var(--accent)] text-[var(--fg)] font-medium'
                : 'border-transparent text-[var(--fg-dim)] hover:text-[var(--fg)]'
            }`}
          >
            <Inbox className="h-4 w-4" strokeWidth={1.75} />
            {t('tickets.tab_all', 'Semua Tiket')}{' '}
            <span className="text-[11px] tabular-nums text-[var(--fg-faint)]">({tickets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('unhandled')}
            className={`-mb-px inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-b px-3 py-2.5 text-[12.5px] transition-colors ${
              activeTab === 'unhandled'
                ? 'border-[var(--accent)] text-[var(--fg)] font-medium'
                : 'border-transparent text-[var(--fg-dim)] hover:text-[var(--fg)]'
            }`}
          >
            <Clock className="h-4 w-4" strokeWidth={1.75} />
            {t('pimpinan.tab_unhandled', 'Belum Ditangani')}{' '}
            <span className="text-[11px] tabular-nums text-[var(--fg-faint)]">
              (
              {
                tickets.filter(t =>
                  ['WAITING VERIFICATION', 'NEW', 'OPEN'].includes(t.status)
                ).length
              }
              )
            </span>
          </button>
          <button
            onClick={() => setActiveTab('inprogress')}
            className={`-mb-px inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-b px-3 py-2.5 text-[12.5px] transition-colors ${
              activeTab === 'inprogress'
                ? 'border-[var(--accent)] text-[var(--fg)] font-medium'
                : 'border-transparent text-[var(--fg-dim)] hover:text-[var(--fg)]'
            }`}
          >
            <Clock className="h-4 w-4" strokeWidth={1.75} />
            {t('pimpinan.tab_inprogress', 'Sedang Diproses')}{' '}
            <span className="text-[11px] tabular-nums text-[var(--fg-faint)]">
              (
              {
                tickets.filter(t =>
                  ['IN PROGRESS', 'DIPROSES', 'WAITING CONFIRMATION'].includes(
                    (t.status || '').toUpperCase()
                  )
                ).length
              }
              )
            </span>
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`-mb-px inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-b px-3 py-2.5 text-[12.5px] transition-colors ${
              activeTab === 'resolved'
                ? 'border-[var(--accent)] text-[var(--fg)] font-medium'
                : 'border-transparent text-[var(--fg-dim)] hover:text-[var(--fg)]'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
            {t('pimpinan.tab_resolved', 'Selesai')}{' '}
            <span className="text-[11px] tabular-nums text-[var(--fg-faint)]">
              (
              {
                tickets.filter(t =>
                  ['RESOLVED', 'CLOSED', 'RESOLVED_BY_SYSTEM'].includes(
                    (t.status || '').toUpperCase()
                  )
                ).length
              }
              )
            </span>
          </button>
          <button
            onClick={() => setActiveTab('escalated')}
            className={`-mb-px inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-b px-3 py-2.5 text-[12.5px] transition-colors ${
              activeTab === 'escalated'
                ? 'border-[var(--danger)] text-[var(--danger)] font-medium'
                : 'border-transparent text-[var(--fg-dim)] hover:text-[var(--fg)]'
            }`}
          >
            <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
            {t('pimpinan.tab_escalated', 'Tiket Eskalasi & Terlambat')}
            {escalatedCount > 0 && (
              <span className="inline-flex items-center rounded-[3px] border border-[rgba(179,33,27,.18)] bg-[rgba(179,33,27,.08)] px-1.5 py-0.5 text-[10.5px] font-medium tabular-nums text-[var(--danger)]">
                {escalatedCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] px-4 py-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder={t(
                'pimpinan.search_placeholder',
                'Cari No. Tiket, pelapor, subjek...'
              )}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-[4px] border border-[var(--rule-strong)] bg-transparent pl-9 pr-3 text-[12.5px] text-[var(--fg)] placeholder:text-[var(--fg-faint)] transition-colors focus:border-[var(--accent)] focus:outline-none"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-faint)]" strokeWidth={1.75} />
          </div>
          <div className="text-[11.5px] tabular-nums text-[var(--fg-dim)]">
            {t('tickets.showing', 'Menampilkan')} {filteredTickets.length}{' '}
            {t('tickets.tickets_count', 'tiket')}
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16">
            <div className="h-7 w-7 animate-spin rounded-full border border-[var(--rule)] border-t-[var(--accent)]"></div>
            <p className="text-[11.5px] text-[var(--fg-dim)]">
              {t('pimpinan.loading_tickets', 'Memuat data tiket...')}
            </p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-16">
            <Inbox className="h-5 w-5 text-[var(--fg-faint)]" strokeWidth={1.75} />
            <p className="text-[12.5px] text-[var(--fg-dim)]">
              Tidak ada data tiket pada filter ini.
            </p>
          </div>
        ) : (
          <PimpinanTicketTable
            tickets={filteredTickets}
            isEscalatedTab={activeTab === 'escalated'}
            onAction={async (id, action) => {
              if (action === 'CLOSE') {
                if (
                  confirm(
                    language === 'en'
                      ? 'Force close this ticket?'
                      : 'Tutup tiket ini secara paksa?'
                  )
                ) {
                  await fetchClient(`/admin/tickets/${id}/status`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: 'CLOSED' }),
                  });
                  fetchTicketsData();
                }
              } else if (action === 'RETURN') {
                if (
                  confirm(
                    language === 'en'
                      ? 'Return this ticket to the operator?'
                      : 'Kembalikan tiket ini ke Operator?'
                  )
                ) {
                  await fetchClient(`/admin/tickets/${id}/status`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: 'OPEN' }),
                  });
                  fetchTicketsData();
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

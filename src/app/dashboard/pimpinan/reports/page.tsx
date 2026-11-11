'use client';
import React, { useState } from 'react';
import { FileText, Download, Calendar, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { fetchClient } from '@/lib/apiClient';

type ReportTicket = {
  id?: string | number;
  ticket_num?: string;
  reporter_name?: string;
  reporters?: { name?: string };
  phone?: string;
  reporter_phone?: string;
  category?: { name?: string };
  categories?: { name?: string };
  dept?: { name?: string };
  departments?: { name?: string };
  priority?: string;
  status?: string;
  created_at?: string;
};

type ReportRowKind = 'whatsapp' | 'ticket';

/** Satu baris tabel ekspor (kolom berbeda sesuai jenis rekap). */
function toRow(ticket: ReportTicket, kind: ReportRowKind): (string | number)[] {
  const identity = [
    ticket.ticket_num || `#${ticket.id}`,
    ticket.reporter_name || ticket.reporters?.name || 'Pelapor',
  ];
  const category = ticket.category?.name || ticket.categories?.name || '-';
  const department = ticket.dept?.name || ticket.departments?.name || '-';
  const status = ticket.status || 'Open';
  const createdAt = ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('id-ID') : '-';

  if (kind === 'whatsapp') {
    const phone = ticket.phone || ticket.reporter_phone || '-';
    return [...identity, phone, category, department, status, createdAt];
  }

  return [...identity, category, department, ticket.priority || 'SEDANG', status, createdAt];
}


export default function PimpinanReportsPage() {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState<string | null>(null);

  const getSlaTargetHours = (priority?: string): number => {
    const p = (priority || '').toUpperCase();
    if (p === 'CRITICAL' || p === 'KRITIS' || p === 'URGENT') return 4;
    if (p === 'HIGH' || p === 'TINGGI') return 12;
    if (p === 'MEDIUM' || p === 'SEDANG') return 24;
    if (p === 'LOW' || p === 'RENDAH') return 48;
    return 24;
  };

  const formatDuration = (hours: number): string => {
    if (hours < 1) {
      const mins = Math.max(1, Math.round(hours * 60));
      return `${mins} Menit`;
    }
    if (hours < 24) {
      return `${hours.toFixed(1)} Jam`;
    }
    const days = Math.floor(hours / 24);
    const rem = Math.round(hours % 24);
    return rem > 0 ? `${days}h ${rem}j` : `${days} Hari`;
  };

  const handleExport = async (reportId: string, title: string, format: string) => {
    const key = `${reportId}-${format}`;
    setDownloading(key);

    try {
      const res = await fetchClient('/admin/tickets');
      let data = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      
      let headers: string[] = [];
      let tableData: any[][] = [];
      let summaryText = '';
      let totalCount = 0;
      let metCount = 0;
      let breachedCount = 0;
      let compliancePercentage = '100';

      if (reportId === 'sla') {
        headers = ['No Tiket', 'Pelapor', 'Kategori', 'Prioritas', 'Status Tiket', 'Target SLA', 'Durasi', 'Kepatuhan SLA'];
        
        tableData = data.map((t: any) => {
          const targetHours = getSlaTargetHours(t.priority);
          const startTime = t.created_at ? new Date(t.created_at).getTime() : Date.now();
          const statusUpper = (t.status || '').toUpperCase();
          const isCompleted = ['RESOLVED', 'CLOSED', 'RESOLVED_BY_SYSTEM', 'SELESAI'].includes(statusUpper);
          const isRejected = ['REJECTED', 'DITOLAK'].includes(statusUpper);

          let endTime = Date.now();
          if (isCompleted || isRejected) {
            endTime = t.updated_at ? new Date(t.updated_at).getTime() : startTime;
          }

          const elapsedHours = Math.max(0, (endTime - startTime) / (1000 * 3600));
          const durationStr = formatDuration(elapsedHours);

          let complianceStatus = '';
          if (isCompleted) {
            if (elapsedHours <= targetHours) {
              complianceStatus = 'Tepat Waktu (Met SLA)';
              metCount++;
            } else {
              complianceStatus = 'Melewati SLA (Breached)';
              breachedCount++;
            }
          } else if (isRejected) {
            complianceStatus = 'Ditolak (Non-Aktif)';
            metCount++;
          } else {
            if (elapsedHours <= targetHours) {
              complianceStatus = 'Dalam Batas (On Track)';
              metCount++;
            } else {
              complianceStatus = 'Melewati SLA (Overdue)';
              breachedCount++;
            }
          }

          return [
            t.ticket_num || `#${t.id}`,
            t.reporter_name || t.reporters?.name || 'Pelapor',
            t.category?.name || t.categories?.name || '-',
            t.priority || 'SEDANG',
            t.status || 'Open',
            `${targetHours} Jam`,
            durationStr,
            complianceStatus
          ];
        });

        totalCount = data.length;
        compliancePercentage = totalCount > 0 ? ((metCount / totalCount) * 100).toFixed(1) : '100';
        summaryText = `Kepatuhan SLA: ${compliancePercentage}% | Tepat Waktu / On Track: ${metCount} | Melewati SLA: ${breachedCount} | Total Tiket: ${totalCount}`;

      } else if (reportId === 'whatsapp') {
        const waData = data.filter((t: any) => t.phone || t.reporter_phone);
        const targetList = waData.length > 0 ? waData : data;
        headers = ['No Tiket', 'Pelapor', 'No WhatsApp', 'Kategori', 'Departemen', 'Status Tiket', 'Tanggal Dibuat'];
        tableData = targetList.map((ticket: ReportTicket) => toRow(ticket, 'whatsapp'));

      } else {
        // weekly / monthly
        if (reportId === 'weekly') {
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          const filtered = data.filter((t: any) => new Date(t.created_at) >= lastWeek);
          if (filtered.length > 0) data = filtered;
        } else if (reportId === 'monthly') {
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          const filtered = data.filter((t: any) => new Date(t.created_at) >= lastMonth);
          if (filtered.length > 0) data = filtered;
        }

        headers = ['No Tiket', 'Pelapor', 'Kategori', 'Departemen', 'Prioritas', 'Status Tiket', 'Tanggal Dibuat'];
        tableData = data.map((ticket: ReportTicket) => toRow(ticket, 'ticket'));
      }

      if (format === 'PDF') {
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        // Header Title
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 138); // #1E3A8A
        doc.text('IT HELPDESK UNIVERSITAS DIPONEGORO', 14, 15);

        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        doc.text(`Rekap Laporan - ${title}`, 14, 22);

        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')} | Total Data: ${tableData.length} Tiket`, 14, 28);

        let startY = 33;
        if (summaryText) {
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(14, 32, 269, 9, 2, 2, 'F');
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(summaryText, 18, 38);
          startY = 45;
        }

        autoTable(doc, {
          head: [headers],
          body: tableData,
          startY: startY,
          theme: 'grid',
          headStyles: {
            fillColor: [30, 58, 138],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8.5
          },
          bodyStyles: {
            fontSize: 8,
            cellPadding: 2.5
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          },
          didParseCell: (hookData) => {
            if (reportId === 'sla' && hookData.section === 'body' && hookData.column.index === headers.length - 1) {
              const val = String(hookData.cell.raw || '');
              if (val.includes('Melewati') || val.includes('Breached') || val.includes('Overdue')) {
                hookData.cell.styles.textColor = [220, 38, 38];
                hookData.cell.styles.fontStyle = 'bold';
              } else if (val.includes('Tepat') || val.includes('On Track')) {
                hookData.cell.styles.textColor = [22, 163, 74];
                hookData.cell.styles.fontStyle = 'bold';
              }
            }
          }
        });

        doc.save(`Rekap_${reportId}_${new Date().toISOString().slice(0, 10)}.pdf`);
      } else if (format === 'Excel') {
        let exportRows: any[][] = [];
        if (summaryText) {
          exportRows = [
            ['IT HELPDESK UNIVERSITAS DIPONEGORO - LAPORAN KEPATUHAN SLA'],
            [`Waktu Cetak: ${new Date().toLocaleString('id-ID')}`],
            [summaryText],
            [],
            headers,
            ...tableData
          ];
        } else {
          exportRows = [
            [`IT HELPDESK UNIVERSITAS DIPONEGORO - ${title.toUpperCase()}`],
            [`Waktu Cetak: ${new Date().toLocaleString('id-ID')}`],
            [],
            headers,
            ...tableData
          ];
        }

        const ws = XLSX.utils.aoa_to_sheet(exportRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Laporan");
        XLSX.writeFile(wb, `Rekap_${reportId}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      }
      
      alert(`${t('reports.success_alert')} ${title} (${format}).`);
    } catch (error) {
      console.error(error);
      alert('Gagal mengekspor data');
    } finally {
      setDownloading(null);
    }
  };

  const reportList = [
    {
      id: 'weekly',
      titleKey: 'reports.weekly_title',
      descKey: 'reports.weekly_desc',
      icon: Calendar,
      iconColor: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'monthly',
      titleKey: 'reports.monthly_title',
      descKey: 'reports.monthly_desc',
      icon: FileText,
      iconColor: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: 'sla',
      titleKey: 'reports.sla_title',
      descKey: 'reports.sla_desc',
      icon: ShieldCheck,
      iconColor: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'whatsapp',
      titleKey: 'reports.wa_title',
      descKey: 'reports.wa_desc',
      icon: MessageSquare,
      iconColor: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="flex flex-col items-start gap-6 w-full max-w-[1440px] mx-auto pb-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Page Header */}
      <div className="flex flex-col items-start gap-1">
        <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight">{t('reports.page_title')}</h1>
        <p className="text-[var(--text-dim)] text-sm font-medium">{t('reports.page_desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {reportList.map((item) => {
          const Icon = item.icon;
          const title = t(item.titleKey);
          const isPdfLoading = downloading === `${item.id}-PDF`;
          const isExcelLoading = downloading === `${item.id}-Excel`;

          return (
            <div 
              key={item.id}
              className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${item.iconColor} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--ink)] text-base">{title}</h3>
                    <span className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider">{t('reports.auto_format')}</span>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-dim)] mb-6 leading-relaxed">
                  {t(item.descKey)}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--line)]">
                <button 
                  onClick={() => handleExport(item.id, title, 'PDF')}
                  disabled={!!downloading}
                  className="flex-1 py-2.5 bg-[var(--ink)] text-white text-xs font-bold rounded-xl hover:bg-[var(--text)] transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isPdfLoading ? t('reports.processing') : t('reports.download_pdf')}
                </button>
                <button 
                  onClick={() => handleExport(item.id, title, 'Excel')}
                  disabled={!!downloading}
                  className="flex-1 py-2.5 bg-white border border-[var(--line-dark)] text-[var(--ink)] text-xs font-bold rounded-xl hover:bg-[var(--paper-2)] transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                  {isExcelLoading ? t('reports.processing') : t('reports.download_excel')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

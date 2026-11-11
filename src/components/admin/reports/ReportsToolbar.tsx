"use client";

import React, { useState } from "react";
import { CalendarDays, Download, Info } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ReportsToolbarProps {
  fromDate?: string;
  setFromDate?: (date: string) => void;
  toDate?: string;
  setToDate?: (date: string) => void;
  status?: string;
  setStatus?: (status: string) => void;
  onExport?: (config: {
    fromDate: string;
    toDate: string;
    status: string;
  }) => void;
}

const MICRO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]";

const FIELD_BOX =
  "relative flex h-9 w-full items-center rounded-[4px] border border-[var(--rule-strong)] px-3 transition-colors focus-within:border-[var(--accent)]";

export default function ReportsToolbar({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  status,
  setStatus,
  onExport,
}: ReportsToolbarProps) {
  const { language, t } = useLanguage();
  // State lokal fallback jika tidak di-pass dari ReportWorkspace
  const [localFromDate, setLocalFromDate] = useState("");
  const [localToDate, setLocalToDate] = useState("");
  const [localStatus, setLocalStatus] = useState("");

  const [isExporting, setIsExporting] = useState(false);

  const activeFromDate = fromDate !== undefined ? fromDate : localFromDate;
  const activeSetFromDate = setFromDate || setLocalFromDate;

  const activeToDate = toDate !== undefined ? toDate : localToDate;
  const activeSetToDate = setToDate || setLocalToDate;

  const activeStatus = status !== undefined ? status : localStatus;
  const activeSetStatus = setStatus || setLocalStatus;

  const handleExport = () => {
    if (isExporting) return;
    setIsExporting(true);
    
    setTimeout(() => {
      setIsExporting(false);
      if (onExport) {
        onExport({
          fromDate: activeFromDate,
          toDate: activeToDate,
          status: activeStatus,
        });
      } else {
        alert("Dokumen berhasil diekspor! (Simulasi)");
      }
    }, 1500);
  };

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[4px] border border-[var(--rule)] bg-[var(--surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--rule)] px-5 py-3.5">
        <h2 className="text-[13px] font-medium text-[var(--fg)]">
          {language === 'en' ? 'Export Configuration' : 'Konfigurasi Ekspor'}
        </h2>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Dari tanggal */}
          <div className="flex flex-col items-start gap-1.5">
            <span className={MICRO_LABEL}>
              {language === 'en' ? 'FROM DATE' : 'DARI TANGGAL MASUK'}
            </span>
            <div className={FIELD_BOX}>
              <span className="flex-1 truncate text-[12px] tabular-nums text-[var(--fg)]">
                {activeFromDate ? (
                  activeFromDate
                ) : (
                  <span className="text-[var(--fg-faint)]">mm/dd/yyyy</span>
                )}
              </span>
              <CalendarDays className="ml-2 h-4 w-4 shrink-0 text-[var(--fg-faint)]" strokeWidth={1.75} />
              <input
                type="date"
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                value={activeFromDate}
                onChange={(e) => activeSetFromDate(e.target.value)}
              />
            </div>
            <span className="text-[11.5px] leading-[1.5] text-[var(--fg-faint)]">
              {language === 'en' ? 'Leave empty to include all data from the beginning' : 'Kosongkan jika ingin mengambil semua data dari awal'}
            </span>
          </div>

          {/* Sampai tanggal */}
          <div className="flex flex-col items-start gap-1.5">
            <span className={MICRO_LABEL}>
              {language === 'en' ? 'TO DATE' : 'SAMPAI TANGGAL MASUK'}
            </span>
            <div className={FIELD_BOX}>
              <span className="flex-1 truncate text-[12px] tabular-nums text-[var(--fg)]">
                {activeToDate ? (
                  activeToDate
                ) : (
                  <span className="text-[var(--fg-faint)]">mm/dd/yyyy</span>
                )}
              </span>
              <CalendarDays className="ml-2 h-4 w-4 shrink-0 text-[var(--fg-faint)]" strokeWidth={1.75} />
              <input
                type="date"
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                value={activeToDate}
                onChange={(e) => activeSetToDate(e.target.value)}
              />
            </div>
            <span className="text-[11.5px] leading-[1.5] text-[var(--fg-faint)]">
              {language === 'en' ? 'Leave empty to include data through today' : 'Kosongkan jika ingin mengambil data hingga hari ini'}
            </span>
          </div>
        </div>

        {/* Status tiket */}
        <div className="flex flex-col items-start gap-1.5 md:max-w-[calc(50%-0.5rem)]">
          <span className={MICRO_LABEL}>
            {language === 'en' ? 'TICKET STATUS' : 'STATUS TIKET'}
          </span>
          <div className={FIELD_BOX}>
            <span className="flex-1 truncate text-[12px] text-[var(--fg)]">
              {activeStatus || (language === 'en' ? 'All Statuses' : 'Semua Status')}
            </span>
            <svg
              className="ml-2 h-4 w-4 shrink-0 text-[var(--fg-faint)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M6 9l6 6 6-6" />
            </svg>
            <select
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              value={activeStatus}
              onChange={(e) => activeSetStatus(e.target.value)}
            >
              <option value="">{language === 'en' ? 'All Statuses' : 'Semua Status'}</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Catatan isi data */}
        <div className="flex items-start gap-3 border border-[var(--rule)] bg-[var(--canvas)] rounded-[4px] px-3 py-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={1.75} />
          <div className="flex flex-col gap-1">
            <p className="text-[12.5px] font-medium text-[var(--fg)]">
              {language === 'en' ? 'Data Information:' : 'Informasi Data:'}
            </p>
            <p className="text-[11.5px] leading-[1.6] text-[var(--fg-dim)]">
              {language === 'en'
                ? 'Downloaded data includes Ticket Number, Reporter Identity (Name, Unit, Email), Issue Category, Priority, Last Status, and Handling Time Details (Response Time, Resolution Time).'
                : <>Data yang diunduh mencakup Nomor Tiket, Identitas Pelapor
              (Nama, Unit, Email), Kategori Masalah, Prioritas,
              Status Terakhir, dan Detail Waktu Penanganan (Response
              Time, Resolution Time).</>}
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-[var(--rule)] pt-4">
          <button
            type="button"
            onClick={handleExport}
            className="h-9 inline-flex items-center gap-1.5 rounded-[4px] bg-[var(--accent)] px-3 text-[12px] font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
            style={{
              cursor: isExporting ? "not-allowed" : "pointer",
              opacity: isExporting ? 0.7 : 1
            }}
          >
            <Download className="h-4 w-4" strokeWidth={1.75} />
            {isExporting ? t('reports.processing') : t('reports.download_excel')}
          </button>
        </div>
      </div>
    </div>
  );
}

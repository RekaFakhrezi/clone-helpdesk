'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface TablePaginationProps {
  page: number;
  perPage: number;
  total: number;
  onPage: (page: number) => void;
  onPerPage: (perPage: number) => void;
  /** Pilihan ukuran halaman, default 8/10/15/25/50. */
  options?: number[];
}

/**
 * Footer pagination standar untuk semua tabel dashboard:
 * pemilih jumlah per halaman, teks rentang, tombol prev/next dan nomor halaman.
 */
export default function TablePagination({
  page,
  perPage,
  total,
  onPage,
  onPerPage,
  options = [8, 10, 15, 25, 50],
}: TablePaginationProps) {
  const { t } = useLanguage();
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (current - 1) * perPage + 1;
  const to = Math.min(current * perPage, total);

  const numberButton = (n: number) => (
    <button
      key={n}
      type="button"
      onClick={() => onPage(n)}
      className={`cursor-pointer rounded w-8 h-8 flex items-center justify-center font-semibold text-xs ${
        current === n ? 'bg-[#1E3A8A] text-white' : 'hover:bg-gray-100 text-black'
      }`}
    >
      {n}
    </button>
  );

  return (
    <div className="flex flex-col sm:flex-row py-4 px-6 justify-between items-center border-t border-t-[#C3C6D1] bg-[#FFF] w-full mt-auto gap-4">
      <div className="flex items-center gap-2">
        <select
          value={perPage}
          onChange={(e) => {
            onPerPage(Number(e.target.value));
            onPage(1);
          }}
          className="text-[13px] border border-[#C3C6D1] rounded px-2 py-1 outline-none focus:border-[#1E3A8A] text-[#1A1C1E]"
        >
          {options.map((n) => (
            <option key={n} value={n}>
              {n} / {t('tickets.per_page', 'page')}
            </option>
          ))}
        </select>
        <p className="text-[#1A1C1E] font-iBMPlexSans text-[13px]">
          {t('tickets.showing', 'Showing')} {from} - {to} {t('tickets.of', 'of')} {total} {t('tickets.tickets_count', 'tickets')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(Math.max(1, current - 1))}
          disabled={current === 1}
          className={`flex justify-center items-center rounded border border-[#C3C6D1] w-8 h-8 ${
            current === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
          }`}
        >
          <svg width="7" height="10" viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10L0 5L5 0L6.16667 1.16667L2.33333 5L6.16667 8.83333L5 10Z" fill="black" />
          </svg>
        </button>

        {numberButton(1)}
        {totalPages > 1 && numberButton(2)}
        {totalPages > 2 && numberButton(3)}
        {totalPages > 4 && <span className="px-1 text-base">...</span>}
        {totalPages > 3 && numberButton(totalPages)}

        <button
          type="button"
          onClick={() => onPage(Math.min(totalPages, current + 1))}
          disabled={current === totalPages}
          className={`flex justify-center items-center rounded border border-[#C3C6D1] w-8 h-8 ${
            current === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
          }`}
        >
          <svg width="7" height="10" viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.83333 5L0 1.16667L1.16667 0L6.16667 5L1.16667 10L0 8.83333L3.83333 5Z" fill="black" />
          </svg>
        </button>
      </div>
    </div>
  );
}

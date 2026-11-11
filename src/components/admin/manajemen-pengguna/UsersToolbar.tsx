'use client';
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface UsersToolbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onFilterClick?: () => void;
  onResetFilterClick?: () => void;
  onAddClick?: () => void;
  selectedCount?: number;
  onBulkDeleteClick?: () => void;
  onExportClick?: () => void;
}

export default function UsersToolbar({
  searchQuery = '',
  onSearchChange,
  onFilterClick,
  onResetFilterClick,
  onExportClick,
  onAddClick,
  selectedCount = 0,
  onBulkDeleteClick,
}: UsersToolbarProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
      {/* Search Bar & Bulk Actions */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder={t('users.search_placeholder', 'Cari nama atau NIM/NIP pelapor...')}
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9 pr-4 py-2 text-[12.5px] border border-[var(--rule-strong)] rounded-[4px] bg-transparent text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:outline-none focus:border-[var(--accent)] w-full transition-colors"
          />
          <svg className="w-4 h-4 absolute left-3 top-2.5 text-[var(--fg-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>

        <div className="w-px h-6 bg-[var(--rule)] mx-2"></div>

        <div className="flex gap-1 items-center">
          {/* Delete Button */}
          <button onClick={onBulkDeleteClick} className="h-9 w-9 inline-flex items-center justify-center rounded-[4px] border border-[var(--rule-strong)] text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--danger)]" title="Delete">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>

        {selectedCount > 0 && (
          <span className="ml-1 inline-flex items-center rounded-[3px] border border-[var(--rule)] bg-[var(--canvas)] px-2 py-1 text-[11px] font-medium tabular-nums text-[var(--accent)]">{selectedCount} {t('tickets.selected', 'selected')}</span>
        )}
      </div>

      {/* Tombol aksi dengan shrink-0 agar tidak bisa digeser/wrap */}
      <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
        <button onClick={onResetFilterClick} title="Reset Filter" className="h-9 px-3 rounded-[4px] border border-[var(--rule-strong)] text-[12px] font-medium text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)]">
          {t('common.reset', 'Reset')}
        </button>
        <button onClick={onFilterClick} className="flex h-9 px-3 items-center gap-1.5 rounded-[4px] border border-[var(--rule-strong)] text-[12px] font-medium text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)]">
          <svg width="16" height="16" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 12V10H11V12H7ZM3 7V5H15V7H3ZM0 2V0H18V2H0Z" fill="currentColor"/></svg>
          {t('tickets.advanced_filter', 'Advanced')}
        </button>
        <button onClick={onExportClick} className="flex h-9 px-3 items-center gap-1.5 rounded-[4px] border border-[var(--rule-strong)] text-[12px] font-medium text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 12L3 7L4.4 5.55L7 8.15V0H9V8.15L11.6 5.55L13 7L8 12ZM2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14V11H2V14H14V11H16V14C16 14.55 15.8042 15.0208 15.4125 15.4125C15.0208 15.8042 14.55 16 14 16H2Z" fill="currentColor"/></svg>
          {t('tickets.export_csv', 'Export CSV')}
        </button>
        <button onClick={onAddClick} title="Tambah Pelapor" className="flex h-9 px-3 items-center gap-1.5 rounded-[4px] bg-[var(--accent)] text-white text-[12px] font-medium transition-colors hover:bg-[var(--accent-hover)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          {t('users.add_reporter', 'Tambah Pelapor')}
        </button>
      </div>
    </div>
  );
}

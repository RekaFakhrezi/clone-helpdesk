'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export type TabFilter = 'all' | 'my_tickets' | 'waiting_verification' | 'open' | 'in_progress' | 'resolved' | 'rejected' | 'deleted';

interface TicketCounts {
  all: number;
  myTickets: number;
  open: number;
  inProgress: number;
  waitingVerification: number;
  resolved: number;
  rejected: number;
  deleted: number;
}

interface TicketToolbarProps {
  activeTab?: TabFilter;
  onTabChange?: (tab: TabFilter) => void;
  counts?: TicketCounts;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onExportCsv?: () => void;
  onOpenFilters?: () => void;
  onNewTicket?: () => void;
  selectedCount?: number;
  categories?: {id: string | number, name: string}[];
  selectedCategory?: string;
  onCategoryChange?: (catId: string) => void;
}

const DEFAULT_COUNTS: TicketCounts = {
  all: 248,
  myTickets: 0,
  waitingVerification: 8,
  open: 12,
  inProgress: 45,
  resolved: 156,
  rejected: 5,
  deleted: 0,
};

export default function TicketToolbar({
  activeTab = 'all',
  onTabChange,
  counts = DEFAULT_COUNTS,
  searchQuery = '',
  onSearchChange,
  onExportCsv,
  onOpenFilters,
  onNewTicket,
  selectedCount = 0,
  onBulkAction,
  categories = [],
  selectedCategory = '',
  onCategoryChange,
}: TicketToolbarProps & { onBulkAction?: (action: string) => void }) {
  const { t } = useLanguage();
  const [showCategoryPopup, setShowCategoryPopup] = React.useState(false);

  const handleTabClick = (tab: TabFilter) => {
    if (onTabChange) onTabChange(tab);
  };

  const handleBulkAction = (action: string) => {
    if (onBulkAction) {
      onBulkAction(action);
    }
  };

  const getBtnClass = (tab: TabFilter) => 
    `cursor-pointer whitespace-nowrap flex items-center gap-1.5 px-3 py-2.5 border-b -mb-px text-[12.5px] transition-colors ${
      activeTab === tab
        ? 'border-[var(--accent)] text-[var(--fg)] font-medium'
        : 'border-transparent text-[var(--fg-dim)] hover:text-[var(--fg)]'
    }`;

  const countClass = 'tabular-nums text-[11px] text-[var(--fg-faint)]';

  return (
    <div className="flex flex-col gap-4 w-full">
      
      {/* Top Row: Search, Bulk Actions, Filters, Export, New */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
        {/* Kiri: Search & Bulk Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative">
            <input 
              type="text" 
              placeholder={t('tickets.search_placeholder', 'Search tickets...')} 
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9 pr-4 py-2 text-[12.5px] border border-[var(--rule-strong)] rounded-[4px] bg-transparent text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:outline-none focus:border-[var(--accent)] w-full md:w-64 transition-colors"
            />
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-[var(--fg-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          <div className="w-px h-6 bg-[var(--rule)] mx-2"></div>

          {/* Bulk Actions */}
          <div className="flex gap-1 items-center">
            <button onClick={() => handleBulkAction('Change Status')} className="h-9 w-9 inline-flex items-center justify-center rounded-[4px] border border-[var(--rule-strong)] text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)]" title="Change Status">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
            </button>
            <button onClick={() => handleBulkAction('Delete')} className="h-9 w-9 inline-flex items-center justify-center rounded-[4px] border border-[var(--rule-strong)] text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--danger)]" title="Delete">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>

            <div className="w-px h-6 bg-[var(--rule)] mx-1"></div>

            {/* Category Dropdown */}
            <div className="relative">
                <button 
                    onClick={() => setShowCategoryPopup(!showCategoryPopup)}
                    className={`flex h-9 px-3 items-center gap-1.5 rounded-[4px] border border-[var(--rule-strong)] text-[12px] font-medium transition-colors ${showCategoryPopup || selectedCategory ? 'bg-[var(--canvas)] text-[var(--fg)]' : 'text-[var(--fg-dim)] hover:bg-[var(--canvas)] hover:text-[var(--fg)]'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    <span className="max-w-[120px] truncate">
                        {selectedCategory ? categories.find(c => String(c.id) === selectedCategory)?.name || t('tickets.category_btn', 'Kategori') : t('tickets.category_btn', 'Kategori')}
                    </span>
                </button>
                
                {showCategoryPopup && (
                    <div className="absolute left-0 top-[42px] z-50 flex flex-col p-1 bg-[var(--surface)] border border-[var(--rule-strong)] rounded-[4px] shadow-[var(--shadow-pop)] w-max max-h-64 overflow-y-auto">
                        <div 
                            className={`px-3 py-2 text-[12.5px] rounded-[3px] cursor-pointer whitespace-nowrap transition-colors ${!selectedCategory ? 'bg-[var(--canvas)] text-[var(--accent)] font-medium' : 'text-[var(--fg-dim)] hover:bg-[var(--canvas)] hover:text-[var(--fg)]'}`}
                            onClick={() => { onCategoryChange?.(''); setShowCategoryPopup(false); }}
                        >
                            {t('tickets.all_categories', 'Semua Kategori')}
                        </div>
                        {categories.map((cat) => (
                            <div 
                                key={cat.id} 
                                className={`px-3 py-2 text-[12.5px] rounded-[3px] cursor-pointer whitespace-nowrap transition-colors ${selectedCategory === String(cat.id) ? 'bg-[var(--canvas)] text-[var(--accent)] font-medium' : 'text-[var(--fg-dim)] hover:bg-[var(--canvas)] hover:text-[var(--fg)]'}`}
                                onClick={() => { onCategoryChange?.(String(cat.id)); setShowCategoryPopup(false); }}
                            >
                                {cat.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
          {selectedCount > 0 && (
            <span className="ml-1 inline-flex items-center rounded-[3px] border border-[var(--rule)] bg-[var(--canvas)] px-2 py-1 text-[11px] font-medium tabular-nums text-[var(--accent)]">{selectedCount} {t('tickets.selected', 'dipilih')}</span>
          )}
        </div>

        {/* Kanan: Filters, Export, New */}
        <div className="flex items-center gap-2 w-full md:w-auto">

          <div onClick={() => onOpenFilters && onOpenFilters()} className="flex h-9 px-3 items-center gap-1.5 rounded-[4px] border border-[var(--rule-strong)] text-[12px] font-medium text-[var(--fg-dim)] cursor-pointer transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)]">
            <svg width="16" height="16" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.25 9V7.5H8.25V9H5.25ZM2.25 5.25V3.75H11.25V5.25H2.25ZM0 1.5V0H13.5V1.5H0Z" fill="currentColor" /></svg>
            <span>{t('tickets.advanced_filter', 'Lanjutan')}</span>
          </div>
          
          <button 
              onClick={() => { if (onSearchChange) onSearchChange(''); if (onCategoryChange) onCategoryChange(''); }}
              className="h-9 px-3 rounded-[4px] border border-[var(--rule-strong)] text-[12px] font-medium text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)]"
          >
              {t('common.reset', 'Reset')}
          </button>

          <div onClick={() => onExportCsv && onExportCsv()} className="flex h-9 px-3 items-center gap-1.5 rounded-[4px] border border-[var(--rule-strong)] text-[12px] font-medium text-[var(--fg-dim)] cursor-pointer transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)]">
            <svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L2.25 5.25L3.3 4.1625L5.25 6.1125V0H6.75V6.1125L8.7 4.1625L9.75 5.25L6 9ZM1.5 12C1.0875 12 0.734375 11.8531 0.440625 11.5594C0.146875 11.2656 0 10.9125 0 10.5V8.25H1.5V10.5H10.5V8.25H12V10.5C12 10.9125 11.8531 11.2656 11.5594 11.5594C11.2656 11.8531 10.9125 12 10.5 12H1.5Z" fill="currentColor" /></svg>
            <span>{t('tickets.export_csv', 'Ekspor CSV')}</span>
          </div>
          
          <div onClick={() => onNewTicket && onNewTicket()} className="flex h-9 px-3 items-center gap-1.5 rounded-[4px] bg-[var(--accent)] text-white text-[12px] font-medium cursor-pointer transition-colors hover:bg-[var(--accent-hover)]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
            <span>{t('tickets.create_ticket', 'Buat Tiket')}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Tabs */}
      <div className="flex items-end gap-1 border-b border-[var(--rule)] w-full overflow-x-auto">
        <button onClick={() => handleTabClick('all')} className={getBtnClass('all')}>
          <span>{t('tickets.tab_all', 'Semua Tiket')}</span>
          <span className={countClass}>({counts.all})</span>
        </button>
        <button onClick={() => handleTabClick('my_tickets')} className={getBtnClass('my_tickets')}>
          <span>{t('tickets.tab_my', 'Tugas Saya')}</span>
          <span className={countClass}>({counts.myTickets})</span>
        </button>
        <button onClick={() => handleTabClick('waiting_verification')} className={getBtnClass('waiting_verification')}>
          <span>{t('tickets.tab_waiting', 'Menunggu Verifikasi')}</span>
          <span className={countClass}>({counts.waitingVerification})</span>
        </button>
        <button onClick={() => handleTabClick('open')} className={getBtnClass('open')}>
          <span>{t('tickets.tab_open', 'Open')}</span>
          <span className={countClass}>({counts.open})</span>
        </button>
        <button onClick={() => handleTabClick('in_progress')} className={getBtnClass('in_progress')}>
          <span>{t('tickets.tab_in_progress', 'Diproses')}</span>
          <span className={countClass}>({counts.inProgress})</span>
        </button>
        <button onClick={() => handleTabClick('resolved')} className={getBtnClass('resolved')}>
          <span>{t('tickets.tab_resolved', 'Selesai')}</span>
          <span className={countClass}>({counts.resolved})</span>
        </button>
        <button onClick={() => handleTabClick('rejected')} className={getBtnClass('rejected')}>
          <span>{t('tickets.tab_rejected', 'Ditolak')}</span>
          <span className={countClass}>({counts.rejected})</span>
        </button>
        <button onClick={() => handleTabClick('deleted')} className={getBtnClass('deleted')}>
          <span>{t('tickets.tab_deleted', 'Dihapus')}</span>
          <span className={countClass}>({counts.deleted})</span>
        </button>
      </div>

    </div>
  );
}
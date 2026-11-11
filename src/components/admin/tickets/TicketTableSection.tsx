'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { translateTicketSubject } from '@/lib/translations';
import TablePagination from '@/components/ui/TablePagination';
import { formatTimeAgo } from '@/lib/format';
import { matchesTab } from '@/lib/ticketTabs';

export type TicketStatus = 'NEW' | 'IN PROGRESS' | 'WAITING VERIFICATION' | 'RESOLVED' | 'CLOSED';

interface TicketTableSectionProps {
  activeTab?: string;
  tickets?: any[];
  selectedTickets?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  filters?: {
    category: string;
    startDate: string;
    endDate: string;
    priority: string;
  };
  searchQuery?: string;
  categories?: any[];
  technicians?: any[];
  departments?: any[];
  onEditTicket?: (ticketId: string) => void;
  onAcceptTicket?: (ticketId: string) => void;
  onRejectTicket?: (ticketId: string) => void;
  currentUserId?: string;
}

export default function TicketTableSection({ activeTab = 'all', tickets = [], selectedTickets = [], onSelectionChange, filters, searchQuery = '', categories = [], technicians = [], departments = [], onEditTicket, onAcceptTicket, onRejectTicket, currentUserId }: TicketTableSectionProps) {
  const { t, language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [displayTickets, setDisplayTickets] = useState<any[]>([]);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    let filteredData = [...tickets];
    
    // 1. Filter by Status
    filteredData = filteredData.filter(t => matchesTab(t, activeTab, currentUserId));

    // 1.5 Filter by Advanced Filters
    if (filters) {
      if (filters.category) {
        filteredData = filteredData.filter(t => 
          String(t.category_id) === filters.category || 
          String(t.subcategory_id) === filters.category ||
          String(t.dept_id) === filters.category
        );
      }
      if (filters.priority) {
        filteredData = filteredData.filter(t => (t.priority || '').toUpperCase() === filters.priority.toUpperCase());
      }
      if (filters.startDate) {
        filteredData = filteredData.filter(t => new Date(t.created_at) >= new Date(filters.startDate));
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        filteredData = filteredData.filter(t => new Date(t.created_at) <= end);
      }
    }
    
    // 1.8 Filter by Search Query
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      filteredData = filteredData.filter(t => 
        (t.ticket_num && t.ticket_num.toLowerCase().includes(lowerQuery)) ||
        (t.ticketNumber && t.ticketNumber.toLowerCase().includes(lowerQuery)) ||
        (t.subject && t.subject.toLowerCase().includes(lowerQuery)) ||
        (t.reporter_name && t.reporter_name.toLowerCase().includes(lowerQuery))
      );
    }
    
    // 3. Sorting
    if (sortConfig) {
      filteredData.sort((a, b) => {
        let valA, valB;
        
        switch (sortConfig.key) {
          case 'ticket_num':
            valA = a.ticket_num || a.ticketNumber || '';
            valB = b.ticket_num || b.ticketNumber || '';
            break;
          case 'updated_at':
            valA = new Date(a.updated_at || a.created_at).getTime();
            valB = new Date(b.updated_at || b.created_at).getTime();
            break;
          case 'subject':
            valA = (a.subject || '').toLowerCase();
            valB = (b.subject || '').toLowerCase();
            break;
          case 'reporter_name':
            valA = (a.reporter_name || '').toLowerCase();
            valB = (b.reporter_name || '').toLowerCase();
            break;
          case 'priority':
            const prioRank: Record<string, number> = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            valA = prioRank[(a.priority || 'MEDIUM').toUpperCase()] || 0;
            valB = prioRank[(b.priority || 'MEDIUM').toUpperCase()] || 0;
            break;
          default:
            return 0;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setDisplayTickets(filteredData);
    setCurrentPage(1); // Reset ke halaman 1 tiap kali data/sort/tab berubah
  }, [activeTab, tickets, sortConfig]);

  const totalItems = displayTickets.length;

  // Data untuk halaman saat ini
  const paginatedTickets = displayTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      if (e.target.checked) {
        onSelectionChange(paginatedTickets.map(t => t.id));
      } else {
        onSelectionChange([]);
      }
    }
  };

  const handleSelectRow = (ticketId: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedTickets, ticketId]);
      } else {
        onSelectionChange(selectedTickets.filter(id => id !== ticketId));
      }
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderPriorityBadge = (priority: string) => {
    const p = (priority || 'MEDIUM').toUpperCase();
    let bg = 'bg-[#E2E2E5]';
    let text = 'text-[#43474F]';
    
    if (p === 'CRITICAL') { bg = 'bg-[#FFDAD6]'; text = 'text-[#93000A]'; }
    if (p === 'HIGH') { bg = 'bg-[#FEF1D8]'; text = 'text-[#7D5100]'; }

    return (
      <div className={`flex py-0.5 px-2 items-center rounded-sm ${bg} w-fit`}>
        <p className={`${text} font-iBMPlexSans text-[11px] font-bold leading-5 w-fit tracking-[0.025em]`}>
          {language === 'en'
            ? p
            : ({ URGENT: 'MENDESAK', CRITICAL: 'KRITIS', HIGH: 'TINGGI', MEDIUM: 'SEDANG', LOW: 'RENDAH' } as Record<string, string>)[p] || p}
        </p>
      </div>
    );
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    const isActive = sortConfig?.key === columnKey;
    const isAsc = isActive && sortConfig?.direction === 'asc';
    
    return (
      <svg className={`w-3 h-3 ml-1 transition-transform ${isActive ? 'text-[#0059BB]' : 'text-gray-400'} ${isAsc ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
      </svg>
    );
  };

  return (
    <div className="flex flex-col rounded-lg border border-[#C3C6D1] bg-[#FFF] shadow-sm w-full overflow-hidden">
      <div className="w-full overflow-x-auto min-h-[400px]">
        <table className="w-full text-left table-auto">
          <thead className="bg-[#F3F3F6] border-b border-[#C3C6D1]">
            <tr>
              <th className="px-4 py-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 w-4 h-4 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                  checked={paginatedTickets.length > 0 && selectedTickets.length === paginatedTickets.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-4 select-none hover:bg-gray-200 transition-colors cursor-pointer" onClick={() => handleSort('ticket_num')}>
                <div className="flex items-center group">
                  <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_ticket_num', 'NO. TIKET')}</span>
                  <SortIcon columnKey="ticket_num" />
                </div>
              </th>
              <th className="px-4 py-4 select-none hover:bg-gray-200 transition-colors cursor-pointer" onClick={() => handleSort('updated_at')}>
                <div className="flex items-center group">
                  <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_last_update', 'LAST UPDATE')}</span>
                  <SortIcon columnKey="updated_at" />
                </div>
              </th>
              <th className="px-4 py-4 select-none hover:bg-gray-200 transition-colors cursor-pointer" onClick={() => handleSort('subject')}>
                <div className="flex items-center group">
                  <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_subject', 'SUBJECT')}</span>
                  <SortIcon columnKey="subject" />
                </div>
              </th>
              <th className="px-4 py-4 select-none hover:bg-gray-200 transition-colors cursor-pointer" onClick={() => handleSort('reporter_name')}>
                <div className="flex items-center group">
                  <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_from', 'FROM')}</span>
                  <SortIcon columnKey="reporter_name" />
                </div>
              </th>
              <th className="px-4 py-4 select-none">
                <div className="flex items-center group">
                  <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_category', 'KATEGORI')}</span>
                </div>
              </th>
              <th className="px-4 py-4 select-none hover:bg-gray-200 transition-colors cursor-pointer" onClick={() => handleSort('priority')}>
                <div className="flex items-center group">
                  <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_priority', 'PRIORITY')}</span>
                  <SortIcon columnKey="priority" />
                </div>
              </th>
              <th className="px-4 py-4 select-none">
                <div className="flex items-center group">
                  <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_assigned_to', 'ASSIGN TO')}</span>
                </div>
              </th>
              <th className="px-4 py-4 select-none w-20 text-center">
                <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_action', 'ACTION')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C3C6D1]">
            {paginatedTickets.length === 0 ? (
              <tr><td colSpan={9} className="py-10 text-center text-sm text-[#43474F]">{t('tickets.empty_filter', 'Tidak ada tiket pada filter ini.')}</td></tr>
            ) : (
              paginatedTickets.map((ticket, index) => (
                <tr key={ticket.id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 1 ? 'bg-[#F9F9FC]' : ''}`}>
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 w-4 h-4 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                      checked={selectedTickets.includes(ticket.id)}
                      onChange={(e) => handleSelectRow(ticket.id, e.target.checked)}
                    />
                  </td>
                  <td className="px-4 py-4 text-[#1E3A8A] font-liberationSerif text-sm font-semibold whitespace-nowrap">
                    <Link href={`/dashboard/administrasi/tickets/${ticket.id}`} className="hover:underline">
                      {ticket.ticket_num || ticket.ticketNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-[#43474F] font-iBMPlexSans text-sm whitespace-nowrap">
                    {formatTimeAgo(ticket.updated_at || ticket.created_at, language)}
                  </td>
                  <td className="px-4 py-4 max-w-xs">
                    <Link href={`/dashboard/administrasi/tickets/${ticket.id}`} className="block">
                      <p className="text-[#1A1C1E] font-iBMPlexSans text-sm font-medium truncate mb-0.5 hover:text-[#1E3A8A]">
                        {translateTicketSubject((ticket.subject || '').replace(/\s*>\s*/g, ' / '), language)}
                      </p>
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#1A1C1E] font-iBMPlexSans text-sm truncate max-w-[120px]">
                        {ticket.reporter_name || 'Unknown User'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-[#43474F] font-iBMPlexSans text-[13px] font-medium truncate max-w-[160px] block">
                      {categories.find(c => String(c.id) === String(ticket.category_id))?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {renderPriorityBadge(ticket.priority)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-[#43474F] font-iBMPlexSans text-[13px] font-medium truncate max-w-[120px] block">
                      {ticket.dept_id
                        ? (ticket.department?.name || departments.find(d => String(d.id) === String(ticket.dept_id))?.name || 'Department')
                        : ticket.tech_id
                        ? (ticket.tech?.name || technicians.find(t => String(t.id) === String(ticket.tech_id))?.name || '-')
                        : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {ticket.status === 'WAITING VERIFICATION' && (
                        <>
                          <button 
                            onClick={() => onAcceptTicket && onAcceptTicket(ticket.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors inline-flex" 
                            title="Terima Tiket"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          </button>
                          <button 
                            onClick={() => onRejectTicket && onRejectTicket(ticket.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors inline-flex" 
                            title="Tolak Tiket"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => onEditTicket && onEditTicket(ticket.id)}
                        className="p-1.5 text-[#1E3A8A] hover:bg-slate-100 rounded transition-colors inline-flex" 
                        title="Edit Ticket"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        page={currentPage}
        perPage={itemsPerPage}
        total={totalItems}
        onPage={setCurrentPage}
        onPerPage={setItemsPerPage}
      />
    </div>
  );
}
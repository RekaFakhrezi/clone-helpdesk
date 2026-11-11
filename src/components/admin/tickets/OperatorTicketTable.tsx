'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchClient } from '@/lib/apiClient';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { translateCategoryName, translateTicketSubject } from '@/lib/translations';
import TablePagination from '@/components/ui/TablePagination';
import Toast, { useToast } from '@/components/ui/Toast';
import { downloadCsv } from '@/lib/download';
import { formatTimeAgo } from '@/lib/format';

type Ticket = any; // simplified for this example
type Category = { id: string | number, name: string };
type Department = { id: string | number, name: string };
type Technician = { id: string, name: string };

export default function OperatorTicketTable({
    initialTickets,
    categories,
    mainCategories,
    departments,
    technicians,
    actionType = 'verify',
    assignToType,
    tabsNode,
    currentUserId
}: {
    initialTickets: Ticket[],
    categories: Category[],
    mainCategories: Category[],
    departments: Department[],
    technicians?: Technician[],
    actionType?: 'verify' | 'rollback' | 'readonly' | 'resolve',
    assignToType?: 'dept' | 'tech' | 'resolver',
    tabsNode?: React.ReactNode,
    currentUserId?: string
}) {
    const { t, language } = useLanguage();
    const router = useRouter();
    // Local state for tickets to support optimistic updates
    const [tickets, setTickets] = useState<Ticket[]>(initialTickets);

    // Sync state when server data changes
    useEffect(() => {
        setTickets(initialTickets);
    }, [initialTickets]);
    // States for filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showCategoryPopup, setShowCategoryPopup] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);

    // Bulk action state
    const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
    const [isBulkRejecting, setIsBulkRejecting] = useState(false);

    // States for sorting
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'priority', direction: 'desc' });

    // Toast notification
    const { toast, showToast } = useToast();

    // Action handler for Terima / Tolak / Rollback / Resolve
    const handleTicketAction = async (ticketId: string, ticketNum: string, action: 'accept' | 'reject' | 'rollback' | 'resolve') => {
        try {
            const ticket = tickets.find(t => t.id === ticketId);
            if (!ticket) return;

            // Validasi khusus untuk aksi "Terima"
            if (action === 'accept') {
                if (!ticket.category_id) {
                    showToast('Kategori wajib dipilih sebelum menerima tiket!', 'error');
                    return;
                }
            }

            // Optimistic update: remove ticket from the current view
            setTickets(prev => prev.filter(t => t.id !== ticketId));

            const newStatus = action === 'accept' ? 'Open' : action === 'reject' ? 'REJECTED' : action === 'resolve' ? 'RESOLVED' : 'WAITING VERIFICATION';
            
            const payload: any = { status: newStatus };
            if (action === 'accept') {
                payload.tech_id = currentUserId;
                payload.category_id = ticket.category_id;
            }

            // Backend call to ensure auto-notif logic fires
            await fetchClient(`/admin/tickets/${ticketId}`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });

            // Log action is also handled by backend if we use it, but our backend might not log REJECT_TICKET specifically.
            // But it's fine to keep the manual log here for UI completeness:
            await supabase.from('ticket_logs').insert({
                ticket_id: ticketId,
                action: action === 'accept' ? 'CHANGE_STATUS' : action === 'reject' ? 'REJECT_TICKET' : action === 'resolve' ? 'RESOLVE_TICKET' : 'ROLLBACK_TICKET',
                notes: `Status changed to ${newStatus}`
            });

            const actionText = action === 'accept' ? 'terima' : action === 'reject' ? 'tolak' : action === 'resolve' ? 'selesaikan' : 'rollback';
            const toastType = action === 'reject' ? 'error' : 'success';
            
            showToast(`Tiket ${ticketNum} berhasil di${actionText}.`, toastType);
            router.refresh();
        } catch (err) {
            console.error('Error ticket action:', err);
            showToast('Gagal memproses tiket.', 'error');
        }
    };

    // Inline update handler
    const handleInlineUpdate = async (ticketId: string, field: string, value: any) => {
        // Optimistic UI update
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, [field]: value } : t));
        
        try {
            const { error } = await supabase
                .from('tickets')
                .update({ [field]: value })
                .eq('id', ticketId);
            
            if (error) {
                console.error(`Error updating ${field}:`, error);
                alert(`Gagal memperbarui ${field}`);
                // Revert state (in a real app you'd fetch or store previous state)
            }
        } catch (err) {
            console.error('Update error:', err);
        }
    };

    // Sorting handler
    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Bulk actions
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTickets(processedTickets.map(t => t.id));
        } else {
            setSelectedTickets([]);
        }
    };

    const handleSelect = (id: string) => {
        if (selectedTickets.includes(id)) {
            setSelectedTickets(selectedTickets.filter(tId => tId !== id));
        } else {
            setSelectedTickets([...selectedTickets, id]);
        }
    };

    const handleBulkAction = async (type: 'default' | 'delete' = 'default') => {
        if (selectedTickets.length === 0) return;

        setIsBulkRejecting(true);
        try {
            const isRollback = actionType === 'rollback' && type === 'default';
            const isDelete = actionType === 'rollback' && type === 'delete';
            const newStatus = isRollback ? 'Open' : 'Ditolak';
            
            const promises = selectedTickets.map(async (ticketId) => {
                const ticket = tickets.find(t => t.id === ticketId);
                const ticketNum = ticket?.ticket_num ? (ticket.ticket_num.match(/\\d+$/)?.[0].padStart(6, '0') || ticket.ticket_num) : ticketId;

                if (isDelete) {
                    const { error } = await supabase.from('tickets').update({ status: 'DELETED' }).eq('id', ticketId);
                    if (error) throw error;
                    showToast(`Tiket ${ticketNum} berhasil dihapus.`, 'success');
                } else {
                    const { error } = await supabase
                        .from('tickets')
                        .update({ status: newStatus })
                        .eq('id', ticketId);

                    if (error) throw error;

                    await supabase.from('ticket_logs').insert({
                        ticket_id: ticketId,
                        action: isRollback ? 'ROLLBACK_TICKET' : 'REJECT_TICKET'
                    });

                    showToast(`Tiket ${ticketNum} berhasil di${isRollback ? 'rollback' : 'tolak'}.`, isRollback ? 'success' : 'error');
                }
                
                return ticketId;
            });

            await Promise.all(promises);
            
            // Optimistic update
            setTickets(prev => prev.filter(t => !selectedTickets.includes(t.id)));
            router.refresh();
        } catch (error) {
            console.error('Bulk action error:', error);
            showToast('Terjadi kesalahan saat memproses bulk action.', 'error');
        } finally {
            setIsBulkRejecting(false);
            setSelectedTickets([]);
        }
    };

    const handleExportCSV = () => {
        if (processedTickets.length === 0) {
            alert('Tidak ada data untuk diekspor.');
            return;
        }

        const headers = ['No. Tiket', 'Waktu Masuk', 'Subjek', 'Status', 'Pelapor', 'Unit/Fakultas', 'Kategori', 'Overdue'];
        
        const rows = processedTickets.map(t => [
            t.ticket_num,
            new Date(t.created_at).toLocaleString('id-ID'),
            `"${(t.subject || t.category?.name || 'Tanpa Subjek').replace(/"/g, '""')}"`,
            `"${(t.reporter_name || '').replace(/"/g, '""')}"`,
            `"${(t.unit || '').replace(/"/g, '""')}"`,
            `"${(t.category?.name || '').replace(/"/g, '""')}"`,
            t.is_overdue ? 'Ya' : 'Tidak'
        ]);

        downloadCsv([headers, ...rows], `export_tiket_operator_${new Date().toISOString().split('T')[0]}.csv`);
    };

    // Filter and Sort Logic
    const processedTickets = useMemo(() => {
        let filtered = [...tickets];

        // 1. Search filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(t => 
                t.ticket_num?.toLowerCase().includes(lowerQuery) ||
                t.subject?.toLowerCase().includes(lowerQuery) ||
                t.reporter_name?.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Category filter
        if (selectedCategory) {
            filtered = filtered.filter(t => t.category_id === selectedCategory);
        }

        // 3. Date Range filter
        if (startDate) {
            filtered = filtered.filter(t => new Date(t.created_at) >= new Date(startDate));
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            filtered = filtered.filter(t => new Date(t.created_at) <= end);
        }

        // 4. Sorting
        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                if (sortConfig.key === 'priority') {
                    const pVal: Record<string, number> = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
                    const aP = pVal[(a.priority || 'MEDIUM').toUpperCase()] || 2;
                    const bP = pVal[(b.priority || 'MEDIUM').toUpperCase()] || 2;
                    
                    if (aP !== bP) {
                        return sortConfig.direction === 'asc' ? (aP - bP) : (bP - aP);
                    }
                    // Secondary sort by date (newest first)
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }

                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'reporter') aValue = a.reporter_name || '';
                if (sortConfig.key === 'reporter') bValue = b.reporter_name || '';
                if (sortConfig.key === 'subject') aValue = a.subject || a.category?.name || '';
                if (sortConfig.key === 'subject') bValue = b.subject || b.category?.name || '';

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        } else {
            // Default sort if no sortConfig (should fallback to date)
            filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        return filtered;
    }, [tickets, searchQuery, selectedCategory, startDate, endDate, sortConfig]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [processedTickets.length]);

    const totalItems = processedTickets.length;
    const paginatedTickets = processedTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getSortArrow = (key: string) => {
        const isActive = sortConfig?.key === key;
        const isAsc = isActive && sortConfig?.direction === 'asc';
        
        return (
          <svg className={`w-3 h-3 ml-1 transition-transform ${isActive ? 'text-[#0059BB]' : 'text-gray-400'} ${isAsc ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
          </svg>
        );
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
                                ? ({ URGENT: 'Urgent', CRITICAL: 'Critical', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' } as Record<string, string>)[p] || p
                                : ({ URGENT: 'MENDESAK', CRITICAL: 'KRITIS', HIGH: 'TINGGI', MEDIUM: 'SEDANG', LOW: 'RENDAH' } as Record<string, string>)[p] || p}
            </p>
          </div>
        );
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Toolbar (Terpisah dari Tabel) */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                {/* Kiri: Search & Bulk Actions & Reset */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder={t('tickets.search_placeholder', 'Search tickets...')} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-[#C3C6D1] rounded focus:outline-none focus:border-[#0059BB] w-full md:w-64"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>

                    <div className="w-px h-6 bg-gray-300 mx-2 hidden md:block"></div>

                    {/* Category Dropdown Button */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowCategoryPopup(!showCategoryPopup)}
                            className={`flex h-[38px] px-3.5 items-center gap-2 rounded border border-[#C3C6D1] bg-white cursor-pointer transition-colors ${showCategoryPopup || selectedCategory ? "bg-slate-50" : "hover:bg-slate-50"}`}
                        >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold leading-4 max-w-[120px] truncate">
                                {selectedCategory ? mainCategories.find(c => c.id === selectedCategory)?.name || t('tickets.category_btn', 'Kategori') : t('tickets.category_btn', 'Kategori')}
                            </span>
                        </button>
                        
                        {/* Category Popup */}
                        {showCategoryPopup && (
                            <div className="absolute left-0 top-[40px] z-50 flex flex-col p-2 bg-white border border-[#C3C6D1] rounded shadow-lg animate-in fade-in slide-in-from-top-2 w-max max-h-64 overflow-y-auto">
                                <div 
                                    className={`px-3 py-2 text-[13px] font-semibold rounded cursor-pointer whitespace-nowrap transition-colors ${!selectedCategory ? 'bg-[#F4F7FF] text-[#1E3A8A]' : 'text-slate-700 hover:bg-slate-50'}`}
                                    onClick={() => { setSelectedCategory(''); setShowCategoryPopup(false); }}
                                >
                                    {t('tickets.all_categories', 'All Categories')}
                                </div>
                                {mainCategories.map((cat) => (
                                    <div 
                                        key={cat.id} 
                                        className={`px-3 py-2 text-[13px] font-semibold rounded cursor-pointer whitespace-nowrap transition-colors ${selectedCategory === cat.id ? 'bg-[#F4F7FF] text-[#1E3A8A]' : 'text-slate-700 hover:bg-slate-50'}`}
                                        onClick={() => { setSelectedCategory(cat.id as string); setShowCategoryPopup(false); }}
                                    >
                                        {cat.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {selectedTickets.length > 0 && (
                        <>
                            <div className="w-px h-6 bg-gray-300 mx-1 hidden md:block"></div>
                            {actionType === 'rollback' && (
                                <button 
                                    onClick={() => handleBulkAction('delete')}
                                    disabled={isBulkRejecting}
                                    className="h-[38px] px-3.5 border border-red-200 rounded text-[13px] font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                    {isBulkRejecting ? t('operator.processing', 'Memproses...') : `${t('common.delete', 'Hapus')} (${selectedTickets.length})`}
                                </button>
                            )}
                            <button 
                                onClick={() => handleBulkAction('default')}
                                disabled={isBulkRejecting}
                                className={`h-[38px] px-3.5 border rounded text-[13px] font-medium transition-colors disabled:opacity-50 ${
                                    actionType === 'rollback' 
                                        ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-200' 
                                        : 'text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-200'
                                }`}
                            >
                                {isBulkRejecting ? t('operator.processing', 'Memproses...') : `${actionType === 'rollback' ? t('operator.rollback', 'Rollback') : t('operator.reject', 'Tolak')} (${selectedTickets.length})`}
                            </button>
                        </>
                    )}
                </div>

                {/* Kanan: Advanced, Reset, Export */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative">
                        <button 
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={`flex h-[38px] px-3.5 items-center gap-2 rounded border border-[#C3C6D1] bg-white cursor-pointer transition-colors ${showAdvanced ? "bg-slate-50" : "hover:bg-slate-50"}`}
                        >
                            <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.25 9V7.5H8.25V9H5.25ZM2.25 5.25V3.75H11.25V5.25H2.25ZM0 1.5V0H13.5V1.5H0Z" fill="#43474F" /></svg>
                            <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold leading-4">{t('tickets.advanced_filter', 'Advanced')}</span>
                        </button>
                        
                        {/* Advanced Filter Popup */}
                        {showAdvanced && (
                            <div className="absolute left-0 top-[40px] z-50 flex flex-col gap-3 p-4 bg-white border border-[#C3C6D1] rounded shadow-lg animate-in fade-in slide-in-from-top-2 w-64">
                                <div className="text-[13px] font-semibold text-slate-700">{t('operator.filter_date', 'Filter by Date')}</div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] text-slate-500 uppercase font-bold">{t('operator.start_date', 'Start Date')}</label>
                                    <input 
                                        type="date" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="py-1.5 px-2 border border-[#C3C6D1] rounded text-[13px] outline-none focus:border-[#1E3A8A] w-full"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] text-slate-500 uppercase font-bold">{t('operator.end_date', 'End Date')}</label>
                                    <input 
                                        type="date" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="py-1.5 px-2 border border-[#C3C6D1] rounded text-[13px] outline-none focus:border-[#1E3A8A] w-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => { setStartDate(''); setEndDate(''); setSelectedCategory(''); }}
                        className="h-[38px] px-4 bg-white text-slate-600 border border-[#C3C6D1] text-[13px] font-medium rounded hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                        {t('common.reset', 'Reset')}
                    </button>
                    <div onClick={() => handleExportCSV()} className="flex h-[38px] px-3.5 items-center gap-2 rounded border border-[#C3C6D1] bg-[#FFF] cursor-pointer hover:bg-gray-50 transition-colors">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L2.25 5.25L3.3 4.1625L5.25 6.1125V0H6.75V6.1125L8.7 4.1625L9.75 5.25L6 9ZM1.5 12C1.0875 12 0.734375 11.8531 0.440625 11.5594C0.146875 11.2656 0 10.9125 0 10.5V8.25H1.5V10.5H10.5V8.25H12V10.5C12 10.9125 11.8531 11.2656 11.5594 11.5594C11.2656 11.8531 10.9125 12 10.5 12H1.5Z" fill="#43474F" /></svg>
                        <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold leading-4">{t('tickets.export_csv', 'Ekspor CSV')}</span>
                    </div>
                    
                    <div onClick={() => alert("Fitur pembuatan tiket akan dibuat!")} className="flex h-[38px] px-4 items-center gap-2 rounded bg-[#1E3A8A] shadow-[01px2px0rgba(0,0,0,0.05)] cursor-pointer hover:bg-blue-900 transition-colors">
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 6H0V4.5H4.5V0H6V4.5H10.5V6H6V10.5H4.5V6Z" fill="white" /></svg>
                        <span className="text-[#FFF] font-iBMPlexSans text-xs font-semibold leading-4">{t('tickets.create_ticket', 'Buat Tiket')}</span>
                    </div>
                </div>
            </div>

            {tabsNode && <div className="w-full">{tabsNode}</div>}

            {/* Table Container */}
            <div className="flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm w-full overflow-hidden">
                <div className="w-full overflow-x-auto min-h-[400px]">
                <table className="w-full text-left table-auto">
                    <thead className="bg-[#F3F3F6] border-b border-[#C3C6D1]">
                        <tr>
                            {actionType !== 'readonly' && (
                                <th className="px-4 py-4 w-12 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 w-4 h-4 text-[#0059BB] focus:ring-[#0059BB] cursor-pointer"
                                        checked={selectedTickets.length === processedTickets.length && processedTickets.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}
                            <th className="px-4 py-4 select-none hover:bg-gray-200 transition-colors cursor-pointer w-28" onClick={() => requestSort('ticket_num')}>
                                <div className="flex items-center group">
                                    <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_ticket_num', 'NO. TIKET')}</span>
                                    {getSortArrow('ticket_num')}
                                </div>
                            </th>
                            <th className="px-4 py-4 select-none hover:bg-gray-200 transition-colors cursor-pointer w-36" onClick={() => requestSort('created_at')}>
                                <div className="flex items-center group">
                                    <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_last_update', 'LAST UPDATE')}</span>
                                    {getSortArrow('created_at')}
                                </div>
                            </th>
                            <th className="px-4 py-4 select-none hover:bg-gray-200 transition-colors cursor-pointer" onClick={() => requestSort('subject')}>
                                <div className="flex items-center group">
                                    <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_subject', 'SUBJECT')}</span>
                                    {getSortArrow('subject')}
                                </div>
                            </th>
                            <th className="px-4 py-4 select-none hover:bg-gray-200 transition-colors cursor-pointer w-32" onClick={() => requestSort('reporter')}>
                                <div className="flex items-center group">
                                    <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_from', 'FROM')}</span>
                                    {getSortArrow('reporter')}
                                </div>
                            </th>
                            <th className="px-4 py-4 select-none w-48">
                                <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_category', 'CATEGORY')}</span>
                            </th>
                            <th className="px-4 py-4 select-none hover:bg-gray-200 transition-colors cursor-pointer w-32" onClick={() => requestSort('priority')}>
                                <div className="flex items-center group">
                                    <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_priority', 'PRIORITY')}</span>
                                    {getSortArrow('priority')}
                                </div>
                            </th>
                            <th className="px-4 py-4 select-none w-44">
                                <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_assigned_to', 'ASSIGN TO')}</span>
                            </th>
                            {actionType !== 'readonly' && (
                                <th className="px-4 py-4 select-none text-right w-40">
                                    <span className="text-[#43474F] font-iBMPlexSans text-xs font-semibold tracking-wider">{t('tickets.col_action', 'ACTION')}</span>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C3C6D1]">
                        {paginatedTickets.length === 0 ? (
                            <tr>
                                <td colSpan={actionType !== 'readonly' ? 9 : 8} className="text-center py-20 text-[#43474F] text-sm">
                                    {t('operator.no_tickets_filter', 'Tidak ada tiket yang sesuai dengan filter.')}
                                </td>
                            </tr>
                        ) : (
                            paginatedTickets.map((ticket, index) => {
                                const formattedTicketNum = ticket.ticket_num ? 
                                    (ticket.ticket_num.match(/\d+$/)?.[0].padStart(6, '0') || ticket.ticket_num) 
                                    : String(index + 1).padStart(6, '0');
                                const tNum = `#${formattedTicketNum}`;

                                return (
                                <tr key={ticket.id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 1 ? 'bg-[#F9F9FC]' : ''}`}>
                                    {actionType !== 'readonly' && (
                                        <td className="px-4 py-4 text-center w-12">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 w-4 h-4 text-[#0059BB] focus:ring-[#0059BB] cursor-pointer"
                                                checked={selectedTickets.includes(ticket.id)}
                                                onChange={() => handleSelect(ticket.id)}
                                            />
                                        </td>
                                    )}
                                    <td className="px-4 py-4 text-[#1E3A8A] font-liberationSerif text-sm font-semibold whitespace-nowrap">
                                        <Link href={`/dashboard/operator/tickets/${ticket.id}`} className="hover:underline">
                                            {tNum}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-4 text-[#43474F] font-iBMPlexSans text-sm whitespace-nowrap" suppressHydrationWarning>
                                        {formatTimeAgo(ticket.updated_at || ticket.created_at, language)}
                                    </td>
                                    <td className="px-4 py-4 max-w-xs">
                                        <Link href={`/dashboard/operator/tickets/${ticket.id}`} className="block">
                                            <p className="text-[#1A1C1E] font-iBMPlexSans text-sm font-medium truncate mb-0.5 hover:text-[#0059BB]">
                                                {translateCategoryName(translateTicketSubject((ticket.subject || ticket.category?.name || t('tickets.no_subject')).replace(/ > /g, ' / ').replace(/>/g, '/'), language), language)}
                                            </p>
                                        </Link>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#1A1C1E] font-iBMPlexSans text-sm truncate max-w-[120px]">
                                                {ticket.reporter_name || '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {actionType === 'verify' ? (
                                            <div className="relative w-[160px]">
                                                <select 
                                                    value={ticket.category_id?.toString() || ''}
                                                    onChange={(e) => handleInlineUpdate(ticket.id, 'category_id', e.target.value)}
                                                    className="w-full bg-white border border-[#C3C6D1] rounded pl-3 pr-8 py-1.5 text-xs text-slate-700 focus:border-[#0059BB] focus:ring-1 focus:ring-[#0059BB] outline-none cursor-pointer appearance-none hover:border-slate-300 transition-colors"
                                                >
                                                    <option value="">Kategori...</option>
                                                    {categories.map(c => (
                                                        <option key={c.id} value={c.id?.toString()}>{c.name}</option>
                                                    ))}
                                                </select>
                                                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <span className="text-[#43474F] font-iBMPlexSans text-[13px] font-medium truncate">{translateCategoryName(ticket.category?.name || 'N/A', language)}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {actionType === 'verify' ? (
                                            <div className="relative w-[110px]">
                                                <select 
                                                    value={ticket.priority?.toLowerCase() || ''}
                                                    onChange={(e) => handleInlineUpdate(ticket.id, 'priority', e.target.value)}
                                                    className="w-full bg-white border border-[#C3C6D1] rounded pl-3 pr-8 py-1.5 text-xs text-slate-700 focus:border-[#0059BB] focus:ring-1 focus:ring-[#0059BB] outline-none cursor-pointer appearance-none hover:border-slate-300 transition-colors"
                                                >
                                                    <option value="">Priority...</option>
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                    <option value="critical">Critical</option>
                                                </select>
                                                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        ) : (
                                            renderPriorityBadge(ticket.priority)
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {assignToType === 'dept' ? (
                                            <span className="text-[#43474F] font-iBMPlexSans text-[12px]">{ticket.department?.name || departments?.find(d => String(d.id) === String(ticket.dept_id))?.name || ticket.dept_id || '-'}</span>
                                        ) : assignToType === 'tech' ? (
                                            <span className="text-[#43474F] font-iBMPlexSans text-[12px]">{ticket.tech?.name || technicians?.find(t => String(t.id) === String(ticket.tech_id))?.name || ticket.tech_id || t('ticket_detail.not_assigned', 'Unassigned')}</span>
                                        ) : assignToType === 'resolver' ? (
                                            <span className="text-[#43474F] font-iBMPlexSans text-[12px]">{ticket.tech?.name || ticket.tech_id || 'System'}</span>
                                        ) : actionType === 'verify' ? (
                                            <span className="text-[#43474F] font-iBMPlexSans text-[12px] text-gray-400 italic">Otomatis ke Anda saat Diterima</span>
                                        ) : (
                                            <span className="text-[#43474F] font-iBMPlexSans text-[12px]">{ticket.department?.name || departments?.find(d => String(d.id) === String(ticket.dept_id))?.name || ticket.dept_id || '-'}</span>
                                        )}
                                    </td>
                                    {actionType !== 'readonly' && (
                                        <td className="px-4 py-4 text-right whitespace-nowrap">
                                            <div className="flex justify-end gap-2">
                                                {actionType === 'verify' ? (
                                                    <>
                                                        <button 
                                                            onClick={() => handleTicketAction(ticket.id, formattedTicketNum, 'accept')}
                                                            className="py-1.5 px-4 bg-white border border-[#1E3A8A] rounded text-xs font-semibold text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white transition-colors"
                                                        >
                                                            {t('operator.accept', 'Terima')}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleTicketAction(ticket.id, formattedTicketNum, 'reject')}
                                                            className="py-1.5 px-4 bg-white border border-[#1E3A8A] rounded text-xs font-semibold text-[#1E3A8A] hover:bg-slate-100 transition-colors"
                                                        >
                                                            {t('operator.reject', 'Tolak')}
                                                        </button>
                                                    </>
                                                ) : actionType === 'resolve' ? (
                                                    <button 
                                                        onClick={() => handleTicketAction(ticket.id, formattedTicketNum, 'resolve')}
                                                        className="py-1.5 px-4 bg-[#1E3A8A] border border-[#1E3A8A] rounded text-xs font-semibold text-white hover:bg-blue-900 transition-colors"
                                                    >
                                                        {t('operator.mark_resolved', 'Tandai Selesai')}
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleTicketAction(ticket.id, formattedTicketNum, 'rollback')}
                                                        className="py-1.5 px-4 bg-white border border-orange-500 rounded text-xs font-semibold text-orange-600 hover:bg-orange-100 transition-colors"
                                                    >
                                                        {t('operator.rollback', 'Rollback')}
                                                    </button>
                                                )}
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

            <TablePagination
                page={currentPage}
                perPage={itemsPerPage}
                total={totalItems}
                onPage={setCurrentPage}
                onPerPage={setItemsPerPage}
            />
        </div>

            <Toast toast={toast} />
        </div>
    );
}

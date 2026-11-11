'use client';

import React, { useState, useMemo } from 'react';
import OperatorTicketTable from '@/components/admin/tickets/OperatorTicketTable';
import { useLanguage } from '@/context/LanguageContext';

type Ticket = any;

interface OperatorTicketWorkspaceProps {
    tickets: Ticket[];
    departments: any[];
    categories: any[];
    mainCategories: any[];
    technicians: any[];
}

export default function OperatorTicketWorkspace({
    tickets,
    departments,
    categories,
    mainCategories,
    technicians,
}: OperatorTicketWorkspaceProps) {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'all' | 'my_tickets' | 'verification' | 'processing' | 'resolved' | 'rejected'>('all');
    const [currentUser, setCurrentUser] = React.useState<any>(null);

    React.useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setCurrentUser(JSON.parse(userStr));
            } catch (e) {
                console.error('Failed to parse user', e);
            }
        }
    }, []);

    const filteredTickets = useMemo(() => {
        switch (activeTab) {
            case 'my_tickets':
                return tickets.filter(t => t.tech_id === currentUser?.id && !['RESOLVED', 'CLOSED', 'RESOLVED_BY_SYSTEM', 'WAITING CONFIRMATION'].includes(t.status?.toUpperCase() || t.status));
            case 'verification':
                return tickets.filter(t => t.status === 'WAITING VERIFICATION');
            case 'processing':
                return tickets.filter(t => ['Open', 'NEW', 'IN PROGRESS', 'Diproses'].includes(t.status?.toUpperCase() || t.status));
            case 'resolved':
                return tickets.filter(t => ['RESOLVED', 'CLOSED', 'RESOLVED_BY_SYSTEM', 'WAITING CONFIRMATION'].includes(t.status?.toUpperCase() || t.status));
            case 'rejected':
                return tickets.filter(t => ['DITOLAK', 'REJECTED'].includes(t.status?.toUpperCase() || t.status));
            case 'all':
            default:
                return tickets;
        }
    }, [tickets, activeTab]);

    const getActionType = () => {
        if (activeTab === 'verification') return 'verify';
        if (activeTab === 'my_tickets') return 'resolve';
        if (activeTab === 'rejected') return 'rollback';
        return 'readonly';
    };

    return (
        <div className="flex flex-col items-start gap-6 w-full relative">
            {/* Header */}
            <div className="flex justify-between items-end w-full">
                <div className="flex flex-col items-start gap-1.5 w-fit">
                    <div className="flex items-center gap-1.5 w-full text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
                        <span className="w-fit">
                            {t('tickets.breadcrumb_dashboard', 'Dashboard')}
                        </span>
                        <span className="w-fit text-[var(--rule-strong)]">/</span>
                        <span className="w-fit text-[var(--fg-dim)]">
                            {t('tickets.breadcrumb_tickets', 'Tiket')}
                        </span>
                    </div>
                    <h1 className="text-[22px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg)] w-fit">
                        {t('tickets.page_title', 'Tiket')}
                    </h1>
                </div>
            </div>

            {/* Table Area */}
            <div className="w-full">
                <OperatorTicketTable
                    initialTickets={filteredTickets}
                    departments={departments}
                    categories={categories}
                    mainCategories={mainCategories}
                    technicians={technicians}
                    actionType={getActionType()}
                    assignToType={activeTab === 'verification' ? undefined : (activeTab === 'resolved' ? 'resolver' : 'tech')}
                    currentUserId={currentUser?.id}
                    tabsNode={
                        <div className="flex items-end gap-1 border-b border-[var(--rule)] w-full overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`cursor-pointer whitespace-nowrap flex items-center px-3 py-2.5 border-b -mb-px transition-colors ${
                                    activeTab === 'all'
                                        ? 'border-[var(--accent)]'
                                        : 'border-transparent hover:border-[var(--rule-strong)]'
                                }`}
                            >
                                <p className={`font-iBMPlexSans text-[12.5px] leading-5 w-fit transition-colors ${
                                    activeTab === 'all' ? 'text-[var(--fg)] font-medium' : 'text-[var(--fg-dim)]'
                                }`}>{t('tickets.tab_all', 'All Tickets')} ({tickets.length})</p>
                            </button>
                            <button
                                onClick={() => setActiveTab('my_tickets')}
                                className={`cursor-pointer whitespace-nowrap flex items-center px-3 py-2.5 border-b -mb-px transition-colors ${
                                    activeTab === 'my_tickets'
                                        ? 'border-[var(--accent)]'
                                        : 'border-transparent hover:border-[var(--rule-strong)]'
                                }`}
                            >
                                <p className={`font-iBMPlexSans text-[12.5px] leading-5 w-fit transition-colors ${
                                    activeTab === 'my_tickets' ? 'text-[var(--fg)] font-medium' : 'text-[var(--fg-dim)]'
                                }`}>{t('tickets.tab_my', 'My Tasks')} ({tickets.filter((t: any) => t.tech_id === currentUser?.id && !['RESOLVED', 'CLOSED', 'RESOLVED_BY_SYSTEM', 'WAITING CONFIRMATION'].includes(t.status?.toUpperCase() || t.status)).length})</p>
                            </button>
                            <button
                                onClick={() => setActiveTab('verification')}
                                className={`cursor-pointer whitespace-nowrap flex items-center px-3 py-2.5 border-b -mb-px transition-colors ${
                                    activeTab === 'verification'
                                        ? 'border-[var(--accent)]'
                                        : 'border-transparent hover:border-[var(--rule-strong)]'
                                }`}
                            >
                                <p className={`font-iBMPlexSans text-[12.5px] leading-5 w-fit transition-colors ${
                                    activeTab === 'verification' ? 'text-[var(--fg)] font-medium' : 'text-[var(--fg-dim)]'
                                }`}>{t('tickets.tab_waiting', 'Waiting Verification')} ({tickets.filter((t: any) => t.status === 'WAITING VERIFICATION').length})</p>
                            </button>
                            <button
                                onClick={() => setActiveTab('processing')}
                                className={`cursor-pointer whitespace-nowrap flex items-center px-3 py-2.5 border-b -mb-px transition-colors ${
                                    activeTab === 'processing'
                                        ? 'border-[var(--accent)]'
                                        : 'border-transparent hover:border-[var(--rule-strong)]'
                                }`}
                            >
                                <p className={`font-iBMPlexSans text-[12.5px] leading-5 w-fit transition-colors ${
                                    activeTab === 'processing' ? 'text-[var(--fg)] font-medium' : 'text-[var(--fg-dim)]'
                                }`}>{t('tickets.tab_in_progress', 'In Progress')} ({tickets.filter((t: any) => ['Open', 'NEW', 'IN PROGRESS', 'DIPROSES'].includes((t.status || '').toUpperCase())).length})</p>
                            </button>
                            <button
                                onClick={() => setActiveTab('resolved')}
                                className={`cursor-pointer whitespace-nowrap flex items-center px-3 py-2.5 border-b -mb-px transition-colors ${
                                    activeTab === 'resolved'
                                        ? 'border-[var(--accent)]'
                                        : 'border-transparent hover:border-[var(--rule-strong)]'
                                }`}
                            >
                                <p className={`font-iBMPlexSans text-[12.5px] leading-5 w-fit transition-colors ${
                                    activeTab === 'resolved' ? 'text-[var(--fg)] font-medium' : 'text-[var(--fg-dim)]'
                                }`}>{t('tickets.tab_resolved', 'Resolved')} ({tickets.filter((t: any) => ['RESOLVED', 'CLOSED', 'RESOLVED_BY_SYSTEM', 'WAITING CONFIRMATION'].includes(t.status?.toUpperCase() || t.status)).length})</p>
                            </button>
                            <button
                                onClick={() => setActiveTab('rejected')}
                                className={`cursor-pointer whitespace-nowrap flex items-center px-3 py-2.5 border-b -mb-px transition-colors ${
                                    activeTab === 'rejected'
                                        ? 'border-[var(--accent)]'
                                        : 'border-transparent hover:border-[var(--rule-strong)]'
                                }`}
                            >
                                <p className={`font-iBMPlexSans text-[12.5px] leading-5 w-fit transition-colors ${
                                    activeTab === 'rejected' ? 'text-[var(--fg)] font-medium' : 'text-[var(--fg-dim)]'
                                }`}>{t('tickets.tab_rejected', 'Rejected')} ({tickets.filter((t: any) => ['DITOLAK', 'REJECTED'].includes(t.status?.toUpperCase() || t.status)).length})</p>
                            </button>
                        </div>
                    }
                />
            </div>
        </div>
    );
}

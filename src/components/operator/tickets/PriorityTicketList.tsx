'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { translateCategoryName, translateTicketSubject } from '@/lib/translations';

type Ticket = any;

interface PriorityTicketListProps {
    tickets: Ticket[];
}

export default function PriorityTicketList({ tickets }: PriorityTicketListProps) {
    const { t, language } = useLanguage();

    // Filter hanya tiket yang masih berstatus WAITING VERIFICATION (Menunggu Verifikasi)
    const priorityTickets = tickets.filter(t => {
        return (t.status || '').toUpperCase() === 'WAITING VERIFICATION';
    }).slice(0, 8); // Ambil maksimal 8

    if (priorityTickets.length === 0) {
        return (
            <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[4px] p-10 text-center">
                <div className="w-10 h-10 bg-[var(--canvas)] border border-[var(--rule)] rounded-[4px] flex items-center justify-center mx-auto mb-4">
                    <svg className="w-4 h-4 text-[var(--ok)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-[13px] font-medium text-[var(--fg)] mb-1">{t('tickets.all_controlled')}</h3>
                <p className="text-[12px] text-[var(--fg-dim)]">{t('tickets.no_priority')}</p>
            </div>
        );
    }

    const renderPriorityBadge = (priority: string) => {
        const p = (priority || 'MEDIUM').toUpperCase();
        let colorClass = 'bg-[var(--canvas)] text-[var(--fg-dim)] border-[var(--rule)]';

        if (p === 'CRITICAL') { colorClass = 'bg-[rgba(179,33,27,.08)] text-[var(--danger)] border-[rgba(179,33,27,.18)]'; }
        if (p === 'HIGH') { colorClass = 'bg-[rgba(178,107,0,.08)] text-[var(--warn)] border-[rgba(178,107,0,.18)]'; }

        return (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[10.5px] font-medium border tracking-[0.02em] whitespace-nowrap ${colorClass}`}>
                {language === 'en'
                    ? ({ URGENT: 'Urgent', CRITICAL: 'Critical', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' } as Record<string, string>)[p] || p
                    : ({ URGENT: 'MENDESAK', CRITICAL: 'KRITIS', HIGH: 'TINGGI', MEDIUM: 'SEDANG', LOW: 'RENDAH' } as Record<string, string>)[p] || p}
            </span>
        );
    };

    const renderStatusBadge = (status: string) => {
        const normalized = (status || '').toUpperCase();
        const labels: Record<string, string> = language === 'en'
            ? {
                'WAITING VERIFICATION': 'Waiting Verification',
                REJECTED: 'Rejected',
                DITOLAK: 'Rejected',
                OPEN: 'Open',
                NEW: 'New',
                'IN PROGRESS': 'In Progress',
                DIPROSES: 'In Progress',
                RESOLVED: 'Resolved',
                CLOSED: 'Closed',
                'WAITING CONFIRMATION': 'Waiting Confirmation',
            }
            : {
                'WAITING VERIFICATION': 'Menunggu Verifikasi',
                REJECTED: 'Ditolak',
                DITOLAK: 'Ditolak',
                OPEN: 'Terbuka',
                NEW: 'Baru',
                'IN PROGRESS': 'Sedang Diproses',
                DIPROSES: 'Sedang Diproses',
                RESOLVED: 'Selesai',
                CLOSED: 'Ditutup',
                'WAITING CONFIRMATION': 'Menunggu Konfirmasi',
            };

        return labels[normalized] || status;
    };

    return (
        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[4px] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--rule)] flex justify-between items-center">
                <h2 className="text-[13px] font-medium text-[var(--fg)]">{t('tickets.need_quick_action')}</h2>
                <Link href="/dashboard/operator/tickets" className="text-[12px] font-medium text-[var(--fg-dim)] transition-colors hover:text-[var(--accent)]">
                    {t('tickets.view_all')}
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left table-auto">
                    <thead className="border-b border-[var(--rule)]">
                        <tr>
                            <th className="px-4 py-2.5 text-[10px] font-medium text-[var(--fg-faint)] uppercase tracking-[0.14em]">{t('tickets.ticket_no')}</th>
                            <th className="px-4 py-2.5 text-[10px] font-medium text-[var(--fg-faint)] uppercase tracking-[0.14em]">{t('tickets.subject')}</th>
                            <th className="px-4 py-2.5 text-[10px] font-medium text-[var(--fg-faint)] uppercase tracking-[0.14em]">{t('tickets.status')}</th>
                            <th className="px-4 py-2.5 text-[10px] font-medium text-[var(--fg-faint)] uppercase tracking-[0.14em]">{t('tickets.priority')}</th>
                            <th className="px-4 py-2.5 text-[10px] font-medium text-[var(--fg-faint)] uppercase tracking-[0.14em] text-right">{t('tickets.action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {priorityTickets.map((ticket, idx) => {
                            const formattedTicketNum = ticket.ticket_num ? 
                                (ticket.ticket_num.match(/\d+$/)?.[0].padStart(6, '0') || ticket.ticket_num) 
                                : String(idx + 1).padStart(6, '0');
                            const tNum = `#${formattedTicketNum}`;

                            return (
                                <tr key={ticket.id} className="border-b border-[var(--rule)] transition-colors hover:bg-[var(--canvas)]">
                                    <td className="px-4 py-3 tabular-nums text-[12px] font-medium text-[var(--accent)] whitespace-nowrap">
                                        <Link href={`/dashboard/operator/tickets/${ticket.id}`} className="hover:underline">
                                            {tNum}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-[12.5px] font-medium text-[var(--fg)] line-clamp-1">
                                            {translateCategoryName(translateTicketSubject(ticket.subject || ticket.category?.name || t('tickets.no_subject'), language), language)}
                                        </p>
                                        <p className="text-[11.5px] text-[var(--fg-faint)] mt-0.5">
                                            {t('tickets.from')}: {ticket.reporter_name || 'N/A'}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[10.5px] font-medium border ${
                                            ticket.status === 'WAITING VERIFICATION'
                                                ? 'bg-[rgba(178,107,0,.08)] text-[var(--warn)] border-[rgba(178,107,0,.18)]'
                                                : 'bg-[var(--canvas)] text-[var(--fg-dim)] border-[var(--rule)]'
                                        }`}>
                                            {renderStatusBadge(ticket.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {renderPriorityBadge(ticket.priority)}
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <Link 
                                            href={`/dashboard/operator/tickets/${ticket.id}`}
                                            className="inline-flex h-8 items-center px-3 rounded-[4px] border border-[var(--rule-strong)] text-[12px] font-medium text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--fg)]"
                                        >
                                            {ticket.status === 'WAITING VERIFICATION' ? t('tickets.verify', 'Verifikasi') : t('tickets.detail', 'Detail')}
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

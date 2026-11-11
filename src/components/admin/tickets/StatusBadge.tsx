import React from 'react';
import { TicketStatus } from '@/lib/mock/tickets';
import { useLanguage } from '@/context/LanguageContext';

interface StatusBadgeProps {
  status: TicketStatus;
  /** Tampilkan tag "OVERDUE" merah di bawah badge, sesuai desain Tickets Monitoring */
  overdue?: boolean;
}

export default function StatusBadge({ status, overdue = false }: StatusBadgeProps) {
  const { language } = useLanguage();
  let colorClass = '';
  let label: string = status;

  // NOTE: 'New' menggantikan status lama 'Open'. Update union type TicketStatus
  // di lib/mock/tickets.ts dari 'Open' menjadi 'New' agar tidak error di TypeScript.
  switch (status) {
    case 'New' as TicketStatus:
      colorClass = 'bg-[rgba(0,45,114,.07)] text-[var(--accent)] border-[rgba(0,45,114,.18)]';
      label = 'NEW';
      break;
    case 'In Progress':
      colorClass = 'bg-[rgba(178,107,0,.08)] text-[var(--warn)] border-[rgba(178,107,0,.18)]';
      label = 'IN PROGRESS';
      break;
    case 'Waiting':
      colorClass = 'bg-[var(--canvas)] text-[var(--fg-dim)] border-[var(--rule-strong)]';
      label = 'WAITING VERIFICATION';
      break;
    case 'Resolved':
      colorClass = 'bg-[rgba(15,123,79,.08)] text-[var(--ok)] border-[rgba(15,123,79,.18)]';
      label = 'RESOLVED';
      break;
    case 'Closed':
    default:
      colorClass = 'bg-[var(--canvas)] text-[var(--fg-faint)] border-[var(--rule)]';
      label = 'CLOSED';
      break;
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[10.5px] font-medium border tracking-[0.02em] whitespace-nowrap ${colorClass}`}>
          {language === 'en' ? label : ({ NEW: 'BARU', 'IN PROGRESS': 'DIPROSES', 'WAITING VERIFICATION': 'MENUNGGU VERIFIKASI', RESOLVED: 'SELESAI', CLOSED: 'DITUTUP' } as Record<string, string>)[label] || label}
      </span>
      {overdue && (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.007M4.322 19.5h15.356c1.42 0 2.309-1.523 1.6-2.755L13.6 4.245c-.71-1.233-2.49-1.233-3.2 0L2.72 16.745c-.71 1.232.18 2.755 1.601 2.755z" />
          </svg>
          {language === 'en' ? 'OVERDUE' : 'TERLAMBAT'}
        </span>
      )}
    </div>
  );
}
import React from 'react';
import { TicketPriority } from '@/lib/mock/tickets';
import { useLanguage } from '@/context/LanguageContext';

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { language } = useLanguage();
  let colorClass = '';

  switch (priority) {
    case 'Critical':
      colorClass = 'bg-[rgba(179,33,27,.08)] text-[var(--danger)] border-[rgba(179,33,27,.18)]';
      break;
    case 'High':
      colorClass = 'bg-[rgba(178,107,0,.08)] text-[var(--warn)] border-[rgba(178,107,0,.18)]';
      break;
    case 'Medium':
      colorClass = 'bg-[var(--canvas)] text-[var(--fg-dim)] border-[var(--rule-strong)]';
      break;
    case 'Low':
    default:
      colorClass = 'bg-[var(--canvas)] text-[var(--fg-faint)] border-[var(--rule)]';
      break;
  }

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[10.5px] font-medium border tracking-[0.02em] whitespace-nowrap ${colorClass}`}>
      {language === 'en'
        ? priority.toUpperCase()
        : ({ Urgent: 'MENDESAK', Critical: 'KRITIS', High: 'TINGGI', Medium: 'SEDANG', Low: 'RENDAH' } as Record<string, string>)[priority] || priority.toUpperCase()}
    </span>
  );
}
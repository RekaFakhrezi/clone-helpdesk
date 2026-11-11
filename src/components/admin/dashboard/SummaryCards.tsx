'use client';

import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { useLanguage } from '@/context/LanguageContext';

interface SummaryCardsProps {
  data?: {
    today: number;
    growth: string;
    open: number;
    overdue: number;
    failedMessages: number;
  };
}

/**
 * Strip metrik: satu pita dengan pembatas vertikal, bukan empat kartu.
 * Warna status hanya dipakai pada angka yang memang membawa makna.
 */
export default function SummaryCards({ data }: SummaryCardsProps) {
  const { t } = useLanguage();
  const d = data || { today: 0, growth: '0', open: 0, overdue: 0, failedMessages: 0 };

  const metrics = [
    {
      label: t('dashboard.today_tickets'),
      value: d.today,
      note: `${d.growth}% ${t('dashboard.vs_yesterday')}`,
      tone: 'text-[var(--fg)]',
    },
    {
      label: t('dashboard.open_tickets'),
      value: d.open,
      note: t('dashboard.needs_attention'),
      tone: 'text-[var(--warn)]',
    },
    {
      label: t('dashboard.overdue_sla'),
      value: d.overdue,
      note: t('dashboard.action_required'),
      tone: 'text-[var(--danger)]',
    },
    {
      label: t('dashboard.solved_by_system'),
      value: d.failedMessages,
      note: t('dashboard.auto_resolved'),
      tone: 'text-[var(--fg)]',
    },
  ];

  return (
    <div className="w-full border-y border-[var(--rule)] grid grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-300">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={[
            'py-5 lg:py-6 pr-4',
            index % 2 === 1 ? 'pl-4 lg:pl-6' : 'pl-0',
            index >= 2 ? 'max-lg:border-t max-lg:border-[var(--rule)]' : '',
            index > 0 ? 'lg:border-l lg:border-[var(--rule)] lg:pl-6' : '',
          ].join(' ')}
        >
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
            {metric.label}
          </div>
          <div className={`mt-2 text-[30px] leading-none font-medium tabular-nums ${metric.tone}`}>
            <AnimatedCounter value={metric.value} duration={900} />
          </div>
          <div className="mt-2 text-[11.5px] text-[var(--fg-dim)]">{metric.note}</div>
        </div>
      ))}
    </div>
  );
}

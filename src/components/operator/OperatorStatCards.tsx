'use client';

import React from 'react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { useLanguage } from '@/context/LanguageContext';

interface OperatorStatCardsProps {
  todayCount?: number;
  waitingVerificationCount?: number;
  systemResolvedCount?: number;
}

/**
 * Strip metrik operator: satu pita dengan pembatas vertikal, bukan tiga kartu.
 * Warna status hanya dipakai pada angka yang memang membawa makna.
 */
export default function OperatorStatCards({
  todayCount = 0,
  waitingVerificationCount = 0,
  systemResolvedCount = 0,
}: OperatorStatCardsProps) {
  const { t } = useLanguage();

  const metrics = [
    {
      label: t('operator.today_tickets'),
      value: todayCount,
      note: t('operator.today_tickets_desc'),
      tone: 'text-[var(--fg)]',
      duration: 900,
    },
    {
      label: t('operator.waiting_verification'),
      value: waitingVerificationCount,
      note: t('operator.waiting_verification_desc'),
      tone: 'text-[var(--warn)]',
      duration: 1100,
    },
    {
      label: t('operator.self_resolved'),
      value: systemResolvedCount,
      note: t('operator.self_resolved_desc'),
      tone: 'text-[var(--fg)]',
      duration: 1300,
    },
  ];

  return (
    <div className="w-full border-y border-[var(--rule)] grid grid-cols-1 md:grid-cols-3 animate-in fade-in duration-300">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={[
            'py-5 lg:py-6 pr-4',
            index > 0 ? 'md:border-l md:border-[var(--rule)] md:pl-6' : 'pl-0',
            index > 0 ? 'max-md:border-t max-md:border-[var(--rule)] max-md:pl-0' : '',
          ].join(' ')}
        >
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
            {metric.label}
          </div>
          <div className={`mt-2 text-[30px] leading-none font-medium tabular-nums ${metric.tone}`}>
            <AnimatedCounter value={metric.value} duration={metric.duration} />
          </div>
          <div className="mt-2 text-[11.5px] text-[var(--fg-dim)]">{metric.note}</div>
        </div>
      ))}
    </div>
  );
}

'use client';
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface UsersStatisticsProps {
  totalUsers?: number;
  todayUsers?: number;
}

/**
 * Strip metrik: satu pita dengan pembatas vertikal, bukan dua kartu.
 */
export default function UsersStatistics({
  totalUsers = 0,
  todayUsers = 0,
}: UsersStatisticsProps) {
  const { t } = useLanguage();
  return (
    <div className="w-full border-y border-[var(--rule)] grid grid-cols-2 animate-in fade-in duration-300">
      <div className="py-5 pr-4">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
          {t('users.total_reporters', 'Total Pelapor')}
        </div>
        <div className="mt-2 text-[30px] leading-none font-medium tabular-nums text-[var(--fg)]">
          {totalUsers.toLocaleString('en-US')}
        </div>
      </div>

      <div className="py-5 pl-4 lg:pl-6 border-l border-[var(--rule)]">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
          {t('users.reported_today', 'Melapor Hari Ini')}
        </div>
        <div className="mt-2 text-[30px] leading-none font-medium tabular-nums text-[var(--fg)]">
          {todayUsers.toLocaleString('en-US')}
        </div>
      </div>
    </div>
  );
}

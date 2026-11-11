'use client';
import { useLanguage } from '@/context/LanguageContext';

export default function UsersHeader() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-start gap-1 w-full">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
          {t('tickets.breadcrumb_dashboard', 'Dashboard')}
        </span>
        <span className="text-[10px] text-[var(--fg-faint)]">/</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
          {t('users.breadcrumb', 'Daftar Pelapor')}
        </span>
      </div>
      <h1 className="text-[22px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg)]">
        {t('users.title', 'Daftar Pelapor')}
      </h1>
    </div>
  );
}

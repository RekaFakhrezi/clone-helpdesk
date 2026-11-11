'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface DashboardHeaderProps {
  titleKey: string;
  defaultTitle: string;
  descKey: string;
  defaultDesc: string;
}

export default function DashboardHeader({
  titleKey,
  defaultTitle,
  descKey,
  defaultDesc,
}: DashboardHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="text-[22px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg)]">
        {t(titleKey, defaultTitle)}
      </h1>
      <p className="mt-1 text-[13px] text-[var(--fg-dim)]">
        {t(descKey, defaultDesc)}
      </p>
    </div>
  );
}

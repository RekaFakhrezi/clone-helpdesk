'use client';
import { usePathname } from 'next/navigation';
import PimpinanSidebar from './PimpinanSidebar';
import DashboardShell from '@/components/shared/layout/DashboardShell';
import { useLanguage } from '@/context/LanguageContext';

export default function PimpinanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const getPageTitle = () => {
    if (!pathname) return t('menu.executive_summary');
    if (pathname.includes('/dashboard/pimpinan/tickets')) return t('menu.ticket_reports');
    if (pathname.includes('/dashboard/pimpinan/performance')) return t('menu.performance_reports');
    if (pathname.includes('/dashboard/pimpinan/sla')) return t('menu.sla_reports');
    if (pathname.includes('/dashboard/pimpinan/reports')) return t('menu.summary_reports');
    if (pathname.includes('/dashboard/pimpinan/profile')) return t('profile.pimpinan_title');
    return t('menu.executive_summary');
  };

  return (
    <DashboardShell
      Sidebar={PimpinanSidebar}
      pageTitle={getPageTitle()}
      className="min-h-screen bg-[var(--canvas)] flex font-sans"
      contentClassName="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-[var(--ease)]"
    >
      {children}
    </DashboardShell>
  );
}

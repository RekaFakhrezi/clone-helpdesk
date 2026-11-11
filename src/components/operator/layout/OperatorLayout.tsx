'use client';
import { usePathname } from 'next/navigation';
import OperatorSidebar from './OperatorSidebar';
import DashboardShell from '@/components/shared/layout/DashboardShell';
import { useLanguage } from '@/context/LanguageContext';

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const getPageTitle = () => {
    if (!pathname) return t('topbar.dashboard_operator');
    if (pathname.includes('/dashboard/operator/tickets-rejected')) return t('tickets.tab_rejected');
    if (pathname.includes('/dashboard/operator/tickets-unhandled')) return t('tickets.tab_waiting');
    if (pathname.includes('/dashboard/operator/tickets-inprogress')) return t('tickets.tab_in_progress');
    if (pathname.includes('/dashboard/operator/tickets-resolved')) return t('tickets.tab_resolved');
    if (pathname.includes('/dashboard/operator/tickets')) return t('menu.all_tickets');
    if (pathname.includes('/dashboard/operator/profile')) return t('profile.title');
    if (pathname.includes('/dashboard/operator')) return t('topbar.dashboard_operator');
    return t('topbar.dashboard_operator');
  };

  return (
    <DashboardShell Sidebar={OperatorSidebar} pageTitle={getPageTitle()}>
      {children}
    </DashboardShell>
  );
}

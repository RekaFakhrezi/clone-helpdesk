'use client';

import { useRouter } from 'next/navigation';
import { LayoutDashboard, Ticket, TrendingUp, ShieldCheck, FileText, User } from 'lucide-react';

import { logoutUser } from '@/lib/AuthService';
import SidebarShell, { type SidebarItem, type SidebarProps } from '@/components/shared/layout/SidebarShell';
import { useLanguage } from '@/context/LanguageContext';

export default function PimpinanSidebar({ isOpen = true, setIsOpen = () => {} }: SidebarProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const MENU_ITEMS: SidebarItem[] = [
    { name: t('menu.executive_summary'), path: '/dashboard/pimpinan', icon: LayoutDashboard, exact: true },
    { name: t('menu.ticket_reports'), path: '/dashboard/pimpinan/tickets', icon: Ticket },
    { name: t('menu.performance_reports'), path: '/dashboard/pimpinan/performance', icon: TrendingUp },
    { name: t('menu.sla_reports'), path: '/dashboard/pimpinan/sla', icon: ShieldCheck },
    { name: t('menu.summary_reports'), path: '/dashboard/pimpinan/reports', icon: FileText },
    { name: t('menu.profile'), path: '/dashboard/pimpinan/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  return (
    <SidebarShell items={MENU_ITEMS} onLogout={handleLogout} isOpen={isOpen} setIsOpen={setIsOpen} />
  );
}

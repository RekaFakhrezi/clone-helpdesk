'use client';

import { useRouter } from 'next/navigation';
import { LayoutDashboard, Ticket, User } from 'lucide-react';

import { logoutUser } from '@/lib/AuthService';
import SidebarShell, { type SidebarItem, type SidebarProps } from '@/components/shared/layout/SidebarShell';
import { useLanguage } from '@/context/LanguageContext';

export default function OperatorSidebar({ isOpen = true, setIsOpen = () => {} }: SidebarProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const MENU_ITEMS: SidebarItem[] = [
    { name: t('menu.operator_dashboard'), path: '/dashboard/operator', icon: LayoutDashboard, exact: true },
    { name: t('menu.all_tickets'), path: '/dashboard/operator/tickets', icon: Ticket },
    { name: t('menu.profile'), path: '/dashboard/operator/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  return (
    <SidebarShell items={MENU_ITEMS} onLogout={handleLogout} isOpen={isOpen} setIsOpen={setIsOpen} />
  );
}

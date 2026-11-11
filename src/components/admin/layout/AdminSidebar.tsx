'use client';

import { LayoutDashboard, Ticket, Users, Layers, BookOpen, UserCog, Webhook, User } from 'lucide-react';

import SidebarShell, { type SidebarItem, type SidebarProps } from '@/components/shared/layout/SidebarShell';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminSidebar({ isOpen = true, setIsOpen = () => {} }: SidebarProps) {
  const { t } = useLanguage();

  const MENU_ITEMS: SidebarItem[] = [
    { name: t('menu.dashboard'), path: '/dashboard/administrasi', icon: LayoutDashboard, exact: true },
    { name: t('menu.tickets'), path: '/dashboard/administrasi/tickets', icon: Ticket },
    { name: t('menu.users'), path: '/dashboard/administrasi/users', icon: Users },
    { name: t('menu.report_categories'), path: '/dashboard/administrasi/report-categories', icon: Layers },
    { name: t('menu.knowledge_base'), path: '/dashboard/administrasi/knowledge-base', icon: BookOpen },
    { name: t('menu.staff'), path: '/dashboard/administrasi/staff', icon: UserCog },
    { name: t('menu.bot'), path: '/dashboard/administrasi/bot-settings', icon: Webhook },
    { name: t('menu.profile'), path: '/dashboard/administrasi/profile', icon: User },
  ];

  const handleLogout = () => {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    localStorage.removeItem('isLoggedIn');
    window.location.href = '/login';
  };

  return (
    <SidebarShell items={MENU_ITEMS} onLogout={handleLogout} isOpen={isOpen} setIsOpen={setIsOpen} />
  );
}

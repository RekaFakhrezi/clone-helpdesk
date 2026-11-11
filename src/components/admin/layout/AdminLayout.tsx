'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { fetchClient } from '@/lib/apiClient';
import AdminSidebar from './AdminSidebar';
import DashboardShell from '@/components/shared/layout/DashboardShell';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    fetchClient('/auth/me').then(res => {
      if (res.success && res.data) {
        const userData = res.data.user || {};
        const userMeta = userData.user_metadata || {};
        const profileData = res.data.profile || {};
        
        setUserProfile({
          name: profileData.name || userMeta.name || userMeta.full_name || userData.email?.split('@')[0] || 'User',
          role: profileData.role || userMeta.role || 'operator',
          email: profileData.email || userData.email || '',
          ...profileData
        });
      }
    }).catch(err => console.error("Error fetching user profile:", err));
  }, []);

  const getBreadcrumbParent = () => {
    if (pathname?.startsWith('/dashboard/operator')) return 'Dashboard';
    return 'Menu';
  };

  const getPageTitle = () => {
    if (!pathname) return t('topbar.dashboard_admin');
    if (pathname.includes('/dashboard/administrasi/reports')) return t('menu.reports');
    if (pathname.includes('/dashboard/administrasi/webhook')) return t('admin.webhook_title');
    if (pathname.includes('/dashboard/administrasi/bot-settings')) return t('admin.bot_template_title');
    if (pathname.includes('/admin/tickets')) return t('menu.tickets');
    return t('topbar.dashboard_admin');
  };

  return (
    <DashboardShell
      Sidebar={AdminSidebar}
      pageTitle={getPageTitle()}
      breadcrumbParent={getBreadcrumbParent()}
      userName={userProfile?.name}
      userRole={userProfile?.role}
    >
      {children}
    </DashboardShell>
  );
}

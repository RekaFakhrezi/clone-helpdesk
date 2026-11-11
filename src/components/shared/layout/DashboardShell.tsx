'use client';

import { useEffect, useState } from 'react';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import type { SidebarProps } from './SidebarShell';

interface DashboardShellProps {
  Sidebar: React.ComponentType<SidebarProps>;
  pageTitle: string;
  breadcrumbParent?: string;
  userName?: string;
  userRole?: string;
  /** Kelas wrapper terluar, default latar `--paper`. */
  className?: string;
  /** Kelas wrapper konten di kanan sidebar. */
  contentClassName?: string;
  children: React.ReactNode;
}

/**
 * Kerangka layout dashboard: state sidebar (persist `localStorage`), topbar, dan
 * area `<main>`. Perbedaan antar role dikirim lewat props.
 */
export default function DashboardShell({
  Sidebar,
  pageTitle,
  breadcrumbParent = 'Dashboard',
  userName,
  userRole,
  className = 'min-h-screen bg-[var(--paper)] flex',
  contentClassName = 'flex-1 flex flex-col min-w-0 transition-all duration-300',
  children,
}: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      setIsSidebarOpen(savedState === 'true');
    }
  }, []);

  const handleSidebarToggle = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', String(newState));
  };

  return (
    <div className={className}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className={`${contentClassName} ${isSidebarOpen ? 'lg:pl-72' : 'lg:pl-[80px]'}`}>
        <AdminTopbar
          onMenuClick={handleSidebarToggle}
          pageTitle={pageTitle}
          breadcrumbParent={breadcrumbParent}
          userName={userName}
          userRole={userRole}
          showMenuButtonOnDesktop={true}
        />

        <main className="flex-1 px-4 lg:px-10 py-6 lg:py-8 overflow-y-auto">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

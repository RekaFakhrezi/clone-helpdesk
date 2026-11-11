'use client';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

interface AdminTopbarProps {
  onMenuClick?: () => void;
  pageTitle?: string;
  breadcrumbParent?: string;
  userName?: string;
  userRole?: string;
  avatarSrc?: string;
  showMenuButtonOnDesktop?: boolean;
}

export default function AdminTopbar({
  onMenuClick,
  pageTitle,
  breadcrumbParent,
  userName,
  userRole,
  avatarSrc = '/avatar-admin.jpg',
  showMenuButtonOnDesktop = false,
}: AdminTopbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<any[]>([]);

  // Format waktu relatif
  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(hours / 24)} hari lalu`;
  };

  // Fetch 5 tiket terbaru saat mount
  useEffect(() => {
    const fetchLatestTickets = async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, ticket_number, subject, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (!error && data) {
        setNotifications(
          data.map((t: any) => ({
            id: t.id,
            ticketNumber: t.ticket_number || t.id,
            subject: t.subject || 'Tanpa subjek',
            time: t.created_at,
            isRead: false,
          }))
        );
      }
    };
    fetchLatestTickets();

    // Subscribe realtime INSERT pada tabel tickets
    const channel = supabase
      .channel('admin-ticket-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tickets' },
        (payload) => {
          const t = payload.new as any;
          setNotifications((prev) => {
            const newNotif = {
              id: t.id,
              ticketNumber: t.ticket_number || t.id,
              subject: t.subject || 'Tanpa subjek',
              time: t.created_at,
              isRead: false,
            };
            // Tambahkan di depan, batasi 5
            return [newNotif, ...prev].slice(0, 5);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  let displayUserName = currentUser.name || currentUser.full_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name;
  if (!displayUserName && currentUser.email) {
    displayUserName = currentUser.email.split('@')[0];
  }
  displayUserName = displayUserName || userName || (language === 'id' ? 'Pengguna' : 'User');

  let displayUserRole = currentUser.role || currentUser.user_metadata?.role || userRole;
  if (displayUserRole === 'authenticated') {
    if (currentUser.email?.includes('operator')) displayUserRole = t('topbar.operator');
    else if (currentUser.email?.includes('teknisi')) displayUserRole = t('topbar.teknisi');
    else if (currentUser.email?.includes('pimpinan')) displayUserRole = t('topbar.pimpinan');
    else displayUserRole = t('topbar.super_admin');
  } else if (displayUserRole === 'pimpinan') {
    displayUserRole = t('topbar.pimpinan');
  } else if (displayUserRole === 'admin') {
    displayUserRole = t('topbar.super_admin');
  } else if (displayUserRole === 'teknisi') {
    displayUserRole = t('topbar.teknisi');
  } else if (displayUserRole === 'operator') {
    displayUserRole = t('topbar.operator');
  }

  const isPimpinan = displayUserRole === t('topbar.pimpinan') || (currentUser.role || currentUser.user_metadata?.role || userRole) === 'pimpinan';

  const initials = displayUserName.substring(0, 2).toUpperCase();

  const pathname = usePathname();

  const getDynamicPageTitle = () => {
    const path = pathname || '';
    if (path === '/dashboard' || path === '/dashboard/administrasi') return t('topbar.dashboard_admin');
    if (path.startsWith('/dashboard/administrasi/tickets')) return t('menu.tickets');
    if (path.startsWith('/dashboard/administrasi/users')) return t('menu.users');
    if (path.startsWith('/dashboard/administrasi/report-categories')) return t('menu.report_categories');
    if (path.startsWith('/dashboard/administrasi/reports')) return t('menu.reports');
    if (path.startsWith('/dashboard/administrasi/sla')) return t('menu.sla');
    if (path.startsWith('/dashboard/administrasi/staff')) return t('menu.staff');
    if (path.startsWith('/dashboard/administrasi/webhook')) return language === 'id' ? 'Log API & Webhook' : 'API Logs & Webhooks';
    if (path.startsWith('/dashboard/administrasi/bot-settings')) return t('menu.bot');
    if (path.startsWith('/dashboard/administrasi/settings')) return t('menu.settings');
    if (path.startsWith('/dashboard/administrasi/profile')) return t('profile.title');
    if (path.startsWith('/dashboard/pimpinan/tickets')) return t('menu.ticket_reports');
    if (path.startsWith('/dashboard/pimpinan/performance')) return t('menu.performance_reports');
    if (path.startsWith('/dashboard/pimpinan/sla')) return t('menu.sla_reports');
    if (path.startsWith('/dashboard/pimpinan/reports')) return t('menu.summary_reports');
    if (path.startsWith('/dashboard/pimpinan/profile')) return t('profile.pimpinan_title');
    if (path.startsWith('/dashboard/operator/tickets')) return t('menu.all_tickets');
    if (path.startsWith('/dashboard/operator/profile')) return t('profile.title');
    if (path === '/dashboard/pimpinan' || path.startsWith('/dashboard/pimpinan/')) return t('menu.executive_summary');
    if (path === '/dashboard/operator' || path.startsWith('/dashboard/operator/')) return t('topbar.dashboard_operator');
    return pageTitle || t('topbar.dashboard');
  };

  const activeTitle = getDynamicPageTitle();

  const translatedBreadcrumb = (breadcrumbParent || 'Menu') === 'Menu' 
    ? t('topbar.menu') 
    : (breadcrumbParent === 'Dashboard' ? t('topbar.dashboard') : breadcrumbParent);

  return (
    <div className="sticky top-0 z-40 h-16 w-full bg-[var(--bg)] border-b border-[var(--rule)]">
      {/* Padding menyesuaikan dengan p-4 lg:p-8 pada Layout utama */}
      <div className="flex h-full items-center justify-between px-4 lg:px-8">

        {/* Kiri: Hamburger & Breadcrumb */}
        <div className="flex items-center h-full">
          {/* Hamburger button */}
          <button
            onClick={onMenuClick}
            className={`${showMenuButtonOnDesktop ? 'block' : 'lg:opacity-0 lg:pointer-events-none'} -ml-2 p-2 rounded-[4px] text-[var(--fg-dim)] hover:bg-[var(--rule)] hover:text-[var(--fg)] transition-colors duration-150`}
            aria-label={language === 'id' ? 'Buka menu' : 'Open menu'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 ml-4 md:ml-2 min-w-0">
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">{translatedBreadcrumb}</span>
            <span className="text-[10px] text-[var(--fg-faint)]">/</span>
            <span className="text-[13.5px] font-medium text-[var(--fg)] truncate max-w-[200px] md:max-w-md">
              {activeTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-5">
          {/* Quick Language Toggle Pill */}
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            title={t('topbar.lang_switch')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] border border-[var(--rule-strong)] hover:border-[var(--fg-faint)] bg-transparent hover:bg-[var(--rule)] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--fg-dim)] hover:text-[var(--fg)] transition-colors duration-150 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'id' ? 'ID' : 'EN'}</span>
          </button>

          {!isPimpinan && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-[4px] text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[var(--rule)] transition-colors duration-150 focus:outline-none"
                aria-label={t('topbar.notifications')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--surface)] rounded-[4px] shadow-[var(--shadow-pop)] border border-[var(--rule-strong)] overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-150">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--rule)] bg-[var(--canvas)]">
                    <h3 className="font-medium text-[var(--fg)] text-[13px]">{t('topbar.notifications')}</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))}
                        className="text-[11.5px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                      >
                        {t('notifications.mark_read')}
                      </button>
                    )}
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`flex gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                          onClick={() =>
                            setNotifications((prev) =>
                              prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
                            )
                          }
                        >
                          <div className="shrink-0 mt-0.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[13px] font-bold ${!notif.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                              {language === 'id' ? 'Tiket Baru Masuk' : 'New Ticket'}
                            </p>
                            <p className="text-[13px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                              #{notif.ticketNumber} — {notif.subject}
                            </p>
                            <p className="text-[11px] font-semibold text-slate-400 mt-1.5">
                              {formatRelativeTime(notif.time)}
                            </p>
                          </div>
                          {!notif.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center"></div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-sm">{t('topbar.no_notifications')}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="hidden sm:block w-px h-6 bg-[var(--rule)]"></div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-[13px] font-medium text-[var(--fg)]">{displayUserName}</span>
              <span className="text-[10px] font-medium text-[var(--fg-faint)] uppercase tracking-[0.14em]">
                {displayUserRole}
              </span>
            </div>
            {/* Avatar Inisial Dinamis */}
            <div className="relative w-9 h-9 rounded-[4px] bg-[var(--accent)] flex items-center justify-center text-white text-[12px] font-medium shrink-0">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
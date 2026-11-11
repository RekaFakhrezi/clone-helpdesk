'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, type LucideIcon } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

export interface SidebarItem {
  name: string;
  path: string;
  icon: LucideIcon;
  /** Hanya aktif saat pathname sama persis (dipakai menu root tiap role). */
  exact?: boolean;
}

export interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

interface SidebarShellProps extends SidebarProps {
  items: SidebarItem[];
  onLogout: () => void;
}

/**
 * Kerangka sidebar dashboard: overlay mobile, panel gelap, blok logo, daftar menu,
 * dan tombol logout. Tiap role hanya menyuplai daftar item + handler logout.
 */
export default function SidebarShell({
  items,
  onLogout,
  isOpen = true,
  setIsOpen = () => {},
}: SidebarShellProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isItemActive = (item: SidebarItem) => {
    if (item.exact) return pathname === item.path;
    return pathname === item.path || pathname?.startsWith(item.path + '/') || false;
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-[rgba(11,21,36,0.55)] z-40 lg:hidden transition-opacity duration-150"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[var(--rail)] flex flex-col transition-all duration-150 ease-[var(--ease)] ${
          isOpen ? 'w-72 translate-x-0' : 'w-[80px] max-lg:-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / Logo Area Sidebar */}
        <div className="h-[92px] flex items-center px-4 border-b border-white/[.12] flex-none overflow-hidden transition-all duration-150">
          <div className="w-12 h-12 flex items-center justify-center flex-none">
            <div className="w-10 h-10 rounded-[4px] border border-white/[.18] bg-white/[.06] flex items-center justify-center flex-none">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 3 2 8l10 5 10-5-10-5Z" />
                <path d="M6 10.3V15c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.7" />
                <path d="M22 8v6" />
              </svg>
            </div>
          </div>
          <div className={`flex flex-col leading-tight min-w-0 transition-opacity duration-150 ml-2.5 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <span className="font-semibold text-[14.5px] tracking-[-0.01em] text-white truncate">IT Helpdesk</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/45 truncate">
              Universitas Diponegoro
            </span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5 overflow-x-hidden">
          {isOpen && (
            <span className="px-3 pt-1 pb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
              {t('topbar.menu')}
            </span>
          )}
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item);

            return (
              <div key={item.name} className="relative group w-full">
                <Link
                  href={item.path}
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                  className={`flex items-center rounded-[4px] text-[13.5px] transition-colors duration-150 w-full h-11 px-3 gap-3 overflow-hidden ${
                    isActive
                      ? 'bg-white/[.10] !text-white font-medium'
                      : '!text-white/70 font-normal hover:bg-white/[.05] hover:!text-white'
                  }`}
                >
                  <div className="flex-none flex items-center justify-center w-6 h-6">
                    <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2 : 1.75} />
                  </div>
                  <span className={`truncate transition-opacity duration-150 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{item.name}</span>
                </Link>
                {/* Tooltip for collapsed state */}
                {!isOpen && (
                  <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2 py-1.5 bg-[var(--fg)] text-white text-[11px] font-medium rounded-[4px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.name}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[var(--fg)]"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer Area Sidebar - Logout */}
        <div className="p-3 border-t border-white/[.12] flex-none flex">
          <div className="relative group w-full">
            <button
              onClick={onLogout}
              className="flex items-center rounded-[4px] text-[13.5px] font-normal text-[#F0A6A2] hover:bg-white/[.06] hover:text-[#FFC9C5] transition-colors duration-150 w-full h-11 px-3 gap-3 overflow-hidden"
            >
              <div className="flex-none flex items-center justify-center w-6 h-6">
                <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </div>
              <span className={`transition-opacity duration-150 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{t('common.logout')}</span>
            </button>
            {!isOpen && (
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2 py-1.5 bg-[var(--fg)] text-white text-[11px] font-medium rounded-[4px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {t('common.logout')}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[var(--fg)]"></div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

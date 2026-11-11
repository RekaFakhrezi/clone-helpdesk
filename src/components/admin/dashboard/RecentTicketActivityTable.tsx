'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface RecentTicketActivityTableProps {
  data?: { id: string; ticketNum: string; status?: string; message: string; time: string; iconColor?: string }[];
}

type RecentActivity = NonNullable<RecentTicketActivityTableProps['data']>[number];

export default function RecentTicketActivityTable({ data = [] }: RecentTicketActivityTableProps) {
  const { t, language } = useLanguage();

  const localizeActivity = (activity: RecentActivity) => {
    if (language === 'en') return activity;

    const status = activity.status?.toLowerCase();
    const message = activity.message.toLowerCase();

    if (status === 'new ticket') {
      return { ...activity, status: 'Tiket Baru', message: 'Tiket baru dibuat' };
    }
    if (status === 'status change') {
      return { ...activity, status: 'Perubahan Status' };
    }
    if (status === 'closed') {
      return { ...activity, status: 'Ditutup' };
    }
    if (message === 'ticket auto-resolved by system') {
      return { ...activity, message: 'Tiket diselesaikan otomatis oleh sistem' };
    }

    return activity;
  };

  return (
    <div className="bg-[var(--surface)] rounded-[4px] border border-[var(--rule)] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center gap-4 px-5 py-3.5 border-b border-[var(--rule)]">
        <h3 className="text-[13px] font-medium text-[var(--fg)]">{t('charts.recent_activity')}</h3>
        <Link href="/dashboard/administrasi/tickets" className="text-[11.5px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
          {t('charts.view_all')}
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--rule)]">
              <th className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">{t('charts.ticket_id')}</th>
              <th className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">{t('charts.type')}</th>
              <th className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] w-1/2">{t('charts.activity')}</th>
              <th className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] text-right">{t('charts.time')}</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-[12.5px] text-[var(--fg-faint)]">{t('charts.no_activity')}</td>
              </tr>
            ) : (
              data.map((rawActivity, index) => {
                const activity = localizeActivity(rawActivity);

                return (
                <tr key={index} className="border-b border-[var(--rule)] last:border-0 hover:bg-[var(--canvas)] transition-colors duration-150">
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className="text-[12.5px] font-medium tabular-nums text-[var(--accent)]">{activity.ticketNum}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[10.5px] font-medium ${activity.iconColor}`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[12.5px] text-[var(--fg-dim)]">{activity.message}</td>
                  <td className="px-5 py-3 text-right text-[11.5px] text-[var(--fg-faint)] whitespace-nowrap">{activity.time}</td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

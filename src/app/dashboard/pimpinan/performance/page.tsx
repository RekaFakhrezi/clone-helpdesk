'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { fetchClient } from '@/lib/apiClient';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function PimpinanPerformancePage() {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);

  useEffect(() => {
    // Ambil semua tiket
    fetchClient('/admin/tickets')
      .then(res => {
        const data = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setTickets(data);
      })
      .catch(err => console.error('Gagal mengambil data tiket:', err))
      .finally(() => setLoadingTickets(false));

    // Ambil semua operator & agent dari staff_profiles
    const fetchStaff = async () => {
      try {
        const { data, error } = await supabase
          .from('staff_profiles')
          .select('id, name, email, role')
          .in('role', ['operator', 'teknisi', 'agent']);
        
        if (error) console.error('Gagal mengambil data staff:', error);
        if (data) setStaffList(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStaff(false);
      }
    };
    fetchStaff();
  }, []);

  // Hitung statistik kinerja berdasarkan tiket
  const performanceData = useMemo(() => {
    // Buat map untuk setiap staff dari staffList
    const statsMap: Record<
      string,
      {
        id: string;
        name: string;
        email: string;
        role: string;
        total: number;
        resolved: number;
        totalTimeMs: number;
      }
    > = {};

    staffList.forEach(s => {
      statsMap[s.id] = {
        id: s.id,
        name: s.name || '-',
        email: s.email || '-',
        role: s.role,
        total: 0,
        resolved: 0,
        totalTimeMs: 0,
      };
    });

    // Hitung tiket yang ditangani masing-masing staff
    tickets.forEach(ticket => {
      // Teknisi / agent yang ditugaskan via tech_id
      const techId = ticket.tech_id;
      if (techId && statsMap[techId]) {
        statsMap[techId].total++;
        const statusUp = (ticket.status || '').toUpperCase();
        if (
          ['RESOLVED', 'CLOSED', 'RESOLVED_BY_SYSTEM', 'WAITING CONFIRMATION'].includes(
            statusUp
          )
        ) {
          statsMap[techId].resolved++;
          if (ticket.updated_at && ticket.created_at) {
            const diff =
              new Date(ticket.updated_at).getTime() -
              new Date(ticket.created_at).getTime();
            if (diff > 0) statsMap[techId].totalTimeMs += diff;
          }
        }
      }
    });

    // Konversi ke array dan hitung tingkat SLA
    return Object.values(statsMap)
      .filter(s => s.total > 0) // Hanya tampilkan yang punya aktivitas
      .map(s => {
        const slaRate =
          s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 0;
        return { ...s, slaRate };
      })
      .sort((a, b) => b.resolved - a.resolved);
  }, [tickets, staffList]);

  const isLoading = loadingTickets || loadingStaff;

  return (
    <div className="flex w-full flex-col gap-6 pb-10 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col items-start gap-1">
        <h1 className="text-[22px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg)]">
          {t('perf.page_title', 'Laporan Performa')}
        </h1>
        <p className="mt-1 text-[13px] text-[var(--fg-dim)]">
          Pemantauan Kinerja Penanganan Tiket Helpdesk IT
        </p>
      </div>

      <div className="w-full overflow-hidden rounded-[4px] border border-[var(--rule)] bg-[var(--surface)]">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--rule)] px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-[13px] font-medium text-[var(--fg)]">
            <Trophy className="h-4 w-4 text-[var(--fg-faint)]" strokeWidth={1.75} />
            Laporan Kinerja
          </h2>
          <span className="rounded-[3px] border border-[var(--rule)] bg-[var(--canvas)] px-2 py-1 text-[11px] font-medium tabular-nums text-[var(--fg-dim)]">
            {performanceData.length} {t('perf.active_tech', 'Aktif')}
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="h-7 w-7 animate-spin rounded-full border border-[var(--rule)] border-t-[var(--accent)]" />
            <p className="text-[11.5px] text-[var(--fg-dim)]">
              Memuat data kinerja...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--rule)]">
                  <th className="px-4 py-2.5">
                    <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">Nama</span>
                  </th>
                  <th className="px-4 py-2.5">
                    <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">Email</span>
                  </th>
                  <th className="px-4 py-2.5 text-center">
                    <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">Selesai</span>
                  </th>
                  <th className="px-4 py-2.5 text-right">
                    <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">Tingkat SLA</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {performanceData.length > 0 ? (
                  performanceData.map((staff, idx) => (
                    <tr
                      key={staff.id}
                      className="border-b border-[var(--rule)] transition-colors hover:bg-[var(--canvas)] last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-5 font-mono text-[11px] tabular-nums text-[var(--fg-faint)]">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="text-[12.5px] text-[var(--fg)]">{staff.name}</div>
                            <div className="text-[11.5px] capitalize text-[var(--fg-faint)]">
                              {staff.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[var(--fg-dim)]">
                        {staff.email}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="tabular-nums text-[12px] text-[var(--fg)]">
                          {staff.resolved}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <div className="hidden h-1.5 w-16 overflow-hidden rounded-[2px] bg-[rgba(11,21,36,0.08)] sm:block">
                            <div
                              className={`h-full ${
                                staff.slaRate >= 80
                                  ? 'bg-[var(--ok)]'
                                  : 'bg-[var(--warn)]'
                              }`}
                              style={{ width: `${staff.slaRate}%` }}
                            />
                          </div>
                          <span
                            className={`text-[11.5px] font-medium tabular-nums ${
                              staff.slaRate >= 80
                                ? 'text-[var(--ok)]'
                                : 'text-[var(--warn)]'
                            }`}
                          >
                            {staff.slaRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-[12.5px] text-[var(--fg-dim)]"
                    >
                      {t(
                        'perf.no_data',
                        'Belum ada data performa yang tercatat.'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

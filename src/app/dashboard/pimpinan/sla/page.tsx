'use client';
import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { fetchClient } from '@/lib/apiClient';
import { useLanguage } from '@/context/LanguageContext';

export default function PimpinanSlaPage() {
  const { t, language } = useLanguage();
  const [slaHealth, setSlaHealth] = useState<any[]>([]);

  useEffect(() => {
    fetchClient('/admin/dashboard')
      .then((res) => {
        const data = res.data || res;
        if (Array.isArray(data?.slaHealth)) {
          setSlaHealth(data.slaHealth);
        }
      })
      .catch((err) => {
        console.error('Gagal mengambil data SLA:', err);
      });
  }, []);

  const priorityTargets = [
    { nameKey: 'sla.priority_critical', nameFallback: 'Kritis (Critical)', target: '4 Jam', achievement: 92, color: 'bg-[var(--danger)]' },
    { nameKey: 'sla.priority_high', nameFallback: 'Tinggi (High)', target: '12 Jam', achievement: 88, color: 'bg-[var(--warn)]' },
    { nameKey: 'sla.priority_medium', nameFallback: 'Sedang (Medium)', target: '24 Jam', achievement: 95, color: 'bg-[var(--accent)]' },
    { nameKey: 'sla.priority_low', nameFallback: 'Rendah (Low)', target: '48 Jam', achievement: 98, color: 'bg-[var(--fg-faint)]' },
  ];

  return (
    <div className="flex w-full flex-col gap-6 pb-10 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col items-start gap-1">
        <h1 className="text-[22px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg)]">{t('sla.page_title', 'Laporan SLA (Service Level Agreement)')}</h1>
        <p className="mt-1 text-[13px] text-[var(--fg-dim)]">{t('sla.page_desc', 'Pemantauan kepatuhan target waktu penanganan tiket IT Helpdesk.')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 w-full">
        {/* Pencapaian SLA per Tingkat Prioritas */}
        <div className="flex h-full flex-col rounded-[4px] border border-[var(--rule)] bg-[var(--surface)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--rule)] px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-[var(--fg)]">
              <ShieldCheck className="h-4 w-4 text-[var(--fg-faint)]" strokeWidth={1.75} />
              {t('sla.priority_title', 'Pencapaian SLA per Prioritas')}
            </h2>
            <span className="rounded-[3px] border border-[var(--rule)] bg-[var(--canvas)] px-2 py-1 text-[11px] font-medium text-[var(--fg-dim)]">
              {t('sla.efficiency_target', 'Target Efisiensi')}
            </span>
          </div>
          
          <div className="flex flex-col divide-y divide-[var(--rule)]">
            {priorityTargets.map((item) => (
              <div key={item.nameKey} className="flex flex-col gap-2 px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-medium text-[var(--fg)]">{t(item.nameKey, item.nameFallback)}</span>
                    <span className="rounded-[3px] border border-[var(--rule)] px-1.5 py-0.5 text-[10.5px] tabular-nums text-[var(--fg-faint)]">
                      {t('sla.target_label', 'Target')}: {item.target}
                    </span>
                  </div>
                  <span className="text-[12.5px] font-medium tabular-nums text-[var(--fg)]">{item.achievement}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-[2px] bg-[rgba(11,21,36,0.08)]">
                  <div
                    className={`h-full transition-all duration-1000 ${item.color}`}
                    style={{ width: `${item.achievement}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Kesehatan SLA Operasional */}
        <div className="flex h-full flex-col rounded-[4px] border border-[var(--rule)] bg-[var(--surface)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--rule)] px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-[var(--fg)]">
              <Clock className="h-4 w-4 text-[var(--fg-faint)]" strokeWidth={1.75} />
              {t('sla.health_title', 'Kesehatan SLA Keseluruhan')}
            </h2>
            <span className="rounded-[3px] border border-[var(--rule)] bg-[var(--canvas)] px-2 py-1 text-[11px] font-medium text-[var(--fg-dim)]">
              {t('sla.realtime_status', 'Realtime Status')}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 px-5 pt-4">
            {Array.isArray(slaHealth) && slaHealth.map((sh: any, idx: number) => (
              <div key={idx} className="flex flex-col items-start rounded-[4px] border border-[var(--rule)] px-3 py-3">
                <span className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
                  {language === 'en'
                    ? sh.name
                    : ({ 'Within SLA': 'Sesuai SLA', 'Near Deadline': 'Mendekati Tenggat', Overdue: 'Terlambat' } as Record<string, string>)[sh.name] || sh.name}
                </span>
                <span className="text-[22px] leading-none font-medium tabular-nums text-[var(--fg)]" style={{ color: sh.fill }}>{sh.value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-1 flex-col items-start justify-center gap-1 px-5 py-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--ok)]" strokeWidth={1.75} />
              <h3 className="text-[12.5px] font-medium text-[var(--fg)]">{t('sla.performance_good', 'Performa SLA Sangat Baik')}</h3>
            </div>
            <p className="text-[11.5px] leading-[1.6] text-[var(--fg-dim)]">
              {t('sla.performance_desc', 'Sebagian besar tiket terselesaikan jauh sebelum batas tenggat waktu SLA yang ditentukan.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

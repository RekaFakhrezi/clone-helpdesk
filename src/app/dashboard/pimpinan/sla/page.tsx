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
    { nameKey: 'sla.priority_critical', nameFallback: 'Kritis (Critical)', target: '4 Jam', achievement: 92, color: 'bg-red-500' },
    { nameKey: 'sla.priority_high', nameFallback: 'Tinggi (High)', target: '12 Jam', achievement: 88, color: 'bg-orange-500' },
    { nameKey: 'sla.priority_medium', nameFallback: 'Sedang (Medium)', target: '24 Jam', achievement: 95, color: 'bg-blue-500' },
    { nameKey: 'sla.priority_low', nameFallback: 'Rendah (Low)', target: '48 Jam', achievement: 98, color: 'bg-slate-500' },
  ];

  return (
    <div className="flex flex-col items-start gap-6 w-full max-w-[1440px] mx-auto pb-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Page Header */}
      <div className="flex flex-col items-start gap-1">
        <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight">{t('sla.page_title', 'Laporan SLA (Service Level Agreement)')}</h1>
        <p className="text-[var(--text-dim)] text-sm font-medium">{t('sla.page_desc', 'Pemantauan kepatuhan target waktu penanganan tiket IT Helpdesk.')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Pencapaian SLA per Tingkat Prioritas */}
        <div className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[var(--ink)] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              {t('sla.priority_title', 'Pencapaian SLA per Prioritas')}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
              {t('sla.efficiency_target', 'Target Efisiensi')}
            </span>
          </div>
          
          <div className="flex flex-col gap-5">
            {priorityTargets.map((item) => (
              <div key={item.nameKey} className="flex flex-col gap-2 p-3 bg-slate-50/60 rounded-xl border border-[var(--line-dark)]">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--ink)]">{t(item.nameKey, item.nameFallback)}</span>
                    <span className="text-[11px] font-semibold text-[var(--text-dim)] bg-white px-2 py-0.5 rounded border border-[var(--line)]">
                      {t('sla.target_label', 'Target')}: {item.target}
                    </span>
                  </div>
                  <span className="font-extrabold text-[var(--ink)]">{item.achievement}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                    style={{ width: `${item.achievement}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Kesehatan SLA Operasional */}
        <div className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[var(--ink)] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              {t('sla.health_title', 'Kesehatan SLA Keseluruhan')}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-[var(--text-dim)]">
              {t('sla.realtime_status', 'Realtime Status')}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {Array.isArray(slaHealth) && slaHealth.map((sh: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl border border-[var(--line-dark)] bg-slate-50/50 flex flex-col items-center text-center">
                <span className="text-xs font-bold text-[var(--text-dim)] mb-1">
                  {language === 'en'
                    ? sh.name
                    : ({ 'Within SLA': 'Sesuai SLA', 'Near Deadline': 'Mendekati Tenggat', Overdue: 'Terlambat' } as Record<string, string>)[sh.name] || sh.name}
                </span>
                <span className="text-2xl font-extrabold text-[var(--ink)]" style={{ color: sh.fill }}>{sh.value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center flex-1 text-center py-6 px-4 bg-emerald-50/30 rounded-xl border border-emerald-100">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-emerald-900 mb-1">{t('sla.performance_good', 'Performa SLA Sangat Baik')}</h3>
            <p className="text-emerald-700/80 text-xs max-w-xs leading-relaxed">
              {t('sla.performance_desc', 'Sebagian besar tiket terselesaikan jauh sebelum batas tenggat waktu SLA yang ditentukan.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

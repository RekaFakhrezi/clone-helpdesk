"use client";

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useLanguage } from '@/context/LanguageContext';

interface TicketTrendChartProps {
  data?: { name: string; value: number; active?: boolean }[];
}

export default function TicketTrendChart({ data = [] }: TicketTrendChartProps) {
  const { t } = useLanguage();
  const [range, setRange] = useState('This Week');

  let displayData = data;
  if (data.length >= 30) {
    if (range === 'This Week') {
      displayData = data.slice(-7);
    } else if (range === 'Last Week') {
      displayData = data.slice(-14, -7);
    } else if (range === 'This Month') {
      displayData = data.slice(-30);
    }
  }

  return (
    <div className="bg-[var(--surface)] rounded-[4px] border border-[var(--rule)]">
      <div className="flex justify-between items-center gap-4 px-5 py-3.5 border-b border-[var(--rule)]">
        <h3 className="text-[13px] font-medium text-[var(--fg)]">{t('charts.trend_title')}</h3>
        <select
          className="bg-transparent border border-[var(--rule-strong)] text-[var(--fg-dim)] text-[11.5px] rounded-[4px] px-2 py-1 outline-none cursor-pointer hover:border-[var(--fg-faint)] focus:border-[var(--accent)] transition-colors duration-150"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="This Week">{t('charts.this_week')}</option>
          <option value="Last Week">{t('charts.last_week')}</option>
          <option value="This Month">{t('charts.this_month')}</option>
        </select>
      </div>
      <div className="w-full h-[250px] px-2 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} margin={{ top: 0, right: 8, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(11,21,36,0.08)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10.5, fill: '#7c8898' }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10.5, fill: '#7c8898' }}
              tickCount={3}
            />
            <Tooltip
              cursor={{ fill: 'rgba(11,21,36,0.04)' }}
              contentStyle={{ borderRadius: '4px', border: '1px solid rgba(11,21,36,0.18)', boxShadow: '0 8px 24px -12px rgba(11,21,36,0.28)', fontSize: '12px' }}
            />
            <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={44}>
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.active ? '#002D72' : '#C3C6D1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
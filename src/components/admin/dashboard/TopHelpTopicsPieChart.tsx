"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';

interface TopHelpTopicsPieChartProps {
  data?: { name: string; value: number; fill?: string }[];
}

const DEFAULT_COLORS = ['#002D72', '#1E4E9A', '#3E72C4', '#7FA0DA', '#C3D4EC'];

export default function TopHelpTopicsPieChart({ data = [] }: TopHelpTopicsPieChartProps) {
  const { t } = useLanguage();
  return (
    <div className="bg-[var(--surface)] rounded-[4px] border border-[var(--rule)] flex flex-col h-[350px]">
      <div className="px-5 py-3.5 border-b border-[var(--rule)]">
        <h3 className="text-[10px] font-medium text-[var(--fg-faint)] uppercase tracking-[0.14em]">{t('charts.top_topics')}</h3>
      </div>

      <div className="flex-1 w-full relative px-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={78}
              paddingAngle={1.5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '4px', border: '1px solid rgba(11,21,36,0.18)', boxShadow: '0 8px 24px -12px rgba(11,21,36,0.28)', fontSize: '12px' }}
              itemStyle={{ color: '#0b1524' }}
            />
            <Legend
              verticalAlign="bottom"
              height={40}
              iconType="square"
              iconSize={7}
              wrapperStyle={{ fontSize: '11.5px', color: '#4a5568' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

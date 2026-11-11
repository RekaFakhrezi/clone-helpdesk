'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useLanguage } from '@/context/LanguageContext';

type Ticket = any;
type Category = { id: string; name: string };
type Department = { id: string; name: string };
type TicketLog = any;

interface OperatorStatisticsProps {
  tickets: Ticket[];
  ticketLogs: TicketLog[];
  categories: Category[];
  departments: Department[];
}

const COLORS = [
  'rgba(8,87,178,1)',
  'rgba(195,212,236,1)',
  'rgba(0,45,114,0.85)',
  'rgba(8,87,178,0.55)',
  'rgba(11,21,36,0.45)',
  'rgba(195,212,236,0.7)',
  'rgba(8,87,178,0.28)',
  'rgba(11,21,36,0.22)',
];

export default function OperatorStatistics({
  tickets,
  ticketLogs,
  categories,
  departments,
}: OperatorStatisticsProps) {
  const { t } = useLanguage();
  // Chart Date Range (Global to Charts)
  const [chartStartDate, setChartStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [chartEndDate, setChartEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Table Date Range
  const [tableStartDate, setTableStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [tableEndDate, setTableEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [activeTab, setActiveTab] = useState<'department' | 'topics'>('department');

  // Filter Chart Data
  const filteredChartData = useMemo(() => {
    const start = new Date(chartStartDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(chartEndDate);
    end.setHours(23, 59, 59, 999);

    const validTickets = tickets.filter((t) => {
      const d = new Date(t.created_at);
      return d >= start && d <= end;
    });

    const validLogs = ticketLogs.filter((l) => {
      const d = new Date(l.created_at);
      return d >= start && d <= end;
    });

    return { validTickets, validLogs };
  }, [tickets, ticketLogs, chartStartDate, chartEndDate]);

  // Filter Table Data
  const filteredTableData = useMemo(() => {
    const start = new Date(tableStartDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(tableEndDate);
    end.setHours(23, 59, 59, 999);

    const validTickets = tickets.filter((t) => {
      const d = new Date(t.created_at);
      return d >= start && d <= end;
    });

    const validLogs = ticketLogs.filter((l) => {
      const d = new Date(l.created_at);
      return d >= start && d <= end;
    });

    return { validTickets, validLogs };
  }, [tickets, ticketLogs, tableStartDate, tableEndDate]);

  // Chart 1: Line Chart (Aktivitas Tiket)
  const lineChartData = useMemo(() => {
    const { validTickets, validLogs } = filteredChartData;
    const days: Record<string, { date: string; opened: number; verified: number }> = {};

    validTickets.forEach((t) => {
      const d = new Date(t.created_at).toISOString().split('T')[0];
      if (!days[d]) days[d] = { date: d, opened: 0, verified: 0 };
      days[d].opened += 1;
    });

    validLogs.forEach((l) => {
      if (l.action === 'CHANGE_STATUS' || l.action === 'REJECT_TICKET') {
        const d = new Date(l.created_at).toISOString().split('T')[0];
        if (!days[d]) days[d] = { date: d, opened: 0, verified: 0 };
        days[d].verified += 1;
      }
    });

    return Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredChartData]);

  // Chart 2: Donut Chart (Distribusi Help Topic / Kategori yang diverifikasi)
  const donutChartData = useMemo(() => {
    const { validLogs } = filteredChartData;
    const catCounts: Record<string, number> = {};

    validLogs.forEach((l) => {
      if (l.action === 'CHANGE_STATUS' || l.action === 'REJECT_TICKET') {
        const ticket = tickets.find((t) => t.id === l.ticket_id);
        if (ticket) {
          const catId = ticket.category_id || 'unassigned';
          if (!catCounts[catId]) catCounts[catId] = 0;
          catCounts[catId] += 1;
        }
      }
    });

    const data = Object.entries(catCounts).map(([catId, count]) => {
      if (catId === 'unassigned') return { name: t('charts.no_topic_data'), value: count };
      const cat = categories.find((c) => String(c.id) === String(catId));
      return { name: cat ? cat.name : 'Unknown', value: count };
    });

    return data.sort((a, b) => b.value - a.value); // Sort descending
  }, [filteredChartData, tickets, categories]);

  // Table Statistics
  const statsTable = useMemo(() => {
    const { validTickets, validLogs } = filteredTableData;
    
    const departMap: Record<string, any> = {};
    const topicMap: Record<string, any> = {};

    departments.forEach((d) => {
      departMap[d.id] = { name: d.name, opened: 0, assigned: 0, closed: 0 };
    });
    departMap['unassigned'] = { name: t('stats.department'), opened: 0, assigned: 0, closed: 0 };

    categories.forEach((c) => {
      topicMap[c.id] = { name: c.name, opened: 0, assigned: 0, closed: 0 };
    });
    topicMap['unassigned'] = { name: t('stats.topics'), opened: 0, assigned: 0, closed: 0 };

    validTickets.forEach((t) => {
      const depId = t.dept_id || 'unassigned';
      const catId = t.category_id || 'unassigned';
      if (departMap[depId]) departMap[depId].opened += 1;
      if (topicMap[catId]) topicMap[catId].opened += 1;
    });

    validLogs.forEach((l) => {
      const ticket = tickets.find(t => t.id === l.ticket_id);
      if (ticket) {
        const depId = ticket.dept_id || 'unassigned';
        const catId = ticket.category_id || 'unassigned';

        if (l.action === 'CHANGE_STATUS') {
          if (departMap[depId]) departMap[depId].assigned += 1;
          if (topicMap[catId]) topicMap[catId].assigned += 1;
        } else if (l.action === 'REJECT_TICKET') {
          if (departMap[depId]) departMap[depId].closed += 1;
          if (topicMap[catId]) topicMap[catId].closed += 1;
        }
      }
    });

    const departArray = Object.values(departMap).filter(d => d.opened > 0 || d.assigned > 0 || d.closed > 0);
    const topicArray = Object.values(topicMap).filter(t => t.opened > 0 || t.assigned > 0 || t.closed > 0);

    return { departments: departArray, topics: topicArray };
  }, [filteredTableData, departments, categories, tickets]);

  const activeStatsData = activeTab === 'department' ? statsTable.departments : statsTable.topics;

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--surface)] border border-[var(--rule-strong)] rounded-[4px] px-3 py-2 shadow-[var(--shadow-pop)]">
          <p className="text-[12px] font-medium text-[var(--fg)] mb-0.5">{payload[0].name}</p>
          <p className="text-[11.5px] text-[var(--fg-dim)] tabular-nums">{t('stats.total')}: <span className="font-medium text-[var(--fg)]">{payload[0].value} {t('stats.tickets_count')}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Chart Filter */}
      <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[4px] px-5 py-4 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">{t('stats.start_date')}</label>
          <input
            type="date"
            value={chartStartDate}
            onChange={(e) => setChartStartDate(e.target.value)}
            className="h-9 w-full sm:w-auto px-2.5 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12.5px] text-[var(--fg)] tabular-nums outline-none focus:border-[var(--accent)] transition-colors duration-150"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">{t('stats.end_date')}</label>
          <input
            type="date"
            value={chartEndDate}
            onChange={(e) => setChartEndDate(e.target.value)}
            className="h-9 w-full sm:w-auto px-2.5 rounded-[4px] border border-[var(--rule-strong)] bg-transparent text-[12.5px] text-[var(--fg)] tabular-nums outline-none focus:border-[var(--accent)] transition-colors duration-150"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:inline-flex items-center h-9 px-2.5 rounded-[3px] bg-[var(--canvas)] border border-[var(--rule)] text-[11.5px] text-[var(--fg-dim)] tabular-nums">
            {t('stats.range')}: {chartStartDate} - {chartEndDate}
          </div>
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 7);
              setChartStartDate(d.toISOString().split('T')[0]);
              setChartEndDate(new Date().toISOString().split('T')[0]);
            }}
            className="h-9 px-3 rounded-[4px] border border-[var(--rule-strong)] text-[12px] font-medium text-[var(--fg-dim)] hover:bg-[var(--canvas)] hover:text-[var(--fg)] transition-colors duration-150"
          >
            {t('common.reset')}
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[4px] lg:col-span-2">
          <div className="px-5 py-3.5 border-b border-[var(--rule)]">
            <h2 className="text-[13px] font-medium text-[var(--fg)]">{t('charts.activity_graph')}</h2>
          </div>
          <div className="h-72 w-full px-2 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 5, right: 12, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(11,21,36,0.08)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10.5, fill: 'rgba(98,108,121,1)' }}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10.5, fill: 'rgba(98,108,121,1)' }}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '4px', border: '1px solid rgba(11,21,36,0.18)', boxShadow: '0 8px 24px -12px rgba(11,21,36,0.28)', fontSize: '12px' }}
                  labelStyle={{ color: 'rgba(11,21,36,1)', fontSize: '11.5px' }}
                  itemStyle={{ fontSize: '11.5px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '11.5px' }} iconType="line" iconSize={10} />
                <Line type="monotone" name={t('charts.incoming_tickets')} dataKey="opened" stroke="rgba(8,87,178,1)" strokeWidth={2} activeDot={{ r: 4 }} dot={false} />
                <Line type="monotone" name={t('charts.verified_tickets')} dataKey="verified" stroke="rgba(195,212,236,1)" strokeWidth={2} activeDot={{ r: 4 }} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[4px] flex flex-col">
          <div className="px-5 py-3.5 border-b border-[var(--rule)]">
            <h2 className="text-[13px] font-medium text-[var(--fg)]">{t('charts.topic_distribution')}</h2>
            <p className="text-[11.5px] text-[var(--fg-faint)] mt-0.5">{t('charts.topic_desc')}</p>
          </div>
          <div className="flex-1 w-full h-64">
            {donutChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={donutChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="rgba(255,255,255,1)"
                    strokeWidth={1}
                    >
                    {donutChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{ fontSize: '11px', marginTop: '10px', color: 'rgba(98,108,121,1)' }}
                    />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex h-full items-center justify-center text-[12.5px] text-[var(--fg-faint)]">
                    {t('charts.no_topic_data')}
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Table */}
      <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[4px] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--rule)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-[13px] font-medium text-[var(--fg)]">
            {t('charts.stats_data')}
          </h2>
          {/* Internal Table Filters */}
          <div className="flex items-center gap-2">
             <div className="flex items-center border border-[var(--rule-strong)] rounded-[4px] h-9 overflow-hidden">
                <input
                    type="date"
                    value={tableStartDate}
                    onChange={(e) => setTableStartDate(e.target.value)}
                    className="h-9 px-2.5 bg-transparent text-[11.5px] text-[var(--fg-dim)] tabular-nums outline-none focus:text-[var(--fg)] border-0"
                />
                <div className="w-px h-4 bg-[var(--rule)] mx-0.5"></div>
                <input
                    type="date"
                    value={tableEndDate}
                    onChange={(e) => setTableEndDate(e.target.value)}
                    className="h-9 px-2.5 bg-transparent text-[11.5px] text-[var(--fg-dim)] tabular-nums outline-none focus:text-[var(--fg)] border-0"
                />
             </div>
             <button
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 7);
                  setTableStartDate(d.toISOString().split('T')[0]);
                  setTableEndDate(new Date().toISOString().split('T')[0]);
                }}
                className="h-9 px-2.5 rounded-[4px] border border-[var(--rule-strong)] text-[11.5px] font-medium text-[var(--fg-dim)] hover:bg-[var(--canvas)] hover:text-[var(--fg)] transition-colors duration-150"
              >
                {t('common.reset')}
              </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-[var(--rule)] px-2">
          <button 
            className={`px-3 py-2.5 text-[12px] font-medium transition-colors duration-150 border-b-2 -mb-[1px] ${activeTab === 'department' ? 'border-[var(--accent)] text-[var(--fg)]' : 'border-transparent text-[var(--fg-faint)] hover:text-[var(--fg-dim)]'}`}
            onClick={() => setActiveTab('department')}
          >
            {t('charts.department_tab')}
          </button>
          <button 
            className={`px-3 py-2.5 text-[12px] font-medium transition-colors duration-150 border-b-2 -mb-[1px] ${activeTab === 'topics' ? 'border-[var(--accent)] text-[var(--fg)]' : 'border-transparent text-[var(--fg-faint)] hover:text-[var(--fg-dim)]'}`}
            onClick={() => setActiveTab('topics')}
          >
            {t('charts.topics_tab')}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-[var(--rule)]">
              <tr>
                <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] w-1/3">{activeTab === 'department' ? t('charts.department_tab') : t('charts.topics_tab')}</th>
                <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] text-center">{t('stats.opened_header')} <span className="block normal-case tracking-normal text-[10px] font-normal mt-0.5">{t('stats.opened')}</span></th>
                <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] text-center">{t('stats.assigned_header')} <span className="block normal-case tracking-normal text-[10px] font-normal mt-0.5">{t('stats.assigned')}</span></th>
                <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] text-center">{t('stats.closed_header')} <span className="block normal-case tracking-normal text-[10px] font-normal mt-0.5">{t('stats.closed')}</span></th>
              </tr>
            </thead>
            <tbody>
              {activeStatsData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-[var(--fg-faint)] text-[12.5px]">{t('stats.no_data_period')}</td>
                </tr>
              ) : (
                activeStatsData.map((row, idx) => (
                  <tr key={idx} className="border-b border-[var(--rule)] hover:bg-[var(--canvas)] transition-colors duration-150">
                    <td className="px-4 py-3 text-[12.5px] font-medium text-[var(--fg)]">{row.name}</td>
                    <td className="px-4 py-3 text-[12.5px] text-center text-[var(--fg-dim)] tabular-nums">{row.opened}</td>
                    <td className="px-4 py-3 text-[12.5px] text-center text-[var(--fg-dim)] tabular-nums">{row.assigned}</td>
                    <td className="px-4 py-3 text-[12.5px] text-center text-[var(--fg-dim)] tabular-nums">{row.closed}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

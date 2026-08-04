'use client';

// Missing Migrants Project (IOM) cumulative deaths by route 2014-2024.
// Displayed as a horizontal bar chart with route commentary.

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { MIGRANT_SAFETY_ROUTES } from '../services/migrationCurated';
import { useViewportSize } from '../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
}

export default function MigrantSafetyTimeline({ isDarkMode }: Props) {
  const { isMobile } = useViewportSize();
  const rows = useMemo(() => [...MIGRANT_SAFETY_ROUTES].sort((a, b) => b.deathsRecorded - a.deathsRecorded), []);
  const total = rows.reduce((s, r) => s + r.deathsRecorded, 0);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: 6,
    color: isDarkMode ? '#f3f4f6' : '#111827',
    fontSize: 12,
  };

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>Migrant safety — Missing Migrants Project</div>
      <p className={`text-sm mb-4 ${textSec}`}>
        Cumulative recorded deaths + disappearances 2014-2024, by route (IOM). Total across eight routes: {total.toLocaleString()}. Under-reporting on the Sahara route is severe — true totals are 2-3× higher.
      </p>
      <div className={isMobile ? 'h-[360px]' : 'h-[440px]'}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={isMobile ? { top: 8, right: 8, bottom: 8, left: 90 } : { top: 10, right: 40, bottom: 10, left: 140 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis type="number" stroke={axis} tickFormatter={v => v.toLocaleString()} tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis type="category" dataKey="route" stroke={axis} width={isMobile ? 90 : 140} tick={{ fontSize: isMobile ? 9 : 11 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number, _n: string, e: any) => {
                const r = e?.payload as (typeof rows)[0];
                return [`${v.toLocaleString()} — origin: ${r?.primaryOrigin ?? '—'}`, 'Deaths recorded'];
              }}
            />
            <Bar dataKey="deathsRecorded" name="Deaths / disappearances" radius={[0, 4, 4, 0]}>
              {rows.map((entry, i) => (
                <Cell key={i} fill={entry.deathsRecorded >= 10000 ? '#dc2626' : entry.deathsRecorded >= 5000 ? '#f97316' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

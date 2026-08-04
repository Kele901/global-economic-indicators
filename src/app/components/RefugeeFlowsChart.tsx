'use client';

// Horizontal bar chart of the top-14 refugee-producing countries as of
// mid-2025 (UNHCR "Refugees + Others in need of international protection"
// by country of origin). Each bar shows the total stock in millions;
// hover reveals primary destination corridors.

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { REFUGEE_STOCKS_2025 } from '../services/migrationCurated';
import { useViewportSize } from '../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
}

export default function RefugeeFlowsChart({ isDarkMode }: Props) {
  const { isMobile } = useViewportSize();
  const data = [...REFUGEE_STOCKS_2025].sort((a, b) => b.refugeesMn - a.refugeesMn);

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

  const totalMn = data.reduce((s, r) => s + r.refugeesMn, 0);

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>Refugees by country of origin</div>
          <p className={`text-sm ${textSec}`}>UNHCR mid-2025. Millions displaced across borders. Total across these 14 origins: {totalMn.toFixed(1)}M.</p>
        </div>
      </div>
      <div className={isMobile ? 'h-[420px]' : 'h-[560px]'}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={isMobile ? { top: 8, right: 8, bottom: 8, left: 80 } : { top: 10, right: 40, bottom: 10, left: 110 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis type="number" stroke={axis} tickFormatter={v => `${v}M`} tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis type="category" dataKey="originLabel" stroke={axis} width={isMobile ? 80 : 110} tick={{ fontSize: isMobile ? 10 : 12 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, _name: string, entry: any) => {
                const row = entry?.payload as (typeof data)[0];
                return [`${value.toFixed(2)}M — dest: ${row?.primaryDestinations ?? '—'}`, 'Refugees'];
              }}
            />
            <Bar dataKey="refugeesMn" name="Refugees (M)" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.refugeesMn >= 5 ? '#dc2626' : entry.refugeesMn >= 2 ? '#f97316' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

'use client';

// Household debt-to-GDP chart. Bar chart of BIS 2024 household debt
// with a secondary line showing the change vs 2010 (percentage points).
// The change bar is coloured red when leverage has grown, green when
// households have deleveraged.

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ReferenceLine } from 'recharts';
import { HOUSEHOLD_DEBT_2024 } from '../services/debtCurated';
import { useViewportSize } from '../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
}

export default function HouseholdDebtChart({ isDarkMode }: Props) {
  const { isMobile } = useViewportSize();

  const data = [...HOUSEHOLD_DEBT_2024].sort((a, b) => b.pctGdp - a.pctGdp);

  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }
    : { backgroundColor: '#fff',    border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
      <h3 className={`text-base sm:text-lg font-semibold mb-1 ${text}`}>Household Debt Load</h3>
      <p className={`text-xs mb-4 ${muted}`}>
        Household + non-profit debt as % of GDP (BIS 2024). The line overlay tracks the change since 2010 — red bars mean the level has ballooned, green means households have deleveraged.
      </p>
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: isMobile ? 8 : 20, left: isMobile ? 0 : 10, bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="name" stroke={axis} tick={{ fontSize: isMobile ? 9 : 10 }} angle={-45} textAnchor="end" height={80} interval={0} />
            <YAxis yAxisId="left" stroke={axis} tick={{ fontSize: isMobile ? 9 : 11 }} tickFormatter={v => `${v}%`} />
            <YAxis yAxisId="right" orientation="right" stroke={axis} tick={{ fontSize: isMobile ? 9 : 11 }} tickFormatter={v => `${v > 0 ? '+' : ''}${v}pp`} />
            <Tooltip contentStyle={tooltipStyle} />
            {!isMobile && <Legend />}
            <ReferenceLine yAxisId="right" y={0} stroke={axis} />
            <Bar yAxisId="left" dataKey="pctGdp" name="Household debt (% GDP)" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.changeVs2010 > 15 ? '#dc2626' : d.changeVs2010 > 5 ? '#f97316' : d.changeVs2010 < -10 ? '#16a34a' : '#3b82f6'} />
              ))}
            </Bar>
            <Line yAxisId="right" type="monotone" dataKey="changeVs2010" name="Change vs 2010 (pp)" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

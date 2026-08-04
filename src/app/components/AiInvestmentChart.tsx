'use client';

// Stacked bar chart of AI private-market investment by country and
// year 2018-2024. Stanford AI Index + CB Insights.

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AI_INVESTMENT_2018_2024 } from '../services/aiCurated';
import { useViewportSize } from '../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
}

const SERIES = [
  { key: 'usa',         name: 'United States', color: '#2563eb' },
  { key: 'china',       name: 'China',         color: '#dc2626' },
  { key: 'uk',          name: 'United Kingdom', color: '#1e40af' },
  { key: 'israel',      name: 'Israel',        color: '#3b82f6' },
  { key: 'eu',          name: 'EU-27',         color: '#facc15' },
  { key: 'restOfWorld', name: 'Rest of world', color: '#8b5cf6' },
] as const;

export default function AiInvestmentChart({ isDarkMode }: Props) {
  const { isMobile } = useViewportSize();
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
      <h3 className={`text-base sm:text-lg font-semibold mb-1 ${text}`}>AI Private-Market Investment</h3>
      <p className={`text-xs mb-4 ${muted}`}>USD billions per year. US private investment in 2024 was more than the rest of the world combined — a scale gap that widened after ChatGPT.</p>
      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={AI_INVESTMENT_2018_2024} margin={{ top: 10, right: isMobile ? 8 : 20, left: isMobile ? 0 : 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="year" stroke={axis} tick={{ fontSize: isMobile ? 9 : 11 }} />
            <YAxis stroke={axis} tick={{ fontSize: isMobile ? 9 : 11 }} tickFormatter={v => `$${v}B`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`$${value.toFixed(1)}B`, '']} />
            {!isMobile && <Legend />}
            {SERIES.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.name}
                stackId="a"
                fill={s.color}
                radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

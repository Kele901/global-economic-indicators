'use client';

// Central bank balance sheet chart. Curated quarter-end snapshots
// (2007-2025) for the Fed / ECB / BOJ / PBOC. Line chart because the
// story is the shape — the 2020 blowout, the 2022 tightening — not
// the exact daily figure.

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea } from 'recharts';
import { CB_BALANCE_SHEETS_2007_2025 } from '../services/debtCurated';
import { useViewportSize } from '../hooks/useViewportSize';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

const TITLE = 'Central Bank Balance Sheets';

interface Props {
  isDarkMode: boolean;
}

const SERIES = [
  { key: 'fedUsdTn',  name: 'Federal Reserve', color: '#2563eb' },
  { key: 'ecbUsdTn',  name: 'ECB',            color: '#facc15' },
  { key: 'bojUsdTn',  name: 'Bank of Japan',  color: '#dc2626' },
  { key: 'pbocUsdTn', name: 'PBOC',           color: '#059669' },
] as const;

export default function CentralBankBalanceSheetChart({ isDarkMode }: Props) {
  const { isMobile } = useViewportSize();

  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }
    : { backgroundColor: '#fff',    border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

  const data = CB_BALANCE_SHEETS_2007_2025.map(d => ({
    date: d.date.slice(0, 7),
    fedUsdTn: d.fedUsdTn,
    ecbUsdTn: d.ecbUsdTn,
    bojUsdTn: d.bojUsdTn,
    pbocUsdTn: d.pbocUsdTn,
  }));

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div id={slugify(TITLE)} className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
        <h3 className={`text-base sm:text-lg font-semibold ${text}`}>{TITLE}</h3>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <SocialShareMenu title={TITLE} isDarkMode={isDarkMode} />
        </div>
      </div>
      <p className={`text-xs mb-4 ${muted}`}>USD trillions, quarter-end. Shaded zone marks the 2020-2021 pandemic QE surge.</p>
      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: isMobile ? 8 : 20, left: isMobile ? 0 : 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="date" stroke={axis} tick={{ fontSize: isMobile ? 9 : 11 }} />
            <YAxis stroke={axis} tick={{ fontSize: isMobile ? 9 : 11 }} tickFormatter={v => `$${v}T`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`$${value?.toFixed(2)}T`, '']} />
            {!isMobile && <Legend />}
            <ReferenceArea x1="2020-03" x2="2021-12" fill="#f59e0b" fillOpacity={0.08} />
            {SERIES.map(s => (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

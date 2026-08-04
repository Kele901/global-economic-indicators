'use client';

// Stacked area of climate-related disasters per year (1990-2024), by
// continent. Curated from EM-DAT (CRED / UCLouvain). Companion to the
// AirPollutionGrid on Chapter 7 of the Climate Ledger.

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { EMDAT_DISASTERS_1990_2024 } from '../services/climateCurated';
import { useViewportSize } from '../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
}

const REGIONS = [
  { key: 'asia',     label: 'Asia',     color: '#dc2626' },
  { key: 'americas', label: 'Americas', color: '#2563eb' },
  { key: 'africa',   label: 'Africa',   color: '#f59e0b' },
  { key: 'europe',   label: 'Europe',   color: '#7c3aed' },
  { key: 'oceania',  label: 'Oceania',  color: '#0891b2' },
] as const;

export default function DisasterTimelineChart({ isDarkMode }: Props) {
  const { isMobile } = useViewportSize();
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: 8 }
    : { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: 8 };
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';

  const first = EMDAT_DISASTERS_1990_2024[0];
  const last = EMDAT_DISASTERS_1990_2024[EMDAT_DISASTERS_1990_2024.length - 1];
  const growthPct = first.total > 0 ? ((last.total - first.total) / first.total) * 100 : 0;

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>
            Climate-related disasters · EM-DAT 1990-2024
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Floods, storms, droughts, wildfires and extreme temperature events. Grouped by continent.
          </p>
        </div>
        <div className={`text-xs ${textMuted}`}>
          {first.year} · {first.total} events → {last.year} · <span className="font-semibold text-rose-500">{last.total} events</span>
          <span className="ml-2">(+{growthPct.toFixed(0)}%)</span>
        </div>
      </div>
      <div className={isMobile ? 'h-[280px]' : 'h-[380px]'}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={EMDAT_DISASTERS_1990_2024}
            margin={
              isMobile
                ? { top: 8, right: 8, bottom: 8, left: 0 }
                : { top: 10, right: 20, bottom: 20, left: 10 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="year" stroke={axis} tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis stroke={axis} tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 36 : 60} />
            <Tooltip contentStyle={tooltipStyle} />
            {!isMobile && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {REGIONS.map(r => (
              <Area
                key={r.key}
                type="monotone"
                dataKey={r.key}
                name={r.label}
                stackId="1"
                stroke={r.color}
                fill={r.color}
                fillOpacity={0.55}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

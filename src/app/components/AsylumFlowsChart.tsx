'use client';

// EU-27 first-time asylum applications 2015-2024, annotated with the
// top country of origin each year. Ukraine is deliberately excluded
// from asylum stats since 2022 (routed via Temporary Protection).

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { EU_ASYLUM_APPLICATIONS } from '../services/migrationCurated';
import { useViewportSize } from '../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
}

export default function AsylumFlowsChart({ isDarkMode }: Props) {
  const { isMobile } = useViewportSize();
  const data = EU_ASYLUM_APPLICATIONS.map(r => ({
    ...r,
    label: `${r.year} · ${r.topOrigin}`,
  }));

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
      <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>EU-27 first-time asylum applications</div>
      <p className={`text-sm mb-4 ${textSec}`}>
        Eurostat migr_asyappctza, 2015-2024, thousands. Ukrainian arrivals since 2022 are handled under the EU&apos;s Temporary Protection Directive and are excluded from these stats.
      </p>
      <div className={isMobile ? 'h-[320px]' : 'h-[420px]'}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={isMobile ? { top: 8, right: 8, bottom: 8, left: 0 } : { top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="year" stroke={axis} tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis stroke={axis} tickFormatter={v => `${v}k`} tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 40 : 60} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number, _n: string, e: any) => {
                const r = e?.payload as (typeof data)[0];
                return [`${v}k — top origin ${r?.topOrigin ?? '—'} (${r?.topOriginShare ?? 0}%)`, 'Applications'];
              }}
            />
            <Bar dataKey="applicationsThousand" name="Applications (k)" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.applicationsThousand >= 1000 ? '#dc2626' : entry.applicationsThousand >= 700 ? '#f97316' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

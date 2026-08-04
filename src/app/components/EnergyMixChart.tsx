'use client';

// Stacked bar showing where electricity comes from for the top 15 emitters.
// Uses EG.ELC.COAL.ZS (coal) and EG.ELC.RNEW.ZS (renewables) from World
// Bank; the remaining share is labelled "Other" (gas, oil, nuclear). Data
// varies by country and vintage so we always show the latest available
// snapshot per country rather than forcing a common year.

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { CountryData } from '../services/worldbank';
import { CLIMATE_COUNTRY_META } from '../services/climateCurated';
import { latestEntry } from '../utils/countryData';
import { useViewportSize } from '../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
  elecFromCoal: CountryData[];
  elecFromRenewables: CountryData[];
}

interface Row {
  country: string;
  coal: number;
  renewables: number;
  other: number;
  latestYear: number;
}

export default function EnergyMixChart({ isDarkMode, elecFromCoal, elecFromRenewables }: Props) {
  const { isMobile } = useViewportSize();
  const rows: Row[] = useMemo(() => {
    return CLIMATE_COUNTRY_META
      .slice(0, 15)
      .map(meta => {
        const coalEntry = latestEntry(elecFromCoal, meta.wbKey);
        const renewEntry = latestEntry(elecFromRenewables, meta.wbKey);
        if (!coalEntry && !renewEntry) return null;
        const coal = coalEntry?.value ?? 0;
        const renewables = renewEntry?.value ?? 0;
        const other = Math.max(0, 100 - coal - renewables);
        const latestYear = Math.max(coalEntry?.year ?? 0, renewEntry?.year ?? 0);
        return { country: meta.name, coal, renewables, other, latestYear };
      })
      .filter((r): r is Row => r !== null)
      .sort((a, b) => b.coal - a.coal);
  }, [elecFromCoal, elecFromRenewables]);

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: 8 }
    : { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: 8 };
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  if (rows.length === 0) {
    return (
      <div className={`rounded-lg border p-6 text-sm ${cardBg} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Electricity-mix breakdown is temporarily unavailable — World Bank did not return coal or renewables data for the tracked economies.
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Electricity generation mix · latest available year per country
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Sorted by coal share (highest first). &quot;Other&quot; sweeps up gas, oil and nuclear — the residual that isn&apos;t coal or renewable.
        </p>
      </div>
      <div className={isMobile ? 'h-[420px]' : 'h-[520px]'}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={
              isMobile
                ? { top: 8, right: 8, bottom: 8, left: 60 }
                : { top: 10, right: 20, bottom: 10, left: 80 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis
              type="number"
              stroke={axis}
              tickFormatter={v => `${v}%`}
              domain={[0, 100]}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis
              type="category"
              dataKey="country"
              stroke={axis}
              width={isMobile ? 70 : 90}
              tick={{ fontSize: isMobile ? 9 : 11 }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: any, name: string) => [`${Number(v).toFixed(1)}%`, name]}
            />
            {!isMobile && <Legend wrapperStyle={{ fontSize: 11 }} />}
            <Bar dataKey="coal" name="Coal" stackId="mix" fill="#78350f" />
            <Bar dataKey="other" name="Other (gas / oil / nuclear)" stackId="mix" fill="#9ca3af" />
            <Bar dataKey="renewables" name="Renewables" stackId="mix" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

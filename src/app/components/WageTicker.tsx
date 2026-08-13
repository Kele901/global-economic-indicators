'use client';

import { useMemo } from 'react';
import { WAGES_2023, LABOR_COUNTRY_META } from '../services/laborCurated';
import ChartA11yCaption from './ChartA11yCaption';

interface Props { isDarkMode: boolean; }

export default function WageTicker({ isDarkMode }: Props) {
  const rows = useMemo(() => (
    [...WAGES_2023]
      .sort((a, b) => b.medianHourlyUsdPpp - a.medianHourlyUsdPpp)
      .slice(0, 15)
      .map(r => ({ ...r, name: LABOR_COUNTRY_META.find(m => m.code === r.code)?.name ?? r.code }))
  ), []);

  const bg = isDarkMode ? 'from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'from-white via-purple-50 to-white border-purple-100';

  return (
    <div className={`rounded-lg border bg-gradient-to-r overflow-hidden ${bg}`} role="marquee" aria-label="Top median wages by country">
      <ChartA11yCaption
        title="Median hourly wages, 2023 (USD PPP)"
        unit=" USD"
        precision={1}
        rows={rows.map(r => ({ label: r.name, value: r.medianHourlyUsdPpp }))}
      />
      <div className="flex gap-6 py-3 px-4 overflow-x-auto whitespace-nowrap text-sm">
        {rows.concat(rows).map((r, i) => {
          const growthColor = r.realWageGrowth2019to2023Pct >= 0 ? 'text-emerald-500' : 'text-rose-500';
          return (
            <span key={i} className="inline-flex items-center gap-2">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{r.name}</span>
              <span className={`tabular-nums font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${r.medianHourlyUsdPpp.toFixed(1)}/hr</span>
              <span className={`text-xs tabular-nums ${growthColor}`}>{r.realWageGrowth2019to2023Pct > 0 ? '+' : ''}{r.realWageGrowth2019to2023Pct.toFixed(1)}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

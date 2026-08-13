'use client';

import { useMemo } from 'react';
import { SPEND_OUTCOME_2023, HEALTH_COUNTRY_META } from '../services/healthCurated';

interface Props { isDarkMode: boolean; }

export default function HealthSpendTicker({ isDarkMode }: Props) {
  const rows = useMemo(() => {
    return [...SPEND_OUTCOME_2023]
      .sort((a, b) => b.healthSpendPerCapUsd - a.healthSpendPerCapUsd)
      .slice(0, 12)
      .map(r => ({ ...r, name: HEALTH_COUNTRY_META.find(m => m.code === r.code)?.name ?? r.code }));
  }, []);

  const bg = isDarkMode ? 'from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'from-white via-emerald-50 to-white border-emerald-100';

  return (
    <div className={`rounded-lg border bg-gradient-to-r overflow-hidden ${bg}`} role="marquee" aria-label="Top health spenders per capita">
      <div className="flex gap-6 py-3 px-4 overflow-x-auto whitespace-nowrap text-sm">
        {rows.concat(rows).map((r, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{r.name}</span>
            <span className={`tabular-nums font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${r.healthSpendPerCapUsd.toLocaleString()}</span>
            <span className={`text-xs ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{r.healthSpendPctGdp.toFixed(1)}% GDP</span>
          </span>
        ))}
      </div>
    </div>
  );
}

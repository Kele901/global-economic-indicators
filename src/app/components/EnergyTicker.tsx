'use client';

import { useMemo } from 'react';
import { RESERVES_2024, ENERGY_COUNTRY_META } from '../services/energyCurated';
import ChartA11yCaption from './ChartA11yCaption';

interface Props { isDarkMode: boolean; }

export default function EnergyTicker({ isDarkMode }: Props) {
  const rows = useMemo(() => (
    [...RESERVES_2024]
      .sort((a, b) => b.oilReservesBnBarrels - a.oilReservesBnBarrels)
      .slice(0, 12)
      .map(r => ({ ...r, name: ENERGY_COUNTRY_META.find(m => m.code === r.code)?.name ?? r.code }))
  ), []);

  const bg = isDarkMode ? 'from-gray-900 via-gray-800 to-gray-900 border-gray-700' : 'from-white via-amber-50 to-white border-amber-100';

  return (
    <div className={`rounded-lg border bg-gradient-to-r overflow-hidden ${bg}`} role="marquee" aria-label="Top oil-reserve holders">
      <ChartA11yCaption
        title="Top oil-reserve holders, 2024"
        unit=" Bbbl"
        precision={0}
        rows={rows.map(r => ({ label: r.name, value: r.oilReservesBnBarrels }))}
      />
      <div className="flex gap-6 py-3 px-4 overflow-x-auto whitespace-nowrap text-sm">
        {rows.concat(rows).map((r, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{r.name}</span>
            <span className={`tabular-nums font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{r.oilReservesBnBarrels.toFixed(0)}Bbbl</span>
            <span className={`text-xs ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{r.gasReservesTcf.toFixed(0)} Tcf gas</span>
          </span>
        ))}
      </div>
    </div>
  );
}

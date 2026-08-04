'use client';

// Grid of country cards showing foreign-born share of population, colour
// coded by category (Gulf labour, OECD immigration destination, city-
// state, OECD emigration source). Data from UN DESA International
// Migrant Stock 2024.

import { useMemo, useState } from 'react';
import { MIGRANT_STOCK_SHARE_2024 } from '../services/migrationCurated';

interface Props {
  isDarkMode: boolean;
}

type Category = 'all' | 'gulf-labour' | 'oecd-immigration' | 'city-state' | 'oecd-emigration' | 'other';

const CATEGORY_LABELS: Record<Category, string> = {
  all:                 'All',
  'gulf-labour':        'Gulf labour',
  'oecd-immigration':   'OECD (immigration)',
  'city-state':          'City-state',
  'oecd-emigration':     'OECD (emigration)',
  other:                 'Other',
};

const CATEGORY_COLOR: Record<string, string> = {
  'gulf-labour':      'bg-amber-500',
  'oecd-immigration': 'bg-emerald-500',
  'city-state':        'bg-violet-500',
  'oecd-emigration':   'bg-sky-500',
  other:               'bg-gray-500',
};

export default function MigrantStocksGrid({ isDarkMode }: Props) {
  const [cat, setCat] = useState<Category>('all');

  const rows = useMemo(() => {
    const filtered = cat === 'all' ? MIGRANT_STOCK_SHARE_2024 : MIGRANT_STOCK_SHARE_2024.filter(r => r.category === cat);
    return [...filtered].sort((a, b) => b.migrantSharePct - a.migrantSharePct);
  }, [cat]);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const tileBg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200';

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>Migrant stock — % of population</div>
          <p className={`text-sm ${textSec}`}>UN DESA 2024. Gulf states top the chart (labour visas); OECD destinations follow (permanent residence).</p>
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by category">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={`text-[11px] px-2 py-1 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                cat === c
                  ? (isDarkMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-600 border-blue-600 text-white')
                  : (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {rows.map(r => (
          <div key={r.country} className={`rounded-lg border p-3 ${tileBg}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{r.countryLabel}</div>
              <div className={`w-2 h-2 rounded-full ${CATEGORY_COLOR[r.category]}`} aria-hidden="true" />
            </div>
            <div className={`text-2xl font-bold tabular-nums ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {r.migrantSharePct.toFixed(1)}%
            </div>
            <div className={`text-xs ${textSec}`}>{r.foreignBornMn.toFixed(1)}M foreign-born</div>
          </div>
        ))}
      </div>
    </div>
  );
}

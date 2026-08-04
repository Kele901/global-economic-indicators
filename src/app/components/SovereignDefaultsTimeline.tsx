'use client';

// Vertical timeline of sovereign default / restructuring events since
// 2000. Sourced from the Bank of Canada Sovereign Default Database and
// Reinhart-Rogoff — baked into debtCurated. Filterable by type.

import { useMemo, useState } from 'react';
import { SOVEREIGN_DEFAULTS_2000_2024 } from '../services/debtCurated';

interface Props {
  isDarkMode: boolean;
}

type Filter = 'all' | 'external' | 'domestic' | 'both';

const TYPE_COLORS: Record<string, string> = {
  external: '#dc2626',
  domestic: '#f97316',
  both:     '#7c3aed',
};

export default function SovereignDefaultsTimeline({ isDarkMode }: Props) {
  const [filter, setFilter] = useState<Filter>('all');

  const events = useMemo(() => {
    const list = filter === 'all' ? SOVEREIGN_DEFAULTS_2000_2024 : SOVEREIGN_DEFAULTS_2000_2024.filter(d => d.type === filter);
    return [...list].sort((a, b) => b.year - a.year);
  }, [filter]);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const btnBase = 'text-xs px-3 py-1.5 rounded-md border transition-colors';
  const btnActive = isDarkMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-600 border-blue-600 text-white';
  const btnIdle = isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white' : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900';

  return (
    <div className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className={`text-base sm:text-lg font-semibold ${text}`}>Sovereign Default Timeline</h3>
          <p className={`text-xs ${muted}`}>Full or selective defaults / distress exchanges since 2000. Colour codes external, domestic, or combined restructurings.</p>
        </div>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter defaults by type">
          {(['all', 'external', 'domestic', 'both'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`${btnBase} ${filter === f ? btnActive : btnIdle}`}
              aria-pressed={filter === f}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <ol className="relative border-l ml-3" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
        {events.map((e, i) => (
          <li key={`${e.iso3}-${e.year}-${i}`} className="mb-6 ml-6">
            <span
              className="absolute -left-2 w-4 h-4 rounded-full ring-4"
              style={{ backgroundColor: TYPE_COLORS[e.type], boxShadow: isDarkMode ? '0 0 0 4px #1f2937' : '0 0 0 4px #fff' }}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-baseline gap-2 mb-1">
              <span className={`text-lg font-semibold tabular-nums ${text}`}>{e.year}</span>
              <span className={`text-base font-medium ${text}`}>{e.country}</span>
              {e.amountUsdBn !== null && (
                <span className={`text-xs ${muted}`}>${e.amountUsdBn.toFixed(1)}bn restructured</span>
              )}
              <span
                className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
                style={{ backgroundColor: `${TYPE_COLORS[e.type]}22`, color: TYPE_COLORS[e.type] }}
              >
                {e.type}
              </span>
            </div>
            <p className={`text-sm ${muted}`}>{e.notes}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

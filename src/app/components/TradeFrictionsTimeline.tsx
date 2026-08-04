'use client';

// Chronological timeline of major trade-war and sanctions events since
// 2018. Rendered as a vertical stack of pill-shaped rows colour-coded by
// severity (1-5) and category (tariff / sanction / export control /
// chokepoint / wto).

import { useMemo, useState } from 'react';
import { TRADE_FRICTIONS_TIMELINE } from '../services/tradeCurated';

interface Props {
  isDarkMode: boolean;
}

const CATEGORY_STYLES: Record<string, { light: string; dark: string; label: string }> = {
  tariff:          { light: 'bg-amber-100 text-amber-800 border-amber-200',    dark: 'bg-amber-900/30 text-amber-300 border-amber-700',    label: 'Tariff' },
  sanction:        { light: 'bg-rose-100 text-rose-800 border-rose-200',       dark: 'bg-rose-900/30 text-rose-300 border-rose-700',       label: 'Sanction' },
  'export control':{ light: 'bg-violet-100 text-violet-800 border-violet-200', dark: 'bg-violet-900/30 text-violet-300 border-violet-700', label: 'Export control' },
  chokepoint:      { light: 'bg-sky-100 text-sky-800 border-sky-200',          dark: 'bg-sky-900/30 text-sky-300 border-sky-700',          label: 'Chokepoint' },
  wto:             { light: 'bg-emerald-100 text-emerald-800 border-emerald-200', dark: 'bg-emerald-900/30 text-emerald-300 border-emerald-700', label: 'WTO' },
};

export default function TradeFrictionsTimeline({ isDarkMode }: Props) {
  const [minSev, setMinSev] = useState<1 | 2 | 3 | 4 | 5>(1);

  const rows = useMemo(() =>
    TRADE_FRICTIONS_TIMELINE
      .filter(e => e.severity >= minSev)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [minSev]);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>Trade frictions timeline</div>
          <p className={`text-sm ${textSec}`}>Major tariff, sanctions, export-control and chokepoint events since 2018.</p>
        </div>
        <div className="flex items-center gap-2" role="group" aria-label="Filter by severity">
          <span className={`text-xs ${textMuted}`}>Severity ≥</span>
          {([1, 2, 3, 4, 5] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setMinSev(s)}
              aria-pressed={minSev === s}
              className={`text-xs w-7 h-7 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                minSev === s
                  ? (isDarkMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-600 border-blue-600 text-white')
                  : (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <ol className="relative border-l-2 pl-4 space-y-3" style={{ borderColor: isDarkMode ? '#4b5563' : '#e5e7eb' }}>
        {rows.map((e, i) => {
          const style = CATEGORY_STYLES[e.category];
          const badgeClass = isDarkMode ? style.dark : style.light;
          return (
            <li key={`${e.date}-${i}`} className="relative">
              <div
                className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 ${
                  isDarkMode ? 'border-gray-800' : 'border-white'
                }`}
                style={{ backgroundColor: ['#22c55e', '#84cc16', '#f59e0b', '#f97316', '#dc2626'][e.severity - 1] }}
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-baseline gap-2 mb-0.5">
                <span className={`text-xs font-mono ${textMuted}`}>{e.date}</span>
                <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border ${badgeClass}`}>
                  {style.label}
                </span>
                <span className={`text-[10px] ${textMuted}`}>· severity {e.severity}/5</span>
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{e.headline}</div>
              <div className={`text-xs ${textMuted}`}>{e.actors}</div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

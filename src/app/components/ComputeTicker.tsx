'use client';

// Scrolling ticker of notable model producers by country. Uses the
// NOTABLE_MODELS_2019_2024 curated data (Stanford AI Index) as the
// authoritative count, and the World Bank IP.PAT.RESD indicator for
// AI patents when available. Mirrors the ExportTicker / DebtLoadTicker
// pattern.

import { useMemo } from 'react';
import { NOTABLE_MODELS_2019_2024, AI_COUNTRY_META, type NotableModelsByCountry } from '../services/aiCurated';
import Sparkline from './Sparkline';

interface Props {
  isDarkMode: boolean;
}

interface Row {
  iso3: string;
  name: string;
  color: string;
  latest: number;
  prior: number;
  totalCareer: number;
  spark: { value: number }[];
  rank: number;
}

function toSpark(r: NotableModelsByCountry): { value: number }[] {
  return [
    { value: r.models2019 }, { value: r.models2020 }, { value: r.models2021 },
    { value: r.models2022 }, { value: r.models2023 }, { value: r.models2024 },
  ];
}

export default function ComputeTicker({ isDarkMode }: Props) {
  const rows: Row[] = useMemo(() => {
    return NOTABLE_MODELS_2019_2024
      .map(r => {
        const meta = AI_COUNTRY_META.find(m => m.iso3 === r.iso3);
        const total = r.models2019 + r.models2020 + r.models2021 + r.models2022 + r.models2023 + r.models2024;
        return {
          iso3: r.iso3,
          name: r.name,
          color: meta?.color ?? '#6b7280',
          latest: r.models2024,
          prior: r.models2023,
          totalCareer: total,
          spark: toSpark(r),
        };
      })
      .sort((a, b) => b.latest - a.latest || b.totalCareer - a.totalCareer)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, []);

  const doubled = [...rows, ...rows];

  return (
    <div
      className={`relative overflow-hidden rounded-lg border ${
        isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}
      role="region"
      aria-label="Notable ML model producers — scrolling ticker"
    >
      <div className="ticker-track flex items-center gap-8 py-3 px-6 whitespace-nowrap" aria-live="off">
        {doubled.map((r, i) => {
          const delta = r.latest - r.prior;
          const up = delta >= 0;
          return (
            <div
              key={`${r.iso3}-${i}`}
              className="flex items-center gap-3 flex-shrink-0"
              role="group"
              aria-label={`${r.name}: ${r.latest} notable ML models in 2024, ${r.totalCareer} since 2019`}
              aria-hidden={i >= rows.length ? 'true' : undefined}
            >
              <div className={`text-[10px] font-bold w-4 text-right ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{r.rank}</div>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} aria-hidden="true" />
              <div className="flex flex-col leading-tight">
                <span className={`text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{r.name}</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-sm font-semibold tabular-nums ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{r.latest} models</span>
                  <span className={`text-xs font-medium tabular-nums ${up ? 'text-emerald-500' : 'text-rose-500'}`}>{up ? '▲' : '▼'} {Math.abs(delta)}</span>
                </div>
              </div>
              <Sparkline points={r.spark} isDarkMode={isDarkMode} ariaLabel={`${r.name} notable-model releases 2019-2024`} />
              <span className={`text-[10px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{r.totalCareer} total</span>
            </div>
          );
        })}
      </div>
      <div className={`absolute left-0 top-0 bottom-0 w-16 pointer-events-none ${isDarkMode ? 'bg-gradient-to-r from-gray-900' : 'bg-gradient-to-r from-white'}`} />
      <div className={`absolute right-0 top-0 bottom-0 w-16 pointer-events-none ${isDarkMode ? 'bg-gradient-to-l from-gray-900' : 'bg-gradient-to-l from-white'}`} />
      <style jsx>{`
        .ticker-track { animation: compute-ticker-scroll 110s linear infinite; width: max-content; }
        .ticker-track:hover { animation-play-state: paused; }
        @keyframes compute-ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

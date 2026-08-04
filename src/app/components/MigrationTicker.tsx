'use client';

// Scrolling ticker of the top-15 remittance-receiving economies.
// Uses the World Bank BX.TRF.PWKR.CD.DT series (personal remittances
// received, current USD). Mirrors the EmissionsTicker pattern.

import { useMemo } from 'react';
import type { CountryData } from '../services/worldbank';
import { MIGRATION_COUNTRY_META } from '../services/migrationCurated';
import { latestEntry } from '../utils/countryData';
import Sparkline from './Sparkline';

interface Props {
  isDarkMode: boolean;
  remittances: CountryData[];
  loading?: boolean;
  onRetry?: () => void;
}

interface Row {
  iso3: string;
  wbKey: string;
  name: string;
  color: string;
  latest: { year: number; value: number };
  prior: { year: number; value: number } | null;
  spark: { value: number }[];
  rank: number;
}

function lastN(series: CountryData[], key: string, n: number): { value: number }[] {
  const out: { value: number }[] = [];
  for (let i = series.length - 1; i >= 0 && out.length < n; i--) {
    const v = Number(series[i][key]);
    if (!Number.isNaN(v) && v > 0) out.push({ value: v });
  }
  return out.reverse();
}

function priorEntry(series: CountryData[], key: string): { year: number; value: number } | null {
  let seenLatest = false;
  for (let i = series.length - 1; i >= 0; i--) {
    const v = Number(series[i][key]);
    if (Number.isNaN(v) || v <= 0) continue;
    if (!seenLatest) { seenLatest = true; continue; }
    return { year: Number(series[i].year), value: v };
  }
  return null;
}

function formatUsd(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toFixed(0)}`;
}

function formatDelta(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(pct >= 10 || pct <= -10 ? 1 : 2)}%`;
}

export default function MigrationTicker({ isDarkMode, remittances, loading, onRetry }: Props) {
  const rows: Row[] = useMemo(() => {
    if (!remittances || remittances.length === 0) return [];

    const raw = MIGRATION_COUNTRY_META
      .map(meta => {
        const latest = latestEntry(remittances, meta.wbKey);
        if (!latest) return null;
        return {
          iso3: meta.iso3,
          wbKey: meta.wbKey,
          name: meta.name,
          color: meta.color,
          latest,
          prior: priorEntry(remittances, meta.wbKey),
          spark: lastN(remittances, meta.wbKey, 10),
        };
      })
      .filter((r): r is Omit<Row, 'rank'> => r !== null);

    return raw
      .sort((a, b) => b.latest.value - a.latest.value)
      .slice(0, 15)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [remittances]);

  if (loading) {
    return <div className={`h-16 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />;
  }

  if (rows.length === 0) {
    return (
      <div className={`h-16 rounded-lg border flex items-center justify-center gap-4 text-sm px-4 ${
        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
      }`}>
        <span>Remittance data is temporarily unavailable.</span>
        {onRetry && (
          <button
            onClick={onRetry}
            aria-label="Retry loading remittance data"
            className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-transparent ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const doubled = [...rows, ...rows];

  return (
    <div
      className={`relative overflow-hidden rounded-lg border ${
        isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}
      role="region"
      aria-label="Top-15 remittance-receiving economies — scrolling ticker"
    >
      <div
        className="ticker-track flex items-center gap-8 py-3 px-6 whitespace-nowrap"
        aria-live="off"
      >
        {doubled.map((r, i) => {
          const yoyPct = r.prior && r.prior.value !== 0
            ? ((r.latest.value - r.prior.value) / r.prior.value) * 100
            : null;
          const up = yoyPct != null && yoyPct >= 0;
          const yoyText = yoyPct != null
            ? `${up ? 'up' : 'down'} ${Math.abs(yoyPct).toFixed(2)} percent year on year`
            : 'year-on-year change unavailable';
          const ariaLabel = `${r.name}: ${formatUsd(r.latest.value)} in remittances received ${r.latest.year}, ${yoyText}`;

          return (
            <div
              key={`${r.iso3}-${i}`}
              className="flex items-center gap-3 flex-shrink-0"
              role="group"
              aria-label={ariaLabel}
              aria-hidden={i >= rows.length ? 'true' : undefined}
            >
              <div className={`text-[10px] font-bold w-4 text-right ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {r.rank}
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} aria-hidden="true" />
              <div className="flex flex-col leading-tight">
                <span className={`text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {r.name}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-sm font-semibold tabular-nums ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatUsd(r.latest.value)}
                  </span>
                  {yoyPct != null && (
                    <span className={`text-xs font-medium tabular-nums ${up ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {up ? '▲' : '▼'} {formatDelta(yoyPct)}
                    </span>
                  )}
                </div>
              </div>
              <Sparkline
                points={r.spark}
                isDarkMode={isDarkMode}
                ariaLabel={`${r.name} 10-year remittances received`}
              />
              <span className={`text-[10px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{r.latest.year}</span>
            </div>
          );
        })}
      </div>
      <div className={`absolute left-0 top-0 bottom-0 w-16 pointer-events-none ${
        isDarkMode ? 'bg-gradient-to-r from-gray-900' : 'bg-gradient-to-r from-white'
      }`} />
      <div className={`absolute right-0 top-0 bottom-0 w-16 pointer-events-none ${
        isDarkMode ? 'bg-gradient-to-l from-gray-900' : 'bg-gradient-to-l from-white'
      }`} />

      <style jsx>{`
        .ticker-track {
          animation: migration-ticker-scroll 130s linear infinite;
          width: max-content;
        }
        .ticker-track:hover { animation-play-state: paused; }
        @keyframes migration-ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

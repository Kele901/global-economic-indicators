'use client';

// Scrolling ticker of the top-15 emitters by absolute CO2 (kt), mirroring
// the DefenseSpendingTicker pattern. Uses the World Bank EN.ATM.CO2E.KT
// series and defaults to a % of world total badge alongside each row.

import { useMemo } from 'react';
import type { CountryData } from '../services/worldbank';
import { CLIMATE_COUNTRY_META } from '../services/climateCurated';
import { latestEntry } from '../utils/countryData';
import Sparkline from './Sparkline';

interface Props {
  isDarkMode: boolean;
  co2EmissionsKt: CountryData[];
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
  worldSharePct: number;
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

function formatKt(kt: number): string {
  const gt = kt / 1_000_000;
  if (gt >= 1) return `${gt.toFixed(2)} GtCO₂`;
  const mt = kt / 1_000;
  return `${mt.toFixed(0)} MtCO₂`;
}

function formatDelta(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(pct >= 10 || pct <= -10 ? 1 : 2)}%`;
}

export default function EmissionsTicker({ isDarkMode, co2EmissionsKt, loading, onRetry }: Props) {
  const rows: Row[] = useMemo(() => {
    if (!co2EmissionsKt || co2EmissionsKt.length === 0) return [];

    const raw = CLIMATE_COUNTRY_META
      .map(meta => {
        const latest = latestEntry(co2EmissionsKt, meta.wbKey);
        if (!latest) return null;
        return {
          iso3: meta.iso3,
          wbKey: meta.wbKey,
          name: meta.name,
          color: meta.color,
          latest,
          prior: priorEntry(co2EmissionsKt, meta.wbKey),
          spark: lastN(co2EmissionsKt, meta.wbKey, 10),
        };
      })
      .filter((r): r is Omit<Row, 'rank' | 'worldSharePct'> => r !== null);

    const worldTotal = raw.reduce((s, r) => s + r.latest.value, 0);

    return raw
      .sort((a, b) => b.latest.value - a.latest.value)
      .slice(0, 15)
      .map((r, i) => ({
        ...r,
        rank: i + 1,
        worldSharePct: worldTotal > 0 ? (r.latest.value / worldTotal) * 100 : 0,
      }));
  }, [co2EmissionsKt]);

  if (loading) {
    return <div className={`h-16 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />;
  }

  if (rows.length === 0) {
    return (
      <div className={`h-16 rounded-lg border flex items-center justify-center gap-4 text-sm px-4 ${
        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
      }`}>
        <span>Emissions data is temporarily unavailable.</span>
        {onRetry && (
          <button
            onClick={onRetry}
            aria-label="Retry loading CO2 emissions data"
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
      aria-label="Top-15 CO2 emitters — scrolling live ticker"
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
          const ariaLabel = `${r.name}: ${formatKt(r.latest.value)} in ${r.latest.year}, ${r.worldSharePct.toFixed(1)} percent of tracked world total, ${yoyText}`;

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
                    {formatKt(r.latest.value)}
                  </span>
                  <span className={`text-[10px] tabular-nums ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {r.worldSharePct.toFixed(1)}%
                  </span>
                  {yoyPct != null && (
                    <span className={`text-xs font-medium tabular-nums ${up ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {up ? '▲' : '▼'} {formatDelta(yoyPct)}
                    </span>
                  )}
                </div>
              </div>
              <Sparkline
                points={r.spark}
                isDarkMode={isDarkMode}
                ariaLabel={`${r.name} 10-year CO2 emissions`}
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
          animation: emissions-ticker-scroll 130s linear infinite;
          width: max-content;
        }
        .ticker-track:hover { animation-play-state: paused; }
        @keyframes emissions-ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

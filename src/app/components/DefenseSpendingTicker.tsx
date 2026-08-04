'use client';

import { useMemo } from 'react';
import type { CountryData } from '../services/worldbank';
import { DEFENSE_COUNTRY_META } from '../services/defenseCurated';
import Sparkline from './Sparkline';

interface Props {
  isDarkMode: boolean;
  militaryExpenditureUsd: CountryData[];    // MS.MIL.XPND.CD, current US$
  militaryExpenditurePctGdp?: CountryData[]; // MS.MIL.XPND.GD.ZS — fallback if USD unavailable
  loading?: boolean;
  onRetry?: () => void;
}

type DisplayUnit = 'usd' | 'pct_gdp';

interface TickerRow {
  iso3: string;
  wbKey: string;
  name: string;
  color: string;
  latest: { year: number; value: number } | null;
  prior: { year: number; value: number } | null;
  spark: { value: number }[]; // last 5 annual points
  rank: number;
}

function latestNonZero(series: CountryData[], key: string): { year: number; value: number } | null {
  for (let i = series.length - 1; i >= 0; i--) {
    const v = Number(series[i][key]);
    if (!isNaN(v) && v > 0) return { year: Number(series[i].year), value: v };
  }
  return null;
}

function lastNValues(series: CountryData[], key: string, n: number): { value: number }[] {
  const out: { value: number }[] = [];
  for (let i = series.length - 1; i >= 0 && out.length < n; i--) {
    const v = Number(series[i][key]);
    if (!isNaN(v) && v > 0) out.push({ value: v });
  }
  return out.reverse();
}

function formatCurrency(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9)  return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6)  return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatDelta(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(pct >= 10 || pct <= -10 ? 1 : 2)}%`;
}

export default function DefenseSpendingTicker({
  isDarkMode,
  militaryExpenditureUsd,
  militaryExpenditurePctGdp,
  loading,
  onRetry,
}: Props) {
  // Prefer the USD series; fall back to % of GDP when the World Bank USD
  // indicator is unavailable (e.g. Akamai WAF blocks — WB does this
  // periodically on newer series like MS.MIL.XPND.CD).
  const { series, unit } = useMemo<{ series: CountryData[]; unit: DisplayUnit }>(() => {
    if (militaryExpenditureUsd && militaryExpenditureUsd.length > 0) {
      const anyValue = militaryExpenditureUsd.some(row =>
        Object.keys(row).some(k => k !== 'year' && Number(row[k]) > 0),
      );
      if (anyValue) return { series: militaryExpenditureUsd, unit: 'usd' };
    }
    if (militaryExpenditurePctGdp && militaryExpenditurePctGdp.length > 0) {
      return { series: militaryExpenditurePctGdp, unit: 'pct_gdp' };
    }
    return { series: [], unit: 'usd' };
  }, [militaryExpenditureUsd, militaryExpenditurePctGdp]);

  const formatValue = unit === 'usd' ? formatCurrency : formatPercent;

  const rows: TickerRow[] = useMemo(() => {
    if (!series || series.length === 0) return [];

    const raw: Omit<TickerRow, 'rank'>[] = [];
    DEFENSE_COUNTRY_META.forEach(meta => {
      const latest = latestNonZero(series, meta.wbKey);
      if (!latest) return;
      const spark = lastNValues(series, meta.wbKey, 5);
      // Prior year: the second-most-recent non-zero value, ignoring the same year as latest
      let prior: { year: number; value: number } | null = null;
      let sawLatest = false;
      for (let i = series.length - 1; i >= 0; i--) {
        const v = Number(series[i][meta.wbKey]);
        if (isNaN(v) || v <= 0) continue;
        if (!sawLatest) { sawLatest = true; continue; }
        prior = { year: Number(series[i].year), value: v };
        break;
      }
      raw.push({
        iso3: meta.iso3,
        wbKey: meta.wbKey,
        name: meta.name,
        color: meta.color,
        latest,
        prior,
        spark,
      });
    });

    const sorted = raw
      .filter(r => r.latest)
      .sort((a, b) => (b.latest?.value ?? 0) - (a.latest?.value ?? 0))
      .slice(0, 15)
      .map((r, i) => ({ ...r, rank: i + 1 }));

    return sorted;
  }, [series]);

  if (loading) {
    return <div className={`h-16 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />;
  }

  if (rows.length === 0) {
    return (
      <div className={`h-16 rounded-lg border flex items-center justify-center gap-4 text-sm px-4 ${
        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
      }`}>
        <span>Defense spending data is temporarily unavailable.</span>
        {onRetry && (
          <button
            onClick={onRetry}
            aria-label="Retry loading defense spending data"
            className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-transparent ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
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
      aria-label="Top-15 defense spenders — scrolling live ticker"
    >
      {unit === 'pct_gdp' && (
        <div
          role="status"
          className={`px-4 py-1.5 text-[11px] border-b ${
            isDarkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}
        >
          Ranked by military expenditure as % of GDP — World Bank absolute-dollar series is temporarily unavailable.
        </div>
      )}
      <div
        className="ticker-track flex items-center gap-8 py-3 px-6 whitespace-nowrap"
        aria-live="off"
      >
        {doubled.map((r, i) => {
          const latest = r.latest;
          if (!latest) return null;
          const yoyPct = r.prior && r.prior.value !== 0
            ? ((latest.value - r.prior.value) / r.prior.value) * 100
            : null;
          const up = yoyPct != null && yoyPct >= 0;
          const yoyText = yoyPct != null
            ? `${up ? 'up' : 'down'} ${Math.abs(yoyPct).toFixed(2)} percent year on year`
            : 'year-on-year change unavailable';
          const ariaLabel = `${r.name}: ${formatValue(latest.value)} in ${latest.year}, ${yoyText}`;

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
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: r.color }}
                aria-hidden="true"
              />
              <div className="flex flex-col leading-tight">
                <span className={`text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {r.name}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-sm font-semibold tabular-nums ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatValue(latest.value)}
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
                ariaLabel={`${r.name} 5-year defense spending`}
              />
              <span className={`text-[10px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {latest.year}
              </span>
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
          animation: ticker-scroll 120s linear infinite;
          width: max-content;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

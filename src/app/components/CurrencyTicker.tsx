'use client';

import { useMemo } from 'react';
import type { CurrencyRateHistory, FxCategory } from '../services/currencyRates';
import Sparkline from './Sparkline';

interface Props {
  isDarkMode: boolean;
  rates: { [id: string]: CurrencyRateHistory };
  loading?: boolean;
}

// FX display precision:
//   pairs whose typical value is <10 (EUR/USD, GBP/USD, AUD, NZD, CHF, CAD) -> 4dp
//   pairs 10-999 (JPY, INR, MXN) -> 2dp
//   fallback -> 4dp
function formatRate(value: number): string {
  const digits = value < 10 ? 4 : value < 1000 ? 2 : 4;
  return value.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function formatDelta(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(pct >= 10 || pct <= -10 ? 1 : 2)}%`;
}

const CATEGORY_LABEL: Record<FxCategory, string> = {
  majors: 'MAJOR',
  em: 'EM',
  crosses: 'CROSS',
};

function categoryChipClasses(category: FxCategory, isDarkMode: boolean): string {
  const base = 'text-[9px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded';
  switch (category) {
    case 'majors':
      return `${base} ${isDarkMode ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-50 text-blue-600'}`;
    case 'em':
      return `${base} ${isDarkMode ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-50 text-amber-700'}`;
    case 'crosses':
      return `${base} ${isDarkMode ? 'bg-violet-500/15 text-violet-300' : 'bg-violet-50 text-violet-700'}`;
  }
}

function LiveBadge({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
        isDarkMode ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-600'
      }`}
      title="Same-day ECB reference rate (via Frankfurter)"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
      LIVE
    </span>
  );
}

export default function CurrencyTicker({ isDarkMode, rates, loading }: Props) {
  const items = useMemo(() => Object.values(rates), [rates]);

  if (loading) {
    return (
      <div className={`h-16 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
    );
  }

  if (items.length === 0) {
    return (
      <div className={`h-16 rounded-lg border flex items-center justify-center text-sm ${
        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
      }`}>
        Live FX rates unavailable.
      </div>
    );
  }

  const doubled = [...items, ...items];

  return (
    <div
      className={`relative overflow-hidden rounded-lg border ${
        isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}
      role="region"
      aria-label="Live foreign exchange rates — scrolling ticker"
    >
      <div
        className="ticker-track flex items-center gap-8 py-3 px-6 whitespace-nowrap"
        aria-live="off"
      >
        {doubled.map((h, i) => {
          const latest = h.latest;
          const prior = h.latestPrior;
          const ytdStart = h.ytdStart;
          if (!latest) return null;

          const dayPct = prior && prior.value !== 0
            ? ((latest.value - prior.value) / prior.value) * 100
            : null;
          const ytdPct = ytdStart && ytdStart.value !== 0
            ? ((latest.value - ytdStart.value) / ytdStart.value) * 100
            : null;

          const dayUp = dayPct != null && dayPct >= 0;
          const dayText = dayPct != null
            ? `${dayUp ? 'up' : 'down'} ${Math.abs(dayPct).toFixed(2)} percent since prior close`
            : 'daily change unavailable';
          const ariaLabel = `${h.meta.pair}: ${formatRate(latest.value)} on ${latest.date}, ${dayText}`;

          return (
            <div
              key={`${h.meta.id}-${i}`}
              className="flex items-center gap-3 flex-shrink-0"
              role="group"
              aria-label={ariaLabel}
              aria-hidden={i >= items.length ? 'true' : undefined}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: h.meta.color }}
                aria-hidden="true"
              />
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {h.meta.pair}
                  </span>
                  <span className={categoryChipClasses(h.meta.category, isDarkMode)}>
                    {CATEGORY_LABEL[h.meta.category]}
                  </span>
                  {h.liveSource === 'Frankfurter' && <LiveBadge isDarkMode={isDarkMode} />}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-sm font-semibold tabular-nums ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatRate(latest.value)}
                  </span>
                  {dayPct != null && (
                    <span className={`text-xs font-medium tabular-nums ${dayUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {dayUp ? '▲' : '▼'} {formatDelta(dayPct)}
                    </span>
                  )}
                  {ytdPct != null && (
                    <span className={`text-[11px] tabular-nums ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      YTD {formatDelta(ytdPct)}
                    </span>
                  )}
                </div>
              </div>
              <Sparkline
                points={h.sparkline}
                isDarkMode={isDarkMode}
                ariaLabel={`${h.meta.pair} 30-day rate`}
              />
              <span className={`text-[10px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {latest.date}
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
          animation: ticker-scroll 140s linear infinite;
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

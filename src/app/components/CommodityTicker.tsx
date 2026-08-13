'use client';

import { useMemo } from 'react';
import type { CommodityHistory } from '../services/commodities';
import Sparkline from './Sparkline';
import ChartA11yCaption from './ChartA11yCaption';

interface Props {
  isDarkMode: boolean;
  commodities: { [id: string]: CommodityHistory };
  loading?: boolean;
  onRetry?: () => void;
}

function formatPrice(value: number): string {
  const digits = value >= 1000 ? 0 : value >= 100 ? 1 : 2;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

function formatDelta(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(pct >= 10 || pct <= -10 ? 1 : 2)}%`;
}

export default function CommodityTicker({ isDarkMode, commodities, loading, onRetry }: Props) {
  const items = useMemo(() => Object.values(commodities), [commodities]);

  if (loading) {
    return (
      <div className={`h-16 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
    );
  }

  if (items.length === 0) {
    return (
      <div className={`h-16 rounded-lg border flex items-center justify-center gap-4 text-sm px-4 ${
        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
      }`}>
        <span>Live commodity prices are temporarily unavailable. FRED sometimes throttles bursty traffic — try again in a minute.</span>
        {onRetry && (
          <button
            onClick={onRetry}
            aria-label="Retry loading live commodity prices"
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

  const doubled = [...items, ...items];

  return (
    <div
      className={`relative overflow-hidden rounded-lg border ${
        isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}
      role="region"
      aria-label="Live commodity prices — scrolling ticker"
    >
      <ChartA11yCaption
        title="Live commodity prices"
        unit=" USD"
        precision={2}
        rows={items.map(i => ({ label: i.label ?? i.id, value: i.latestPrice ?? null }))}
      />
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
          const ariaLabel = `${h.meta.label}: ${formatPrice(latest.value)} ${h.meta.unit} on ${latest.date}, ${dayText}`;

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
                <span className={`text-[11px] uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {h.meta.label}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-sm font-semibold tabular-nums ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatPrice(latest.value)}
                    <span className={`ml-1 font-normal text-[11px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {h.meta.unit.replace('$/', '/')}
                    </span>
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
                ariaLabel={`${h.meta.label} 30-day price`}
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
          animation: ticker-scroll 90s linear infinite;
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

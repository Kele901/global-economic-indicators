'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { WAGES_2023, LABOR_COUNTRY_META } from '../services/laborCurated';
import { COUNTRY_DISPLAY_NAMES, ISO3_TO_COUNTRY } from '../utils/countryMappings';
import ChartA11yCaption from './ChartA11yCaption';
import CountryFlag from './CountryFlag';

interface Props { isDarkMode: boolean; }

const SCROLL_PX_PER_SEC = 50;

export default function WageTicker({ isDarkMode }: Props) {
  const rows = useMemo(() => {
    const sorted = [...WAGES_2023].sort((a, b) => b.medianHourlyUsdPpp - a.medianHourlyUsdPpp);
    const top = sorted[0]?.medianHourlyUsdPpp ?? 1;
    return sorted.map((r, i) => {
      const key = ISO3_TO_COUNTRY[r.code];
      return {
        ...r,
        key,
        rank: i + 1,
        name: (key && COUNTRY_DISPLAY_NAMES[key]) ?? LABOR_COUNTRY_META.find(m => m.code === r.code)?.name ?? r.code,
        shareOfTop: r.medianHourlyUsdPpp / top,
      };
    });
  }, []);

  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(90);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setDuration(Math.max(40, Math.round(el.scrollWidth / 2 / SCROLL_PX_PER_SEC)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rows.length]);

  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const faint = isDarkMode ? 'text-gray-500' : 'text-gray-400';
  const fade = isDarkMode ? 'from-gray-900' : 'from-white';
  const track = isDarkMode ? 'bg-gray-700' : 'bg-purple-100';
  const doubled = [...rows, ...rows];

  return (
    <div
      className={`wage-ticker relative overflow-hidden rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-purple-100'}`}
      role="region"
      aria-label="Median hourly wages by country — scrolling ticker"
    >
      <ChartA11yCaption
        title="Median hourly wages, 2023 (USD PPP)"
        unit=" USD"
        precision={1}
        rows={rows.map(r => ({ label: r.name, value: r.medianHourlyUsdPpp }))}
      />
      <div
        ref={trackRef}
        className="wage-ticker-track flex items-center gap-8 py-2.5 px-6 whitespace-nowrap"
        style={{ animationDuration: `${duration}s` }}
        aria-live="off"
      >
        {doubled.map((r, i) => {
          const g = r.realWageGrowth2019to2023Pct;
          const up = g >= 0;
          return (
            <div
              key={`${r.code}-${i}`}
              className="flex items-center gap-2.5 flex-shrink-0"
              role="group"
              aria-label={`Rank ${r.rank}: ${r.name}, median wage $${r.medianHourlyUsdPpp.toFixed(1)} an hour, real wages ${up ? 'up' : 'down'} ${Math.abs(g).toFixed(1)}% since 2019`}
              aria-hidden={i >= rows.length ? 'true' : undefined}
            >
              <span className={`text-[10px] font-bold tabular-nums w-4 text-right ${faint}`}>{r.rank}</span>
              {r.key
                ? <CountryFlag countryKey={r.key} className="w-5 h-3.5 rounded-[2px] shrink-0" title={r.name} />
                : <span className={`w-5 h-3.5 rounded-[2px] shrink-0 ${track}`} aria-hidden="true" />}
              <div className="flex flex-col leading-tight gap-0.5">
                <span className={`text-[11px] uppercase tracking-wider ${muted}`}>{r.name}</span>
                <span className="flex items-baseline gap-2">
                  <span className={`text-sm font-semibold tabular-nums ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${r.medianHourlyUsdPpp.toFixed(1)}<span className={`text-[10px] font-normal ${faint}`}>/hr</span>
                  </span>
                  <span
                    className={`text-xs font-medium tabular-nums ${up ? 'text-emerald-500' : 'text-rose-500'}`}
                    title="Real wage growth, 2019–2023"
                  >
                    {up ? '▲' : '▼'} {Math.abs(g).toFixed(1)}%
                  </span>
                </span>
              </div>
              <div className="flex flex-col gap-1" title={`${Math.round(r.shareOfTop * 100)}% of the top median wage`}>
                <div className={`w-14 h-1.5 rounded-full overflow-hidden ${track}`} aria-hidden="true">
                  <div className="h-full rounded-full bg-purple-500" style={{ width: `${r.shareOfTop * 100}%` }} />
                </div>
                <span className={`text-[9px] tabular-nums leading-none ${faint}`}>{Math.round(r.shareOfTop * 100)}% of top</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className={`absolute left-0 inset-y-0 w-14 pointer-events-none bg-gradient-to-r ${fade}`} />
      <div className={`absolute right-0 inset-y-0 w-14 pointer-events-none bg-gradient-to-l ${fade}`} />

      <style jsx>{`
        .wage-ticker-track {
          animation: wage-ticker-scroll linear infinite;
          width: max-content;
        }
        .wage-ticker-track:hover { animation-play-state: paused; }
        @keyframes wage-ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wage-ticker { overflow-x: auto; }
          .wage-ticker-track { animation: none; }
        }
      `}</style>
    </div>
  );
}

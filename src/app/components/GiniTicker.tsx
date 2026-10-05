'use client';

// Hero ticker for /inequality: every roster economy ranked by live World Bank
// Gini, from most to least unequal. Each entry carries a survey-history line
// since 2000 and a position gauge on the Gini scale; every few entries a
// roster-wide insight card (band spread, regional averages, biggest moves,
// survey freshness) rolls past so the strip reads as more than a list.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CountryData } from '../services/worldbank';
import { latestEntry } from '../utils/countryData';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, type CountryKey } from '../utils/countryMappings';
import { BANDS, REGIONS, REGION_OF, STALE_AFTER_YEARS, bandOf, medianOf } from '../lib/gini';
import ChartA11yCaption from './ChartA11yCaption';
import CountryFlag from './CountryFlag';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

const SHARE_TITLE = 'Most and least equal economies by Gini index';
const TREND_FROM = 2000;
const MIN_TREND_SPAN = 5;
const GAUGE_MIN = 20;
const GAUGE_MAX = 60;
const CARD_EVERY = 9;
const SCROLL_PX_PER_SEC = 55;

const SPARK_W = 64;
const SPARK_H = 24;

const RISE = '#f43f5e';
const FALL = '#10b981';
const FLAT = '#94a3b8';

const GAUGE_BG = (() => {
  const pct = (v: number) => `${(((Math.min(v, GAUGE_MAX) - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100).toFixed(1)}%`;
  let from = '0%';
  const stops = BANDS.map(b => {
    const to = b.max === Infinity ? '100%' : pct(b.max);
    const stop = `${b.color} ${from} ${to}`;
    from = to;
    return stop;
  });
  return `linear-gradient(90deg, ${stops.join(', ')})`;
})();

const gaugePct = (v: number) => Math.max(0, Math.min(100, ((v - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100));

interface Props {
  isDarkMode: boolean;
  gini: CountryData[] | undefined;
}

interface Row {
  key: CountryKey;
  name: string;
  rank: number;
  gini: number;
  year: number;
  stale: boolean;
  history: { year: number; value: number }[];
  change: { value: number; since: number } | null;
}

type CardId = 'spread' | 'regions' | 'movers' | 'freshness';
const CARD_ORDER: CardId[] = ['spread', 'regions', 'movers', 'freshness'];

type Item = { kind: 'country'; row: Row } | { kind: 'card'; id: CardId };

const changeColor = (delta: number) => (Math.abs(delta) < 1 ? FLAT : delta > 0 ? RISE : FALL);

function TrendLine({ history, toYear, isDarkMode }: { history: Row['history']; toYear: number; isDarkMode: boolean }) {
  if (history.length < 2) {
    return (
      <svg width={SPARK_W} height={SPARK_H} aria-hidden="true" className="shrink-0">
        <line x1={0} x2={SPARK_W} y1={SPARK_H / 2} y2={SPARK_H / 2} stroke={isDarkMode ? '#374151' : '#e5e7eb'} strokeDasharray="2 3" />
        {history[0] && <circle cx={((history[0].year - TREND_FROM) / (toYear - TREND_FROM)) * SPARK_W} cy={SPARK_H / 2} r={2} fill={FLAT} />}
      </svg>
    );
  }
  const values = history.map(p => p.value);
  const mid = (Math.max(...values) + Math.min(...values)) / 2;
  const span = Math.max(8, Math.max(...values) - Math.min(...values));
  const lo = mid - span / 2;
  const x = (yr: number) => 2 + ((yr - TREND_FROM) / (toYear - TREND_FROM)) * (SPARK_W - 4);
  const y = (v: number) => SPARK_H - 3 - ((v - lo) / span) * (SPARK_H - 6);
  const color = changeColor(history[history.length - 1]!.value - history[0]!.value);
  const path = history.map(p => `${x(p.year).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const last = history[history.length - 1]!;
  return (
    <svg width={SPARK_W} height={SPARK_H} aria-hidden="true" className="shrink-0">
      <line x1={0} x2={SPARK_W} y1={SPARK_H - 1} y2={SPARK_H - 1} stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
      <polyline points={path} fill="none" stroke={color} strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" />
      {history.map(p => (
        <circle key={p.year} cx={x(p.year)} cy={y(p.value)} r={1.1} fill={color} />
      ))}
      <circle cx={x(last.year)} cy={y(last.value)} r={2.4} fill={color} stroke={isDarkMode ? '#111827' : '#fff'} strokeWidth={1} />
    </svg>
  );
}

function Gauge({ value, median, isDarkMode }: { value: number; median: number; isDarkMode: boolean }) {
  return (
    <div className="relative w-16 h-3 shrink-0" aria-hidden="true">
      <div className="absolute inset-x-0 top-1 h-1 rounded-full opacity-80" style={{ background: GAUGE_BG }} />
      <div
        className={`absolute top-0 h-3 w-px ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`}
        style={{ left: `${gaugePct(median)}%` }}
      />
      <div
        className={`absolute top-[1px] w-2.5 h-2.5 -ml-[5px] rounded-full border-2 ${isDarkMode ? 'border-gray-900 bg-white' : 'border-white bg-gray-900'} shadow`}
        style={{ left: `${gaugePct(value)}%` }}
      />
    </div>
  );
}

export default function GiniTicker({ isDarkMode, gini }: Props) {
  const thisYear = new Date().getFullYear();

  const rows = useMemo<Row[]>(() => {
    const series = Array.isArray(gini) ? [...gini].sort((a, b) => Number(a.year) - Number(b.year)) : [];
    return COUNTRY_KEYS
      .map(key => {
        const entry = latestEntry(gini, key);
        if (!entry) return null;
        const history = series
          .filter(r => Number(r.year) >= TREND_FROM && Number(r[key]) > 0)
          .map(r => ({ year: Number(r.year), value: Number(r[key]) }));
        const first = history[0];
        const change = first && entry.year - first.year >= MIN_TREND_SPAN
          ? { value: entry.value - first.value, since: first.year }
          : null;
        return {
          key,
          name: COUNTRY_DISPLAY_NAMES[key] ?? key,
          gini: entry.value,
          year: entry.year,
          stale: thisYear - entry.year > STALE_AFTER_YEARS,
          history,
          change,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.gini - a.gini)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [gini, thisYear]);

  const insights = useMemo(() => {
    if (!rows.length) return null;
    const median = medianOf(rows.map(r => r.gini))!;
    const bands = BANDS.map(b => ({ ...b, count: rows.filter(r => bandOf(r.gini) === b).length }));
    const regions = REGIONS.map(reg => {
      const members = rows.filter(r => REGION_OF[r.key] === reg.id);
      return members.length
        ? { id: reg.id, label: reg.label, short: reg.short, avg: members.reduce((s, m) => s + m.gini, 0) / members.length }
        : null;
    }).filter((r): r is NonNullable<typeof r> => r !== null).sort((a, b) => b.avg - a.avg);
    const moved = rows.filter(r => r.change).sort((a, b) => a.change!.value - b.change!.value);
    const fallers = moved.filter(r => r.change!.value < 0).slice(0, 2);
    const risers = moved.filter(r => r.change!.value > 0).reverse().slice(0, 2);
    const maxMove = Math.max(1, ...[...fallers, ...risers].map(r => Math.abs(r.change!.value)));
    const oldestYear = Math.min(...rows.map(r => r.year));
    const newestYear = Math.max(...rows.map(r => r.year));
    const freshness = Array.from({ length: newestYear - oldestYear + 1 }, (_, i) => {
      const year = oldestYear + i;
      return { year, count: rows.filter(r => r.year === year).length, stale: thisYear - year > STALE_AFTER_YEARS };
    });
    const maxFresh = Math.max(1, ...freshness.map(f => f.count));
    return { median, bands, regions, fallers, risers, maxMove, freshness, maxFresh, oldestYear, newestYear };
  }, [rows, thisYear]);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    let card = 0;
    rows.forEach((row, i) => {
      out.push({ kind: 'country', row });
      if ((i + 1) % CARD_EVERY === 0 && i < rows.length - 1 && card < CARD_ORDER.length) {
        out.push({ kind: 'card', id: CARD_ORDER[card++]! });
      }
    });
    return out;
  }, [rows]);

  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(240);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setDuration(Math.max(60, Math.round(el.scrollWidth / 2 / SCROLL_PX_PER_SEC)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  if (rows.length === 0 || !insights) {
    return (
      <div className={`h-14 rounded-lg border flex items-center px-4 text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-400' : 'bg-white border-rose-100 text-gray-500'}`}>
        Waiting on live World Bank Gini values…
      </div>
    );
  }

  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const faint = isDarkMode ? 'text-gray-500' : 'text-gray-400';
  const strong = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const cardCls = `flex flex-col justify-center gap-1 flex-shrink-0 h-12 rounded-md border px-3 ${isDarkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-rose-50/50 border-rose-100'}`;
  const cardTitle = `text-[9px] font-semibold uppercase tracking-wider leading-none ${muted}`;

  const renderCard = (id: CardId) => {
    if (id === 'spread') {
      return {
        label: `How the roster spreads: ${insights.bands.map(b => `${b.count} ${b.label}`).join(', ')}`,
        body: (
          <>
            <span className={cardTitle}>How the roster spreads</span>
            <div className="flex h-2 w-44 rounded-full overflow-hidden">
              {insights.bands.filter(b => b.count).map(b => (
                <div key={b.label} style={{ width: `${(b.count / rows.length) * 100}%`, backgroundColor: b.color }} title={`${b.label}: ${b.count}`} />
              ))}
            </div>
            <div className="flex gap-2 text-[9px] leading-none tabular-nums">
              {insights.bands.map(b => (
                <span key={b.label} className="inline-flex items-center gap-0.5" style={{ color: b.color }}>
                  <span className="font-bold">{b.count}</span>
                  <span className={faint}>{b.label}</span>
                </span>
              ))}
            </div>
          </>
        ),
      };
    }
    if (id === 'regions') {
      const lo = 25;
      const hi = Math.max(50, ...insights.regions.map(r => r.avg));
      return {
        label: `Average Gini by region: ${insights.regions.map(r => `${r.label} ${r.avg.toFixed(1)}`).join(', ')}`,
        body: (
          <>
            <span className={cardTitle}>Average by region</span>
            <div className="flex items-end gap-2">
              {insights.regions.map(r => (
                <div key={r.id} className="flex items-end gap-1" title={`${r.label}: ${r.avg.toFixed(1)}`}>
                  <div className="w-2 rounded-t-sm" style={{ height: `${4 + ((r.avg - lo) / (hi - lo)) * 14}px`, backgroundColor: bandOf(r.avg).color }} />
                  <div className="flex flex-col leading-none">
                    <span className={`text-[9px] font-semibold tabular-nums ${strong}`}>{r.avg.toFixed(1)}</span>
                    <span className={`text-[8px] ${faint}`}>{r.short}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ),
      };
    }
    if (id === 'movers') {
      const moverRow = (r: Row) => {
        const d = r.change!.value;
        return (
          <div key={r.key} className="flex items-center gap-1.5 text-[9px] leading-none" title={`${r.name}: ${d > 0 ? '+' : ''}${d.toFixed(1)} points since ${r.change!.since}`}>
            <span className={`w-16 truncate ${strong}`}>{r.name}</span>
            <div className="w-12 h-1.5 rounded-full overflow-hidden bg-transparent">
              <div className="h-full rounded-full" style={{ width: `${(Math.abs(d) / insights.maxMove) * 100}%`, backgroundColor: d > 0 ? RISE : FALL }} />
            </div>
            <span className="tabular-nums font-semibold w-7 text-right" style={{ color: d > 0 ? RISE : FALL }}>
              {d > 0 ? '▲' : '▼'}{Math.abs(d).toFixed(1)}
            </span>
          </div>
        );
      };
      return {
        label: `Biggest moves since ${TREND_FROM}. Fell most: ${insights.fallers.map(r => `${r.name} ${r.change!.value.toFixed(1)}`).join(', ')}. Rose most: ${insights.risers.map(r => `${r.name} +${r.change!.value.toFixed(1)}`).join(', ') || 'none'}`,
        body: (
          <>
            <span className={cardTitle} title={`Change from each country's first survey since ${TREND_FROM} to its latest`}>
              Biggest shifts since {TREND_FROM}
            </span>
            <div className="flex gap-4">
              <div className="flex flex-col gap-1" title="Less unequal">
                {insights.fallers.map(moverRow)}
              </div>
              <div className="flex flex-col gap-1" title="More unequal">
                {insights.risers.length ? insights.risers.map(moverRow) : <span className={`text-[9px] ${faint}`}>none</span>}
              </div>
            </div>
          </>
        ),
      };
    }
    return {
      label: `Latest survey year across the roster, ${insights.oldestYear} to ${insights.newestYear}: ${insights.freshness.filter(f => f.count).map(f => `${f.year} ${f.count}`).join(', ')}`,
      body: (
        <>
          <span className={cardTitle}>Latest survey year</span>
          <div className="flex items-end gap-[3px] h-3.5">
            {insights.freshness.map(f => (
              <div
                key={f.year}
                className="w-2 rounded-t-[1px]"
                title={`${f.year}: ${f.count} ${f.count === 1 ? 'country' : 'countries'}`}
                style={{
                  height: f.count ? `${3 + (f.count / insights.maxFresh) * 11}px` : '1px',
                  backgroundColor: f.count ? (f.stale ? '#f59e0b' : isDarkMode ? '#60a5fa' : '#3b82f6') : isDarkMode ? '#374151' : '#e5e7eb',
                }}
              />
            ))}
          </div>
          <div className={`flex justify-between gap-2 text-[8px] leading-none tabular-nums ${faint}`}>
            <span>{insights.oldestYear}</span>
            <span className="text-amber-500">amber = {STALE_AFTER_YEARS}+ yrs old</span>
            <span>{insights.newestYear}</span>
          </div>
        </>
      ),
    };
  };

  const doubled = [...items, ...items];
  const fade = isDarkMode ? 'from-gray-900' : 'from-white';

  return (
    <div id={slugify(SHARE_TITLE)} className="flex items-center gap-2">
      <div
        className={`gini-ticker relative flex-1 min-w-0 overflow-hidden rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-rose-100'}`}
        role="region"
        aria-label="Gini index by country, most to least unequal — scrolling ticker"
      >
        <ChartA11yCaption
          title="Gini index, latest available survey"
          precision={1}
          rows={rows.map(r => ({ label: `${r.name} (${r.year})`, value: r.gini }))}
        />
        <div
          ref={trackRef}
          className="gini-ticker-track flex items-center gap-7 py-2 px-6 whitespace-nowrap"
          style={{ animationDuration: `${duration}s` }}
          aria-live="off"
        >
          {doubled.map((item, i) => {
            const hidden = i >= items.length ? 'true' : undefined;
            if (item.kind === 'card') {
              const card = renderCard(item.id);
              return (
                <div key={`card-${item.id}-${i}`} className={cardCls} role="group" aria-label={card.label} aria-hidden={hidden}>
                  {card.body}
                </div>
              );
            }
            const r = item.row;
            const tone = bandOf(r.gini).color;
            const delta = r.change?.value;
            return (
              <div
                key={`${r.key}-${i}`}
                className="flex items-center gap-2.5 flex-shrink-0"
                role="group"
                aria-label={`Rank ${r.rank}: ${r.name}, Gini ${r.gini.toFixed(1)}, ${r.year} survey${r.change ? `, ${delta! > 0 ? 'up' : 'down'} ${Math.abs(delta!).toFixed(1)} points since ${r.change.since}` : ''}`}
                aria-hidden={hidden}
              >
                <span className={`text-[10px] font-bold tabular-nums w-5 text-right ${faint}`}>{r.rank}</span>
                <CountryFlag countryKey={r.key} className="w-5 h-3.5 rounded-[2px] shrink-0" title={r.name} />
                <div className="flex flex-col leading-tight gap-0.5">
                  <span className={`text-[11px] uppercase tracking-wider ${muted}`}>{r.name}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold tabular-nums" style={{ color: tone }}>{r.gini.toFixed(1)}</span>
                    <span
                      className={`text-[10px] tabular-nums ${r.stale ? 'text-amber-500 font-medium' : faint}`}
                      title={r.stale ? `Survey more than ${STALE_AFTER_YEARS} years old` : undefined}
                    >
                      {r.year}
                    </span>
                  </span>
                </div>
                <div className="flex flex-col items-start gap-1" title={`Position on the Gini scale (${GAUGE_MIN}–${GAUGE_MAX}); tick marks the roster median ${insights.median.toFixed(1)}`}>
                  <Gauge value={r.gini} median={insights.median} isDarkMode={isDarkMode} />
                  <span className={`text-[9px] tabular-nums leading-none ${faint}`}>
                    {r.gini >= insights.median ? '+' : '−'}{Math.abs(r.gini - insights.median).toFixed(1)} vs median
                  </span>
                </div>
                <div className="flex flex-col items-start gap-0.5" title={r.history.length > 1 ? `Survey readings ${r.history[0]!.year}–${r.year}` : 'Only one survey since 2000'}>
                  <TrendLine history={r.history} toYear={thisYear} isDarkMode={isDarkMode} />
                  <span className="text-[9px] tabular-nums leading-none" style={{ color: delta != null ? changeColor(delta) : undefined }}>
                    {delta != null
                      ? `${delta > 0 ? '▲' : delta < 0 ? '▼' : '■'} ${Math.abs(delta).toFixed(1)} since ${r.change!.since}`
                      : <span className={faint}>{r.history.length > 1 ? 'short history' : 'one survey'}</span>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className={`absolute left-0 inset-y-0 w-14 pointer-events-none bg-gradient-to-r ${fade}`} />
        <div className={`absolute right-0 inset-y-0 w-14 pointer-events-none bg-gradient-to-l ${fade}`} />

        <style jsx>{`
          .gini-ticker-track {
            animation: gini-ticker-scroll linear infinite;
            width: max-content;
          }
          .gini-ticker-track:hover { animation-play-state: paused; }
          @keyframes gini-ticker-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          @media (prefers-reduced-motion: reduce) {
            .gini-ticker { overflow-x: auto; }
            .gini-ticker-track { animation: none; }
          }
        `}</style>
      </div>
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <SocialShareMenu title={SHARE_TITLE} isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

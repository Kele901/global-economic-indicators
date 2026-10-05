'use client';

// Live Gini ranking across the 47-country roster. Unlike the rest of the
// inequality page (which is Piketty-derived historical reconstruction), this
// chart is fed straight from World Bank SI.POV.GINI. Survey years differ by
// country, so each bar carries its own year and anything older than the
// staleness threshold is drawn hatched and called out in the footnote.
//
// Rendered as an HTML ranking rather than a Recharts bar chart so each row
// can carry a flag, rank, value and survey year without label clipping.

import { useMemo, useState } from 'react';
import type { CountryData } from '../services/worldbank';
import { latestEntry } from '../utils/countryData';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES } from '../utils/countryMappings';
import { useChartTheme } from '../utils/chartTheme';
import { BANDS, REGIONS, REGION_OF, STALE_AFTER_YEARS, bandOf, medianOf, type RegionId } from '../lib/gini';
import ChartCard from './charts/ChartCard';
import ChartA11yCaption from './ChartA11yCaption';
import CountryFlag from './CountryFlag';

interface Props {
  isDarkMode: boolean;
  shareTitle?: string;
  gini: CountryData[] | undefined;
}

const CARD_TITLE = 'Gini Index by Country';

type SortId = 'desc' | 'asc' | 'name' | 'oldest';
const SORTS: { id: SortId; label: string }[] = [
  { id: 'desc', label: 'Most unequal first' },
  { id: 'asc', label: 'Most equal first' },
  { id: 'name', label: 'A–Z' },
  { id: 'oldest', label: 'Oldest survey first' },
];

export default function GiniRankChart({ isDarkMode, gini, shareTitle }: Props) {
  const theme = useChartTheme(isDarkMode);
  const [sort, setSort] = useState<SortId>('desc');
  const [region, setRegion] = useState<RegionId | 'all'>('all');
  const [hovered, setHovered] = useState<string | null>(null);

  const rows = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const list = COUNTRY_KEYS
      .map(key => {
        const entry = latestEntry(gini, key);
        if (!entry) return null;
        return {
          key,
          name: COUNTRY_DISPLAY_NAMES[key] ?? key,
          gini: entry.value,
          year: entry.year,
          age: thisYear - entry.year,
          stale: thisYear - entry.year > STALE_AFTER_YEARS,
          region: REGION_OF[key],
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.gini - a.gini);
    return list.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [gini]);

  const stats = useMemo(() => {
    if (!rows.length) return null;
    const median = medianOf(rows.map(r => r.gini))!;
    const years = rows.map(r => r.year);
    const bands = BANDS.map(b => ({ ...b, count: rows.filter(r => bandOf(r.gini) === b).length }));
    const regions = REGIONS.map(reg => {
      const members = rows.filter(r => r.region === reg.id);
      if (!members.length) return null;
      const values = members.map(m => m.gini);
      return {
        ...reg,
        count: members.length,
        avg: values.reduce((s, v) => s + v, 0) / values.length,
        min: members.reduce((a, b) => (b.gini < a.gini ? b : a)),
        max: members.reduce((a, b) => (b.gini > a.gini ? b : a)),
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null).sort((a, b) => b.avg - a.avg);
    return {
      median,
      top: rows[0]!,
      bottom: rows[rows.length - 1]!,
      medianYear: medianOf(years)!,
      oldest: rows.reduce((a, b) => (b.year < a.year ? b : a)),
      staleCount: rows.filter(r => r.stale).length,
      bands,
      regions,
      scaleMax: Math.max(50, Math.ceil(rows[0]!.gini / 10) * 10),
    };
  }, [rows]);

  const visible = useMemo(() => {
    const list = region === 'all' ? rows : rows.filter(r => r.region === region);
    const sorted = [...list];
    if (sort === 'asc') sorted.sort((a, b) => a.gini - b.gini);
    else if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'oldest') sorted.sort((a, b) => a.year - b.year || b.gini - a.gini);
    return sorted;
  }, [rows, region, sort]);

  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const strong = isDarkMode ? 'text-white' : 'text-gray-900';
  const subtle = isDarkMode ? 'bg-gray-700/40 border-gray-700' : 'bg-gray-50 border-gray-200';
  const border = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const track = isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100';

  if (!rows.length || !stats) {
    return (
      <ChartCard isDarkMode={isDarkMode} title={CARD_TITLE} shareTitle={shareTitle} height="h-auto">
        <p className={`text-sm ${theme.subtitleCls}`}>
          No live Gini values returned for the current roster. The World Bank only publishes
          SI.POV.GINI for countries with a recent household survey, so this chart stays empty
          until the API responds.
        </p>
      </ChartCard>
    );
  }

  const missing = COUNTRY_KEYS.length - rows.length;
  const pctOf = (v: number) => `${(v / stats.scaleMax) * 100}%`;
  const ticks = Array.from({ length: stats.scaleMax / 10 + 1 }, (_, i) => i * 10);
  const regionLabel = (id: RegionId) => REGIONS.find(r => r.id === id)!.label;

  const tiles = [
    { label: 'Most unequal', value: stats.top.gini.toFixed(1), detail: `${stats.top.name} · ${stats.top.year} survey`, color: bandOf(stats.top.gini).color },
    { label: 'Most equal', value: stats.bottom.gini.toFixed(1), detail: `${stats.bottom.name} · ${stats.bottom.year} survey`, color: bandOf(stats.bottom.gini).color },
    { label: 'Roster median', value: stats.median.toFixed(1), detail: `Range ${(stats.top.gini - stats.bottom.gini).toFixed(1)} points across ${rows.length} countries`, color: theme.axis },
    { label: 'Survey freshness', value: String(Math.round(stats.medianYear)), detail: `Median survey year · ${stats.staleCount} older than ${STALE_AFTER_YEARS} years`, color: '#f59e0b' },
  ];

  const selectCls = `text-xs rounded border px-2 py-1 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`;

  return (
    <ChartCard
      isDarkMode={isDarkMode}
      title={CARD_TITLE}
      subtitle={`Latest World Bank Gini for ${rows.length} economies, ranked. 0 is perfect equality; hatched bars are surveys more than ${STALE_AFTER_YEARS} years old.`}
      shareTitle={shareTitle}
      height="h-auto"
      actions={
        <label className={`inline-flex items-center gap-1.5 text-xs ${muted}`} data-share-exclude>
          Sort
          <select value={sort} onChange={e => setSort(e.target.value as SortId)} className={selectCls} aria-label="Sort order">
            {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      }
      caption={
        <ChartA11yCaption
          title="Gini index by country, latest available survey"
          rows={rows.map(r => ({ label: `${r.name} (${r.year})`, value: r.gini }))}
          extra={`Roster median ${stats.median.toFixed(1)}.`}
        />
      }
      footnote={
        <>
          Live World Bank SI.POV.GINI, latest survey available per country. Hatched bars and amber years
          are surveys more than {STALE_AFTER_YEARS} years old ({stats.staleCount} of {rows.length} shown)
          {missing > 0 ? `; ${missing} roster countries have no published Gini at all` : ''}.
          Many South Asian and African surveys measure consumption rather than income, which usually yields
          a lower Gini, so compare those countries with care. Gini measures the distribution
          <em> within</em> a country, so it says nothing about how rich that country is — a low-income and
          a high-income country can share the same score.
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {tiles.map(t => (
          <div key={t.label} className={`rounded-lg border border-t-2 p-3 ${subtle}`} style={{ borderTopColor: t.color }}>
            <div className={`text-[11px] uppercase tracking-wide ${muted}`}>{t.label}</div>
            <div className={`text-2xl font-bold tabular-nums mt-0.5 ${strong}`}>{t.value}</div>
            <div className={`text-xs ${muted}`}>{t.detail}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4" data-share-exclude>
        {[{ id: 'all' as const, label: `All (${rows.length})` }, ...REGIONS.map(r => ({ id: r.id, label: `${r.label} (${rows.filter(x => x.region === r.id).length})` }))].map(r => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRegion(r.id)}
            className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
              region === r.id
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-500 font-medium'
                : `${border} ${muted} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 min-w-0">
          <div className="grid grid-cols-[1.75rem_minmax(7rem,10rem)_1fr_5.25rem] gap-x-2 items-end mb-1">
            <span />
            <span className={`text-[10px] uppercase tracking-wide ${muted}`}>Country</span>
            <div className="relative h-4">
              {ticks.map(v => (
                <span key={v} className={`absolute text-[10px] tabular-nums -translate-x-1/2 ${muted}`} style={{ left: pctOf(v) }}>{v}</span>
              ))}
            </div>
            <span className={`text-[10px] uppercase tracking-wide text-right ${muted}`}>Gini · year</span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 grid grid-cols-[1.75rem_minmax(7rem,10rem)_1fr_5.25rem] gap-x-2 w-full pointer-events-none" aria-hidden="true">
              <span /><span />
              <div className="relative">
                {ticks.map(v => (
                  <span key={v} className={`absolute inset-y-0 border-l border-dashed ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} style={{ left: pctOf(v) }} />
                ))}
                <span className={`absolute inset-y-0 border-l-2 border-dashed ${isDarkMode ? 'border-gray-400' : 'border-gray-500'}`} style={{ left: pctOf(stats.median) }} />
                <span
                  className={`absolute -top-0.5 text-[10px] font-medium px-1 rounded -translate-x-1/2 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'}`}
                  style={{ left: pctOf(stats.median) }}
                >
                  median {stats.median.toFixed(1)}
                </span>
              </div>
            </div>

            <ol className="relative pt-4">
              {visible.map(r => {
                const band = bandOf(r.gini);
                const diff = r.gini - stats.median;
                const active = hovered === r.key;
                return (
                  <li
                    key={r.key}
                    onMouseEnter={() => setHovered(r.key)}
                    onMouseLeave={() => setHovered(null)}
                    title={`${r.name}: Gini ${r.gini.toFixed(1)} (${r.year} survey). Rank ${r.rank} of ${rows.length}, ${Math.abs(diff).toFixed(1)} points ${diff >= 0 ? 'above' : 'below'} the median. ${regionLabel(r.region)}.`}
                    className={`grid grid-cols-[1.75rem_minmax(7rem,10rem)_1fr_5.25rem] gap-x-2 items-center h-[24px] rounded transition-colors ${active ? (isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100') : ''}`}
                  >
                    <span className={`text-[10px] tabular-nums text-right ${muted}`}>{r.rank}</span>
                    <span className="flex items-center gap-1.5 min-w-0">
                      <CountryFlag countryKey={r.key} className="w-4 h-3 shrink-0 rounded-[2px]" title={r.name} />
                      <span className={`text-xs truncate ${active ? `font-semibold ${strong}` : isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{r.name}</span>
                    </span>
                    <div className={`relative h-3.5 rounded-sm ${track}`}>
                      <div
                        className="absolute inset-y-0 left-0 rounded-sm"
                        style={{
                          width: pctOf(r.gini),
                          backgroundColor: band.color,
                          opacity: r.stale ? 0.55 : 1,
                          backgroundImage: r.stale
                            ? 'repeating-linear-gradient(135deg, rgba(255,255,255,0.55) 0 3px, transparent 3px 7px)'
                            : undefined,
                        }}
                      />
                    </div>
                    <span className="flex items-baseline justify-end gap-1.5 text-xs tabular-nums whitespace-nowrap">
                      <span className={`font-semibold ${strong}`}>{r.gini.toFixed(1)}</span>
                      <span className={`text-[10px] ${r.stale ? 'text-amber-500 font-medium' : muted}`}>{r.year}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="grid grid-cols-[1.75rem_minmax(7rem,10rem)_1fr_5.25rem] gap-x-2 mt-1">
            <span /><span />
            <span className={`text-[10px] text-center ${muted}`}>Gini index (0 = perfect equality, 100 = one household holds everything)</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`rounded-lg border p-3 ${subtle}`}>
            <div className={`text-sm font-semibold mb-2 ${strong}`}>How the roster spreads</div>
            <div className="flex h-3 rounded-full overflow-hidden mb-2">
              {stats.bands.filter(b => b.count > 0).map(b => (
                <div key={b.label} style={{ width: `${(b.count / rows.length) * 100}%`, backgroundColor: b.color }} title={`${b.label}: ${b.count}`} />
              ))}
            </div>
            <ul className="space-y-1">
              {stats.bands.map(b => (
                <li key={b.label} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: b.color }} />
                  <span className={strong}>{b.label}</span>
                  <span className={muted}>{b.note}</span>
                  <span className={`ml-auto tabular-nums font-medium ${strong}`}>{b.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`rounded-lg border p-3 ${subtle}`}>
            <div className={`text-sm font-semibold ${strong}`}>Average by region</div>
            <p className={`text-[11px] mb-2 ${muted}`}>Simple average of roster countries. Click to filter the ranking.</p>
            <ul className="space-y-2">
              {stats.regions.map(reg => (
                <li key={reg.id}>
                  <button
                    type="button"
                    onClick={() => setRegion(region === reg.id ? 'all' : reg.id)}
                    className={`w-full text-left rounded px-1.5 py-1 -mx-1.5 transition-colors ${region === reg.id ? 'bg-blue-500/10' : isDarkMode ? 'hover:bg-gray-700/60' : 'hover:bg-white'}`}
                  >
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className={`font-medium ${strong}`}>{reg.label}</span>
                      <span className={`tabular-nums font-semibold ${strong}`}>{reg.avg.toFixed(1)}</span>
                    </div>
                    <div className={`relative h-2 rounded-full mt-1 ${track}`}>
                      <div
                        className="absolute inset-y-0 rounded-full opacity-30"
                        style={{ left: pctOf(reg.min.gini), width: `calc(${pctOf(reg.max.gini)} - ${pctOf(reg.min.gini)})`, backgroundColor: bandOf(reg.avg).color }}
                      />
                      <div className="absolute -top-0.5 w-1 h-3 rounded-full" style={{ left: `calc(${pctOf(reg.avg)} - 2px)`, backgroundColor: bandOf(reg.avg).color }} />
                    </div>
                    <div className={`text-[10px] mt-0.5 ${muted}`}>
                      {reg.count} {reg.count === 1 ? 'country' : 'countries'} · {reg.min.name} {reg.min.gini.toFixed(1)} to {reg.max.name} {reg.max.gini.toFixed(1)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={`rounded-lg border p-3 ${subtle}`}>
            <div className={`text-sm font-semibold mb-1.5 ${strong}`}>Reading a Gini</div>
            <ul className={`text-xs space-y-1.5 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>0 means everyone has the same income; 100 means one household has all of it.</li>
              <li>Most countries fall between 25 and 55. A gap of 5 points is a meaningful difference.</li>
              <li>
                The oldest survey shown is {stats.oldest.name}&apos;s from {stats.oldest.year}, so the ranking mixes
                years. Treat close neighbours as ties.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

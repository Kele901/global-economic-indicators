'use client';

import { useMemo, useState } from 'react';
import type { CountryData } from '../services/worldbank';
import type { ReservesSnapshot, ProductionSnapshot } from '../services/eia';
import {
  STATIC_NATURAL_GAS_RESERVES_2024,
  STATIC_COAL_RESERVES_2024,
  OPEC_MEMBERS,
  OPEC_PLUS_PARTNERS,
  WORLD_RESOURCE_TOTALS,
  type CountryResourceValue,
} from '../data/resourceStaticData';
import { getDisplayName } from '../utils/countryMappings';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

interface Props {
  isDarkMode: boolean;
  loading: boolean;
  reserves: ReservesSnapshot | null;
  production: ProductionSnapshot | null;
  totalResourceRents?: CountryData[];
  oilRents?: CountryData[];
  naturalGasRents?: CountryData[];
  coalRents?: CountryData[];
  mineralRents?: CountryData[];
  forestRents?: CountryData[];
}

type Tab = 'oilReserves' | 'oilProduction' | 'gasReserves' | 'coalReserves';

const NAME_ALIASES: Record<string, string> = {
  'United States': 'USA',
  'United Arab Emirates': 'UAE',
  'Russian Federation': 'Russia',
  'United Kingdom': 'UK',
  'Iran (Islamic Republic of)': 'Iran',
  'Venezuela (Bolivarian Republic of)': 'Venezuela',
  'Congo-Brazzaville': 'Congo',
};

const normalise = (name: string) => NAME_ALIASES[name] ?? name;

const RENT_TYPES = [
  { key: 'oil', label: 'Oil', color: '#0f172a', darkColor: '#cbd5e1' },
  { key: 'gas', label: 'Gas', color: '#0891b2', darkColor: '#22d3ee' },
  { key: 'coal', label: 'Coal', color: '#57534e', darkColor: '#a8a29e' },
  { key: 'minerals', label: 'Minerals', color: '#b45309', darkColor: '#f59e0b' },
  { key: 'forest', label: 'Forest', color: '#16a34a', darkColor: '#4ade80' },
] as const;

const TABS: { id: Tab; label: string; unit: string; worldTotal: number; worldLabel: string; note: string }[] = [
  {
    id: 'oilReserves', label: 'Oil reserves', unit: 'bn bbl', worldTotal: WORLD_RESOURCE_TOTALS.oilReserves,
    worldLabel: '~1,650 bn bbl',
    note: "Venezuela's and Canada's totals are mostly extra-heavy crude and oil sands — expensive to extract and only counted as reserves at high prices.",
  },
  {
    id: 'oilProduction', label: 'Oil output', unit: 'kb/d', worldTotal: WORLD_RESOURCE_TOTALS.oilProduction,
    worldLabel: '~84 mb/d crude',
    note: 'The US shale revolution made it the largest producer since 2018 — yet it holds under 3% of reserves, so it pumps through them far faster than the Gulf.',
  },
  {
    id: 'gasReserves', label: 'Gas reserves', unit: 'Tcf', worldTotal: WORLD_RESOURCE_TOTALS.gasReserves,
    worldLabel: '~7,200 Tcf',
    note: "Russia, Iran and Qatar hold roughly half of the world's gas. Qatar and Iran share the single largest field (North Dome / South Pars).",
  },
  {
    id: 'coalReserves', label: 'Coal reserves', unit: 'Mst', worldTotal: WORLD_RESOURCE_TOTALS.coalReserves,
    worldLabel: '~1.07 tn short tons',
    note: 'Coal is the most abundant fossil fuel, at well over a century of supply at current output — and unlike oil, two of the largest holders (China and India) are also its biggest consumers.',
  },
];

function label(country: string): string {
  return country === 'UAE' || country === 'USA' || country === 'UK' ? country : getDisplayName(country);
}

function latest(series: CountryData[] | undefined, country: string): { value: number; year: number } | null {
  if (!series) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    const v = Number(series[i][country]);
    if (!isNaN(v) && v !== 0) return { value: v, year: Number(series[i].year) };
  }
  return null;
}

function valueAt(series: CountryData[] | undefined, country: string, year: number): number {
  const row = series?.find(r => Number(r.year) === year);
  const v = row ? Number(row[country]) : NaN;
  return isNaN(v) ? 0 : Math.max(0, v);
}

function cleanSnapshot(snap: { source: string; data: CountryResourceValue[] } | null): CountryResourceValue[] {
  if (!snap) return [];
  return snap.data
    .filter(r => snap.source !== 'EIA' || (r.iso?.length ?? 0) === 3)
    .map(r => ({ ...r, country: normalise(r.country) }))
    .sort((a, b) => b.value - a.value);
}

function fmt(v: number): string {
  return v >= 1000 ? Math.round(v).toLocaleString() : v >= 100 ? v.toFixed(0) : v.toFixed(1);
}

export default function ResourceHoldersPanel({
  isDarkMode,
  loading,
  reserves,
  production,
  totalResourceRents,
  oilRents,
  naturalGasRents,
  coalRents,
  mineralRents,
  forestRents,
}: Props) {
  const [tab, setTab] = useState<Tab>('oilReserves');

  const oilReserves = useMemo(() => cleanSnapshot(reserves), [reserves]);
  const oilProduction = useMemo(() => cleanSnapshot(production), [production]);
  const gasReserves = useMemo(() => [...STATIC_NATURAL_GAS_RESERVES_2024].sort((a, b) => b.value - a.value), []);
  const coalReserves = useMemo(() => [...STATIC_COAL_RESERVES_2024].sort((a, b) => b.value - a.value), []);

  const tabMeta = TABS.find(t => t.id === tab)!;
  const rows = { oilReserves, oilProduction, gasReserves, coalReserves }[tab];
  const isOil = tab === 'oilReserves' || tab === 'oilProduction';
  const isLive = isOil && (tab === 'oilReserves' ? reserves?.source : production?.source) === 'EIA';
  const top = rows.slice(0, 10);
  const maxValue = top[0]?.value ?? 1;
  const share = (v: number) => (v / tabMeta.worldTotal) * 100;
  const top3 = share(rows.slice(0, 3).reduce((s, r) => s + r.value, 0));
  const top10 = share(top.reduce((s, r) => s + r.value, 0));
  const opecShare = share(rows.filter(r => OPEC_MEMBERS.has(r.country)).reduce((s, r) => s + r.value, 0));

  // Reserves-to-production years per country (oil).
  const rp = useMemo(() => {
    const prodByKey = new Map<string, number>();
    oilProduction.forEach(p => {
      prodByKey.set(p.iso, p.value);
      prodByKey.set(p.country, p.value);
    });
    return oilReserves
      .map(r => {
        const prod = prodByKey.get(r.iso) ?? prodByKey.get(r.country);
        if (!prod) return null;
        return { country: r.country, years: (r.value * 1e6) / (prod * 365), reserves: r.value, prod };
      })
      .filter((r): r is NonNullable<typeof r> => r != null && r.prod >= 500)
      .sort((a, b) => b.years - a.years)
      .slice(0, 14);
  }, [oilReserves, oilProduction]);
  const worldRp = (WORLD_RESOURCE_TOTALS.oilReserves * 1e6) / (WORLD_RESOURCE_TOTALS.oilProduction * 365);
  const rpMax = Math.max(...rp.map(r => r.years), worldRp);
  const logWidth = (y: number) => (Math.log10(Math.max(y, 1)) / Math.log10(rpMax)) * 100;

  // Rent composition for the most rent-dependent economies.
  const rentRows = useMemo(() => {
    if (!totalResourceRents?.length) return [];
    const countries = new Set<string>();
    totalResourceRents.forEach(r => Object.keys(r).forEach(k => k !== 'year' && countries.add(k)));
    const out: { country: string; total: number; year: number; parts: Record<string, number> }[] = [];
    countries.forEach(c => {
      const l = latest(totalResourceRents, c);
      if (!l) return;
      out.push({
        country: c,
        total: l.value,
        year: l.year,
        parts: {
          oil: valueAt(oilRents, c, l.year),
          gas: valueAt(naturalGasRents, c, l.year),
          coal: valueAt(coalRents, c, l.year),
          minerals: valueAt(mineralRents, c, l.year),
          forest: valueAt(forestRents, c, l.year),
        },
      });
    });
    return out.sort((a, b) => b.total - a.total).slice(0, 12);
  }, [totalResourceRents, oilRents, naturalGasRents, coalRents, mineralRents, forestRents]);
  const rentMax = Math.max(...rentRows.map(r => r.total), 1);
  const rentYear = rentRows.length ? Math.max(...rentRows.map(r => r.year)) : null;

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const insetBg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = 'text-gray-500';
  const track = isDarkMode ? 'bg-gray-700/60' : 'bg-gray-100';
  const skeleton = (h: string) => <div className={`${h} rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />;

  const membership = (c: string) =>
    OPEC_MEMBERS.has(c) ? 'OPEC' : OPEC_PLUS_PARTNERS.has(c) ? 'OPEC+' : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Who holds the supply */}
        <div id={slugify('Who Holds the Supply')} className={`lg:col-span-3 rounded-lg border p-5 ${cardBg}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
            <div>
              <h4 className={`text-base font-semibold ${textPrimary}`}>Who Holds the Supply</h4>
              <p className={`text-xs mt-0.5 ${textMuted}`}>Top 10 by volume, with each country&apos;s share of the world total</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                isLive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-600'
              }`}>
                {isLive ? 'EIA live' : isOil ? 'Seed 2024' : 'BP 2024'}
              </span>
              <SocialShareMenu title="Who Holds the Supply" subject="dataset" isDarkMode={isDarkMode} />
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-4" role="tablist" aria-label="Resource">
            {TABS.map(t => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                  tab === t.id
                    ? 'bg-amber-500 text-white'
                    : isDarkMode ? 'bg-gray-900 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading && isOil && rows.length === 0 ? skeleton('h-72') : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { k: 'Top 3 share', v: `${top3.toFixed(0)}%` },
                  { k: 'Top 10 share', v: `${top10.toFixed(0)}%` },
                  { k: 'OPEC share', v: `${opecShare.toFixed(0)}%` },
                ].map(s => (
                  <div key={s.k} className={`rounded-md border px-3 py-2 ${insetBg}`}>
                    <div className={`text-[10px] uppercase tracking-wider ${textMuted}`}>{s.k}</div>
                    <div className={`text-lg font-semibold tabular-nums ${textPrimary}`}>{s.v}</div>
                  </div>
                ))}
              </div>

              <ul className="space-y-1.5">
                {top.map((r, i) => {
                  const m = membership(r.country);
                  return (
                    <li key={r.country} className="grid grid-cols-[7.5rem_1fr_5.5rem] sm:grid-cols-[9rem_1fr_7rem] items-center gap-2 text-xs">
                      <span className={`truncate ${textPrimary}`}>
                        <span className={`tabular-nums mr-1 ${textMuted}`}>{i + 1}.</span>{label(r.country)}
                        {m && (
                          <span className={`ml-1 text-[9px] font-semibold px-1 rounded ${
                            m === 'OPEC' ? 'bg-amber-500/20 text-amber-600' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>{m}</span>
                        )}
                      </span>
                      <span className={`h-3 rounded-sm overflow-hidden ${track}`}>
                        <span
                          className="block h-full rounded-sm"
                          style={{ width: `${(r.value / maxValue) * 100}%`, backgroundColor: m === 'OPEC' ? '#d97706' : isDarkMode ? '#94a3b8' : '#475569' }}
                        />
                      </span>
                      <span className={`text-right tabular-nums ${textSec}`}>
                        {fmt(r.value)} <span className={`text-[10px] ${textMuted}`}>{tabMeta.unit}</span>
                        <span className={`ml-1 text-[10px] ${textMuted}`}>{share(r.value).toFixed(0)}%</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className={`text-[11px] mt-3 leading-relaxed ${textMuted}`}>
                World total {tabMeta.worldLabel}. {tabMeta.note}
              </p>
            </>
          )}
        </div>

        {/* Years of supply by country */}
        <div id={slugify('Years of Oil Left by Country')} className={`lg:col-span-2 rounded-lg border p-5 ${cardBg}`}>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
            <div>
              <h4 className={`text-base font-semibold ${textPrimary}`}>Years of Oil Left by Country</h4>
              <p className={`text-xs mt-0.5 ${textMuted}`}>Proven reserves ÷ current output (log-scaled bars)</p>
            </div>
            <SocialShareMenu title="Years of Oil Left by Country" subject="dataset" isDarkMode={isDarkMode} />
          </div>
          {loading && rp.length === 0 ? skeleton('h-72') : (
            <>
              <ul className="space-y-1.5">
                {rp.map(r => {
                  const color = r.years < 20 ? '#ef4444' : r.years < 60 ? '#f59e0b' : '#10b981';
                  return (
                    <li key={r.country} className="grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-2 text-xs">
                      <span className={`truncate ${textPrimary}`}>{label(r.country)}</span>
                      <span className={`relative h-3 rounded-sm ${track}`}>
                        <span className="absolute inset-y-0 left-0 rounded-sm" style={{ width: `${logWidth(r.years)}%`, backgroundColor: color }} />
                        <span
                          className={`absolute -top-0.5 -bottom-0.5 w-px ${isDarkMode ? 'bg-white/70' : 'bg-gray-900/60'}`}
                          style={{ left: `${logWidth(worldRp)}%` }}
                          aria-hidden="true"
                        />
                      </span>
                      <span className={`text-right tabular-nums font-medium ${textPrimary}`}>{Math.round(r.years)} yr</span>
                    </li>
                  );
                })}
              </ul>
              <div className={`flex items-center gap-3 flex-wrap text-[10px] mt-3 ${textMuted}`}>
                <span className="flex items-center gap-1"><span className={`w-px h-3 ${isDarkMode ? 'bg-white/70' : 'bg-gray-900/60'}`} />World ≈ {Math.round(worldRp)} yr</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rose-500" />&lt; 20</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500" />20–60</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500" />60+</span>
              </div>
              <p className={`text-[11px] mt-2 leading-relaxed ${textMuted}`}>
                Producers of at least 500 kb/d. High-output, low-reserve countries (the US, Norway, Brazil) must keep finding
                new oil to stand still; Venezuela, Iran and Iraq could pump at today&apos;s pace for a century or more —
                their constraint is investment and sanctions, not geology.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Rent composition */}
      <div id={slugify('Most Resource-Rent Dependent')} className={`rounded-lg border p-5 ${cardBg}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap mb-3">
          <div>
            <h4 className={`text-base font-semibold ${textPrimary}`}>Most Resource-Rent Dependent</h4>
            <p className={`text-xs mt-0.5 ${textMuted}`}>
              Natural-resource rents as % of GDP, split by source{rentYear ? ` · World Bank, latest year (mostly ${rentYear})` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] uppercase tracking-wider ${textMuted}`}>World Bank</span>
            <SocialShareMenu title="Most Resource-Rent Dependent" subject="dataset" isDarkMode={isDarkMode} />
          </div>
        </div>

        {loading ? skeleton('h-64') : rentRows.length === 0 ? (
          <div className={`text-sm ${textMuted}`}>No data available.</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 text-[11px] mb-3">
              {RENT_TYPES.map(t => (
                <span key={t.key} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: isDarkMode ? t.darkColor : t.color }} />
                  <span className={textSec}>{t.label}</span>
                </span>
              ))}
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5">
              {rentRows.map((r, i) => {
                const dominant = RENT_TYPES.reduce((best, t) => (r.parts[t.key] > r.parts[best.key] ? t : best), RENT_TYPES[0]);
                return (
                  <li key={r.country} className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-2 text-xs"
                    title={RENT_TYPES.filter(t => r.parts[t.key] > 0).map(t => `${t.label} ${r.parts[t.key].toFixed(1)}%`).join(' · ')}>
                    <span className={`truncate ${textPrimary}`}>
                      <span className={`tabular-nums mr-1 ${textMuted}`}>{i + 1}.</span>{label(r.country)}
                    </span>
                    <span className={`flex h-3 rounded-sm overflow-hidden ${track}`} style={{ width: '100%' }}>
                      {RENT_TYPES.map(t => r.parts[t.key] > 0 && (
                        <span key={t.key} className="h-full" style={{
                          width: `${(r.parts[t.key] / rentMax) * 100}%`,
                          backgroundColor: isDarkMode ? t.darkColor : t.color,
                        }} />
                      ))}
                    </span>
                    <span className={`text-right tabular-nums ${textSec}`}>
                      {r.total.toFixed(1)}%
                      <span className={`block text-[9px] leading-none ${textMuted}`}>{dominant.label.toLowerCase()}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className={`text-[11px] mt-3 leading-relaxed ${textMuted}`}>
              Rents are the value of extracted resources minus the cost of extracting them — the &ldquo;free money&rdquo; a
              country earns from what lies underground. Above ~10% of GDP, budgets and exchange rates start to move with world
              commodity prices; oil-heavy economies are the most exposed because oil is the most volatile of the five.
              Hover a bar for the exact split.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

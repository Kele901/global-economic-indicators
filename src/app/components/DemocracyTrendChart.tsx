'use client';

import { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from 'recharts';
import {
  POLITICS_PROFILES,
  POLITICS_BY_KEY,
  REGIME_COLORS,
  REGIME_LABELS,
  REGIME_ORDER,
  VDEM_YEARS,
  type PoliticalProfile,
} from '../services/politicsCurated';
import type { CountryKey } from '../utils/countryMappings';
import { COUNTRY_COLORS, COUNTRY_DISPLAY_NAMES, REGION_ORDER, getRegionFor } from '../utils/countryMappings';

type Mode = 'regimes' | 'regions' | 'countries';

const REGION_PALETTE = ['#2563eb', '#16a34a', '#7c3aed', '#dc2626', '#f59e0b', '#0d9488', '#db2777'];
const DEFAULT_PICKS: CountryKey[] = ['USA', 'India', 'Brazil', 'Poland', 'Turkey', 'Russia'];

interface Props {
  isDarkMode: boolean;
  /** Profile mode: this country against its region and the 47-country average. */
  focusKey?: CountryKey;
  height?: number;
}

function avgSeries(profiles: PoliticalProfile[]): number[] {
  return VDEM_YEARS.map((_, i) => {
    const vals = profiles.map((p) => p.indices.vdemLibDem[i]).filter((v) => v != null);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
  });
}

export default function DemocracyTrendChart({ isDarkMode, focusKey, height = 380 }: Props) {
  const [mode, setMode] = useState<Mode>('regimes');
  const [picks, setPicks] = useState<CountryKey[]>(DEFAULT_PICKS);

  const { data, lines } = useMemo(() => {
    let series: { id: string; name: string; color: string; values: number[]; dashed?: boolean }[] = [];
    if (focusKey) {
      const p = POLITICS_BY_KEY[focusKey];
      const region = getRegionFor(focusKey);
      if (p) series.push({ id: p.key, name: COUNTRY_DISPLAY_NAMES[p.key], color: '#6366f1', values: p.indices.vdemLibDem });
      if (region) series.push({ id: 'region', name: `${region} average`, color: '#f59e0b', values: avgSeries(POLITICS_PROFILES.filter((x) => getRegionFor(x.key) === region)), dashed: true });
      series.push({ id: 'all', name: '47-country average', color: '#94a3b8', values: avgSeries(POLITICS_PROFILES), dashed: true });
    } else if (mode === 'regimes') {
      series = REGIME_ORDER.map((r) => ({
        id: r,
        name: `${REGIME_LABELS[r]}s today`,
        color: REGIME_COLORS[r],
        values: avgSeries(POLITICS_PROFILES.filter((p) => p.system.regime === r)),
      }));
    } else if (mode === 'regions') {
      series = REGION_ORDER.map((r, i) => ({
        id: r,
        name: r,
        color: REGION_PALETTE[i % REGION_PALETTE.length],
        values: avgSeries(POLITICS_PROFILES.filter((p) => getRegionFor(p.key) === r)),
      }));
    } else {
      series = picks
        .map((k) => POLITICS_BY_KEY[k])
        .filter((p): p is PoliticalProfile => !!p)
        .map((p) => ({ id: p.key, name: COUNTRY_DISPLAY_NAMES[p.key], color: COUNTRY_COLORS[p.key] ?? '#6366f1', values: p.indices.vdemLibDem }));
    }
    const rows = VDEM_YEARS.map((year, i) => {
      const row: Record<string, number> = { year };
      for (const s of series) row[s.id] = Math.round((s.values[i] ?? 0) * 100) / 100;
      return row;
    });
    return { data: rows, lines: series };
  }, [mode, picks, focusKey]);

  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const btn = (active: boolean) =>
    `px-2.5 py-1 rounded-md text-xs font-medium border ${
      active
        ? isDarkMode ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200' : 'bg-indigo-50 border-indigo-400 text-indigo-700'
        : isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
    }`;

  const togglePick = (k: CountryKey) =>
    setPicks((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : cur.length >= 8 ? cur : [...cur, k]));

  return (
    <div>
      {!focusKey && (
        <>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button type="button" className={btn(mode === 'regimes')} onClick={() => setMode('regimes')}>By today&apos;s regime type</button>
            <button type="button" className={btn(mode === 'regions')} onClick={() => setMode('regions')}>By region</button>
            <button type="button" className={btn(mode === 'countries')} onClick={() => setMode('countries')}>Pick countries</button>
          </div>
          {mode === 'countries' && (
            <div className="flex flex-wrap gap-1 mb-3 max-h-28 overflow-y-auto">
              {POLITICS_PROFILES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => togglePick(p.key)}
                  className={`px-2 py-0.5 rounded text-[11px] border ${
                    picks.includes(p.key)
                      ? 'border-transparent text-white'
                      : isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
                  }`}
                  style={picks.includes(p.key) ? { backgroundColor: COUNTRY_COLORS[p.key] ?? '#6366f1' } : undefined}
                >
                  {COUNTRY_DISPLAY_NAMES[p.key]}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <ReferenceArea y1={0.7} y2={1} fill="#2563eb" fillOpacity={0.05} />
            <ReferenceArea y1={0} y2={0.2} fill="#dc2626" fillOpacity={0.05} />
            <XAxis dataKey="year" stroke={axis} tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 1]} stroke={axis} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}`, fontSize: 12 }}
              formatter={(v: number) => v.toFixed(2)}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {lines.map((s) => (
              <Line key={s.id} type="monotone" dataKey={s.id} name={s.name} stroke={s.color} strokeWidth={s.id === focusKey ? 3 : 2} strokeDasharray={s.dashed ? '5 4' : undefined} dot={{ r: 2 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-[11px] mt-2 ${textSec}`}>
        V-Dem Liberal Democracy Index (0 = least, 1 = most democratic), approximate readings every five years. Shaded bands mark strong (above 0.7) and minimal (below 0.2) liberal democracy.
        {!focusKey && mode === 'regimes' && ' Lines group countries by their regime type today, which shows how today\'s democracies and autocracies got there.'}
      </p>
    </div>
  );
}

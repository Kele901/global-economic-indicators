'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  POLITICS_PROFILES,
  REGIME_COLORS,
  REGIME_LABELS,
  type PoliticalProfile,
} from '../services/politicsCurated';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG, REGION_ORDER, getRegionFor } from '../utils/countryMappings';
import {
  compositeScore,
  formatMetric,
  metricScore,
  metricValue,
  scoreColor,
  type IndexMetric,
  type WgiByCountry,
} from '../utils/politicsColors';
import { COUNTRY_FLAGS } from './CountryFlag';

type WgiMetric = 'voice' | 'stability' | 'effectiveness' | 'ruleOfLaw' | 'corruption';
type Column = IndexMetric | WgiMetric | 'composite';

const CURATED_COLS: { id: IndexMetric; label: string; short: string }[] = [
  { id: 'eiu', label: 'EIU Democracy Index', short: 'EIU' },
  { id: 'freedomHouse', label: 'Freedom House score', short: 'FH' },
  { id: 'vdem', label: 'V-Dem Liberal Democracy', short: 'V-Dem' },
  { id: 'rsf', label: 'RSF press freedom rank', short: 'RSF' },
  { id: 'cpi', label: 'Corruption Perceptions Index', short: 'CPI' },
  { id: 'women', label: 'Women in parliament', short: 'Women' },
];

const WGI_COLS: { id: WgiMetric; label: string; short: string }[] = [
  { id: 'voice', label: 'WGI Voice & Accountability', short: 'Voice' },
  { id: 'stability', label: 'WGI Political Stability', short: 'Stab.' },
  { id: 'effectiveness', label: 'WGI Government Effectiveness', short: 'Eff.' },
  { id: 'ruleOfLaw', label: 'WGI Rule of Law', short: 'Law' },
  { id: 'corruption', label: 'WGI Control of Corruption', short: 'Corr.' },
];

interface Props {
  isDarkMode: boolean;
  wgi?: WgiByCountry;
  wgiLoading?: boolean;
}

export default function GovernanceScorecard({ isDarkMode, wgi, wgiLoading }: Props) {
  const [sort, setSort] = useState<{ col: Column; dir: 1 | -1 }>({ col: 'composite', dir: -1 });
  const [region, setRegion] = useState('All');
  const hasWgi = !!wgi && Object.keys(wgi).length > 0;

  const rows = useMemo(() => {
    const val = (p: PoliticalProfile): number => {
      if (sort.col === 'composite') return compositeScore(p);
      if (sort.col === 'rsf') return -metricValue(p, 'rsf');
      if (CURATED_COLS.some((c) => c.id === sort.col)) return metricValue(p, sort.col as IndexMetric);
      return wgi?.[p.key]?.[sort.col as WgiMetric] ?? -99;
    };
    return POLITICS_PROFILES
      .filter((p) => region === 'All' || getRegionFor(p.key) === region)
      .sort((a, b) => (val(a) - val(b)) * sort.dir);
  }, [sort, region, wgi]);

  const toggle = (col: Column) => setSort((s) => ({ col, dir: s.col === col ? (s.dir === 1 ? -1 : 1) : -1 }));

  const head = isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200';
  const rowCls = isDarkMode ? 'border-gray-800' : 'border-gray-100';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const input = isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900';

  const heat = (t: number) => ({ backgroundColor: `${scoreColor(t)}${isDarkMode ? '55' : '33'}` });

  const Th = ({ col, label, title }: { col: Column; label: string; title: string }) => (
    <th className="py-2 px-1.5 font-medium text-center cursor-pointer select-none whitespace-nowrap" title={title} onClick={() => toggle(col)}>
      {label}{sort.col === col ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}
    </th>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <select value={region} onChange={(e) => setRegion(e.target.value)} className={`px-2 py-1.5 rounded-md border text-sm ${input}`} aria-label="Filter by region">
          <option value="All">All regions</option>
          {REGION_ORDER.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <span className={`text-xs ${textSec}`}>
          Click a column to sort. Cells shade from red (weakest) to green (strongest).
          {wgiLoading ? ' Loading live World Bank governance indicators…' : hasWgi ? '' : ' Live WGI columns unavailable right now.'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className={`border-b text-[10px] uppercase tracking-wider ${head}`}>
              <th className="py-2 px-2 text-left font-medium">Country</th>
              <Th col="composite" label="Score" title="Composite of EIU, Freedom House, V-Dem, RSF and CPI (0-100)" />
              {CURATED_COLS.map((c) => <Th key={c.id} col={c.id} label={c.short} title={c.label} />)}
              {hasWgi && WGI_COLS.map((c) => <Th key={c.id} col={c.id} label={c.short} title={`${c.label} (live, -2.5 to +2.5)`} />)}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const Flag = COUNTRY_FLAGS[p.key];
              const comp = compositeScore(p);
              const w = wgi?.[p.key];
              return (
                <tr key={p.key} className={`border-b ${rowCls}`}>
                  <td className="py-1.5 px-2 whitespace-nowrap">
                    <Link href={`/politics-ledger/${COUNTRY_KEY_TO_SLUG[p.key]}`} className={`flex items-center gap-2 font-medium hover:underline ${textPrimary}`}>
                      {Flag && <Flag className="w-4 h-3 rounded-sm" />}
                      {COUNTRY_DISPLAY_NAMES[p.key]}
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: REGIME_COLORS[p.system.regime] }} title={REGIME_LABELS[p.system.regime]} />
                    </Link>
                  </td>
                  <td className={`py-1.5 px-1.5 text-center font-semibold tabular-nums ${textPrimary}`} style={heat(comp / 100)}>{comp.toFixed(0)}</td>
                  {CURATED_COLS.map((c) => (
                    <td key={c.id} className={`py-1.5 px-1.5 text-center tabular-nums ${textPrimary}`} style={heat(metricScore(p, c.id))}>
                      {formatMetric(p, c.id)}
                    </td>
                  ))}
                  {hasWgi && WGI_COLS.map((c) => {
                    const v = w?.[c.id];
                    return (
                      <td key={c.id} className={`py-1.5 px-1.5 text-center tabular-nums ${textPrimary}`} style={v != null ? heat((v + 2.5) / 5) : undefined}>
                        {v != null ? v.toFixed(2) : '—'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className={`text-[11px] mt-2 ${textSec}`}>
        Curated columns are approximate readings of the latest editions (EIU 2024, Freedom House 2025, V-Dem v15, RSF 2025, CPI 2024, IPU 2026). WGI columns are live from the World Bank (latest available year). Each index measures something different; the composite is a simple, unweighted average and is no substitute for reading the sources.
      </p>
    </div>
  );
}

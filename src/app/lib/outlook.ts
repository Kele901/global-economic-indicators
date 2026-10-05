import type React from 'react';
import type { Projection } from '../data/imfProjections';
import { REGIONAL_GDP_PROJECTIONS } from '../data/imfProjections';

export const CURRENT_YEAR = new Date().getFullYear();
export const PREV_YEAR = CURRENT_YEAR - 1;
export const NEXT_YEAR = CURRENT_YEAR + 1;

export interface Economy {
  key: string;
  name: string;
  iso2: string | null;
  isGroup: boolean;
}

/** Year → value, keyed by IMF code for aggregates (WEOWORLD, ADVEC, …) and by the site's country key otherwise. */
export type SeriesMap = Map<string, Record<number, number>>;

export interface OutlookSeries {
  gdp: SeriesMap;
  inflation: SeriesMap;
  /** False when the live IMF feed is down and only the bundled regional growth snapshot is available. */
  hasGroupInflation: boolean;
}

const FALLBACK_REGION_CODES: Record<string, string> = {
  'Advanced Economies': 'ADVEC',
  'Emerging Markets': 'OEMDC',
  'Developing Asia': 'DA',
  'Latin America': 'WE',
  'Sub-Saharan Africa': 'SSA',
  'Middle East': 'MECA',
  'Europe (Emerging)': 'EDE',
};

export function buildOutlookSeries(gdpProjections: Projection[], inflationProjections: Projection[]): OutlookSeries {
  const toMap = (list: Projection[]): SeriesMap =>
    new Map(list.map(p => [p.country === 'World' ? 'WEOWORLD' : p.country, p.values]));
  const gdp = toMap(gdpProjections);
  const inflation = toMap(inflationProjections);
  if (!gdp.has('ADVEC')) {
    for (const r of REGIONAL_GDP_PROJECTIONS) {
      const code = FALLBACK_REGION_CODES[r.region];
      if (code) gdp.set(code, { 2025: r.y2025, 2026: r.y2026, 2027: r.y2027, 2028: r.y2028 });
    }
  }
  return { gdp, inflation, hasGroupInflation: inflation.has('ADVEC') };
}

export const pct = (v: number | null | undefined) => (v == null ? '—' : `${v.toFixed(1)}%`);

export const pp = (v: number | null | undefined) =>
  v == null ? '—' : `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)} pp`;

export function mean(values: Record<number, number> | undefined, from: number, to: number): number | null {
  if (!values) return null;
  const picked: number[] = [];
  for (let y = from; y <= to; y++) if (typeof values[y] === 'number') picked.push(values[y]);
  return picked.length ? picked.reduce((s, v) => s + v, 0) / picked.length : null;
}

export function lastYearOf(values: Record<number, number> | undefined): number | null {
  if (!values) return null;
  const years = Object.keys(values).map(Number);
  return years.length ? Math.max(...years) : null;
}

/** Years for output to double at a constant annual growth rate (%). */
export const doublingYears = (growth: number) => Math.log(2) / Math.log(1 + growth / 100);

export function outlookTheme(isDarkMode: boolean) {
  return isDarkMode
    ? {
        grid: '#374151',
        axis: '#9ca3af',
        textSec: 'text-gray-400',
        textStrong: 'text-gray-100',
        subtle: 'bg-gray-700/40 border-gray-700',
        border: 'border-gray-700',
        toggleBorder: 'border-gray-600',
        tooltip: { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' } as React.CSSProperties,
      }
    : {
        grid: '#e5e7eb',
        axis: '#6b7280',
        textSec: 'text-gray-500',
        textStrong: 'text-gray-900',
        subtle: 'bg-gray-50 border-gray-200',
        border: 'border-gray-200',
        toggleBorder: 'border-gray-300',
        tooltip: { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } as React.CSSProperties,
      };
}

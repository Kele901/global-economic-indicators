// Shared Gini vocabulary for the inequality ranking card and hero ticker, so
// the two always agree on band colours, region membership and staleness.

import type { CountryKey } from '../utils/countryMappings';

export const STALE_AFTER_YEARS = 6;

// World Bank's own descriptive bands: below 30 is Nordic-style compression,
// above 45 is the Latin America / Southern Africa cluster.
export const BANDS = [
  { max: 30, color: '#10b981', label: 'Under 30', note: 'highly compressed' },
  { max: 35, color: '#84cc16', label: '30–35', note: 'low' },
  { max: 40, color: '#f59e0b', label: '35–40', note: 'moderate' },
  { max: 45, color: '#f97316', label: '40–45', note: 'high' },
  { max: Infinity, color: '#ef4444', label: '45+', note: 'highly unequal' },
];

export const REGIONS = [
  { id: 'americas-n', label: 'North America', short: 'N.Am', keys: ['USA', 'Canada'] },
  { id: 'latam', label: 'Latin America', short: 'LatAm', keys: ['Mexico', 'Brazil', 'Chile', 'Argentina', 'Colombia'] },
  { id: 'europe', label: 'Europe', short: 'Eur', keys: ['UK', 'France', 'Germany', 'Italy', 'Spain', 'Sweden', 'Switzerland', 'Norway', 'Netherlands', 'Portugal', 'Belgium', 'Poland', 'Greece', 'Russia', 'Ukraine'] },
  { id: 'mena', label: 'Middle East & N. Africa', short: 'MENA', keys: ['Turkey', 'SaudiArabia', 'Egypt', 'Israel', 'Iran', 'UAE', 'Qatar', 'Morocco'] },
  { id: 'ssa', label: 'Sub-Saharan Africa', short: 'SSA', keys: ['Nigeria', 'SouthAfrica', 'Kenya', 'Ethiopia', 'Ghana'] },
  { id: 'asia', label: 'Asia-Pacific', short: 'APAC', keys: ['Japan', 'Australia', 'SouthKorea', 'China', 'India', 'Indonesia', 'Singapore', 'Vietnam', 'Thailand', 'Philippines', 'Pakistan', 'Bangladesh'] },
] as const satisfies readonly { id: string; label: string; short: string; keys: readonly CountryKey[] }[];
export type RegionId = (typeof REGIONS)[number]['id'];

export const REGION_OF = Object.fromEntries(REGIONS.flatMap(r => r.keys.map(k => [k, r.id]))) as Record<CountryKey, RegionId>;

export const bandOf = (gini: number) => BANDS.find(b => gini < b.max) ?? BANDS[BANDS.length - 1]!;

export const medianOf = (values: number[]) => {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1]! + s[mid]!) / 2 : s[mid]!;
};

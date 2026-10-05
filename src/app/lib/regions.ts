// Regional grouping of the 47-country roster, shared by the ledger ranking
// cards (region chips, regional averages) so every page groups countries the
// same way.

import type { CountryKey } from '../utils/countryMappings';

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

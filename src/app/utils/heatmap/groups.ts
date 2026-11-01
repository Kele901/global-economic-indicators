import { COUNTRY_KEYS, COUNTRY_REGIONS, type CountryKey } from '../countryMappings';
import { entries, type CountryValues } from './values';

export interface CountryGroup {
  id: string;
  label: string;
  kind: 'region' | 'bloc';
  members: CountryKey[];
}

const BLOCS: { id: string; label: string; members: string[] }[] = [
  { id: 'g7', label: 'G7', members: ['USA', 'Canada', 'UK', 'France', 'Germany', 'Italy', 'Japan'] },
  {
    id: 'g20',
    label: 'G20',
    members: ['Argentina', 'Australia', 'Brazil', 'Canada', 'China', 'France', 'Germany', 'India', 'Indonesia', 'Italy', 'Japan', 'Mexico', 'Russia', 'SaudiArabia', 'SouthAfrica', 'SouthKorea', 'Turkey', 'UK', 'USA'],
  },
  {
    id: 'brics',
    label: 'BRICS',
    members: ['Brazil', 'Russia', 'India', 'China', 'SouthAfrica', 'Egypt', 'Ethiopia', 'Iran', 'UAE', 'Indonesia'],
  },
  { id: 'eu', label: 'European Union', members: ['France', 'Germany', 'Italy', 'Spain', 'Sweden', 'Netherlands', 'Portugal', 'Belgium', 'Poland', 'Greece'] },
  { id: 'opec', label: 'OPEC', members: ['SaudiArabia', 'Iran', 'UAE', 'Nigeria'] },
  { id: 'asean', label: 'ASEAN', members: ['Indonesia', 'Singapore', 'Vietnam', 'Thailand', 'Philippines'] },
];

const known = new Set<string>(COUNTRY_KEYS);

export const COUNTRY_GROUPS: CountryGroup[] = [
  ...BLOCS.map(b => ({ ...b, kind: 'bloc' as const, members: b.members.filter(m => known.has(m)) as CountryKey[] })),
  ...Object.entries(COUNTRY_REGIONS).map(([label, members]) => ({
    id: `region-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`,
    label,
    kind: 'region' as const,
    members,
  })),
];

export function getGroup(id: string | null | undefined): CountryGroup | undefined {
  return id ? COUNTRY_GROUPS.find(g => g.id === id) : undefined;
}

export interface GroupStats {
  count: number;
  mean: number;
  median: number;
  top: { country: CountryKey; value: number };
  bottom: { country: CountryKey; value: number };
}

export function groupStats(values: CountryValues, members: CountryKey[]): GroupStats | null {
  const memberSet = new Set(members);
  const rows = entries(values).filter(([ck]) => memberSet.has(ck)).sort((a, b) => b[1] - a[1]);
  if (rows.length === 0) return null;
  const vs = rows.map(r => r[1]);
  const mid = Math.floor(vs.length / 2);
  const sortedAsc = [...vs].sort((a, b) => a - b);
  const median = vs.length % 2 ? sortedAsc[mid] : (sortedAsc[mid - 1] + sortedAsc[mid]) / 2;
  return {
    count: rows.length,
    mean: vs.reduce((s, v) => s + v, 0) / vs.length,
    median,
    top: { country: rows[0][0], value: rows[0][1] },
    bottom: { country: rows[rows.length - 1][0], value: rows[rows.length - 1][1] },
  };
}

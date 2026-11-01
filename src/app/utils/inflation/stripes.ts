import type { CountryData } from '../../services/worldbank';
import { COUNTRY_REGIONS, REGION_ORDER, type CountryKey } from '../countryMappings';
import { mean, seriesOf, stdDev } from './stats';

export interface StripeBin {
  id: string;
  label: string;
  /** Inclusive lower bound. */
  min: number;
  /** Exclusive upper bound. */
  max: number;
  color: string;
}

// Fixed diverging scale so a colour means the same rate in every row and year:
// blues below zero, near-neutral around typical targets, reds as it runs away.
export const STRIPE_BINS: StripeBin[] = [
  { id: 'deflation', label: 'Below 0%', min: -Infinity, max: 0, color: '#2563eb' },
  { id: '0-2', label: '0-2%', min: 0, max: 2, color: '#93c5fd' },
  { id: '2-4', label: '2-4%', min: 2, max: 4, color: '#e7e5e4' },
  { id: '4-6', label: '4-6%', min: 4, max: 6, color: '#fde68a' },
  { id: '6-10', label: '6-10%', min: 6, max: 10, color: '#fdba74' },
  { id: '10-20', label: '10-20%', min: 10, max: 20, color: '#f97316' },
  { id: '20-50', label: '20-50%', min: 20, max: 50, color: '#dc2626' },
  { id: '50+', label: '50% and above', min: 50, max: Infinity, color: '#7f1d1d' },
];

export const NO_DATA_COLOR = { light: '#f3f4f6', dark: '#1f2937' };

export function binFor(value: number | null | undefined): StripeBin | null {
  if (value == null || !Number.isFinite(value)) return null;
  return STRIPE_BINS.find((b) => value >= b.min && value < b.max) ?? null;
}

export interface StripeRow {
  key: CountryKey;
  region: string;
  cells: (number | null)[];
  mean: number | null;
  sd: number | null;
}

export function stripeRows(
  rows: CountryData[] | undefined,
  keys: readonly CountryKey[],
  fromYear: number,
  toYear: number,
): StripeRow[] {
  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i);
  return keys.map((key) => {
    const byYear = new Map(seriesOf(rows, key).map((o) => [o.year, o.value]));
    const cells = years.map((y) => byYear.get(y) ?? null);
    const vals = cells.filter((v): v is number => v != null);
    return {
      key,
      region: regionOf(key),
      cells,
      mean: mean(vals),
      sd: stdDev(vals),
    };
  });
}

export function regionOf(key: CountryKey): string {
  return REGION_ORDER.find((r) => COUNTRY_REGIONS[r].includes(key)) ?? 'Other';
}

export type StripeSort = 'region' | 'average' | 'volatility';

// Rows with no data at all sink to the bottom whatever the sort.
export function sortStripeRows(rows: StripeRow[], by: StripeSort): StripeRow[] {
  const rank = (r: StripeRow) => (by === 'average' ? r.mean : r.sd);
  return [...rows].sort((a, b) => {
    if (by === 'region') {
      const d = REGION_ORDER.indexOf(a.region) - REGION_ORDER.indexOf(b.region);
      return d !== 0 ? d : orderInRegion(a) - orderInRegion(b);
    }
    const [ra, rb] = [rank(a), rank(b)];
    if (ra == null && rb == null) return 0;
    if (ra == null) return 1;
    if (rb == null) return -1;
    return rb - ra;
  });
}

function orderInRegion(r: StripeRow): number {
  return COUNTRY_REGIONS[r.region]?.indexOf(r.key) ?? 0;
}

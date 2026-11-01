import type { CountryData } from '../../services/worldbank';
import { COUNTRY_KEYS, type CountryKey } from '../countryMappings';

export interface Obs {
  year: number;
  value: number;
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

// Missing World Bank observations are dropped at load time, so every stored
// number (including 0) is a real observation.
export function seriesOf(rows: CountryData[] | undefined, key: string): Obs[] {
  if (!rows?.length) return [];
  const out: Obs[] = [];
  for (const row of rows) {
    const v = (row as Record<string, unknown>)[key];
    if (isNum(v)) out.push({ year: Number(row.year), value: v });
  }
  return out.sort((a, b) => a.year - b.year);
}

export function valueAt(rows: CountryData[] | undefined, key: string, year: number): number | null {
  const row = rows?.find((r) => Number(r.year) === year);
  const v = row ? (row as Record<string, unknown>)[key] : undefined;
  return isNum(v) ? v : null;
}

export function latestOf(rows: CountryData[] | undefined, key: string, minYear = 0): Obs | null {
  const s = seriesOf(rows, key);
  const last = s[s.length - 1];
  return last && last.year >= minYear ? last : null;
}

export function latestByCountry(
  rows: CountryData[] | undefined,
  keys: readonly CountryKey[] = COUNTRY_KEYS,
  minYear = 0,
): Partial<Record<CountryKey, Obs>> {
  const out: Partial<Record<CountryKey, Obs>> = {};
  for (const k of keys) {
    const o = latestOf(rows, k, minYear);
    if (o) out[k] = o;
  }
  return out;
}

export function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// Population standard deviation: these are complete decades, not samples.
export function stdDev(values: number[]): number | null {
  const m = mean(values);
  if (m == null) return null;
  return Math.sqrt(values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length);
}

export function countNearTarget(values: number[], target = 2, tolerance = 1): number {
  return values.filter((v) => Math.abs(v - target) <= tolerance).length;
}

export interface Direction {
  rising: CountryKey[];
  falling: CountryKey[];
  flat: CountryKey[];
}

// Compares each country's latest observation with the one before it.
export function risingFalling(
  rows: CountryData[] | undefined,
  keys: readonly CountryKey[] = COUNTRY_KEYS,
  threshold = 0.1,
  minYear = 0,
): Direction {
  const out: Direction = { rising: [], falling: [], flat: [] };
  for (const k of keys) {
    const s = seriesOf(rows, k);
    if (s.length < 2) continue;
    const [prev, last] = [s[s.length - 2], s[s.length - 1]];
    if (last.year < minYear) continue;
    const d = last.value - prev.value;
    if (d > threshold) out.rising.push(k);
    else if (d < -threshold) out.falling.push(k);
    else out.flat.push(k);
  }
  return out;
}

export interface DecadeStat {
  mean: number;
  sd: number;
  n: number;
}

// Needs at least `minYears` observations in the decade to say anything.
export function decadeStats(
  rows: CountryData[] | undefined,
  key: string,
  decadeStart: number,
  minYears = 5,
): DecadeStat | null {
  const vals = seriesOf(rows, key)
    .filter((o) => o.year >= decadeStart && o.year < decadeStart + 10)
    .map((o) => o.value);
  if (vals.length < minYears) return null;
  return { mean: mean(vals)!, sd: stdDev(vals)!, n: vals.length };
}

export function peakSince(rows: CountryData[] | undefined, key: string, fromYear: number): Obs | null {
  let best: Obs | null = null;
  for (const o of seriesOf(rows, key)) {
    if (o.year >= fromYear && (!best || o.value > best.value)) best = o;
  }
  return best;
}

// Share of the way from the peak back down to target: 0 = still at the peak,
// 1 = back at target, above 1 = undershot. Null when the peak never exceeded
// target, since there was nothing to come back from.
export function disinflationProgress(peak: number, latest: number, target: number): number | null {
  if (peak <= target) return null;
  return (peak - latest) / (peak - target);
}

// Cross-country median of each year, for a "typical economy" line.
export function medianByYear(
  rows: CountryData[] | undefined,
  keys: readonly CountryKey[] = COUNTRY_KEYS,
  minCountries = 10,
): Obs[] {
  if (!rows?.length) return [];
  const out: Obs[] = [];
  for (const row of rows) {
    const vals = keys.map((k) => (row as Record<string, unknown>)[k]).filter(isNum);
    if (vals.length >= minCountries) out.push({ year: Number(row.year), value: median(vals)! });
  }
  return out.sort((a, b) => a.year - b.year);
}

// FRED observations arrive as { date: 'YYYY-MM-DD', value: '12.3' | '.' }.
export function annualAverages(observations: { date: string; value: string }[] | undefined): Obs[] {
  const byYear = new Map<number, number[]>();
  for (const o of observations ?? []) {
    const v = Number(o.value);
    if (o.value === '.' || !Number.isFinite(v)) continue;
    const y = Number(o.date.slice(0, 4));
    byYear.set(y, [...(byYear.get(y) ?? []), v]);
  }
  return [...byYear.entries()]
    .map(([year, vs]) => ({ year, value: vs.reduce((s, v) => s + v, 0) / vs.length }))
    .sort((a, b) => a.year - b.year);
}

// Gaussian kernel density on a fixed grid, normalised so the curve integrates to ~1.
export function kde(values: number[], grid: number[], bandwidth: number): number[] {
  if (!values.length || bandwidth <= 0) return grid.map(() => 0);
  const norm = 1 / (values.length * bandwidth * Math.sqrt(2 * Math.PI));
  return grid.map((x) => norm * values.reduce((s, v) => s + Math.exp(-0.5 * ((x - v) / bandwidth) ** 2), 0));
}

// Year-on-year % change of a level series (e.g. an index or a price).
export function pctChanges(series: Obs[]): Obs[] {
  const out: Obs[] = [];
  for (let i = 1; i < series.length; i++) {
    const [a, b] = [series[i - 1], series[i]];
    if (b.year === a.year + 1 && a.value !== 0) out.push({ year: b.year, value: (b.value / a.value - 1) * 100 });
  }
  return out;
}

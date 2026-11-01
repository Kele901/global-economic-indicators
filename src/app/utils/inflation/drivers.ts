import type { CountryData } from '../../services/worldbank';
import type { CountryKey } from '../countryMappings';
import { pearsonCorrelation } from '../correlationEngine';
import { mean, pctChanges, seriesOf, valueAt, type Obs } from './stats';

export interface PhillipsPoint {
  year: number;
  unemployment: number;
  inflation: number;
  decade: number;
}

// One country's (unemployment, inflation) pairs in year order, for a connected scatter.
export function phillipsPath(
  unemploymentRows: CountryData[] | undefined,
  inflationRows: CountryData[] | undefined,
  key: string,
  fromYear = 0,
): PhillipsPoint[] {
  const out: PhillipsPoint[] = [];
  for (const u of seriesOf(unemploymentRows, key)) {
    if (u.year < fromYear) continue;
    const inf = valueAt(inflationRows, key, u.year);
    if (inf == null) continue;
    out.push({ year: u.year, unemployment: u.value, inflation: inf, decade: Math.floor(u.year / 10) * 10 });
  }
  return out;
}

export interface LongRunPoint {
  key: CountryKey;
  x: number;
  y: number;
  years: number;
}

// Per-country averages of two series over the same years, e.g. money growth
// against inflation. Only years present in both series count.
export function longRunAverages(
  xRows: CountryData[] | undefined,
  yRows: CountryData[] | undefined,
  keys: readonly CountryKey[],
  fromYear: number,
  toYear: number,
  minYears = 5,
  lag = 0,
): LongRunPoint[] {
  const out: LongRunPoint[] = [];
  for (const key of keys) {
    const xs: number[] = [];
    const ys: number[] = [];
    for (const o of seriesOf(xRows, key)) {
      if (o.year < fromYear || o.year > toYear) continue;
      const y = valueAt(yRows, key, o.year + lag);
      if (y == null) continue;
      xs.push(o.value);
      ys.push(y);
    }
    if (xs.length >= minYears) out.push({ key, x: mean(xs)!, y: mean(ys)!, years: xs.length });
  }
  return out;
}

// Year-on-year % change in local currency per US dollar: positive = the
// currency lost value against the dollar.
export function depreciationRows(fxRows: CountryData[] | undefined, keys: readonly CountryKey[]): CountryData[] {
  const byYear = new Map<number, CountryData>();
  for (const key of keys) {
    for (const o of pctChanges(seriesOf(fxRows, key))) {
      const row = byYear.get(o.year) ?? { year: o.year };
      row[key] = o.value;
      byYear.set(o.year, row);
    }
  }
  return [...byYear.values()].sort((a, b) => a.year - b.year);
}

export interface PairPoint {
  year: number;
  x: number;
  y: number;
}

// Depreciation in year t against inflation in year t + lag, for one country.
export function passThroughPairs(
  depRows: CountryData[] | undefined,
  inflationRows: CountryData[] | undefined,
  key: string,
  fromYear = 0,
  lag = 1,
): PairPoint[] {
  const out: PairPoint[] = [];
  for (const d of seriesOf(depRows, key)) {
    if (d.year < fromYear) continue;
    const inf = valueAt(inflationRows, key, d.year + lag);
    if (inf != null) out.push({ year: d.year, x: d.value, y: inf });
  }
  return out;
}

export function correlationOf(points: { x: number; y: number }[]): number | null {
  if (points.length < 3) return null;
  return pearsonCorrelation(
    points.map((p) => p.x),
    points.map((p) => p.y),
  );
}

// Rebase a series so `baseYear` = 100, for overlaying oil, food and CPI.
export function rebase(series: Obs[], baseYear: number): Obs[] {
  const base = series.find((o) => o.year === baseYear)?.value;
  if (!base) return [];
  return series.map((o) => ({ year: o.year, value: (o.value / base) * 100 }));
}

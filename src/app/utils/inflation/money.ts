import type { CountryData } from '../../services/worldbank';
import { seriesOf, type Obs } from './stats';

// Years for prices to double at a constant annual rate (%). Null when prices
// are flat or falling, since they never double.
export function doublingYears(ratePct: number): number | null {
  if (!(ratePct > 0)) return null;
  return Math.log(2) / Math.log(1 + ratePct / 100);
}

export interface Erosion {
  fromYear: number;
  toYear: number;
  /** How many times prices have multiplied. */
  multiple: number;
  /** What 1 unit of money from `fromYear` buys today, as a share. */
  purchasingPower: number;
  /** CPI rebased to 100 in `fromYear`. */
  series: Obs[];
}

// Uses the first CPI year at or after `birthYear`, so a 1955 birth year in a
// series that starts in 1960 is measured from 1960 (and says so via fromYear).
export function lifetimeErosion(cpiRows: CountryData[] | undefined, key: string, birthYear: number): Erosion | null {
  const s = seriesOf(cpiRows, key).filter((o) => o.year >= birthYear && o.value > 0);
  if (s.length < 2) return null;
  const [first, last] = [s[0], s[s.length - 1]];
  const multiple = last.value / first.value;
  return {
    fromYear: first.year,
    toYear: last.year,
    multiple,
    purchasingPower: 1 / multiple,
    series: s.map((o) => ({ year: o.year, value: (o.value / first.value) * 100 })),
  };
}

export const WORK_HOURS_PER_MONTH = 160;

export function hoursOfWork(price: number | null | undefined, monthlyNetSalary: number | null | undefined, hoursPerMonth = WORK_HOURS_PER_MONTH): number | null {
  if (price == null || !monthlyNetSalary || monthlyNetSalary <= 0) return null;
  return price / (monthlyNetSalary / hoursPerMonth);
}

type PriceRow = { year: number; [k: string]: number | null };

export function priceAt(rows: PriceRow[], key: string, year: number): number | null {
  const v = rows.find((r) => r.year === year)?.[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

// Average % change in a basket of items between two years, as the geometric
// mean of each item's price relative (Jevons, as statistical offices use for
// elementary aggregates). Items missing in either year are skipped.
export function categoryChange(rows: PriceRow[], keys: string[], fromYear: number, toYear: number): number | null {
  const relatives: number[] = [];
  for (const k of keys) {
    const [a, b] = [priceAt(rows, k, fromYear), priceAt(rows, k, toYear)];
    if (a && b && a > 0) relatives.push(b / a);
  }
  if (!relatives.length) return null;
  const logMean = relatives.reduce((s, r) => s + Math.log(r), 0) / relatives.length;
  return (Math.exp(logMean) - 1) * 100;
}

// Personal inflation: weighted average of category changes, with weights
// normalised over the categories that actually have a change.
export function personalInflation(weights: Record<string, number>, changes: Record<string, number | null>): number | null {
  let wSum = 0;
  let acc = 0;
  for (const [cat, w] of Object.entries(weights)) {
    const c = changes[cat];
    if (c == null || !(w > 0)) continue;
    wSum += w;
    acc += w * c;
  }
  return wSum > 0 ? acc / wSum : null;
}

// Converts a cumulative % change over `years` into an annual rate.
export function annualised(totalPct: number, years: number): number | null {
  if (years <= 0 || totalPct <= -100) return null;
  return ((1 + totalPct / 100) ** (1 / years) - 1) * 100;
}

// Real value of savings that earn `nominalRates[i]` while prices rise by
// `inflationRates[i]`, compounding year by year from `start`.
export function realSavingsPath(start: number, nominalRates: number[], inflationRates: number[]): number[] {
  const out = [start];
  for (let i = 0; i < Math.min(nominalRates.length, inflationRates.length); i++) {
    const prev = out[out.length - 1];
    out.push((prev * (1 + nominalRates[i] / 100)) / (1 + inflationRates[i] / 100));
  }
  return out;
}

// Real value of a fixed nominal debt after each year at a constant inflation rate.
export function debtErosionPath(principal: number, inflationPct: number, years: number): number[] {
  return Array.from({ length: years + 1 }, (_, i) => principal / (1 + inflationPct / 100) ** i);
}

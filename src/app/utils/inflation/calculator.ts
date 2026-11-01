import type { CountryData } from '../../services/worldbank';
import {
  calculateInflation,
  euroConversionRate,
  getCountryDateRange,
  getCurrencySymbol,
  type CountryDateRange,
  type InflationCalculation,
} from '../../services/inflationCalculator';
import { COUNTRY_KEYS, COUNTRY_SLUGS, type CountryKey } from '../countryMappings';

export type CalcMode = 'value' | 'compare' | 'reverse';
export const CALC_MODES: CalcMode[] = ['value', 'compare', 'reverse'];
export const MAX_COMPARE = 4;
export const DEFAULT_COMPARE: CountryKey[] = ['USA', 'UK', 'Japan', 'Brazil'];

export function cpiAt(rows: CountryData[], country: string, year: number): number | null {
  const v = rows.find((r) => r.year === year)?.[country];
  return typeof v === 'number' && v > 0 ? v : null;
}

/** Years every country in `countries` covers; null when they don't overlap by at least two years. */
export function sharedRange(rows: CountryData[], countries: string[]): CountryDateRange | null {
  const ranges = countries.map((c) => getCountryDateRange(rows, c));
  if (!ranges.length || ranges.some((r) => !r)) return null;
  const startYear = Math.max(...ranges.map((r) => r!.startYear));
  const endYear = Math.min(...ranges.map((r) => r!.endYear));
  return endYear > startYear ? { startYear, endYear, dataPoints: endYear - startYear + 1 } : null;
}

/** Pull a from/to pair into `range`, keeping from < to. */
export function clampYears(from: number, to: number, range: CountryDateRange | null): { from: number; to: number } {
  if (!range) return { from, to };
  const f = Math.min(Math.max(from, range.startYear), range.endYear - 1);
  return { from: f, to: Math.max(Math.min(to, range.endYear), f + 1) };
}

function safely<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

export interface CompareRow {
  country: string;
  result: InflationCalculation | null;
}

/** The same nominal amount, in each country's own currency, carried from `from` to `to`. */
export function compareCountries(amount: number, from: number, to: number, countries: string[], rows: CountryData[]): CompareRow[] {
  return countries.map((country) => ({ country, result: safely(() => calculateInflation(amount, from, to, country, rows)) }));
}

/** Price level rebased to 100 in `from`, one column per country. */
export function indexedSeries(rows: CountryData[], countries: string[], from: number, to: number): Array<{ year: number } & Record<string, number>> {
  const bases = countries.map((c) => cpiAt(rows, c, from));
  const out: Array<{ year: number } & Record<string, number>> = [];
  for (let year = from; year <= to; year++) {
    const row: { year: number } & Record<string, number> = { year };
    let any = false;
    countries.forEach((c, i) => {
      const base = bases[i];
      const v = cpiAt(rows, c, year);
      if (base && v) {
        row[c] = (v / base) * 100;
        any = true;
      }
    });
    if (any) out.push(row);
  }
  return out;
}

export interface ReverseResult {
  amountToday: number;
  fromYear: number;
  toYear: number;
  /** What it took in `fromYear`, in that year's currency. */
  pastAmount: number;
  priceMultiple: number;
  pastCurrency: string;
  todayCurrency: string;
  /** Old-currency units per euro when the period spans euro adoption. */
  conversionRate?: number;
}

/** What amount in `fromYear` bought the same as `amount` in `toYear`. */
export function reverseInflation(amount: number, fromYear: number, toYear: number, country: string, rows: CountryData[]): ReverseResult | null {
  if (fromYear >= toYear) throw new Error('Start year must be before end year');
  if (amount <= 0) throw new Error('Amount must be greater than zero');
  const base = cpiAt(rows, country, fromYear);
  const end = cpiAt(rows, country, toYear);
  if (base == null || end == null) return null;
  const rate = euroConversionRate(country, fromYear, toYear);
  return {
    amountToday: amount,
    fromYear,
    toYear,
    pastAmount: amount * (base / end) * rate,
    priceMultiple: end / base,
    pastCurrency: getCurrencySymbol(country, fromYear),
    todayCurrency: getCurrencySymbol(country, toYear),
    conversionRate: rate !== 1 ? rate : undefined,
  };
}

export interface Milestone {
  year: number;
  /** Prices relative to the first year: 2 means they doubled, 0.5 that they halved. */
  priceMultiple: number;
}

/**
 * First year prices crossed each power of two (purchasing power halving each
 * time), plus halvings of prices when there was deflation. Hyperinflation would
 * give dozens of doublings, so past `maxCount` the step widens to powers of ten.
 */
export function priceMilestones(points: { year: number; value: number }[], maxCount = 10): Milestone[] {
  const valid = points.filter((p) => p.value > 0);
  if (valid.length < 2) return [];
  const base = valid[0].value;
  const ratios = valid.map((p) => ({ year: p.year, r: p.value / base }));
  const maxR = Math.max(...ratios.map((p) => p.r));
  const minR = Math.min(...ratios.map((p) => p.r));
  const out: Milestone[] = [];

  if (maxR >= 2) {
    const step = Math.log2(maxR) <= maxCount ? 2 : 10 ** Math.ceil(Math.log10(maxR) / maxCount);
    for (let m = step; m <= maxR * (1 + 1e-9); m *= step) {
      const hit = ratios.find((p) => p.r >= m * (1 - 1e-9));
      if (hit) out.push({ year: hit.year, priceMultiple: m });
    }
  }
  if (minR <= 0.5) {
    for (let m = 0.5; m >= minR * (1 - 1e-9) && out.length < maxCount * 2; m /= 2) {
      const hit = ratios.find((p) => p.r <= m * (1 + 1e-9));
      if (hit) out.push({ year: hit.year, priceMultiple: m });
    }
  }
  return out.sort((a, b) => a.year - b.year || b.priceMultiple - a.priceMultiple);
}

export interface YearRow {
  year: number;
  cpi: number;
  /** Change in the price level from the previous year, %; null for the first year or a gap. */
  inflation: number | null;
  /** What `amount` from the first year costs in this year. */
  equivalent: number;
  /** What `amount` held as cash since the first year buys, in first-year prices. */
  purchasingPower: number;
}

export function yearByYear(amount: number, from: number, to: number, country: string, rows: CountryData[]): YearRow[] {
  const base = cpiAt(rows, country, from);
  if (base == null) return [];
  const out: YearRow[] = [];
  for (let year = from; year <= to; year++) {
    const v = cpiAt(rows, country, year);
    if (v == null) continue;
    const prev = cpiAt(rows, country, year - 1);
    out.push({
      year,
      cpi: v,
      inflation: year > from && prev ? (v / prev - 1) * 100 : null,
      equivalent: amount * (v / base),
      purchasingPower: amount * (base / v),
    });
  }
  return out;
}

/** Up to `count` evenly spaced rows, always including the first and last. */
export function evenlySpaced<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const picks = new Set<number>();
  for (let i = 0; i < count; i++) picks.add(Math.round((i * (items.length - 1)) / (count - 1)));
  return [...picks].sort((a, b) => a - b).map((i) => items[i]);
}

// URL state ---------------------------------------------------------------

export interface CalcUrlState {
  mode: CalcMode;
  amount: number;
  from: number;
  to: number;
  countries: CountryKey[];
}

const KEY_LOOKUP = new Map<string, CountryKey>(COUNTRY_KEYS.map((k) => [k.toLowerCase(), k]));

/** Accepts internal keys ("SouthKorea", case-insensitive) or page slugs ("south-korea"). */
export function parseCountry(token: string): CountryKey | null {
  const t = token.trim().toLowerCase();
  return KEY_LOOKUP.get(t) ?? COUNTRY_SLUGS[t] ?? null;
}

export function parseCalcParams(params: URLSearchParams): Partial<CalcUrlState> {
  const out: Partial<CalcUrlState> = {};
  const mode = params.get('mode');
  if (mode && (CALC_MODES as string[]).includes(mode)) out.mode = mode as CalcMode;
  const amount = Number(params.get('amount'));
  if (params.has('amount') && Number.isFinite(amount) && amount > 0) out.amount = amount;
  const from = Number(params.get('from'));
  if (params.has('from') && Number.isInteger(from)) out.from = from;
  const to = Number(params.get('to'));
  if (params.has('to') && Number.isInteger(to)) out.to = to;
  const c = params.get('c');
  if (c) {
    const keys = [...new Set(c.split(',').map(parseCountry).filter((k): k is CountryKey => !!k))];
    if (keys.length) out.countries = keys.slice(0, MAX_COMPARE);
  }
  return out;
}

export function calcQuery(state: CalcUrlState): string {
  const p = new URLSearchParams();
  if (state.mode !== 'value') p.set('mode', state.mode);
  p.set('amount', String(state.amount));
  p.set('from', String(state.from));
  p.set('to', String(state.to));
  p.set('c', state.countries.join(','));
  return p.toString();
}

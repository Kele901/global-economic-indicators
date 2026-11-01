import type { CountryData } from '../../services/worldbank';
import type { MetricDefinition } from '../metricCategories';
import { COUNTRY_KEYS, type CountryKey } from '../countryMappings';

export type HeatmapData = Record<string, CountryData[] | undefined>;
export type CountryValues = Partial<Record<CountryKey, number>>;
export type ValueMode = 'level' | 'change' | 'pctChange';

export const TOTAL_COUNTRIES = COUNTRY_KEYS.length;

export function rowFor(data: HeatmapData, metric: string, year: number): CountryData | undefined {
  return data[metric]?.find(r => Number(r.year) === year);
}

// The World Bank feed encodes "no observation" as 0 as well as as a missing
// key, so zero is treated as missing throughout the heatmap.
export function readValue(row: CountryData | undefined, country: CountryKey): number | null {
  if (!row) return null;
  const v = Number(row[country]);
  return Number.isFinite(v) && v !== 0 ? v : null;
}

export function valuesForYear(data: HeatmapData, metric: string, year: number): CountryValues {
  const row = rowFor(data, metric, year);
  const out: CountryValues = {};
  for (const ck of COUNTRY_KEYS) {
    const v = readValue(row, ck);
    if (v !== null) out[ck] = v;
  }
  return out;
}

export function yearsForMetric(data: HeatmapData, metric: string): number[] {
  return (data[metric] ?? [])
    .map(r => Number(r.year))
    .filter(y => Number.isFinite(y))
    .sort((a, b) => a - b);
}

export function entries(values: CountryValues): [CountryKey, number][] {
  return Object.entries(values) as [CountryKey, number][];
}

export function extent(values: CountryValues): { min: number; max: number } {
  const vs = Object.values(values) as number[];
  if (vs.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...vs), max: Math.max(...vs) };
}

export function coverage(values: CountryValues): { count: number; total: number; share: number } {
  const count = Object.keys(values).length;
  return { count, total: TOTAL_COUNTRIES, share: count / TOTAL_COUNTRIES };
}

// Latest year with reasonable coverage. Some metrics never reach the absolute
// threshold, so the bar drops to 90% of the best year's coverage for those.
export function smartDefaultYear(data: HeatmapData, metric: string, threshold = 0.7): number | null {
  const years = yearsForMetric(data, metric);
  if (years.length === 0) return null;
  const counts = years.map(y => ({ year: y, count: Object.keys(valuesForYear(data, metric, y)).length }));
  const best = Math.max(...counts.map(c => c.count));
  if (best === 0) return years[years.length - 1];
  const target = Math.min(threshold * TOTAL_COUNTRIES, 0.9 * best);
  for (let i = counts.length - 1; i >= 0; i--) {
    if (counts[i].count >= target) return counts[i].year;
  }
  return years[years.length - 1];
}

export function changeValues(
  data: HeatmapData,
  metric: string,
  year: number,
  baseYear: number,
  mode: ValueMode,
): CountryValues {
  const current = valuesForYear(data, metric, year);
  if (mode === 'level') return current;
  const base = valuesForYear(data, metric, baseYear);
  const out: CountryValues = {};
  for (const [ck, v] of entries(current)) {
    const b = base[ck];
    if (b === undefined) continue;
    const d = mode === 'change' ? v - b : ((v - b) / Math.abs(b)) * 100;
    if (Number.isFinite(d)) out[ck] = d;
  }
  return out;
}

export function rankOf(values: CountryValues, country: CountryKey): { rank: number; total: number } | null {
  const v = values[country];
  if (v === undefined) return null;
  const sorted = entries(values).sort((a, b) => b[1] - a[1]);
  return { rank: sorted.findIndex(([ck]) => ck === country) + 1, total: sorted.length };
}

export function rankHistory(
  data: HeatmapData,
  metric: string,
  country: CountryKey,
): { year: number; rank: number; total: number }[] {
  const out: { year: number; rank: number; total: number }[] = [];
  for (const year of yearsForMetric(data, metric)) {
    const r = rankOf(valuesForYear(data, metric, year), country);
    if (r && r.total >= 5) out.push({ year, ...r });
  }
  return out;
}

export function personalExtremes(history: { year: number; value: number }[]): {
  high: { year: number; value: number };
  low: { year: number; value: number };
} | null {
  if (history.length === 0) return null;
  let high = history[0];
  let low = history[0];
  for (const h of history) {
    if (h.value > high.value) high = h;
    if (h.value < low.value) low = h;
  }
  return { high, low };
}

export function formatValue(def: Pick<MetricDefinition, 'format' | 'unit'> | undefined, v: number, mode: ValueMode = 'level'): string {
  if (mode === 'level') return def ? def.format(v) : v.toFixed(2);
  const sign = v > 0 ? '+' : v < 0 ? '\u2212' : '';
  const abs = Math.abs(v);
  if (mode === 'pctChange') return `${sign}${abs.toFixed(1)}%`;
  if (def?.unit === '%') return `${sign}${abs.toFixed(1)} pp`;
  return `${sign}${def ? def.format(abs) : abs.toFixed(2)}`;
}

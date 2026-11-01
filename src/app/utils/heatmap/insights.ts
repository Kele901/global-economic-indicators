import type { CountryKey } from '../countryMappings';
import type { MetricDefinition } from '../metricCategories';
import { entries, formatValue, valuesForYear, yearsForMetric, TOTAL_COUNTRIES, type HeatmapData } from './values';

export type InsightPart = string | { country: CountryKey };

export interface Insight {
  kind: 'mover' | 'outlier' | 'record' | 'spread' | 'coverage';
  parts: InsightPart[];
}

interface Args {
  data: HeatmapData;
  metric: string;
  year: number;
  def: Pick<MetricDefinition, 'format' | 'unit'> | undefined;
  limit?: number;
}

const MIN_RECORD_HISTORY = 10;

function list(countries: CountryKey[]): InsightPart[] {
  const out: InsightPart[] = [];
  countries.forEach((c, i) => {
    if (i > 0) out.push(i === countries.length - 1 ? ' and ' : ', ');
    out.push({ country: c });
  });
  return out;
}

export function generateInsights({ data, metric, year, def, limit = 5 }: Args): Insight[] {
  const current = valuesForYear(data, metric, year);
  const rows = entries(current);
  if (rows.length < 3) return [];
  const fmt = (v: number) => formatValue(def, v);
  const fmtChange = (v: number) => formatValue(def, v, 'change');
  const insights: Insight[] = [];

  const sorted = [...rows].sort((a, b) => b[1] - a[1]);
  const [top, bottom] = [sorted[0], sorted[sorted.length - 1]];
  insights.push({
    kind: 'spread',
    parts: [
      { country: top[0] }, ` leads at ${fmt(top[1])}, while `, { country: bottom[0] },
      ` sits lowest at ${fmt(bottom[1])}: a gap of ${fmtChange(top[1] - bottom[1]).replace(/^\+/, '')}.`,
    ],
  });

  const previous = valuesForYear(data, metric, year - 1);
  const deltas = rows
    .filter(([ck]) => previous[ck] !== undefined)
    .map(([ck, v]) => [ck, v - previous[ck]!] as [CountryKey, number])
    .sort((a, b) => b[1] - a[1]);
  if (deltas.length >= 3) {
    const rise = deltas[0];
    const fall = deltas[deltas.length - 1];
    const parts: InsightPart[] = [];
    if (rise[1] > 0) parts.push(`Biggest rise since ${year - 1}: `, { country: rise[0] }, ` (${fmtChange(rise[1])}, to ${fmt(current[rise[0]]!)})`);
    if (fall[1] < 0) {
      parts.push(parts.length ? '. Biggest fall: ' : `Biggest fall since ${year - 1}: `, { country: fall[0] }, ` (${fmtChange(fall[1])}, to ${fmt(current[fall[0]]!)})`);
    }
    if (parts.length) insights.push({ kind: 'mover', parts: [...parts, '.'] });
  }

  const vs = rows.map(r => r[1]);
  const mean = vs.reduce((s, v) => s + v, 0) / vs.length;
  const sd = Math.sqrt(vs.reduce((s, v) => s + (v - mean) ** 2, 0) / vs.length);
  if (sd > 0) {
    const outliers = rows
      .map(([ck, v]) => [ck, (v - mean) / sd] as [CountryKey, number])
      .filter(([, z]) => Math.abs(z) > 2)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 2);
    for (const [ck, z] of outliers) {
      insights.push({
        kind: 'outlier',
        parts: [
          { country: ck }, ` stands out at ${fmt(current[ck]!)}, more than two standard deviations ${z > 0 ? 'above' : 'below'} the average of ${fmt(mean)}.`,
        ],
      });
    }
  }

  const years = yearsForMetric(data, metric).filter(y => y < year);
  if (years.length >= MIN_RECORD_HISTORY) {
    const pastByCountry = new Map<CountryKey, number[]>();
    for (const y of years) {
      for (const [ck, v] of entries(valuesForYear(data, metric, y))) {
        if (current[ck] === undefined) continue;
        const arr = pastByCountry.get(ck) ?? [];
        arr.push(v);
        pastByCountry.set(ck, arr);
      }
    }
    const highs: CountryKey[] = [];
    const lows: CountryKey[] = [];
    for (const [ck, past] of pastByCountry) {
      if (past.length < MIN_RECORD_HISTORY) continue;
      const v = current[ck]!;
      if (v > Math.max(...past)) highs.push(ck);
      else if (v < Math.min(...past)) lows.push(ck);
    }
    if (highs.length) insights.push({ kind: 'record', parts: ['At a record high in their own data: ', ...list(highs.slice(0, 4)), highs.length > 4 ? ` and ${highs.length - 4} more.` : '.'] });
    if (lows.length) insights.push({ kind: 'record', parts: ['At a record low in their own data: ', ...list(lows.slice(0, 4)), lows.length > 4 ? ` and ${lows.length - 4} more.` : '.'] });
  }

  if (rows.length < 0.7 * TOTAL_COUNTRIES) {
    insights.push({
      kind: 'coverage',
      parts: [`Only ${rows.length} of ${TOTAL_COUNTRIES} countries have reported for ${year}, so rankings may shift as more data arrives.`],
    });
  }

  return insights.slice(0, limit);
}

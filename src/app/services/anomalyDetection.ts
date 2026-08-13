// Rolling z-score anomaly detector for economic time-series.
//
// The function scores every (country, metric) pair by how many
// standard deviations the latest reading sits above (or below) the
// last 5 years' mean. A score of ±2 is roughly the 95th percentile;
// ±4 is a genuine tail event.
//
// The function is pure (no state, no fetch) so it can run in either
// the dashboard, an /api/anomalies handler, or a server-side batch.

import type { CountryData } from './worldbank';

export interface AnomalyReading {
  country: string;
  metric: string;
  latestYear: number;
  latestValue: number;
  meanFiveYear: number;
  stdFiveYear: number;
  zScore: number;
  direction: 'above' | 'below';
}

function safeNumber(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function computeAnomaliesForSeries(
  series: CountryData[] | undefined,
  metric: string,
  minSample = 5,
): AnomalyReading[] {
  if (!series || series.length === 0) return [];
  const sorted = [...series].sort((a, b) => Number(a.year) - Number(b.year));
  const out: AnomalyReading[] = [];

  const countryKeys = new Set<string>();
  for (const row of sorted) {
    for (const k of Object.keys(row)) {
      if (k !== 'year') countryKeys.add(k);
    }
  }

  for (const country of countryKeys) {
    let latest: { year: number; value: number } | null = null;
    for (let i = sorted.length - 1; i >= 0; i--) {
      const v = safeNumber(sorted[i][country]);
      if (v == null) continue;
      const y = Number(sorted[i].year);
      if (!Number.isFinite(y)) continue;
      latest = { year: y, value: v };
      break;
    }
    if (!latest) continue;

    const window: number[] = [];
    for (let i = sorted.length - 1; i >= 0 && window.length < minSample; i--) {
      const y = Number(sorted[i].year);
      if (y >= latest.year) continue;
      const v = safeNumber(sorted[i][country]);
      if (v == null) continue;
      window.push(v);
    }
    if (window.length < minSample) continue;

    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((a, b) => a + (b - mean) ** 2, 0) / window.length;
    const std = Math.sqrt(variance);
    if (std < 1e-6) continue;

    const z = (latest.value - mean) / std;
    if (!Number.isFinite(z)) continue;

    out.push({
      country,
      metric,
      latestYear: latest.year,
      latestValue: latest.value,
      meanFiveYear: mean,
      stdFiveYear: std,
      zScore: z,
      direction: z >= 0 ? 'above' : 'below',
    });
  }
  return out;
}

export interface DetectAnomaliesInput {
  data: Record<string, CountryData[]>;
  metricAllowlist?: string[];
  topN?: number;
  minAbsZ?: number;
}

export function detectTopAnomalies({
  data,
  metricAllowlist,
  topN = 3,
  minAbsZ = 2,
}: DetectAnomaliesInput): AnomalyReading[] {
  const metrics = metricAllowlist ?? Object.keys(data);
  const all: AnomalyReading[] = [];
  for (const metric of metrics) {
    const series = data[metric];
    all.push(...computeAnomaliesForSeries(series, metric));
  }
  return all
    .filter(a => Math.abs(a.zScore) >= minAbsZ)
    .sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore))
    .slice(0, topN);
}

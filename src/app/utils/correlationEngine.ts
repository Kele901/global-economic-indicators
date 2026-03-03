import { CountryData } from '../services/worldbank';

export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  const xs = x.slice(0, n);
  const ys = y.slice(0, n);
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const xi = xs[i] - mx;
    const yi = ys[i] - my;
    num += xi * yi;
    dx += xi * xi;
    dy += yi * yi;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? 0 : num / denom;
}

export function extractTimeSeries(
  data: CountryData[],
  country: string
): { years: number[]; values: number[] } {
  const years: number[] = [];
  const values: number[] = [];
  for (const row of data) {
    const v = Number(row[country]);
    if (!isNaN(v) && v !== null && row.year) {
      years.push(Number(row.year));
      values.push(v);
    }
  }
  return { years, values };
}

export function alignTimeSeries(
  seriesA: { years: number[]; values: number[] },
  seriesB: { years: number[]; values: number[] }
): { a: number[]; b: number[] } {
  const yearSetB = new Set(seriesB.years);
  const mapB = new Map(seriesB.years.map((y, i) => [y, seriesB.values[i]]));
  const a: number[] = [];
  const b: number[] = [];
  for (let i = 0; i < seriesA.years.length; i++) {
    const yr = seriesA.years[i];
    if (yearSetB.has(yr)) {
      a.push(seriesA.values[i]);
      b.push(mapB.get(yr)!);
    }
  }
  return { a, b };
}

export interface CorrelationResult {
  metricA: string;
  metricB: string;
  correlation: number;
  sampleSize: number;
}

export function computeCorrelationMatrix(
  data: Record<string, CountryData[]>,
  country: string,
  metricKeys: string[]
): CorrelationResult[] {
  const results: CorrelationResult[] = [];
  const seriesMap: Record<string, { years: number[]; values: number[] }> = {};

  for (const key of metricKeys) {
    if (data[key]) {
      seriesMap[key] = extractTimeSeries(data[key], country);
    }
  }

  for (let i = 0; i < metricKeys.length; i++) {
    for (let j = i + 1; j < metricKeys.length; j++) {
      const a = seriesMap[metricKeys[i]];
      const b = seriesMap[metricKeys[j]];
      if (a && b) {
        const aligned = alignTimeSeries(a, b);
        if (aligned.a.length >= 5) {
          results.push({
            metricA: metricKeys[i],
            metricB: metricKeys[j],
            correlation: pearsonCorrelation(aligned.a, aligned.b),
            sampleSize: aligned.a.length,
          });
        }
      }
    }
  }
  return results;
}

export interface LaggedCorrelation {
  lag: number;
  correlation: number;
}

export function computeLaggedCorrelations(
  inputSeries: number[],
  outputSeries: number[],
  maxLag: number = 5
): LaggedCorrelation[] {
  const results: LaggedCorrelation[] = [];
  for (let lag = 0; lag <= maxLag; lag++) {
    const input = inputSeries.slice(0, inputSeries.length - lag);
    const output = outputSeries.slice(lag);
    const n = Math.min(input.length, output.length);
    if (n >= 5) {
      results.push({
        lag,
        correlation: pearsonCorrelation(input.slice(0, n), output.slice(0, n)),
      });
    }
  }
  return results;
}

export interface ScenarioImpact {
  metric: string;
  estimatedChange: number;
  confidence: number;
  bestLag: number;
  historicalCorrelation: number;
}

export function simulateScenario(
  data: Record<string, CountryData[]>,
  country: string,
  inputMetric: string,
  changeMagnitude: number,
  outputMetrics: string[]
): ScenarioImpact[] {
  const inputSeries = extractTimeSeries(data[inputMetric] || [], country);
  const impacts: ScenarioImpact[] = [];

  for (const outMetric of outputMetrics) {
    const outputSeriesRaw = extractTimeSeries(data[outMetric] || [], country);
    const aligned = alignTimeSeries(inputSeries, outputSeriesRaw);
    if (aligned.a.length < 5) continue;

    const lagged = computeLaggedCorrelations(aligned.a, aligned.b, 3);
    if (lagged.length === 0) continue;

    const best = lagged.reduce((a, b) => Math.abs(b.correlation) > Math.abs(a.correlation) ? b : a);

    const inputStd = Math.sqrt(aligned.a.reduce((s, v) => s + v * v, 0) / aligned.a.length - Math.pow(aligned.a.reduce((s, v) => s + v, 0) / aligned.a.length, 2));
    const outputStd = Math.sqrt(aligned.b.reduce((s, v) => s + v * v, 0) / aligned.b.length - Math.pow(aligned.b.reduce((s, v) => s + v, 0) / aligned.b.length, 2));

    const estimatedChange = inputStd > 0
      ? (changeMagnitude / inputStd) * best.correlation * outputStd
      : 0;

    impacts.push({
      metric: outMetric,
      estimatedChange,
      confidence: Math.min(Math.abs(best.correlation) * (aligned.a.length / 20), 1),
      bestLag: best.lag,
      historicalCorrelation: best.correlation,
    });
  }

  return impacts.sort((a, b) => Math.abs(b.historicalCorrelation) - Math.abs(a.historicalCorrelation));
}

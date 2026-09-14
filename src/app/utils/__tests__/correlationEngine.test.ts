import { describe, it, expect } from 'vitest';
import {
  pearsonCorrelation,
  extractTimeSeries,
  alignTimeSeries,
  computeCorrelationMatrix,
  computeLaggedCorrelations,
  simulateScenario,
} from '../correlationEngine';
import type { CountryData } from '../../services/worldbank';

describe('pearsonCorrelation', () => {
  it('returns 1 for a perfectly increasing linear relationship', () => {
    expect(pearsonCorrelation([1, 2, 3, 4, 5], [2, 4, 6, 8, 10])).toBeCloseTo(1, 10);
  });

  it('returns -1 for a perfectly decreasing linear relationship', () => {
    expect(pearsonCorrelation([1, 2, 3, 4, 5], [10, 8, 6, 4, 2])).toBeCloseTo(-1, 10);
  });

  it('matches a hand-computed coefficient for noisy data', () => {
    // Covariance 12 over sqrt(10 * 19.2) = 0.8660254... by hand.
    expect(pearsonCorrelation([1, 2, 3, 4, 5], [2, 4, 5, 4, 8])).toBeCloseTo(0.8660254, 6);
  });

  it('is symmetric in its arguments', () => {
    const x = [3, 1, 4, 1, 5, 9];
    const y = [2, 7, 1, 8, 2, 8];
    expect(pearsonCorrelation(x, y)).toBeCloseTo(pearsonCorrelation(y, x), 12);
  });

  it('reports 0 rather than NaN when a series is constant', () => {
    // Zero variance means the denominator is 0; the correct answer is
    // undefined, and callers render the result, so 0 is the safe stand-in.
    expect(pearsonCorrelation([5, 5, 5, 5], [1, 2, 3, 4])).toBe(0);
  });

  it('refuses samples smaller than 3 points', () => {
    expect(pearsonCorrelation([1, 2], [3, 4])).toBe(0);
    expect(pearsonCorrelation([], [])).toBe(0);
  });

  it('truncates to the shorter series instead of reading past the end', () => {
    expect(pearsonCorrelation([1, 2, 3, 4, 5], [2, 4, 6])).toBeCloseTo(1, 10);
  });
});

describe('extractTimeSeries', () => {
  const rows: CountryData[] = [
    { year: 2020, USA: 1.5, Japan: 0.2 },
    { year: 2021, USA: 2.5 },
    { year: 2022, USA: 3.5, Japan: 0.4 },
  ];

  it('pulls one country out of a wide table', () => {
    expect(extractTimeSeries(rows, 'USA')).toEqual({
      years: [2020, 2021, 2022],
      values: [1.5, 2.5, 3.5],
    });
  });

  it('skips years where the country has no reading', () => {
    expect(extractTimeSeries(rows, 'Japan')).toEqual({
      years: [2020, 2022],
      values: [0.2, 0.4],
    });
  });

  it('returns empty arrays for an unknown country or empty input', () => {
    expect(extractTimeSeries(rows, 'Atlantis')).toEqual({ years: [], values: [] });
    expect(extractTimeSeries([], 'USA')).toEqual({ years: [], values: [] });
  });
});

describe('alignTimeSeries', () => {
  it('keeps only the years present in both series, in A order', () => {
    const a = { years: [2018, 2019, 2020, 2021], values: [1, 2, 3, 4] };
    const b = { years: [2019, 2021, 2022], values: [20, 40, 50] };
    expect(alignTimeSeries(a, b)).toEqual({ a: [2, 4], b: [20, 40] });
  });

  it('returns empty arrays when the coverage does not overlap', () => {
    const a = { years: [2000, 2001], values: [1, 2] };
    const b = { years: [2010, 2011], values: [3, 4] };
    expect(alignTimeSeries(a, b)).toEqual({ a: [], b: [] });
  });
});

describe('computeCorrelationMatrix', () => {
  const data: Record<string, CountryData[]> = {
    inflation: [
      { year: 2016, USA: 1 },
      { year: 2017, USA: 2 },
      { year: 2018, USA: 3 },
      { year: 2019, USA: 4 },
      { year: 2020, USA: 5 },
      { year: 2021, USA: 6 },
    ],
    rates: [
      { year: 2016, USA: 2 },
      { year: 2017, USA: 4 },
      { year: 2018, USA: 6 },
      { year: 2019, USA: 8 },
      { year: 2020, USA: 10 },
      { year: 2021, USA: 12 },
    ],
    // Only three overlapping years, below the 5-point floor.
    sparse: [
      { year: 2019, USA: 1 },
      { year: 2020, USA: 2 },
      { year: 2021, USA: 3 },
    ],
  };

  it('scores each unique pair once, without self-pairs', () => {
    const results = computeCorrelationMatrix(data, 'USA', ['inflation', 'rates']);
    expect(results).toHaveLength(1);
    expect(results[0].metricA).toBe('inflation');
    expect(results[0].metricB).toBe('rates');
    expect(results[0].correlation).toBeCloseTo(1, 10);
    expect(results[0].sampleSize).toBe(6);
  });

  it('drops pairs with fewer than five aligned observations', () => {
    const results = computeCorrelationMatrix(data, 'USA', ['inflation', 'rates', 'sparse']);
    expect(results.map(r => [r.metricA, r.metricB])).toEqual([['inflation', 'rates']]);
  });

  it('ignores metric keys that are missing from the data bundle', () => {
    const results = computeCorrelationMatrix(data, 'USA', ['inflation', 'rates', 'nonexistent']);
    expect(results).toHaveLength(1);
  });
});

describe('computeLaggedCorrelations', () => {
  it('finds the strongest correlation at the lag the data was built with', () => {
    // output[t] == input[t - 2], so lag 2 should be the perfect match.
    const input = [1, 5, 2, 8, 3, 9, 4, 7, 6, 10];
    const output = [0, 0, 1, 5, 2, 8, 3, 9, 4, 7];
    const lagged = computeLaggedCorrelations(input, output, 4);
    const best = lagged.reduce((a, b) => (Math.abs(b.correlation) > Math.abs(a.correlation) ? b : a));
    expect(best.lag).toBe(2);
    expect(best.correlation).toBeCloseTo(1, 10);
  });

  it('stops emitting lags once the overlap falls below five points', () => {
    const short = [1, 2, 3, 4, 5, 6];
    const lags = computeLaggedCorrelations(short, short, 5).map(l => l.lag);
    expect(lags).toEqual([0, 1]);
  });
});

describe('simulateScenario', () => {
  const data: Record<string, CountryData[]> = {
    policyRate: [
      { year: 2015, USA: 1 },
      { year: 2016, USA: 2 },
      { year: 2017, USA: 3 },
      { year: 2018, USA: 4 },
      { year: 2019, USA: 5 },
      { year: 2020, USA: 6 },
    ],
    // Moves in lockstep with the input, at twice the amplitude.
    growth: [
      { year: 2015, USA: 2 },
      { year: 2016, USA: 4 },
      { year: 2017, USA: 6 },
      { year: 2018, USA: 8 },
      { year: 2019, USA: 10 },
      { year: 2020, USA: 12 },
    ],
  };

  it('scales the estimated change by the ratio of standard deviations', () => {
    const [impact] = simulateScenario(data, 'USA', 'policyRate', 1, ['growth']);
    expect(impact.metric).toBe('growth');
    expect(impact.bestLag).toBe(0);
    expect(impact.historicalCorrelation).toBeCloseTo(1, 10);
    // Output swings twice as wide as the input, so +1 on the input maps to +2.
    expect(impact.estimatedChange).toBeCloseTo(2, 6);
  });

  it('caps confidence at 1 and scales it with sample size', () => {
    const [impact] = simulateScenario(data, 'USA', 'policyRate', 1, ['growth']);
    // |r| = 1 with 6 observations gives 6/20, well under the cap.
    expect(impact.confidence).toBeCloseTo(0.3, 6);
    expect(impact.confidence).toBeLessThanOrEqual(1);
  });

  it('skips outputs with too little overlapping history', () => {
    const thin = {
      ...data,
      thinSeries: [
        { year: 2019, USA: 1 },
        { year: 2020, USA: 2 },
      ],
    };
    const impacts = simulateScenario(thin, 'USA', 'policyRate', 1, ['growth', 'thinSeries']);
    expect(impacts.map(i => i.metric)).toEqual(['growth']);
  });

  it('returns nothing when the input metric is absent', () => {
    expect(simulateScenario(data, 'USA', 'missing', 1, ['growth'])).toEqual([]);
  });

  it('sorts impacts by correlation strength, strongest first', () => {
    const withWeak: Record<string, CountryData[]> = {
      ...data,
      noise: [
        { year: 2015, USA: 5 },
        { year: 2016, USA: 1 },
        { year: 2017, USA: 6 },
        { year: 2018, USA: 2 },
        { year: 2019, USA: 7 },
        { year: 2020, USA: 1 },
      ],
    };
    const impacts = simulateScenario(withWeak, 'USA', 'policyRate', 1, ['noise', 'growth']);
    expect(impacts[0].metric).toBe('growth');
    expect(Math.abs(impacts[0].historicalCorrelation)).toBeGreaterThanOrEqual(
      Math.abs(impacts[1].historicalCorrelation),
    );
  });
});

import { describe, it, expect } from 'vitest';
import type { CountryData } from '../../services/worldbank';
import {
  annualAverages,
  countNearTarget,
  decadeStats,
  disinflationProgress,
  kde,
  latestByCountry,
  latestOf,
  mean,
  median,
  medianByYear,
  pctChanges,
  peakSince,
  risingFalling,
  seriesOf,
  stdDev,
  valueAt,
} from '../inflation/stats';
import { STRIPE_BINS, binFor, sortStripeRows, stripeRows } from '../inflation/stripes';

const rows: CountryData[] = [
  { year: 2019, USA: 1.8, UK: 1.7, Japan: 0.5 },
  { year: 2020, USA: 1.2, UK: 1.0, Japan: 0 },
  { year: 2021, USA: 4.7, UK: 2.5, Japan: -0.2 },
  { year: 2022, USA: 8.0, UK: 7.9, Japan: 2.5 },
  { year: 2023, USA: 4.1, UK: 6.8, Japan: 3.3 },
  { year: 2024, USA: 2.9, Japan: 2.7 },
];

describe('inflation stats', () => {
  it('reads series, points and latest values, keeping zeros as real observations', () => {
    expect(seriesOf(rows, 'Japan').map((o) => o.value)).toEqual([0.5, 0, -0.2, 2.5, 3.3, 2.7]);
    expect(valueAt(rows, 'UK', 2024)).toBeNull();
    expect(latestOf(rows, 'UK')).toEqual({ year: 2023, value: 6.8 });
    expect(latestOf(rows, 'UK', 2024)).toBeNull();
    expect(Object.keys(latestByCountry(rows, ['USA', 'UK', 'Canada']))).toEqual(['USA', 'UK']);
  });

  it('computes mean, median and population standard deviation', () => {
    expect(mean([])).toBeNull();
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(stdDev([2, 4, 4, 4, 5, 5, 7, 9])).toBe(2);
  });

  it('counts countries within tolerance of target', () => {
    expect(countNearTarget([1, 2.9, 3.1, -0.5])).toBe(2);
    expect(countNearTarget([1, 2.9, 3.1], 3, 0.2)).toBe(2);
  });

  it('splits countries into rising and falling by their last two observations', () => {
    const d = risingFalling(rows, ['USA', 'UK', 'Japan']);
    expect(d.falling).toEqual(['USA', 'UK', 'Japan']);
    expect(d.rising).toEqual([]);
    expect(risingFalling(rows, ['USA', 'UK'], 0.1, 2024).falling).toEqual(['USA']);
  });

  it('summarises a decade only with enough observations', () => {
    expect(decadeStats(rows, 'USA', 2020, 5)).toEqual({ mean: (1.2 + 4.7 + 8 + 4.1 + 2.9) / 5, sd: expect.any(Number), n: 5 });
    expect(decadeStats(rows, 'UK', 2020, 5)).toBeNull();
  });

  it('finds the peak and measures progress back to target', () => {
    expect(peakSince(rows, 'USA', 2021)).toEqual({ year: 2022, value: 8 });
    expect(disinflationProgress(8, 2.9, 2)).toBeCloseTo(0.85);
    expect(disinflationProgress(8, 1, 2)).toBeGreaterThan(1);
    expect(disinflationProgress(1.5, 1, 2)).toBeNull();
  });

  it('takes a cross-country median per year, skipping thin years', () => {
    expect(medianByYear(rows, ['USA', 'UK', 'Japan'], 3).map((o) => o.year)).toEqual([2019, 2020, 2021, 2022, 2023]);
    expect(medianByYear(rows, ['USA', 'UK', 'Japan'], 3)[3].value).toBe(7.9);
  });

  it('averages FRED observations by calendar year and ignores missing dots', () => {
    const out = annualAverages([
      { date: '2022-01-01', value: '100' },
      { date: '2022-02-01', value: '.' },
      { date: '2022-03-01', value: '110' },
      { date: '2023-01-01', value: '90' },
    ]);
    expect(out).toEqual([
      { year: 2022, value: 105 },
      { year: 2023, value: 90 },
    ]);
    expect(annualAverages(undefined)).toEqual([]);
  });

  it('estimates a density that peaks at the data and integrates to about one', () => {
    const grid = Array.from({ length: 401 }, (_, i) => -10 + i * 0.1);
    const d = kde([2, 2, 3], grid, 1);
    const area = d.reduce((s, v) => s + v * 0.1, 0);
    expect(area).toBeCloseTo(1, 2);
    expect(grid[d.indexOf(Math.max(...d))]).toBeCloseTo(2.3, 0);
    expect(kde([], grid, 1).every((v) => v === 0)).toBe(true);
  });

  it('computes year-on-year changes only across consecutive years', () => {
    expect(
      pctChanges([
        { year: 2020, value: 100 },
        { year: 2021, value: 110 },
        { year: 2023, value: 121 },
      ]),
    ).toEqual([{ year: 2021, value: 10.000000000000009 }]);
  });
});

describe('inflation stripes', () => {
  it('bins every value into exactly one fixed bin', () => {
    expect(binFor(-0.1)?.id).toBe('deflation');
    expect(binFor(0)?.id).toBe('0-2');
    expect(binFor(2)?.id).toBe('2-4');
    expect(binFor(49.9)?.id).toBe('20-50');
    expect(binFor(5000)?.id).toBe('50+');
    expect(binFor(null)).toBeNull();
    expect(binFor(Number.NaN)).toBeNull();
    for (let i = 1; i < STRIPE_BINS.length; i++) expect(STRIPE_BINS[i].min).toBe(STRIPE_BINS[i - 1].max);
  });

  it('builds a cell per year with gaps for missing data', () => {
    const [uk] = stripeRows(rows, ['UK'], 2022, 2024);
    expect(uk.cells).toEqual([7.9, 6.8, null]);
    expect(uk.region).toBe('Europe');
  });

  it('sorts by average or volatility with empty rows last', () => {
    const built = stripeRows(rows, ['Japan', 'USA', 'Canada', 'UK'], 2019, 2024);
    expect(sortStripeRows(built, 'average').map((r) => r.key)).toEqual(['UK', 'USA', 'Japan', 'Canada']);
    expect(sortStripeRows(built, 'volatility').at(-1)?.key).toBe('Canada');
    expect(sortStripeRows(built, 'region').map((r) => r.key)).toEqual(['USA', 'Canada', 'UK', 'Japan']);
  });
});

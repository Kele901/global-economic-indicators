import { describe, it, expect } from 'vitest';
import {
  latest,
  latestEntry,
  worldSum,
  topNCountries,
  topNShare,
  worldYoY,
} from '../countryData';
import type { CountryData } from '../../services/worldbank';

const series: CountryData[] = [
  { year: 2021, USA: 100, China: 80, India: 50 },
  { year: 2022, USA: 110, China: 85, India: 60 },
  { year: 2023, USA: 120, China: 95, India: 0 }, // India zero should be skipped
];

describe('countryData helpers', () => {
  describe('latestEntry / latest', () => {
    it('returns the most recent non-zero value', () => {
      expect(latestEntry(series, 'USA')).toEqual({ year: 2023, value: 120 });
      expect(latest(series, 'USA')).toBe(120);
    });

    it('walks backwards past zero rows for partial series', () => {
      // India's 2023 value is 0, so it should fall back to 2022.
      expect(latestEntry(series, 'India')).toEqual({ year: 2022, value: 60 });
    });

    it('returns null for an unknown country', () => {
      expect(latestEntry(series, 'Atlantis')).toBeNull();
      expect(latest(series, 'Atlantis')).toBe(0);
    });

    it('honours the fallback value when nothing found', () => {
      expect(latest(series, 'Atlantis', -1)).toBe(-1);
    });

    it('tolerates empty arrays and undefined', () => {
      expect(latestEntry([], 'USA')).toBeNull();
      expect(latestEntry(undefined, 'USA')).toBeNull();
      expect(latest(undefined, 'USA', 42)).toBe(42);
    });

    it('tolerates non-array garbage without crashing', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(latestEntry(null as any, 'USA')).toBeNull();
    });
  });

  describe('worldSum', () => {
    it('sums the most recent value for every country', () => {
      const result = worldSum(series);
      // USA 120 + China 95 + India 60 (2022, since 2023 is 0)
      expect(result.total).toBe(275);
      expect(result.count).toBe(3);
      expect(result.year).toBe(2023);
    });

    it('filters out values above maxPlausible cap', () => {
      const result = worldSum(series, { maxPlausible: 100 });
      // Only China 95 and India 60 remain (USA 120 exceeds cap).
      expect(result.total).toBe(155);
      expect(result.count).toBe(2);
    });

    it('returns zeros for empty series', () => {
      expect(worldSum([])).toEqual({ total: 0, count: 0, year: 0 });
      expect(worldSum(undefined)).toEqual({ total: 0, count: 0, year: 0 });
    });
  });

  describe('topNCountries', () => {
    it('ranks by latest value descending', () => {
      const top2 = topNCountries(series, 2);
      expect(top2.map(t => t.country)).toEqual(['USA', 'China']);
      expect(top2[0].value).toBe(120);
    });

    it('honours maxPlausible', () => {
      const top = topNCountries(series, 5, { maxPlausible: 100 });
      expect(top.map(t => t.country)).toEqual(['China', 'India']);
    });

    it('returns an empty array for empty series', () => {
      expect(topNCountries([], 3)).toEqual([]);
    });
  });

  describe('topNShare', () => {
    it('computes % share of top-N in the latest-year total', () => {
      // Latest totals: USA 120, China 95, India 60. Sum = 275. Top-1 share ~43.6%.
      const share = topNShare(series, 1);
      expect(share).toBeCloseTo((120 / 275) * 100, 2);
    });

    it('returns 0 when total is zero', () => {
      const zeroSeries: CountryData[] = [{ year: 2023, USA: 0, China: 0 }];
      expect(topNShare(zeroSeries, 2)).toBe(0);
    });
  });

  describe('worldYoY', () => {
    it('computes year-over-year change of the world total', () => {
      // 2023 total (USA+China): 215. 2022 total (USA+China+India): 255. India 2023 is 0.
      // Since India 2023 is 0, latest year total is 215 vs prior 2022 total 255 = -15.68%.
      const yoy = worldYoY(series);
      expect(yoy).not.toBeNull();
      expect(yoy!).toBeCloseTo(((215 - 255) / 255) * 100, 2);
    });

    it('returns null when only one year of data', () => {
      expect(worldYoY([{ year: 2023, USA: 100 }])).toBeNull();
    });

    it('returns null for empty / undefined', () => {
      expect(worldYoY([])).toBeNull();
      expect(worldYoY(undefined)).toBeNull();
    });
  });
});

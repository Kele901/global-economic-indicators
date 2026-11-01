import { describe, it, expect } from 'vitest';
import type { CountryData } from '../../services/worldbank';
import {
  annualised,
  categoryChange,
  debtErosionPath,
  doublingYears,
  hoursOfWork,
  lifetimeErosion,
  personalInflation,
  realSavingsPath,
} from '../inflation/money';
import { CITY_COUNTRY, lcuPerUsd, rowsToUsd, toUsd } from '../inflation/cityUsd';

describe('purchasing-power maths', () => {
  it('computes the price-doubling time', () => {
    expect(doublingYears(7)).toBeCloseTo(10.24, 2);
    expect(doublingYears(100)).toBeCloseTo(1);
    expect(doublingYears(0)).toBeNull();
    expect(doublingYears(-1)).toBeNull();
  });

  it('measures lifetime erosion from the first CPI year at or after birth', () => {
    const cpi: CountryData[] = [
      { year: 1990, UK: 50 },
      { year: 2000, UK: 75 },
      { year: 2024, UK: 150 },
    ];
    const e = lifetimeErosion(cpi, 'UK', 1985)!;
    expect(e.fromYear).toBe(1990);
    expect(e.toYear).toBe(2024);
    expect(e.multiple).toBe(3);
    expect(e.purchasingPower).toBeCloseTo(1 / 3);
    expect(e.series.map((o) => o.value)).toEqual([100, 150, 300]);
    expect(lifetimeErosion(cpi, 'UK', 2020)).toBeNull();
  });

  it('expresses a price in hours of net salary', () => {
    expect(hoursOfWork(20, 3200)).toBe(1);
    expect(hoursOfWork(20, 3200, 100)).toBeCloseTo(0.625);
    expect(hoursOfWork(null, 3200)).toBeNull();
    expect(hoursOfWork(20, 0)).toBeNull();
  });

  it('averages item price relatives geometrically and skips missing items', () => {
    const rows = [
      { year: 2011, a: 1, b: 2, c: null },
      { year: 2024, a: 2, b: 2, c: 5 },
    ];
    expect(categoryChange(rows, ['a', 'b', 'c'], 2011, 2024)).toBeCloseTo((Math.SQRT2 - 1) * 100);
    expect(categoryChange(rows, ['c'], 2011, 2024)).toBeNull();
  });

  it('weights personal inflation over categories that have data', () => {
    expect(personalInflation({ rent: 50, food: 50 }, { rent: 40, food: 20 })).toBe(30);
    expect(personalInflation({ rent: 50, food: 50, fun: 100 }, { rent: 40, food: 20, fun: null })).toBe(30);
    expect(personalInflation({ rent: 0 }, { rent: 40 })).toBeNull();
  });

  it('annualises a cumulative change', () => {
    expect(annualised(21, 2)).toBeCloseTo(10);
    expect(annualised(10, 0)).toBeNull();
  });

  it('compounds real savings and debt erosion', () => {
    const path = realSavingsPath(100, [5, 5], [5, 5]);
    expect(path.map((v) => +v.toFixed(6))).toEqual([100, 100, 100]);
    expect(realSavingsPath(100, [0], [10])[1]).toBeCloseTo(90.909, 2);
    const debt = debtErosionPath(1000, 10, 2);
    expect(debt).toHaveLength(3);
    expect(debt[2]).toBeCloseTo(826.45, 1);
  });
});

describe('city prices in US dollars', () => {
  const fx: CountryData[] = [
    { year: 2011, UK: 0.62, Japan: 80, USA: 95 },
    { year: 2023, UK: 0.8, Japan: 140, USA: 120 },
  ];

  it('maps each city to its currency country', () => {
    expect(CITY_COUNTRY.tokyo).toBe('Japan');
  });

  it('uses the latest published rate on or before the year, and 1 for dollars', () => {
    expect(lcuPerUsd(fx, 'UK', 2024)).toEqual({ rate: 0.8, year: 2023 });
    expect(lcuPerUsd(fx, 'UK', 2010)).toBeNull();
    expect(lcuPerUsd(fx, 'USA', 2023)).toEqual({ rate: 1, year: 2023 });
  });

  it('converts local prices and whole rows', () => {
    expect(toUsd(1400, { rate: 140, year: 2023 })).toBe(10);
    expect(toUsd(null, { rate: 140, year: 2023 })).toBeNull();
    const out = rowsToUsd([{ year: 2023, milk: 1.6, eggs: null }], fx, 'UK');
    expect(out).toEqual([{ year: 2023, milk: 2, eggs: null }]);
  });
});

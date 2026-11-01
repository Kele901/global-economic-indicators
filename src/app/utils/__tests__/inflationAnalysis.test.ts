import { describe, it, expect } from 'vitest';
import type { CountryData } from '../../services/worldbank';
import { classifyStance, policyRatesToRows, realRateSeries, stancePoints, stanceYears } from '../inflation/realRates';
import { correlationOf, depreciationRows, longRunAverages, passThroughPairs, phillipsPath, rebase } from '../inflation/drivers';
import { lineQuestion, eligibleCountries } from '../inflation/quiz';
import { seededRandom } from '../heatmap/quiz';
import type { InflationTarget } from '../../data/inflationTargets';

const inflation: CountryData[] = [
  { year: 2021, USA: 4.7, Japan: -0.2, Turkey: 19.6 },
  { year: 2022, USA: 8.0, Japan: 2.5, Turkey: 72.3 },
  { year: 2023, USA: 4.1, Japan: 3.3, Turkey: 53.9 },
];

const target = (t: number, band = 0): InflationTarget => ({ bank: 'x', target: t, band, regime: 'inflation-targeting', since: 2000 });

describe('real rates and stance', () => {
  it('pivots per-country policy rates into year rows', () => {
    const out = policyRatesToRows({ USA: [{ year: 2022, value: 1.7 }, { year: 2023, value: 5.0 }], Japan: [{ year: 2023, value: -0.1 }] });
    expect(out).toEqual([
      { year: 2022, USA: 1.7 },
      { year: 2023, USA: 5.0, Japan: -0.1 },
    ]);
  });

  it('subtracts inflation from the policy rate and splits the sign for shading', () => {
    const policy = policyRatesToRows({ USA: [{ year: 2022, value: 1.7 }, { year: 2023, value: 5.0 }] });
    const s = realRateSeries(policy, inflation, 'USA');
    expect(s.map((p) => +p.real.toFixed(1))).toEqual([-6.3, 0.9]);
    expect(s[0].negative).toBeCloseTo(-6.3);
    expect(s[0].positive).toBeNull();
    expect(s[1].positive).toBeCloseTo(0.9);
  });

  it('classifies stance from the inflation gap and the real rate', () => {
    expect(classifyStance(2.5, -1, 2)).toBe('on-track');
    expect(classifyStance(8, -6, 2)).toBe('behind');
    expect(classifyStance(4.1, 0.9, 2)).toBe('tight');
    expect(classifyStance(-0.5, 1, 2)).toBe('tight');
    expect(classifyStance(-0.5, -0.4, 2)).toBe('loose');
    // A wide band widens the on-track zone.
    expect(classifyStance(4.5, -1, 3, 1.5)).toBe('on-track');
  });

  it('builds stance points only for countries with a numeric target and both series', () => {
    const policy = policyRatesToRows({ USA: [{ year: 2023, value: 5 }], Japan: [{ year: 2023, value: -0.1 }], Turkey: [{ year: 2023, value: 20 }] });
    const pts = stancePoints(2023, policy, inflation, { USA: target(2), Japan: target(2), Turkey: { ...target(5), target: null } }, ['USA', 'Japan', 'Turkey']);
    expect(pts.map((p) => [p.key, p.stance])).toEqual([
      ['USA', 'tight'],
      ['Japan', 'behind'],
    ]);
    expect(stanceYears(policy, inflation, { USA: target(2), Japan: target(2) }, 2)).toEqual([2023]);
  });
});

describe('inflation drivers', () => {
  const unemployment: CountryData[] = [
    { year: 2021, USA: 5.4 },
    { year: 2022, USA: 3.6 },
    { year: 2023, USA: 3.6 },
  ];

  it('pairs unemployment and inflation by year with decade buckets', () => {
    const path = phillipsPath(unemployment, inflation, 'USA');
    expect(path).toEqual([
      { year: 2021, unemployment: 5.4, inflation: 4.7, decade: 2020 },
      { year: 2022, unemployment: 3.6, inflation: 8.0, decade: 2020 },
      { year: 2023, unemployment: 3.6, inflation: 4.1, decade: 2020 },
    ]);
  });

  it('averages two series over shared years and respects a lag', () => {
    const money: CountryData[] = [
      { year: 2021, USA: 12, Japan: 3 },
      { year: 2022, USA: 2, Japan: 3 },
    ];
    expect(longRunAverages(money, inflation, ['USA', 'Japan'], 2021, 2022, 2)).toEqual([
      { key: 'USA', x: 7, y: 6.35, years: 2 },
      { key: 'Japan', x: 3, y: 1.15, years: 2 },
    ]);
    expect(longRunAverages(money, inflation, ['USA'], 2021, 2022, 2, 1)[0].y).toBeCloseTo((8 + 4.1) / 2);
    expect(longRunAverages(money, inflation, ['USA'], 2021, 2022, 3)).toEqual([]);
  });

  it('turns LCU-per-dollar levels into depreciation and pairs it with next-year inflation', () => {
    const fx: CountryData[] = [
      { year: 2020, Turkey: 7 },
      { year: 2021, Turkey: 8.75 },
      { year: 2022, Turkey: 17.5 },
    ];
    const dep = depreciationRows(fx, ['Turkey']);
    expect(dep.map((r) => Math.round(Number(r.Turkey)))).toEqual([25, 100]);
    expect(passThroughPairs(dep, inflation, 'Turkey').map((p) => [p.year, Math.round(p.x), p.y])).toEqual([
      [2021, 25, 72.3],
      [2022, 100, 53.9],
    ]);
  });

  it('returns no correlation for fewer than three points', () => {
    expect(correlationOf([{ x: 1, y: 1 }])).toBeNull();
    expect(correlationOf([{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }])).toBeCloseTo(1);
  });

  it('rebases a series to 100 in the base year', () => {
    expect(rebase([{ year: 2020, value: 50 }, { year: 2021, value: 75 }], 2020).map((o) => o.value)).toEqual([100, 150]);
    expect(rebase([{ year: 2021, value: 75 }], 2020)).toEqual([]);
  });
});

describe('inflation line quiz', () => {
  const long: CountryData[] = Array.from({ length: 30 }, (_, i) => ({
    year: 1995 + i,
    USA: 2 + (i % 3),
    UK: 2.5,
    Japan: 0.1 * i,
    Turkey: 50 - i,
    Brazil: 6,
  }));

  it('only uses countries with enough history', () => {
    expect(eligibleCountries(long, 1990, 20).sort()).toEqual(['Brazil', 'Japan', 'Turkey', 'UK', 'USA']);
    expect(eligibleCountries(long, 2020, 20)).toEqual([]);
  });

  it('is deterministic for a seed and always includes the answer among four options', () => {
    const a = lineQuestion(long, seededRandom(42));
    const b = lineQuestion(long, seededRandom(42));
    expect(a).toEqual(b);
    expect(a!.options).toHaveLength(4);
    expect(new Set(a!.options).size).toBe(4);
    expect(a!.options).toContain(a!.answer);
    expect(a!.series.length).toBe(30);
  });

  it('returns null when there are too few countries to make options', () => {
    expect(lineQuestion([{ year: 2000, USA: 2 }], seededRandom(1))).toBeNull();
  });
});

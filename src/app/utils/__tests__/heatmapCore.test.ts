import { describe, it, expect } from 'vitest';
import type { CountryData } from '../../services/worldbank';
import { COUNTRY_KEYS } from '../countryMappings';
import {
  valuesForYear,
  coverage,
  smartDefaultYear,
  changeValues,
  rankHistory,
  personalExtremes,
  formatValue,
  TOTAL_COUNTRIES,
  type HeatmapData,
} from '../heatmap/values';
import { COUNTRY_GROUPS, getGroup, groupStats } from '../heatmap/groups';
import { terciles, bivariateClass, bivariateColor } from '../heatmap/bivariate';
import { parseHeatmapState, serializeHeatmapState } from '../heatmap/urlState';

function row(year: number, values: Record<string, number>): CountryData {
  return { year, ...values };
}

function fullRow(year: number, f: (i: number) => number): CountryData {
  return row(year, Object.fromEntries(COUNTRY_KEYS.map((k, i) => [k, f(i)])));
}

describe('valuesForYear', () => {
  it('drops zero and missing values', () => {
    const data: HeatmapData = { m: [row(2020, { USA: 2, UK: 0, France: Number.NaN, Japan: -1 })] };
    expect(valuesForYear(data, 'm', 2020)).toEqual({ USA: 2, Japan: -1 });
  });

  it('returns an empty map for an unknown metric or year', () => {
    expect(valuesForYear({}, 'm', 2020)).toEqual({});
    expect(valuesForYear({ m: [row(2020, { USA: 1 })] }, 'm', 2021)).toEqual({});
  });
});

describe('coverage', () => {
  it('reports count against the full roster', () => {
    expect(coverage({ USA: 1, UK: 2 })).toEqual({ count: 2, total: TOTAL_COUNTRIES, share: 2 / TOTAL_COUNTRIES });
  });
});

describe('smartDefaultYear', () => {
  it('skips a sparse latest year', () => {
    const data: HeatmapData = { m: [fullRow(2023, i => i + 1), fullRow(2024, i => i + 2), row(2025, { USA: 3 })] };
    expect(smartDefaultYear(data, 'm')).toBe(2024);
  });

  it('falls back to the best-covered recent year when no year reaches the threshold', () => {
    const half = (y: number) => row(y, Object.fromEntries(COUNTRY_KEYS.slice(0, 10).map(k => [k, 1])));
    const data: HeatmapData = { m: [half(2018), half(2019), row(2020, { USA: 1 })] };
    expect(smartDefaultYear(data, 'm')).toBe(2019);
  });

  it('returns null when the metric has no rows', () => {
    expect(smartDefaultYear({}, 'm')).toBeNull();
  });
});

describe('changeValues', () => {
  const data: HeatmapData = { m: [row(2010, { USA: 4, UK: 2, Japan: 5 }), row(2020, { USA: 6, UK: 1, France: 3 })] };

  it('returns levels unchanged in level mode', () => {
    expect(changeValues(data, 'm', 2020, 2010, 'level')).toEqual({ USA: 6, UK: 1, France: 3 });
  });

  it('computes absolute change only for countries present in both years', () => {
    expect(changeValues(data, 'm', 2020, 2010, 'change')).toEqual({ USA: 2, UK: -1 });
  });

  it('computes percentage change against the absolute base', () => {
    const out = changeValues(data, 'm', 2020, 2010, 'pctChange');
    expect(out.USA).toBeCloseTo(50);
    expect(out.UK).toBeCloseTo(-50);
  });
});

describe('rankHistory', () => {
  it('ranks the country within each year with enough reporters', () => {
    const data: HeatmapData = {
      m: [
        row(2000, { USA: 5, UK: 4, Japan: 3, France: 2, Italy: 1 }),
        row(2001, { USA: 1, UK: 4, Japan: 3, France: 2, Italy: 5 }),
        row(2002, { USA: 1, UK: 2 }),
      ],
    };
    expect(rankHistory(data, 'm', 'USA')).toEqual([
      { year: 2000, rank: 1, total: 5 },
      { year: 2001, rank: 5, total: 5 },
    ]);
  });
});

describe('personalExtremes', () => {
  it('finds the highest and lowest points', () => {
    const out = personalExtremes([{ year: 1, value: 3 }, { year: 2, value: 9 }, { year: 3, value: -2 }]);
    expect(out).toEqual({ high: { year: 2, value: 9 }, low: { year: 3, value: -2 } });
  });

  it('returns null for an empty history', () => {
    expect(personalExtremes([])).toBeNull();
  });
});

describe('formatValue', () => {
  const pct = { unit: '%', format: (v: number) => `${v.toFixed(1)}%` };
  it('formats percentage-point and percent changes with signs', () => {
    expect(formatValue(pct, 1.25, 'change')).toBe('+1.3 pp');
    expect(formatValue(pct, -2, 'change')).toBe('\u22122.0 pp');
    expect(formatValue(pct, 12.34, 'pctChange')).toBe('+12.3%');
    expect(formatValue(pct, 5, 'level')).toBe('5.0%');
  });
});

describe('groups', () => {
  it('only contains known countries and has unique ids', () => {
    const known = new Set<string>(COUNTRY_KEYS);
    for (const g of COUNTRY_GROUPS) for (const m of g.members) expect(known.has(m)).toBe(true);
    expect(new Set(COUNTRY_GROUPS.map(g => g.id)).size).toBe(COUNTRY_GROUPS.length);
    expect(getGroup('g7')?.members).toHaveLength(7);
  });

  it('computes stats over members with data', () => {
    const stats = groupStats({ USA: 4, UK: 2, Japan: 6, China: 100 }, ['USA', 'UK', 'Japan', 'Canada']);
    expect(stats).toEqual({ count: 3, mean: 4, median: 4, top: { country: 'Japan', value: 6 }, bottom: { country: 'UK', value: 2 } });
    expect(groupStats({ China: 1 }, ['USA'])).toBeNull();
  });
});

describe('bivariate', () => {
  it('splits values into terciles and classes', () => {
    const cuts = terciles([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(cuts[0]).toBeCloseTo(11 / 3);
    expect(cuts[1]).toBeCloseTo(19 / 3);
    expect(bivariateClass(1, 9, cuts, cuts)).toEqual([0, 2]);
    expect(bivariateClass(5, 5, cuts, cuts)).toEqual([1, 1]);
    expect(bivariateColor(0, 0, false)).toMatch(/^#/);
  });
});

describe('urlState', () => {
  it('round-trips state', () => {
    const state = { metric: 'gdpGrowth', year: 2022, view: 'tiles', mode: 'change', base: 2019, country: 'USA', step: 2 };
    expect(parseHeatmapState(serializeHeatmapState(state))).toEqual(state);
  });

  it('drops malformed values', () => {
    expect(parseHeatmapState('?year=abc&metric=<script>&view=bubble')).toEqual({ view: 'bubble' });
    expect(serializeHeatmapState({})).toBe('');
  });
});

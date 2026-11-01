import { describe, it, expect } from 'vitest';
import type { CountryData } from '../../services/worldbank';
import type { HeatmapData } from '../heatmap/values';
import { generateInsights, type Insight } from '../heatmap/insights';
import { similarCountries } from '../heatmap/similarity';
import { applyScreener } from '../heatmap/screener';
import { seededRandom, dateSeed, generateQuestion, generateQuiz } from '../heatmap/quiz';
import { COUNTRY_KEYS } from '../countryMappings';

function row(year: number, values: Record<string, number>): CountryData {
  return { year, ...values };
}

const pct = { unit: '%', format: (v: number) => `${v.toFixed(1)}%` };

function text(i: Insight): string {
  return i.parts.map(p => (typeof p === 'string' ? p : p.country)).join('');
}

describe('generateInsights', () => {
  it('describes the spread and the biggest movers', () => {
    const data: HeatmapData = {
      m: [
        row(2021, { USA: 2, UK: 3, Japan: 1, France: 2 }),
        row(2022, { USA: 6, UK: 1, Japan: 1.5, France: 2.5 }),
      ],
    };
    const out = generateInsights({ data, metric: 'm', year: 2022, def: pct }).map(text);
    expect(out[0]).toBe('USA leads at 6.0%, while UK sits lowest at 1.0%: a gap of 5.0 pp.');
    expect(out[1]).toBe('Biggest rise since 2021: USA (+4.0 pp, to 6.0%). Biggest fall: UK (\u22122.0 pp, to 1.0%).');
  });

  it('flags statistical outliers', () => {
    const values = Object.fromEntries(COUNTRY_KEYS.slice(0, 20).map(k => [k, 1]));
    values.USA = 50;
    const out = generateInsights({ data: { m: [row(2020, values)] }, metric: 'm', year: 2020, def: pct });
    expect(out.some(i => i.kind === 'outlier' && text(i).startsWith('USA stands out'))).toBe(true);
  });

  it('notes record highs against a long history and thin coverage', () => {
    const rows = Array.from({ length: 12 }, (_, i) => row(2000 + i, { USA: 1 + i * 0.1, UK: 5, Japan: 3 }));
    rows.push(row(2012, { USA: 9, UK: 4, Japan: 3.5 }));
    const out = generateInsights({ data: { m: rows }, metric: 'm', year: 2012, def: pct, limit: 10 });
    const records = out.filter(i => i.kind === 'record').map(text);
    expect(records).toContain('At a record high in their own data: USA and Japan.');
    expect(records).toContain('At a record low in their own data: UK.');
    expect(out.some(i => i.kind === 'coverage')).toBe(true);
  });

  it('returns nothing when too few countries report', () => {
    expect(generateInsights({ data: { m: [row(2020, { USA: 1 })] }, metric: 'm', year: 2020, def: pct })).toEqual([]);
  });
});

describe('similarCountries', () => {
  const data: HeatmapData = {
    a: [row(2020, { USA: 10, UK: 9.8, Japan: 1, France: 5, Italy: 1.2 })],
    b: [row(2020, { USA: 3, UK: 3.1, Japan: 8, France: 5, Italy: 7.9 })],
  };

  it('ranks the closest profiles first', () => {
    const out = similarCountries(data, 'USA', ['a', 'b'], 2020, 2);
    expect(out.map(s => s.country)).toEqual(['UK', 'France']);
    expect(out[0].closeOn).toEqual(['a', 'b']);
  });

  it('returns nothing when the country lacks data', () => {
    expect(similarCountries(data, 'China', ['a', 'b'], 2020)).toEqual([]);
  });
});

describe('applyScreener', () => {
  const data: HeatmapData = {
    debt: [row(2020, { USA: 120, Japan: 250, Germany: 60, Italy: 150 })],
    growth: [row(2020, { USA: 2, Japan: 0.5, Germany: 1, Italy: 0.8 })],
  };

  it('requires every condition and data for every metric', () => {
    expect(applyScreener(data, 2020, [{ metric: 'debt', op: '>', value: 100 }, { metric: 'growth', op: '<', value: 1 }])).toEqual(['Italy', 'Japan']);
  });

  it('ignores incomplete conditions', () => {
    expect(applyScreener(data, 2020, [{ metric: '', op: '>', value: 1 }])).toEqual([]);
  });
});

describe('quiz', () => {
  it('is deterministic for a seed', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(dateSeed(new Date(Date.UTC(2026, 10, 1)))).toBe(20261101);
  });

  const data: HeatmapData = {
    gdpGrowth: [row(2020, Object.fromEntries(COUNTRY_KEYS.map((k, i) => [k, i + 1])))],
    inflationRates: [row(2020, Object.fromEntries(COUNTRY_KEYS.map((k, i) => [k, 100 - i])))],
  };

  it('generates answerable questions', () => {
    const rng = seededRandom(7);
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion(data, rng)!;
      expect(q.options).toContain(q.answer);
      const vals = q.options.map(o => q.values[o]!);
      const best = q.direction === 'highest' ? Math.max(...vals) : Math.min(...vals);
      expect(q.values[q.answer]).toBe(best);
    }
  });

  it('builds the same daily quiz for the same seed', () => {
    const a = generateQuiz(data, 20261101);
    expect(a).toHaveLength(5);
    expect(generateQuiz(data, 20261101)).toEqual(a);
  });
});

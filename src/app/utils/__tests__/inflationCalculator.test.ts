import { describe, expect, it } from 'vitest';
import type { CountryData } from '../../services/worldbank';
import {
  calculateInflation,
  CURRENCIES,
  formatCurrency,
  formatCurrencyCompact,
  getCurrencyName,
  getCurrencySymbol,
  redenominationIn,
} from '../../services/inflationCalculator';
import {
  calcQuery,
  clampYears,
  compareCountries,
  evenlySpaced,
  indexedSeries,
  parseCalcParams,
  parseCountry,
  priceMilestones,
  reverseInflation,
  sharedRange,
  yearByYear,
} from '../inflation/calculator';
import { COUNTRY_KEYS } from '../countryMappings';

// USA prices double every 10 years; Japan is flat; France crosses the euro in 2002.
const rows: CountryData[] = [1990, 2000, 2001, 2002, 2010, 2020].map((year) => ({
  year,
  USA: 100 * 2 ** ((year - 1990) / 10),
  Japan: 100,
  France: year < 2010 ? 50 : 100,
}));

describe('existing calculation', () => {
  it('scales by the CPI ratio and reports average inflation', () => {
    const r = calculateInflation(100, 1990, 2010, 'USA', rows)!;
    expect(r.adjustedValue).toBeCloseTo(400);
    expect(r.averageInflation).toBeCloseTo((2 ** (1 / 10) - 1) * 100);
    expect(r.purchasingPowerChange).toBeCloseTo(300);
    expect(r.currencyChanged).toBe(false);
  });

  it('converts francs to euros only when the period spans adoption', () => {
    const spans = calculateInflation(655.957, 2000, 2010, 'France', rows)!;
    expect(spans.convertedToEuros).toBe(true);
    expect(spans.adjustedValue).toBeCloseTo(200);
    expect(spans.originalCurrency).toBe('F');
    expect(spans.targetCurrency).toBe('€');

    const before = calculateInflation(100, 1990, 2001, 'France', rows)!;
    expect(before.convertedToEuros).toBe(false);
    expect(before.adjustedValue).toBeCloseTo(100);
  });

  it('returns null when a year is missing', () => {
    expect(calculateInflation(100, 1995, 2010, 'USA', rows)).toBeNull();
  });
});

describe('currencies', () => {
  it('covers every roster country', () => {
    for (const k of COUNTRY_KEYS) expect(CURRENCIES[k], k).toBeDefined();
  });

  it('uses the drachma before Greece joined the euro', () => {
    expect(getCurrencySymbol('Greece', 2000)).toBe('Dr');
    expect(getCurrencyName('Greece', 2001)).toBe('Euro');
  });

  it('formats symbols, decimals and compact values', () => {
    expect(formatCurrency(1234.5, 'USA')).toBe('$1,234.50');
    expect(formatCurrency(1234.5, 'Japan')).toBe('¥1,235');
    expect(formatCurrency(10, 'Switzerland')).toBe('CHF 10.00');
    expect(formatCurrencyCompact(2_500_000, 'Turkey')).toBe('₺2.5m');
  });

  it('flags redenominations inside the period', () => {
    expect(redenominationIn('Turkey', 2000, 2020)?.factor).toBe(1_000_000);
    expect(redenominationIn('Turkey', 2006, 2020)).toBeNull();
  });
});

describe('compare', () => {
  it('carries the same amount through each country', () => {
    const out = compareCountries(100, 1990, 2010, ['USA', 'Japan', 'Atlantis'], rows);
    expect(out[0].result?.adjustedValue).toBeCloseTo(400);
    expect(out[1].result?.adjustedValue).toBeCloseTo(100);
    expect(out[2].result).toBeNull();
  });

  it('indexes every country to 100 in the first year', () => {
    const s = indexedSeries(rows, ['USA', 'Japan'], 2000, 2020);
    expect(s[0]).toMatchObject({ year: 2000, USA: 100, Japan: 100 });
    expect(s[s.length - 1].USA).toBeCloseTo(400);
    expect(s.map((r) => r.year)).toEqual([2000, 2001, 2002, 2010, 2020]);
  });

  it('finds the years all countries share', () => {
    const extra: CountryData[] = rows.map((r) => (r.year >= 2001 ? { ...r, Kenya: 10 } : r));
    expect(sharedRange(extra, ['USA', 'Kenya'])).toMatchObject({ startYear: 2001, endYear: 2020 });
    expect(sharedRange(extra, ['USA', 'Atlantis'])).toBeNull();
  });
});

describe('reverse', () => {
  it('works back from today to the past amount', () => {
    const r = reverseInflation(400, 1990, 2010, 'USA', rows)!;
    expect(r.pastAmount).toBeCloseTo(100);
    expect(r.priceMultiple).toBeCloseTo(4);
  });

  it('round-trips with the forward calculation', () => {
    const fwd = calculateInflation(123, 2000, 2020, 'USA', rows)!;
    expect(reverseInflation(fwd.adjustedValue, 2000, 2020, 'USA', rows)!.pastAmount).toBeCloseTo(123);
  });

  it('expresses pre-euro amounts in the old currency', () => {
    const r = reverseInflation(100, 2000, 2010, 'France', rows)!;
    expect(r.pastAmount).toBeCloseTo(50 * 6.55957);
    expect(r.pastCurrency).toBe('F');
    expect(r.conversionRate).toBeCloseTo(6.55957);
  });

  it('rejects bad input', () => {
    expect(() => reverseInflation(100, 2010, 2000, 'USA', rows)).toThrow();
    expect(() => reverseInflation(0, 2000, 2010, 'USA', rows)).toThrow();
  });
});

describe('milestones', () => {
  it('marks each doubling of prices', () => {
    const pts = [0, 5, 10, 15, 20, 25, 30].map((i) => ({ year: 2000 + i, value: 2 ** (i / 10) }));
    expect(priceMilestones(pts)).toEqual([
      { year: 2010, priceMultiple: 2 },
      { year: 2020, priceMultiple: 4 },
      { year: 2030, priceMultiple: 8 },
    ]);
  });

  it('switches to powers of ten for hyperinflation', () => {
    const pts = Array.from({ length: 13 }, (_, i) => ({ year: 1990 + i, value: 10 ** i }));
    const m = priceMilestones(pts, 10);
    expect(m.length).toBeLessThanOrEqual(12);
    expect(m.map((x) => x.priceMultiple)).toEqual([...Array(m.length)].map((_, i) => 100 ** (i + 1)));
  });

  it('reports price halvings under deflation and nothing when flat', () => {
    expect(priceMilestones([{ year: 1, value: 4 }, { year: 2, value: 2 }, { year: 3, value: 1 }])).toEqual([
      { year: 2, priceMultiple: 0.5 },
      { year: 3, priceMultiple: 0.25 },
    ]);
    expect(priceMilestones([{ year: 1, value: 1 }, { year: 2, value: 1.5 }])).toEqual([]);
  });
});

describe('year-by-year table', () => {
  it('tracks the equivalent amount and the shrinking cash value', () => {
    const t = yearByYear(100, 2000, 2020, 'USA', rows);
    expect(t.map((r) => r.year)).toEqual([2000, 2001, 2002, 2010, 2020]);
    expect(t[0].inflation).toBeNull();
    expect(t[1].inflation).toBeCloseTo((2 ** 0.1 - 1) * 100);
    // 2010 follows a gap (no 2009 row), so there is no one-year change.
    expect(t[3].inflation).toBeNull();
    expect(t[4].equivalent).toBeCloseTo(400);
    expect(t[4].purchasingPower).toBeCloseTo(25);
  });

  it('picks evenly spaced rows including both ends', () => {
    expect(evenlySpaced([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)).toEqual([1, 5, 9]);
    expect(evenlySpaced([1, 2], 5)).toEqual([1, 2]);
  });
});

describe('url state', () => {
  it('parses the teaser links', () => {
    expect(parseCalcParams(new URLSearchParams('amount=100&from=2000&to=2024&c=SouthKorea'))).toEqual({
      amount: 100,
      from: 2000,
      to: 2024,
      countries: ['SouthKorea'],
    });
    expect(parseCalcParams(new URLSearchParams('mode=compare'))).toEqual({ mode: 'compare' });
  });

  it('accepts slugs, drops junk and caps compare at four', () => {
    expect(parseCountry('south-korea')).toBe('SouthKorea');
    expect(parseCountry('usa')).toBe('USA');
    expect(parseCountry('narnia')).toBeNull();
    const p = parseCalcParams(new URLSearchParams('mode=bogus&amount=-5&c=usa,uk,japan,brazil,india,usa'));
    expect(p.mode).toBeUndefined();
    expect(p.amount).toBeUndefined();
    expect(p.countries).toEqual(['USA', 'UK', 'Japan', 'Brazil']);
  });

  it('round-trips through the query string', () => {
    const state = { mode: 'compare' as const, amount: 250, from: 1990, to: 2020, countries: ['USA' as const, 'Japan' as const] };
    expect(parseCalcParams(new URLSearchParams(calcQuery(state)))).toEqual(state);
  });

  it('clamps years into the available range', () => {
    const range = { startYear: 1995, endYear: 2020, dataPoints: 26 };
    expect(clampYears(1960, 2030, range)).toEqual({ from: 1995, to: 2020 });
    expect(clampYears(2020, 2020, range)).toEqual({ from: 2019, to: 2020 });
  });
});

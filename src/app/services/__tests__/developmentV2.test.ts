import { describe, it, expect } from 'vitest';
import {
  HDR,
  HDR_DATA_YEAR,
  GLOBAL_INCOME_CDF,
  INCOME_GROUPS,
  INCOME_GROUP_ORDER,
  DEVELOPMENT_STORIES,
  DEV_QUALITY,
  SOCIAL_PROGRESS,
  HAPPINESS,
  MPI,
  SDG_TARGETS,
  cagr,
  getPeers,
  globalPercentile,
  indexScore,
  latestObs,
  linearProjection,
  normalise,
  sdgStatus,
  undpHdi,
  yearsBehind,
  type Obs,
} from '../developmentCurated';
import { COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import type { CountryData } from '../worldbank';

const rows = (pairs: [number, number][], key = 'USA') =>
  pairs.map(([year, v]) => ({ year, [key]: v }) as unknown as CountryData);
const obs = (pairs: [number, number][]): Obs[] => pairs.map(([year, value]) => ({ year, value }));

describe('UNDP HDR snapshot', () => {
  it('covers all 47 economies with an HDI', () => {
    expect(HDR_DATA_YEAR).toBeGreaterThanOrEqual(2022);
    for (const k of COUNTRY_KEYS) {
      expect(HDR[k], k).toBeDefined();
      expect(HDR[k]!.hdi, k).not.toBeNull();
    }
  });

  it('keeps every value in its plausible range', () => {
    for (const k of COUNTRY_KEYS) {
      const r = HDR[k]!;
      expect(r.hdi!).toBeGreaterThan(0.3);
      expect(r.hdi!).toBeLessThan(1);
      if (r.lifeExpectancy != null) expect(r.lifeExpectancy).toBeGreaterThan(40);
      if (r.lifeExpectancy != null) expect(r.lifeExpectancy).toBeLessThan(90);
      if (r.meanSchooling != null) expect(r.meanSchooling).toBeLessThanOrEqual(15);
      if (r.gniPerCapita != null) expect(r.gniPerCapita).toBeGreaterThan(500);
      if (r.gii != null) expect(r.gii).toBeLessThan(1);
      if (r.ihdiLoss != null) expect(r.ihdiLoss).toBeLessThan(60);
    }
  });

  it('never has an inequality-adjusted HDI above the HDI', () => {
    for (const k of COUNTRY_KEYS) {
      const r = HDR[k]!;
      if (r.ihdi != null) expect(r.ihdi, k).toBeLessThanOrEqual(r.hdi! + 1e-9);
      if (r.phdi != null) expect(r.phdi, k).toBeLessThanOrEqual(r.hdi! + 1e-9);
    }
  });

  it('shares an HDI rank only between tied HDI values, and ranks agree with HDI order', () => {
    const ranked = COUNTRY_KEYS.map((k) => HDR[k]!).filter((r) => r.hdiRank != null);
    const byRank = [...ranked].sort((a, b) => a.hdiRank! - b.hdiRank!);
    for (let i = 1; i < byRank.length; i++) {
      if (byRank[i].hdiRank === byRank[i - 1].hdiRank) expect(byRank[i].hdi).toBe(byRank[i - 1].hdi);
      else expect(byRank[i].hdi!).toBeLessThan(byRank[i - 1].hdi!);
    }
  });

  it('carries a 1990s-onward trend ending at the headline value', () => {
    for (const k of COUNTRY_KEYS) {
      const r = HDR[k]!;
      const years = Object.keys(r.trend).map(Number);
      expect(Math.max(...years), k).toBe(HDR_DATA_YEAR);
      expect(r.trend[String(HDR_DATA_YEAR)], k).toBeCloseTo(r.hdi!, 3);
    }
  });

  it('reproduces the published HDI from its components', () => {
    for (const k of COUNTRY_KEYS) {
      const r = HDR[k]!;
      if (r.lifeExpectancy == null || r.expectedSchooling == null || r.meanSchooling == null || r.gniPerCapita == null) continue;
      const { hdi } = undpHdi({
        lifeExpectancy: r.lifeExpectancy,
        expectedSchooling: r.expectedSchooling,
        meanSchooling: r.meanSchooling,
        gniPerCapita: r.gniPerCapita,
      });
      expect(Math.abs(hdi - r.hdi!), k).toBeLessThan(0.006);
    }
  });
});

describe('series helpers', () => {
  it('latestObs keeps a real zero observation', () => {
    const s = rows([[2020, 1.2], [2022, 0]]);
    expect(latestObs(s, 'USA')).toEqual({ year: 2022, value: 0 });
  });

  it('latestObs respects the minimum year', () => {
    const s = rows([[2005, 10], [2008, 9]]);
    expect(latestObs(s, 'USA', 2010)).toBeNull();
    expect(latestObs(s, 'USA', 2006)).toEqual({ year: 2008, value: 9 });
  });

  it('cagr uses the real span between observations', () => {
    const g = cagr({ year: 2000, value: 100 }, { year: 2010, value: 200 });
    expect(g).toBeCloseTo((Math.pow(2, 1 / 10) - 1) * 100, 6);
    expect(cagr({ year: 2010, value: 100 }, { year: 2010, value: 200 })).toBeNull();
    expect(cagr({ year: 2000, value: 0 }, { year: 2010, value: 200 })).toBeNull();
  });

  it('yearsBehind finds when the leader reached the current level', () => {
    const country = obs([[2000, 50], [2022, 70]]);
    const leader = obs([[1960, 60], [1975, 70], [2022, 80]]);
    const r = yearsBehind(country, leader, true)!;
    expect(r.leaderYear).toBe(1975);
    expect(r.gap).toBe(47);
    expect(r.ahead).toBe(false);
    expect(r.beforeData).toBe(false);
  });

  it('yearsBehind flags levels the leader passed before its data starts', () => {
    const r = yearsBehind(obs([[2022, 55]]), obs([[1960, 60], [2022, 80]]), true)!;
    expect(r.beforeData).toBe(true);
    expect(r.gap).toBe(62);
  });

  it('yearsBehind works for lower-is-better series and when ahead', () => {
    const r = yearsBehind(obs([[2022, 20]]), obs([[1990, 30], [2000, 15], [2022, 4]]), false)!;
    expect(r.leaderYear).toBe(2000);
    const ahead = yearsBehind(obs([[2022, 90]]), obs([[2022, 80]]), true)!;
    expect(ahead.ahead).toBe(true);
    expect(ahead.gap).toBe(0);
  });

  it('linearProjection extends a straight line', () => {
    const p = linearProjection(obs([[2014, 10], [2016, 14], [2018, 18], [2020, 22]]), 2030)!;
    expect(p.slope).toBeCloseTo(2, 6);
    expect(p.value).toBeCloseTo(42, 6);
    expect(linearProjection(obs([[2020, 1]]), 2030)).toBeNull();
  });

  it('sdgStatus classifies achieved, on-track and off-track', () => {
    const t = SDG_TARGETS.find((s) => s.id === '1.1')!;
    expect(sdgStatus(obs([[2020, 2]]), t).status).toBe('achieved');
    expect(sdgStatus(obs([[2014, 30], [2016, 24], [2018, 18], [2020, 12]]), t).status).toBe('on-track');
    expect(sdgStatus(obs([[2014, 30], [2016, 30], [2018, 29], [2020, 29]]), t).status).toBe('off-track');
    expect(sdgStatus([], t).status).toBe('no-data');
  });

  it('indexScore renormalises over dimensions with data', () => {
    expect(indexScore({ a: 80, b: 40 }, { a: 1, b: 1 })).toBeCloseTo(60);
    expect(indexScore({ a: 80, b: null }, { a: 1, b: 3 })).toBeCloseTo(80);
    expect(indexScore({ a: 80, b: 40 }, { a: 0, b: 0 })).toBeNull();
    expect(normalise(5, 0, 10)).toBe(50);
    expect(normalise(5, 0, 10, true)).toBe(50);
    expect(normalise(15, 0, 10)).toBe(100);
  });
});

describe('global income distribution', () => {
  it('has a monotonic cumulative distribution', () => {
    for (let i = 1; i < GLOBAL_INCOME_CDF.length; i++) {
      expect(GLOBAL_INCOME_CDF[i].dailyIncome).toBeGreaterThan(GLOBAL_INCOME_CDF[i - 1].dailyIncome);
      expect(GLOBAL_INCOME_CDF[i].shareBelow).toBeGreaterThanOrEqual(GLOBAL_INCOME_CDF[i - 1].shareBelow);
    }
  });

  it('globalPercentile is monotonic and bounded', () => {
    let prev = -1;
    for (const d of [0.5, 1, 2, 3, 5, 8.3, 15, 28, 50, 100, 500, 5000]) {
      const p = globalPercentile(d);
      expect(p).toBeGreaterThan(prev);
      expect(p).toBeLessThan(100);
      prev = p;
    }
    expect(globalPercentile(0)).toBe(0);
  });

  it('matches the published headcount at a poverty line', () => {
    const at3 = GLOBAL_INCOME_CDF.find((p) => p.dailyIncome === 3);
    if (at3) expect(globalPercentile(3)).toBeCloseTo(at3.shareBelow, 6);
  });
});

describe('income groups, peers and curated estimates', () => {
  it('assigns every economy a World Bank income group', () => {
    for (const k of COUNTRY_KEYS) expect(INCOME_GROUP_ORDER).toContain(INCOME_GROUPS[k]);
  });

  it('finds same-group peers for every economy except singletons', () => {
    let withPeers = 0;
    for (const k of COUNTRY_KEYS) {
      const peers = getPeers(k);
      expect(peers).not.toContain(k);
      peers.forEach((p) => expect(INCOME_GROUPS[p]).toBe(INCOME_GROUPS[k]));
      if (peers.length) withPeers++;
    }
    expect(withPeers).toBeGreaterThanOrEqual(COUNTRY_KEYS.length - 1);
  });

  it('flags hand-compiled indices as estimates', () => {
    expect(DEV_QUALITY.hdr).toBe('curated');
    expect(DEV_QUALITY.socialProgress).toBe('estimate');
    expect(DEV_QUALITY.happiness).toBe('estimate');
    expect(DEV_QUALITY.mpi).toBe('estimate');
  });

  it('keeps estimates in range', () => {
    for (const v of Object.values(SOCIAL_PROGRESS)) expect(v!).toBeGreaterThan(0);
    for (const v of Object.values(SOCIAL_PROGRESS)) expect(v!).toBeLessThanOrEqual(100);
    for (const v of Object.values(HAPPINESS)) expect(v!).toBeGreaterThan(0);
    for (const v of Object.values(HAPPINESS)) expect(v!).toBeLessThanOrEqual(10);
    for (const m of Object.values(MPI)) {
      expect(m!.headcount).toBeGreaterThanOrEqual(0);
      expect(m!.headcount).toBeLessThanOrEqual(100);
      expect(m!.mpi).toBeLessThanOrEqual(1);
    }
  });

  it('only tells stories about roster countries, with dated events', () => {
    const ids = new Set<string>();
    for (const s of DEVELOPMENT_STORIES) {
      expect(ids.has(s.id)).toBe(false);
      ids.add(s.id);
      s.countries.forEach((c) => expect(COUNTRY_KEYS).toContain(c as CountryKey));
      s.events.forEach((e) => expect(e.year).toBeGreaterThanOrEqual(s.from));
    }
    expect(DEVELOPMENT_STORIES.length).toBeGreaterThanOrEqual(6);
  });
});

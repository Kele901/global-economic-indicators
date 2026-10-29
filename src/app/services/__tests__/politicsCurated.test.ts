import { describe, it, expect } from 'vitest';
import {
  POLITICS_PROFILES,
  POLITICS_BY_KEY,
  POLITICAL_TRADITIONS,
  TRADITION_BY_ID,
  VDEM_YEARS,
  getEffectiveLeader,
  getRegimeShares,
  getUpcomingElections,
  governmentSeatShare,
  totalSeats,
} from '../politicsCurated';
import { COUNTRY_KEYS, COUNTRY_ISO3, COUNTRY_KEY_TO_SLUG } from '../../utils/countryMappings';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const isIsoDate = (s: string) => ISO_DATE.test(s) && !Number.isNaN(Date.parse(s));

describe('politicsCurated roster', () => {
  it('has exactly one profile per canonical country', () => {
    const keys = POLITICS_PROFILES.map(p => p.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect([...keys].sort()).toEqual([...COUNTRY_KEYS].sort());
  });

  it('uses the roster ISO-3 code for every profile', () => {
    const mismatched = POLITICS_PROFILES.filter(p => COUNTRY_ISO3[p.key] !== p.iso3).map(p => p.key);
    expect(mismatched).toEqual([]);
  });

  it('indexes every profile by key and slug', () => {
    for (const p of POLITICS_PROFILES) {
      expect(POLITICS_BY_KEY[p.key]).toBe(p);
      expect(COUNTRY_KEY_TO_SLUG[p.key]).toBeTruthy();
    }
  });
});

describe('politicsCurated data integrity', () => {
  it('never seats more members than the chamber holds', () => {
    const over = POLITICS_PROFILES.filter(p => totalSeats(p) > p.system.legislature.seats)
      .map(p => `${p.key}: ${totalSeats(p)} > ${p.system.legislature.seats}`);
    expect(over).toEqual([]);
  });

  it('gives every profile at least one party and a positive chamber size', () => {
    const bad = POLITICS_PROFILES.filter(p => p.parties.length === 0 || p.system.legislature.seats <= 0).map(p => p.key);
    expect(bad).toEqual([]);
  });

  it('keeps government seat share within 0..1', () => {
    for (const p of POLITICS_PROFILES) {
      const s = governmentSeatShare(p);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(1);
    }
  });

  it('keeps party compass positions on the -5..5 scale', () => {
    const out = POLITICS_PROFILES.flatMap(p =>
      p.parties.filter(pt => Math.abs(pt.econ) > 5 || Math.abs(pt.social) > 5).map(pt => `${p.key}: ${pt.abbr}`),
    );
    expect(out).toEqual([]);
  });

  it(`carries ${VDEM_YEARS.length} V-Dem readings in 0..1 for every profile`, () => {
    const bad = POLITICS_PROFILES.filter(
      p => p.indices.vdemLibDem.length !== VDEM_YEARS.length || p.indices.vdemLibDem.some(v => v < 0 || v > 1),
    ).map(p => p.key);
    expect(bad).toEqual([]);
  });

  it('keeps every index inside its published range', () => {
    const bad = POLITICS_PROFILES.filter(p => {
      const i = p.indices;
      return (
        i.eiu.score < 0 || i.eiu.score > 10 ||
        i.freedomHouse.score < 0 || i.freedomHouse.score > 100 ||
        i.rsfRank < 1 || i.rsfRank > 180 ||
        i.cpi < 0 || i.cpi > 100 ||
        i.womenInParliamentPct < 0 || i.womenInParliamentPct > 100
      );
    }).map(p => p.key);
    expect(bad).toEqual([]);
  });

  it('uses ISO dates for leaders and elections (empty only for no scheduled vote)', () => {
    const bad: string[] = [];
    for (const p of POLITICS_PROFILES) {
      const { headOfState, headOfGovernment, lastElection, nextElection } = p.leadership;
      if (!isIsoDate(headOfState.since)) bad.push(`${p.key} headOfState.since`);
      if (headOfGovernment && !isIsoDate(headOfGovernment.since)) bad.push(`${p.key} headOfGovernment.since`);
      if (lastElection.date && !isIsoDate(lastElection.date)) bad.push(`${p.key} lastElection`);
      if (nextElection.date && !isIsoDate(nextElection.date)) bad.push(`${p.key} nextElection`);
      if (!isIsoDate(p.lastVerified)) bad.push(`${p.key} lastVerified`);
    }
    expect(bad).toEqual([]);
  });

  it('orders history eras chronologically and closes all but the last', () => {
    const bad = POLITICS_PROFILES.filter(p => {
      const eras = p.history.eras;
      return eras.length === 0 || eras.some((e, i) =>
        (i > 0 && e.start < eras[i - 1].start) || (e.end !== null && e.end < e.start) || (i < eras.length - 1 && e.end === null),
      );
    }).map(p => p.key);
    expect(bad).toEqual([]);
  });

  it('references only known political traditions', () => {
    const unknown = POLITICS_PROFILES.flatMap(p => p.traditions.filter(t => !TRADITION_BY_ID[t]).map(t => `${p.key}: ${t}`));
    expect(unknown).toEqual([]);
    expect(new Set(POLITICAL_TRADITIONS.map(t => t.id)).size).toBe(POLITICAL_TRADITIONS.length);
  });

  it('fills the narrative sections for every profile', () => {
    const thin = POLITICS_PROFILES.filter(p =>
      !p.history.summary || !p.culture.summary || !p.philosophy.summary ||
      p.history.keyEvents.length < 3 || p.philosophy.coreValues.length === 0 || p.sources.length === 0,
    ).map(p => p.key);
    expect(thin).toEqual([]);
  });
});

describe('politicsCurated helpers', () => {
  it('returns only future elections, sorted ascending', () => {
    const asOf = '2026-10-29';
    const upcoming = getUpcomingElections(asOf);
    expect(upcoming.length).toBeGreaterThan(0);
    for (let i = 0; i < upcoming.length; i++) {
      expect(upcoming[i].date >= asOf).toBe(true);
      if (i > 0) expect(upcoming[i].date >= upcoming[i - 1].date).toBe(true);
    }
  });

  it('splits population shares that sum to 100%', () => {
    const total = getRegimeShares().reduce((s, r) => s + r.sharePct, 0);
    expect(total).toBeCloseTo(100, 5);
  });

  it('picks the executive that actually governs', () => {
    expect(getEffectiveLeader(POLITICS_BY_KEY.USA!)).toBe(POLITICS_BY_KEY.USA!.leadership.headOfState);
    expect(getEffectiveLeader(POLITICS_BY_KEY.Germany!)).toBe(POLITICS_BY_KEY.Germany!.leadership.headOfGovernment);
    expect(getEffectiveLeader(POLITICS_BY_KEY.France!)).toBe(POLITICS_BY_KEY.France!.leadership.headOfState);
    expect(getEffectiveLeader(POLITICS_BY_KEY.Poland!)).toBe(POLITICS_BY_KEY.Poland!.leadership.headOfGovernment);
  });
});

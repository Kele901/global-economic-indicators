import { describe, it, expect } from 'vitest';
import {
  POLITICS_PROFILES,
  POLITICS_HISTORY_BY_KEY,
  CHECKS_BY_KEY,
  CHECK_AXES,
  RECENT_CHANGES,
  CURATED_LAST_UPDATED,
  getEffectiveLeader,
  powerConcentration,
  turnoverSince1945,
  womenLeaders,
  QUIZ_STATEMENTS,
  scoreAnswers,
  nearestParties,
  encodeAnswers,
  decodeAnswers,
  emptyAnswers,
  type Answers,
} from '../politicsCurated';
import { COUNTRY_KEYS } from '../../utils/countryMappings';
import { normaliseName, sameLeader } from '../../../../scripts/politics-verify';

describe('political match quiz', () => {
  it('has unique ids and weights in [-1, 1] that move at least one axis', () => {
    expect(new Set(QUIZ_STATEMENTS.map((q) => q.id)).size).toBe(QUIZ_STATEMENTS.length);
    for (const q of QUIZ_STATEMENTS) {
      expect(Math.abs(q.econ)).toBeLessThanOrEqual(1);
      expect(Math.abs(q.social)).toBeLessThanOrEqual(1);
      expect(Math.abs(q.econ) + Math.abs(q.social)).toBeGreaterThan(0);
    }
  });

  it('scores the extremes at the edges of the compass and ignores skips', () => {
    const agreeWithWeight = (axis: 'econ' | 'social', sign: 1 | -1): Answers =>
      QUIZ_STATEMENTS.map((q) => (q[axis] === 0 ? null : (Math.sign(q[axis]) * sign * 2) as 2 | -2));
    expect(scoreAnswers(agreeWithWeight('econ', 1)).econ).toBe(5);
    expect(scoreAnswers(agreeWithWeight('econ', -1)).econ).toBe(-5);
    expect(scoreAnswers(agreeWithWeight('social', 1)).social).toBe(5);
    expect(scoreAnswers(emptyAnswers())).toEqual({ econ: 0, social: 0 });
  });

  it('returns deterministic nearest parties sorted by distance', () => {
    const point = { econ: 1.3, social: -0.7 };
    const a = nearestParties(point, POLITICS_PROFILES, { limit: 10 });
    const b = nearestParties(point, [...POLITICS_PROFILES].reverse(), { limit: 10 });
    expect(a.map((m) => `${m.key}:${m.party.abbr}`)).toEqual(b.map((m) => `${m.key}:${m.party.abbr}`));
    expect(a).toHaveLength(10);
    for (let i = 1; i < a.length; i++) expect(a[i].distance).toBeGreaterThanOrEqual(a[i - 1].distance);
    const gov = nearestParties(point, POLITICS_PROFILES, { governingOnly: true });
    expect(gov.every((m) => m.party.role === 'governing' || m.party.role === 'coalition')).toBe(true);
  });

  it('round-trips answers through the share code', () => {
    const answers: Answers = QUIZ_STATEMENTS.map((_, i) => (i % 3 === 0 ? null : (((i % 5) - 2) as -2 | -1 | 0 | 1 | 2)));
    expect(decodeAnswers(encodeAnswers(answers))).toEqual(answers);
    expect(decodeAnswers('bad')).toBeNull();
  });
});

describe('politics verify name matching', () => {
  it('matches common Wikidata label variants', () => {
    expect(sameLeader('Volodymyr Zelensky', 'Volodymyr Zelenskyy')).toBe(true);
    expect(sameLeader('Willem-Alexander', 'William Alexander of the Netherlands')).toBe(true);
    expect(sameLeader('Ferdinand Marcos Jr.', 'Bongbong Marcos')).toBe(true);
    expect(sameLeader('Maha Vajiralongkorn (Rama X)', 'Rama X of Thailand')).toBe(true);
    expect(sameLeader('Charles III', 'Charles III of the United Kingdom')).toBe(true);
  });

  it('does not match different people', () => {
    expect(sameLeader('Anutin Charnvirakul', 'Paetongtarn Shinawatra')).toBe(false);
    expect(sameLeader('Harald V', 'Haakon VIII of Norway')).toBe(false);
    expect(normaliseName('Lê Minh Hưng')).toEqual(['le', 'minh', 'hung']);
  });
});

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const isIsoDate = (s: string) => ISO_DATE.test(s) && !Number.isNaN(Date.parse(s));

describe('politics history', () => {
  it('covers every country', () => {
    const missing = COUNTRY_KEYS.filter((k) => !POLITICS_HISTORY_BY_KEY[k]);
    expect(missing).toEqual([]);
  });

  it('has valid, chronological, non-overlapping terms within each role', () => {
    const problems: string[] = [];
    for (const [key, h] of Object.entries(POLITICS_HISTORY_BY_KEY)) {
      for (const role of ['hog', 'hos'] as const) {
        const rows = h!.leaders.filter((t) => t.role === role);
        rows.forEach((t, i) => {
          if (!isIsoDate(t.start) || (t.end !== null && !isIsoDate(t.end))) problems.push(`${key} ${t.name}: bad date`);
          if (t.end !== null && t.end < t.start) problems.push(`${key} ${t.name}: ends before start`);
          if (t.end === null && i !== rows.length - 1) problems.push(`${key} ${t.name}: open term not last`);
          const prev = rows[i - 1];
          if (prev) {
            if (prev.start > t.start) problems.push(`${key} ${t.name}: out of order`);
            if (prev.end === null || prev.end > t.start) problems.push(`${key} ${prev.name} overlaps ${t.name}`);
          }
        });
      }
    }
    expect(problems).toEqual([]);
  });

  it('has an open term that matches the effective leader', () => {
    const mismatched = POLITICS_PROFILES.filter((p) => {
      const h = POLITICS_HISTORY_BY_KEY[p.key]!;
      if (h.leaders.length === 0) return false;
      const name = getEffectiveLeader(p).name;
      return !h.leaders.some((t) => t.end === null && t.name === name);
    }).map((p) => `${p.key}: ${getEffectiveLeader(p).name}`);
    expect(mismatched).toEqual([]);
  });

  it('explains empty leader or vote histories', () => {
    for (const [key, h] of Object.entries(POLITICS_HISTORY_BY_KEY)) {
      if (h!.leaders.length === 0) expect(h!.leadersNote, key).toBeTruthy();
      if (h!.votes.length === 0) expect(h!.votesNote, key).toBeTruthy();
    }
  });

  it('has vote shares that sum to at most 100 with unique abbreviations', () => {
    const problems: string[] = [];
    for (const [key, h] of Object.entries(POLITICS_HISTORY_BY_KEY)) {
      const years = h!.votes.map((v) => v.year);
      if (new Set(years).size !== years.length) problems.push(`${key}: duplicate year`);
      for (const v of h!.votes) {
        const sum = v.results.reduce((s, r) => s + r.pct, 0);
        if (sum > 100.05) problems.push(`${key} ${v.year}: sums to ${sum.toFixed(1)}`);
        if (v.results.some((r) => r.pct < 0)) problems.push(`${key} ${v.year}: negative share`);
        const abbrs = v.results.map((r) => r.abbr);
        if (new Set(abbrs).size !== abbrs.length) problems.push(`${key} ${v.year}: duplicate abbr`);
        if (v.turnoutPct !== undefined && (v.turnoutPct <= 0 || v.turnoutPct > 100)) problems.push(`${key} ${v.year}: turnout`);
      }
      for (let i = 1; i < h!.votes.length; i++) {
        if (h!.votes[i].year <= h!.votes[i - 1].year) problems.push(`${key}: votes out of order`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('computes turnover for countries with leader histories', () => {
    const de = POLITICS_PROFILES.find((p) => p.key === 'Germany')!;
    const t = turnoverSince1945(de)!;
    expect(t.terms).toBeGreaterThanOrEqual(10);
    expect(t.avgTenureYears).toBeGreaterThan(3);
  });

  it('counts the long-running office when the effective one is recent', () => {
    const sa = POLITICS_PROFILES.find((p) => p.key === 'SaudiArabia')!;
    const t = turnoverSince1945(sa)!;
    expect(t.distinctLeaders).toBeGreaterThanOrEqual(6);
  });
});

describe('checks and balances', () => {
  it('scores every country with integers 0..4 and a note', () => {
    for (const k of COUNTRY_KEYS) {
      const c = CHECKS_BY_KEY[k];
      expect(c, k).toBeTruthy();
      for (const a of CHECK_AXES) {
        expect(Number.isInteger(c[a]) && c[a] >= 0 && c[a] <= 4, `${k}.${a}`).toBe(true);
      }
      expect(c.notes.length).toBeGreaterThan(20);
    }
  });

  it('maps power concentration to 0..100 with autocracies above democracies', () => {
    const pc = (k: string) => powerConcentration(CHECKS_BY_KEY[k as keyof typeof CHECKS_BY_KEY]);
    for (const k of COUNTRY_KEYS) {
      const v = pc(k);
      expect(v >= 0 && v <= 100).toBe(true);
    }
    expect(pc('SaudiArabia')).toBeGreaterThan(pc('Germany'));
  });
});

describe('recent changes', () => {
  it('has valid dates within 12 months and known keys, newest first', () => {
    const cutoff = new Date(CURATED_LAST_UPDATED);
    cutoff.setMonth(cutoff.getMonth() - 12);
    const cut = cutoff.toISOString().slice(0, 10);
    RECENT_CHANGES.forEach((c, i) => {
      expect(isIsoDate(c.date), c.summary).toBe(true);
      expect(c.date >= cut && c.date <= CURATED_LAST_UPDATED, c.summary).toBe(true);
      expect(COUNTRY_KEYS).toContain(c.key);
      if (i > 0) expect(RECENT_CHANGES[i - 1].date >= c.date).toBe(true);
    });
  });
});

describe('leader demographics', () => {
  it('has birth year, gender and route for every effective leader', () => {
    const missing = POLITICS_PROFILES.filter((p) => {
      if (p.key === 'Switzerland') return false;
      const l = getEffectiveLeader(p);
      return !l.born || !l.gender || !l.route;
    }).map((p) => `${p.key}: ${getEffectiveLeader(p).name}`);
    expect(missing).toEqual([]);
  });

  it('finds the women leaders', () => {
    const names = womenLeaders().effective.map((r) => r.leader.name);
    expect(names).toContain('Sanae Takaichi');
    expect(names).toContain('Claudia Sheinbaum');
  });

  it('defaults per-field verification dates', () => {
    for (const p of POLITICS_PROFILES) {
      expect(isIsoDate(p.verified!.leadership)).toBe(true);
      expect(isIsoDate(p.verified!.nextElection)).toBe(true);
    }
  });
});

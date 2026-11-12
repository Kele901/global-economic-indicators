import { describe, it, expect } from 'vitest';
import {
  CHOKEPOINTS,
  COMPANY_BY_ID,
  DEFAULT_HUB,
  LINK_KINDS,
  TECH_CATEGORIES,
  TECH_COMPANIES,
  TECH_LINKS,
} from '../../services/aiPowerNetwork';
import {
  categoryTotals,
  countryTotals,
  formatUsdBn,
  groupRelations,
  lighten,
  matchesQuery,
  neighbourIds,
  neighbours,
  nodeRadius,
  parseHubParam,
  radialLayout,
  rankBy,
  secondDegree,
  shortName,
} from '../aiNetwork/network';

const W = 1000;
const H = 640;

function minPairDistance(pos: Record<string, { x: number; y: number }>): number {
  const pts = Object.values(pos);
  let min = Infinity;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      min = Math.min(min, Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
    }
  }
  return min;
}

describe('AI power network data', () => {
  it('has unique company ids', () => {
    const ids = TECH_COMPANIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers roughly sixty companies and uses every category', () => {
    expect(TECH_COMPANIES.length).toBeGreaterThanOrEqual(55);
    const used = new Set(TECH_COMPANIES.map((c) => c.category));
    for (const cat of TECH_CATEGORIES) expect(used.has(cat.id)).toBe(true);
  });

  it('gives every company a full profile', () => {
    for (const c of TECH_COMPANIES) {
      expect(c.oneLiner, c.id).toBeTruthy();
      expect(c.summary.length, c.id).toBeGreaterThanOrEqual(2);
      expect(c.contributions.length, c.id).toBeGreaterThanOrEqual(4);
      expect(c.keyProducts.length, c.id).toBeGreaterThan(0);
      expect(c.role, c.id).toBeTruthy();
      expect(c.tier ?? 'full', c.id).toBe('full');
      expect(c.sources.length, c.id).toBeGreaterThan(0);
      for (const s of c.sources) expect(s.url, c.id).toMatch(/^https:\/\//);
      if (c.revenueUsdBn != null) expect(c.revenueUsdBn, c.id).toBeGreaterThan(0);
      if (c.valueUsdBn != null) expect(c.valueUsdBn, c.id).toBeGreaterThan(0);
    }
  });

  it('only links companies that exist, never to themselves', () => {
    const kinds = new Set(LINK_KINDS.map((k) => k.id));
    for (const l of TECH_LINKS) {
      expect(COMPANY_BY_ID[l.source], `${l.source}->${l.target}`).toBeDefined();
      expect(COMPANY_BY_ID[l.target], `${l.source}->${l.target}`).toBeDefined();
      expect(l.source).not.toBe(l.target);
      expect(kinds.has(l.kind)).toBe(true);
      expect(l.note).toBeTruthy();
    }
  });

  it('has no duplicate links of the same kind', () => {
    const keys = TECH_LINKS.map((l) => `${l.source}|${l.target}|${l.kind}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('connects every company to the network', () => {
    const orphans = TECH_COMPANIES.filter((c) => neighbours(TECH_LINKS, c.id).length === 0).map((c) => c.id);
    expect(orphans).toEqual([]);
  });

  it('points every chokepoint at real holders and dependents', () => {
    for (const cp of CHOKEPOINTS) {
      for (const id of [...cp.holders, ...cp.dependents]) expect(COMPANY_BY_ID[id], `${cp.id}:${id}`).toBeDefined();
      expect(cp.sharePct).toBeGreaterThan(0);
      expect(cp.sharePct).toBeLessThanOrEqual(100);
    }
  });

  it('defaults the hub to a real company', () => {
    expect(COMPANY_BY_ID[DEFAULT_HUB]).toBeDefined();
  });
});

describe('radialLayout', () => {
  it('places the hub at the centre and everyone else around it', () => {
    const pos = radialLayout(TECH_COMPANIES, DEFAULT_HUB, W, H);
    expect(Object.keys(pos).length).toBe(TECH_COMPANIES.length);
    expect(pos[DEFAULT_HUB]).toMatchObject({ x: W / 2, y: H / 2, anchor: 'middle' });
    for (const [id, p] of Object.entries(pos)) {
      if (id === DEFAULT_HUB) continue;
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(W);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(H);
      expect(Math.hypot(p.x - W / 2, p.y - H / 2)).toBeGreaterThan(100);
    }
  });

  it('is deterministic', () => {
    expect(radialLayout(TECH_COMPANIES, 'tsmc', W, H)).toEqual(radialLayout(TECH_COMPANIES, 'tsmc', W, H));
  });

  it('keeps nodes apart for every possible hub', () => {
    for (const c of TECH_COMPANIES) {
      expect(minPairDistance(radialLayout(TECH_COMPANIES, c.id, W, H)), c.id).toBeGreaterThan(20);
    }
  });

  it('keeps each category in one contiguous sector', () => {
    const pos = radialLayout(TECH_COMPANIES, DEFAULT_HUB, W, H);
    const byAngle = TECH_COMPANIES.filter((c) => c.id !== DEFAULT_HUB)
      .sort((a, b) => pos[a.id].angle - pos[b.id].angle)
      .map((c) => c.category);
    const runs = byAngle.filter((cat, i) => i === 0 || cat !== byAngle[i - 1]);
    expect(new Set(runs).size).toBe(runs.length);
  });

  it('anchors labels away from the centre', () => {
    const pos = radialLayout(TECH_COMPANIES, DEFAULT_HUB, W, H);
    for (const p of Object.values(pos)) {
      if (p.anchor === 'start') expect(p.x).toBeGreaterThan(W / 2);
      if (p.anchor === 'end') expect(p.x).toBeLessThan(W / 2);
    }
  });

  it('copes with a filtered subset and a missing hub', () => {
    const subset = TECH_COMPANIES.filter((c) => c.category === 'labs');
    const pos = radialLayout(subset, 'nvidia', W, H);
    expect(Object.keys(pos).length).toBe(subset.length);
    expect(radialLayout([], 'nvidia', W, H)).toEqual({});
  });
});

describe('graph helpers', () => {
  it('groups relations by direction and kind', () => {
    const g = groupRelations(TECH_LINKS, 'nvidia');
    expect(g.suppliesTo.some((r) => r.id === 'openai')).toBe(true);
    expect(g.buysFrom.some((r) => r.id === 'tsmc')).toBe(true);
    expect(g.investedIn.some((r) => r.id === 'openai')).toBe(true);
    const total = Object.values(g).reduce((s, list) => s + list.length, 0);
    expect(total).toBe(neighbours(TECH_LINKS, 'nvidia').length);
  });

  it('filters neighbours by link kind', () => {
    const all = neighbours(TECH_LINKS, 'nvidia');
    const supply = neighbours(TECH_LINKS, 'nvidia', ['supplies']);
    expect(supply.length).toBeGreaterThan(0);
    expect(supply.length).toBeLessThan(all.length);
    expect(supply.every((r) => r.kind === 'supplies')).toBe(true);
  });

  it('scales node radius on a clamped log scale', () => {
    expect(nodeRadius(null)).toBe(3.5);
    expect(nodeRadius(4200)).toBeGreaterThan(nodeRadius(100));
    expect(nodeRadius(100)).toBeGreaterThan(nodeRadius(5));
    expect(nodeRadius(1e9)).toBe(12);
  });

  it('ranks by value and revenue, dropping unknowns', () => {
    const byValue = rankBy(TECH_COMPANIES, 'value');
    expect(byValue.every((c) => c.valueUsdBn != null)).toBe(true);
    for (let i = 1; i < byValue.length; i++) expect(byValue[i - 1].valueUsdBn!).toBeGreaterThanOrEqual(byValue[i].valueUsdBn!);
    expect(rankBy(TECH_COMPANIES, 'revenue').every((c) => c.revenueUsdBn != null)).toBe(true);
  });

  it('totals by category and country without losing companies', () => {
    expect(categoryTotals(TECH_COMPANIES).reduce((s, t) => s + t.count, 0)).toBe(TECH_COMPANIES.length);
    const countries = countryTotals(TECH_COMPANIES);
    expect(countries.reduce((s, t) => s + t.count, 0)).toBe(TECH_COMPANIES.length);
    expect(countries[0].key).toBe('USA');
  });

  it('formats short names, money and colours', () => {
    expect(shortName({ id: 'micron', name: 'Micron Technology' })).toBe('Micron');
    expect(shortName({ id: 'alphabet', name: 'Alphabet (Google)' })).toBe('Google');
    expect(formatUsdBn(4200)).toBe('$4.2tn');
    expect(formatUsdBn(10000)).toBe('$10tn');
    expect(formatUsdBn(215.9)).toBe('$216bn');
    expect(formatUsdBn(14.5)).toBe('$14.5bn');
    expect(formatUsdBn(0.25)).toBe('$250m');
    expect(formatUsdBn(null)).toBe('n/a');
    expect(lighten('#000000', 1)).toBe('#ffffff');
    expect(lighten('#336699', 0)).toBe('#336699');
  });

  it('finds second-hand companies through real direct neighbours', () => {
    for (const hub of TECH_COMPANIES) {
      const direct = neighbourIds(TECH_LINKS, hub.id);
      const second = secondDegree(TECH_LINKS, hub.id);
      for (const [id, via] of Object.entries(second)) {
        expect(id, hub.id).not.toBe(hub.id);
        expect(direct.has(id), `${hub.id}:${id}`).toBe(false);
        expect(via.length).toBeGreaterThan(0);
        for (const v of via) {
          expect(direct.has(v), `${hub.id}:${id} via ${v}`).toBe(true);
          expect(neighbourIds(TECH_LINKS, v).has(id)).toBe(true);
        }
      }
      expect(direct.size + Object.keys(second).length, hub.id).toBeGreaterThan(0);
    }
  });

  it('respects the link-kind filter for second-hand companies', () => {
    const supplyOnly = secondDegree(TECH_LINKS, 'figure-ai', ['supplies']);
    const direct = neighbourIds(TECH_LINKS, 'figure-ai', ['supplies']);
    for (const [id, via] of Object.entries(supplyOnly)) {
      for (const v of via) {
        expect(direct.has(v)).toBe(true);
        expect(neighbourIds(TECH_LINKS, v, ['supplies']).has(id)).toBe(true);
      }
    }
    expect(Object.keys(secondDegree(TECH_LINKS, 'figure-ai')).length)
      .toBeGreaterThanOrEqual(Object.keys(supplyOnly).length);
  });

  it('parses the hub query parameter', () => {
    const ids = new Set(TECH_COMPANIES.map((c) => c.id));
    expect(parseHubParam('?hub=tsmc', ids)).toBe('tsmc');
    expect(parseHubParam('?x=1&hub=SK-HYNIX', ids)).toBe('sk-hynix');
    expect(parseHubParam('?hub=not-a-company', ids)).toBeNull();
    expect(parseHubParam('?hub=', ids)).toBeNull();
    expect(parseHubParam('', ids)).toBeNull();
  });

  it('matches search on name, short name and ticker', () => {
    expect(matchesQuery(COMPANY_BY_ID.nvidia, 'nvd')).toBe(true);
    expect(matchesQuery(COMPANY_BY_ID.alphabet, 'google')).toBe(true);
    expect(matchesQuery(COMPANY_BY_ID.nvidia, '   ')).toBe(false);
  });
});

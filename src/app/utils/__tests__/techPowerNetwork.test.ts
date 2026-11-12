import { describe, it, expect } from 'vitest';
import { AI_NETWORK } from '../../services/aiPowerNetwork';
import { COMMODITIES, LINK_KINDS } from '../../services/network/types';
import { TECH_NETWORK, TECH_SECTORS } from '../../services/techPowerNetwork';
import { COUNTRY_FLAGS } from '../../components/CountryFlag';
import { clusterKey, clusterLayout, neighbours, ringsFor, sectorTotals } from '../aiNetwork/network';

const { companies, companyById, links, chokepoints, categories } = TECH_NETWORK;

describe('Tech power network data', () => {
  it('has about 140 companies with unique ids', () => {
    const ids = companies.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(companies.length).toBeGreaterThanOrEqual(140);
  });

  it('contains every AI-network company, link and chokepoint (Tesla category may move to autos)', () => {
    for (const c of AI_NETWORK.companies) {
      const tech = companyById[c.id];
      expect(tech, c.id).toBeDefined();
      if (c.id === 'tesla') {
        expect(tech.category).toBe('autos');
        const { category: _ignored, ...restTech } = tech;
        const { category: _ignoredAi, ...restAi } = c;
        expect(restTech).toEqual(restAi);
      } else {
        expect(tech).toBe(c);
      }
    }
    for (const l of AI_NETWORK.links) expect(links).toContain(l);
    for (const cp of AI_NETWORK.chokepoints) expect(chokepoints).toContain(cp);
  });

  it('puts every category in exactly one sector and uses all of them', () => {
    const inSectors = TECH_SECTORS.flatMap((s) => s.categoryIds);
    expect(new Set(inSectors).size).toBe(inSectors.length);
    expect(new Set(inSectors)).toEqual(new Set(categories.map((c) => c.id)));
    expect(categories.length).toBe(24);
    expect(TECH_SECTORS.length).toBe(9);
    const used = new Set(companies.map((c) => c.category));
    for (const cat of categories) expect(used.has(cat.id), cat.id).toBe(true);
    for (const c of companies) expect(TECH_NETWORK.categoryById[c.category], c.id).toBeDefined();
  });

  it('orders categories by sector', () => {
    expect(categories.map((c) => c.id)).toEqual(TECH_SECTORS.flatMap((s) => s.categoryIds));
  });

  it('meets the profile bar for each tier', () => {
    for (const c of companies) {
      expect(c.oneLiner, c.id).toBeTruthy();
      expect(c.role, c.id).toBeTruthy();
      expect(c.sources.length, c.id).toBeGreaterThan(0);
      for (const s of c.sources) expect(s.url, c.id).toMatch(/^https:\/\//);
      if (c.revenueUsdBn != null) expect(c.revenueUsdBn, c.id).toBeGreaterThan(0);
      if (c.valueUsdBn != null) expect(c.valueUsdBn, c.id).toBeGreaterThan(0);
      expect(c.revenueBasis, c.id).toBeTruthy();
      expect(c.valueBasis, c.id).toBeTruthy();
      if (c.tier === 'brief') {
        expect(c.summary.length, c.id).toBe(1);
      } else {
        expect(c.summary.length, c.id).toBeGreaterThanOrEqual(2);
        expect(c.contributions.length, c.id).toBeGreaterThanOrEqual(3);
        expect(c.keyProducts.length, c.id).toBeGreaterThan(0);
      }
    }
  });

  it('mixes full and brief profiles', () => {
    const brief = companies.filter((c) => c.tier === 'brief').length;
    expect(brief).toBeGreaterThan(20);
    expect(companies.length - brief).toBeGreaterThan(80);
  });

  it('has a flag for every headquarters country', () => {
    for (const c of companies) expect(COUNTRY_FLAGS[c.hqCountry], `${c.id}:${c.hqCountry}`).toBeDefined();
  });

  it('only links companies that exist, with valid kinds and commodities', () => {
    const kinds = new Set(LINK_KINDS.map((k) => k.id));
    const commodities = new Set(COMMODITIES.map((k) => k.id));
    for (const l of links) {
      const key = `${l.source}->${l.target}`;
      expect(companyById[l.source], key).toBeDefined();
      expect(companyById[l.target], key).toBeDefined();
      expect(l.source, key).not.toBe(l.target);
      expect(kinds.has(l.kind), key).toBe(true);
      expect(l.note, key).toBeTruthy();
      if (l.commodity) expect(commodities.has(l.commodity), key).toBe(true);
    }
  });

  it('has no duplicate links of the same kind', () => {
    const keys = links.map((l) => `${l.source}|${l.target}|${l.kind}`);
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    expect(dupes).toEqual([]);
  });

  it('connects every company and tags enough commodity flows to filter on', () => {
    const orphans = companies.filter((c) => neighbours(links, c.id).length === 0).map((c) => c.id);
    expect(orphans).toEqual([]);
    const tagged = new Set(links.filter((l) => l.commodity).map((l) => l.commodity));
    expect(tagged.size).toBeGreaterThanOrEqual(8);
  });

  it('links each new industry into the AI stack', () => {
    const aiIds = new Set(AI_NETWORK.companies.map((c) => c.id));
    for (const c of companies.filter((x) => !aiIds.has(x.id))) {
      const sectorOfCat = (cat: string) => TECH_SECTORS.find((s) => s.categoryIds.includes(cat))!.id;
      expect(sectorOfCat(c.category), c.id).toBeTruthy();
    }
    const crossSector = links.filter((l) => {
      const a = TECH_SECTORS.find((s) => s.categoryIds.includes(companyById[l.source].category))!.id;
      const b = TECH_SECTORS.find((s) => s.categoryIds.includes(companyById[l.target].category))!.id;
      return a !== b;
    });
    expect(crossSector.length).toBeGreaterThan(150);
  });

  it('points every chokepoint at real holders or a holding country', () => {
    const ids = chokepoints.map((cp) => cp.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const cp of chokepoints) {
      for (const id of [...cp.holders, ...cp.dependents]) expect(companyById[id], `${cp.id}:${id}`).toBeDefined();
      expect(cp.holders.length > 0 || !!cp.holderCountry, cp.id).toBe(true);
      if (cp.holderCountry) expect(COUNTRY_FLAGS[cp.holderCountry], cp.id).toBeDefined();
      expect(cp.sharePct).toBeGreaterThan(0);
      expect(cp.sharePct).toBeLessThanOrEqual(100);
    }
  });

  it('defaults to a real hub and real quick picks', () => {
    expect(companyById[TECH_NETWORK.defaultHub]).toBeDefined();
    for (const id of TECH_NETWORK.quickPicks) expect(companyById[id], id).toBeDefined();
  });

  it('links every Mobility company into another sector', () => {
    const mobility = new Set(
      TECH_SECTORS.find((s) => s.id === 'mobility')!.categoryIds,
    );
    const sectorOf = (cat: string) => TECH_SECTORS.find((s) => s.categoryIds.includes(cat))!.id;
    for (const c of companies.filter((x) => mobility.has(x.category))) {
      const outside = links.some((l) => {
        const other = l.source === c.id ? l.target : l.target === c.id ? l.source : null;
        return other != null && sectorOf(companyById[other].category) !== 'mobility';
      });
      expect(outside, c.id).toBe(true);
    }
  });

  it('totals by sector without losing companies', () => {
    const totals = sectorTotals(companies, TECH_SECTORS, 'value');
    expect(totals.reduce((s, t) => s + t.count, 0)).toBe(companies.length);
    expect(totals.length).toBe(TECH_SECTORS.length);
  });
});

describe('clusterLayout', () => {
  const W = 1000;
  const H = 660;
  const ALL = TECH_SECTORS.map((s) => s.id);
  const sectorOf = (id: string) => TECH_SECTORS.find((s) => s.categoryIds.includes(companyById[id].category))!.id;

  function points(l: ReturnType<typeof clusterLayout>) {
    return [...Object.values(l.nodes), ...l.clusters];
  }
  function minPairDistance(pts: { x: number; y: number }[]): number {
    let min = Infinity;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) min = Math.min(min, Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y));
    }
    return min;
  }

  it('is deterministic', () => {
    expect(clusterLayout(companies, TECH_SECTORS, ['energy'], 'tsmc', W, H))
      .toEqual(clusterLayout(companies, TECH_SECTORS, ['energy'], 'tsmc', W, H));
  });

  it('always expands the hub sector and folds the rest into bubbles', () => {
    for (const hub of ['microsoft', 'constellation', 'visa', 'linde', 'softbank']) {
      const l = clusterLayout(companies, TECH_SECTORS, [], hub, W, H);
      expect(l.expanded.has(sectorOf(hub)), hub).toBe(true);
      expect(l.nodes[hub]).toMatchObject({ x: W / 2, y: H / 2 });
      expect(l.clusters.length, hub).toBe(TECH_SECTORS.length - 1);
      for (const c of companies) {
        if (c.id === hub) continue;
        const expected = sectorOf(c.id) === sectorOf(hub) ? c.id : clusterKey(sectorOf(c.id));
        expect(l.anchorOf[c.id], `${hub}:${c.id}`).toBe(expected);
      }
    }
  });

  it('places every company exactly once when all sectors are expanded', () => {
    const l = clusterLayout(companies, TECH_SECTORS, ALL, 'microsoft', W, H);
    expect(l.clusters).toEqual([]);
    expect(Object.keys(l.nodes).length).toBe(companies.length);
    expect(l.rings.length).toBe(ringsFor(companies.length).length);
    expect(l.rings.length).toBeGreaterThanOrEqual(4);
  });

  it('keeps nodes apart collapsed and expanded, for every hub', () => {
    for (const c of companies) {
      expect(minPairDistance(points(clusterLayout(companies, TECH_SECTORS, [], c.id, W, H))), `${c.id} collapsed`).toBeGreaterThan(20);
      expect(minPairDistance(points(clusterLayout(companies, TECH_SECTORS, ALL, c.id, W, H))), `${c.id} expanded`).toBeGreaterThan(14);
    }
  });

  it('keeps everything inside the canvas', () => {
    for (const expanded of [[], ALL]) {
      for (const p of points(clusterLayout(companies, TECH_SECTORS, expanded, 'nvidia', W, H))) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(W);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(H);
      }
    }
  });

  it('uses three rings for small views and more for large ones', () => {
    expect(ringsFor(59).length).toBe(3);
    expect(ringsFor(70).length).toBe(3);
    expect(ringsFor(90).length).toBe(4);
    expect(ringsFor(125).length).toBe(5);
    expect(ringsFor(companies.length).length).toBeGreaterThanOrEqual(5);
  });
});

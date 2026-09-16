import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  DATA_SOURCES,
  CATEGORY_LABELS,
  isStale,
  type DataSourceEntry,
  type DataProvider,
} from '../dataProvenance';

// Which module is responsible for actually going out to the network for each
// provider. The guard below reads these files and fails if a provider is marked
// live while its module never makes an outbound call — the exact way the ITU and
// WIPO entries once claimed to be live while serving hardcoded tables.
const PROVIDER_FETCHERS: Partial<Record<DataProvider, string[]>> = {
  'World Bank': ['src/app/services/worldbank.ts', 'src/app/api/worldbank/route.ts'],
  FRED: ['src/app/api/fred/route.ts'],
  'BIS via FRED': ['src/app/api/fred/route.ts'],
  BIS: ['src/app/api/bis/route.ts', 'src/app/api/_lib/bisClient.ts'],
  OECD: ['src/app/api/oecd/route.ts'],
  EIA: ['src/app/api/eia/route.ts'],
  Frankfurter: ['src/app/api/frankfurter/route.ts'],
  Eurostat: ['src/app/api/eurostat/route.ts'],
  IMF: ['src/app/api/imf-weo/route.ts'],
  UN: ['src/app/services/tradeData.ts'],
  ITU: ['src/app/api/itu/route.ts'],
  WIPO: ['src/app/api/wipo/route.ts'],
  UNESCO: ['src/app/api/unesco/route.ts'],
};

const OUTBOUND_CALL = /(axios\s*\.\s*(get|post|request)\s*\(|await\s+fetch\s*\()/;

function makesOutboundCall(relPath: string): boolean {
  const full = resolve(process.cwd(), relPath);
  if (!existsSync(full)) return false;
  return OUTBOUND_CALL.test(readFileSync(full, 'utf8'));
}

describe('dataProvenance registry', () => {
  it('has a non-empty registry', () => {
    expect(Array.isArray(DATA_SOURCES)).toBe(true);
    expect(DATA_SOURCES.length).toBeGreaterThan(10);
  });

  it('assigns unique ids to every entry', () => {
    const ids = DATA_SOURCES.map(d => d.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('every entry has the required fields', () => {
    for (const entry of DATA_SOURCES) {
      expect(entry.id).toBeTruthy();
      expect(entry.name).toBeTruthy();
      expect(entry.category).toBeTruthy();
      expect(entry.provider).toBeTruthy();
      expect(entry.refreshCadence).toBeTruthy();
      expect(typeof entry.live).toBe('boolean');
      expect(entry.lastUpdated).toBeTruthy();
    }
  });

  it('every category referenced in the registry has a label', () => {
    for (const entry of DATA_SOURCES) {
      expect(CATEGORY_LABELS[entry.category]).toBeTruthy();
    }
  });

  it('curated entries carry ISO-formatted lastUpdated stamps', () => {
    for (const entry of DATA_SOURCES) {
      if (!entry.live) {
        // Should be a parseable date, not 'live'.
        expect(entry.lastUpdated).not.toBe('live');
        expect(Number.isNaN(Date.parse(entry.lastUpdated))).toBe(false);
      }
    }
  });

  it('never marks a curated-provider entry as live', () => {
    const contradictions = DATA_SOURCES.filter(e => e.provider === 'Curated' && e.live);
    expect(contradictions.map(e => e.id)).toEqual([]);
  });

  it('declares a fetcher module for every provider that has a live entry', () => {
    const liveProviders = [...new Set(DATA_SOURCES.filter(e => e.live).map(e => e.provider))];
    const undeclared = liveProviders.filter(p => !PROVIDER_FETCHERS[p]?.length);
    expect(undeclared).toEqual([]);
  });

  it('only marks an entry live when its provider really performs an outbound fetch', () => {
    const liars = DATA_SOURCES.filter(entry => {
      if (!entry.live) return false;
      const modules = PROVIDER_FETCHERS[entry.provider] ?? [];
      return !modules.some(makesOutboundCall);
    }).map(e => `${e.id} (${e.provider})`);

    expect(liars).toEqual([]);
  });

  it('resolves every declared fetcher module to a file that exists', () => {
    const missing = Object.entries(PROVIDER_FETCHERS)
      .flatMap(([, paths]) => paths ?? [])
      .filter(p => !existsSync(resolve(process.cwd(), p)));
    expect(missing).toEqual([]);
  });

  describe('isStale', () => {
    const makeEntry = (overrides: Partial<DataSourceEntry>): DataSourceEntry => ({
      id: 'test',
      name: 'Test',
      category: 'macro',
      provider: 'World Bank',
      refreshCadence: 'annual',
      live: false,
      lastUpdated: '2000-01-01',
      ...overrides,
    });

    it('never marks live entries as stale', () => {
      const entry = makeEntry({ live: true, lastUpdated: 'live' });
      expect(isStale(entry)).toBe(false);
    });

    it('marks old curated entries as stale', () => {
      const entry = makeEntry({ lastUpdated: '2000-01-01' });
      expect(isStale(entry, 12)).toBe(true);
    });

    it('returns false for freshly curated entries', () => {
      const today = new Date().toISOString().slice(0, 10);
      const entry = makeEntry({ lastUpdated: today });
      expect(isStale(entry, 12)).toBe(false);
    });

    it('returns false when lastUpdated cannot be parsed', () => {
      const entry = makeEntry({ lastUpdated: 'not-a-date' });
      expect(isStale(entry)).toBe(false);
    });
  });
});

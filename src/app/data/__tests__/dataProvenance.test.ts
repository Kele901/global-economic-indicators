import { describe, it, expect } from 'vitest';
import {
  DATA_SOURCES,
  CATEGORY_LABELS,
  isStale,
  type DataSourceEntry,
} from '../dataProvenance';

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

import { describe, it, expect } from 'vitest';
import { CLIMATE_COUNTRY_META, NDC_2035_TARGETS } from '../climateCurated';
import { COUNTRY_NAMES } from '../worldbank';

const wbKeys = new Set(Object.values(COUNTRY_NAMES));

describe('climateCurated roster consistency', () => {
  it('every CLIMATE_COUNTRY_META.wbKey exists in worldbank COUNTRY_NAMES', () => {
    const drifted = CLIMATE_COUNTRY_META
      .filter(m => !wbKeys.has(m.wbKey))
      .map(m => `${m.iso3} → wbKey "${m.wbKey}"`);
    expect(drifted).toEqual([]);
  });

  it('every NDC target country uses a valid worldbank key', () => {
    const drifted = NDC_2035_TARGETS
      .filter(t => !wbKeys.has(t.country))
      .map(t => `${t.countryLabel} → country "${t.country}"`);
    expect(drifted).toEqual([]);
  });

  it('assigns unique iso3 codes across the roster', () => {
    const iso3s = CLIMATE_COUNTRY_META.map(m => m.iso3);
    expect(new Set(iso3s).size).toBe(iso3s.length);
  });

  it('each meta row has a hex colour value', () => {
    for (const meta of CLIMATE_COUNTRY_META) {
      expect(meta.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

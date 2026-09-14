import { describe, it, expect } from 'vitest';
import {
  COUNTRY_KEYS,
  COUNTRY_SLUGS,
  COUNTRY_KEY_TO_SLUG,
  COUNTRY_DISPLAY_NAMES,
  COUNTRY_ISO2,
  COUNTRY_ISO3,
  COUNTRY_ISO_NUMERIC,
  COUNTRY_COLORS,
  COUNTRY_REGIONS,
  REGION_ORDER,
  DEFAULT_DASHBOARD_SELECTION,
  CURATED_ONLY_COUNTRIES,
  type CountryKey,
} from '../countryMappings';
import { COUNTRY_CODES, COUNTRY_NAMES } from '../../services/worldbank';
import { DEBT_COUNTRY_META } from '../../services/debtCurated';
import { AI_COUNTRY_META } from '../../services/aiCurated';
import { MIGRATION_COUNTRY_META } from '../../services/migrationCurated';
import { TRADE_COUNTRY_META } from '../../services/tradeCurated';
import { CLIMATE_COUNTRY_META } from '../../services/climateCurated';
import { DEFENSE_COUNTRY_META } from '../../services/defenseCurated';
import { HEALTH_COUNTRY_META } from '../../services/healthCurated';
import { ENERGY_COUNTRY_META } from '../../services/energyCurated';
import { LABOR_COUNTRY_META } from '../../services/laborCurated';
import { INEQUALITY_NAME_TO_WB_KEY } from '../../data/inequalityData';

const fetchedKeys = new Set(Object.values(COUNTRY_NAMES));
const curatedOnly = new Set(Object.keys(CURATED_ONLY_COUNTRIES));
const knownIso3 = new Set(Object.values(COUNTRY_ISO3));

// Ledgers that join curated rows to live World Bank columns by wbKey. A key that
// is not fetched means every row for that country is silently dropped, which is
// how Greece, Taiwan and the Philippines disappeared from three ledgers.
const WB_KEYED_METAS: Array<[string, Array<{ iso3: string; wbKey: string }>]> = [
  ['DEBT_COUNTRY_META', DEBT_COUNTRY_META],
  ['AI_COUNTRY_META', AI_COUNTRY_META],
  ['MIGRATION_COUNTRY_META', MIGRATION_COUNTRY_META],
  ['TRADE_COUNTRY_META', TRADE_COUNTRY_META],
  ['CLIMATE_COUNTRY_META', CLIMATE_COUNTRY_META],
  ['DEFENSE_COUNTRY_META', DEFENSE_COUNTRY_META],
];

const ISO3_KEYED_METAS: Array<[string, Array<{ code: string }>]> = [
  ['HEALTH_COUNTRY_META', HEALTH_COUNTRY_META],
  ['ENERGY_COUNTRY_META', ENERGY_COUNTRY_META],
  ['LABOR_COUNTRY_META', LABOR_COUNTRY_META],
];

describe('canonical country roster', () => {
  it('matches the World Bank fetch roster exactly', () => {
    const canonical = [...COUNTRY_KEYS].sort();
    const fetched = [...fetchedKeys].sort();
    expect(canonical).toEqual(fetched);
  });

  it('requests one ISO-2 code per canonical country', () => {
    expect(new Set(COUNTRY_CODES).size).toBe(COUNTRY_CODES.length);
    const fromMappings = [...COUNTRY_KEYS].map(k => COUNTRY_ISO2[k]).sort();
    expect(fromMappings).toEqual([...COUNTRY_CODES].sort());
  });

  it('gives every country a complete set of attributes', () => {
    const incomplete = COUNTRY_KEYS.filter(
      k =>
        !COUNTRY_KEY_TO_SLUG[k] ||
        !COUNTRY_DISPLAY_NAMES[k] ||
        !COUNTRY_ISO2[k] ||
        !COUNTRY_ISO3[k] ||
        !COUNTRY_ISO_NUMERIC[k] ||
        !COUNTRY_COLORS[k],
    );
    expect(incomplete).toEqual([]);
  });

  it('places every country in exactly one region', () => {
    const misplaced = COUNTRY_KEYS.filter(k => {
      const hits = REGION_ORDER.filter(r => COUNTRY_REGIONS[r].includes(k));
      return hits.length !== 1;
    });
    expect(misplaced).toEqual([]);
  });

  it('lists no unknown country inside a region', () => {
    const strays = REGION_ORDER.flatMap(r =>
      COUNTRY_REGIONS[r].filter(k => !COUNTRY_KEYS.includes(k)).map(k => `${r}: ${k}`),
    );
    expect(strays).toEqual([]);
  });

  it('round-trips every slug', () => {
    const broken = COUNTRY_KEYS.filter(k => COUNTRY_SLUGS[COUNTRY_KEY_TO_SLUG[k]] !== k);
    expect(broken).toEqual([]);
  });

  it('resolves every slug alias to a real country', () => {
    const unresolved = Object.entries(COUNTRY_SLUGS)
      .filter(([, key]) => !COUNTRY_KEYS.includes(key))
      .map(([slug]) => slug);
    expect(unresolved).toEqual([]);
  });

  it('assigns a distinct colour to every country', () => {
    const colours = COUNTRY_KEYS.map(k => COUNTRY_COLORS[k]);
    const duplicates = colours.filter((c, i) => colours.indexOf(c) !== i);
    expect(duplicates).toEqual([]);
  });

  it('defaults to countries that are actually in the roster', () => {
    const unknown = DEFAULT_DASHBOARD_SELECTION.filter(k => !COUNTRY_KEYS.includes(k));
    expect(unknown).toEqual([]);
  });

  it('keeps curated-only countries out of the fetch roster', () => {
    const leaked = [...curatedOnly].filter(k => fetchedKeys.has(k));
    expect(leaked).toEqual([]);
  });
});

describe('ledger roster drift', () => {
  it.each(WB_KEYED_METAS)('%s joins only on fetched or curated-only keys', (_name, meta) => {
    const drifted = meta
      .filter(m => !fetchedKeys.has(m.wbKey) && !curatedOnly.has(m.wbKey))
      .map(m => `${m.iso3} -> wbKey "${m.wbKey}"`);
    expect(drifted).toEqual([]);
  });

  it.each(WB_KEYED_METAS)('%s uses unique iso3 codes', (_name, meta) => {
    const iso3s = meta.map(m => m.iso3);
    expect(new Set(iso3s).size).toBe(iso3s.length);
  });

  it.each(ISO3_KEYED_METAS)('%s uses ISO-3 codes the roster recognises', (_name, meta) => {
    const unknown = meta
      .filter(m => !knownIso3.has(m.code) && m.code !== 'TWN')
      .map(m => m.code);
    expect(unknown).toEqual([]);
  });
});

describe('inequality display-name bridge', () => {
  it('maps every display name to a real wbKey', () => {
    const broken = Object.entries(INEQUALITY_NAME_TO_WB_KEY)
      .filter(([, wbKey]) => !fetchedKeys.has(wbKey as CountryKey))
      .map(([name, wbKey]) => `${name} -> ${wbKey}`);
    expect(broken).toEqual([]);
  });
});

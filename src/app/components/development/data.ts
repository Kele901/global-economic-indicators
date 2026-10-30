import type { CountryData } from '../../services/worldbank';
import { COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { HDR, latestObs, undpHdi, type HdrRecord } from '../../services/developmentCurated';
import type { DevAlias, DevData } from '../../development/useDevelopmentData';
import type { RankRow } from './charts';

export interface ChapterProps {
  isDarkMode: boolean;
  selected: CountryKey[];
  onSelectedChange: (keys: CountryKey[]) => void;
}

export function latestRows(series: CountryData[] | undefined, minYear = 0): RankRow[] {
  const out: RankRow[] = [];
  for (const key of COUNTRY_KEYS) {
    const o = latestObs(series, key, minYear);
    if (o) out.push({ key, value: o.value, year: o.year });
  }
  return out;
}

export function hdrRows(pick: (r: HdrRecord) => number | null): RankRow[] {
  const out: RankRow[] = [];
  for (const key of COUNTRY_KEYS) {
    const r = HDR[key];
    const v = r ? pick(r) : null;
    if (v != null) out.push({ key, value: v });
  }
  return out;
}

export function hdrDimensions(key: CountryKey) {
  const r = HDR[key];
  if (!r || r.lifeExpectancy == null || r.expectedSchooling == null || r.meanSchooling == null || r.gniPerCapita == null) return null;
  return undpHdi({
    lifeExpectancy: r.lifeExpectancy,
    expectedSchooling: r.expectedSchooling,
    meanSchooling: r.meanSchooling,
    gniPerCapita: r.gniPerCapita,
  });
}

export function hdiTrendDelta(key: CountryKey, from: number, to = 2023): number | null {
  const t = HDR[key]?.trend;
  if (!t) return null;
  const a = t[String(from)];
  const b = t[String(to)];
  return a != null && b != null ? b - a : null;
}

export function pairRows(data: DevData, xa: DevAlias, ya: DevAlias) {
  return COUNTRY_KEYS.map((k) => {
    const x = latestObs(data[xa], k);
    const y = latestObs(data[ya], k);
    return x && y ? { key: k, x: x.value, y: y.value } : null;
  }).filter((r): r is NonNullable<typeof r> => r !== null);
}

export function rowsToCsv(series: Record<string, CountryData[] | undefined>, keys: readonly CountryKey[] = COUNTRY_KEYS) {
  const rows: Record<string, unknown>[] = [];
  for (const [name, s] of Object.entries(series)) {
    for (const key of keys) {
      const o = latestObs(s, key);
      if (o) rows.push({ series: name, country: key, year: o.year, value: o.value });
    }
  }
  return rows;
}

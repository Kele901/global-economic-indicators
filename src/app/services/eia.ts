import axios from "axios";
import { clientCache } from "./clientCache";
import {
  STATIC_OIL_RESERVES_2024,
  STATIC_OIL_PRODUCTION_2024,
  STATIC_NATURAL_GAS_RESERVES_2024,
  STATIC_COAL_RESERVES_2024,
  type CountryResourceValue,
} from "../data/resourceStaticData";

// EIA (U.S. Energy Information Administration) client.
// If /api/eia responds 501 (no key configured) or otherwise fails, this
// module transparently falls back to the curated 2024 seed dataset in
// resourceStaticData.ts so the Resource Atlas page always renders.

export interface ReservesSnapshot {
  source: 'EIA' | 'STATIC';
  year: number;
  unit: string;
  data: CountryResourceValue[];
}

export interface ProductionSnapshot {
  source: 'EIA' | 'STATIC';
  year: number;
  unit: string;
  data: CountryResourceValue[];
}

// Try to fetch the EIA international-energy dataset for a given activity /
// product / unit combination. Returns null if the endpoint is unavailable
// (missing key, network error, empty response).
async function tryFetchEIA(params: Record<string, string | string[]>): Promise<any | null> {
  const search = new URLSearchParams();
  search.append('path', 'international/data');
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach(v => search.append(key, v));
    else search.append(key, value);
  });

  try {
    const response = await axios.get(`/api/eia?${search.toString()}`, { timeout: 15000 });
    if (!response.data?.response?.data) return null;
    return response.data.response.data;
  } catch (error: any) {
    // 501 = no key configured; anything else logged as a genuine failure.
    if (error.response?.status !== 501) {
      console.warn('⚠️ EIA fetch failed, using static fallback:', error.message);
    } else {
      console.info('ℹ️ EIA_API_KEY not configured, using static seed data');
    }
    return null;
  }
}

// Crude oil proven reserves (billion barrels). EIA activityId 6 (reserves)
// with productId 55 (crude oil). Static seed reflects BP Statistical Review /
// EIA International Energy Statistics end-of-2024 values.
export async function fetchOilReserves(): Promise<ReservesSnapshot> {
  const cacheKey = 'eia_oil_reserves';
  const cached = clientCache.get<ReservesSnapshot>(cacheKey);
  if (cached) return cached;

  const eiaData = await tryFetchEIA({
    frequency: 'annual',
    'data[]': 'value',
    'facets[activityId][]': '6',
    'facets[productId][]': '55',
    'facets[unit][]': 'BB',
    'sort[0][column]': 'period',
    'sort[0][direction]': 'desc',
    length: '500',
  });

  let snapshot: ReservesSnapshot;
  if (eiaData && Array.isArray(eiaData) && eiaData.length > 0) {
    const latestYear = Math.max(...eiaData.map((r: any) => parseInt(r.period)));
    const rows = eiaData.filter((r: any) => parseInt(r.period) === latestYear);
    const data: CountryResourceValue[] = rows
      .filter((r: any) => r.value != null && r.countryRegionName && !r.countryRegionId?.startsWith('WORL'))
      .map((r: any) => ({
        country: r.countryRegionName,
        iso: r.countryRegionId,
        value: parseFloat(r.value),
      }))
      .filter((r: CountryResourceValue) => !isNaN(r.value) && r.value > 0);
    snapshot = { source: 'EIA', year: latestYear, unit: 'billion barrels', data };
  } else {
    snapshot = { source: 'STATIC', year: 2024, unit: 'billion barrels', data: STATIC_OIL_RESERVES_2024 };
  }

  clientCache.set(cacheKey, snapshot, 1000 * 60 * 60 * 24);
  return snapshot;
}

// Crude oil production (thousand barrels per day).
export async function fetchOilProduction(): Promise<ProductionSnapshot> {
  const cacheKey = 'eia_oil_production';
  const cached = clientCache.get<ProductionSnapshot>(cacheKey);
  if (cached) return cached;

  const eiaData = await tryFetchEIA({
    frequency: 'annual',
    'data[]': 'value',
    'facets[activityId][]': '1',
    'facets[productId][]': '55',
    'facets[unit][]': 'TBPD',
    'sort[0][column]': 'period',
    'sort[0][direction]': 'desc',
    length: '500',
  });

  let snapshot: ProductionSnapshot;
  if (eiaData && Array.isArray(eiaData) && eiaData.length > 0) {
    const latestYear = Math.max(...eiaData.map((r: any) => parseInt(r.period)));
    const rows = eiaData.filter((r: any) => parseInt(r.period) === latestYear);
    const data: CountryResourceValue[] = rows
      .filter((r: any) => r.value != null && r.countryRegionName && !r.countryRegionId?.startsWith('WORL'))
      .map((r: any) => ({
        country: r.countryRegionName,
        iso: r.countryRegionId,
        value: parseFloat(r.value),
      }))
      .filter((r: CountryResourceValue) => !isNaN(r.value) && r.value > 0);
    snapshot = { source: 'EIA', year: latestYear, unit: 'thousand barrels/day', data };
  } else {
    snapshot = { source: 'STATIC', year: 2024, unit: 'thousand barrels/day', data: STATIC_OIL_PRODUCTION_2024 };
  }

  clientCache.set(cacheKey, snapshot, 1000 * 60 * 60 * 24);
  return snapshot;
}

// Natural gas + coal reserves fall through to static data in v1 (they use
// different EIA endpoints/units and are not wired live yet).
export async function fetchNaturalGasReserves(): Promise<ReservesSnapshot> {
  return {
    source: 'STATIC',
    year: 2024,
    unit: 'trillion cubic feet',
    data: STATIC_NATURAL_GAS_RESERVES_2024,
  };
}

export async function fetchCoalReserves(): Promise<ReservesSnapshot> {
  return {
    source: 'STATIC',
    year: 2024,
    unit: 'million short tons',
    data: STATIC_COAL_RESERVES_2024,
  };
}

export function clearEIACache(): void {
  clientCache.delete('eia_oil_reserves');
  clientCache.delete('eia_oil_production');
  console.log('✅ Cleared EIA cached data');
}

// Extra series for the /inflation chapters, layered on existing plumbing. Each
// helper is called from a lazy chapter so the first page load only pulls
// fetchGlobalData.

import { clientCache } from './clientCache';
import { fetchExtraIndicators, type CountryData } from './worldbank';
import { fetchAllPolicyRates } from './policyRates';
import { policyRatesToRows } from '../utils/inflation/realRates';
import { annualAverages, type Obs } from '../utils/inflation/stats';

const DAY = 1000 * 60 * 60 * 24;

export async function fetchInflationDrivers(): Promise<{ broadMoney: CountryData[]; gdpDeflator: CountryData[] }> {
  const res = await fetchExtraIndicators({ broadMoney: 'FM.LBL.BMNY.ZG', gdpDeflator: 'NY.GDP.DEFL.KD.ZG' });
  return { broadMoney: res.broadMoney ?? [], gdpDeflator: res.gdpDeflator ?? [] };
}

export async function fetchPolicyRateRows(): Promise<CountryData[]> {
  return policyRatesToRows(await fetchAllPolicyRates());
}

async function fetchFredAnnual(seriesId: string, start = '1980-01-01'): Promise<Obs[]> {
  const cacheKey = `inflation_fred_${seriesId}`;
  const cached = clientCache.get<Obs[]>(cacheKey);
  if (cached) return cached;
  const res = await fetch(`/api/fred?series_id=${seriesId}&observation_start=${start}`);
  if (!res.ok) throw new Error(`FRED ${seriesId}: ${res.status}`);
  const json = await res.json();
  const out = annualAverages(json?.observations);
  if (out.length) clientCache.set(cacheKey, out, DAY);
  return out;
}

export async function fetchCommodityShocks(): Promise<{ oil: Obs[]; food: Obs[] }> {
  const [oil, food] = await Promise.allSettled([fetchFredAnnual('POILBREUSDA'), fetchFredAnnual('PFOODINDEXM')]);
  return {
    oil: oil.status === 'fulfilled' ? oil.value : [],
    food: food.status === 'fulfilled' ? food.value : [],
  };
}

export interface WeoInflation {
  /** Country key (or IMF code for aggregates) to { year: value }. */
  byCountry: Record<string, Record<number, number>>;
  edition: string | null;
}

export async function fetchImfInflationForecast(): Promise<WeoInflation> {
  const cacheKey = 'inflation_imf_weo';
  const cached = clientCache.get<WeoInflation>(cacheKey);
  if (cached) return cached;
  const res = await fetch('/api/imf-weo?metric=inflation');
  if (!res.ok) throw new Error(`IMF WEO: ${res.status}`);
  const json = await res.json();
  const byCountry: WeoInflation['byCountry'] = {};
  for (const d of json?.data ?? []) {
    if (d?.country && d?.values) byCountry[d.country] = d.values;
  }
  const out = { byCountry, edition: json?.weoInfo?.lastUpdate ?? null };
  if (Object.keys(byCountry).length) clientCache.set(cacheKey, out, DAY);
  return out;
}

import axios from "axios";
import { clientCache } from "./clientCache";

// FRED-hosted commodity price series.
// All series are dollar-denominated. Frequency varies (daily / monthly) but the
// fetcher aggregates observations into annual averages so downstream callers
// can treat every series identically.
//
// Sources:
//   - Oil (WTI, Brent): EIA via FRED
//   - Natural gas: EIA (Henry Hub) via FRED, IMF (EU import) via FRED
//   - Metals: IMF Primary Commodity Price System via FRED
//   - Precious: LBMA (gold) via FRED
export interface CommoditySeriesMeta {
  id: string;
  label: string;
  unit: string;
  seriesId: string;
  category: 'energy' | 'metals' | 'agriculture';
  color: string;
}

export const COMMODITY_SERIES: CommoditySeriesMeta[] = [
  // Energy
  { id: 'wti', label: 'WTI Crude Oil', unit: '$/barrel', seriesId: 'DCOILWTICO', category: 'energy', color: '#0f172a' },
  { id: 'brent', label: 'Brent Crude Oil', unit: '$/barrel', seriesId: 'DCOILBRENTEU', category: 'energy', color: '#334155' },
  { id: 'henryHub', label: 'Natural Gas (Henry Hub)', unit: '$/MMBtu', seriesId: 'DHHNGSP', category: 'energy', color: '#0891b2' },
  { id: 'euGas', label: 'Natural Gas (EU Import)', unit: '$/MMBtu', seriesId: 'PNGASEUUSDM', category: 'energy', color: '#0e7490' },
  { id: 'coal', label: 'Coal (Australia)', unit: '$/tonne', seriesId: 'PCOALAUUSDM', category: 'energy', color: '#1c1917' },

  // Metals
  { id: 'gold', label: 'Gold (LBMA AM Fix)', unit: '$/troy oz', seriesId: 'GOLDAMGBD228NLBM', category: 'metals', color: '#d4af37' },
  { id: 'copper', label: 'Copper', unit: '$/tonne', seriesId: 'PCOPPUSDM', category: 'metals', color: '#b45309' },
  { id: 'aluminium', label: 'Aluminium', unit: '$/tonne', seriesId: 'PALUMUSDM', category: 'metals', color: '#94a3b8' },
  { id: 'ironOre', label: 'Iron Ore', unit: '$/tonne', seriesId: 'PIORECRUSDM', category: 'metals', color: '#78350f' },
  { id: 'nickel', label: 'Nickel', unit: '$/tonne', seriesId: 'PNICKUSDM', category: 'metals', color: '#64748b' },

  // Agriculture
  { id: 'wheat', label: 'Wheat', unit: '$/tonne', seriesId: 'PWHEAMTUSDM', category: 'agriculture', color: '#ca8a04' },
];

export interface CommodityDataPoint {
  year: number;
  value: number;
}

export interface CommodityObservation {
  date: string;
  value: number;
}

export interface CommodityHistory {
  meta: CommoditySeriesMeta;
  annual: CommodityDataPoint[];
  latest: CommodityObservation | null;
  latestPrior: CommodityObservation | null; // one observation before latest, for daily/monthly delta
  ytdStart: CommodityObservation | null; // first observation of current calendar year
  // Last ~30 observations for the inline ticker sparkline. Optional so that
  // legacy cached objects (pre-v20) still deserialize cleanly and only lose
  // the sparkline, not the whole ticker row.
  sparkline?: CommodityObservation[];
}

// Small concurrency limiter — FRED sits behind Akamai edge protection that
// starts returning 403 when we burst too many concurrent requests, so run
// fetches in chunks rather than all-at-once.
async function chunkedParallel<T, R>(
  items: T[],
  chunkSize: number,
  worker: (item: T) => Promise<R>,
  delayBetweenChunksMs = 150,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.allSettled(chunk.map(worker));
    results.push(...chunkResults);
    if (i + chunkSize < items.length && delayBetweenChunksMs > 0) {
      await new Promise(r => setTimeout(r, delayBetweenChunksMs));
    }
  }
  return results;
}

// Fetch a single FRED commodity series and return raw observations sorted ascending
async function fetchRawObservations(
  seriesId: string,
  startDate: string = '1980-01-01',
  endDate: string = '2026-12-31'
): Promise<CommodityObservation[]> {
  const url = `/api/fred?series_id=${seriesId}&observation_start=${startDate}&observation_end=${endDate}`;
  const response = await axios.get(url, { timeout: 15000 });
  if (!response.data?.observations) return [];
  const obs: CommodityObservation[] = [];
  response.data.observations.forEach((o: any) => {
    const v = parseFloat(o.value);
    if (!isNaN(v) && o.value !== '.') obs.push({ date: o.date, value: v });
  });
  obs.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return obs;
}

// Fetch a commodity series with caching, returning both annualised history
// and enough recent observations to compute daily / YTD deltas for the ticker.
async function fetchCommodityHistory(meta: CommoditySeriesMeta): Promise<CommodityHistory | null> {
  try {
    const cacheKey = `commodity_${meta.id}`;
    const cached = clientCache.get<CommodityHistory>(cacheKey);
    if (cached) {
      console.log(`✅ Using cached commodity data for ${meta.label}`);
      return cached;
    }

    console.log(`🛢️ Fetching commodity ${meta.label} (${meta.seriesId})...`);
    const obs = await fetchRawObservations(meta.seriesId);

    if (obs.length === 0) {
      console.warn(`⚠️ No commodity data for ${meta.label}`);
      return null;
    }

    // Annual averages
    const yearlyData: { [year: number]: number[] } = {};
    obs.forEach(({ date, value }) => {
      const year = parseInt(date.split('-')[0]);
      if (!yearlyData[year]) yearlyData[year] = [];
      yearlyData[year].push(value);
    });
    const annual: CommodityDataPoint[] = Object.entries(yearlyData)
      .map(([year, values]) => ({
        year: parseInt(year),
        value: values.reduce((s, v) => s + v, 0) / values.length,
      }))
      .sort((a, b) => a.year - b.year);

    const latest = obs[obs.length - 1] ?? null;
    const latestPrior = obs.length >= 2 ? obs[obs.length - 2] : null;
    const currentYear = latest ? parseInt(latest.date.split('-')[0]) : new Date().getFullYear();
    const ytdStart = obs.find(o => parseInt(o.date.split('-')[0]) === currentYear) ?? null;
    const sparkline = obs.slice(-30);

    const history: CommodityHistory = {
      meta,
      annual,
      latest,
      latestPrior,
      ytdStart,
      sparkline,
    };

    clientCache.set(cacheKey, history, 1000 * 60 * 60 * 24);
    console.log(`✅ ${meta.label}: ${annual.length} years, latest ${latest?.date} = ${latest?.value.toFixed(2)}`);
    return history;
  } catch (error: any) {
    console.error(`❌ Error fetching commodity ${meta.label}:`, error.message);
    return null;
  }
}

// Fetch every configured commodity series and return a keyed map.
// Fetches are chunked (3 concurrent) with a small pause between chunks to avoid
// tripping FRED's Akamai edge protection.
export async function fetchAllCommodityPrices(): Promise<{ [id: string]: CommodityHistory }> {
  console.log('🛢️ ========================================');
  console.log('🛢️ Fetching Commodity Prices (FRED)...');
  console.log('🛢️ ========================================');

  const results = await chunkedParallel(COMMODITY_SERIES, 3, fetchCommodityHistory, 200);

  const out: { [id: string]: CommodityHistory } = {};
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      out[COMMODITY_SERIES[i].id] = r.value;
    }
  });

  console.log(`🛢️ Commodity prices fetched: ${Object.keys(out).length}/${COMMODITY_SERIES.length} series`);
  return out;
}

export function clearCommodityCache(): void {
  COMMODITY_SERIES.forEach(m => clientCache.delete(`commodity_${m.id}`));
  console.log('✅ Cleared commodity cached data');
}

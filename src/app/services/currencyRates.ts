import axios from "axios";
import { clientCache } from "./clientCache";

// FX rate service backed by two sources:
//   - FRED daily H.10 series → historical depth (annual averages back to 1990, YTD start,
//     latest/prior baseline). H.10 typically publishes with a 1-2 business day lag.
//   - Frankfurter (ECB reference rates, no auth) → live-latest override (same-day rates)
//     + full 30-day sparkline data + coverage for pairs FRED lacks (PLN, TRY, ...).
//
// Cross-currency pairs (EUR/JPY, GBP/JPY, ...) are derived client-side from the two
// USD-legged constituents. Their sparklines come from Frankfurter using the identity
//   cross(A/B) = frankfurter[B_iso] / frankfurter[A_iso]  (when Frankfurter base = USD).

export type FxCategory = 'majors' | 'em' | 'crosses';
export type FxDirection = 'US_PER_FOREIGN' | 'FOREIGN_PER_USD';
export type FxLiveSource = 'FRED' | 'Frankfurter';

// Sentinel FRED series id for USD-legged pairs that FRED does not publish.
// The service uses Frankfurter as the sole source for these.
const FRED_NONE = 'FRANKFURTER_ONLY';

export interface CurrencyRateMeta {
  id: string;
  pair: string; // display, e.g. "EUR/USD"
  seriesId: string; // FRED series id, or FRED_NONE, or 'DERIVED' for cross pairs
  category: FxCategory;
  color: string;
  direction?: FxDirection; // present for USD-legged pairs, absent for crosses
  // For cross pairs: which USD-legged pair ids form the base and quote legs.
  baseLegId?: string;
  quoteLegId?: string;
  // ISO 4217 code(s) used for Frankfurter mapping.
  //  - USD-legged: `iso` is the non-USD currency (e.g. 'EUR' for EUR/USD)
  //  - crosses:    `baseIso` / `quoteIso` cover both legs
  iso?: string;
  baseIso?: string;
  quoteIso?: string;
}

// USD-legged pairs. Order controls display order in the ticker.
export const USD_FX_PAIRS: CurrencyRateMeta[] = [
  // Majors quoted as USD per foreign unit (value ~0.5 – 2.0)
  { id: 'eurusd', pair: 'EUR/USD', seriesId: 'DEXUSEU', category: 'majors', color: '#003399', direction: 'US_PER_FOREIGN', iso: 'EUR' },
  { id: 'gbpusd', pair: 'GBP/USD', seriesId: 'DEXUSUK', category: 'majors', color: '#012169', direction: 'US_PER_FOREIGN', iso: 'GBP' },
  { id: 'audusd', pair: 'AUD/USD', seriesId: 'DEXUSAL', category: 'majors', color: '#00008b', direction: 'US_PER_FOREIGN', iso: 'AUD' },
  { id: 'nzdusd', pair: 'NZD/USD', seriesId: 'DEXUSNZ', category: 'majors', color: '#0e2b63', direction: 'US_PER_FOREIGN', iso: 'NZD' },

  // Majors quoted as foreign per USD (value ~1 – 150)
  { id: 'usdjpy', pair: 'USD/JPY', seriesId: 'DEXJPUS', category: 'majors', color: '#bc002d', direction: 'FOREIGN_PER_USD', iso: 'JPY' },
  { id: 'usdchf', pair: 'USD/CHF', seriesId: 'DEXSZUS', category: 'majors', color: '#dc143c', direction: 'FOREIGN_PER_USD', iso: 'CHF' },
  { id: 'usdcad', pair: 'USD/CAD', seriesId: 'DEXCAUS', category: 'majors', color: '#d52b1e', direction: 'FOREIGN_PER_USD', iso: 'CAD' },

  // Scandinavia
  { id: 'usdnok', pair: 'USD/NOK', seriesId: 'DEXNOUS', category: 'majors', color: '#ba0c2f', direction: 'FOREIGN_PER_USD', iso: 'NOK' },
  { id: 'usdsek', pair: 'USD/SEK', seriesId: 'DEXSDUS', category: 'majors', color: '#006aa7', direction: 'FOREIGN_PER_USD', iso: 'SEK' },
  { id: 'usddkk', pair: 'USD/DKK', seriesId: 'DEXDNUS', category: 'majors', color: '#c8102e', direction: 'FOREIGN_PER_USD', iso: 'DKK' },

  // Emerging market / Asia (all foreign per USD)
  { id: 'usdcny', pair: 'USD/CNY', seriesId: 'DEXCHUS',     category: 'em', color: '#de2910', direction: 'FOREIGN_PER_USD', iso: 'CNY' },
  { id: 'usdinr', pair: 'USD/INR', seriesId: 'DEXINUS',     category: 'em', color: '#ff9933', direction: 'FOREIGN_PER_USD', iso: 'INR' },
  { id: 'usdbrl', pair: 'USD/BRL', seriesId: 'DEXBZUS',     category: 'em', color: '#009c3b', direction: 'FOREIGN_PER_USD', iso: 'BRL' },
  { id: 'usdmxn', pair: 'USD/MXN', seriesId: 'DEXMXUS',     category: 'em', color: '#006847', direction: 'FOREIGN_PER_USD', iso: 'MXN' },
  { id: 'usdzar', pair: 'USD/ZAR', seriesId: 'DEXSFUS',     category: 'em', color: '#007a4d', direction: 'FOREIGN_PER_USD', iso: 'ZAR' },
  { id: 'usdsgd', pair: 'USD/SGD', seriesId: 'DEXSIUS',     category: 'em', color: '#ed2939', direction: 'FOREIGN_PER_USD', iso: 'SGD' },
  { id: 'usdkrw', pair: 'USD/KRW', seriesId: 'DEXKOUS',     category: 'em', color: '#003478', direction: 'FOREIGN_PER_USD', iso: 'KRW' },
  { id: 'usdhkd', pair: 'USD/HKD', seriesId: 'DEXHKUS',     category: 'em', color: '#c8102e', direction: 'FOREIGN_PER_USD', iso: 'HKD' },
  { id: 'usdthb', pair: 'USD/THB', seriesId: 'DEXTHUS',     category: 'em', color: '#a51931', direction: 'FOREIGN_PER_USD', iso: 'THB' },
  // Frankfurter-only (FRED doesn't publish a stable daily series for these)
  { id: 'usdpln', pair: 'USD/PLN', seriesId: FRED_NONE,     category: 'em', color: '#dc143c', direction: 'FOREIGN_PER_USD', iso: 'PLN' },
  { id: 'usdtry', pair: 'USD/TRY', seriesId: FRED_NONE,     category: 'em', color: '#e30a17', direction: 'FOREIGN_PER_USD', iso: 'TRY' },
];

// Cross-currency pairs derived client-side. Rule for cross A/B (units of B per 1 A):
//   frankfurter (per-date): value = frank[B_iso] / frank[A_iso]     (both quoted vs USD)
//   FRED fallback:          value = usdPricePer(A) / usdPricePer(B)
export const CROSS_FX_PAIRS: CurrencyRateMeta[] = [
  { id: 'eurjpy', pair: 'EUR/JPY', seriesId: 'DERIVED', category: 'crosses', color: '#7c3aed', baseLegId: 'eurusd', quoteLegId: 'usdjpy', baseIso: 'EUR', quoteIso: 'JPY' },
  { id: 'eurgbp', pair: 'EUR/GBP', seriesId: 'DERIVED', category: 'crosses', color: '#7c3aed', baseLegId: 'eurusd', quoteLegId: 'gbpusd', baseIso: 'EUR', quoteIso: 'GBP' },
  { id: 'gbpjpy', pair: 'GBP/JPY', seriesId: 'DERIVED', category: 'crosses', color: '#7c3aed', baseLegId: 'gbpusd', quoteLegId: 'usdjpy', baseIso: 'GBP', quoteIso: 'JPY' },
  { id: 'eurchf', pair: 'EUR/CHF', seriesId: 'DERIVED', category: 'crosses', color: '#7c3aed', baseLegId: 'eurusd', quoteLegId: 'usdchf', baseIso: 'EUR', quoteIso: 'CHF' },
  { id: 'audjpy', pair: 'AUD/JPY', seriesId: 'DERIVED', category: 'crosses', color: '#7c3aed', baseLegId: 'audusd', quoteLegId: 'usdjpy', baseIso: 'AUD', quoteIso: 'JPY' },
  { id: 'chfjpy', pair: 'CHF/JPY', seriesId: 'DERIVED', category: 'crosses', color: '#7c3aed', baseLegId: 'usdchf', quoteLegId: 'usdjpy', baseIso: 'CHF', quoteIso: 'JPY' },
  { id: 'eurnok', pair: 'EUR/NOK', seriesId: 'DERIVED', category: 'crosses', color: '#7c3aed', baseLegId: 'eurusd', quoteLegId: 'usdnok', baseIso: 'EUR', quoteIso: 'NOK' },
  { id: 'eursek', pair: 'EUR/SEK', seriesId: 'DERIVED', category: 'crosses', color: '#7c3aed', baseLegId: 'eurusd', quoteLegId: 'usdsek', baseIso: 'EUR', quoteIso: 'SEK' },
  { id: 'eurpln', pair: 'EUR/PLN', seriesId: 'DERIVED', category: 'crosses', color: '#7c3aed', baseLegId: 'eurusd', quoteLegId: 'usdpln', baseIso: 'EUR', quoteIso: 'PLN' },
  { id: 'euraud', pair: 'EUR/AUD', seriesId: 'DERIVED', category: 'crosses', color: '#7c3aed', baseLegId: 'eurusd', quoteLegId: 'audusd', baseIso: 'EUR', quoteIso: 'AUD' },
  { id: 'gbpaud', pair: 'GBP/AUD', seriesId: 'DERIVED', category: 'crosses', color: '#7c3aed', baseLegId: 'gbpusd', quoteLegId: 'audusd', baseIso: 'GBP', quoteIso: 'AUD' },
];

// Convenience: all pairs known to the ticker (order = display order).
export const MAJOR_FX_PAIRS: CurrencyRateMeta[] = [...USD_FX_PAIRS, ...CROSS_FX_PAIRS];

export interface CurrencyRatePoint {
  year: number;
  value: number;
}

export interface CurrencyRateObservation {
  date: string;
  value: number;
}

export interface CurrencyRateHistory {
  meta: CurrencyRateMeta;
  annual: CurrencyRatePoint[];
  latest: CurrencyRateObservation | null;
  latestPrior: CurrencyRateObservation | null;
  ytdStart: CurrencyRateObservation | null;
  sparkline: CurrencyRateObservation[]; // last ~30 daily points
  liveSource: FxLiveSource;
}

// Convert a raw FRED FX value into "USD price of 1 unit of the foreign currency".
function toUsdPrice(value: number, direction: FxDirection): number {
  if (direction === 'US_PER_FOREIGN') return value;
  return 1 / value;
}

// Convert a Frankfurter "foreign per USD" rate into the pair's display value.
// e.g. EUR/USD wants USD per EUR (invert), USD/JPY wants JPY per USD (direct).
function frankRateToPairValue(rate: number, direction: FxDirection): number {
  if (direction === 'FOREIGN_PER_USD') return rate;
  if (rate === 0) return 0;
  return 1 / rate;
}

// -----------------------------------------------------------------------------
// FRED fetch (per-series, historical depth)
// -----------------------------------------------------------------------------

async function fetchRawObservations(
  seriesId: string,
  startDate: string = '1990-01-01',
  endDate: string = '2026-12-31'
): Promise<CurrencyRateObservation[]> {
  const url = `/api/fred?series_id=${seriesId}&observation_start=${startDate}&observation_end=${endDate}`;
  const response = await axios.get(url, { timeout: 15000 });
  if (!response.data?.observations) return [];
  const obs: CurrencyRateObservation[] = [];
  response.data.observations.forEach((o: any) => {
    const v = parseFloat(o.value);
    if (!isNaN(v) && o.value !== '.') obs.push({ date: o.date, value: v });
  });
  obs.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return obs;
}

// Build a USD-legged history from FRED raw observations only (no Frankfurter yet).
function historyFromFredObs(
  meta: CurrencyRateMeta,
  obs: CurrencyRateObservation[]
): CurrencyRateHistory | null {
  if (obs.length === 0) return null;

  const yearlyData: { [year: number]: number[] } = {};
  obs.forEach(({ date, value }) => {
    const year = parseInt(date.split('-')[0]);
    if (!yearlyData[year]) yearlyData[year] = [];
    yearlyData[year].push(value);
  });
  const annual: CurrencyRatePoint[] = Object.entries(yearlyData)
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

  return { meta, annual, latest, latestPrior, ytdStart, sparkline, liveSource: 'FRED' };
}

async function fetchFredUsdHistory(meta: CurrencyRateMeta): Promise<CurrencyRateHistory | null> {
  if (meta.seriesId === FRED_NONE) return null;
  try {
    const cacheKey = `currency_rate_${meta.id}`;
    const cached = clientCache.get<CurrencyRateHistory>(cacheKey);
    if (cached && cached.meta.seriesId === meta.seriesId) return cached;

    const obs = await fetchRawObservations(meta.seriesId);
    const history = historyFromFredObs(meta, obs);
    if (history) clientCache.set(cacheKey, history, 1000 * 60 * 60 * 24);
    return history;
  } catch (error: any) {
    console.error(`❌ Error fetching FRED FX ${meta.pair}:`, error.message);
    return null;
  }
}

// -----------------------------------------------------------------------------
// Frankfurter fetch (single call, all currencies, all dates in year to date)
// -----------------------------------------------------------------------------

export interface FrankfurterSnapshot {
  base: 'USD';
  // dates sorted ascending; each entry is a map of ISO → rate (foreign per USD)
  series: Array<{ date: string; rates: { [iso: string]: number } }>;
  latestDate: string | null;
}

function ytdStartDate(): string {
  const y = new Date().getUTCFullYear();
  return `${y}-01-01`;
}

async function fetchFrankfurterSnapshot(): Promise<FrankfurterSnapshot | null> {
  const cacheKey = 'frankfurter_snapshot_v1';
  const cached = clientCache.get<FrankfurterSnapshot>(cacheKey);
  if (cached) return cached;

  const symbolsSet = new Set<string>();
  USD_FX_PAIRS.forEach(p => { if (p.iso) symbolsSet.add(p.iso); });
  CROSS_FX_PAIRS.forEach(p => {
    if (p.baseIso) symbolsSet.add(p.baseIso);
    if (p.quoteIso) symbolsSet.add(p.quoteIso);
  });
  const symbols = Array.from(symbolsSet).join(',');

  const url = `/api/frankfurter?endpoint=timeseries&base=USD&start=${ytdStartDate()}&symbols=${encodeURIComponent(symbols)}`;
  try {
    const resp = await axios.get(url, { timeout: 20000 });
    const raw = resp.data?.rates;
    if (!raw || typeof raw !== 'object') return null;

    const series = Object.entries(raw)
      .map(([date, rates]) => ({ date, rates: rates as { [iso: string]: number } }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    const snapshot: FrankfurterSnapshot = {
      base: 'USD',
      series,
      latestDate: series.length ? series[series.length - 1].date : null,
    };
    // Cache for 1 hour — ECB publishes once per business day so this is plenty.
    clientCache.set(cacheKey, snapshot, 1000 * 60 * 60);
    return snapshot;
  } catch (error: any) {
    console.warn(`⚠️ Frankfurter fetch failed: ${error.message}`);
    return null;
  }
}

// Extract sparkline for a USD-legged pair from Frankfurter (last N points).
function frankSparklineForUsdPair(
  snapshot: FrankfurterSnapshot,
  meta: CurrencyRateMeta,
  points: number = 30,
): CurrencyRateObservation[] {
  if (!meta.iso || !meta.direction) return [];
  const out: CurrencyRateObservation[] = [];
  snapshot.series.forEach(row => {
    const rate = row.rates[meta.iso!];
    if (rate == null || rate === 0) return;
    out.push({ date: row.date, value: frankRateToPairValue(rate, meta.direction!) });
  });
  return out.slice(-points);
}

// Extract sparkline for a cross pair from Frankfurter using per-date cross math.
function frankSparklineForCross(
  snapshot: FrankfurterSnapshot,
  meta: CurrencyRateMeta,
  points: number = 30,
): CurrencyRateObservation[] {
  if (!meta.baseIso || !meta.quoteIso) return [];
  const out: CurrencyRateObservation[] = [];
  snapshot.series.forEach(row => {
    const b = row.rates[meta.baseIso!];
    const q = row.rates[meta.quoteIso!];
    if (b == null || q == null || b === 0) return;
    out.push({ date: row.date, value: q / b });
  });
  return out.slice(-points);
}

// Compute a live summary (latest / prior / YTD-start) from the full year-to-date
// Frankfurter track. Works for both USD-legged pairs and derived crosses.
function summarizeFromFrankfurterFullTrack(
  snapshot: FrankfurterSnapshot,
  meta: CurrencyRateMeta,
  isCross: boolean,
): { latest: CurrencyRateObservation | null; latestPrior: CurrencyRateObservation | null; ytdStart: CurrencyRateObservation | null } {
  const track: CurrencyRateObservation[] = [];
  snapshot.series.forEach(row => {
    let value: number | null = null;
    if (isCross) {
      const b = meta.baseIso ? row.rates[meta.baseIso] : undefined;
      const q = meta.quoteIso ? row.rates[meta.quoteIso] : undefined;
      if (b != null && q != null && b !== 0) value = q / b;
    } else {
      const r = meta.iso ? row.rates[meta.iso] : undefined;
      if (r != null && r !== 0 && meta.direction) value = frankRateToPairValue(r, meta.direction);
    }
    if (value != null) track.push({ date: row.date, value });
  });
  if (track.length === 0) return { latest: null, latestPrior: null, ytdStart: null };
  return {
    latest: track[track.length - 1],
    latestPrior: track.length >= 2 ? track[track.length - 2] : null,
    ytdStart: track[0],
  };
}

// -----------------------------------------------------------------------------
// Cross-pair derivation (FRED fallback path, used when Frankfurter unavailable)
// -----------------------------------------------------------------------------

function deriveCrossFromFred(
  meta: CurrencyRateMeta,
  baseHistory: CurrencyRateHistory,
  quoteHistory: CurrencyRateHistory,
): CurrencyRateHistory | null {
  const baseDir = baseHistory.meta.direction;
  const quoteDir = quoteHistory.meta.direction;
  if (!baseDir || !quoteDir) return null;

  const combinePoint = (
    a: CurrencyRateObservation | null,
    b: CurrencyRateObservation | null,
  ): CurrencyRateObservation | null => {
    if (!a || !b || a.value === 0 || b.value === 0) return null;
    const usdA = toUsdPrice(a.value, baseDir);
    const usdB = toUsdPrice(b.value, quoteDir);
    if (usdB === 0) return null;
    return { date: a.date, value: usdA / usdB };
  };

  // Annual: intersect years present in both legs
  const quoteByYear = new Map<number, number>();
  quoteHistory.annual.forEach(p => quoteByYear.set(p.year, p.value));
  const annual: CurrencyRatePoint[] = [];
  baseHistory.annual.forEach(p => {
    const qv = quoteByYear.get(p.year);
    if (qv == null || qv === 0) return;
    const usdA = toUsdPrice(p.value, baseDir);
    const usdB = toUsdPrice(qv, quoteDir);
    if (usdB === 0) return;
    annual.push({ year: p.year, value: usdA / usdB });
  });

  const latest = combinePoint(baseHistory.latest, quoteHistory.latest);
  const latestPrior = combinePoint(baseHistory.latestPrior, quoteHistory.latestPrior);
  const ytdStart = combinePoint(baseHistory.ytdStart, quoteHistory.ytdStart);

  return {
    meta,
    annual,
    latest,
    latestPrior,
    ytdStart,
    sparkline: [],
    liveSource: 'FRED',
  };
}

// -----------------------------------------------------------------------------
// Public entry point
// -----------------------------------------------------------------------------

// Small concurrency limiter — see notes in commodities.ts. FRED sits behind
// Akamai edge protection that starts returning 403 on request bursts.
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

export async function fetchAllCurrencyRates(): Promise<{ [id: string]: CurrencyRateHistory }> {
  console.log('💱 ========================================');
  console.log('💱 Fetching FX Rates (FRED + Frankfurter)...');
  console.log('💱 ========================================');

  // Frankfurter is a separate origin (not Akamai), so it can go in parallel with
  // the batched FRED fetches — one HTTP call regardless of pair count.
  const [fredResults, frank] = await Promise.all([
    chunkedParallel(USD_FX_PAIRS, 4, fetchFredUsdHistory, 150),
    fetchFrankfurterSnapshot(),
  ]);

  const out: { [id: string]: CurrencyRateHistory } = {};

  // ── USD-legged pairs ──────────────────────────────────────────────────────
  USD_FX_PAIRS.forEach((meta, i) => {
    const fredRes = fredResults[i];
    let fredHistory: CurrencyRateHistory | null =
      fredRes.status === 'fulfilled' ? fredRes.value : null;

    // If we only have Frankfurter (no FRED series), build a slim history from it.
    if (!fredHistory && frank) {
      const summary = summarizeFromFrankfurterFullTrack(frank, meta, false);
      if (summary.latest) {
        out[meta.id] = {
          meta,
          annual: [],
          latest: summary.latest,
          latestPrior: summary.latestPrior,
          ytdStart: summary.ytdStart,
          sparkline: frankSparklineForUsdPair(frank, meta),
          liveSource: 'Frankfurter',
        };
      }
      return;
    }

    if (!fredHistory) return; // both sources failed for this pair

    // Enrich FRED history with Frankfurter live-latest + sparkline when available.
    if (frank) {
      const frankSummary = summarizeFromFrankfurterFullTrack(frank, meta, false);
      const frankSpark = frankSparklineForUsdPair(frank, meta);
      const frankIsFresher =
        frankSummary.latest &&
        (!fredHistory.latest || frankSummary.latest.date > fredHistory.latest.date);

      out[meta.id] = {
        ...fredHistory,
        latest: frankIsFresher ? frankSummary.latest : fredHistory.latest,
        latestPrior: frankIsFresher ? frankSummary.latestPrior : fredHistory.latestPrior,
        // Prefer Frankfurter's YTD start (Jan 1 or closest business day) — it's
        // the canonical ECB reference and lines up across all pairs.
        ytdStart: frankSummary.ytdStart ?? fredHistory.ytdStart,
        sparkline: frankSpark.length ? frankSpark : fredHistory.sparkline,
        liveSource: frankIsFresher ? 'Frankfurter' : fredHistory.liveSource,
      };
    } else {
      out[meta.id] = fredHistory;
    }
  });

  // ── Cross pairs ────────────────────────────────────────────────────────────
  let crossesBuilt = 0;
  CROSS_FX_PAIRS.forEach(meta => {
    if (!meta.baseLegId || !meta.quoteLegId) return;
    const baseLeg = out[meta.baseLegId];
    const quoteLeg = out[meta.quoteLegId];
    if (!baseLeg || !quoteLeg) return;

    // Start from FRED-derived history for annual depth
    const fromFred = deriveCrossFromFred(meta, baseLeg, quoteLeg);
    if (!fromFred) return;

    // If Frankfurter is available for both legs' ISOs, prefer its live latest &
    // sparkline for a fresher, source-consistent cross rate.
    if (
      frank && meta.baseIso && meta.quoteIso &&
      frank.series.some(r => r.rates[meta.baseIso!] != null && r.rates[meta.quoteIso!] != null)
    ) {
      const frankSummary = summarizeFromFrankfurterFullTrack(frank, meta, true);
      const frankSpark = frankSparklineForCross(frank, meta);
      const useFrank =
        frankSummary.latest &&
        (!fromFred.latest || frankSummary.latest.date > fromFred.latest.date);

      out[meta.id] = {
        ...fromFred,
        latest: useFrank ? frankSummary.latest : fromFred.latest,
        latestPrior: useFrank ? frankSummary.latestPrior : fromFred.latestPrior,
        ytdStart: frankSummary.ytdStart ?? fromFred.ytdStart,
        sparkline: frankSpark.length ? frankSpark : fromFred.sparkline,
        liveSource: useFrank ? 'Frankfurter' : fromFred.liveSource,
      };
    } else {
      out[meta.id] = fromFred;
    }
    crossesBuilt++;
  });

  const usdCount = USD_FX_PAIRS.filter(m => out[m.id]).length;
  const liveCount = Object.values(out).filter(h => h.liveSource === 'Frankfurter').length;
  console.log(`💱 Fetched ${Object.keys(out).length} pairs (${usdCount} USD + ${crossesBuilt} crosses; ${liveCount} live via Frankfurter)`);
  return out;
}

export function clearCurrencyRatesCache(): void {
  USD_FX_PAIRS.forEach(m => clientCache.delete(`currency_rate_${m.id}`));
  clientCache.delete('frankfurter_snapshot_v1');
  console.log('✅ Cleared FX rates cached data (FRED + Frankfurter)');
}

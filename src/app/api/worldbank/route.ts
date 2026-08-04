import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import https from 'https';
import dns from 'dns';

// This route must run in the Node.js runtime — we use the `https` and `dns`
// modules below which the Edge runtime doesn't ship.
export const runtime = 'nodejs';

// Node 18+ defaults DNS lookups to `verbatim`, which returns the OS-reported
// AAAA (IPv6) address before A (IPv4). On dev machines whose network path
// lacks working IPv6 (common on Windows corporate networks), a request to
// api.worldbank.org then hangs for the full TCP handshake timeout instead
// of failing over to IPv4. Force IPv4-first ordering so the proxy doesn't
// stall for 15+ seconds.
dns.setDefaultResultOrder('ipv4first');

const IPV4_AGENT = new https.Agent({ family: 4, keepAlive: true });

// World Bank Indicators API. Docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/898581
const WORLD_BANK_BASE_URL = 'https://api.worldbank.org/v2/country';

// The World Bank public API sometimes fronts a WAF/CDN layer that
// aggressively blocks browser requests for certain series (in particular
// the MS.MIL.* family) with 403 / HTML challenge pages. Routing the call
// server-side bypasses those browser-fingerprint checks, so the client
// always talks to this proxy instead of api.worldbank.org directly.
const RETRYABLE_STATUS = new Set([403, 408, 425, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string): Promise<any> {
  let lastErr: AxiosError | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await axios.get(url, {
        timeout: 20000,
        httpsAgent: IPV4_AGENT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GlobalRatesApp/1.0; +https://github.com)',
          Accept: 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
    } catch (err) {
      const axErr = err as AxiosError;
      const status = axErr.response?.status;
      lastErr = axErr;
      if (attempt < MAX_ATTEMPTS - 1 && status && RETRYABLE_STATUS.has(status)) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.floor(Math.random() * 300);
        console.warn(`[WorldBank Proxy] ${status} on attempt ${attempt + 1}, retrying in ${delay}ms`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw lastErr ?? new Error('World Bank request failed');
}

// Whitelist the query parameters we forward, so this endpoint can't be
// weaponised into an open proxy for arbitrary WB URLs (or non-WB hosts).
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const countries = searchParams.get('countries');
    const indicator = searchParams.get('indicator');
    const date = searchParams.get('date') || '1960:2026';
    const source = searchParams.get('source');
    const perPage = searchParams.get('per_page') || '20000';

    if (!countries || !indicator) {
      return NextResponse.json(
        { error: 'Missing required parameters: countries, indicator' },
        { status: 400 },
      );
    }

    // Reject anything that isn't ISO-2 country codes joined by ';' or the
    // aggregate 'all'. Guards against injection into the WB URL path.
    const safeCountries = /^([a-zA-Z]{2,3}|all)(;[a-zA-Z]{2,3})*$/.test(countries);
    const safeIndicator = /^[A-Za-z0-9._]+$/.test(indicator);
    const safeDate = /^\d{4}(:\d{4})?$/.test(date);
    if (!safeCountries || !safeIndicator || !safeDate) {
      return NextResponse.json(
        { error: 'Invalid parameter format' },
        { status: 400 },
      );
    }

    const sourceParam = source && /^\d+$/.test(source) ? `&source=${source}` : '';
    const url = `${WORLD_BANK_BASE_URL}/${countries}/indicator/${indicator}?format=json&per_page=${perPage}&date=${date}${sourceParam}`;

    console.log(`[WorldBank Proxy] Fetching ${indicator} for ${countries}...`);
    const response = await fetchWithRetry(url);

    return NextResponse.json(response.data, {
      headers: {
        // Cache aggressively at the CDN edge — WB indicators refresh at most
        // once a year, so 6h edge cache with 24h stale-while-revalidate is safe.
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('[WorldBank Proxy] Error:', {
      message: error.message,
      status: error.response?.status,
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch World Bank data',
        details: error.message,
      },
      { status: error.response?.status || 500 },
    );
  }
}

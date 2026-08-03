import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

// FRED API Configuration
const FRED_API_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';
const FRED_API_KEY = process.env.NEXT_PUBLIC_FRED_API_KEY || '30008945655d5ff4d1ade8c836f86dea';

// FRED sits behind Akamai edge protection that can transiently return 403
// when a client fires many concurrent requests in a short burst. It also
// occasionally throws 429 (rate limited) or 5xx. Retry with jittered
// exponential backoff to smooth over these transient blocks.
const RETRYABLE_STATUS = new Set([403, 408, 425, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 600;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string): Promise<any> {
  let lastErr: AxiosError | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await axios.get(url, {
        timeout: 15000,
        headers: {
          // Use a browser-style UA — bare "GlobalEconomicIndicators/1.0" was flagged
          // by Akamai's bot heuristics.
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
        // Jittered exponential backoff: 600ms, 1500ms, 3300ms (+random 0-300ms)
        const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.floor(Math.random() * 300);
        console.warn(`[FRED API Route] ${status} on attempt ${attempt + 1}, retrying in ${delay}ms`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw lastErr ?? new Error('FRED request failed');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const seriesId = searchParams.get('series_id');
    const startDate = searchParams.get('observation_start') || '1960-01-01';
    const endDate = searchParams.get('observation_end') || '2026-12-31';

    if (!seriesId) {
      return NextResponse.json(
        { error: 'Missing series_id parameter' },
        { status: 400 }
      );
    }

    console.log(`[FRED API Route] Fetching ${seriesId}...`);

    const url = `${FRED_API_BASE_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&observation_start=${startDate}&observation_end=${endDate}`;

    const response = await fetchWithRetry(url);

    console.log(`[FRED API Route] Successfully fetched ${seriesId}`);

    return NextResponse.json(response.data, {
      headers: {
        // Cache at the CDN edge for 30 minutes to soak up retries and bursts.
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('[FRED API Route] Error:', {
      message: error.message,
      status: error.response?.status,
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch FRED data',
        details: error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

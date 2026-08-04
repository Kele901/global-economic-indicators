import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { memoizeUpstream } from '../_lib/upstreamCache';

// Frankfurter API proxy — free, no auth required, ECB-backed FX reference rates.
// Docs: https://frankfurter.dev/
//
// Supported endpoints (via `endpoint` query param):
//   - "latest"     → GET https://api.frankfurter.dev/v1/latest?base={base}&symbols={symbols}
//   - "timeseries" → GET https://api.frankfurter.dev/v1/{start}..{end}?base={base}&symbols={symbols}
//
// All params are optional except `endpoint`. For `timeseries`, `start` is required
// (end defaults to today per Frankfurter's own default).
const FRANKFURTER_BASE_URL = 'https://api.frankfurter.dev/v1';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get('endpoint') || 'latest';
    const base = searchParams.get('base') || 'USD';
    const symbols = searchParams.get('symbols'); // optional CSV list
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    let url: string;
    if (endpoint === 'timeseries') {
      if (!start) {
        return NextResponse.json(
          { error: 'Missing start parameter for timeseries endpoint (YYYY-MM-DD)' },
          { status: 400 }
        );
      }
      const range = end ? `${start}..${end}` : `${start}..`;
      url = `${FRANKFURTER_BASE_URL}/${range}?base=${encodeURIComponent(base)}`;
    } else if (endpoint === 'latest') {
      url = `${FRANKFURTER_BASE_URL}/latest?base=${encodeURIComponent(base)}`;
    } else {
      return NextResponse.json(
        { error: `Unsupported endpoint: ${endpoint}. Use "latest" or "timeseries".` },
        { status: 400 }
      );
    }

    if (symbols) {
      url += `&symbols=${encodeURIComponent(symbols)}`;
    }

    console.log(`[Frankfurter API Route] ${endpoint} ${base} ${symbols ?? '(all)'}${start ? ` ${start}..${end ?? ''}` : ''}`);

    const data = await memoizeUpstream(
      `frankfurter:${endpoint}:${base}:${symbols ?? ''}:${start ?? ''}:${end ?? ''}`,
      async () => {
        const response = await axios.get(url, {
          timeout: 15000,
          headers: {
            'User-Agent': 'GlobalEconomicIndicators/1.0',
            Accept: 'application/json',
          },
        });
        return response.data;
      },
      // ECB publishes once per business day — 15-min in-process reuse
      // is enough to absorb the burst of pair queries the ticker fires.
      { tag: 'frankfurter', revalidate: 900 },
    );

    return NextResponse.json(data, {
      headers: {
        // Cache at the CDN edge for 30 minutes since ECB publishes once per business day.
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error: any) {
    console.error('[Frankfurter API Route] Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch Frankfurter data',
        details: error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

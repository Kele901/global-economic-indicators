import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { memoizeUpstream } from '../_lib/upstreamCache';

// EIA v2 API proxy. Keeps the API key server-side.
// Docs: https://www.eia.gov/opendata/documentation.php
//
// Callers pass:
//   ?path=international/data&frequency=annual&facets[activityId][]=1&...
// The proxy appends api_key from the environment. If EIA_API_KEY is not set
// this route responds with fallback:true so the client can use static data.
const EIA_API_BASE_URL = 'https://api.eia.gov/v2';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.EIA_API_KEY || process.env.NEXT_PUBLIC_EIA_API_KEY;
    if (!apiKey) {
      // 200 rather than 501: missing a key is expected locally and the
      // client already falls back to the curated snapshot. A 5xx made the
      // outage log look like a broken feed.
      return NextResponse.json(
        { error: 'EIA_API_KEY not configured on the server', fallback: true, configured: false },
        { status: 200 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    if (!path) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    const forwarded = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'path') forwarded.append(key, value);
    });
    forwarded.append('api_key', apiKey);

    const url = `${EIA_API_BASE_URL}/${path.replace(/^\/+/, '')}?${forwarded.toString()}`;
    console.log(`[EIA API Route] Fetching ${path}...`);

    // Key the memo on the full querystring minus the api_key so a
    // rotated key doesn't invalidate the whole cache namespace.
    const memoKey = `eia:${path}:${Array.from(searchParams.entries())
      .filter(([k]) => k !== 'path')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&')}`;

    const data = await memoizeUpstream(
      memoKey,
      async () => {
        const response = await axios.get(url, {
          timeout: 15000,
          headers: { 'User-Agent': 'GlobalEconomicIndicators/1.0' },
        });
        return response.data;
      },
      // EIA publishes annually / quarterly; a 1-hour memo is plenty.
      { tag: 'eia', revalidate: 3600 },
    );

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('[EIA API Route] Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    return NextResponse.json(
      { error: 'Failed to fetch EIA data', details: error.message, fallback: true },
      { status: error.response?.status || 500 }
    );
  }
}

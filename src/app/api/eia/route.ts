import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// EIA v2 API proxy. Keeps the API key server-side.
// Docs: https://www.eia.gov/opendata/documentation.php
//
// Callers pass:
//   ?path=international/data&frequency=annual&facets[activityId][]=1&...
// The proxy appends api_key from the environment. If EIA_API_KEY is not set
// this route responds with 501 so the client can fall back to static data.
const EIA_API_BASE_URL = 'https://api.eia.gov/v2';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.EIA_API_KEY || process.env.NEXT_PUBLIC_EIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'EIA_API_KEY not configured on the server', fallback: true },
        { status: 501 }
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

    const response = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'GlobalEconomicIndicators/1.0' },
    });

    return NextResponse.json(response.data);
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

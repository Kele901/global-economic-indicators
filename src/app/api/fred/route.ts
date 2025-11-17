import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// FRED API Configuration
const FRED_API_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';
const FRED_API_KEY = process.env.NEXT_PUBLIC_FRED_API_KEY || '30008945655d5ff4d1ade8c836f86dea';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const seriesId = searchParams.get('series_id');
    const startDate = searchParams.get('observation_start') || '1960-01-01';
    const endDate = searchParams.get('observation_end') || '2024-12-31';

    if (!seriesId) {
      return NextResponse.json(
        { error: 'Missing series_id parameter' },
        { status: 400 }
      );
    }

    console.log(`[FRED API Route] Fetching ${seriesId}...`);

    const url = `${FRED_API_BASE_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&observation_start=${startDate}&observation_end=${endDate}`;
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'GlobalEconomicIndicators/1.0'
      }
    });

    console.log(`[FRED API Route] Successfully fetched ${seriesId}`);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('[FRED API Route] Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch FRED data',
        details: error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}


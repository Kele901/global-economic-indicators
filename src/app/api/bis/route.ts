import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BIS_BASE_URL = 'https://stats.bis.org/api/v1';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataset = searchParams.get('dataset') || 'WS_CBPOL_M';
    const country = searchParams.get('country') || 'US';
    const startPeriod = searchParams.get('startPeriod') || '1990';
    
    console.log(`[BIS API Route] Fetching ${dataset} for ${country}...`);
    
    const url = `${BIS_BASE_URL}/data/${dataset}/M.${country}?startPeriod=${startPeriod}&detail=full`;
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/vnd.sdmx.data+json; charset=utf-8; version=1.0',
        'User-Agent': 'GlobalEconomicIndicators/1.0'
      }
    });
    
    console.log(`[BIS API Route] Successfully fetched ${dataset} for ${country}`);
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('[BIS API Route] Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    // Return more detailed error information
    return NextResponse.json(
      { 
        error: 'Failed to fetch BIS data',
        details: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      },
      { status: error.response?.status || 500 }
    );
  }
}


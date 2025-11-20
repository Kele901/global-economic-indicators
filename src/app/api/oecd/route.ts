import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const OECD_BASE_URL = 'https://sdmx.oecd.org/public/rest/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataset = searchParams.get('dataset');
    const startPeriod = searchParams.get('startPeriod') || '1990';
    
    if (!dataset) {
      return NextResponse.json(
        { error: 'Missing required parameter: dataset' },
        { status: 400 }
      );
    }
    
    console.log(`[OECD API Route] Fetching ${dataset}...`);
    
    // Build OECD SDMX URL with dimensionAtObservation parameter
    const url = `${OECD_BASE_URL}/${dataset}?startPeriod=${startPeriod}&dimensionAtObservation=AllDimensions`;
    
    console.log(`[OECD API Route] URL: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GlobalEconomicIndicators/1.0'
      }
    });
    
    console.log(`[OECD API Route] Successfully fetched ${dataset}`);
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('[OECD API Route] Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url
    });
    
    // Return more detailed error information
    return NextResponse.json(
      { 
        error: 'Failed to fetch OECD data',
        details: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      },
      { status: error.response?.status || 500 }
    );
  }
}


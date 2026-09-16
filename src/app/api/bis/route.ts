import { NextRequest, NextResponse } from 'next/server';
import { fetchBisDataset } from '../_lib/bisClient';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataset = searchParams.get('dataset') || 'WS_CBPOL';
    const country = searchParams.get('country') || 'US';
    const startPeriod = searchParams.get('startPeriod') || '1990';

    console.log(`[BIS API Route] Fetching ${dataset} for ${country}...`);

    const data = await fetchBisDataset(dataset, country, startPeriod);

    console.log(`[BIS API Route] Successfully fetched ${dataset} for ${country}`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[BIS API Route] Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch BIS data',
        details: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
      },
      { status: error.response?.status || 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import https from 'https';
import axios from 'axios';

const TRAVEL_ADVISORY_URL = 'https://www.travel-advisory.info/api';

// Travel-Advisory.info occasionally serves an incomplete certificate chain;
// since the data is public and no auth is exchanged, we use a relaxed agent
// purely for this single endpoint so the server-side fetch can succeed.
const insecureAgent = new https.Agent({ rejectUnauthorized: false });

export interface TravelAdvisory {
  iso2: string;
  score: number;
  message: string;
  sourceUrl: string;
  updated: string;
}

export interface TravelAdvisoryResponse {
  advisories: Record<string, TravelAdvisory>;
  updatedAt: string;
  sourceUrl: string;
  count: number;
}

export async function GET() {
  try {
    const response = await axios.get(TRAVEL_ADVISORY_URL, {
      timeout: 20000,
      httpsAgent: insecureAgent,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'GlobalEconomicIndicators/1.0 (+https://globaleconindicators.info)',
      },
    });

    const raw = response.data;
    const data = raw?.data || {};
    const advisories: Record<string, TravelAdvisory> = {};

    Object.entries(data).forEach(([iso2, entry]: [string, any]) => {
      const code = iso2.toUpperCase();
      const advisory = entry?.advisory;
      if (!advisory) return;
      advisories[code] = {
        iso2: code,
        score: typeof advisory.score === 'number' ? advisory.score : Number(advisory.score) || 0,
        message: advisory.message || '',
        sourceUrl: advisory.source || '',
        updated: advisory.updated || '',
      };
    });

    const payload: TravelAdvisoryResponse = {
      advisories,
      updatedAt: new Date().toISOString(),
      sourceUrl: TRAVEL_ADVISORY_URL,
      count: Object.keys(advisories).length,
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=10800',
      },
    });
  } catch (error: any) {
    console.error('[Travel Advisory API] Failed:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch Travel Advisory data', details: error?.message || String(error) },
      { status: 502 }
    );
  }
}

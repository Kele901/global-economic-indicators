import { NextResponse } from 'next/server';
import axios from 'axios';

// Government of Canada travel advice, published under the Open Government Licence – Canada.
const TRAVEL_ADVISORY_URL = 'https://data.international.gc.ca/travel-voyage/index-updated.json';
const DESTINATION_PAGE_URL = 'https://travel.gc.ca/destinations/';
// Destinations the feed covers under another country's entry.
const COVERED_BY: Record<string, string> = { PS: 'IL', VA: 'IT' };

export interface TravelAdvisory {
  iso2: string;
  /** 0 = normal precautions, 1 = high degree of caution, 2 = avoid non-essential travel, 3 = avoid all travel. */
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

interface CanadaAdvisoryEntry {
  'country-iso'?: string;
  'advisory-state'?: number | string;
  'date-published'?: { date?: string };
  eng?: { 'url-slug'?: string; 'advisory-text'?: string };
}

export async function GET() {
  try {
    const response = await axios.get<{ metadata?: { generated?: { timestamp?: number } }; data?: Record<string, CanadaAdvisoryEntry> }>(
      TRAVEL_ADVISORY_URL,
      {
        timeout: 20000,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'GlobalEconomicIndicators/1.0 (+https://globaleconindicators.info)',
        },
      }
    );

    const data = response.data?.data || {};
    const advisories: Record<string, TravelAdvisory> = {};

    Object.entries(data).forEach(([key, entry]) => {
      const code = (entry['country-iso'] || key).toUpperCase();
      const score = Number(entry['advisory-state']);
      if (!/^[A-Z]{2}$/.test(code) || !Number.isFinite(score)) return;
      const slug = entry.eng?.['url-slug'];
      advisories[code] = {
        iso2: code,
        score,
        message: entry.eng?.['advisory-text'] || '',
        sourceUrl: slug ? DESTINATION_PAGE_URL + slug : 'https://travel.gc.ca/travelling/advisories',
        updated: entry['date-published']?.date || '',
      };
    });

    Object.entries(COVERED_BY).forEach(([code, parent]) => {
      if (!advisories[code] && advisories[parent]) advisories[code] = { ...advisories[parent], iso2: code };
    });

    if (Object.keys(advisories).length === 0) throw new Error('Advisory feed returned no countries');

    const generated = response.data?.metadata?.generated?.timestamp;
    const payload: TravelAdvisoryResponse = {
      advisories,
      updatedAt: (generated ? new Date(generated * 1000) : new Date()).toISOString(),
      sourceUrl: 'https://travel.gc.ca/travelling/advisories',
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

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const UNESCO_DATAHUB_URL = 'https://data.unesco.org/api/explore/v2.0/catalog/datasets/whc001/records';

export interface HeritageSiteRecord {
  name_en: string;
  short_description_en: string;
  category: string;
  states_name_en: string;
  iso_code: string;
  region_en: string;
  date_inscribed: number;
  danger: number;
  longitude: number;
  latitude: number;
  area_hectares: number;
  criteria_txt: string;
  transboundary: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');
    const limit = searchParams.get('limit') || '100';

    let whereClause = '';
    if (country) {
      whereClause = `&where=iso_code="${country}"`;
    }

    const url = `${UNESCO_DATAHUB_URL}?limit=${limit}&offset=0${whereClause}&order_by=date_inscribed desc`;

    console.log(`[UNESCO Heritage API] Fetching: ${url}`);

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
      }
    });

    const records = response.data?.results || [];
    const totalCount = response.data?.total_count || 0;

    const sites = records.map((record: any) => ({
      name: record.name_en || record.name_fr || '',
      description: record.short_description_en || '',
      category: record.category || 'Cultural',
      country: record.states_name_en || '',
      isoCode: record.iso_code || '',
      region: record.region_en || '',
      yearInscribed: record.date_inscribed || 0,
      danger: record.danger === 1,
      longitude: record.longitude || 0,
      latitude: record.latitude || 0,
      areaHectares: record.area_hectares || 0,
      criteria: record.criteria_txt || '',
      transboundary: record.transboundary === 1,
    }));

    console.log(`[UNESCO Heritage API] Found ${sites.length} sites (total: ${totalCount})`);

    return NextResponse.json({
      sites,
      totalCount,
    });
  } catch (error: any) {
    console.error('[UNESCO Heritage API] Error:', {
      message: error.message,
      status: error.response?.status
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch UNESCO Heritage data',
        details: error.message
      },
      { status: error.response?.status || 500 }
    );
  }
}

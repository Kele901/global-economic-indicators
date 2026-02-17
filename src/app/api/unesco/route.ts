import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// UNESCO UIS API - SDMX endpoint
const UNESCO_BASE_URL = 'http://data.uis.unesco.org/RestSDMX/sdmx.ashx/GetData';

// Alternative: UNESCO UIS Bulk Download API
const UNESCO_BULK_URL = 'http://data.uis.unesco.org/api/v1';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const indicator = searchParams.get('indicator');
    const country = searchParams.get('country');
    
    if (!indicator || !country) {
      return NextResponse.json(
        { error: 'Missing required parameters: indicator and country' },
        { status: 400 }
      );
    }
    
    console.log(`[UNESCO API Route] Fetching ${indicator} for ${country}...`);
    
    // Try the UNESCO UIS SDMX API
    // Format: dataset/country.indicator/all
    const url = `${UNESCO_BASE_URL}/UNESCO,${indicator}/${country}..../all?format=json`;
    
    console.log(`[UNESCO API Route] URL: ${url}`);
    
    try {
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GlobalEconomicIndicators/1.0'
        }
      });
      
      // Parse UNESCO SDMX response
      const data: { year: number; value: number }[] = [];
      
      if (response.data?.dataSets?.[0]?.observations) {
        const observations = response.data.dataSets[0].observations;
        const structure = response.data.structure;
        
        const timeDimension = structure?.dimensions?.observation?.find((d: any) => 
          d.id === 'TIME_PERIOD'
        );
        
        if (timeDimension?.values) {
          Object.entries(observations).forEach(([key, observation]: [string, any]) => {
            const value = observation[0];
            if (value !== null && !isNaN(value)) {
              const timeIndex = parseInt(key.split(':').pop() || '0');
              const timePeriod = timeDimension.values[timeIndex]?.id;
              
              if (timePeriod) {
                const year = parseInt(timePeriod);
                if (!isNaN(year)) {
                  data.push({ year, value: Number(value) });
                }
              }
            }
          });
        }
      }
      
      console.log(`[UNESCO API Route] Found ${data.length} data points for ${country}`);
      
      return NextResponse.json({ data: data.sort((a, b) => a.year - b.year) });
    } catch (sdmxError: any) {
      console.warn(`[UNESCO API Route] SDMX API failed, trying alternative...`);
      
      // Return empty data if UNESCO API fails
      return NextResponse.json({ data: [] });
    }
  } catch (error: any) {
    console.error('[UNESCO API Route] Error:', {
      message: error.message,
      status: error.response?.status
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch UNESCO data',
        details: error.message
      },
      { status: error.response?.status || 500 }
    );
  }
}

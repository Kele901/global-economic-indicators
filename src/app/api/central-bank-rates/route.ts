import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const CENTRAL_BANKS = [
  { currency: 'USD', bank: 'Federal Reserve', bankAbbrev: 'Fed', fredSeries: 'FEDFUNDS', bisCode: 'US' },
  { currency: 'EUR', bank: 'European Central Bank', bankAbbrev: 'ECB', fredSeries: 'ECBDFR', bisCode: 'XM' },
  { currency: 'JPY', bank: 'Bank of Japan', bankAbbrev: 'BoJ', bisCode: 'JP' },
  { currency: 'GBP', bank: 'Bank of England', bankAbbrev: 'BoE', bisCode: 'GB' },
  { currency: 'CHF', bank: 'Swiss National Bank', bankAbbrev: 'SNB', bisCode: 'CH' },
  { currency: 'CAD', bank: 'Bank of Canada', bankAbbrev: 'BoC', bisCode: 'CA' },
  { currency: 'AUD', bank: 'Reserve Bank of Australia', bankAbbrev: 'RBA', bisCode: 'AU' },
  { currency: 'NZD', bank: 'Reserve Bank of New Zealand', bankAbbrev: 'RBNZ', bisCode: 'NZ' },
  { currency: 'CNY', bank: "People's Bank of China", bankAbbrev: 'PBoC', bisCode: 'CN' },
  { currency: 'SEK', bank: 'Sveriges Riksbank', bankAbbrev: 'Riksbank', bisCode: 'SE' },
  { currency: 'NOK', bank: 'Norges Bank', bankAbbrev: 'Norges', bisCode: 'NO' },
  { currency: 'INR', bank: 'Reserve Bank of India', bankAbbrev: 'RBI', bisCode: 'IN' },
  { currency: 'BRL', bank: 'Banco Central do Brasil', bankAbbrev: 'BCB', bisCode: 'BR' },
  { currency: 'MXN', bank: 'Banco de México', bankAbbrev: 'Banxico', bisCode: 'MX' },
  { currency: 'ZAR', bank: 'South African Reserve Bank', bankAbbrev: 'SARB', bisCode: 'ZA' },
  { currency: 'TRY', bank: 'Central Bank of Turkey', bankAbbrev: 'CBRT', bisCode: 'TR' },
  { currency: 'PLN', bank: 'National Bank of Poland', bankAbbrev: 'NBP', bisCode: 'PL' },
  { currency: 'KRW', bank: 'Bank of Korea', bankAbbrev: 'BoK', bisCode: 'KR' },
];

const FRED_API_KEY = process.env.NEXT_PUBLIC_FRED_API_KEY || '30008945655d5ff4d1ade8c836f86dea';
const BIS_BASE_URL = 'https://stats.bis.org/api/v1';

const BIS_HEADERS = {
  'Accept': 'application/vnd.sdmx.data+json; charset=utf-8; version=1.0',
  'User-Agent': 'GlobalEconomicIndicators/1.0',
};

interface RateData {
  currency: string;
  bank: string;
  bankAbbrev: string;
  rate: number;
  previousRate: number;
  lastUpdated: string;
  trend: 'rising' | 'falling' | 'stable';
  source: string;
}

async function fetchFREDRate(seriesId: string): Promise<{ rate: number; previousRate: number; date: string } | null> {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&observation_start=${startDate}&observation_end=${endDate}&sort_order=desc&limit=60`;

    const response = await axios.get(url, { timeout: 10000 });
    const observations = response.data.observations?.filter((o: any) => o.value !== '.');

    if (observations && observations.length >= 2) {
      const latest = parseFloat(observations[0].value);
      const previousMonth = observations.find((o: any, i: number) => i > 0 && parseFloat(o.value) !== latest);
      const previous = previousMonth ? parseFloat(previousMonth.value) : latest;

      return {
        rate: latest,
        previousRate: previous,
        date: observations[0].date
      };
    }
    return null;
  } catch (error: any) {
    console.error(`FRED fetch error for ${seriesId}:`, error.message);
    return null;
  }
}

async function fetchBISRate(countryCode: string): Promise<{ rate: number; previousRate: number; date: string } | null> {
  try {
    const url = `${BIS_BASE_URL}/data/WS_CBPOL_M/M.${countryCode}?startPeriod=2023&detail=full`;

    const response = await axios.get(url, {
      timeout: 15000,
      headers: BIS_HEADERS
    });

    if (response.data?.data?.dataSets?.[0]?.series) {
      const series = response.data.data.dataSets[0].series;
      const structure = response.data.data.structure;
      const timeDimension = structure.dimensions?.observation?.find((d: any) =>
        d.id === 'TIME_PERIOD' || d.id === 'time'
      );

      if (timeDimension?.values) {
        const observations: { period: string; value: number }[] = [];

        Object.values(series).forEach((seriesData: any) => {
          if (seriesData.observations) {
            Object.entries(seriesData.observations).forEach(([timeIndex, obs]: [string, any]) => {
              const value = obs[0];
              if (value !== null && !isNaN(value)) {
                const period = timeDimension.values[parseInt(timeIndex)]?.id;
                if (period) {
                  observations.push({ period, value: Number(value) });
                }
              }
            });
          }
        });

        observations.sort((a, b) => b.period.localeCompare(a.period));

        if (observations.length >= 2) {
          return {
            rate: observations[0].value,
            previousRate: observations[1].value,
            date: observations[0].period
          };
        } else if (observations.length === 1) {
          return {
            rate: observations[0].value,
            previousRate: observations[0].value,
            date: observations[0].period
          };
        }
      }
    }
    return null;
  } catch (error: any) {
    if (error.response?.status !== 404) {
      console.error(`BIS fetch error for ${countryCode}:`, error.message);
    }
    return null;
  }
}

function determineTrend(current: number, previous: number): 'rising' | 'falling' | 'stable' {
  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return 'stable';
  return diff > 0 ? 'rising' : 'falling';
}

async function fetchRateForBank(cb: typeof CENTRAL_BANKS[number]): Promise<RateData | null> {
  let rateData: { rate: number; previousRate: number; date: string } | null = null;
  let source = 'BIS';

  if (cb.fredSeries) {
    rateData = await fetchFREDRate(cb.fredSeries);
    if (rateData) source = 'FRED';
  }

  if (!rateData && cb.bisCode) {
    rateData = await fetchBISRate(cb.bisCode);
    source = 'BIS';
  }

  if (rateData) {
    return {
      currency: cb.currency,
      bank: cb.bank,
      bankAbbrev: cb.bankAbbrev,
      rate: Math.round(rateData.rate * 100) / 100,
      previousRate: Math.round(rateData.previousRate * 100) / 100,
      lastUpdated: rateData.date,
      trend: determineTrend(rateData.rate, rateData.previousRate),
      source
    };
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const results: RateData[] = [];

    const fredBanks = CENTRAL_BANKS.filter(cb => cb.fredSeries);
    const bisOnlyBanks = CENTRAL_BANKS.filter(cb => !cb.fredSeries);

    const fredResults = await Promise.all(fredBanks.map(fetchRateForBank));
    fredResults.forEach(r => { if (r) results.push(r); });

    const BATCH_SIZE = 4;
    for (let i = 0; i < bisOnlyBanks.length; i += BATCH_SIZE) {
      const batch = bisOnlyBanks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(fetchRateForBank));
      batchResults.forEach(r => { if (r) results.push(r); });

      if (i + BATCH_SIZE < bisOnlyBanks.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    results.sort((a, b) => b.rate - a.rate);

    return NextResponse.json({
      rates: results,
      fetchedAt: new Date().toISOString(),
      count: results.length
    });

  } catch (error: any) {
    console.error('Central bank rates API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch central bank rates', details: error.message },
      { status: 500 }
    );
  }
}

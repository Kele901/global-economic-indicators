import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BIS_BASE_URL = 'https://stats.bis.org/api/v1';

const CENTRAL_BANK_INFO: Record<string, { bank: string; currency: string }> = {
  US: { bank: 'Federal Reserve', currency: 'USD' },
  XM: { bank: 'ECB', currency: 'EUR' },
  JP: { bank: 'Bank of Japan', currency: 'JPY' },
  GB: { bank: 'Bank of England', currency: 'GBP' },
  CH: { bank: 'Swiss National Bank', currency: 'CHF' },
  CA: { bank: 'Bank of Canada', currency: 'CAD' },
  AU: { bank: 'Reserve Bank of Australia', currency: 'AUD' },
  NZ: { bank: 'Reserve Bank of New Zealand', currency: 'NZD' },
  CN: { bank: 'PBoC', currency: 'CNY' },
  IN: { bank: 'Reserve Bank of India', currency: 'INR' },
  BR: { bank: 'BCB', currency: 'BRL' },
  TR: { bank: 'CBRT', currency: 'TRY' },
  MX: { bank: 'Banco de México', currency: 'MXN' },
  ZA: { bank: 'South African Reserve Bank', currency: 'ZAR' },
  KR: { bank: 'Bank of Korea', currency: 'KRW' },
  SE: { bank: 'Sveriges Riksbank', currency: 'SEK' },
  NO: { bank: 'Norges Bank', currency: 'NOK' },
  PL: { bank: 'National Bank of Poland', currency: 'PLN' },
};

interface RateObservation {
  period: string;
  value: number;
}

async function fetchBISRateHistory(bisCode: string): Promise<RateObservation[]> {
  try {
    const url = `${BIS_BASE_URL}/data/WS_CBPOL_M/M.${bisCode}?startPeriod=2023&detail=full`;

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/vnd.sdmx.data+json; charset=utf-8; version=1.0',
        'User-Agent': 'GlobalEconomicIndicators/1.0'
      }
    });

    const observations: RateObservation[] = [];

    if (response.data?.data?.dataSets?.[0]?.series) {
      const series = response.data.data.dataSets[0].series;
      const structure = response.data.data.structure;
      const timeDimension = structure.dimensions?.observation?.find((d: any) =>
        d.id === 'TIME_PERIOD' || d.id === 'time'
      );

      if (timeDimension?.values) {
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
      }
    }

    return observations.sort((a, b) => b.period.localeCompare(a.period));
  } catch (error: any) {
    if (error.response?.status !== 404) {
      console.error(`BIS rate history fetch error for ${bisCode}:`, error.message);
    }
    return [];
  }
}

function deriveDecisions(
  history: RateObservation[],
  bankInfo: { bank: string; currency: string }
) {
  const decisions: any[] = [];

  for (let i = 0; i < history.length - 1 && i < 12; i++) {
    const current = history[i];
    const previous = history[i + 1];

    const change = current.value - previous.value;
    const changeRounded = Math.round(change * 100) / 100;

    let action: 'hike' | 'cut' | 'hold';
    let statement: string;

    if (Math.abs(changeRounded) < 0.01) {
      action = 'hold';
      statement = `Maintained policy rate at ${current.value.toFixed(2)}%`;
    } else if (changeRounded > 0) {
      action = 'hike';
      statement = `Raised policy rate by ${Math.abs(changeRounded * 100).toFixed(0)} basis points to ${current.value.toFixed(2)}%`;
    } else {
      action = 'cut';
      statement = `Lowered policy rate by ${Math.abs(changeRounded * 100).toFixed(0)} basis points to ${current.value.toFixed(2)}%`;
    }

    const [year, month] = current.period.split('-');
    const date = `${year}-${month}-15`;

    decisions.push({
      bank: bankInfo.bank,
      currency: bankInfo.currency,
      date,
      action,
      newRate: Math.round(current.value * 100) / 100,
      changeAmount: changeRounded,
      statement
    });
  }

  return decisions;
}

export async function GET(request: NextRequest) {
  try {
    const allDecisions: any[] = [];

    const bisCodes = Object.keys(CENTRAL_BANK_INFO);

    const batchSize = 6;
    for (let i = 0; i < bisCodes.length; i += batchSize) {
      const batch = bisCodes.slice(i, i + batchSize);

      const results = await Promise.all(
        batch.map(async (code) => {
          const history = await fetchBISRateHistory(code);
          if (history.length >= 2) {
            return deriveDecisions(history, CENTRAL_BANK_INFO[code]);
          }
          return [];
        })
      );

      results.forEach(decisions => {
        allDecisions.push(...decisions);
      });

      if (i + batchSize < bisCodes.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    allDecisions.sort((a, b) => b.date.localeCompare(a.date));

    const recentDecisions = allDecisions.slice(0, 40);

    return NextResponse.json({
      decisions: recentDecisions,
      fetchedAt: new Date().toISOString(),
      count: recentDecisions.length,
      source: 'BIS WS_CBPOL_M'
    });

  } catch (error: any) {
    console.error('Rate decisions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate decisions', details: error.message },
      { status: 500 }
    );
  }
}

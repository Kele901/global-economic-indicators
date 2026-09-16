import axios from 'axios';

// BIS SDMX REST v2. The v1 URL plus a versioned Accept header is what was
// returning HTTP 406 for every country: BIS dropped the versioned media type
// and moved the dataflows (WS_CBPOL_M → WS_CBPOL; WS_EER now needs the full
// FREQ.TYPE.BASKET.REF_AREA key).

const BIS_V2 = 'https://stats.bis.org/api/v2';
const BIS_ACCEPT = 'application/vnd.sdmx.data+json';
const BIS_UA = 'GlobalEconomicIndicators/1.0';

export const BIS_HEADERS = {
  Accept: BIS_ACCEPT,
  'User-Agent': BIS_UA,
};

export interface BisObservation {
  period: string;
  value: number;
}

function resolveFlowAndKey(dataset: string, country: string): { flow: string; key: string } {
  const ds = dataset.toUpperCase();
  if (ds === 'WS_EER' || ds === 'EXCHANGE_RATES') {
    // Monthly, real, broad effective exchange rate.
    return { flow: 'WS_EER', key: `M.R.B.${country}` };
  }
  // Callers used to pass WS_CBPOL_M; the live dataflow id is WS_CBPOL.
  return { flow: 'WS_CBPOL', key: `M.${country}` };
}

export function bisDataUrl(dataset: string, country: string, startPeriod: string): string {
  const { flow, key } = resolveFlowAndKey(dataset, country);
  const params = new URLSearchParams({
    startPeriod,
    detail: 'dataonly',
    format: 'jsondata',
  });
  return `${BIS_V2}/data/dataflow/BIS/${flow}/1.0/${key}?${params.toString()}`;
}

export async function fetchBisDataset(
  dataset: string,
  country: string,
  startPeriod: string,
): Promise<unknown> {
  const url = bisDataUrl(dataset, country, startPeriod);
  const response = await axios.get(url, { timeout: 15000, headers: BIS_HEADERS });
  return response.data;
}

export function extractBisObservations(payload: unknown): BisObservation[] {
  const data = payload as {
    data?: {
      dataSets?: Array<{ series?: Record<string, { observations?: Record<string, unknown> }> }>;
      structure?: {
        dimensions?: {
          observation?: Array<{ id?: string; values?: Array<{ id?: string }> }>;
        };
      };
    };
  };
  const series = data?.data?.dataSets?.[0]?.series;
  const timeDimension = data?.data?.structure?.dimensions?.observation?.find(
    d => d.id === 'TIME_PERIOD' || d.id === 'TIME' || d.id === 'time',
  );
  if (!series || !timeDimension?.values) return [];

  const observations: BisObservation[] = [];
  for (const seriesData of Object.values(series)) {
    if (!seriesData?.observations) continue;
    for (const [timeIndex, obs] of Object.entries(seriesData.observations)) {
      const value = Array.isArray(obs) ? Number(obs[0]) : Number(obs);
      if (!Number.isFinite(value)) continue;
      const period = timeDimension.values[parseInt(timeIndex, 10)]?.id;
      if (period) observations.push({ period, value });
    }
  }
  return observations.sort((a, b) => b.period.localeCompare(a.period));
}

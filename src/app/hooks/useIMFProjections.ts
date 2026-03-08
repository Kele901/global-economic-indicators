import { useState, useEffect, useCallback } from 'react';
import { IMF_GDP_PROJECTIONS, IMF_INFLATION_PROJECTIONS, REGIONAL_GDP_PROJECTIONS } from '../data/imfProjections';

export interface Projection {
  country: string;
  metric: string;
  values: Record<number, number>;
}

export interface RegionalProjection {
  region: string;
  y2025: number;
  y2026: number;
  y2027: number;
  y2028: number;
}

interface WEOInfo {
  source: string;
  lastUpdate: string;
  nextUpdate: string;
}

interface UseIMFProjectionsReturn {
  gdpProjections: Projection[];
  inflationProjections: Projection[];
  regionalProjections: RegionalProjection[];
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
  refetch: () => Promise<void>;
  isLive: boolean;
  weoInfo: WEOInfo | null;
}

export function useIMFProjections(): UseIMFProjectionsReturn {
  const [gdpProjections, setGdpProjections] = useState<Projection[]>([]);
  const [inflationProjections, setInflationProjections] = useState<Projection[]>([]);
  const [regionalProjections, setRegionalProjections] = useState<RegionalProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [weoInfo, setWeoInfo] = useState<WEOInfo | null>(null);

  const fetchProjections = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [gdpResponse, inflationResponse, regionalResponse] = await Promise.all([
        fetch('/api/imf-weo?metric=gdpGrowth&type=countries'),
        fetch('/api/imf-weo?metric=inflation&type=countries'),
        fetch('/api/imf-weo?metric=gdpGrowth&type=regions'),
      ]);
      
      if (!gdpResponse.ok || !inflationResponse.ok) {
        throw new Error('Failed to fetch IMF data');
      }
      
      const gdpData = await gdpResponse.json();
      const inflationData = await inflationResponse.json();
      const regionalData = await regionalResponse.json();
      
      if (gdpData.data && gdpData.data.length > 0) {
        const transformedGdp = gdpData.data.map((item: any) => ({
          country: item.country,
          metric: 'gdpGrowth',
          values: item.values
        }));
        setGdpProjections(transformedGdp);
      }
      
      if (inflationData.data && inflationData.data.length > 0) {
        const transformedInflation = inflationData.data.map((item: any) => ({
          country: item.country,
          metric: 'inflation',
          values: item.values
        }));
        setInflationProjections(transformedInflation);
      }
      
      if (regionalData.data && regionalData.data.length > 0) {
        const transformedRegional = regionalData.data.map((item: any) => ({
          region: item.country,
          y2025: item.values[2025] || 0,
          y2026: item.values[2026] || 0,
          y2027: item.values[2027] || 0,
          y2028: item.values[2028] || 0,
        }));
        setRegionalProjections(transformedRegional);
      }
      
      setWeoInfo(gdpData.weoInfo);
      setLastFetched(gdpData.fetchedAt);
      setIsLive(true);
      
    } catch (err: any) {
      console.warn('Failed to fetch live IMF data, using fallback:', err.message);
      setError(err.message);
      
      setGdpProjections(IMF_GDP_PROJECTIONS);
      setInflationProjections(IMF_INFLATION_PROJECTIONS);
      setRegionalProjections(REGIONAL_GDP_PROJECTIONS);
      setWeoInfo({
        source: 'IMF World Economic Outlook (Cached)',
        lastUpdate: 'October 2025',
        nextUpdate: 'April 2026'
      });
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjections();
    
    const interval = setInterval(fetchProjections, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchProjections]);

  return {
    gdpProjections,
    inflationProjections,
    regionalProjections,
    loading,
    error,
    lastFetched,
    refetch: fetchProjections,
    isLive,
    weoInfo
  };
}

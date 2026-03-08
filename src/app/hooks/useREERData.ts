import { useState, useEffect, useCallback } from 'react';
import { fetchREERData, REERData } from '../services/bis';
import { REER_DATA } from '../data/currencyHierarchyData';

interface UseREERDataReturn {
  reerData: REERData[];
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
  refetch: () => Promise<void>;
  isLive: boolean;
}

export function useREERData(): UseREERDataReturn {
  const [reerData, setReerData] = useState<REERData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchREERData();
      
      if (data && data.length > 0) {
        setReerData(data);
        setLastFetched(new Date().toISOString());
        setIsLive(true);
      } else {
        throw new Error('No REER data returned');
      }
    } catch (err: any) {
      console.warn('Failed to fetch live REER data, using fallback:', err.message);
      setError(err.message);
      
      const fallbackData: REERData[] = REER_DATA.map(item => ({
        currency: item.currency,
        current: item.current,
        historicalAverage: item.historicalAverage,
        deviation: item.deviation,
        isOvervalued: item.isOvervalued,
        trend: item.trend,
        lastUpdated: item.lastUpdated
      }));
      
      setReerData(fallbackData);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    reerData,
    loading,
    error,
    lastFetched,
    refetch: fetchData,
    isLive
  };
}

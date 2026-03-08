import { useState, useEffect, useCallback } from 'react';
import { CENTRAL_BANK_RATES } from '../data/currencyHierarchyData';

export interface LiveCentralBankRate {
  currency: string;
  bank: string;
  bankAbbrev: string;
  rate: number;
  previousRate: number;
  lastUpdated: string;
  trend: 'rising' | 'falling' | 'stable';
  source: string;
  nextMeeting?: string;
}

interface UseCentralBankRatesReturn {
  rates: LiveCentralBankRate[];
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
  refetch: () => Promise<void>;
  isLive: boolean;
}

const NEXT_MEETINGS: Record<string, string> = {
  USD: '2026-03-18',
  EUR: '2026-03-05',
  JPY: '2026-03-13',
  GBP: '2026-03-19',
  CHF: '2026-03-19',
  CAD: '2026-03-11',
  AUD: '2026-03-31',
  NZD: '2026-04-08',
  CNY: '2026-03-20',
  SEK: '2026-03-26',
  NOK: '2026-03-27',
  INR: '2026-04-08',
  BRL: '2026-03-18',
  MXN: '2026-03-27',
  ZAR: '2026-03-27',
  TRY: '2026-03-20',
  PLN: '2026-04-02',
  KRW: '2026-04-10',
};

function buildFallbackRates(): LiveCentralBankRate[] {
  return CENTRAL_BANK_RATES.map(rate => ({
    currency: rate.currency,
    bank: rate.bank,
    bankAbbrev: rate.bankAbbrev,
    rate: rate.rate,
    previousRate: rate.previousRate,
    lastUpdated: rate.lastUpdated,
    trend: rate.trend,
    source: 'static',
    nextMeeting: rate.nextMeeting || NEXT_MEETINGS[rate.currency],
  }));
}

export function useCentralBankRates(): UseCentralBankRatesReturn {
  const [rates, setRates] = useState<LiveCentralBankRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/central-bank-rates');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.rates && data.rates.length > 0) {
        const liveRatesMap = new Map<string, LiveCentralBankRate>();

        for (const rate of data.rates) {
          liveRatesMap.set(rate.currency, {
            ...rate,
            nextMeeting: NEXT_MEETINGS[rate.currency] || undefined
          });
        }

        const fallback = buildFallbackRates();
        for (const fb of fallback) {
          if (!liveRatesMap.has(fb.currency)) {
            liveRatesMap.set(fb.currency, fb);
          }
        }

        const merged = Array.from(liveRatesMap.values());
        merged.sort((a, b) => b.rate - a.rate);

        setRates(merged);
        setLastFetched(data.fetchedAt);
        setIsLive(true);
      } else {
        throw new Error('No rates returned');
      }
    } catch (err: any) {
      console.warn('Failed to fetch live rates, using fallback:', err.message);
      setError(err.message);
      setRates(buildFallbackRates());
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();

    const interval = setInterval(fetchRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  return {
    rates,
    loading,
    error,
    lastFetched,
    refetch: fetchRates,
    isLive
  };
}

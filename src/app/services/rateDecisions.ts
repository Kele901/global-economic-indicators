import { clientCache } from './clientCache';

export interface RateDecision {
  bank: string;
  currency: string;
  date: string;
  action: 'hike' | 'cut' | 'hold';
  newRate: number;
  changeAmount: number;
  statement: string;
}

export async function fetchRecentDecisions(): Promise<RateDecision[]> {
  const cacheKey = 'recent_rate_decisions';
  const cached = clientCache.get<RateDecision[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch('/api/rate-decisions');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.decisions && data.decisions.length > 0) {
      clientCache.set(cacheKey, data.decisions, 1000 * 60 * 60);
      return data.decisions;
    }

    throw new Error('No decisions returned from API');
  } catch (error: any) {
    console.warn('Failed to fetch live rate decisions:', error.message);
    return [];
  }
}

export function clearRateDecisionsCache(): void {
  clientCache.delete('recent_rate_decisions');
}

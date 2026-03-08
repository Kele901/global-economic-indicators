import { useState, useEffect, useCallback } from 'react';
import { ECONOMIC_CALENDAR } from '../data/currencyHierarchyData';

export interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  currency: string;
  event: string;
  importance: 'high' | 'medium' | 'low';
  bank: string;
  type: 'rate_decision' | 'minutes' | 'speech' | 'data_release';
}

interface UseEconomicCalendarOptions {
  currency?: string;
  days?: number;
  type?: string;
}

interface UseEconomicCalendarReturn {
  events: EconomicEvent[];
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
  refetch: () => Promise<void>;
  isLive: boolean;
}

export function useEconomicCalendar(options: UseEconomicCalendarOptions = {}): UseEconomicCalendarReturn {
  const { currency, days = 90, type } = options;
  
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/economic-calendar?days=${days}`;
      if (currency) url += `&currency=${currency}`;
      if (type) url += `&type=${type}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.events && data.events.length > 0) {
        setEvents(data.events);
        setLastFetched(data.generatedAt);
        setIsLive(true);
      } else {
        throw new Error('No events returned');
      }
    } catch (err: any) {
      console.warn('Failed to fetch economic calendar, using fallback:', err.message);
      setError(err.message);
      
      const today = new Date();
      const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
      
      let filteredEvents = ECONOMIC_CALENDAR.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= endDate;
      });
      
      if (currency) {
        filteredEvents = filteredEvents.filter(e => e.currency === currency);
      }
      
      const mappedEvents: EconomicEvent[] = filteredEvents.map(event => ({
        id: event.id || `${event.currency}-${event.date}`,
        date: event.date,
        time: event.time || '',
        currency: event.currency,
        event: event.event,
        importance: event.importance,
        bank: event.description || event.event,
        type: 'rate_decision' as const
      }));
      
      setEvents(mappedEvents);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [currency, days, type]);

  useEffect(() => {
    fetchCalendar();
    
    const interval = setInterval(fetchCalendar, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchCalendar]);

  return {
    events,
    loading,
    error,
    lastFetched,
    refetch: fetchCalendar,
    isLive
  };
}

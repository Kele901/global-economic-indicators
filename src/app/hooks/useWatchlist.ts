import { useState, useEffect, useCallback } from 'react';

export interface WatchlistItem {
  id: string;
  country: string;
  metric: string;
  threshold?: { direction: 'above' | 'below'; value: number };
  addedAt: number;
}

const STORAGE_KEY = 'economic-watchlist';

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const persist = useCallback((newItems: WatchlistItem[]) => {
    setItems(newItems);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems)); } catch { /* ignore */ }
  }, []);

  const addItem = useCallback((item: Omit<WatchlistItem, 'id' | 'addedAt'>) => {
    const newItem: WatchlistItem = {
      ...item,
      id: `${item.country}-${item.metric}-${Date.now()}`,
      addedAt: Date.now(),
    };
    persist([...items, newItem]);
  }, [items, persist]);

  const removeItem = useCallback((id: string) => {
    persist(items.filter(i => i.id !== id));
  }, [items, persist]);

  const updateThreshold = useCallback((id: string, threshold?: WatchlistItem['threshold']) => {
    persist(items.map(i => i.id === id ? { ...i, threshold } : i));
  }, [items, persist]);

  return { items, addItem, removeItem, updateThreshold };
}

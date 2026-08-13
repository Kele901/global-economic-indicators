'use client';

// Reads visited-route state stored by RouteTracker under
// `explore_progress_v1`. Subscribes to the `explore-progress:changed`
// CustomEvent + `storage` events so the badge updates in real time.

import { useEffect, useState } from 'react';

const KEY = 'explore_progress_v1';

// Total number of tracked destinations for the exploration badge.
// Kept in sync with the CommandPalette + Navbar so the badge reads
// "X / TRACKED_TOTAL". If you add or remove a top-level route, bump
// this — the exact count doesn't need to be perfect, it's a
// gamified progress marker not an accountancy tool.
export const TRACKED_TOTAL = 24;

function readVisited(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

export function useSiteProgress() {
  const [visited, setVisited] = useState<string[]>([]);

  useEffect(() => {
    setVisited(readVisited());
    const onChange = () => setVisited(readVisited());
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) onChange(); };
    window.addEventListener('explore-progress:changed', onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('explore-progress:changed', onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const reset = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(KEY);
      setVisited([]);
      window.dispatchEvent(new CustomEvent('explore-progress:changed'));
    }
  };

  return { visited, total: TRACKED_TOTAL, reset };
}

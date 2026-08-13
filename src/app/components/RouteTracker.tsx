'use client';

// Records visited routes into localStorage under `explore_progress_v1`.
// Consumed by the ExploreProgressBadge in the Navbar Info menu (Wave 3).
// SSR-safe: bails out on the server. Deduplicates and caps at 1000
// entries so it never grows unbounded.

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const KEY = 'explore_progress_v1';
const MAX = 1000;

export default function RouteTracker() {
  const path = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !path) return;
    try {
      const raw = window.localStorage.getItem(KEY);
      const set = new Set<string>(raw ? JSON.parse(raw) : []);
      if (set.has(path)) return;
      set.add(path);
      const arr = Array.from(set).slice(-MAX);
      window.localStorage.setItem(KEY, JSON.stringify(arr));
      window.dispatchEvent(new CustomEvent('explore-progress:changed'));
    } catch {
      /* localStorage disabled — silent fail */
    }
  }, [path]);

  return null;
}

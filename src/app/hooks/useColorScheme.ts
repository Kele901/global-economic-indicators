'use client';

import { useEffect, useState } from 'react';

export type ColorScheme = 'default' | 'deuteranopia' | 'protanopia' | 'tritanopia';

const STORAGE_KEY = 'color-scheme-v1';
const CHANGE_EVENT = 'color-scheme:changed';

function isColorScheme(value: unknown): value is ColorScheme {
  return value === 'default' || value === 'deuteranopia' || value === 'protanopia' || value === 'tritanopia';
}

function readInitial(): ColorScheme {
  if (typeof window === 'undefined') return 'default';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && isColorScheme(raw)) return raw;
  } catch {
    // ignore
  }
  return 'default';
}

// SSR-safe hook. Reading from window is deferred into an effect so
// the server-rendered markup and the first client render match.
export function useColorScheme(): [ColorScheme, (next: ColorScheme) => void] {
  const [scheme, setScheme] = useState<ColorScheme>('default');

  useEffect(() => {
    setScheme(readInitial());
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<ColorScheme>).detail;
      if (isColorScheme(detail)) setScheme(detail);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (event.newValue && isColorScheme(event.newValue)) setScheme(event.newValue);
    };
    window.addEventListener(CHANGE_EVENT, onChange as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const set = (next: ColorScheme) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    setScheme(next);
    window.dispatchEvent(new CustomEvent<ColorScheme>(CHANGE_EVENT, { detail: next }));
  };

  return [scheme, set];
}

export const COLOR_SCHEME_STORAGE_KEY = STORAGE_KEY;
export const COLOR_SCHEME_CHANGE_EVENT = CHANGE_EVENT;

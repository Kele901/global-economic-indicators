import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

// Persisted state, safe to use in a server-rendered tree.
//
// The previous version read localStorage inside the useState initialiser.
// That is the classic hydration bug: the server renders with the default
// while the browser's first render uses the stored value, React sees two
// different trees and either warns or silently keeps the server's markup
// with the client's state. With 65 consumers — including `isDarkMode`,
// which changes almost every className on the page — that was worth
// fixing properly rather than per-component.
//
// The shape of the fix:
//   1. First render always returns `initialValue`, on both server and
//      client, so the trees match.
//   2. A layout effect reads storage and updates state. Layout effects
//      run after commit but *before* the browser paints, so the reader
//      does not see a flash of the default value.
//   3. `hydrated` is returned as a third tuple element so a caller that
//      must not render anything until the real value is known can wait.
//      Existing two-element destructuring is unaffected.
//   4. Writes broadcast on a custom event, so two components sharing a
//      key stay in step within one tab (previously only cross-tab
//      `storage` events were handled, which is the rarer case).

// useLayoutEffect warns when it runs during SSR, and on the server there
// is nothing to hydrate from anyway.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const EVENT_PREFIX = 'local-storage:';

function readStored<T>(key: string, fallback: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item === null ? fallback : (JSON.parse(item) as T);
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return fallback;
  }
}

// Dark mode is the one key with DOM consequences beyond React state: the
// pre-paint script in layout.tsx sets these same attributes, and this keeps
// them in step once the app takes over.
function applyThemeSideEffects(key: string, value: unknown) {
  if (key !== 'isDarkMode' || typeof document === 'undefined') return;
  const dark = Boolean(value);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.body.classList.toggle('dark', dark);
  // Several components listen for this rather than holding the hook.
  window.dispatchEvent(new Event('themeChange'));
}

export const useLocalStorage = <T,>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, boolean] => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  // Step 1: adopt the stored value before the first paint.
  useIsomorphicLayoutEffect(() => {
    const fromStore = readStored(key, initialValue);
    setStoredValue(fromStore);
    setHydrated(true);
    applyThemeSideEffects(key, fromStore);
    // initialValue is deliberately excluded: callers routinely pass a fresh
    // object or array literal, which would re-run this on every render and
    // clobber the user's stored value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Step 2: persist changes, but never before hydration, or the default
  // would be written over the stored value on mount.
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
    applyThemeSideEffects(key, storedValue);
    window.dispatchEvent(new CustomEvent(`${EVENT_PREFIX}${key}`, { detail: storedValue }));
  }, [key, storedValue, hydrated]);

  // Step 3: stay in sync with other hook instances (same tab) and other
  // tabs. Both paths compare before setting so an echo of our own write
  // does not start a re-render loop.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const adopt = (incoming: T) => {
      setStoredValue(prev => (JSON.stringify(prev) === JSON.stringify(incoming) ? prev : incoming));
    };

    const onLocal = (e: Event) => adopt((e as CustomEvent<T>).detail);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return;
      try {
        adopt(JSON.parse(e.newValue) as T);
      } catch (error) {
        console.warn(`Error parsing storage change for key "${key}":`, error);
      }
    };

    window.addEventListener(`${EVENT_PREFIX}${key}`, onLocal);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(`${EVENT_PREFIX}${key}`, onLocal);
      window.removeEventListener('storage', onStorage);
    };
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => (value instanceof Function ? value(prev) : value));
  }, []);

  return [storedValue, setValue, hydrated];
};

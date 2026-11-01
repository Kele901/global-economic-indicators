'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { fetchGlobalData } from '../../services/worldbank';
import { COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { countryName, theme as devTheme, type Theme } from '../development/ui';

export { Panel, Stat, ChapterMeta, ChartLoading, EmptyNote, countryName, fmt } from '../development/ui';

export type GlobalData = Awaited<ReturnType<typeof fetchGlobalData>>;

export interface InflationChapterProps {
  isDarkMode: boolean;
  data: GlobalData;
  selected: CountryKey[];
  onSelectedChange: (keys: CountryKey[]) => void;
}

// The development theme with the inflation page's blue accent.
export function theme(isDarkMode: boolean): Theme {
  const t = devTheme(isDarkMode);
  return {
    ...t,
    accent: isDarkMode ? 'text-blue-400' : 'text-blue-700',
    chipActive: isDarkMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-600 text-white border-blue-600',
  };
}

export const pct = (v: number | null | undefined, digits = 1) => (v == null ? '\u2014' : `${v.toFixed(digits)}%`);
export const pp = (v: number | null | undefined, digits = 1) =>
  v == null ? '\u2014' : `${v > 0 ? '+' : v < 0 ? '\u2212' : ''}${Math.abs(v).toFixed(digits)}pp`;

// Inflation spans -2% to 65,000%; keep the axis readable at both ends.
export function compactPct(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e6) return `${(v / 1e6).toFixed(0)}m%`;
  if (a >= 1e3) return `${(v / 1e3).toFixed(a >= 1e4 ? 0 : 1)}k%`;
  return `${v.toFixed(a < 10 ? 1 : 0)}%`;
}

export const INFLATION_DEF = { format: (v: number) => `${v.toFixed(1)}%`, unit: '%' };

export function Lede({ isDarkMode, children }: { isDarkMode: boolean; children: ReactNode }) {
  return <p className={`text-sm sm:text-base max-w-3xl -mt-3 mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{children}</p>;
}

export function Segmented<T extends string>({
  isDarkMode,
  options,
  value,
  onChange,
  label,
}: {
  isDarkMode: boolean;
  options: { id: NoInfer<T>; label: string }[];
  value: T;
  onChange: (v: NoInfer<T>) => void;
  label?: string;
}) {
  return (
    <div role="group" aria-label={label} className={`inline-flex flex-wrap gap-1 p-1 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            value === o.id
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-900 shadow'
              : isDarkMode
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const byName = (a: CountryKey, b: CountryKey) => countryName(a).localeCompare(countryName(b));

export function CountrySelect({
  isDarkMode,
  value,
  onChange,
  label,
  options = COUNTRY_KEYS,
}: {
  isDarkMode: boolean;
  value: CountryKey;
  onChange: (k: CountryKey) => void;
  label?: string;
  options?: readonly CountryKey[];
}) {
  const t = theme(isDarkMode);
  return (
    <label className={`inline-flex items-center gap-2 text-xs ${t.textSec}`}>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value as CountryKey)} className={`text-xs rounded-md border px-2 py-1 ${t.input}`}>
        {[...options].sort(byName).map((k) => (
          <option key={k} value={k}>
            {countryName(k)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CountryPicker({
  isDarkMode,
  selected,
  onChange,
  max = 8,
  options = COUNTRY_KEYS,
}: {
  isDarkMode: boolean;
  selected: CountryKey[];
  onChange: (keys: CountryKey[]) => void;
  max?: number;
  options?: readonly CountryKey[];
}) {
  const t = theme(isDarkMode);
  const toggle = (k: CountryKey) => {
    if (selected.includes(k)) onChange(selected.filter((s) => s !== k));
    else if (selected.length < max) onChange([...selected, k]);
  };
  return (
    <details className={`rounded-lg border ${t.inset}`}>
      <summary className={`cursor-pointer select-none px-3 py-2 text-xs font-medium ${t.text}`}>
        Countries: {selected.map(countryName).join(', ') || 'none'} <span className={t.textMuted}>({selected.length}/{max})</span>
      </summary>
      <div className="flex flex-wrap gap-1.5 p-3 pt-1">
        {[...options].sort(byName).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={selected.includes(k)}
            onClick={() => toggle(k)}
            className={`px-2 py-0.5 text-[11px] rounded-full border transition-colors ${selected.includes(k) ? t.chipActive : t.chip}`}
          >
            {countryName(k)}
          </button>
        ))}
      </div>
    </details>
  );
}

// Fetch once when `enabled` first turns true (set by RequestOnMount inside a lazy chapter).
export function useLazyFetch<T>(enabled: boolean, fetcher: () => Promise<T>): { data: T | null; loading: boolean; failed: boolean } {
  const [state, setState] = useState<{ data: T | null; loading: boolean; failed: boolean }>({ data: null, loading: false, failed: false });
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    fetcher()
      .then((data) => !cancelled && setState({ data, loading: false, failed: false }))
      .catch(() => !cancelled && setState({ data: null, loading: false, failed: true }));
    return () => {
      cancelled = true;
    };
    // The fetcher is a stable module-level function; refetching on identity change would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
  return state;
}

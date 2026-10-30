'use client';

import type { CSSProperties, ReactNode } from 'react';
import ChartMeta from '../ChartMeta';
import DataQualityBadge from '../DataQualityBadge';
import DataDownloadButton from '../DataDownloadButton';
import SocialShareMenu from '../SocialShareMenu';
import { slugify } from '../../lib/share';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, type CountryKey } from '../../utils/countryMappings';

export interface Theme {
  card: string;
  inset: string;
  text: string;
  textSec: string;
  textMuted: string;
  border: string;
  grid: string;
  axis: string;
  accent: string;
  chip: string;
  chipActive: string;
  input: string;
  tooltip: CSSProperties;
}

export function theme(isDarkMode: boolean): Theme {
  return isDarkMode
    ? {
        card: 'bg-gray-800 border-gray-700',
        inset: 'bg-gray-900/60 border-gray-700',
        text: 'text-white',
        textSec: 'text-gray-400',
        textMuted: 'text-gray-500',
        border: 'border-gray-700',
        grid: '#374151',
        axis: '#9ca3af',
        accent: 'text-emerald-400',
        chip: 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-500',
        chipActive: 'bg-emerald-600 text-white border-emerald-500',
        input: 'bg-gray-900 border-gray-700 text-white',
        tooltip: { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: 8, fontSize: 12 },
      }
    : {
        card: 'bg-white border-gray-200',
        inset: 'bg-gray-50 border-gray-200',
        text: 'text-gray-900',
        textSec: 'text-gray-600',
        textMuted: 'text-gray-500',
        border: 'border-gray-200',
        grid: '#e5e7eb',
        axis: '#6b7280',
        accent: 'text-emerald-700',
        chip: 'bg-white text-gray-700 border-gray-300 hover:border-gray-400',
        chipActive: 'bg-emerald-600 text-white border-emerald-600',
        input: 'bg-white border-gray-300 text-gray-900',
        tooltip: { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: 8, fontSize: 12 },
      };
}

export const countryName = (k: string) => COUNTRY_DISPLAY_NAMES[k as CountryKey] ?? k;

export const fmt = {
  n0: (v: number | null | undefined) => (v == null ? '\u2014' : Math.round(v).toLocaleString()),
  n1: (v: number | null | undefined) => (v == null ? '\u2014' : v.toFixed(1)),
  n2: (v: number | null | undefined) => (v == null ? '\u2014' : v.toFixed(2)),
  idx: (v: number | null | undefined) => (v == null ? '\u2014' : v.toFixed(3)),
  pct: (v: number | null | undefined) => (v == null ? '\u2014' : `${v.toFixed(1)}%`),
  usd: (v: number | null | undefined) => (v == null ? '\u2014' : `$${Math.round(v).toLocaleString()}`),
  usdK: (v: number | null | undefined) =>
    v == null ? '\u2014' : v >= 1000 ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `$${Math.round(v)}`,
};

export function ChapterHeader({
  isDarkMode,
  number,
  title,
  subtitle,
}: {
  isDarkMode: boolean;
  number: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5">
      <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
        Chapter {number}
      </div>
      <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      <p className={`text-sm sm:text-base max-w-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
    </div>
  );
}

export function ChapterMeta({
  isDarkMode,
  sourceIds,
  flags = [],
  download,
}: {
  isDarkMode: boolean;
  sourceIds: string[];
  flags?: ('estimate' | 'curated')[];
  download?: { filename: string; title: string; getData: () => Record<string, unknown>[] };
}) {
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      {sourceIds.map((id) => (
        <ChartMeta key={id} sourceId={id} isDarkMode={isDarkMode} />
      ))}
      {flags.map((f) => (
        <DataQualityBadge key={f} flag={f} isDarkMode={isDarkMode} />
      ))}
      {download && (
        <DataDownloadButton
          isDarkMode={isDarkMode}
          filename={download.filename}
          shareTitle={download.title}
          label="Data"
          size="sm"
          getData={download.getData}
        />
      )}
    </div>
  );
}

export function Panel({
  isDarkMode,
  title,
  subtitle,
  note,
  actions,
  children,
  className = '',
}: {
  isDarkMode: boolean;
  title: string;
  subtitle?: ReactNode;
  note?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const t = theme(isDarkMode);
  return (
    <div id={slugify(title)} className={`rounded-xl border p-4 sm:p-5 scroll-mt-24 ${t.card} ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="min-w-0">
          <h3 className={`text-base sm:text-lg font-semibold ${t.text}`}>{title}</h3>
          {subtitle && <p className={`text-xs sm:text-sm mt-0.5 ${t.textSec}`}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {actions}
          <SocialShareMenu title={title} isDarkMode={isDarkMode} size="sm" iconOnly className="shrink-0" />
        </div>
      </div>
      {children}
      {note && <p className={`text-[11px] mt-3 ${t.textMuted}`}>{note}</p>}
    </div>
  );
}

export function Segmented<T extends string>({
  isDarkMode,
  options,
  value,
  onChange,
}: {
  isDarkMode: boolean;
  options: { id: NoInfer<T>; label: string }[];
  value: T;
  onChange: (v: NoInfer<T>) => void;
}) {
  return (
    <div className={`inline-flex flex-wrap gap-1 p-1 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            value === o.id
              ? isDarkMode
                ? 'bg-emerald-600 text-white'
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

export function CountrySelect({
  isDarkMode,
  value,
  onChange,
  label,
  options = COUNTRY_KEYS as readonly CountryKey[],
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CountryKey)}
        className={`text-xs rounded-md border px-2 py-1 ${t.input}`}
      >
        {[...options]
          .sort((a, b) => countryName(a).localeCompare(countryName(b)))
          .map((k) => (
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
}: {
  isDarkMode: boolean;
  selected: CountryKey[];
  onChange: (keys: CountryKey[]) => void;
  max?: number;
}) {
  const t = theme(isDarkMode);
  const toggle = (k: CountryKey) => {
    if (selected.includes(k)) onChange(selected.filter((s) => s !== k));
    else if (selected.length < max) onChange([...selected, k]);
  };
  return (
    <details className={`rounded-lg border ${t.inset}`}>
      <summary className={`cursor-pointer select-none px-3 py-2 text-xs font-medium ${t.text}`}>
        Countries: {selected.map(countryName).join(', ') || 'none'}{' '}
        <span className={t.textMuted}>
          ({selected.length}/{max})
        </span>
      </summary>
      <div className="flex flex-wrap gap-1.5 p-3 pt-1">
        {[...COUNTRY_KEYS]
          .sort((a, b) => countryName(a).localeCompare(countryName(b)))
          .map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => toggle(k)}
              className={`px-2 py-0.5 text-[11px] rounded-full border transition-colors ${
                selected.includes(k) ? t.chipActive : t.chip
              }`}
            >
              {countryName(k)}
            </button>
          ))}
      </div>
    </details>
  );
}

export function Stat({
  isDarkMode,
  label,
  value,
  sub,
  tone,
}: {
  isDarkMode: boolean;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: string;
}) {
  const t = theme(isDarkMode);
  return (
    <div className={`p-3 rounded-lg border ${t.card}`}>
      <div className={`text-[11px] uppercase tracking-wider ${t.textMuted}`}>{label}</div>
      <div className={`text-xl font-semibold tabular-nums mt-0.5 ${tone ?? t.text}`}>{value}</div>
      {sub && <div className={`text-[11px] ${t.textMuted}`}>{sub}</div>}
    </div>
  );
}

export function ChartLoading({ isDarkMode, height = 320 }: { isDarkMode: boolean; height?: number }) {
  return (
    <div
      className={`rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-900/60' : 'bg-gray-100'}`}
      style={{ height }}
      aria-label="Loading chart"
    />
  );
}

export function ChapterLoadingGuard({
  isDarkMode,
  loading,
  height = 340,
  children,
}: {
  isDarkMode: boolean;
  loading: boolean;
  height?: number;
  children: ReactNode;
}) {
  return loading ? <ChartLoading isDarkMode={isDarkMode} height={height} /> : <>{children}</>;
}

export function EmptyNote({ isDarkMode, children }: { isDarkMode: boolean; children: ReactNode }) {
  return <p className={`text-sm py-8 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{children}</p>;
}

'use client';

// Public transparency page. Renders directly from the DATA_SOURCES registry
// in src/app/data/dataProvenance.ts. When a new dataset is registered,
// nothing needs to change here — it will appear automatically, grouped by
// category and filterable by live vs curated.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ThemeToggle from '../components/ThemeToggle';
import {
  DATA_SOURCES,
  CATEGORY_LABELS,
  isStale,
  type DataCategory,
  type DataSourceEntry,
} from '../data/dataProvenance';
import DataDownloadButton from '../components/DataDownloadButton';

type FreshnessFilter = 'all' | 'live' | 'curated';

export default function DataSourcesPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [filter, setFilter] = useState<FreshnessFilter>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DATA_SOURCES.filter(entry => {
      if (filter === 'live' && !entry.live) return false;
      if (filter === 'curated' && entry.live) return false;
      if (!q) return true;
      const hay = [
        entry.name,
        entry.provider,
        entry.category,
        entry.notes ?? '',
        ...(entry.seriesIds ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [filter, query]);

  const grouped = useMemo(() => {
    const map = new Map<DataCategory, DataSourceEntry[]>();
    filtered.forEach(entry => {
      const list = map.get(entry.category) ?? [];
      list.push(entry);
      map.set(entry.category, list);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const totalCount = DATA_SOURCES.length;
  const liveCount = DATA_SOURCES.filter(e => e.live).length;
  const curatedCount = totalCount - liveCount;
  const staleCount = DATA_SOURCES.filter(e => isStale(e)).length;

  const bg = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textPrimary = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const heroBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const chipInactive = isDarkMode
    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
    : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900';
  const chipActive = isDarkMode
    ? 'bg-sky-500/20 border-sky-500/40 text-sky-200'
    : 'bg-sky-100 border-sky-400 text-sky-800';

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <div className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>
              Reference
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${textPrimary}`}>
              Data Sources
            </h1>
            <p className={`text-base sm:text-lg max-w-3xl ${textSec}`}>
              Every dataset the site consumes, with its provider, refresh cadence and last-updated
              stamp. Live series refresh on every page load; curated snapshots list the publication
              date and get an amber banner on their pages once they age past twelve months.
            </p>
          </div>
          <ThemeToggle isDarkMode={isDarkMode} className="self-end sm:self-auto" />
        </div>

        <div id="data-sources-registry" className={`rounded-2xl border p-4 sm:p-6 mb-8 ${heroBg}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Total datasets</div>
              <div className={`text-2xl font-bold mt-1 ${textPrimary}`}>{totalCount}</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Live feeds</div>
              <div className="text-2xl font-bold mt-1 text-emerald-500">{liveCount}</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Curated snapshots</div>
              <div className="text-2xl font-bold mt-1 text-sky-500">{curatedCount}</div>
            </div>
            <div className={`p-3 rounded-lg border ${cardBg}`}>
              <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Stale (&gt;12 mo)</div>
              <div className={`text-2xl font-bold mt-1 ${staleCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {staleCount}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-5">
            {(['all', 'live', 'curated'] as FreshnessFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  filter === f ? chipActive : chipInactive
                }`}
              >
                {f === 'all' ? 'All' : f === 'live' ? 'Live only' : 'Curated only'}
              </button>
            ))}
            <div className="flex-1" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search provider, series, indicator…"
              className={`text-sm px-3 py-1.5 rounded-md border w-full sm:w-72 ${
                isDarkMode
                  ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
            <DataDownloadButton
              isDarkMode={isDarkMode}
              filename="data-sources-registry"
              label="Export registry"
              shareTitle="Data sources registry"
              size="md"
              getData={() =>
                filtered.map(entry => ({
                  id: entry.id,
                  name: entry.name,
                  category: entry.category,
                  provider: entry.provider,
                  live: entry.live,
                  refreshCadence: entry.refreshCadence,
                  lastUpdated: entry.lastUpdated,
                  seriesIds: entry.seriesIds?.join('; ') ?? '',
                  sourceUrl: entry.sourceUrl ?? '',
                  notes: entry.notes ?? '',
                }))
              }
            />
          </div>
        </div>

        {grouped.length === 0 && (
          <div className={`rounded-lg border p-8 text-center ${cardBg} ${textSec}`}>
            No datasets match this filter.
          </div>
        )}

        {grouped.map(([category, entries]) => (
          <section key={category} className="mb-10">
            <div className={`flex items-baseline justify-between mb-4 pb-2 border-b ${
              isDarkMode ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold ${textPrimary}`}>
                {CATEGORY_LABELS[category]}
              </h2>
              <span className={`text-xs ${textMuted}`}>
                {entries.length} dataset{entries.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {entries.map(entry => (
                <DatasetCard
                  key={entry.id}
                  entry={entry}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </section>
        ))}

        <div className={`text-xs mt-8 pt-6 border-t ${isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-500'}`}>
          <p>
            Every entry above is registered in{' '}
            <code className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              src/app/data/dataProvenance.ts
            </code>
            . When a live feed is proxied through a Next.js API route (World Bank, FRED, Frankfurter,
            EIA), the proxy adds server-side retry, IPv4-first DNS resolution and CDN caching
            headers on top of the upstream — see the /api/* routes for details.
          </p>
        </div>
      </div>
    </div>
  );
}

function DatasetCard({ entry, isDarkMode }: { entry: DataSourceEntry; isDarkMode: boolean }) {
  const stale = isStale(entry);
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';

  const badgeClasses = entry.live
    ? isDarkMode
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : stale
      ? isDarkMode
        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
        : 'bg-amber-50 text-amber-700 border-amber-200'
      : isDarkMode
        ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
        : 'bg-sky-50 text-sky-700 border-sky-200';

  const badgeText = entry.live ? 'Live' : stale ? 'Curated · stale' : 'Curated';

  return (
    <div className={`rounded-lg border p-4 ${cardBg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`text-sm font-semibold ${textPrimary}`}>{entry.name}</div>
          <div className={`text-xs mt-0.5 ${textSec}`}>
            {entry.provider} · {entry.refreshCadence}
          </div>
        </div>
        <span className={`shrink-0 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${badgeClasses}`}>
          {badgeText}
        </span>
      </div>

      {entry.notes && (
        <p className={`text-xs mt-2 leading-relaxed ${textSec}`}>{entry.notes}</p>
      )}

      {entry.seriesIds && entry.seriesIds.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {entry.seriesIds.slice(0, 6).map(id => (
            <code
              key={id}
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isDarkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {id}
            </code>
          ))}
          {entry.seriesIds.length > 6 && (
            <span className={`text-[10px] ${textMuted}`}>
              +{entry.seriesIds.length - 6} more
            </span>
          )}
        </div>
      )}

      <div className={`mt-3 flex items-center justify-between text-[11px] ${textMuted}`}>
        <span>
          {entry.live ? 'Refreshed live' : `Snapshot: ${entry.lastUpdated}`}
        </span>
        {entry.sourceUrl && (
          <Link
            href={entry.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline underline-offset-2 ${
              isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Source ↗
          </Link>
        )}
      </div>
    </div>
  );
}

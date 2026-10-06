'use client';

import { useMemo, useState } from 'react';
import { CHANGELOG, type ChangeTag } from '../data/changelog';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ThemeToggle from '../components/ThemeToggle';
import Breadcrumbs from '../components/Breadcrumbs';

const TAG_STYLES: Record<ChangeTag, { bg: string; text: string; label: string }> = {
  feature:   { bg: 'bg-blue-100 dark:bg-blue-500/20',       text: 'text-blue-700 dark:text-blue-300',       label: 'Feature'   },
  ledger:    { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', label: 'Ledger'    },
  perf:      { bg: 'bg-purple-100 dark:bg-purple-500/20',   text: 'text-purple-700 dark:text-purple-300',   label: 'Performance' },
  a11y:      { bg: 'bg-amber-100 dark:bg-amber-500/20',     text: 'text-amber-700 dark:text-amber-300',     label: 'Accessibility' },
  trust:     { bg: 'bg-rose-100 dark:bg-rose-500/20',       text: 'text-rose-700 dark:text-rose-300',       label: 'Trust'     },
  data:      { bg: 'bg-cyan-100 dark:bg-cyan-500/20',       text: 'text-cyan-700 dark:text-cyan-300',       label: 'Data'      },
  fix:       { bg: 'bg-slate-100 dark:bg-slate-500/20',     text: 'text-slate-700 dark:text-slate-300',     label: 'Fix'       },
};

const ALL_TAGS: ChangeTag[] = ['feature', 'ledger', 'perf', 'a11y', 'trust', 'data', 'fix'];

export default function ChangelogPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<ChangeTag | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHANGELOG.filter(entry => {
      if (activeTag !== 'all' && !entry.tags.includes(activeTag)) return false;
      if (!q) return true;
      const hay = `${entry.title} ${entry.highlights.join(' ')} ${entry.version ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, activeTag]);

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs isDarkMode={isDarkMode} />

        <header className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-3xl sm:text-4xl font-bold">Changelog</h1>
            <ThemeToggle isDarkMode={isDarkMode} className="mt-2" />
          </div>
          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Everything that&apos;s shipped on globaleconindicators.info. Newest first. Filter by category or search for a keyword.
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <label htmlFor="changelog-search" className="sr-only">Search changelog</label>
          <input
            id="changelog-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search releases..."
            className={`flex-1 rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-500' : 'bg-white border-gray-300 placeholder:text-gray-400'
            }`}
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTag('all')}
              className={`text-xs px-2.5 py-1.5 rounded-full border ${
                activeTag === 'all'
                  ? (isDarkMode ? 'bg-white text-gray-900 border-white' : 'bg-gray-900 text-white border-gray-900')
                  : (isDarkMode ? 'border-gray-700 text-gray-300 hover:border-gray-500' : 'border-gray-300 text-gray-600 hover:border-gray-500')
              }`}
            >
              All
            </button>
            {ALL_TAGS.map(tag => {
              const active = activeTag === tag;
              const style = TAG_STYLES[tag];
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`text-xs px-2.5 py-1.5 rounded-full border ${
                    active
                      ? `${style.bg} ${style.text} border-transparent`
                      : (isDarkMode ? 'border-gray-700 text-gray-300 hover:border-gray-500' : 'border-gray-300 text-gray-600 hover:border-gray-500')
                  }`}
                >
                  {style.label}
                </button>
              );
            })}
          </div>
        </div>

        <ol className="space-y-8">
          {filtered.map((entry, i) => (
            <li
              key={`${entry.date}-${i}`}
              className={`rounded-xl border p-5 sm:p-6 ${isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
                <h2 className="text-lg sm:text-xl font-semibold">{entry.title}</h2>
                <div className={`text-xs tabular-nums ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {entry.version ? `${entry.version} · ` : ''}{new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {entry.tags.map(tag => {
                  const style = TAG_STYLES[tag];
                  return (
                    <span key={tag} className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                  );
                })}
              </div>
              <ul className={`list-disc list-outside ml-5 space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {entry.highlights.map((h, j) => (
                  <li key={j}>{h}</li>
                ))}
              </ul>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>No releases match that search.</li>
          )}
        </ol>
      </div>
    </div>
  );
}

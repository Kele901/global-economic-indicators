'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { GUIDES, GUIDE_TOPICS, type GuideLevel, type GuideTopic } from '../data/guides';

const LEVELS: GuideLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

const LEVEL_STYLES: Record<GuideLevel, { light: string; dark: string }> = {
  Beginner: { light: 'bg-emerald-50 text-emerald-700', dark: 'bg-emerald-900/30 text-emerald-300' },
  Intermediate: { light: 'bg-amber-50 text-amber-700', dark: 'bg-amber-900/30 text-amber-300' },
  Advanced: { light: 'bg-rose-50 text-rose-700', dark: 'bg-rose-900/30 text-rose-300' },
};

export default function GuidesIndexPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [topic, setTopic] = useState<GuideTopic | 'All'>('All');
  const [level, setLevel] = useState<GuideLevel | 'All'>('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUIDES.filter(g => {
      if (topic !== 'All' && g.topic !== topic) return false;
      if (level !== 'All' && g.level !== level) return false;
      if (!q) return true;
      return (
        g.title.toLowerCase().includes(q) ||
        g.blurb.toLowerCase().includes(q) ||
        g.topic.toLowerCase().includes(q)
      );
    });
  }, [topic, level, query]);

  const grouped = useMemo(() => {
    return GUIDE_TOPICS.map(t => ({ topic: t, guides: filtered.filter(g => g.topic === t) })).filter(
      group => group.guides.length > 0,
    );
  }, [filtered]);

  const totalMinutes = GUIDES.reduce((sum, g) => sum + g.minutes, 0);

  const card = isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-blue-300';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
      active
        ? 'bg-blue-600 border-blue-600 text-white'
        : isDarkMode
          ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
    }`;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-5xl mx-auto p-6 sm:p-8">
        <nav aria-label="Breadcrumb" className={`text-xs mb-4 ${muted}`}>
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-1.5">/</span>
          <span aria-current="page">Guides</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Economic Guides</h1>
        <p className={`text-base leading-relaxed mb-2 max-w-3xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Plain-English explanations of the indicators, institutions and cycles behind the charts on
          this site. Every guide is free, self-contained and written to be read in one sitting.
        </p>
        <p className={`text-xs mb-8 ${muted}`}>
          {GUIDES.length} guides · roughly {Math.round(totalMinutes / 60)} hours of reading in total
        </p>

        {/* Filters */}
        <div className="space-y-3 mb-8">
          <label className="sr-only" htmlFor="guide-search">Search guides</label>
          <input
            id="guide-search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search guides by title or topic…"
            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            }`}
          />

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
            <button onClick={() => setTopic('All')} className={chip(topic === 'All')} aria-pressed={topic === 'All'}>
              All topics
            </button>
            {GUIDE_TOPICS.map(t => (
              <button key={t} onClick={() => setTopic(t)} className={chip(topic === t)} aria-pressed={topic === t}>
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by level">
            <button onClick={() => setLevel('All')} className={chip(level === 'All')} aria-pressed={level === 'All'}>
              Any level
            </button>
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)} className={chip(level === l)} aria-pressed={level === l}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <p className={`text-xs mb-4 ${muted}`} role="status">
          Showing {filtered.length} of {GUIDES.length} guides
        </p>

        {/* Results */}
        {grouped.length === 0 ? (
          <div className={`rounded-xl border p-8 text-center ${card}`}>
            <p className="font-medium mb-1">No guides match those filters.</p>
            <button
              onClick={() => { setTopic('All'); setLevel('All'); setQuery(''); }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(({ topic: t, guides }) => (
              <section key={t}>
                <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${muted}`}>{t}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {guides.map(g => (
                    <Link
                      key={g.slug}
                      href={`/guides/${g.slug}`}
                      className={`block rounded-xl border p-5 transition-colors ${card}`}
                    >
                      <h3 className="font-semibold text-base mb-2 leading-snug">{g.title}</h3>
                      <p className={`text-sm leading-relaxed mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {g.blurb}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                            isDarkMode ? LEVEL_STYLES[g.level].dark : LEVEL_STYLES[g.level].light
                          }`}
                        >
                          {g.level}
                        </span>
                        <span className={`text-xs ${muted}`}>{g.minutes} min read</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Reference callout */}
        <div className={`mt-12 rounded-xl border p-6 ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
          <h2 className="text-lg font-semibold mb-2">Looking for a definition?</h2>
          <p className={`text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            The glossary covers both the macroeconomic vocabulary used across these guides and the exact
            formula, unit and source behind every metric charted on the site.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/glossary" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Open the glossary &rarr;
            </Link>
            <Link href="/learn" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Take the 23-lesson course &rarr;
            </Link>
            <Link href="/methodology" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Read the methodology &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

// Hand-rolled command palette (no external dependency). Opens on
// Cmd/Ctrl-K or "/" and indexes every route, every tracked country
// dossier, and every top metric. Keyboard-first: arrows navigate,
// Enter goes, Esc closes.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG, type CountryKey } from '../utils/countryMappings';

interface Entry {
  id: string;
  label: string;
  category: 'Page' | 'Country' | 'Metric';
  href: string;
  hint?: string;
}

const PAGE_ENTRIES: Entry[] = [
  { id: 'home',              label: 'Dashboard',              category: 'Page', href: '/', hint: 'Main indicators grid' },
  { id: 'compare',           label: 'Compare',                category: 'Page', href: '/compare' },
  { id: 'heatmap',           label: 'Global Heatmap',         category: 'Page', href: '/global-heatmap' },
  { id: 'learn',             label: 'Learn Guide',            category: 'Page', href: '/learn', hint: 'Ages 13+' },
  { id: 'monetary',          label: 'Monetary Policy',        category: 'Page', href: '/monetary-policy' },
  { id: 'debt',              label: 'Debt Ledger',            category: 'Page', href: '/debt' },
  { id: 'outlook',           label: 'Forecasts & Outlook',    category: 'Page', href: '/outlook' },
  { id: 'simulator',         label: 'Scenario Simulator',     category: 'Page', href: '/simulator' },
  { id: 'development',       label: 'Development Index',      category: 'Page', href: '/development' },
  { id: 'inequality',        label: 'Inequality',             category: 'Page', href: '/inequality' },
  { id: 'trade-network',     label: 'Trade Network',          category: 'Page', href: '/trade-network' },
  { id: 'economic-gravity',  label: 'Economic Gravity',       category: 'Page', href: '/economic-gravity' },
  { id: 'economic-cycles',   label: 'Economic Cycles',        category: 'Page', href: '/economic-cycles' },
  { id: 'resources',         label: 'Resource Atlas',         category: 'Page', href: '/resources' },
  { id: 'defense-ledger',    label: 'Defense Ledger',         category: 'Page', href: '/defense-ledger' },
  { id: 'climate-ledger',    label: 'Climate Ledger',         category: 'Page', href: '/climate-ledger' },
  { id: 'trade-ledger',      label: 'Trade Ledger',           category: 'Page', href: '/trade-ledger' },
  { id: 'migration-ledger',  label: 'Migration Ledger',       category: 'Page', href: '/migration-ledger' },
  { id: 'ai-ledger',         label: 'AI Ledger',              category: 'Page', href: '/ai-ledger' },
  { id: 'health-ledger',     label: 'Health Ledger',          category: 'Page', href: '/health-ledger' },
  { id: 'energy-ledger',     label: 'Energy Ledger',          category: 'Page', href: '/energy-ledger' },
  { id: 'labor-ledger',      label: 'Labor Ledger',           category: 'Page', href: '/labor-ledger' },
  { id: 'currency',          label: 'Currency Hierarchy',     category: 'Page', href: '/currency-hierarchy' },
  { id: 'trading-places',    label: 'Trading Places',         category: 'Page', href: '/trading-places' },
  { id: 'inflation',         label: 'Inflation',              category: 'Page', href: '/inflation' },
  { id: 'technology',        label: 'Technology',             category: 'Page', href: '/technology' },
  { id: 'cultural',          label: 'Cultural Capital',       category: 'Page', href: '/cultural-capital' },
  { id: 'inflation-calc',    label: 'Inflation Calculator',   category: 'Page', href: '/inflation-calculator' },
  { id: 'watchlist',         label: 'Watchlist & Alerts',     category: 'Page', href: '/watchlist' },
  { id: 'reports',           label: 'Report Builder',         category: 'Page', href: '/reports' },
  { id: 'embed-builder',     label: 'Embed Builder',          category: 'Page', href: '/embed-builder' },
  { id: 'glossary',          label: 'Glossary',               category: 'Page', href: '/glossary' },
  { id: 'guides',            label: 'Reading Economic Data',  category: 'Page', href: '/guides/reading-economic-data' },
  { id: 'data-sources',      label: 'Data Sources',           category: 'Page', href: '/data-sources' },
  { id: 'about',             label: 'About',                  category: 'Page', href: '/about' },
];

const COUNTRY_ENTRIES: Entry[] = COUNTRY_KEYS.map(k => ({
  id: `country-${k}`,
  label: COUNTRY_DISPLAY_NAMES[k as CountryKey],
  category: 'Country' as const,
  href: `/country/${COUNTRY_KEY_TO_SLUG[k as CountryKey]}`,
}));

const METRIC_ENTRIES: Entry[] = [
  { id: 'm-gdp',        label: 'GDP Growth',                category: 'Metric', href: '/?metric=gdpGrowth' },
  { id: 'm-cpi',        label: 'Inflation (CPI)',           category: 'Metric', href: '/?metric=inflationRates' },
  { id: 'm-rates',      label: 'Interest / Policy Rates',   category: 'Metric', href: '/monetary-policy' },
  { id: 'm-unemp',      label: 'Unemployment',              category: 'Metric', href: '/?metric=unemploymentRates' },
  { id: 'm-debt',       label: 'Government Debt / GDP',     category: 'Metric', href: '/debt' },
  { id: 'm-fx',         label: 'FX Rates',                  category: 'Metric', href: '/currency-hierarchy' },
  { id: 'm-trade',      label: 'Trade Balance',             category: 'Metric', href: '/trade-ledger' },
  { id: 'm-co2',        label: 'CO₂ Emissions',             category: 'Metric', href: '/climate-ledger' },
  { id: 'm-life-exp',   label: 'Life Expectancy',           category: 'Metric', href: '/health-ledger' },
  { id: 'm-wages',      label: 'Median Wages',              category: 'Metric', href: '/labor-ledger' },
  { id: 'm-nuclear',    label: 'Nuclear Reactors',          category: 'Metric', href: '/energy-ledger' },
  { id: 'm-military',   label: 'Military Spending',         category: 'Metric', href: '/defense-ledger' },
  { id: 'm-remit',      label: 'Remittances',               category: 'Metric', href: '/migration-ledger' },
  { id: 'm-patents',    label: 'Patents',                   category: 'Metric', href: '/ai-ledger' },
];

const ALL_ENTRIES = [...PAGE_ENTRIES, ...COUNTRY_ENTRIES, ...METRIC_ENTRIES];

function score(entry: Entry, q: string): number {
  if (!q) return 1;
  const lq = q.toLowerCase();
  const l = entry.label.toLowerCase();
  if (l === lq) return 100;
  if (l.startsWith(lq)) return 80;
  if (l.includes(lq)) return 50;
  // fuzzy: all letters in order
  let idx = 0;
  for (const c of lq) { const j = l.indexOf(c, idx); if (j === -1) return 0; idx = j + 1; }
  return 10;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        return;
      }
      if (!open && e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onCustomOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('cursor:cmd-palette:open', onCustomOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('cursor:cmd-palette:open', onCustomOpen);
    };
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
    else { setQuery(''); setSelected(0); }
  }, [open]);

  const results = useMemo(() => {
    const scored = ALL_ENTRIES.map(e => ({ e, s: score(e, query) })).filter(x => x.s > 0);
    scored.sort((a, b) => b.s - a.s || a.e.label.localeCompare(b.e.label));
    return scored.slice(0, 30).map(x => x.e);
  }, [query]);

  useEffect(() => { setSelected(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[selected] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected, open]);

  if (!open) return null;

  const activate = (entry: Entry) => {
    setOpen(false);
    router.push(entry.href);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/50 backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-label="Search commands"
    >
      <div
        className="w-full max-w-xl rounded-xl border shadow-2xl bg-white dark:bg-gray-900 dark:border-gray-700 border-gray-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(results.length - 1, s + 1)); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(0, s - 1)); }
                else if (e.key === 'Enter' && results[selected]) { e.preventDefault(); activate(results[selected]); }
                else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
              }}
              placeholder="Search countries, ledgers, metrics…"
              className="flex-1 bg-transparent border-0 outline-none text-base text-gray-900 dark:text-white placeholder-gray-400"
            />
            <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">Esc</kbd>
          </div>
        </div>
        <ul ref={listRef} className="max-h-[50vh] overflow-y-auto py-2" role="listbox">
          {results.length === 0 && (
            <li className="px-4 py-6 text-sm text-center text-gray-400">No matches.</li>
          )}
          {results.map((r, i) => (
            <li
              key={r.id}
              role="option"
              aria-selected={i === selected}
              onMouseEnter={() => setSelected(i)}
              onClick={() => activate(r)}
              className={`cursor-pointer px-4 py-2 text-sm flex items-center justify-between ${
                i === selected
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-[10px] uppercase tracking-wider ${i === selected ? 'text-blue-200' : 'text-gray-400'}`}>{r.category}</span>
                <span className="truncate">{r.label}</span>
              </div>
              {r.hint && (
                <span className={`text-[11px] ${i === selected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>{r.hint}</span>
              )}
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <span>↑↓ navigate · ↵ open</span>
          <span>{results.length} result{results.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import ThemeToggle from '../components/ThemeToggle';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { economicMetrics } from '../data/economicMetrics';
import { GLOSSARY_TERMS } from '../data/glossaryTerms';

type Tab = 'metrics' | 'terms';

const CATEGORIES: Record<string, string[]> = {
  'Monetary': ['interestRate', 'interestRates', 'inflationRate', 'inflationRates', 'cpiData', 'cpi', 'exchangeRate', 'currencyStrength'],
  'Growth': ['gdpGrowth', 'gdpPerCapitaPPP', 'laborProductivity', 'gdpShare', 'economicGravity'],
  'Fiscal': ['governmentDebt', 'governmentSpending', 'budgetBalance', 'taxRevenue', 'publicDebtService', 'militaryExpenditure', 'socialSpending'],
  'Labor': ['unemploymentRate', 'unemploymentRates', 'employmentRate', 'employmentRates', 'laborForceParticipation', 'youthUnemployment', 'femaleLaborForce'],
  'Trade': ['tradeBalance', 'fdi', 'tradeOpenness', 'tariffRate', 'tourismReceipts', 'currentAccount', 'exports', 'imports', 'ictExports'],
  'Social': ['giniCoefficient', 'povertyRate', 'lifeExpectancy', 'healthcareExpenditure', 'educationExpenditure', 'urbanPopulation'],
  'Technology': ['rdSpending', 'internetUsers', 'mobileSubscriptions', 'scientificPublications', 'patentApplications', 'hightechExports'],
  'Industry': ['manufacturingValueAdded', 'servicesValueAdded', 'agriculturalValueAdded', 'householdConsumption', 'marketCapitalization', 'privateInvestment', 'newBusinessDensity'],
  'Environment': ['co2Emissions', 'renewableEnergy', 'energyConsumption'],
};

export default function GlossaryPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [tab, setTab] = useState<Tab>('metrics');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // ?tab=terms is where the retired /guides/glossary route redirects to. Read it
  // from the URL directly rather than via useSearchParams, which would force the
  // whole page into dynamic rendering.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tab') === 'terms') {
      setTab('terms');
    }
  }, []);

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

  const selectTab = (next: Tab) => {
    setTab(next);
    setSearch('');
    setActiveCategory(null);
    window.history.replaceState(null, '', next === 'terms' ? '/glossary?tab=terms' : '/glossary');
  };

  const allMetrics = useMemo(() => {
    const seen = new Set<string>();
    return Object.entries(economicMetrics)
      .filter(([, info]) => {
        if (seen.has(info.title)) return false;
        seen.add(info.title);
        return true;
      })
      .map(([key, info]) => ({ key, ...info }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  const filteredMetrics = useMemo(() => {
    let entries = allMetrics;
    if (activeCategory) {
      const keys = new Set(CATEGORIES[activeCategory] || []);
      entries = entries.filter(e => keys.has(e.key));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      entries = entries.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    return entries;
  }, [allMetrics, activeCategory, search]);

  const sortedTerms = useMemo(
    () => [...GLOSSARY_TERMS].sort((a, b) => a.term.localeCompare(b.term)),
    [],
  );

  const filteredTerms = useMemo(() => {
    if (!search.trim()) return sortedTerms;
    const q = search.toLowerCase();
    return sortedTerms.filter(t => t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q));
  }, [sortedTerms, search]);

  const activeCount = tab === 'metrics' ? filteredMetrics.length : filteredTerms.length;

  const letters = useMemo(() => {
    const source = tab === 'metrics'
      ? filteredMetrics.map(e => e.title)
      : filteredTerms.map(t => t.term);
    return Array.from(new Set(source.map(s => s[0].toUpperCase()))).sort();
  }, [tab, filteredMetrics, filteredTerms]);

  const tc = isDarkMode ? {
    bg: 'bg-gray-900', card: 'bg-gray-800 border-gray-700', text: 'text-white',
    textSec: 'text-gray-400', textMuted: 'text-gray-500', inputBg: 'bg-gray-700 border-gray-600 text-white placeholder-gray-500',
    badge: 'bg-gray-700 text-gray-300', activeBtn: 'bg-blue-500/20 border-blue-500 text-blue-400',
    inactiveBtn: 'border-gray-600 text-gray-400 hover:border-gray-500',
    jump: 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700',
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', textMuted: 'text-gray-400', inputBg: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
    badge: 'bg-gray-100 text-gray-600', activeBtn: 'bg-blue-50 border-blue-500 text-blue-600',
    inactiveBtn: 'border-gray-300 text-gray-500 hover:border-gray-400',
    jump: 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200',
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Breadcrumb" className={`text-xs mb-4 ${tc.textSec}`}>
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-1.5">/</span>
          <span aria-current="page">Glossary</span>
        </nav>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Economic Glossary</h1>
            <p className={tc.textSec}>
              {allMetrics.length} charted metrics and {sortedTerms.length} macroeconomic terms, in one place
            </p>
          </div>
          <ThemeToggle isDarkMode={isDarkMode} />
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Glossary sections" className={`flex gap-1 p-1 rounded-xl mb-6 mt-6 w-full sm:w-auto sm:inline-flex ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
          {([
            { id: 'metrics' as Tab, label: `Metrics (${allMetrics.length})` },
            { id: 'terms' as Tab, label: `Terms (${sortedTerms.length})` },
          ]).map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => selectTab(t.id)}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? isDarkMode ? 'bg-gray-900 text-white shadow' : 'bg-white text-gray-900 shadow-sm'
                  : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={`rounded-xl border p-4 sm:p-6 mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          {tab === 'metrics' ? (
            <>
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Metrics charted on this site</h2>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Every indicator plotted anywhere on the platform, with its definition, formula, unit,
                reporting frequency and upstream source. Use this tab when you want to know exactly what
                a number on a chart is measuring.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Macroeconomic vocabulary</h2>
              <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Plain-English definitions of the concepts behind the data, from aggregate demand to the
                zero lower bound. Use this tab when a guide or article uses a term you have not met before.
              </p>
            </>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <label className="sr-only" htmlFor="glossary-search">Search the glossary</label>
          <input
            id="glossary-search"
            type="search"
            placeholder={tab === 'metrics' ? 'Search metrics and definitions…' : 'Search terms and definitions…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm ${tc.inputBg}`}
          />
        </div>

        {/* Category filters (metrics only) */}
        {tab === 'metrics' && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${!activeCategory ? tc.activeBtn : tc.inactiveBtn}`}
            >
              All ({allMetrics.length})
            </button>
            {Object.entries(CATEGORIES).map(([cat, keys]) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${activeCategory === cat ? tc.activeBtn : tc.inactiveBtn}`}
              >
                {cat} ({keys.length})
              </button>
            ))}
          </div>
        )}

        {/* Alphabet jump */}
        <div className="flex flex-wrap gap-1 mb-6">
          {letters.map(l => (
            <a
              key={l}
              href={`#letter-${l}`}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${tc.jump}`}
            >
              {l}
            </a>
          ))}
        </div>

        {tab === 'metrics' ? (
          <div className="space-y-3">
            {letters.map(letter => (
              <div key={letter} id={`letter-${letter}`}>
                <h2 className={`text-lg font-bold mb-2 mt-4 ${tc.textSec}`}>{letter}</h2>
                {filteredMetrics
                  .filter(e => e.title[0].toUpperCase() === letter)
                  .map(entry => (
                    <div key={entry.key} className={`rounded-xl border p-4 sm:p-5 mb-3 ${tc.card}`}>
                      <h3 className="text-lg font-semibold mb-2">{entry.title}</h3>
                      <p className={`text-sm mb-3 ${tc.textSec}`}>{entry.description}</p>
                      {entry.formula && (
                        <div className={`text-xs px-3 py-2 rounded-lg mb-3 font-mono ${tc.badge}`}>{entry.formula}</div>
                      )}
                      <p className={`text-sm mb-2 ${tc.textSec}`}>
                        <strong className={tc.text}>Interpretation:</strong> {entry.interpretation}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-3">
                        <span className={`text-xs px-2 py-1 rounded ${tc.badge}`}>{entry.frequency}</span>
                        <span className={`text-xs px-2 py-1 rounded ${tc.badge}`}>{entry.units}</span>
                        <span className={`text-xs px-2 py-1 rounded ${tc.badge}`}>{entry.dataSource}</span>
                      </div>
                      {entry.relatedMetrics && entry.relatedMetrics.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={`text-xs ${tc.textMuted}`}>Related:</span>
                          {entry.relatedMetrics.map((rm: string) => (
                            <span key={rm} className={`text-xs px-2 py-0.5 rounded-full ${tc.badge}`}>{rm}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {letters.map(letter => (
              <section key={letter} id={`letter-${letter}`}>
                <h2 className={`text-2xl font-bold mb-4 pb-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {letter}
                </h2>
                <div className="space-y-3">
                  {filteredTerms
                    .filter(t => t.term[0].toUpperCase() === letter)
                    .map(t => (
                      <div key={t.term} className={`rounded-xl border p-4 ${tc.card}`}>
                        <h3 className="font-semibold mb-1">{t.term}</h3>
                        <p className={`text-sm leading-relaxed ${tc.textSec}`}>{t.def}</p>
                      </div>
                    ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {activeCount === 0 && (
          <div className="text-center py-12">
            <p className={`text-lg ${tc.textSec}`}>No matching entries found</p>
            <p className={`text-sm ${tc.textMuted}`}>Try a different search or category</p>
          </div>
        )}

        <section className={`mt-12 p-6 rounded-xl border ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
          <h2 className="text-xl font-semibold mb-3">Go deeper</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/guides" className="text-blue-600 dark:text-blue-400 hover:underline">All guides</Link>
              {' '}&mdash; longer explanations of the concepts defined here
            </li>
            <li>
              <Link href="/learn" className="text-blue-600 dark:text-blue-400 hover:underline">Learn</Link>
              {' '}&mdash; a 23-lesson course that builds the vocabulary from scratch
            </li>
            <li>
              <Link href="/methodology" className="text-blue-600 dark:text-blue-400 hover:underline">Methodology</Link>
              {' '}&mdash; how each metric is sourced and processed
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

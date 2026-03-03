'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState, useMemo } from 'react';
import { economicMetrics } from '../data/economicMetrics';

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
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  const allEntries = useMemo(() => {
    const seen = new Set<string>();
    return Object.entries(economicMetrics)
      .filter(([key, info]) => {
        if (seen.has(info.title)) return false;
        seen.add(info.title);
        return true;
      })
      .map(([key, info]) => ({ key, ...info }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  const filtered = useMemo(() => {
    let entries = allEntries;
    if (activeCategory) {
      const keys = new Set(CATEGORIES[activeCategory] || []);
      entries = entries.filter(e => keys.has(e.key));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      entries = entries.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    }
    return entries;
  }, [allEntries, activeCategory, search]);

  const letters = useMemo(() => {
    const ls = new Set(filtered.map(e => e.title[0].toUpperCase()));
    return Array.from(ls).sort();
  }, [filtered]);

  const tc = isDarkMode ? {
    bg: 'bg-gray-900', card: 'bg-gray-800 border-gray-700', text: 'text-white',
    textSec: 'text-gray-400', textMuted: 'text-gray-500', inputBg: 'bg-gray-700 border-gray-600 text-white placeholder-gray-500',
    badge: 'bg-gray-700 text-gray-300', activeBtn: 'bg-blue-500/20 border-blue-500 text-blue-400',
    inactiveBtn: 'border-gray-600 text-gray-400 hover:border-gray-500',
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', textMuted: 'text-gray-400', inputBg: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
    badge: 'bg-gray-100 text-gray-600', activeBtn: 'bg-blue-50 border-blue-500 text-blue-600',
    inactiveBtn: 'border-gray-300 text-gray-500 hover:border-gray-400',
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Economic Glossary</h1>
            <p className={`${tc.textSec}`}>Browse and search {allEntries.length} economic terms and indicators</p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Light</span>
            <button
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 shadow-sm ${isDarkMode ? 'translate-x-6' : ''}`} />
            </button>
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dark</span>
          </div>
        </div>

        <div className={`rounded-xl border p-4 sm:p-6 mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">About This Glossary</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Every economic indicator on this site is listed here with its definition, unit of measurement, and
            interpretation guidance. Metrics are organized into categories (Core Economic, Fiscal &amp; Debt,
            Trade &amp; Investment, etc.) so you can browse related indicators together. Each entry includes a
            description explaining what the metric measures and why it matters for economic analysis.
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Use the search bar to find a specific term, or click a category filter to browse metrics by topic.
            The alphabet sidebar lets you jump to entries starting with a specific letter.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search terms, definitions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm ${tc.inputBg}`}
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${!activeCategory ? tc.activeBtn : tc.inactiveBtn}`}
          >
            All ({allEntries.length})
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

        {/* Alphabet Jump */}
        <div className="flex flex-wrap gap-1 mb-6">
          {letters.map(l => (
            <a key={l} href={`#letter-${l}`}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                isDarkMode ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {l}
            </a>
          ))}
        </div>

        {/* Entries */}
        <div className="space-y-3">
          {letters.map(letter => {
            const letterEntries = filtered.filter(e => e.title[0].toUpperCase() === letter);
            return (
              <div key={letter} id={`letter-${letter}`}>
                <h2 className={`text-lg font-bold mb-2 mt-4 ${tc.textSec}`}>{letter}</h2>
                {letterEntries.map(entry => (
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
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className={`text-lg ${tc.textSec}`}>No matching terms found</p>
            <p className={`text-sm ${tc.textMuted}`}>Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  );
}

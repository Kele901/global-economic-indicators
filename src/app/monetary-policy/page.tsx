'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState, useMemo } from 'react';
import { CENTRAL_BANK_RATES } from '../data/currencyHierarchyData';
import { RECENT_DECISIONS, FORWARD_GUIDANCE, type RateDecision } from '../data/monetaryPolicyData';
import { fetchGlobalData, CountryData } from '../services/worldbank';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BANK_COLORS: Record<string, string> = {
  'Federal Reserve': '#8884d8', 'ECB': '#82ca9d', 'Bank of Japan': '#ffc658',
  'Bank of England': '#ff8042', 'PBoC': '#e60049', 'Reserve Bank of Australia': '#0bb4ff',
  'Bank of Canada': '#50e991', 'Swiss National Bank': '#9b19f5', 'Reserve Bank of India': '#ff9ff3',
  'CBRT': '#dc0ab4', 'BCB': '#7eb0d5',
};

const ACTION_STYLES = {
  hike: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-500', icon: '▲' },
  cut: { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-500', icon: '▼' },
  hold: { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-500', icon: '●' },
};

export default function MonetaryPolicyPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBanks, setSelectedBanks] = useState<string[]>(['Federal Reserve', 'ECB', 'Bank of Japan', 'Bank of England']);
  const [sortBy, setSortBy] = useState<'rate' | 'name'>('rate');

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

  useEffect(() => {
    fetchGlobalData().then(d => { setData(d as any); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const tc = isDarkMode ? {
    bg: 'bg-gray-900', card: 'bg-gray-800 border-gray-700', text: 'text-white',
    textSec: 'text-gray-400', grid: '#374151', axis: '#9ca3af',
    tooltip: { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' } as React.CSSProperties,
    selectBg: 'bg-gray-700 text-white border-gray-600',
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', grid: '#e5e7eb', axis: '#6b7280',
    tooltip: { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } as React.CSSProperties,
    selectBg: 'bg-white text-gray-900 border-gray-300',
  };

  const sortedRates = useMemo(() => {
    const rates = [...CENTRAL_BANK_RATES];
    if (sortBy === 'rate') rates.sort((a, b) => b.rate - a.rate);
    else rates.sort((a, b) => a.bank.localeCompare(b.bank));
    return rates;
  }, [sortBy]);

  const ratePathData = useMemo(() => {
    if (!data) return [];
    const BANK_COUNTRY: Record<string, string> = {
      'Federal Reserve': 'USA', 'ECB': 'France', 'Bank of Japan': 'Japan',
      'Bank of England': 'UK', 'PBoC': 'China', 'Reserve Bank of Australia': 'Australia',
      'Bank of Canada': 'Canada', 'Swiss National Bank': 'Switzerland',
      'Reserve Bank of India': 'India', 'CBRT': 'Turkey', 'BCB': 'Brazil',
    };
    const series = (data as any).interestRates as CountryData[];
    if (!series) return [];
    return series.filter(r => Number(r.year) >= 2000).map(row => {
      const point: Record<string, number | string> = { year: row.year };
      for (const [bank, country] of Object.entries(BANK_COUNTRY)) {
        if (selectedBanks.includes(bank)) {
          const v = Number(row[country]);
          if (!isNaN(v)) point[bank] = v;
        }
      }
      return point;
    });
  }, [data, selectedBanks]);

  const uniqueBanks = useMemo(() => Array.from(new Set(RECENT_DECISIONS.map(d => d.bank))), []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tc.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={tc.textSec}>Loading monetary policy data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Monetary Policy Tracker</h1>
            <p className={`${tc.textSec}`}>Track central bank decisions, rate paths, and forward guidance</p>
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

        <div className={`rounded-xl border p-4 sm:p-6 mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">Understanding Monetary Policy</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Monetary policy refers to the actions central banks take to manage money supply and interest rates
            in an economy. When a central bank <strong>raises rates</strong> (a &quot;hike&quot;), borrowing becomes more
            expensive, which tends to slow economic activity and reduce inflation. When it <strong>cuts rates</strong>,
            borrowing becomes cheaper, stimulating spending and investment. A <strong>hold</strong> decision signals
            the bank believes current conditions are appropriate.
          </p>
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3`}>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Rate Hike ▲</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tightens monetary conditions. Used to combat high inflation by making borrowing more costly.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Rate Cut ▼</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loosens monetary conditions. Used to boost a slowing economy by making credit more affordable.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Hold ●</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No change to the policy rate. Signals the central bank sees current policy as appropriate.</p>
            </div>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Forward guidance communicates expected future policy actions, helping markets anticipate rate paths.
            Divergence between central banks (e.g., one hiking while another cuts) affects currency markets and capital flows.
            <a href="/guides/monetary-policy-decisions" className="text-blue-500 hover:underline ml-1">Learn more in our guide &rarr;</a>
          </p>
        </div>

        {/* Current Rates Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Current Policy Rates</h2>
            <div className="flex gap-2">
              <button onClick={() => setSortBy('rate')} className={`px-3 py-1 rounded text-xs border ${sortBy === 'rate' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>By Rate</button>
              <button onClick={() => setSortBy('name')} className={`px-3 py-1 rounded text-xs border ${sortBy === 'name' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>By Name</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {sortedRates.map(rate => (
              <div key={rate.currency} className={`rounded-xl border p-4 ${tc.card}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{rate.bankAbbrev}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    rate.trend === 'rising' ? 'bg-red-500/10 text-red-500' :
                    rate.trend === 'falling' ? 'bg-green-500/10 text-green-500' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>{rate.trend}</span>
                </div>
                <p className="text-2xl font-bold">{rate.rate.toFixed(2)}%</p>
                <p className={`text-xs ${tc.textSec}`}>{rate.bank}</p>
                <div className={`flex justify-between mt-2 text-xs ${tc.textSec}`}>
                  <span>Prev: {rate.previousRate.toFixed(2)}%</span>
                  <span>{rate.currency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rate Decision Timeline */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-4">Recent Rate Decisions</h2>
          <div className="space-y-3">
            {RECENT_DECISIONS.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((decision, idx) => {
              const style = ACTION_STYLES[decision.action];
              return (
                <div key={idx} className={`flex items-start gap-4 p-3 rounded-lg border ${style.bg}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${style.text}`}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{decision.bank}</span>
                      <span className={`text-xs ${tc.textSec}`}>{decision.date}</span>
                    </div>
                    <p className="text-sm mt-0.5">{decision.statement}</p>
                    <p className={`text-xs mt-1 ${style.text}`}>
                      {decision.action === 'hold' ? `Held at ${decision.newRate}%` :
                       `${decision.action === 'hike' ? '+' : ''}${decision.changeAmount.toFixed(2)}% → ${decision.newRate}%`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rate Paths Chart */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-4">Historical Rate Paths</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {uniqueBanks.map(bank => (
              <button
                key={bank}
                onClick={() => setSelectedBanks(prev =>
                  prev.includes(bank) ? prev.filter(b => b !== bank) : [...prev, bank]
                )}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  selectedBanks.includes(bank) ? 'bg-blue-500/20 border-blue-500 text-blue-500' :
                  isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
                }`}
              >
                {bank}
              </button>
            ))}
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratePathData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={tc.tooltip} />
                <Legend />
                {selectedBanks.map(bank => (
                  <Line key={bank} type="monotone" dataKey={bank} stroke={BANK_COLORS[bank] || '#888'}
                    dot={false} strokeWidth={2} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forward Guidance */}
        <div className={`rounded-xl border p-6 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-4">Forward Guidance & Market Expectations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FORWARD_GUIDANCE.map(fg => (
              <div key={fg.bank} className={`rounded-lg border p-4 ${tc.card}`}>
                <h3 className="font-semibold mb-2">{fg.bank}</h3>
                <p className={`text-sm mb-2 ${tc.textSec}`}>{fg.outlook}</p>
                <p className="text-sm">
                  <span className="text-blue-500 font-medium">Market expects: </span>
                  {fg.marketExpectation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

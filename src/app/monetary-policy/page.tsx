'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState, useMemo } from 'react';
import { CENTRAL_BANK_RATES } from '../data/currencyHierarchyData';
import { RECENT_DECISIONS, FORWARD_GUIDANCE, type RateDecision } from '../data/monetaryPolicyData';
import { fetchGlobalData, CountryData } from '../services/worldbank';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, ScatterChart, Scatter, Cell, ReferenceLine } from 'recharts';
import { useCentralBankRates } from '../hooks/useCentralBankRates';
import { fetchRecentDecisions, RateDecision as LiveRateDecision } from '../services/rateDecisions';

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
  const [liveDecisions, setLiveDecisions] = useState<LiveRateDecision[]>([]);
  const [decisionsLoading, setDecisionsLoading] = useState(false);
  
  const { rates: liveRates, isLive: ratesIsLive, loading: ratesLoading, refetch: refetchRates } = useCentralBankRates();

  const refetchDecisions = async () => {
    setDecisionsLoading(true);
    try {
      const decisions = await fetchRecentDecisions();
      setLiveDecisions(decisions);
    } catch (e) {
      console.error('Failed to refetch decisions:', e);
    } finally {
      setDecisionsLoading(false);
    }
  };

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
    refetchDecisions();
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

  const ratesData = useMemo(() => {
    if (liveRates.length > 0) {
      return liveRates.map(r => ({
        currency: r.currency,
        bank: r.bank,
        bankAbbrev: r.bankAbbrev,
        rate: r.rate,
        previousRate: r.previousRate,
        lastUpdated: r.lastUpdated,
        nextMeeting: r.nextMeeting || '2026-04-01',
        trend: r.trend
      }));
    }
    return CENTRAL_BANK_RATES;
  }, [liveRates]);

  const sortedRates = useMemo(() => {
    const rates = [...ratesData];
    if (sortBy === 'rate') rates.sort((a, b) => b.rate - a.rate);
    else rates.sort((a, b) => a.bank.localeCompare(b.bank));
    return rates;
  }, [sortBy, ratesData]);

  const decisionsData = useMemo(() => {
    if (liveDecisions.length > 0) {
      return liveDecisions;
    }
    return RECENT_DECISIONS;
  }, [liveDecisions]);

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

  const uniqueBanks = useMemo(() => Array.from(new Set(decisionsData.map(d => d.bank))), [decisionsData]);

  const BANK_COUNTRY_MAP: Record<string, string> = {
    'Federal Reserve': 'USA', 'ECB': 'France', 'Bank of Japan': 'Japan',
    'Bank of England': 'UK', 'PBoC': 'China', 'Reserve Bank of Australia': 'Australia',
    'Bank of Canada': 'Canada', 'Swiss National Bank': 'Switzerland',
    'Reserve Bank of India': 'India', 'CBRT': 'Turkey', 'BCB': 'Brazil',
  };

  const realRateData = useMemo(() => {
    if (!data) return [];
    const inflSeries = (data as any).inflationRates as CountryData[] | undefined;
    if (!inflSeries) return [];
    const latestInflRow = inflSeries[inflSeries.length - 1] || {};
    return ratesData.map(r => {
      const country = BANK_COUNTRY_MAP[r.bank];
      const infl = country ? Number(latestInflRow[country]) : NaN;
      const inflation = isNaN(infl) ? 0 : infl;
      const realRate = r.rate - inflation;
      return { bank: r.bankAbbrev, nominalRate: r.rate, inflation: parseFloat(inflation.toFixed(2)), realRate: parseFloat(realRate.toFixed(2)) };
    }).sort((a, b) => b.realRate - a.realRate);
  }, [data, ratesData]);

  const rateVsInflationData = useMemo(() => {
    if (!data) return [];
    const inflSeries = (data as any).inflationRates as CountryData[] | undefined;
    if (!inflSeries) return [];
    const latestInflRow = inflSeries[inflSeries.length - 1] || {};
    return ratesData.map(r => {
      const country = BANK_COUNTRY_MAP[r.bank];
      const infl = country ? Number(latestInflRow[country]) : NaN;
      return { bank: r.bankAbbrev, inflation: isNaN(infl) ? 0 : parseFloat(infl.toFixed(2)), rate: r.rate, color: BANK_COLORS[r.bank] || '#888' };
    });
  }, [data, ratesData]);

  const cyclePhases = useMemo(() => {
    const phases: Record<string, { phase: string; color: string }> = {};
    for (const bank of uniqueBanks) {
      const decisions = decisionsData.filter(d => d.bank === bank).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
      const hikes = decisions.filter(d => d.action === 'hike').length;
      const cuts = decisions.filter(d => d.action === 'cut').length;
      if (hikes >= 2) phases[bank] = { phase: 'Tightening', color: 'text-red-500 bg-red-500/10' };
      else if (cuts >= 2) phases[bank] = { phase: 'Easing', color: 'text-green-500 bg-green-500/10' };
      else phases[bank] = { phase: 'Neutral', color: 'text-yellow-500 bg-yellow-500/10' };
    }
    return phases;
  }, [uniqueBanks, decisionsData]);

  const rateChangeFreqData = useMemo(() => {
    return uniqueBanks.map(bank => {
      const decisions = decisionsData.filter(d => d.bank === bank);
      return {
        bank: bank.length > 15 ? bank.split(' ').map(w => w[0]).join('') : bank,
        hikes: decisions.filter(d => d.action === 'hike').length,
        cuts: decisions.filter(d => d.action === 'cut').length,
        holds: decisions.filter(d => d.action === 'hold').length,
      };
    });
  }, [uniqueBanks, decisionsData]);

  const comparisonTableData = useMemo(() => {
    if (!data) return [];
    const inflSeries = (data as any).inflationRates as CountryData[] | undefined;
    const latestInflRow = inflSeries ? inflSeries[inflSeries.length - 1] : {} as any;
    return ratesData.map(r => {
      const country = BANK_COUNTRY_MAP[r.bank];
      const infl = country ? Number(latestInflRow?.[country]) : NaN;
      const inflation = isNaN(infl) ? null : parseFloat(infl.toFixed(2));
      const realRate = inflation !== null ? parseFloat((r.rate - inflation).toFixed(2)) : null;
      const lastDecision = decisionsData.filter(d => d.bank === r.bank).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const phase = cyclePhases[r.bank];
      const guidance = FORWARD_GUIDANCE.find(fg => fg.bank === r.bank);
      return { ...r, inflation, realRate, lastDecision, phase, guidance };
    });
  }, [data, cyclePhases, ratesData, decisionsData]);

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
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Current Policy Rates</h2>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${ratesIsLive ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className={`text-xs ${tc.textSec}`}>{ratesIsLive ? 'Live' : 'Cached'}</span>
              </div>
              <button
                onClick={refetchRates}
                disabled={ratesLoading}
                className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} disabled:opacity-50`}
              >
                {ratesLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSortBy('rate')} className={`px-3 py-1 rounded text-xs border ${sortBy === 'rate' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>By Rate</button>
              <button onClick={() => setSortBy('name')} className={`px-3 py-1 rounded text-xs border ${sortBy === 'name' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>By Name</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {sortedRates.map(rate => {
              const phase = cyclePhases[rate.bank];
              return (
                <div key={rate.currency} className={`rounded-xl border p-4 ${tc.card}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{rate.bankAbbrev}</span>
                    <div className="flex items-center gap-1.5">
                      {phase && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${phase.color}`}>{phase.phase}</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        rate.trend === 'rising' ? 'bg-red-500/10 text-red-500' :
                        rate.trend === 'falling' ? 'bg-green-500/10 text-green-500' :
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>{rate.trend}</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{rate.rate.toFixed(2)}%</p>
                  <p className={`text-xs ${tc.textSec}`}>{rate.bank}</p>
                  <div className={`flex justify-between mt-2 text-xs ${tc.textSec}`}>
                    <span>Prev: {rate.previousRate.toFixed(2)}%</span>
                    <span>{rate.currency}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rate Decision Timeline */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-semibold">Recent Rate Decisions</h2>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${liveDecisions.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className={`text-xs ${tc.textSec}`}>{liveDecisions.length > 0 ? 'Live (BIS)' : 'Static'}</span>
            </div>
            <button
              onClick={refetchDecisions}
              disabled={decisionsLoading}
              className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} disabled:opacity-50`}
            >
              {decisionsLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          <div className="space-y-3">
            {decisionsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20).map((decision, idx) => {
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

        {/* Real Interest Rate Comparison */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">Real Interest Rate Comparison</h2>
          <p className={`text-sm mb-4 ${tc.textSec}`}>Policy rate minus latest inflation. Positive real rates indicate restrictive policy; negative means monetary conditions remain loose.</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={realRateData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="bank" stroke={tc.axis} tick={{ fontSize: 10 }} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={tc.tooltip} formatter={(value: number) => [`${value}%`]} />
                <ReferenceLine y={0} stroke={isDarkMode ? '#6b7280' : '#9ca3af'} strokeDasharray="3 3" />
                <Bar dataKey="realRate" name="Real Rate">
                  {realRateData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.realRate >= 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rate vs Inflation Scatter */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">Policy Rate vs Inflation</h2>
          <p className={`text-sm mb-4 ${tc.textSec}`}>Each dot represents a central bank. Points above the diagonal line have positive real rates (ahead of the curve).</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis type="number" dataKey="inflation" name="Inflation" stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} label={{ value: 'Inflation Rate (%)', position: 'insideBottom', offset: -5, style: { fill: tc.axis, fontSize: 11 } }} />
                <YAxis type="number" dataKey="rate" name="Policy Rate" stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} label={{ value: 'Policy Rate (%)', angle: -90, position: 'insideLeft', style: { fill: tc.axis, fontSize: 11 } }} />
                <Tooltip contentStyle={tc.tooltip} formatter={(value: number) => [`${value}%`]} labelFormatter={() => ''} content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const d = payload[0].payload;
                    return (
                      <div style={tc.tooltip} className="p-2 rounded-lg text-sm shadow-lg">
                        <p className="font-semibold">{d.bank}</p>
                        <p>Policy Rate: {d.rate}%</p>
                        <p>Inflation: {d.inflation}%</p>
                        <p>Real Rate: {(d.rate - d.inflation).toFixed(2)}%</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <ReferenceLine stroke={isDarkMode ? '#6b7280' : '#9ca3af'} strokeDasharray="5 5" segment={[{ x: -5, y: -5 }, { x: 50, y: 50 }]} />
                <Scatter name="Central Banks" data={rateVsInflationData} fill="#8884d8">
                  {rateVsInflationData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {rateVsInflationData.map(d => (
              <span key={d.bank} className="flex items-center gap-1 text-xs">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: d.color }} />
                {d.bank}
              </span>
            ))}
          </div>
        </div>

        {/* Rate Change Frequency */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">Rate Change Frequency</h2>
          <p className={`text-sm mb-4 ${tc.textSec}`}>Count of hikes, cuts, and holds per central bank from recent decision history.</p>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rateChangeFreqData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                <XAxis dataKey="bank" stroke={tc.axis} tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={tc.tooltip} />
                <Legend />
                <Bar dataKey="hikes" name="Hikes" fill="#ef4444" stackId="a" />
                <Bar dataKey="cuts" name="Cuts" fill="#22c55e" stackId="a" />
                <Bar dataKey="holds" name="Holds" fill="#eab308" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Central Bank Comparison Table */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">Central Bank Comparison Table</h2>
          <p className={`text-sm mb-4 ${tc.textSec}`}>Comprehensive side-by-side view of all tracked central banks.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="text-left py-3 px-2 font-semibold">Bank</th>
                  <th className="text-right py-3 px-2 font-semibold">Rate</th>
                  <th className="text-right py-3 px-2 font-semibold">Inflation</th>
                  <th className="text-right py-3 px-2 font-semibold">Real Rate</th>
                  <th className="text-center py-3 px-2 font-semibold">Last Action</th>
                  <th className="text-center py-3 px-2 font-semibold">Cycle</th>
                  <th className="text-left py-3 px-2 font-semibold hidden lg:table-cell">Guidance</th>
                </tr>
              </thead>
              <tbody>
                {comparisonTableData.map(row => (
                  <tr key={row.currency} className={`border-b ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'} hover:${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                    <td className="py-2 px-2">
                      <span className="font-medium">{row.bankAbbrev}</span>
                      <span className={`block text-xs ${tc.textSec}`}>{row.currency}</span>
                    </td>
                    <td className="text-right py-2 px-2 font-mono font-semibold">{row.rate.toFixed(2)}%</td>
                    <td className="text-right py-2 px-2 font-mono">{row.inflation !== null ? `${row.inflation}%` : 'N/A'}</td>
                    <td className={`text-right py-2 px-2 font-mono font-semibold ${row.realRate !== null ? (row.realRate >= 0 ? 'text-green-500' : 'text-red-500') : ''}`}>
                      {row.realRate !== null ? `${row.realRate}%` : 'N/A'}
                    </td>
                    <td className="text-center py-2 px-2">
                      {row.lastDecision && (
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${ACTION_STYLES[row.lastDecision.action].bg} ${ACTION_STYLES[row.lastDecision.action].text}`}>
                          {ACTION_STYLES[row.lastDecision.action].icon} {row.lastDecision.action}
                        </span>
                      )}
                    </td>
                    <td className="text-center py-2 px-2">
                      {row.phase && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${row.phase.color}`}>{row.phase.phase}</span>
                      )}
                    </td>
                    <td className={`py-2 px-2 text-xs hidden lg:table-cell ${tc.textSec}`}>
                      {row.guidance ? row.guidance.outlook.slice(0, 80) + '...' : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

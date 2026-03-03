'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState, useMemo } from 'react';
import { fetchGlobalData, CountryData } from '../services/worldbank';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, COUNTRY_COLORS, type CountryKey } from '../utils/countryMappings';
import { BILATERAL_TRADE, getTradePartnersFor } from '../data/bilateralTradeData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { US, GB, CA, FR, DE, IT, JP, AU, MX, KR, ES, SE, CH, TR, NG, CN, RU, BR, CL, AR, IN, NO, NL, PT, BE, ID, ZA, PL, SA, EG } from 'country-flag-icons/react/3x2';

const FLAG_MAP: Record<string, React.ComponentType<any>> = {
  USA: US, UK: GB, Canada: CA, France: FR, Germany: DE, Italy: IT, Japan: JP,
  Australia: AU, Mexico: MX, SouthKorea: KR, Spain: ES, Sweden: SE, Switzerland: CH,
  Turkey: TR, Nigeria: NG, China: CN, Russia: RU, Brazil: BR, Chile: CL,
  Argentina: AR, India: IN, Norway: NO, Netherlands: NL, Portugal: PT, Belgium: BE,
  Indonesia: ID, SouthAfrica: ZA, Poland: PL, SaudiArabia: SA, Egypt: EG,
};

function getLatest(series: CountryData[] | undefined, country: string): number | null {
  if (!series) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    const v = Number(series[i][country]);
    if (!isNaN(v) && v !== 0) return v;
  }
  return null;
}

export default function TradeNetworkPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('USA');

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
    activeBg: 'bg-blue-500/20 border-blue-500 text-blue-400', inactiveBg: 'border-gray-600 text-gray-400 hover:border-gray-500',
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', grid: '#e5e7eb', axis: '#6b7280',
    tooltip: { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } as React.CSSProperties,
    activeBg: 'bg-blue-50 border-blue-500 text-blue-600', inactiveBg: 'border-gray-200 text-gray-500 hover:border-gray-300',
  };

  const partners = useMemo(() => getTradePartnersFor(selectedCountry), [selectedCountry]);

  const partnerChartData = useMemo(() => {
    return partners.slice(0, 10).map(p => ({
      partner: (COUNTRY_DISPLAY_NAMES[p.partner as CountryKey] || p.partner).slice(0, 12),
      exports: p.exports,
      imports: p.imports,
    }));
  }, [partners]);

  const balanceChartData = useMemo(() => {
    return partners.slice(0, 10).map(p => ({
      partner: (COUNTRY_DISPLAY_NAMES[p.partner as CountryKey] || p.partner).slice(0, 12),
      balance: p.balance,
      fill: p.balance >= 0 ? '#22c55e' : '#ef4444',
    }));
  }, [partners]);

  const networkNodes = useMemo(() => {
    const nodes = new Set<string>();
    BILATERAL_TRADE.forEach(f => { nodes.add(f.source); nodes.add(f.target); });
    return Array.from(nodes);
  }, []);

  const tradeOpenness = useMemo(() => {
    if (!data) return [];
    return COUNTRY_KEYS.map(ck => ({
      country: (COUNTRY_DISPLAY_NAMES[ck] || ck).slice(0, 12),
      openness: getLatest(data.tradeOpenness || data.tradeBalance, ck) || 0,
      fill: COUNTRY_COLORS[ck],
    })).sort((a, b) => b.openness - a.openness).slice(0, 15);
  }, [data]);

  const concentrationData = useMemo(() => {
    return networkNodes.slice(0, 15).map(ck => {
      const p = getTradePartnersFor(ck);
      const total = p.reduce((s, x) => s + x.exports + x.imports, 0);
      const topPartner = p[0];
      const concentration = topPartner && total > 0 ? ((topPartner.exports + topPartner.imports) / total * 100) : 0;
      return {
        country: (COUNTRY_DISPLAY_NAMES[ck as CountryKey] || ck).slice(0, 12),
        concentration,
        topPartner: COUNTRY_DISPLAY_NAMES[topPartner?.partner as CountryKey] || topPartner?.partner || '',
        fill: concentration > 40 ? '#ef4444' : concentration > 25 ? '#f59e0b' : '#22c55e',
      };
    }).sort((a, b) => b.concentration - a.concentration);
  }, [networkNodes]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tc.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={tc.textSec}>Loading trade data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trade Network Visualization</h1>
            <p className={`${tc.textSec}`}>Explore bilateral trade relationships and dependencies</p>
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
          <h2 className="text-lg sm:text-xl font-semibold mb-3">Understanding Trade Networks</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            International trade connects economies through flows of goods and services. A country&apos;s <strong>trade
            balance</strong> with a partner is the difference between exports and imports: a surplus means it exports
            more than it imports, while a deficit means the opposite. <strong>Trade openness</strong> (trade as % of GDP)
            indicates how integrated an economy is with the global market. Highly open economies tend to grow faster
            but may be more vulnerable to external shocks.
          </p>
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3`}>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Bilateral Trade</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Two-way trade between specific country pairs. Exports and imports are shown separately to reveal the balance of trade.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Concentration Risk</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>When a large share of trade depends on a single partner, disruptions (tariffs, sanctions, supply shocks) carry outsized risk.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Supply Chain Dependencies</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>The concentration chart highlights countries with highly concentrated trade partnerships and their top partner.</p>
            </div>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Select a country above to explore its trade relationships, balance with each partner, and supply chain exposure.
            <a href="/guides/trade-networks" className="text-blue-500 hover:underline ml-1">Learn more in our guide &rarr;</a>
          </p>
        </div>

        {/* Country Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {networkNodes.map(ck => {
            const FC = FLAG_MAP[ck];
            return (
              <button key={ck} onClick={() => setSelectedCountry(ck)}
                className={`px-3 py-1.5 rounded-lg text-xs border flex items-center gap-1.5 transition-colors ${
                  selectedCountry === ck ? tc.activeBg : tc.inactiveBg
                }`}>
                {FC && <div className="w-4 h-3 rounded overflow-hidden"><FC /></div>}
                {(COUNTRY_DISPLAY_NAMES[ck as CountryKey] || ck).slice(0, 12)}
              </button>
            );
          })}
        </div>

        {/* Country Focus: Trade Partners */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-4">
            {COUNTRY_DISPLAY_NAMES[selectedCountry as CountryKey] || selectedCountry}: Trade Partners
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Exports/Imports */}
            <div>
              <h3 className={`text-sm font-medium mb-3 ${tc.textSec}`}>Exports & Imports (Billion USD)</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={partnerChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                    <XAxis dataKey="partner" stroke={tc.axis} tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `$${v}B`} />
                    <Tooltip contentStyle={tc.tooltip} />
                    <Legend />
                    <Bar dataKey="exports" name="Exports" fill="#22c55e" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="imports" name="Imports" fill="#ef4444" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trade Balance */}
            <div>
              <h3 className={`text-sm font-medium mb-3 ${tc.textSec}`}>Trade Balance (Billion USD)</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={balanceChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                    <XAxis dataKey="partner" stroke={tc.axis} tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `$${v}B`} />
                    <Tooltip contentStyle={tc.tooltip} />
                    <Bar dataKey="balance" name="Balance" radius={[4, 4, 0, 0]}>
                      {balanceChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Partner Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                  <th className="text-left px-3 py-2">Partner</th>
                  <th className="text-right px-3 py-2">Exports ($B)</th>
                  <th className="text-right px-3 py-2">Imports ($B)</th>
                  <th className="text-right px-3 py-2">Balance ($B)</th>
                </tr>
              </thead>
              <tbody>
                {partners.map(p => (
                  <tr key={p.partner} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className="px-3 py-2 font-medium">{COUNTRY_DISPLAY_NAMES[p.partner as CountryKey] || p.partner}</td>
                    <td className="text-right px-3 py-2 text-green-500">{p.exports}</td>
                    <td className="text-right px-3 py-2 text-red-500">{p.imports}</td>
                    <td className={`text-right px-3 py-2 font-medium ${p.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {p.balance >= 0 ? '+' : ''}{p.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Trade Openness */}
          <div className={`rounded-xl border p-6 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-4">Trade Openness (% of GDP)</h2>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tradeOpenness} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                  <XAxis type="number" stroke={tc.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="country" stroke={tc.axis} tick={{ fontSize: 10 }} width={80} />
                  <Tooltip contentStyle={tc.tooltip} />
                  <Bar dataKey="openness" name="Trade Openness" radius={[0, 4, 4, 0]}>
                    {tradeOpenness.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Supply Chain Concentration */}
          <div className={`rounded-xl border p-6 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-2">Supply Chain Concentration</h2>
            <p className={`text-xs mb-4 ${tc.textSec}`}>Share of trade with top partner — higher = more dependent</p>
            <div className="space-y-2">
              {concentrationData.map(d => (
                <div key={d.country} className="flex items-center gap-3">
                  <span className="text-xs w-24 truncate">{d.country}</span>
                  <div className="flex-1 h-4 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(d.concentration, 100)}%`, backgroundColor: d.fill }} />
                  </div>
                  <span className="text-xs w-10 text-right">{d.concentration.toFixed(0)}%</span>
                  <span className={`text-xs w-20 truncate ${tc.textSec}`}>{d.topPartner}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`text-center py-4 ${tc.textSec}`}>
          <a href="/trading-places" className="text-blue-500 hover:underline text-sm">
            Explore more on the Trading Places page →
          </a>
        </div>
      </div>
    </div>
  );
}

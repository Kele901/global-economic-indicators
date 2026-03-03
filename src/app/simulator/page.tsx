'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState, useMemo } from 'react';
import { fetchGlobalData, CountryData } from '../services/worldbank';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, type CountryKey } from '../utils/countryMappings';
import { ALL_METRICS, getMetricByKey, formatMetricValue } from '../utils/metricCategories';
import { simulateScenario, type ScenarioImpact } from '../utils/correlationEngine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const INPUT_METRICS = ['interestRates', 'inflationRates', 'gdpGrowth', 'governmentDebt', 'exchangeRate', 'fdi'];
const OUTPUT_METRICS = [
  'gdpGrowth', 'inflationRates', 'unemploymentRates', 'exchangeRate',
  'tradeBalance', 'governmentDebt', 'fdi', 'domesticCredit',
  'householdConsumption', 'grossCapitalFormation', 'interestRates',
];

export default function SimulatorPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('USA');
  const [inputMetric, setInputMetric] = useState('interestRates');
  const [changeMagnitude, setChangeMagnitude] = useState(2);
  const [results, setResults] = useState<ScenarioImpact[]>([]);

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
    inputBg: 'bg-gray-700 border-gray-600 text-white',
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', grid: '#e5e7eb', axis: '#6b7280',
    tooltip: { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } as React.CSSProperties,
    inputBg: 'bg-white border-gray-300 text-gray-900',
  };

  const runSimulation = () => {
    if (!data) return;
    const outputs = OUTPUT_METRICS.filter(m => m !== inputMetric);
    const impacts = simulateScenario(data, country, inputMetric, changeMagnitude, outputs);
    setResults(impacts);
  };

  const chartData = useMemo(() => {
    return results.slice(0, 8).map(r => {
      const label = getMetricByKey(r.metric)?.label || r.metric;
      return {
        metric: label.length > 20 ? label.slice(0, 18) + '…' : label,
        change: parseFloat(r.estimatedChange.toFixed(2)),
        confidence: r.confidence,
        fill: r.estimatedChange >= 0 ? '#22c55e' : '#ef4444',
      };
    });
  }, [results]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tc.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={tc.textSec}>Loading data...</p>
        </div>
      </div>
    );
  }

  const inputLabel = getMetricByKey(inputMetric)?.label || inputMetric;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">&quot;What If&quot; Scenario Simulator</h1>
            <p className={`${tc.textSec}`}>Explore how changes in one metric might affect others based on historical correlations</p>
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
          <h2 className="text-lg sm:text-xl font-semibold mb-3">How the Simulator Works</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            This tool uses <strong>historical correlations</strong> between economic indicators to estimate how a
            change in one metric might ripple through to others. For example, if a country raises interest rates
            by 2%, the simulator examines past data to estimate likely effects on GDP growth, inflation,
            exchange rates, and other variables. It is important to remember that <strong>correlation does not
            imply causation</strong> -- these are statistical associations, not proven causal relationships.
          </p>
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3`}>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Correlation</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Measures how two variables move together. Values range from -1 (opposite) to +1 (together). Near 0 means no relationship.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Lag Effect</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Economic effects often take time. A &quot;1yr lag&quot; means the impact typically appears one year after the initial change.</p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
              <p className="text-sm font-semibold mb-1">Confidence Level</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reflects the strength and sample size of the correlation. Higher confidence means the historical pattern is more consistent.</p>
            </div>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Select a country, choose an input metric, set the change magnitude, then click &quot;Run Simulation&quot; to see estimated impacts.
            <a href="/guides/scenario-analysis" className="text-blue-500 hover:underline ml-1">Learn more in our guide &rarr;</a>
          </p>
        </div>

        {/* Scenario Builder */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-4">Build Scenario</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-xs mb-1 ${tc.textSec}`}>Country</label>
              <select value={country} onChange={e => setCountry(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.inputBg}`}>
                {COUNTRY_KEYS.map(ck => <option key={ck} value={ck}>{COUNTRY_DISPLAY_NAMES[ck]}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${tc.textSec}`}>Input Metric</label>
              <select value={inputMetric} onChange={e => setInputMetric(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.inputBg}`}>
                {INPUT_METRICS.map(m => {
                  const def = getMetricByKey(m);
                  return <option key={m} value={m}>{def?.label || m}</option>;
                })}
              </select>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${tc.textSec}`}>Change Magnitude</label>
              <div className="flex items-center gap-2">
                <input
                  type="range" min={-10} max={10} step={0.5} value={changeMagnitude}
                  onChange={e => setChangeMagnitude(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-16 text-center">
                  {changeMagnitude >= 0 ? '+' : ''}{changeMagnitude}
                </span>
              </div>
            </div>
            <div className="flex items-end">
              <button onClick={runSimulation}
                className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
                Run Simulation
              </button>
            </div>
          </div>
          <p className={`text-sm mt-4 ${tc.textSec}`}>
            Scenario: <strong className={tc.text}>{COUNTRY_DISPLAY_NAMES[country as CountryKey]}</strong> changes{' '}
            <strong className={tc.text}>{inputLabel}</strong> by{' '}
            <strong className={changeMagnitude >= 0 ? 'text-green-500' : 'text-red-500'}>
              {changeMagnitude >= 0 ? '+' : ''}{changeMagnitude}
            </strong>
          </p>
        </div>

        {results.length > 0 && (
          <>
            {/* Impact Visualization */}
            <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
              <h2 className="text-xl font-semibold mb-4">Estimated Impacts</h2>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                    <XAxis type="number" stroke={tc.axis} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="metric" stroke={tc.axis} tick={{ fontSize: 10 }} width={100} />
                    <Tooltip contentStyle={tc.tooltip} />
                    <Bar dataKey="change" name="Estimated Change" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detail Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {results.slice(0, 9).map((impact, i) => {
                const metricDef = getMetricByKey(impact.metric);
                return (
                  <div key={i} className={`rounded-xl border p-4 ${tc.card}`}>
                    <p className="font-medium text-sm">{metricDef?.label || impact.metric}</p>
                    <p className={`text-xl font-bold mt-1 ${impact.estimatedChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {impact.estimatedChange >= 0 ? '+' : ''}{impact.estimatedChange.toFixed(3)}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <div>
                        <p className={`text-xs ${tc.textSec}`}>Correlation</p>
                        <p className="text-sm font-medium">{impact.historicalCorrelation.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${tc.textSec}`}>Confidence</p>
                        <div className="flex items-center gap-1">
                          <div className="w-12 h-2 rounded-full bg-gray-600 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${impact.confidence * 100}%` }} />
                          </div>
                          <span className="text-xs">{(impact.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div>
                        <p className={`text-xs ${tc.textSec}`}>Best Lag</p>
                        <p className="text-sm font-medium">{impact.bestLag}yr</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Disclaimer */}
            <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}`}>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                <strong>Disclaimer:</strong> These projections are based on historical correlations and should not be used for
                investment decisions. Correlations do not imply causation, and real economic systems involve many more variables
                and non-linear interactions than this simple model captures.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

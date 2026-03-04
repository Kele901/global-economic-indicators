'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchGlobalData, CountryData } from '../services/worldbank';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, type CountryKey } from '../utils/countryMappings';
import { ALL_METRICS, getMetricByKey, formatMetricValue } from '../utils/metricCategories';
import {
  simulateScenario, type ScenarioImpact,
  computeCorrelationMatrix, computeLaggedCorrelations,
  extractTimeSeries, alignTimeSeries,
} from '../utils/correlationEngine';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend,
} from 'recharts';

const INPUT_METRICS = ['interestRates', 'inflationRates', 'gdpGrowth', 'governmentDebt', 'exchangeRate', 'fdi'];
const OUTPUT_METRICS = [
  'gdpGrowth', 'inflationRates', 'unemploymentRates', 'exchangeRate',
  'tradeBalance', 'governmentDebt', 'fdi', 'domesticCredit',
  'householdConsumption', 'grossCapitalFormation', 'interestRates',
];
const HEATMAP_METRICS = ['gdpGrowth', 'inflationRates', 'interestRates', 'unemploymentRates', 'exchangeRate', 'governmentDebt', 'tradeBalance', 'fdi'];
const SCENARIO_TEMPLATES = [
  { label: 'Rate Hike +2%', inputMetric: 'interestRates', changeMagnitude: 2 },
  { label: 'Rate Cut −1%', inputMetric: 'interestRates', changeMagnitude: -1 },
  { label: 'Oil Shock (FDI −3)', inputMetric: 'fdi', changeMagnitude: -3 },
  { label: 'Currency Depreciation −15%', inputMetric: 'exchangeRate', changeMagnitude: -15 },
  { label: 'Fiscal Stimulus +3% GDP', inputMetric: 'governmentDebt', changeMagnitude: 3 },
  { label: 'Growth Boom +2%', inputMetric: 'gdpGrowth', changeMagnitude: 2 },
];
const LINE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

interface ScenarioHistoryEntry {
  country: string;
  inputMetric: string;
  changeMagnitude: number;
  timestamp: number;
  topImpacts: string[];
}

export default function SimulatorPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('USA');
  const [inputMetric, setInputMetric] = useState('interestRates');
  const [changeMagnitude, setChangeMagnitude] = useState(2);
  const [results, setResults] = useState<ScenarioImpact[]>([]);
  const [scenarioHistory, setScenarioHistory] = useState<ScenarioHistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

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

  const pushHistory = useCallback((c: string, metric: string, magnitude: number, impacts: ScenarioImpact[]) => {
    setScenarioHistory(prev => [...prev, {
      country: c,
      inputMetric: metric,
      changeMagnitude: magnitude,
      timestamp: Date.now(),
      topImpacts: impacts.slice(0, 3).map(im =>
        `${getMetricByKey(im.metric)?.label || im.metric}: ${im.estimatedChange >= 0 ? '+' : ''}${im.estimatedChange.toFixed(2)}`
      ),
    }]);
  }, []);

  const runSimulation = useCallback(() => {
    if (!data) return;
    const outputs = OUTPUT_METRICS.filter(m => m !== inputMetric);
    const impacts = simulateScenario(data, country, inputMetric, changeMagnitude, outputs);
    setResults(impacts);
    pushHistory(country, inputMetric, changeMagnitude, impacts);
  }, [data, country, inputMetric, changeMagnitude, pushHistory]);

  const applyTemplate = useCallback((metric: string, magnitude: number) => {
    setInputMetric(metric);
    setChangeMagnitude(magnitude);
    if (!data) return;
    const outputs = OUTPUT_METRICS.filter(m => m !== metric);
    const impacts = simulateScenario(data, country, metric, magnitude, outputs);
    setResults(impacts);
    pushHistory(country, metric, magnitude, impacts);
  }, [data, country, pushHistory]);

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

  const correlationMatrix = useMemo(() => {
    if (!data) return null;
    return computeCorrelationMatrix(data, country, HEATMAP_METRICS);
  }, [data, country]);

  const timelineData = useMemo(() => {
    if (!data || results.length === 0) return null;
    const top4 = results.slice(0, 4);
    const inputSeries = extractTimeSeries(data[inputMetric] || [], country);
    const lines: { metric: string; label: string; lags: { lag: number; impact: number }[] }[] = [];
    for (const impact of top4) {
      const outputSeries = extractTimeSeries(data[impact.metric] || [], country);
      const aligned = alignTimeSeries(inputSeries, outputSeries);
      if (aligned.a.length >= 5) {
        const lagged = computeLaggedCorrelations(aligned.a, aligned.b, 3);
        const inputStd = Math.sqrt(
          aligned.a.reduce((s, v) => s + v * v, 0) / aligned.a.length -
          Math.pow(aligned.a.reduce((s, v) => s + v, 0) / aligned.a.length, 2)
        );
        const outputStd = Math.sqrt(
          aligned.b.reduce((s, v) => s + v * v, 0) / aligned.b.length -
          Math.pow(aligned.b.reduce((s, v) => s + v, 0) / aligned.b.length, 2)
        );
        lines.push({
          metric: impact.metric,
          label: (getMetricByKey(impact.metric)?.label || impact.metric).slice(0, 20),
          lags: lagged.filter(l => l.lag <= 3).map(l => ({
            lag: l.lag,
            impact: inputStd > 0 ? parseFloat(((changeMagnitude / inputStd) * l.correlation * outputStd).toFixed(3)) : 0,
          })),
        });
      }
    }
    const chartPoints = [0, 1, 2, 3].map(lag => {
      const point: Record<string, any> = { lag: `Year ${lag}` };
      for (const line of lines) {
        const found = line.lags.find(l => l.lag === lag);
        point[line.label] = found ? found.impact : 0;
      }
      return point;
    });
    return { lines, chartPoints };
  }, [data, results, inputMetric, country, changeMagnitude]);

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

        {/* Correlation Matrix Heatmap */}
        {correlationMatrix && (
          <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
            <h2 className="text-xl font-semibold mb-2">Correlation Matrix</h2>
            <p className={`text-sm mb-4 ${tc.textSec}`}>
              Pearson correlations between major metrics for {COUNTRY_DISPLAY_NAMES[country as CountryKey]}
            </p>
            <div className="overflow-x-auto">
              <table className="text-xs border-separate" style={{ borderSpacing: '2px' }}>
                <thead>
                  <tr>
                    <th />
                    {HEATMAP_METRICS.map(m => (
                      <th key={m} className="px-1 py-2 font-medium text-center"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', maxWidth: '40px', minHeight: '80px' }}>
                        {(getMetricByKey(m)?.label || m).slice(0, 14)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HEATMAP_METRICS.map(row => (
                    <tr key={row}>
                      <td className="pr-2 py-1 font-medium text-right whitespace-nowrap">
                        {(getMetricByKey(row)?.label || row).slice(0, 18)}
                      </td>
                      {HEATMAP_METRICS.map(col => {
                        if (row === col) {
                          return (
                            <td key={col} className="px-0 py-0">
                              <div className="w-12 h-8 rounded flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: 'rgba(59,130,246,0.8)', color: '#fff' }}>
                                1.00
                              </div>
                            </td>
                          );
                        }
                        const pair = correlationMatrix.find(
                          c => (c.metricA === row && c.metricB === col) || (c.metricA === col && c.metricB === row)
                        );
                        const corr = pair?.correlation ?? 0;
                        const absCorr = Math.abs(corr);
                        const bg = corr >= 0
                          ? `rgba(59,130,246,${0.1 + absCorr * 0.7})`
                          : `rgba(239,68,68,${0.1 + absCorr * 0.7})`;
                        const textColor = absCorr > 0.35 ? '#fff' : (isDarkMode ? '#d1d5db' : '#374151');
                        return (
                          <td key={col} className="px-0 py-0">
                            <div className="w-12 h-8 rounded flex items-center justify-center text-xs font-medium"
                              style={{ backgroundColor: bg, color: textColor }}>
                              {pair ? corr.toFixed(2) : '—'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.7)' }} />
                <span className={`text-xs ${tc.textSec}`}>Negative</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: 'rgba(156,163,175,0.3)' }} />
                <span className={`text-xs ${tc.textSec}`}>Near zero</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.7)' }} />
                <span className={`text-xs ${tc.textSec}`}>Positive</span>
              </div>
            </div>
          </div>
        )}

        {/* Pre-built Scenario Templates */}
        <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-2">Quick Scenario Templates</h2>
          <p className={`text-sm mb-4 ${tc.textSec}`}>Click a pre-built scenario to auto-fill and run the simulation</p>
          <div className="flex flex-wrap gap-2">
            {SCENARIO_TEMPLATES.map((tpl, i) => (
              <button key={i} onClick={() => applyTemplate(tpl.inputMetric, tpl.changeMagnitude)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
                    : 'bg-gray-100 hover:bg-blue-50 hover:border-blue-300 text-gray-700 border-gray-300'
                }`}>
                {tpl.label}
              </button>
            ))}
          </div>
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
                  type="range" min={-15} max={15} step={0.5} value={changeMagnitude}
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
            <div className={`rounded-xl border p-4 mb-8 ${isDarkMode ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}`}>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                <strong>Disclaimer:</strong> These projections are based on historical correlations and should not be used for
                investment decisions. Correlations do not imply causation, and real economic systems involve many more variables
                and non-linear interactions than this simple model captures.
              </p>
            </div>

            {/* Impact Timeline */}
            {timelineData && timelineData.lines.length > 0 && (
              <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
                <h2 className="text-xl font-semibold mb-2">Impact Timeline</h2>
                <p className={`text-sm mb-4 ${tc.textSec}`}>
                  Estimated impact propagation over 0–3 year lags for the top correlated metrics
                </p>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData.chartPoints} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                      <XAxis dataKey="lag" stroke={tc.axis} tick={{ fontSize: 12 }} />
                      <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={tc.tooltip} />
                      <Legend />
                      {timelineData.lines.map((line, i) => (
                        <Line key={line.metric} type="monotone" dataKey={line.label}
                          stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Scenario History Log */}
            {scenarioHistory.length > 0 && (
              <div className={`rounded-xl border p-6 mb-8 ${tc.card}`}>
                <button onClick={() => setHistoryOpen(!historyOpen)}
                  className="flex items-center gap-2 w-full text-left">
                  <h2 className="text-xl font-semibold">Scenario History</h2>
                  <span className={`text-sm ${tc.textSec}`}>
                    ({scenarioHistory.length} run{scenarioHistory.length !== 1 ? 's' : ''})
                  </span>
                  <span className={`ml-auto transition-transform duration-200 ${historyOpen ? 'rotate-180' : ''}`}>
                    &#9660;
                  </span>
                </button>
                {historyOpen && (
                  <div className="mt-4 space-y-3">
                    {[...scenarioHistory].reverse().map((entry, i) => (
                      <div key={i} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">
                              {COUNTRY_DISPLAY_NAMES[entry.country as CountryKey]} —{' '}
                              {getMetricByKey(entry.inputMetric)?.label || entry.inputMetric}{' '}
                              <span className={entry.changeMagnitude >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {entry.changeMagnitude >= 0 ? '+' : ''}{entry.changeMagnitude}
                              </span>
                            </p>
                            <div className="mt-1 space-y-0.5">
                              {entry.topImpacts.map((imp, j) => (
                                <p key={j} className={`text-xs ${tc.textSec}`}>{imp}</p>
                              ))}
                            </div>
                          </div>
                          <span className={`text-xs ${tc.textSec} whitespace-nowrap ml-4`}>
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

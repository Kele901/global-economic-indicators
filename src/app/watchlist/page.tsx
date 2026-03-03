'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useWatchlist, type WatchlistItem } from '../hooks/useWatchlist';
import { useEffect, useState, useMemo } from 'react';
import { fetchGlobalData, CountryData } from '../services/worldbank';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG, type CountryKey } from '../utils/countryMappings';
import { ALL_METRICS, formatMetricValue } from '../utils/metricCategories';
import { US, GB, CA, FR, DE, IT, JP, AU, MX, KR, ES, SE, CH, TR, NG, CN, RU, BR, CL, AR, IN, NO, NL, PT, BE, ID, ZA, PL, SA, EG } from 'country-flag-icons/react/3x2';

const FLAG_MAP: Record<string, React.ComponentType<any>> = {
  USA: US, UK: GB, Canada: CA, France: FR, Germany: DE, Italy: IT, Japan: JP,
  Australia: AU, Mexico: MX, SouthKorea: KR, Spain: ES, Sweden: SE, Switzerland: CH,
  Turkey: TR, Nigeria: NG, China: CN, Russia: RU, Brazil: BR, Chile: CL,
  Argentina: AR, India: IN, Norway: NO, Netherlands: NL, Portugal: PT, Belgium: BE,
  Indonesia: ID, SouthAfrica: ZA, Poland: PL, SaudiArabia: SA, Egypt: EG,
};

function getLatestValue(series: CountryData[] | undefined, country: string): number | null {
  if (!series) return null;
  for (let i = series.length - 1; i >= 0; i--) {
    const v = Number(series[i][country]);
    if (!isNaN(v) && v !== 0) return v;
  }
  return null;
}

function getSparkline(series: CountryData[] | undefined, country: string): number[] {
  if (!series) return [];
  const vals: number[] = [];
  for (let i = Math.max(0, series.length - 10); i < series.length; i++) {
    const v = Number(series[i][country]);
    if (!isNaN(v)) vals.push(v);
  }
  return vals;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const range = mx - mn || 1;
  const h = 24;
  const w = 60;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

export default function WatchlistPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const { items, addItem, removeItem, updateThreshold } = useWatchlist();
  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCountry, setNewCountry] = useState('USA');
  const [newMetric, setNewMetric] = useState('gdpGrowth');
  const [newDirection, setNewDirection] = useState<'above' | 'below'>('above');
  const [newThresholdValue, setNewThresholdValue] = useState('');

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
    textSec: 'text-gray-400', inputBg: 'bg-gray-700 border-gray-600 text-white',
    alertTriggered: 'bg-red-500/10 border-red-500/30', alertOk: 'bg-green-500/10 border-green-500/30',
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', inputBg: 'bg-white border-gray-300 text-gray-900',
    alertTriggered: 'bg-red-50 border-red-200', alertOk: 'bg-green-50 border-green-200',
  };

  const enrichedItems = useMemo(() => {
    if (!data) return [];
    return items.map(item => {
      const value = getLatestValue((data as any)[item.metric], item.country);
      const spark = getSparkline((data as any)[item.metric], item.country);
      const metricDef = ALL_METRICS.find(m => m.key === item.metric);
      let triggered = false;
      if (item.threshold && value !== null) {
        triggered = item.threshold.direction === 'above'
          ? value > item.threshold.value
          : value < item.threshold.value;
      }
      return { ...item, value, spark, metricDef, triggered };
    });
  }, [items, data]);

  const triggered = enrichedItems.filter(i => i.triggered);
  const normal = enrichedItems.filter(i => !i.triggered);

  const handleAdd = () => {
    addItem({
      country: newCountry,
      metric: newMetric,
      threshold: newThresholdValue ? { direction: newDirection, value: parseFloat(newThresholdValue) } : undefined,
    });
    setShowAdd(false);
    setNewThresholdValue('');
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tc.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={tc.textSec}>Loading...</p>
        </div>
      </div>
    );
  }

  const renderCard = (item: typeof enrichedItems[0]) => {
    const FC = FLAG_MAP[item.country];
    return (
      <div key={item.id} className={`rounded-xl border p-4 transition-all ${item.triggered ? tc.alertTriggered : tc.card}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {FC && <div className="w-6 h-4 rounded overflow-hidden shadow-sm"><FC /></div>}
            <span className="font-medium text-sm">{COUNTRY_DISPLAY_NAMES[item.country as CountryKey] || item.country}</span>
          </div>
          <button onClick={() => removeItem(item.id)} className="text-xs text-red-500 hover:text-red-400">Remove</button>
        </div>
        <p className={`text-xs ${tc.textSec}`}>{item.metricDef?.label || item.metric}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xl font-bold">
            {item.value !== null ? formatMetricValue(item.metric, item.value) : 'N/A'}
          </p>
          <MiniSparkline data={item.spark} color={item.triggered ? '#ef4444' : '#3b82f6'} />
        </div>
        {item.threshold && (
          <p className={`text-xs mt-2 ${item.triggered ? 'text-red-500 font-medium' : tc.textSec}`}>
            Alert: {item.threshold.direction} {item.threshold.value} {item.triggered ? '⚠ TRIGGERED' : '✓ OK'}
          </p>
        )}
        <a href={`/country/${COUNTRY_KEY_TO_SLUG[item.country as CountryKey]}`}
          className="text-xs text-blue-500 hover:underline mt-2 block">View profile →</a>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold">Watchlist & Alerts</h1>
            <p className={tc.textSec}>Track metrics and get notified when thresholds are crossed</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Light</span>
              <button
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 shadow-sm ${isDarkMode ? 'translate-x-6' : ''}`} />
              </button>
              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dark</span>
            </div>
            <button onClick={() => setShowAdd(!showAdd)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
              + Add Item
            </button>
          </div>
        </div>

        <div className={`rounded-xl border p-4 sm:p-6 mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">Your Economic Watchlist</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Build a personalized watchlist of economic indicators that matter to you. Add any country-metric
            combination and optionally set a threshold alert that triggers when the value crosses your target.
            For example, watch U.S. inflation and get alerted if it rises above 5%. Data is stored in your
            browser&apos;s local storage, so your watchlist persists between visits on this device.
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Click &quot;+ Add Item&quot; to start building your list. Sparklines show recent trend direction at a glance.
          </p>
        </div>

        {showAdd && (
          <div className={`rounded-xl border p-5 mb-6 ${tc.card}`}>
            <h3 className="font-semibold mb-4">Add to Watchlist</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className={`block text-xs mb-1 ${tc.textSec}`}>Country</label>
                <select value={newCountry} onChange={e => setNewCountry(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.inputBg}`}>
                  {COUNTRY_KEYS.map(ck => <option key={ck} value={ck}>{COUNTRY_DISPLAY_NAMES[ck]}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 ${tc.textSec}`}>Metric</label>
                <select value={newMetric} onChange={e => setNewMetric(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.inputBg}`}>
                  {ALL_METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 ${tc.textSec}`}>Alert (optional)</label>
                <div className="flex gap-1">
                  <select value={newDirection} onChange={e => setNewDirection(e.target.value as 'above' | 'below')}
                    className={`px-2 py-2 rounded-l-lg border text-sm ${tc.inputBg}`}>
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                  </select>
                  <input type="number" placeholder="value" value={newThresholdValue} onChange={e => setNewThresholdValue(e.target.value)}
                    className={`w-full px-2 py-2 rounded-r-lg border text-sm ${tc.inputBg}`} />
                </div>
              </div>
              <div className="flex items-end">
                <button onClick={handleAdd}
                  className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {triggered.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-red-500">Triggered Alerts ({triggered.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {triggered.map(renderCard)}
            </div>
          </div>
        )}

        {normal.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Watchlist ({normal.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {normal.map(renderCard)}
            </div>
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center py-16">
            <p className={`text-lg ${tc.textSec}`}>Your watchlist is empty</p>
            <p className={`text-sm mt-2 ${tc.textSec}`}>Click &quot;+ Add Item&quot; to start tracking economic indicators</p>
          </div>
        )}
      </div>
    </div>
  );
}

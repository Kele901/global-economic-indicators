'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState, useMemo } from 'react';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, type CountryKey } from '../utils/countryMappings';
import { METRIC_CATEGORIES, getMetricByKey } from '../utils/metricCategories';

export default function EmbedBuilderPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [metric, setMetric] = useState('gdpGrowth');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['USA', 'UK']);
  const [period, setPeriod] = useState('10');
  const [theme, setTheme] = useState('light');
  const [width, setWidth] = useState('600');
  const [height, setHeight] = useState('400');
  const [copied, setCopied] = useState(false);

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

  const tc = isDarkMode ? {
    bg: 'bg-gray-900', card: 'bg-gray-800 border-gray-700', text: 'text-white',
    textSec: 'text-gray-400', inputBg: 'bg-gray-700 border-gray-600 text-white',
    codeBg: 'bg-gray-900 border-gray-700 text-green-400',
    activeBtn: 'bg-blue-500/20 border-blue-500 text-blue-400',
    inactiveBtn: 'border-gray-600 text-gray-400 hover:border-gray-500',
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', inputBg: 'bg-white border-gray-300 text-gray-900',
    codeBg: 'bg-gray-900 border-gray-700 text-green-400',
    activeBtn: 'bg-blue-50 border-blue-500 text-blue-600',
    inactiveBtn: 'border-gray-300 text-gray-500 hover:border-gray-400',
  };

  const embedUrl = useMemo(() => {
    const params = new URLSearchParams({
      metric,
      countries: selectedCountries.join(','),
      period,
      theme,
    });
    return `/embed/chart?${params.toString()}`;
  }, [metric, selectedCountries, period, theme]);

  const embedCode = useMemo(() => {
    return `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}${embedUrl}" width="${width}" height="${height}" frameborder="0" style="border-radius: 8px; border: 1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'};"></iframe>`;
  }, [embedUrl, width, height, theme]);

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const metricDef = getMetricByKey(metric);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Embed Builder</h1>
            <p className={`${tc.textSec}`}>Create embeddable chart widgets for your website or blog</p>
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
          <h2 className="text-lg sm:text-xl font-semibold mb-3">Embeddable Widgets</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Create interactive chart widgets that can be embedded on any website or blog using a simple
            iframe snippet. Select a metric, choose up to 6 countries, set a time period and theme, then
            copy the generated code. The embedded chart is fully interactive with tooltips and responsive design.
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure your chart on the left, see a live preview on the right, and copy the iframe code when ready.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="space-y-6">
            <div className={`rounded-xl border p-5 ${tc.card}`}>
              <h3 className="font-semibold mb-4">Chart Configuration</h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-xs mb-1 ${tc.textSec}`}>Metric</label>
                  <select value={metric} onChange={e => setMetric(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.inputBg}`}>
                    {METRIC_CATEGORIES.map(cat => (
                      <optgroup key={cat.id} label={cat.label}>
                        {cat.metrics.map(m => (
                          <option key={m.key} value={m.key}>{m.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs mb-1 ${tc.textSec}`}>Countries (max 6)</label>
                  <div className="flex flex-wrap gap-1.5 max-h-[150px] overflow-y-auto">
                    {COUNTRY_KEYS.map(ck => (
                      <button key={ck} onClick={() => setSelectedCountries(prev =>
                        prev.includes(ck) ? prev.filter(c => c !== ck) :
                        prev.length < 6 ? [...prev, ck] : prev
                      )} className={`px-2 py-1 rounded text-xs border ${
                        selectedCountries.includes(ck) ? tc.activeBtn : tc.inactiveBtn
                      }`}>
                        {COUNTRY_DISPLAY_NAMES[ck].slice(0, 12)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs mb-1 ${tc.textSec}`}>Period</label>
                    <select value={period} onChange={e => setPeriod(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.inputBg}`}>
                      <option value="5">5 years</option>
                      <option value="10">10 years</option>
                      <option value="20">20 years</option>
                      <option value="0">All time</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${tc.textSec}`}>Theme</label>
                    <select value={theme} onChange={e => setTheme(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.inputBg}`}>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs mb-1 ${tc.textSec}`}>Width (px)</label>
                    <input type="number" value={width} onChange={e => setWidth(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.inputBg}`} />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${tc.textSec}`}>Height (px)</label>
                    <input type="number" value={height} onChange={e => setHeight(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.inputBg}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Embed Code */}
            <div className={`rounded-xl border p-5 ${tc.card}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Embed Code</h3>
                <button onClick={copyCode}
                  className={`px-3 py-1 rounded text-xs ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <pre className={`rounded-lg border p-3 text-xs overflow-x-auto ${tc.codeBg}`}>
                <code>{embedCode}</code>
              </pre>
            </div>
          </div>

          {/* Preview */}
          <div className={`rounded-xl border p-5 ${tc.card}`}>
            <h3 className="font-semibold mb-4">Live Preview</h3>
            <div className="rounded-lg overflow-hidden border" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
              <iframe
                src={embedUrl}
                width="100%"
                height={height}
                frameBorder="0"
                style={{ borderRadius: '8px' }}
                title="Chart Preview"
              />
            </div>
            <p className={`text-xs mt-3 ${tc.textSec}`}>
              Showing: {metricDef?.label || metric} for {selectedCountries.map(c => COUNTRY_DISPLAY_NAMES[c as CountryKey]).join(', ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

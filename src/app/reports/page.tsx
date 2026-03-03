'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState, useMemo, useRef } from 'react';
import { fetchGlobalData, CountryData } from '../services/worldbank';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES, type CountryKey } from '../utils/countryMappings';
import { METRIC_CATEGORIES, ALL_METRICS, formatMetricValue, getMetricByKey } from '../utils/metricCategories';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { US, GB, CA, FR, DE, IT, JP, AU, MX, KR, ES, SE, CH, TR, NG, CN, RU, BR, CL, AR, IN as INFlag, NO, NL, PT, BE, ID, ZA, PL, SA, EG } from 'country-flag-icons/react/3x2';

const FLAG_MAP: Record<string, React.ComponentType<any>> = {
  USA: US, UK: GB, Canada: CA, France: FR, Germany: DE, Italy: IT, Japan: JP,
  Australia: AU, Mexico: MX, SouthKorea: KR, Spain: ES, Sweden: SE, Switzerland: CH,
  Turkey: TR, Nigeria: NG, China: CN, Russia: RU, Brazil: BR, Chile: CL,
  Argentina: AR, India: INFlag, Norway: NO, Netherlands: NL, Portugal: PT, Belgium: BE,
  Indonesia: ID, SouthAfrica: ZA, Poland: PL, SaudiArabia: SA, Egypt: EG,
};

const PERIOD_OPTIONS = [
  { value: 5, label: '5 years' },
  { value: 10, label: '10 years' },
  { value: 20, label: '20 years' },
  { value: 0, label: 'All time' },
];

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function ReportsPage() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['USA', 'UK']);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['gdpGrowth', 'inflationRates']);
  const [period, setPeriod] = useState(10);
  const reportRef = useRef<HTMLDivElement>(null);

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
    activeBtn: 'bg-blue-500/20 border-blue-500 text-blue-400', inactiveBtn: 'border-gray-600 text-gray-400',
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', grid: '#e5e7eb', axis: '#6b7280',
    tooltip: { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } as React.CSSProperties,
    inputBg: 'bg-white border-gray-300 text-gray-900',
    activeBtn: 'bg-blue-50 border-blue-500 text-blue-600', inactiveBtn: 'border-gray-300 text-gray-500',
  };

  const filteredData = useMemo(() => {
    if (!data) return {};
    const currentYear = new Date().getFullYear();
    const startYear = period === 0 ? 0 : currentYear - period;
    const result: Record<string, CountryData[]> = {};
    for (const mk of selectedMetrics) {
      const series = (data as any)[mk] as CountryData[] | undefined;
      if (series) {
        result[mk] = series.filter(r => period === 0 || Number(r.year) >= startYear);
      }
    }
    return result;
  }, [data, selectedMetrics, period]);

  const downloadCSV = () => {
    if (!data) return;
    let csv = 'Year,Country,Metric,Value\n';
    for (const mk of selectedMetrics) {
      const metricDef = getMetricByKey(mk);
      const series = filteredData[mk];
      if (!series) continue;
      for (const row of series) {
        for (const ck of selectedCountries) {
          const v = Number(row[ck]);
          if (!isNaN(v)) {
            csv += `${row.year},${COUNTRY_DISPLAY_NAMES[ck as CountryKey] || ck},${metricDef?.label || mk},${v}\n`;
          }
        }
      }
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `economic-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`economic-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
  };

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

  return (
    <div className={`min-h-screen transition-colors duration-200 ${tc.bg} ${tc.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Report Builder</h1>
            <p className={`${tc.textSec}`}>Generate custom reports with selected countries and metrics</p>
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
          <h2 className="text-lg sm:text-xl font-semibold mb-3">Custom Report Generation</h2>
          <p className={`text-sm sm:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Build custom economic reports by selecting any combination of countries and metrics. Choose a
            time range (5, 10, 20 years, or all available data), preview charts and data tables, then
            export your report as a <strong>CSV</strong> file for spreadsheet analysis or a <strong>PDF</strong> document
            for sharing and presentation.
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Select countries and metrics on the left, adjust the time period, then scroll down to preview charts and data.
            Use the export buttons to download your report.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Country Selection */}
          <div className={`rounded-xl border p-5 ${tc.card}`}>
            <h3 className="font-semibold mb-3">Select Countries</h3>
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {COUNTRY_KEYS.map(ck => {
                const FC = FLAG_MAP[ck];
                const selected = selectedCountries.includes(ck);
                return (
                  <button key={ck} onClick={() => setSelectedCountries(prev =>
                    selected ? prev.filter(c => c !== ck) : [...prev, ck]
                  )} className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    selected ? tc.activeBtn : tc.inactiveBtn
                  }`}>
                    {FC && <div className="w-5 h-3.5 rounded overflow-hidden"><FC /></div>}
                    <span>{COUNTRY_DISPLAY_NAMES[ck]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metric Selection */}
          <div className={`rounded-xl border p-5 ${tc.card}`}>
            <h3 className="font-semibold mb-3">Select Metrics</h3>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {METRIC_CATEGORIES.map(cat => (
                <div key={cat.id}>
                  <p className={`text-xs uppercase tracking-wider mb-1 ${tc.textSec}`}>{cat.label}</p>
                  {cat.metrics.map(m => (
                    <label key={m.key} className="flex items-center gap-2 py-0.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={selectedMetrics.includes(m.key)}
                        onChange={() => setSelectedMetrics(prev =>
                          prev.includes(m.key) ? prev.filter(k => k !== m.key) : [...prev, m.key]
                        )}
                        className="rounded" />
                      {m.label}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className={`rounded-xl border p-5 ${tc.card}`}>
            <h3 className="font-semibold mb-3">Options</h3>
            <label className={`block text-xs mb-1 ${tc.textSec}`}>Time Range</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {PERIOD_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setPeriod(opt.value)}
                  className={`px-3 py-1 rounded text-xs border ${period === opt.value ? tc.activeBtn : tc.inactiveBtn}`}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="space-y-2 mt-6">
              <button onClick={downloadCSV}
                className="w-full px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700">
                Download CSV
              </button>
              <button onClick={downloadPDF}
                className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
                Download PDF
              </button>
            </div>
            <p className={`text-xs mt-3 ${tc.textSec}`}>
              {selectedCountries.length} countries · {selectedMetrics.length} metrics
            </p>
          </div>
        </div>

        {/* Report Preview */}
        <div ref={reportRef} className={`rounded-xl border p-6 ${tc.card}`}>
          <h2 className="text-xl font-semibold mb-6">Report Preview</h2>
          {selectedMetrics.length === 0 || selectedCountries.length === 0 ? (
            <p className={tc.textSec}>Select at least one country and one metric to preview</p>
          ) : (
            <div className="space-y-8">
              {selectedMetrics.map(mk => {
                const metricDef = getMetricByKey(mk);
                const series = filteredData[mk];
                if (!series) return null;
                const chartData = series.map(row => {
                  const point: Record<string, any> = { year: row.year };
                  selectedCountries.forEach(ck => {
                    const v = Number(row[ck]);
                    if (!isNaN(v)) point[ck] = v;
                  });
                  return point;
                });
                return (
                  <div key={mk}>
                    <h3 className="text-lg font-semibold mb-3">{metricDef?.label || mk}</h3>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
                          <XAxis dataKey="year" stroke={tc.axis} tick={{ fontSize: 11 }} />
                          <YAxis stroke={tc.axis} tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={tc.tooltip} />
                          <Legend />
                          {selectedCountries.map((ck, i) => (
                            <Line key={ck} type="monotone" dataKey={ck}
                              name={COUNTRY_DISPLAY_NAMES[ck as CountryKey]}
                              stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} connectNulls />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Data Table */}
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                            <th className="text-left px-2 py-1">Year</th>
                            {selectedCountries.map(ck => (
                              <th key={ck} className="text-right px-2 py-1">{COUNTRY_DISPLAY_NAMES[ck as CountryKey]}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {chartData.slice(-5).map((row, i) => (
                            <tr key={i} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                              <td className="px-2 py-1">{row.year}</td>
                              {selectedCountries.map(ck => (
                                <td key={ck} className="text-right px-2 py-1">
                                  {row[ck] !== undefined ? formatMetricValue(mk, row[ck]) : '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

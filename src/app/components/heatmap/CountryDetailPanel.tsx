'use client';

import { useMemo } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SocialShareMenu from '../SocialShareMenu';
import { getCategoryForMetric, getMetricByKey, type MetricDefinition } from '../../utils/metricCategories';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_KEY_TO_SLUG, type CountryKey } from '../../utils/countryMappings';
import { flagFor, ordinal } from '../../utils/heatmap/palettes';
import { personalExtremes, formatValue } from '../../utils/heatmap/values';
import type { SimilarCountry } from '../../utils/heatmap/similarity';

export interface CountryDetailData {
  countryKey: CountryKey;
  countryName: string;
  value: number;
  rank: number;
  total: number;
  median: number;
  percentile: number;
  history: { year: number; value: number }[];
  relatedMetrics: { key: string; label: string; value: number | null; format: (v: number) => string }[];
  yearOverYearChange: number | null;
}

interface Props {
  detail: CountryDetailData;
  metricDef: MetricDefinition;
  selectedMetric: string;
  selectedYear: number;
  isDarkMode: boolean;
  rankHistory: { year: number; rank: number; total: number }[];
  similar: SimilarCountry[];
  peersHighlighted: boolean;
  onClose: () => void;
  onMetricSwitch: (key: string) => void;
  onSelectCountry: (country: CountryKey) => void;
  onTogglePeers: () => void;
}

export default function CountryDetailPanel({
  detail, metricDef, selectedMetric, selectedYear, isDarkMode, rankHistory, similar, peersHighlighted,
  onClose, onMetricSwitch, onSelectCountry, onTogglePeers,
}: Props) {
  const flag = flagFor(detail.countryKey);
  const category = getCategoryForMetric(selectedMetric);
  const summary = useMemo(() => {
    const pos = detail.percentile >= 75 ? 'among the highest' : detail.percentile >= 50 ? 'above average' : detail.percentile >= 25 ? 'below average' : 'among the lowest';
    const vsMedian = detail.value > detail.median ? 'above' : detail.value < detail.median ? 'below' : 'at';
    return `${detail.countryName}\u2019s ${metricDef.label.toLowerCase()} of ${metricDef.format(detail.value)} ranks ${ordinal(detail.rank)} of ${detail.total} tracked economies \u2014 ${pos} and ${vsMedian} the group median of ${metricDef.format(detail.median)}.`;
  }, [detail, metricDef]);
  const extremes = useMemo(() => personalExtremes(detail.history), [detail.history]);
  const recordBadge = extremes && detail.history.length >= 5
    ? extremes.high.year === selectedYear ? 'high' : extremes.low.year === selectedYear ? 'low' : null
    : null;
  const yoyLabel = detail.yearOverYearChange !== null ? formatValue(metricDef, detail.yearOverYearChange, 'change') : null;
  const chartColor = isDarkMode ? '#60a5fa' : '#3b82f6';
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const tooltipStyle = { backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${gridColor}`, borderRadius: '8px', fontSize: '12px', color: isDarkMode ? '#fff' : '#111827' };

  return (
    <div className="flex flex-col">
      <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{flag}</span>
          <div>
            <h3 className="font-bold text-lg leading-tight">{detail.countryName}</h3>
            <span className={`text-xs ${muted}`}>{category?.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SocialShareMenu title={`${detail.countryName}: ${metricDef.label} (${selectedYear})`} isDarkMode={isDarkMode} />
          <button onClick={onClose} aria-label="Close country details" className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-end justify-between mb-1">
          <div>
            <p className={`text-xs uppercase tracking-wider mb-1 ${muted}`}>{metricDef.label}</p>
            <p className="text-3xl font-bold tracking-tight">{metricDef.format(detail.value)}</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              detail.percentile >= 66 ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700')
              : detail.percentile >= 33 ? (isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700')
              : (isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700')
            }`}>{ordinal(detail.rank)} of {detail.total}</div>
          </div>
        </div>
        {yoyLabel && (
          <p className={`text-sm ${detail.yearOverYearChange! > 0 ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>{yoyLabel} vs {selectedYear - 1}</p>
        )}
        {recordBadge && (
          <p className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
            {recordBadge === 'high' ? '\u25B2 Highest' : '\u25BC Lowest'} in its own data since {detail.history[0].year}
          </p>
        )}
      </div>
      <div className={`mx-5 mb-4 p-3 rounded-lg text-sm leading-relaxed ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>{summary}</div>
      {detail.history.length > 2 && (
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <p className={`text-xs uppercase tracking-wider ${muted}`}>Historical Trend ({detail.history[0].year}&ndash;{detail.history[detail.history.length - 1].year})</p>
            <SocialShareMenu title={`${detail.countryName} ${metricDef.label}: Historical Trend (${detail.history[0].year}–${detail.history[detail.history.length - 1].year})`} isDarkMode={isDarkMode} className="shrink-0" />
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={detail.history} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs><linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartColor} stopOpacity={0.3} /><stop offset="95%" stopColor={chartColor} stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [metricDef.format(val), metricDef.label]} labelFormatter={(label) => `Year: ${label}`} />
                <ReferenceLine x={selectedYear} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" />
                <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} fill="url(#sparkGradient)" dot={false} activeDot={{ r: 4, fill: chartColor }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="mx-5 mb-4 grid grid-cols-3 gap-2">
        {(['min', 'median', 'max'] as const).map((type) => {
          const val = type === 'min' ? (extremes ? extremes.low.value : detail.value)
            : type === 'max' ? (extremes ? extremes.high.value : detail.value)
            : detail.median;
          const year = type === 'min' ? extremes?.low.year : type === 'max' ? extremes?.high.year : null;
          const label = type === 'min' ? 'Own Low' : type === 'max' ? 'Own High' : 'Group Median';
          return (
            <div key={type} className={`text-center p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <p className={`text-[10px] uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
              <p className="text-sm font-semibold mt-0.5">{metricDef.format(val)}</p>
              {year && <p className={`text-[10px] ${muted}`}>{year}</p>}
            </div>
          );
        })}
      </div>
      {rankHistory.length > 2 && (
        <div className="px-5 mb-4">
          <p className={`text-xs uppercase tracking-wider mb-2 ${muted}`}>Rank Over Time (1 = highest)</p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rankHistory} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis reversed hide domain={[1, 'dataMax']} />
                <Tooltip contentStyle={tooltipStyle} formatter={(val: number, _n, item) => [`${ordinal(val)} of ${(item?.payload as { total: number }).total}`, 'Rank']} labelFormatter={(label) => `Year: ${label}`} />
                <ReferenceLine x={selectedYear} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" />
                <Line type="stepAfter" dataKey="rank" stroke={isDarkMode ? '#a78bfa' : '#7c3aed'} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {similar.length > 0 && (
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className={`text-xs uppercase tracking-wider ${muted}`}>Countries Like This</p>
            <button onClick={onTogglePeers}
              className={`text-xs px-2 py-1 rounded-md border transition-colors ${peersHighlighted
                ? (isDarkMode ? 'border-amber-500 bg-amber-500/15 text-amber-300' : 'border-amber-500 bg-amber-50 text-amber-700')
                : (isDarkMode ? 'border-gray-600 text-gray-300 hover:border-gray-500' : 'border-gray-300 text-gray-600 hover:border-gray-400')}`}>
              {peersHighlighted ? 'Clear highlight' : 'Highlight on map'}
            </button>
          </div>
          <div className="space-y-1.5">
            {similar.map(s => (
              <button key={s.country} onClick={() => onSelectCountry(s.country)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${isDarkMode ? 'hover:bg-gray-700 bg-gray-800' : 'hover:bg-gray-100 bg-gray-50'}`}>
                <span className="font-medium">{flagFor(s.country)} {COUNTRY_DISPLAY_NAMES[s.country]}</span>
                <span className={`block text-xs ${muted}`}>
                  {s.closeOn.length
                    ? `Close on ${s.closeOn.map(k => getMetricByKey(k)?.label.toLowerCase() ?? k).join(', ')}`
                    : 'Closest overall profile'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {detail.relatedMetrics.length > 0 && (
        <div className="px-5 mb-4">
          <p className={`text-xs uppercase tracking-wider mb-2 ${muted}`}>Related Indicators ({selectedYear})</p>
          <div className="space-y-1.5">
            {detail.relatedMetrics.map(rm => (
              <button key={rm.key} onClick={() => onMetricSwitch(rm.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${isDarkMode ? 'hover:bg-gray-700 bg-gray-800' : 'hover:bg-gray-100 bg-gray-50'}`}>
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{rm.label}</span>
                <span className={`font-semibold ${rm.value !== null ? '' : (isDarkMode ? 'text-gray-600' : 'text-gray-300')}`}>{rm.value !== null ? rm.format(rm.value) : 'N/A'}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className={`px-5 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <a href={`/country/${COUNTRY_KEY_TO_SLUG[detail.countryKey]}`}
          className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
          View Full {detail.countryName} Profile
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </a>
      </div>
    </div>
  );
}

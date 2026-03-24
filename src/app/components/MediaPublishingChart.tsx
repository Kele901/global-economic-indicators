'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Line, Cell,
} from 'recharts';
import { culturalChartColors, formatNumber } from '../data/culturalMetrics';

interface MediaPublishingChartProps {
  isDarkMode: boolean;
  musicRevenue: { year: number; [country: string]: number }[];
  bookTitles: Record<string, number>;
  streamingOriginals: Record<string, number>;
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

type ViewMode = 'music' | 'books' | 'streaming';

const MediaPublishingChart: React.FC<MediaPublishingChartProps> = ({
  isDarkMode,
  musicRevenue,
  bookTitles,
  streamingOriginals,
  selectedCountries,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('music');

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    gridColor: isDarkMode ? '#374151' : '#E5E7EB',
    tickColor: isDarkMode ? '#9CA3AF' : '#6B7280',
  };

  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
    borderRadius: '8px',
    color: isDarkMode ? '#F3F4F6' : '#111827',
  };

  const musicChartData = useMemo(() => {
    return musicRevenue
      .map(row => {
        const entry: Record<string, number> = { year: row.year };
        selectedCountries.forEach(country => {
          const v = row[country];
          if (v !== undefined && v !== null && !Number.isNaN(Number(v))) {
            entry[country] = Number(v);
          }
        });
        return entry;
      })
      .filter(entry => Object.keys(entry).length > 1);
  }, [musicRevenue, selectedCountries]);

  const bookTitlesData = useMemo(() => {
    return selectedCountries
      .filter(c => bookTitles[c] != null && bookTitles[c] > 0)
      .map(country => ({ country, Titles: bookTitles[country] }))
      .sort((a, b) => b.Titles - a.Titles);
  }, [bookTitles, selectedCountries]);

  const streamingData = useMemo(() => {
    return selectedCountries
      .filter(c => streamingOriginals[c] != null && streamingOriginals[c] > 0)
      .map(country => ({ country, Originals: streamingOriginals[country] }))
      .sort((a, b) => b.Originals - a.Originals);
  }, [streamingOriginals, selectedCountries]);

  return (
    <div className="space-y-6">
      <div
        className={`p-4 rounded-lg border ${
          isDarkMode
            ? 'bg-gray-800 border-amber-500 text-amber-400'
            : 'bg-white border-amber-400 text-amber-700'
        }`}
      >
        <h3 className="font-semibold">Media & Publishing</h3>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Recorded music revenue, book publishing output, and streaming original productions across
          selected countries.
        </p>
      </div>

      <div
        className={`flex flex-wrap gap-2 p-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
      >
        {(
          [
            { id: 'music' as ViewMode, label: 'Music Revenue' },
            { id: 'books' as ViewMode, label: 'Book Titles' },
            { id: 'streaming' as ViewMode, label: 'Streaming Originals' },
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === tab.id
                ? isDarkMode
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-900 shadow'
                : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {viewMode === 'music' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>
            Recorded Music Revenue
          </h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>Billions USD over time</p>
          {musicChartData.length > 0 ? (
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={musicChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                  <XAxis dataKey="year" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: themeColors.tickColor, fontSize: 12 }}
                    tickFormatter={(v) => formatNumber(v)}
                    label={{
                      value: 'Billion USD',
                      angle: -90,
                      position: 'insideLeft',
                      fill: themeColors.tickColor,
                    }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => `$${Number(value).toFixed(2)}B`}
                  />
                  <Legend />
                  {selectedCountries.slice(0, 8).map(country => (
                    <Line
                      key={country}
                      type="monotone"
                      dataKey={country}
                      stroke={culturalChartColors[country]}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div
              className={`w-full h-[300px] flex flex-col items-center justify-center rounded-lg ${
                isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
              }`}
            >
              <p className={`text-sm ${themeColors.textSecondary}`}>
                Music revenue data is loading or unavailable for the selected countries.
              </p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Try selecting different countries or refresh the page.
              </p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'books' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Book Titles Published</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>
            Number of book titles published per country
          </p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookTitlesData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis
                  dataKey="country"
                  tick={{ fill: themeColors.tickColor, fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatNumber(value)} />
                <Bar dataKey="Titles" radius={[4, 4, 0, 0]}>
                  {bookTitlesData.map((entry, index) => (
                    <Cell key={index} fill={culturalChartColors[entry.country] || '#F59E0B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'streaming' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Streaming Original Productions</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>
            Count of original productions by country
          </p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={streamingData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis type="number" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <YAxis
                  dataKey="country"
                  type="category"
                  tick={{ fill: themeColors.tickColor, fontSize: 12 }}
                  width={75}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatNumber(value)} />
                <Bar dataKey="Originals" radius={[0, 4, 4, 0]}>
                  {streamingData.map((entry, index) => (
                    <Cell key={index} fill={culturalChartColors[entry.country] || '#D97706'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPublishingChart;

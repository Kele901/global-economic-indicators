'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Line, Cell,
} from 'recharts';
import { culturalChartColors } from '../data/culturalMetrics';

interface DigitalCultureChartProps {
  isDarkMode: boolean;
  gamingRevenue: { year: number; [country: string]: number }[];
  webLanguagePresence: Record<string, number>;
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

type ViewMode = 'gaming' | 'webLanguage';

const DigitalCultureChart: React.FC<DigitalCultureChartProps> = ({
  isDarkMode,
  gamingRevenue,
  webLanguagePresence,
  selectedCountries,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('gaming');

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

  const gamingChartData = useMemo(() => {
    return [...gamingRevenue]
      .sort((a, b) => a.year - b.year)
      .filter(row => {
        const keys = Object.keys(row).filter(k => k !== 'year');
        return keys.some(k => row[k] != null && !Number.isNaN(Number(row[k])));
      });
  }, [gamingRevenue]);

  const webLanguageBarData = useMemo(() => {
    return selectedCountries
      .filter(
        c =>
          webLanguagePresence[c] != null &&
          !Number.isNaN(webLanguagePresence[c])
      )
      .map(country => ({
        country,
        percentage: webLanguagePresence[country],
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [webLanguagePresence, selectedCountries]);

  return (
    <div className="space-y-6">
      <div
        className={`p-4 rounded-lg border ${
          isDarkMode
            ? 'bg-gray-800 border-emerald-500 text-emerald-400'
            : 'bg-white border-emerald-400 text-emerald-700'
        }`}
      >
        <h3 className="font-semibold">Digital Culture</h3>
        <p
          className={`text-sm mt-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          Video game market revenue over time and estimated share of web content
          by primary language for selected countries.
        </p>
      </div>

      <div
        className={`flex flex-wrap gap-2 p-1 rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}
      >
        {(
          [
            { id: 'gaming' as ViewMode, label: 'Gaming Revenue' },
            { id: 'webLanguage' as ViewMode, label: 'Web Language Presence' },
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setViewMode(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === tab.id
                ? isDarkMode
                  ? 'bg-emerald-600 text-white'
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

      {viewMode === 'gaming' && (
        <div
          className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}
        >
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>
            Video Game Revenue Over Time
          </h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>
            Market revenue in billions USD by country
          </p>
          {gamingChartData.length > 0 ? (
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={gamingChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={themeColors.gridColor}
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: themeColors.tickColor, fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: themeColors.tickColor, fontSize: 12 }}
                    label={{
                      value: 'Billion US$',
                      angle: -90,
                      position: 'insideLeft',
                      fill: themeColors.tickColor,
                    }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) =>
                      `$${Number(value).toFixed(1)}B`
                    }
                  />
                  <Legend />
                  {selectedCountries.slice(0, 8).map(country => (
                    <Line
                      key={country}
                      type="monotone"
                      dataKey={country}
                      stroke={culturalChartColors[country] || '#10B981'}
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
                Gaming revenue data is loading or unavailable for the selected
                countries.
              </p>
              <p
                className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                Try selecting different countries or refresh the page.
              </p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'webLanguage' && (
        <div
          className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}
        >
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>
            Web Content by Primary Language
          </h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>
            Estimated percentage of web pages in each country&apos;s primary
            language
          </p>
          {webLanguageBarData.length > 0 ? (
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={webLanguageBarData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={themeColors.gridColor}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: themeColors.tickColor, fontSize: 12 }}
                    domain={[0, 'dataMax']}
                    tickFormatter={v => `${Number(v).toFixed(0)}%`}
                  />
                  <YAxis
                    dataKey="country"
                    type="category"
                    tick={{ fill: themeColors.tickColor, fontSize: 12 }}
                    width={75}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) =>
                      `${Number(value).toFixed(1)}%`
                    }
                  />
                  <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                    {webLanguageBarData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          culturalChartColors[entry.country] || '#10B981'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div
              className={`w-full h-[300px] flex flex-col items-center justify-center rounded-lg ${
                isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
              }`}
            >
              <p className={`text-sm ${themeColors.textSecondary}`}>
                Web language data is not available for the selected countries.
              </p>
              <p
                className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                Select countries with language presence estimates.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DigitalCultureChart;

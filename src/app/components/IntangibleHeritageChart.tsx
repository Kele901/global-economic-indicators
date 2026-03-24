'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { culturalChartColors } from '../data/culturalMetrics';

interface IntangibleHeritageChartProps {
  isDarkMode: boolean;
  intangibleHeritage: Record<string, number>;
  endangeredSites: Record<string, number>;
  memoryOfWorld: Record<string, number>;
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

type ViewMode = 'intangible' | 'endangered' | 'memory';

const IntangibleHeritageChart: React.FC<IntangibleHeritageChartProps> = ({
  isDarkMode,
  intangibleHeritage,
  endangeredSites,
  memoryOfWorld,
  selectedCountries,
  onCountryChange: _onCountryChange,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('intangible');

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

  const intangibleData = useMemo(() => {
    return selectedCountries
      .filter(c => intangibleHeritage[c] !== undefined && intangibleHeritage[c] > 0)
      .map(country => ({
        country,
        Inscriptions: intangibleHeritage[country],
      }))
      .sort((a, b) => b.Inscriptions - a.Inscriptions);
  }, [intangibleHeritage, selectedCountries]);

  const endangeredData = useMemo(() => {
    return selectedCountries
      .filter(c => endangeredSites[c] !== undefined && endangeredSites[c] > 0)
      .map(country => ({
        country,
        Sites: endangeredSites[country],
      }))
      .sort((a, b) => b.Sites - a.Sites);
  }, [endangeredSites, selectedCountries]);

  const memoryData = useMemo(() => {
    return selectedCountries
      .filter(c => memoryOfWorld[c] !== undefined && memoryOfWorld[c] > 0)
      .map(country => ({
        country,
        Entries: memoryOfWorld[country],
      }))
      .sort((a, b) => b.Entries - a.Entries);
  }, [memoryOfWorld, selectedCountries]);

  return (
    <div className="space-y-6">
      <div
        className={`p-4 rounded-lg border ${
          isDarkMode
            ? 'bg-gray-800 border-rose-500 text-rose-400'
            : 'bg-white border-rose-400 text-rose-700'
        }`}
      >
        <h3 className="font-semibold">Intangible heritage &amp; endangered heritage</h3>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          UNESCO Intangible Cultural Heritage inscriptions, World Heritage sites in danger, and Memory of the
          World register entries by country.
        </p>
      </div>

      <div className={`flex flex-wrap gap-2 p-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {([
          { id: 'intangible' as ViewMode, label: 'Intangible Heritage' },
          { id: 'endangered' as ViewMode, label: 'Endangered Sites' },
          { id: 'memory' as ViewMode, label: 'Memory of the World' },
        ]).map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setViewMode(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === tab.id
                ? isDarkMode
                  ? 'bg-rose-600 text-white'
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

      {viewMode === 'intangible' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Intangible Cultural Heritage</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>
            Number of UNESCO Intangible Cultural Heritage inscriptions by country
          </p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={intangibleData}
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
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Inscriptions" radius={[0, 4, 4, 0]}>
                  {intangibleData.map((entry, index) => (
                    <Cell key={index} fill={culturalChartColors[entry.country] || '#E11D48'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'endangered' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>World Heritage in danger</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>
            Countries with the most World Heritage sites listed as &quot;in danger&quot;
          </p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={endangeredData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis
                  dataKey="country"
                  tick={{ fill: themeColors.tickColor, fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Sites" radius={[4, 4, 0, 0]}>
                  {endangeredData.map((entry, index) => (
                    <Cell key={index} fill={culturalChartColors[entry.country] || '#E11D48'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'memory' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Memory of the World</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>
            UNESCO Memory of the World register entries by country
          </p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={memoryData}
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
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Entries" radius={[0, 4, 4, 0]}>
                  {memoryData.map((entry, index) => (
                    <Cell key={index} fill={culturalChartColors[entry.country] || '#E11D48'} />
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

export default IntangibleHeritageChart;

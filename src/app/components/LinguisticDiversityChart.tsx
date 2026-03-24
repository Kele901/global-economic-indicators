'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import { culturalChartColors } from '../data/culturalMetrics';

interface LinguisticDiversityChartProps {
  isDarkMode: boolean;
  languageDiversity: Record<string, number>;
  endangeredLanguages: Record<string, number>;
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

type ViewMode = 'diversity' | 'endangered';

const LinguisticDiversityChart: React.FC<LinguisticDiversityChartProps> = ({
  isDarkMode,
  languageDiversity,
  endangeredLanguages,
  selectedCountries,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('diversity');

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

  const diversityData = useMemo(() => {
    return selectedCountries
      .filter(c => languageDiversity[c] !== undefined && languageDiversity[c] !== null)
      .map(country => ({ country, index: languageDiversity[country] }))
      .sort((a, b) => b.index - a.index);
  }, [languageDiversity, selectedCountries]);

  const endangeredData = useMemo(() => {
    return selectedCountries
      .filter(c => endangeredLanguages[c] !== undefined && endangeredLanguages[c] !== null)
      .map(country => ({ country, count: endangeredLanguages[country] }))
      .sort((a, b) => b.count - a.count);
  }, [endangeredLanguages, selectedCountries]);

  const endangeredChartHeight = Math.max(350, endangeredData.length * 30);
  const topFiveEndangered = endangeredData.slice(0, 5);
  const topFiveMaxCount = topFiveEndangered.length
    ? Math.max(...topFiveEndangered.map(d => d.count), 1)
    : 1;

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-violet-500 text-violet-400' : 'bg-white border-violet-400 text-violet-700'
      }`}>
        <h3 className="font-semibold">Linguistic Diversity</h3>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Language diversity reflects deep cultural plurality, while endangered languages represent irreplaceable cultural heritage at risk.
        </p>
      </div>

      <div className={`flex flex-wrap gap-2 p-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {([
          { id: 'diversity' as ViewMode, label: 'Language Diversity' },
          { id: 'endangered' as ViewMode, label: 'Endangered Languages' },
        ]).map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setViewMode(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === tab.id
                ? isDarkMode ? 'bg-violet-600 text-white' : 'bg-white text-gray-900 shadow'
                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {viewMode === 'diversity' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Language Diversity Index</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>Higher values indicate greater linguistic plurality (0–1 scale)</p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diversityData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis
                  dataKey="country"
                  tick={{ fill: themeColors.tickColor, fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                />
                <YAxis domain={[0, 1]} tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => value.toFixed(3)}
                />
                <Bar dataKey="index" radius={[4, 4, 0, 0]}>
                  {diversityData.map((entry, index) => (
                    <Cell key={index} fill={culturalChartColors[entry.country] || '#8B5CF6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'endangered' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Endangered Languages</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>Number of endangered languages by country</p>
          <div className="w-full" style={{ height: endangeredChartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={endangeredData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis type="number" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <YAxis dataKey="country" type="category" tick={{ fill: themeColors.tickColor, fontSize: 12 }} width={75} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => `${value} languages`}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {endangeredData.map((entry, index) => (
                    <Cell key={index} fill={culturalChartColors[entry.country] || '#7C3AED'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {topFiveEndangered.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {topFiveEndangered.map(item => {
                const fill = culturalChartColors[item.country] || '#7C3AED';
                const barPct = (item.count / topFiveMaxCount) * 100;
                return (
                  <div
                    key={item.country}
                    className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-sm font-medium truncate ${themeColors.text}`}>{item.country}</span>
                      <span className="text-sm font-bold shrink-0" style={{ color: fill }}>
                        {item.count}
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${barPct}%`, backgroundColor: fill }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LinguisticDiversityChart;

'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Line, Cell,
} from 'recharts';
import { CountryData } from '../services/worldbank';
import { culturalChartColors, formatPercent } from '../data/culturalMetrics';

interface CulturalInfraChartProps {
  isDarkMode: boolean;
  museumDensity: { [country: string]: number };
  creativeCities: { [country: string]: { total: number; fields: string[] } };
  educationExpenditure: CountryData[];
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

type ViewMode = 'museums' | 'cities' | 'education';

const CulturalInfraChart: React.FC<CulturalInfraChartProps> = ({
  isDarkMode, museumDensity, creativeCities, educationExpenditure, selectedCountries,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('museums');

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

  const museumData = useMemo(() => {
    return selectedCountries
      .filter(c => museumDensity[c])
      .map(country => ({ country, Density: museumDensity[country] }))
      .sort((a, b) => b.Density - a.Density);
  }, [museumDensity, selectedCountries]);

  const citiesData = useMemo(() => {
    return selectedCountries
      .filter(c => creativeCities[c])
      .map(country => ({
        country,
        Cities: creativeCities[country].total,
        fields: creativeCities[country].fields,
      }))
      .sort((a, b) => b.Cities - a.Cities);
  }, [creativeCities, selectedCountries]);

  const educationData = useMemo(() => {
    if (educationExpenditure.length === 0) return [];
    return educationExpenditure.slice(-12).map(yearData => {
      const entry: any = { year: yearData.year };
      selectedCountries.forEach(country => {
        if (yearData[country] !== undefined) entry[country] = yearData[country];
      });
      return entry;
    });
  }, [educationExpenditure, selectedCountries]);

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-indigo-500 text-indigo-400' : 'bg-white border-indigo-400 text-indigo-700'
      }`}>
        <h3 className="font-semibold">Cultural Infrastructure</h3>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Museums, creative cities, and education investment form the infrastructure
          that sustains and grows cultural capital.
        </p>
      </div>

      <div className={`flex flex-wrap gap-2 p-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {([
          { id: 'museums' as ViewMode, label: 'Museum Density' },
          { id: 'cities' as ViewMode, label: 'Creative Cities' },
          { id: 'education' as ViewMode, label: 'Education Spending' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === tab.id
                ? isDarkMode ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 shadow'
                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {viewMode === 'museums' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Museum Density</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>Museums per million inhabitants</p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={museumData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis dataKey="country" tick={{ fill: themeColors.tickColor, fontSize: 11 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => `${value} per million`} />
                <Bar dataKey="Density" radius={[4, 4, 0, 0]}>
                  {museumData.map((entry, index) => (
                    <Cell key={index} fill={culturalChartColors[entry.country] || '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'cities' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>UNESCO Creative Cities Network</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>Designated cities across creative fields</p>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={citiesData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis type="number" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <YAxis dataKey="country" type="category" tick={{ fill: themeColors.tickColor, fontSize: 12 }} width={75} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Cities" radius={[0, 4, 4, 0]}>
                  {citiesData.map((entry, index) => (
                    <Cell key={index} fill={culturalChartColors[entry.country] || '#F97316'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {citiesData.slice(0, 6).map(item => (
              <div key={item.country} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${themeColors.text}`}>{item.country}</span>
                  <span className="text-sm font-bold" style={{ color: culturalChartColors[item.country] }}>{item.Cities} cities</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.fields.map(field => (
                    <span key={field} className={`text-xs px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'education' && educationData.length > 0 && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Education Expenditure</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>Government spending on education (% of GDP)</p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={educationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis dataKey="year" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <YAxis tick={{ fill: themeColors.tickColor, fontSize: 12 }} label={{ value: '% of GDP', angle: -90, position: 'insideLeft', fill: themeColors.tickColor }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatPercent(value)} />
                <Legend />
                {selectedCountries.slice(0, 8).map(country => (
                  <Line
                    key={country}
                    type="monotone"
                    dataKey={country}
                    stroke={culturalChartColors[country] || '#06B6D4'}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default CulturalInfraChart;

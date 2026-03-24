'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { culturalChartColors } from '../data/culturalMetrics';

interface HeritageSitesChartProps {
  isDarkMode: boolean;
  heritageData: { [country: string]: { total: number; cultural: number; natural: number; mixed: number } };
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

const HeritageSitesChart: React.FC<HeritageSitesChartProps> = ({
  isDarkMode, heritageData, selectedCountries, onCountryChange
}) => {
  const [sortBy, setSortBy] = useState<'total' | 'cultural' | 'natural'>('total');

  const chartData = useMemo(() => {
    return selectedCountries
      .filter(c => heritageData[c])
      .map(country => ({
        country,
        Cultural: heritageData[country].cultural,
        Natural: heritageData[country].natural,
        Mixed: heritageData[country].mixed,
        Total: heritageData[country].total,
      }))
      .sort((a, b) => {
        if (sortBy === 'cultural') return b.Cultural - a.Cultural;
        if (sortBy === 'natural') return b.Natural - a.Natural;
        return b.Total - a.Total;
      });
  }, [heritageData, selectedCountries, sortBy]);

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    gridColor: isDarkMode ? '#374151' : '#E5E7EB',
    tickColor: isDarkMode ? '#9CA3AF' : '#6B7280',
  };

  return (
    <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${themeColors.text}`}>UNESCO World Heritage Sites</h3>
          <p className={`text-sm ${themeColors.textSecondary}`}>
            Sites by category across selected countries
          </p>
        </div>
        <div className="flex gap-2">
          {(['total', 'cultural', 'natural'] as const).map(option => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                sortBy === option
                  ? isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
                  : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Sort: {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
            <XAxis type="number" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
            <YAxis
              dataKey="country"
              type="category"
              tick={{ fill: themeColors.tickColor, fontSize: 12 }}
              width={75}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                borderRadius: '8px',
                color: isDarkMode ? '#F3F4F6' : '#111827',
              }}
            />
            <Legend />
            <Bar dataKey="Cultural" stackId="a" fill="#8B5CF6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Natural" stackId="a" fill="#10B981" />
            <Bar dataKey="Mixed" stackId="a" fill="#F59E0B" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {chartData.slice(0, 4).map(item => (
          <div key={item.country} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <div className="text-2xl font-bold" style={{ color: culturalChartColors[item.country] }}>
              {item.Total}
            </div>
            <div className={`text-sm ${themeColors.textSecondary}`}>{item.country}</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {item.Cultural}C / {item.Natural}N / {item.Mixed}M
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeritageSitesChart;

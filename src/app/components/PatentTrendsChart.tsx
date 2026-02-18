'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { CountryData } from '../services/worldbank';
import { techChartColors, formatNumber, defaultTechCountries } from '../data/technologyIndicators';

interface PatentTrendsChartProps {
  isDarkMode: boolean;
  patentData: CountryData[];
  nonResidentData: CountryData[];
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

const PatentTrendsChart: React.FC<PatentTrendsChartProps> = ({
  isDarkMode,
  patentData,
  nonResidentData,
  selectedCountries,
  onCountryChange
}) => {
  const [viewMode, setViewMode] = useState<'resident' | 'nonresident' | 'combined'>('resident');
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2022]);

  // Filter data by year range
  const filteredData = useMemo(() => {
    const data = viewMode === 'nonresident' ? nonResidentData : patentData;
    return data.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1]);
  }, [patentData, nonResidentData, viewMode, yearRange]);

  // Get available years
  const availableYears = useMemo(() => {
    const years = patentData.map(d => d.year);
    return {
      min: Math.min(...years),
      max: Math.max(...years)
    };
  }, [patentData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className={`p-3 rounded-lg shadow-lg border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {entry.name}:
            </span>
            <span className="font-medium">
              {formatNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    gridColor: isDarkMode ? '#374151' : '#E5E7EB',
    axisColor: isDarkMode ? '#9CA3AF' : '#6B7280'
  };

  return (
    <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${themeColors.text}`}>
            Patent Applications Trends
          </h3>
          <p className={`text-sm ${themeColors.textSecondary}`}>
            Track patent filing activity across countries over time
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {/* View Mode */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            } border`}
          >
            <option value="resident">Resident Patents</option>
            <option value="nonresident">Non-Resident Patents</option>
          </select>

          {/* Chart Type */}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            } border`}
          >
            <option value="line">Line Chart</option>
            <option value="area">Area Chart</option>
          </select>
        </div>
      </div>

      {/* Year Range Selector */}
      <div className="flex items-center gap-4 mb-6">
        <span className={`text-sm ${themeColors.textSecondary}`}>Year Range:</span>
        <input
          type="range"
          min={availableYears.min}
          max={availableYears.max}
          value={yearRange[0]}
          onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
          className="w-24"
        />
        <span className={`text-sm font-medium ${themeColors.text}`}>{yearRange[0]}</span>
        <span className={themeColors.textTertiary}>to</span>
        <input
          type="range"
          min={availableYears.min}
          max={availableYears.max}
          value={yearRange[1]}
          onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
          className="w-24"
        />
        <span className={`text-sm font-medium ${themeColors.text}`}>{yearRange[1]}</span>
      </div>

      {/* Country Selector */}
      <div className="mb-6">
        <p className={`text-sm ${themeColors.textSecondary} mb-2`}>
          Select countries to display (max 10):
        </p>
        <div className="flex flex-wrap gap-2">
          {defaultTechCountries.map(country => (
            <button
              key={country}
              onClick={() => {
                if (selectedCountries.includes(country)) {
                  onCountryChange(selectedCountries.filter(c => c !== country));
                } else if (selectedCountries.length < 10) {
                  onCountryChange([...selectedCountries, country]);
                }
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCountries.includes(country)
                  ? 'ring-2 ring-offset-1'
                  : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedCountries.includes(country) ? techChartColors[country] : undefined,
                color: selectedCountries.includes(country) ? 'white' : undefined,
                borderColor: selectedCountries.includes(country) ? techChartColors[country] : undefined
              }}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
              <XAxis 
                dataKey="year" 
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
              />
              <YAxis 
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              {selectedCountries.map(country => (
                <Line
                  key={country}
                  type="monotone"
                  dataKey={country}
                  name={country}
                  stroke={techChartColors[country]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              ))}
            </LineChart>
          ) : (
            <ComposedChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
              <XAxis 
                dataKey="year" 
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
              />
              <YAxis 
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              {selectedCountries.map(country => (
                <Area
                  key={country}
                  type="monotone"
                  dataKey={country}
                  name={country}
                  fill={techChartColors[country]}
                  fillOpacity={0.3}
                  stroke={techChartColors[country]}
                  strokeWidth={2}
                  connectNulls
                />
              ))}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {selectedCountries.slice(0, 4).map(country => {
          const latestData = filteredData[filteredData.length - 1];
          const previousData = filteredData[filteredData.length - 2];
          const currentValue = latestData?.[country] as number;
          const previousValue = previousData?.[country] as number;
          const change = currentValue && previousValue 
            ? ((currentValue - previousValue) / previousValue * 100) 
            : 0;

          return (
            <div 
              key={country}
              className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: techChartColors[country] }}
                />
                <span className={`text-sm font-medium ${themeColors.text}`}>{country}</span>
              </div>
              <div className="text-xl font-bold" style={{ color: techChartColors[country] }}>
                {currentValue ? formatNumber(currentValue) : 'N/A'}
              </div>
              {change !== 0 && (
                <div className={`text-xs ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change > 0 ? '+' : ''}{change.toFixed(1)}% YoY
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatentTrendsChart;

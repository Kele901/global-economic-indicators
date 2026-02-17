'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts';
import { CountryData } from '../services/worldbank';
import { techChartColors, formatPercent, defaultTechCountries } from '../data/technologyIndicators';

interface TechExportsChartProps {
  isDarkMode: boolean;
  hightechData: CountryData[];
  ictData: CountryData[];
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

const TechExportsChart: React.FC<TechExportsChartProps> = ({
  isDarkMode,
  hightechData,
  ictData,
  selectedCountries,
  onCountryChange
}) => {
  const [viewMode, setViewMode] = useState<'hightech' | 'ict' | 'combined'>('hightech');
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [selectedYear, setSelectedYear] = useState<number>(2021);

  // Get available years
  const availableYears = useMemo(() => {
    return hightechData.map(d => d.year).sort((a, b) => b - a);
  }, [hightechData]);

  // Filter data for time series
  const timeSeriesData = useMemo(() => {
    const data = viewMode === 'ict' ? ictData : hightechData;
    return data.filter(d => d.year >= 2000);
  }, [hightechData, ictData, viewMode]);

  // Get data for selected year (for bar chart)
  const yearData = useMemo(() => {
    const data = viewMode === 'ict' ? ictData : hightechData;
    const yearEntry = data.find(d => d.year === selectedYear);
    if (!yearEntry) return [];

    return selectedCountries
      .map(country => ({
        country,
        value: yearEntry[country] as number || 0
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [hightechData, ictData, viewMode, selectedYear, selectedCountries]);

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
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {entry.name || entry.dataKey}:
            </span>
            <span className="font-medium">
              {formatPercent(entry.value)}
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

  const renderChart = () => {
    if (chartType === 'bar') {
      return (
        <BarChart data={yearData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
          <XAxis 
            type="number"
            stroke={themeColors.axisColor}
            tick={{ fill: themeColors.axisColor, fontSize: 12 }}
            tickFormatter={(value) => formatPercent(value)}
          />
          <YAxis 
            type="category"
            dataKey="country"
            stroke={themeColors.axisColor}
            tick={{ fill: themeColors.axisColor, fontSize: 12 }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            name={viewMode === 'ict' ? 'ICT Exports (%)' : 'High-Tech Exports (%)'}
            radius={[0, 4, 4, 0]}
          >
            {yearData.map((entry, index) => (
              <rect
                key={`bar-${index}`}
                fill={techChartColors[entry.country] || '#8884d8'}
              />
            ))}
          </Bar>
        </BarChart>
      );
    }

    if (chartType === 'line') {
      return (
        <LineChart data={timeSeriesData}>
          <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
          <XAxis 
            dataKey="year" 
            stroke={themeColors.axisColor}
            tick={{ fill: themeColors.axisColor, fontSize: 12 }}
          />
          <YAxis 
            stroke={themeColors.axisColor}
            tick={{ fill: themeColors.axisColor, fontSize: 12 }}
            tickFormatter={(value) => formatPercent(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
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
      );
    }

    // Default: Area chart
    return (
      <AreaChart data={timeSeriesData}>
        <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
        <XAxis 
          dataKey="year" 
          stroke={themeColors.axisColor}
          tick={{ fill: themeColors.axisColor, fontSize: 12 }}
        />
        <YAxis 
          stroke={themeColors.axisColor}
          tick={{ fill: themeColors.axisColor, fontSize: 12 }}
          tickFormatter={(value) => formatPercent(value)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
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
      </AreaChart>
    );
  };

  return (
    <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${themeColors.text}`}>
            Technology Exports
          </h3>
          <p className={`text-sm ${themeColors.textSecondary}`}>
            {viewMode === 'ict' 
              ? 'ICT goods exports as percentage of total goods exports'
              : 'High-technology exports as percentage of manufactured exports'}
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
            <option value="hightech">High-Tech Exports</option>
            <option value="ict">ICT Goods Exports</option>
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
            <option value="area">Area Chart</option>
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart ({selectedYear})</option>
          </select>

          {/* Year Selector (for bar chart) */}
          {chartType === 'bar' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              } border`}
            >
              {availableYears.slice(0, 10).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Country Selector */}
      <div className="mb-6">
        <p className={`text-sm ${themeColors.textSecondary} mb-2`}>
          Select countries:
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
                ringColor: selectedCountries.includes(country) ? techChartColors[country] : undefined
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
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Info Box */}
      <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <h4 className={`text-sm font-semibold mb-2 ${themeColors.text}`}>
          What are High-Technology Exports?
        </h4>
        <p className={`text-sm ${themeColors.textSecondary}`}>
          High-technology exports include products with high R&amp;D intensity such as aerospace, 
          computers, pharmaceuticals, scientific instruments, and electrical machinery. 
          Countries with higher percentages typically have more advanced manufacturing sectors 
          and stronger positions in global technology value chains.
        </p>
      </div>

      {/* Top Exporters */}
      <div className="mt-6">
        <h4 className={`text-sm font-semibold mb-3 ${themeColors.text}`}>
          Top Technology Exporters ({selectedYear})
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {yearData.slice(0, 5).map((item, index) => (
            <div 
              key={item.country}
              className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg font-bold ${themeColors.textTertiary}`}>#{index + 1}</span>
                <span className={`text-sm font-medium ${themeColors.text}`}>{item.country}</span>
              </div>
              <div className="text-xl font-bold" style={{ color: techChartColors[item.country] }}>
                {formatPercent(item.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechExportsChart;

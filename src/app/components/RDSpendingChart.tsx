'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Cell
} from 'recharts';
import { CountryData } from '../services/worldbank';
import { techChartColors, formatNumber, formatPercent, defaultTechCountries } from '../data/technologyIndicators';

interface RDSpendingChartProps {
  isDarkMode: boolean;
  rdData: CountryData[];
  researchersData: CountryData[];
  techniciansData: CountryData[];
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

const RDSpendingChart: React.FC<RDSpendingChartProps> = ({
  isDarkMode,
  rdData,
  researchersData,
  techniciansData,
  selectedCountries,
  onCountryChange
}) => {
  const [viewMode, setViewMode] = useState<'spending' | 'researchers' | 'comparison'>('spending');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [selectedYear, setSelectedYear] = useState<number>(2021);

  // Get available years
  const availableYears = useMemo(() => {
    return rdData.map(d => d.year).sort((a, b) => b - a);
  }, [rdData]);

  // Get data for selected year (for bar chart comparison)
  const yearData = useMemo(() => {
    const data = viewMode === 'researchers' ? researchersData : rdData;
    const yearEntry = data.find(d => d.year === selectedYear);
    if (!yearEntry) return [];

    return selectedCountries
      .map(country => ({
        country,
        value: yearEntry[country] as number || 0
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [rdData, researchersData, viewMode, selectedYear, selectedCountries]);

  // Get time series data
  const timeSeriesData = useMemo(() => {
    const data = viewMode === 'researchers' ? researchersData : rdData;
    return data.filter(d => d.year >= 2000);
  }, [rdData, researchersData, viewMode]);

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
              {viewMode === 'spending' 
                ? formatPercent(entry.value) 
                : formatNumber(entry.value)}
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
            R&amp;D Investment Analysis
          </h3>
          <p className={`text-sm ${themeColors.textSecondary}`}>
            {viewMode === 'spending' 
              ? 'Research & Development expenditure as percentage of GDP'
              : 'Research workforce per million people'}
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
            <option value="spending">R&amp;D Spending (% GDP)</option>
            <option value="researchers">Researchers per Million</option>
            <option value="comparison">Time Series</option>
          </select>

          {/* Chart Type (for comparison mode) */}
          {viewMode === 'comparison' && (
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
              <option value="bar">Bar Chart</option>
            </select>
          )}

          {/* Year Selector (for bar chart) */}
          {viewMode !== 'comparison' && (
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
          {viewMode === 'comparison' ? (
            // Time series view
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
          ) : (
            // Bar chart comparison for single year
            <BarChart data={yearData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
              <XAxis 
                type="number"
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
                tickFormatter={(value) => viewMode === 'spending' ? formatPercent(value) : formatNumber(value)}
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
                name={viewMode === 'spending' ? 'R&D (% GDP)' : 'Researchers'}
                radius={[0, 4, 4, 0]}
              >
                {yearData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={techChartColors[entry.country] || '#8884d8'}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Benchmark Reference */}
      <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <h4 className={`text-sm font-semibold mb-2 ${themeColors.text}`}>
          R&amp;D Investment Benchmarks
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className={themeColors.textTertiary}>OECD Average:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>2.5%</span>
          </div>
          <div>
            <span className={themeColors.textTertiary}>EU Target:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>3.0%</span>
          </div>
          <div>
            <span className={themeColors.textTertiary}>Global Leader:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>Israel (5.4%)</span>
          </div>
          <div>
            <span className={themeColors.textTertiary}>World Average:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>2.2%</span>
          </div>
        </div>
      </div>

      {/* Top Countries Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
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
              {viewMode === 'spending' ? formatPercent(item.value) : formatNumber(item.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RDSpendingChart;

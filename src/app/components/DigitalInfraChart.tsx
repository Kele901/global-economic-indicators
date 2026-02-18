'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { CountryData } from '../services/worldbank';
import { techChartColors, formatNumber, formatPercent, defaultTechCountries } from '../data/technologyIndicators';

interface DigitalInfraChartProps {
  isDarkMode: boolean;
  broadbandData: CountryData[];
  mobileData: CountryData[];
  secureServersData: CountryData[];
  internetUsersData: CountryData[];
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

const DigitalInfraChart: React.FC<DigitalInfraChartProps> = ({
  isDarkMode,
  broadbandData,
  mobileData,
  secureServersData,
  internetUsersData,
  selectedCountries,
  onCountryChange
}) => {
  const [viewMode, setViewMode] = useState<'broadband' | 'mobile' | 'servers' | 'internet'>('broadband');
  const [chartType, setChartType] = useState<'trend' | 'comparison'>('trend');
  const [selectedYear, setSelectedYear] = useState<number>(2023);

  const currentData = useMemo(() => {
    switch (viewMode) {
      case 'broadband': return broadbandData || [];
      case 'mobile': return mobileData || [];
      case 'servers': return secureServersData || [];
      case 'internet': return internetUsersData || [];
      default: return broadbandData || [];
    }
  }, [viewMode, broadbandData, mobileData, secureServersData, internetUsersData]);

  const availableYears = useMemo(() => {
    if (!currentData || currentData.length === 0) return [];
    return currentData.map(d => d.year).sort((a, b) => a - b);
  }, [currentData]);

  const yearData = useMemo(() => {
    if (!currentData || currentData.length === 0) return [];
    const yearEntry = currentData.find(d => d.year === selectedYear);
    if (!yearEntry) return [];
    
    return selectedCountries
      .filter(country => yearEntry[country] !== undefined && yearEntry[country] !== null)
      .map(country => ({
        country,
        value: yearEntry[country] as number
      }))
      .sort((a, b) => b.value - a.value);
  }, [currentData, selectedYear, selectedCountries]);

  const getUnit = () => {
    switch (viewMode) {
      case 'broadband': return 'per 100 people';
      case 'mobile': return 'per 100 people';
      case 'servers': return 'per million people';
      case 'internet': return '% of population';
      default: return '';
    }
  };

  const getTitle = () => {
    switch (viewMode) {
      case 'broadband': return 'Fixed Broadband Subscriptions';
      case 'mobile': return 'Mobile Cellular Subscriptions';
      case 'servers': return 'Secure Internet Servers';
      case 'internet': return 'Internet Users';
      default: return '';
    }
  };

  const formatValue = (value: number) => {
    if (viewMode === 'internet') return formatPercent(value);
    if (viewMode === 'servers') return formatNumber(value, 0);
    return value.toFixed(1);
  };

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
              {formatValue(entry.value)} {getUnit()}
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

  const allCountries = useMemo(() => {
    const countries = new Set<string>();
    const allData = [
      ...(broadbandData || []), 
      ...(mobileData || []), 
      ...(secureServersData || []), 
      ...(internetUsersData || [])
    ];
    allData.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== 'year' && typeof row[key] === 'number') {
          countries.add(key);
        }
      });
    });
    return Array.from(countries).sort();
  }, [broadbandData, mobileData, secureServersData, internetUsersData]);

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      onCountryChange(selectedCountries.filter(c => c !== country));
    } else if (selectedCountries.length < 10) {
      onCountryChange([...selectedCountries, country]);
    }
  };

  return (
    <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${themeColors.text}`}>
            Digital Infrastructure Analysis
          </h3>
          <p className={`text-sm ${themeColors.textSecondary}`}>
            {getTitle()} - {getUnit()}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            } border`}
          >
            <option value="broadband">Broadband</option>
            <option value="mobile">Mobile</option>
            <option value="servers">Secure Servers</option>
            <option value="internet">Internet Users</option>
          </select>

          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            } border`}
          >
            <option value="trend">Trend Over Time</option>
            <option value="comparison">Country Comparison</option>
          </select>

          {chartType === 'comparison' && availableYears.length > 0 && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              } border`}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Country Selection */}
      <div className="mb-4">
        <p className={`text-sm ${themeColors.textTertiary} mb-2`}>
          Select countries (max 10):
        </p>
        <div className="flex flex-wrap gap-2">
          {allCountries.slice(0, 20).map(country => (
            <button
              key={country}
              onClick={() => toggleCountry(country)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCountries.includes(country)
                  ? 'text-white'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={selectedCountries.includes(country) ? {
                backgroundColor: techChartColors[country] || '#6B7280'
              } : {}}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'trend' ? (
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
              <XAxis 
                dataKey="year" 
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
              />
              <YAxis 
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
                tickFormatter={(value) => formatValue(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {selectedCountries.map(country => (
                <Line
                  key={country}
                  type="monotone"
                  dataKey={country}
                  name={country}
                  stroke={techChartColors[country] || '#6B7280'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={yearData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
              <XAxis 
                type="number"
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
                tickFormatter={(value) => formatValue(value)}
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
                name={getTitle()}
                radius={[0, 4, 4, 0]}
              >
                {yearData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={techChartColors[entry.country] || '#6B7280'}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {yearData.slice(0, 4).map((item, index) => (
          <div 
            key={item.country}
            className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-lg font-bold ${themeColors.textTertiary}`}>#{index + 1}</span>
              <span className={`text-sm font-medium ${themeColors.text}`}>{item.country}</span>
            </div>
            <div className="text-xl font-bold" style={{ color: techChartColors[item.country] }}>
              {formatValue(item.value)}
            </div>
            <div className={`text-xs ${themeColors.textTertiary}`}>{getUnit()}</div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <h4 className={`text-sm font-semibold mb-2 ${themeColors.text}`}>
          Digital Infrastructure Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className={themeColors.textTertiary}>Global Broadband Average:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>~18 per 100 people</span>
          </div>
          <div>
            <span className={themeColors.textTertiary}>Global Mobile Average:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>~110 per 100 people</span>
          </div>
          <div>
            <span className={themeColors.textTertiary}>Internet Penetration Goal:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>Universal Access (100%)</span>
          </div>
          <div>
            <span className={themeColors.textTertiary}>5G Coverage Leaders:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>South Korea, China, USA</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalInfraChart;

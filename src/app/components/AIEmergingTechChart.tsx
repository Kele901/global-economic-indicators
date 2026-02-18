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
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { CountryData } from '../services/worldbank';
import { techChartColors, formatNumber } from '../data/technologyIndicators';

interface AIEmergingTechChartProps {
  isDarkMode: boolean;
  aiPatentData: CountryData[];
  generalPatentData: CountryData[];
  hightechExportsData: CountryData[];
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

const AIEmergingTechChart: React.FC<AIEmergingTechChartProps> = ({
  isDarkMode,
  aiPatentData,
  generalPatentData,
  hightechExportsData,
  selectedCountries,
  onCountryChange
}) => {
  const [viewMode, setViewMode] = useState<'ai_patents' | 'all_patents' | 'hightech' | 'growth'>('ai_patents');
  const [chartType, setChartType] = useState<'trend' | 'comparison'>('comparison');
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  const currentData = useMemo(() => {
    switch (viewMode) {
      case 'ai_patents': return aiPatentData || [];
      case 'all_patents': return generalPatentData || [];
      case 'hightech': return hightechExportsData || [];
      default: return aiPatentData || [];
    }
  }, [viewMode, aiPatentData, generalPatentData, hightechExportsData]);

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

  const growthData = useMemo(() => {
    if (!aiPatentData || aiPatentData.length < 2) return [];
    
    const recentYear = aiPatentData[aiPatentData.length - 1];
    const previousYear = aiPatentData[aiPatentData.length - 2];
    
    if (!recentYear || !previousYear) return [];
    
    return selectedCountries
      .filter(country => 
        recentYear[country] !== undefined && 
        previousYear[country] !== undefined &&
        typeof recentYear[country] === 'number' &&
        typeof previousYear[country] === 'number' &&
        (previousYear[country] as number) > 0
      )
      .map(country => {
        const current = recentYear[country] as number;
        const previous = previousYear[country] as number;
        const growth = ((current - previous) / previous) * 100;
        return {
          country,
          value: growth,
          current,
          previous
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [aiPatentData, selectedCountries]);

  const getUnit = () => {
    switch (viewMode) {
      case 'ai_patents': return 'applications';
      case 'all_patents': return 'applications';
      case 'hightech': return '% of manufactured exports';
      case 'growth': return '% YoY growth';
      default: return '';
    }
  };

  const getTitle = () => {
    switch (viewMode) {
      case 'ai_patents': return 'AI Patent Applications';
      case 'all_patents': return 'Total Patent Applications';
      case 'hightech': return 'High-Tech Exports';
      case 'growth': return 'AI Patent Growth Rate';
      default: return '';
    }
  };

  const formatValue = (value: number) => {
    if (viewMode === 'hightech' || viewMode === 'growth') return value.toFixed(1) + '%';
    return formatNumber(value, 0);
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
              {formatValue(entry.value)} {viewMode !== 'growth' && viewMode !== 'hightech' ? getUnit() : ''}
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
      ...(aiPatentData || []), 
      ...(generalPatentData || []), 
      ...(hightechExportsData || [])
    ];
    allData.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== 'year' && typeof row[key] === 'number') {
          countries.add(key);
        }
      });
    });
    return Array.from(countries).sort();
  }, [aiPatentData, generalPatentData, hightechExportsData]);

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      onCountryChange(selectedCountries.filter(c => c !== country));
    } else if (selectedCountries.length < 10) {
      onCountryChange([...selectedCountries, country]);
    }
  };

  const totalAIPatents = useMemo(() => {
    if (!aiPatentData?.length) return 0;
    const yearEntry = aiPatentData.find(d => d.year === selectedYear) || aiPatentData[aiPatentData.length - 1];
    if (!yearEntry) return 0;
    return Object.entries(yearEntry)
      .filter(([key]) => key !== 'year')
      .reduce((sum, [, value]) => sum + (typeof value === 'number' ? value : 0), 0);
  }, [aiPatentData, selectedYear]);

  const chinaShare = useMemo(() => {
    if (!aiPatentData?.length) return 0;
    const yearEntry = aiPatentData.find(d => d.year === selectedYear) || aiPatentData[aiPatentData.length - 1];
    if (!yearEntry || !yearEntry.China || totalAIPatents === 0) return 0;
    return ((yearEntry.China as number) / totalAIPatents) * 100;
  }, [aiPatentData, selectedYear, totalAIPatents]);

  const usaShare = useMemo(() => {
    if (!aiPatentData?.length) return 0;
    const yearEntry = aiPatentData.find(d => d.year === selectedYear) || aiPatentData[aiPatentData.length - 1];
    if (!yearEntry || !yearEntry.USA || totalAIPatents === 0) return 0;
    return ((yearEntry.USA as number) / totalAIPatents) * 100;
  }, [aiPatentData, selectedYear, totalAIPatents]);

  return (
    <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${themeColors.text}`}>
            AI & Emerging Technology Analysis
          </h3>
          <p className={`text-sm ${themeColors.textSecondary}`}>
            {getTitle()}
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
            <option value="ai_patents">AI Patents</option>
            <option value="all_patents">All Patents</option>
            <option value="hightech">High-Tech Exports</option>
            <option value="growth">AI Patent Growth</option>
          </select>

          {viewMode !== 'growth' && (
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              } border`}
            >
              <option value="comparison">Country Comparison</option>
              <option value="trend">Trend Over Time</option>
            </select>
          )}

          {chartType === 'comparison' && viewMode !== 'growth' && availableYears.length > 0 && (
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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
          <div className={`text-xs ${themeColors.textTertiary}`}>Global AI Patents ({selectedYear})</div>
          <div className="text-xl font-bold text-indigo-500">{formatNumber(totalAIPatents, 0)}</div>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
          <div className={`text-xs ${themeColors.textTertiary}`}>China Share</div>
          <div className="text-xl font-bold text-red-500">{chinaShare.toFixed(1)}%</div>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
          <div className={`text-xs ${themeColors.textTertiary}`}>USA Share</div>
          <div className="text-xl font-bold text-blue-500">{usaShare.toFixed(1)}%</div>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
          <div className={`text-xs ${themeColors.textTertiary}`}>AI Growth Rate</div>
          <div className="text-xl font-bold text-emerald-500">+12.5%</div>
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
          {viewMode === 'growth' ? (
            <BarChart data={growthData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
              <XAxis 
                type="number"
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
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
                name="YoY Growth"
                radius={[0, 4, 4, 0]}
              >
                {growthData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.value >= 0 ? '#10B981' : '#EF4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : chartType === 'trend' ? (
            <AreaChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
              <XAxis 
                dataKey="year" 
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
              />
              <YAxis 
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
                tickFormatter={(value) => viewMode === 'hightech' ? `${value}%` : formatNumber(value, 0)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {selectedCountries.map(country => (
                <Area
                  key={country}
                  type="monotone"
                  dataKey={country}
                  name={country}
                  stroke={techChartColors[country] || '#6B7280'}
                  fill={techChartColors[country] || '#6B7280'}
                  fillOpacity={0.2}
                  strokeWidth={2}
                  connectNulls
                />
              ))}
            </AreaChart>
          ) : (
            <BarChart data={yearData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
              <XAxis 
                type="number"
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
                tickFormatter={(value) => viewMode === 'hightech' ? `${value}%` : formatNumber(value, 0)}
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

      {/* Top Countries */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        {(viewMode === 'growth' ? growthData : yearData).slice(0, 5).map((item, index) => (
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
          AI & Emerging Tech Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className={themeColors.textTertiary}>AI Patent Leader:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>China (98,765 in 2024)</span>
          </div>
          <div>
            <span className={themeColors.textTertiary}>Fastest AI Growth:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>India (+17.2% YoY)</span>
          </div>
          <div>
            <span className={themeColors.textTertiary}>Top AI Research Areas:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>ML, NLP, Computer Vision</span>
          </div>
          <div>
            <span className={themeColors.textTertiary}>Global AI Market:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>$500B+ by 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEmergingTechChart;

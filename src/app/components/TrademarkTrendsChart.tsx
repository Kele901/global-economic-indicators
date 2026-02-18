'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  ComposedChart,
  Bar
} from 'recharts';
import { CountryData } from '../services/worldbank';
import { techChartColors, formatNumber } from '../data/technologyIndicators';

interface TrademarkTrendsChartProps {
  isDarkMode: boolean;
  trademarkData: CountryData[];
  patentData?: CountryData[];
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

const TrademarkTrendsChart: React.FC<TrademarkTrendsChartProps> = ({
  isDarkMode,
  trademarkData,
  patentData,
  selectedCountries,
  onCountryChange
}) => {
  const [viewMode, setViewMode] = useState<'absolute' | 'growth' | 'comparison'>('absolute');
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [yearRange, setYearRange] = useState<{ start: number; end: number }>({ start: 2010, end: 2022 });

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    gridColor: isDarkMode ? '#374151' : '#E5E7EB',
    axisColor: isDarkMode ? '#9CA3AF' : '#6B7280'
  };

  const availableYears = useMemo(() => {
    if (!trademarkData?.length) return [];
    return trademarkData.map(d => d.year).sort((a, b) => a - b);
  }, [trademarkData]);

  const allCountries = useMemo(() => {
    if (!trademarkData?.length) return [];
    const countries = new Set<string>();
    trademarkData.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== 'year' && typeof row[key] === 'number') {
          countries.add(key);
        }
      });
    });
    return Array.from(countries).sort();
  }, [trademarkData]);

  const filteredData = useMemo(() => {
    if (!trademarkData?.length) return [];
    return trademarkData
      .filter(d => d.year >= yearRange.start && d.year <= yearRange.end)
      .sort((a, b) => a.year - b.year);
  }, [trademarkData, yearRange]);

  const growthData = useMemo(() => {
    if (filteredData.length < 2) return [];
    
    return filteredData.slice(1).map((current, index) => {
      const previous = filteredData[index];
      const row: any = { year: current.year };
      
      selectedCountries.forEach(country => {
        const currentVal = current[country] as number;
        const previousVal = previous[country] as number;
        
        if (currentVal && previousVal && previousVal > 0) {
          row[country] = ((currentVal - previousVal) / previousVal) * 100;
        }
      });
      
      return row;
    });
  }, [filteredData, selectedCountries]);

  const comparisonData = useMemo(() => {
    if (!trademarkData?.length || !patentData?.length) return [];
    
    return filteredData.map(tmRow => {
      const patentRow = patentData.find(p => p.year === tmRow.year);
      const row: any = { year: tmRow.year };
      
      selectedCountries.forEach(country => {
        row[`${country}_trademark`] = tmRow[country] || 0;
        row[`${country}_patent`] = patentRow?.[country] || 0;
      });
      
      return row;
    });
  }, [filteredData, patentData, selectedCountries]);

  const latestYearStats = useMemo(() => {
    if (!filteredData.length) return { total: 0, leader: 'N/A', growth: 0 };
    
    const latest = filteredData[filteredData.length - 1];
    const previous = filteredData.length > 1 ? filteredData[filteredData.length - 2] : null;
    
    let total = 0;
    let leader = { country: 'N/A', value: 0 };
    
    Object.entries(latest).forEach(([key, value]) => {
      if (key !== 'year' && typeof value === 'number') {
        total += value;
        if (value > leader.value) {
          leader = { country: key, value };
        }
      }
    });
    
    let growth = 0;
    if (previous) {
      let prevTotal = 0;
      Object.entries(previous).forEach(([key, value]) => {
        if (key !== 'year' && typeof value === 'number') {
          prevTotal += value;
        }
      });
      if (prevTotal > 0) {
        growth = ((total - prevTotal) / prevTotal) * 100;
      }
    }
    
    return { total, leader: leader.country, growth };
  }, [filteredData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className={`p-3 rounded-lg shadow-lg border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          const countryName = entry.dataKey.replace('_trademark', '').replace('_patent', '');
          const isPatent = entry.dataKey.includes('_patent');
          
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></span>
              <span>
                {viewMode === 'comparison' 
                  ? `${countryName} ${isPatent ? '(Patents)' : '(Trademarks)'}`
                  : entry.name
                }:
              </span>
              <span className="font-medium">
                {viewMode === 'growth' 
                  ? `${entry.value?.toFixed(1)}%`
                  : formatNumber(entry.value)
                }
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      onCountryChange(selectedCountries.filter(c => c !== country));
    } else if (selectedCountries.length < 8) {
      onCountryChange([...selectedCountries, country]);
    }
  };

  const displayData = viewMode === 'growth' ? growthData : viewMode === 'comparison' ? comparisonData : filteredData;

  return (
    <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${themeColors.text}`}>
            Trademark Application Trends
          </h3>
          <p className={`text-sm ${themeColors.textSecondary}`}>
            {viewMode === 'growth' ? 'Year-over-Year Growth Rate' : 
             viewMode === 'comparison' ? 'Trademarks vs Patents Comparison' :
             'Total Trademark Applications Over Time'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'absolute' | 'growth' | 'comparison')}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            } border`}
          >
            <option value="absolute">Absolute Values</option>
            <option value="growth">Growth Rate (%)</option>
            {patentData && <option value="comparison">vs Patents</option>}
          </select>

          {viewMode !== 'comparison' && (
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'area' | 'line')}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              } border`}
            >
              <option value="area">Area Chart</option>
              <option value="line">Line Chart</option>
            </select>
          )}

          <select
            value={yearRange.start}
            onChange={(e) => setYearRange(prev => ({ ...prev, start: Number(e.target.value) }))}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            } border`}
          >
            {availableYears.filter(y => y < yearRange.end).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <span className={themeColors.textSecondary}>to</span>
          <select
            value={yearRange.end}
            onChange={(e) => setYearRange(prev => ({ ...prev, end: Number(e.target.value) }))}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            } border`}
          >
            {availableYears.filter(y => y > yearRange.start).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'} border ${isDarkMode ? 'border-purple-800' : 'border-purple-200'}`}>
          <p className={`text-xs ${themeColors.textTertiary}`}>Global Total ({yearRange.end})</p>
          <p className={`text-xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            {formatNumber(latestYearStats.total)}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}>
          <p className={`text-xs ${themeColors.textTertiary}`}>Global Leader</p>
          <p className={`text-xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {latestYearStats.leader}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${
          latestYearStats.growth >= 0 
            ? (isDarkMode ? 'bg-green-900/30' : 'bg-green-50') 
            : (isDarkMode ? 'bg-red-900/30' : 'bg-red-50')
        } border ${
          latestYearStats.growth >= 0 
            ? (isDarkMode ? 'border-green-800' : 'border-green-200')
            : (isDarkMode ? 'border-red-800' : 'border-red-200')
        }`}>
          <p className={`text-xs ${themeColors.textTertiary}`}>YoY Growth</p>
          <p className={`text-xl font-bold ${
            latestYearStats.growth >= 0 
              ? (isDarkMode ? 'text-green-400' : 'text-green-600')
              : (isDarkMode ? 'text-red-400' : 'text-red-600')
          }`}>
            {latestYearStats.growth >= 0 ? '+' : ''}{latestYearStats.growth.toFixed(1)}%
          </p>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'} border ${isDarkMode ? 'border-orange-800' : 'border-orange-200'}`}>
          <p className={`text-xs ${themeColors.textTertiary}`}>Countries Selected</p>
          <p className={`text-xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
            {selectedCountries.length} / 8
          </p>
        </div>
      </div>

      {/* Country Selection */}
      <div className="mb-4">
        <p className={`text-sm ${themeColors.textTertiary} mb-2`}>
          Select countries (max 8):
        </p>
        <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
          {allCountries.slice(0, 25).map(country => (
            <button
              key={country}
              onClick={() => toggleCountry(country)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
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
          {viewMode === 'comparison' ? (
            <ComposedChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
              <XAxis
                dataKey="year"
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
              />
              <YAxis
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
                tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}K` : value}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              {selectedCountries.map((country, index) => (
                <React.Fragment key={country}>
                  <Bar
                    dataKey={`${country}_trademark`}
                    name={`${country} Trademarks`}
                    fill={techChartColors[country] || '#6B7280'}
                    fillOpacity={0.7}
                  />
                  <Line
                    type="monotone"
                    dataKey={`${country}_patent`}
                    name={`${country} Patents`}
                    stroke={techChartColors[country] || '#6B7280'}
                    strokeWidth={2}
                    dot={false}
                  />
                </React.Fragment>
              ))}
            </ComposedChart>
          ) : chartType === 'area' ? (
            <AreaChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
              <XAxis
                dataKey="year"
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
              />
              <YAxis
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
                tickFormatter={(value) => 
                  viewMode === 'growth' 
                    ? `${value.toFixed(0)}%`
                    : value >= 1000 ? `${(value/1000).toFixed(0)}K` : value
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              {selectedCountries.map((country) => (
                <Area
                  key={country}
                  type="monotone"
                  dataKey={country}
                  name={country}
                  stroke={techChartColors[country] || '#6B7280'}
                  fill={techChartColors[country] || '#6B7280'}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          ) : (
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
              <XAxis
                dataKey="year"
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
              />
              <YAxis
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
                tickFormatter={(value) => 
                  viewMode === 'growth' 
                    ? `${value.toFixed(0)}%`
                    : value >= 1000 ? `${(value/1000).toFixed(0)}K` : value
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              {selectedCountries.map((country) => (
                <Line
                  key={country}
                  type="monotone"
                  dataKey={country}
                  name={country}
                  stroke={techChartColors[country] || '#6B7280'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <p className={`text-xs ${themeColors.textTertiary}`}>
          <strong>Trademarks</strong> protect brand names, logos, and slogans. High trademark activity indicates 
          commercial innovation and market expansion. Compare with patents to see the balance between 
          technical vs commercial innovation.
        </p>
      </div>
    </div>
  );
};

export default TrademarkTrendsChart;

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
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { CountryData } from '../services/worldbank';
import { techChartColors, formatBillions, formatNumber } from '../data/technologyIndicators';

interface VCFundingChartProps {
  isDarkMode: boolean;
  vcFundingData: CountryData[];
  unicornData: CountryData[];
  startupDensityData: CountryData[];
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

const VCFundingChart: React.FC<VCFundingChartProps> = ({
  isDarkMode,
  vcFundingData,
  unicornData,
  startupDensityData,
  selectedCountries,
  onCountryChange
}) => {
  const [viewMode, setViewMode] = useState<'funding' | 'unicorns' | 'density' | 'bubble'>('funding');
  const [chartType, setChartType] = useState<'trend' | 'comparison'>('comparison');
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  const availableYears = useMemo(() => {
    if (!vcFundingData || vcFundingData.length === 0) return [];
    return vcFundingData.map(d => d.year).sort((a, b) => a - b);
  }, [vcFundingData]);

  const currentData = useMemo(() => {
    switch (viewMode) {
      case 'funding': return vcFundingData || [];
      case 'unicorns': return unicornData || [];
      case 'density': return startupDensityData || [];
      default: return vcFundingData || [];
    }
  }, [viewMode, vcFundingData, unicornData, startupDensityData]);

  const yearData = useMemo(() => {
    if (!currentData || currentData.length === 0) return [];
    const yearEntry = currentData.find(d => d.year === selectedYear);
    if (!yearEntry) {
      const lastYear = currentData[currentData.length - 1];
      if (!lastYear) return [];
      return selectedCountries
        .filter(country => lastYear[country] !== undefined && lastYear[country] !== null)
        .map(country => ({
          country,
          value: lastYear[country] as number
        }))
        .sort((a, b) => b.value - a.value);
    }
    
    return selectedCountries
      .filter(country => yearEntry[country] !== undefined && yearEntry[country] !== null)
      .map(country => ({
        country,
        value: yearEntry[country] as number
      }))
      .sort((a, b) => b.value - a.value);
  }, [currentData, selectedYear, selectedCountries]);

  const bubbleData = useMemo(() => {
    if (!vcFundingData?.length || !unicornData?.length || !startupDensityData?.length) return [];
    
    const fundingYear = vcFundingData.find(d => d.year === selectedYear) || vcFundingData[vcFundingData.length - 1];
    const unicornYear = unicornData[0];
    const densityYear = startupDensityData.find(d => d.year === selectedYear) || startupDensityData[startupDensityData.length - 1];
    
    if (!fundingYear || !unicornYear || !densityYear) return [];
    
    return selectedCountries
      .filter(country => 
        fundingYear[country] !== undefined && 
        unicornYear[country] !== undefined &&
        densityYear[country] !== undefined
      )
      .map(country => ({
        country,
        funding: fundingYear[country] as number,
        unicorns: unicornYear[country] as number,
        density: densityYear[country] as number
      }));
  }, [vcFundingData, unicornData, startupDensityData, selectedYear, selectedCountries]);

  const getUnit = () => {
    switch (viewMode) {
      case 'funding': return 'Billion USD';
      case 'unicorns': return 'companies';
      case 'density': return 'per 100K people';
      default: return '';
    }
  };

  const getTitle = () => {
    switch (viewMode) {
      case 'funding': return 'Venture Capital Funding';
      case 'unicorns': return 'Unicorn Companies';
      case 'density': return 'Startup Density';
      case 'bubble': return 'Startup Ecosystem Overview';
      default: return '';
    }
  };

  const formatValue = (value: number) => {
    if (viewMode === 'funding') return formatBillions(value);
    if (viewMode === 'unicorns') return formatNumber(value, 0);
    return value.toFixed(1);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    if (viewMode === 'bubble' && payload[0]?.payload) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <p className="font-semibold mb-2">{data.country}</p>
          <div className="space-y-1 text-sm">
            <div>VC Funding: {formatBillions(data.funding)}</div>
            <div>Unicorns: {formatNumber(data.unicorns, 0)}</div>
            <div>Startup Density: {data.density.toFixed(1)} per 100K</div>
          </div>
        </div>
      );
    }

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
      ...(vcFundingData || []), 
      ...(unicornData || []), 
      ...(startupDensityData || [])
    ];
    allData.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== 'year' && typeof row[key] === 'number') {
          countries.add(key);
        }
      });
    });
    return Array.from(countries).sort();
  }, [vcFundingData, unicornData, startupDensityData]);

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      onCountryChange(selectedCountries.filter(c => c !== country));
    } else if (selectedCountries.length < 10) {
      onCountryChange([...selectedCountries, country]);
    }
  };

  const totalFunding = useMemo(() => {
    if (!vcFundingData?.length) return 0;
    const yearEntry = vcFundingData.find(d => d.year === selectedYear) || vcFundingData[vcFundingData.length - 1];
    if (!yearEntry) return 0;
    return Object.entries(yearEntry)
      .filter(([key]) => key !== 'year')
      .reduce((sum, [, value]) => sum + (typeof value === 'number' ? value : 0), 0);
  }, [vcFundingData, selectedYear]);

  const totalUnicorns = useMemo(() => {
    if (!unicornData?.length) return 0;
    const yearEntry = unicornData[0];
    if (!yearEntry) return 0;
    return Object.entries(yearEntry)
      .filter(([key]) => key !== 'year')
      .reduce((sum, [, value]) => sum + (typeof value === 'number' ? value : 0), 0);
  }, [unicornData]);

  return (
    <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${themeColors.text}`}>
            Startup & Venture Capital Analysis
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
            <option value="funding">VC Funding</option>
            <option value="unicorns">Unicorns</option>
            <option value="density">Startup Density</option>
            <option value="bubble">Ecosystem Overview</option>
          </select>

          {viewMode !== 'bubble' && viewMode !== 'unicorns' && (
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

          {(chartType === 'comparison' || viewMode === 'bubble') && availableYears.length > 0 && viewMode !== 'unicorns' && (
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
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-violet-900/30' : 'bg-violet-50'}`}>
          <div className={`text-xs ${themeColors.textTertiary}`}>Global VC Funding ({selectedYear})</div>
          <div className="text-xl font-bold text-violet-500">{formatBillions(totalFunding)}</div>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-pink-900/30' : 'bg-pink-50'}`}>
          <div className={`text-xs ${themeColors.textTertiary}`}>Total Unicorns</div>
          <div className="text-xl font-bold text-pink-500">{formatNumber(totalUnicorns, 0)}</div>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
          <div className={`text-xs ${themeColors.textTertiary}`}>Top VC Hub</div>
          <div className="text-xl font-bold text-amber-500">USA</div>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-50'}`}>
          <div className={`text-xs ${themeColors.textTertiary}`}>Highest Density</div>
          <div className="text-xl font-bold text-teal-500">Israel</div>
        </div>
      </div>

      {/* Country Selection */}
      <div className="mb-4">
        <p className={`text-sm ${themeColors.textTertiary} mb-2`}>
          Select countries (max 10):
        </p>
        <div className="flex flex-wrap gap-2">
          {allCountries.map(country => (
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
          {viewMode === 'bubble' ? (
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
              <XAxis 
                type="number" 
                dataKey="funding" 
                name="VC Funding"
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
                tickFormatter={(value) => `$${value}B`}
                label={{ value: 'VC Funding (Billion USD)', position: 'bottom', fill: themeColors.axisColor }}
              />
              <YAxis 
                type="number" 
                dataKey="unicorns" 
                name="Unicorns"
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
                label={{ value: 'Unicorns', angle: -90, position: 'left', fill: themeColors.axisColor }}
              />
              <ZAxis type="number" dataKey="density" range={[100, 1000]} name="Startup Density" />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={bubbleData}>
                {bubbleData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={techChartColors[entry.country] || '#6B7280'}
                    fillOpacity={0.7}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          ) : chartType === 'trend' && viewMode !== 'unicorns' ? (
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
                tickFormatter={(value) => viewMode === 'funding' ? `$${value}B` : value.toString()}
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
                tickFormatter={(value) => viewMode === 'funding' ? `$${value}B` : value.toString()}
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
              {formatValue(item.value)}
            </div>
            <div className={`text-xs ${themeColors.textTertiary}`}>{getUnit()}</div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <h4 className={`text-sm font-semibold mb-2 ${themeColors.text}`}>
          Startup Ecosystem Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className={themeColors.textTertiary}>Peak VC Year:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>2021 ($621B globally)</span>
          </div>
          <div>
            <span className={themeColors.textTertiary}>Fastest Growing Hub:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>India (+45% YoY)</span>
          </div>
          <div>
            <span className={themeColors.textTertiary}>Unicorn Factory:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>USA (702 unicorns)</span>
          </div>
          <div>
            <span className={themeColors.textTertiary}>Startup Density Leader:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>Israel (155.8 per 100K)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VCFundingChart;

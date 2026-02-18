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
  ComposedChart,
  Area
} from 'recharts';
import { CountryData } from '../services/worldbank';
import { techChartColors, formatPercent } from '../data/technologyIndicators';

interface DigitalEconomyChartProps {
  isDarkMode: boolean;
  ecommerceData: CountryData[];
  digitalPaymentsData: CountryData[];
  ictServiceExportsData: CountryData[];
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

const DigitalEconomyChart: React.FC<DigitalEconomyChartProps> = ({
  isDarkMode,
  ecommerceData,
  digitalPaymentsData,
  ictServiceExportsData,
  selectedCountries,
  onCountryChange
}) => {
  const [viewMode, setViewMode] = useState<'ecommerce' | 'payments' | 'ict_services' | 'combined'>('ecommerce');
  const [chartType, setChartType] = useState<'trend' | 'comparison'>('comparison');
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  const currentData = useMemo(() => {
    switch (viewMode) {
      case 'ecommerce': return ecommerceData || [];
      case 'payments': return digitalPaymentsData || [];
      case 'ict_services': return ictServiceExportsData || [];
      default: return ecommerceData || [];
    }
  }, [viewMode, ecommerceData, digitalPaymentsData, ictServiceExportsData]);

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

  const combinedData = useMemo(() => {
    if (!ecommerceData?.length || !digitalPaymentsData?.length) return [];
    
    const yearEntry1 = ecommerceData.find(d => d.year === selectedYear);
    const yearEntry2 = digitalPaymentsData.find(d => d.year === selectedYear);
    
    if (!yearEntry1 || !yearEntry2) return [];
    
    return selectedCountries
      .filter(country => 
        yearEntry1[country] !== undefined && 
        yearEntry2[country] !== undefined
      )
      .map(country => ({
        country,
        ecommerce: yearEntry1[country] as number,
        payments: yearEntry2[country] as number
      }))
      .sort((a, b) => b.ecommerce - a.ecommerce);
  }, [ecommerceData, digitalPaymentsData, selectedYear, selectedCountries]);

  const getUnit = () => {
    switch (viewMode) {
      case 'ecommerce': return '% of retail';
      case 'payments': return '% of population';
      case 'ict_services': return '% of service exports';
      case 'combined': return '%';
      default: return '';
    }
  };

  const getTitle = () => {
    switch (viewMode) {
      case 'ecommerce': return 'E-commerce Adoption';
      case 'payments': return 'Digital Payment Adoption';
      case 'ict_services': return 'ICT Service Exports';
      case 'combined': return 'Digital Economy Overview';
      default: return '';
    }
  };

  const formatValue = (value: number) => {
    return formatPercent(value);
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
              {formatValue(entry.value)}
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
      ...(ecommerceData || []), 
      ...(digitalPaymentsData || []), 
      ...(ictServiceExportsData || [])
    ];
    allData.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== 'year' && typeof row[key] === 'number') {
          countries.add(key);
        }
      });
    });
    return Array.from(countries).sort();
  }, [ecommerceData, digitalPaymentsData, ictServiceExportsData]);

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      onCountryChange(selectedCountries.filter(c => c !== country));
    } else if (selectedCountries.length < 10) {
      onCountryChange([...selectedCountries, country]);
    }
  };

  const avgEcommerce = useMemo(() => {
    if (!ecommerceData?.length) return 0;
    const yearEntry = ecommerceData.find(d => d.year === selectedYear);
    if (!yearEntry) return 0;
    const values = Object.entries(yearEntry)
      .filter(([key]) => key !== 'year')
      .map(([, value]) => typeof value === 'number' ? value : 0);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }, [ecommerceData, selectedYear]);

  const avgPayments = useMemo(() => {
    if (!digitalPaymentsData?.length) return 0;
    const yearEntry = digitalPaymentsData.find(d => d.year === selectedYear);
    if (!yearEntry) return 0;
    const values = Object.entries(yearEntry)
      .filter(([key]) => key !== 'year')
      .map(([, value]) => typeof value === 'number' ? value : 0);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }, [digitalPaymentsData, selectedYear]);

  return (
    <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${themeColors.text}`}>
            Digital Economy Analysis
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
            <option value="ecommerce">E-commerce</option>
            <option value="payments">Digital Payments</option>
            <option value="ict_services">ICT Services</option>
            <option value="combined">Combined View</option>
          </select>

          {viewMode !== 'combined' && (
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

          {(chartType === 'comparison' || viewMode === 'combined') && availableYears.length > 0 && (
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
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
          <div className={`text-xs ${themeColors.textTertiary}`}>Avg E-commerce ({selectedYear})</div>
          <div className="text-xl font-bold text-red-500">{formatPercent(avgEcommerce)}</div>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-lime-900/30' : 'bg-lime-50'}`}>
          <div className={`text-xs ${themeColors.textTertiary}`}>Avg Digital Payments</div>
          <div className="text-xl font-bold text-lime-500">{formatPercent(avgPayments)}</div>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-cyan-900/30' : 'bg-cyan-50'}`}>
          <div className={`text-xs ${themeColors.textTertiary}`}>E-commerce Leader</div>
          <div className="text-xl font-bold text-cyan-500">China</div>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-violet-900/30' : 'bg-violet-50'}`}>
          <div className={`text-xs ${themeColors.textTertiary}`}>Payments Leader</div>
          <div className="text-xl font-bold text-violet-500">Sweden</div>
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
          {viewMode === 'combined' ? (
            <ComposedChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
              <XAxis 
                dataKey="country" 
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar 
                dataKey="ecommerce" 
                name="E-commerce %" 
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="payments" 
                name="Digital Payments %" 
                fill="#84CC16"
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          ) : chartType === 'trend' ? (
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
                tickFormatter={(value) => `${value}%`}
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
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
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
          Digital Economy Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className={themeColors.textTertiary}>Global E-commerce Growth:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>+8.5% annually</span>
          </div>
          <div>
            <span className={themeColors.textTertiary}>Cashless Leaders:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>Sweden, Netherlands, UK</span>
          </div>
          <div>
            <span className={themeColors.textTertiary}>Fastest Digital Growth:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>India (+25% payments YoY)</span>
          </div>
          <div>
            <span className={themeColors.textTertiary}>E-commerce Market Size:</span>
            <span className={`ml-2 font-medium ${themeColors.text}`}>$6.3T globally (2024)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalEconomyChart;

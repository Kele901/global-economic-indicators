'use client';

import React, { useState, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  ReferenceLine,
  Cell,
  Legend
} from 'recharts';
import { CountryData } from '../services/worldbank';
import { techChartColors, formatNumber, formatPercent } from '../data/technologyIndicators';

interface RDEfficiencyChartProps {
  isDarkMode: boolean;
  rdData: CountryData[];
  patentData: CountryData[];
  researchersData: CountryData[];
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

interface EfficiencyDataPoint {
  country: string;
  rdSpending: number;
  patents: number;
  researchers: number;
  efficiency: number;
}

const RDEfficiencyChart: React.FC<RDEfficiencyChartProps> = ({
  isDarkMode,
  rdData,
  patentData,
  researchersData,
  selectedCountries,
  onCountryChange
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2021);
  const [showTrendLine, setShowTrendLine] = useState<boolean>(true);
  const [bubbleSizeMetric, setBubbleSizeMetric] = useState<'researchers' | 'fixed'>('researchers');

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
    if (!rdData?.length) return [];
    return rdData.map(d => d.year).filter(y => y >= 2000).sort((a, b) => b - a);
  }, [rdData]);

  const efficiencyData = useMemo(() => {
    if (!rdData?.length || !patentData?.length) return [];

    const rdYear = rdData.find(d => d.year === selectedYear);
    const patentYear = patentData.find(d => d.year === selectedYear);
    const researcherYear = researchersData?.find(d => d.year === selectedYear);

    if (!rdYear || !patentYear) return [];

    const allCountries = new Set<string>();
    Object.keys(rdYear).forEach(k => k !== 'year' && allCountries.add(k));
    Object.keys(patentYear).forEach(k => k !== 'year' && allCountries.add(k));

    const data: EfficiencyDataPoint[] = [];

    allCountries.forEach(country => {
      const rd = rdYear[country] as number;
      const patents = patentYear[country] as number;
      const researchers = researcherYear?.[country] as number || 1000;

      if (rd && patents && rd > 0 && patents > 0) {
        data.push({
          country,
          rdSpending: rd,
          patents: patents,
          researchers: researchers,
          efficiency: patents / rd
        });
      }
    });

    return data.sort((a, b) => b.efficiency - a.efficiency);
  }, [rdData, patentData, researchersData, selectedYear]);

  const averageRD = useMemo(() => {
    if (efficiencyData.length === 0) return 0;
    return efficiencyData.reduce((sum, d) => sum + d.rdSpending, 0) / efficiencyData.length;
  }, [efficiencyData]);

  const averagePatents = useMemo(() => {
    if (efficiencyData.length === 0) return 0;
    return efficiencyData.reduce((sum, d) => sum + d.patents, 0) / efficiencyData.length;
  }, [efficiencyData]);

  const quadrantCounts = useMemo(() => {
    return {
      highHigh: efficiencyData.filter(d => d.rdSpending >= averageRD && d.patents >= averagePatents).length,
      highLow: efficiencyData.filter(d => d.rdSpending >= averageRD && d.patents < averagePatents).length,
      lowHigh: efficiencyData.filter(d => d.rdSpending < averageRD && d.patents >= averagePatents).length,
      lowLow: efficiencyData.filter(d => d.rdSpending < averageRD && d.patents < averagePatents).length,
    };
  }, [efficiencyData, averageRD, averagePatents]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload as EfficiencyDataPoint;

    return (
      <div className={`p-3 rounded-lg shadow-lg border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <p className="font-semibold mb-2" style={{ color: techChartColors[data.country] || '#6B7280' }}>
          {data.country}
        </p>
        <div className="space-y-1 text-sm">
          <p>R&D Spending: <span className="font-medium">{formatPercent(data.rdSpending)} of GDP</span></p>
          <p>Patent Applications: <span className="font-medium">{formatNumber(data.patents)}</span></p>
          <p>Researchers: <span className="font-medium">{formatNumber(data.researchers)} per million</span></p>
          <p className="pt-1 border-t border-gray-600">
            Efficiency: <span className="font-medium">{formatNumber(data.efficiency)} patents per % GDP</span>
          </p>
        </div>
      </div>
    );
  };

  const allCountries = useMemo(() => {
    return efficiencyData.map(d => d.country).sort();
  }, [efficiencyData]);

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      onCountryChange(selectedCountries.filter(c => c !== country));
    } else if (selectedCountries.length < 15) {
      onCountryChange([...selectedCountries, country]);
    }
  };

  const filteredData = useMemo(() => {
    if (selectedCountries.length === 0) return efficiencyData;
    return efficiencyData.filter(d => selectedCountries.includes(d.country));
  }, [efficiencyData, selectedCountries]);

  const topEfficient = useMemo(() => {
    return [...efficiencyData].sort((a, b) => b.efficiency - a.efficiency).slice(0, 3);
  }, [efficiencyData]);

  return (
    <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${themeColors.text}`}>
            R&D Efficiency Analysis
          </h3>
          <p className={`text-sm ${themeColors.textSecondary}`}>
            Patent Output vs R&D Investment ({selectedYear})
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
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

          <select
            value={bubbleSizeMetric}
            onChange={(e) => setBubbleSizeMetric(e.target.value as 'researchers' | 'fixed')}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            } border`}
          >
            <option value="researchers">Bubble = Researchers</option>
            <option value="fixed">Fixed Size</option>
          </select>

          <label className={`flex items-center gap-2 text-sm ${themeColors.textSecondary}`}>
            <input
              type="checkbox"
              checked={showTrendLine}
              onChange={(e) => setShowTrendLine(e.target.checked)}
              className="rounded"
            />
            Show Averages
          </label>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'} border ${isDarkMode ? 'border-green-800' : 'border-green-200'}`}>
          <p className={`text-xs ${themeColors.textTertiary}`}>High Efficiency</p>
          <p className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
            {quadrantCounts.lowHigh} countries
          </p>
          <p className={`text-xs ${themeColors.textTertiary}`}>Low spend, high output</p>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}>
          <p className={`text-xs ${themeColors.textTertiary}`}>Innovation Leaders</p>
          <p className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {quadrantCounts.highHigh} countries
          </p>
          <p className={`text-xs ${themeColors.textTertiary}`}>High spend, high output</p>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'} border ${isDarkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
          <p className={`text-xs ${themeColors.textTertiary}`}>Developing</p>
          <p className={`text-lg font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
            {quadrantCounts.lowLow} countries
          </p>
          <p className={`text-xs ${themeColors.textTertiary}`}>Low spend, low output</p>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'} border ${isDarkMode ? 'border-red-800' : 'border-red-200'}`}>
          <p className={`text-xs ${themeColors.textTertiary}`}>Inefficient</p>
          <p className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
            {quadrantCounts.highLow} countries
          </p>
          <p className={`text-xs ${themeColors.textTertiary}`}>High spend, low output</p>
        </div>
      </div>

      {/* Country Selection */}
      <div className="mb-4">
        <p className={`text-sm ${themeColors.textTertiary} mb-2`}>
          Filter countries (showing {filteredData.length} of {efficiencyData.length}):
        </p>
        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
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

      {/* Scatter Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
            <XAxis
              type="number"
              dataKey="rdSpending"
              name="R&D Spending"
              unit="% GDP"
              stroke={themeColors.axisColor}
              tick={{ fill: themeColors.axisColor, fontSize: 12 }}
              label={{ 
                value: 'R&D Spending (% of GDP)', 
                position: 'bottom', 
                fill: themeColors.axisColor,
                fontSize: 12
              }}
            />
            <YAxis
              type="number"
              dataKey="patents"
              name="Patents"
              stroke={themeColors.axisColor}
              tick={{ fill: themeColors.axisColor, fontSize: 12 }}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}K` : value}
              label={{ 
                value: 'Patent Applications', 
                angle: -90, 
                position: 'insideLeft',
                fill: themeColors.axisColor,
                fontSize: 12
              }}
            />
            <ZAxis
              type="number"
              dataKey={bubbleSizeMetric === 'researchers' ? 'researchers' : undefined}
              range={bubbleSizeMetric === 'researchers' ? [100, 2000] : [400, 400]}
              name="Researchers"
            />
            <Tooltip content={<CustomTooltip />} />
            
            {showTrendLine && averageRD > 0 && (
              <>
                <ReferenceLine
                  x={averageRD}
                  stroke={isDarkMode ? '#6B7280' : '#9CA3AF'}
                  strokeDasharray="5 5"
                  label={{ 
                    value: `Avg R&D: ${averageRD.toFixed(1)}%`, 
                    fill: themeColors.axisColor,
                    fontSize: 10,
                    position: 'top'
                  }}
                />
                <ReferenceLine
                  y={averagePatents}
                  stroke={isDarkMode ? '#6B7280' : '#9CA3AF'}
                  strokeDasharray="5 5"
                  label={{ 
                    value: `Avg Patents: ${formatNumber(averagePatents)}`, 
                    fill: themeColors.axisColor,
                    fontSize: 10,
                    position: 'right'
                  }}
                />
              </>
            )}

            <Scatter name="Countries" data={filteredData}>
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={techChartColors[entry.country] || '#6B7280'}
                  fillOpacity={0.7}
                  stroke={techChartColors[entry.country] || '#6B7280'}
                  strokeWidth={2}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Top Efficient Countries */}
      <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <h4 className={`text-sm font-semibold mb-3 ${themeColors.text}`}>
          Most Efficient Innovators (Patents per % GDP spent on R&D)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topEfficient.map((country, index) => (
            <div key={country.country} className="flex items-center gap-3">
              <span className={`text-lg font-bold ${
                index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'
              }`}>
                #{index + 1}
              </span>
              <div>
                <p className={`font-medium ${themeColors.text}`} style={{ color: techChartColors[country.country] }}>
                  {country.country}
                </p>
                <p className={`text-xs ${themeColors.textTertiary}`}>
                  {formatNumber(country.efficiency)} patents per % GDP
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RDEfficiencyChart;

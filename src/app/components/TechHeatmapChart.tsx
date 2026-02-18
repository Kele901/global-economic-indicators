'use client';

import React, { useState, useMemo } from 'react';
import { CountryData } from '../services/worldbank';
import { techChartColors, formatNumber, formatPercent } from '../data/technologyIndicators';

interface TechHeatmapChartProps {
  isDarkMode: boolean;
  rdSpending: CountryData[];
  patentData: CountryData[];
  researchersData: CountryData[];
  hightechExports: CountryData[];
  internetUsers: CountryData[];
  vcFunding: CountryData[];
  stemGraduates: CountryData[];
  aiPatents: CountryData[];
  selectedYear: number;
}

interface MetricConfig {
  key: string;
  label: string;
  shortLabel: string;
  data: CountryData[];
  format: 'number' | 'percent' | 'currency';
  higherIsBetter: boolean;
}

interface HeatmapCell {
  country: string;
  metric: string;
  value: number;
  normalizedValue: number;
  rank: number;
}

const TechHeatmapChart: React.FC<TechHeatmapChartProps> = ({
  isDarkMode,
  rdSpending,
  patentData,
  researchersData,
  hightechExports,
  internetUsers,
  vcFunding,
  stemGraduates,
  aiPatents,
  selectedYear
}) => {
  const [sortMetric, setSortMetric] = useState<string>('rdSpending');
  const [hoveredCell, setHoveredCell] = useState<{ country: string; metric: string } | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    cellBorder: isDarkMode ? 'border-gray-600' : 'border-gray-300'
  };

  const metrics: MetricConfig[] = useMemo(() => [
    { key: 'rdSpending', label: 'R&D Spending (% GDP)', shortLabel: 'R&D', data: rdSpending, format: 'percent', higherIsBetter: true },
    { key: 'patents', label: 'Patent Applications', shortLabel: 'Patents', data: patentData, format: 'number', higherIsBetter: true },
    { key: 'researchers', label: 'Researchers (per million)', shortLabel: 'Researchers', data: researchersData, format: 'number', higherIsBetter: true },
    { key: 'hightechExports', label: 'High-Tech Exports (%)', shortLabel: 'HT Exports', data: hightechExports, format: 'percent', higherIsBetter: true },
    { key: 'internetUsers', label: 'Internet Users (%)', shortLabel: 'Internet', data: internetUsers, format: 'percent', higherIsBetter: true },
    { key: 'vcFunding', label: 'VC Funding ($B)', shortLabel: 'VC', data: vcFunding, format: 'currency', higherIsBetter: true },
    { key: 'stemGraduates', label: 'STEM Graduates (%)', shortLabel: 'STEM', data: stemGraduates, format: 'percent', higherIsBetter: true },
    { key: 'aiPatents', label: 'AI Patents', shortLabel: 'AI', data: aiPatents, format: 'number', higherIsBetter: true },
  ], [rdSpending, patentData, researchersData, hightechExports, internetUsers, vcFunding, stemGraduates, aiPatents]);

  const getValueForCountry = (data: CountryData[], country: string, year: number): number | null => {
    if (!data?.length) return null;
    const yearData = data.find(d => d.year === year) || data[data.length - 1];
    if (!yearData) return null;
    const value = yearData[country];
    return typeof value === 'number' ? value : null;
  };

  const heatmapData = useMemo(() => {
    const countriesSet = new Set<string>();
    
    metrics.forEach(metric => {
      if (metric.data?.length) {
        const yearData = metric.data.find(d => d.year === selectedYear) || metric.data[metric.data.length - 1];
        if (yearData) {
          Object.keys(yearData).forEach(k => {
            if (k !== 'year' && typeof yearData[k] === 'number') {
              countriesSet.add(k);
            }
          });
        }
      }
    });

    const countries = Array.from(countriesSet);
    
    const metricRanges: { [key: string]: { min: number; max: number; values: { country: string; value: number }[] } } = {};
    
    metrics.forEach(metric => {
      const values: { country: string; value: number }[] = [];
      countries.forEach(country => {
        const value = getValueForCountry(metric.data, country, selectedYear);
        if (value !== null && value > 0) {
          values.push({ country, value });
        }
      });
      
      if (values.length > 0) {
        const sortedValues = values.map(v => v.value).sort((a, b) => a - b);
        metricRanges[metric.key] = {
          min: sortedValues[0],
          max: sortedValues[sortedValues.length - 1],
          values: values.sort((a, b) => b.value - a.value)
        };
      }
    });

    const countryScores: { country: string; totalScore: number; metrics: { [key: string]: HeatmapCell } }[] = [];

    countries.forEach(country => {
      let totalScore = 0;
      let validMetrics = 0;
      const countryMetrics: { [key: string]: HeatmapCell } = {};

      metrics.forEach(metric => {
        const value = getValueForCountry(metric.data, country, selectedYear);
        const range = metricRanges[metric.key];
        
        if (value !== null && value > 0 && range) {
          const normalizedValue = range.max > range.min 
            ? ((value - range.min) / (range.max - range.min)) * 100 
            : 50;
          
          const rank = range.values.findIndex(v => v.country === country) + 1;
          
          countryMetrics[metric.key] = {
            country,
            metric: metric.key,
            value,
            normalizedValue,
            rank
          };
          
          totalScore += normalizedValue;
          validMetrics++;
        }
      });

      if (validMetrics >= 3) {
        countryScores.push({
          country,
          totalScore: totalScore / validMetrics,
          metrics: countryMetrics
        });
      }
    });

    const sortMetricConfig = metrics.find(m => m.key === sortMetric);
    if (sortMetricConfig && metricRanges[sortMetric]) {
      countryScores.sort((a, b) => {
        const aValue = a.metrics[sortMetric]?.value || 0;
        const bValue = b.metrics[sortMetric]?.value || 0;
        return bValue - aValue;
      });
    } else {
      countryScores.sort((a, b) => b.totalScore - a.totalScore);
    }

    return countryScores.slice(0, 20);
  }, [metrics, selectedYear, sortMetric]);

  const getHeatColor = (normalizedValue: number): string => {
    if (isDarkMode) {
      if (normalizedValue >= 80) return 'bg-green-600';
      if (normalizedValue >= 60) return 'bg-green-700';
      if (normalizedValue >= 40) return 'bg-yellow-700';
      if (normalizedValue >= 20) return 'bg-orange-700';
      return 'bg-red-800';
    } else {
      if (normalizedValue >= 80) return 'bg-green-500';
      if (normalizedValue >= 60) return 'bg-green-300';
      if (normalizedValue >= 40) return 'bg-yellow-300';
      if (normalizedValue >= 20) return 'bg-orange-300';
      return 'bg-red-300';
    }
  };

  const formatValue = (value: number, format: 'number' | 'percent' | 'currency'): string => {
    switch (format) {
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toFixed(1)}B`;
      case 'number':
      default:
        return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toFixed(0);
    }
  };

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      setSelectedCountries(selectedCountries.filter(c => c !== country));
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  const displayData = selectedCountries.length > 0 
    ? heatmapData.filter(d => selectedCountries.includes(d.country))
    : heatmapData;

  return (
    <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${themeColors.text}`}>
            Technology Metrics Heatmap
          </h3>
          <p className={`text-sm ${themeColors.textSecondary}`}>
            Multi-metric comparison across countries ({selectedYear})
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={sortMetric}
            onChange={(e) => setSortMetric(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            } border`}
          >
            <option value="totalScore">Sort by Overall Score</option>
            {metrics.map(m => (
              <option key={m.key} value={m.key}>Sort by {m.shortLabel}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex items-center gap-4 mb-4">
        <span className={`text-xs ${themeColors.textTertiary}`}>Performance:</span>
        <div className="flex items-center gap-1">
          <div className={`w-6 h-4 rounded ${isDarkMode ? 'bg-red-800' : 'bg-red-300'}`}></div>
          <span className={`text-xs ${themeColors.textTertiary}`}>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-6 h-4 rounded ${isDarkMode ? 'bg-yellow-700' : 'bg-yellow-300'}`}></div>
          <span className={`text-xs ${themeColors.textTertiary}`}>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-6 h-4 rounded ${isDarkMode ? 'bg-green-600' : 'bg-green-500'}`}></div>
          <span className={`text-xs ${themeColors.textTertiary}`}>High</span>
        </div>
      </div>

      {/* Country Filter */}
      {selectedCountries.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className={`text-xs ${themeColors.textTertiary} self-center`}>Filtered:</span>
          {selectedCountries.map(country => (
            <button
              key={country}
              onClick={() => toggleCountry(country)}
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: techChartColors[country] || '#6B7280' }}
            >
              {country} ×
            </button>
          ))}
          <button
            onClick={() => setSelectedCountries([])}
            className={`px-2 py-1 rounded text-xs ${themeColors.textSecondary} hover:underline`}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Heatmap Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className={`text-left p-2 ${themeColors.text} sticky left-0 ${themeColors.cardBg} z-10`}>
                Country
              </th>
              {metrics.map(metric => (
                <th
                  key={metric.key}
                  className={`p-2 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    sortMetric === metric.key ? 'font-bold' : ''
                  } ${themeColors.text}`}
                  onClick={() => setSortMetric(metric.key)}
                  title={metric.label}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xs">{metric.shortLabel}</span>
                    {sortMetric === metric.key && <span className="text-xs">▼</span>}
                  </div>
                </th>
              ))}
              <th className={`p-2 text-center ${themeColors.text}`}>
                <span className="text-xs">Score</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rowIndex) => (
              <tr
                key={row.country}
                className={`border-t ${themeColors.border} hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer`}
                onClick={() => toggleCountry(row.country)}
              >
                <td className={`p-2 font-medium sticky left-0 ${themeColors.cardBg} z-10`}>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: techChartColors[row.country] || '#6B7280' }}
                    ></span>
                    <span className={themeColors.text}>{row.country}</span>
                    <span className={`text-xs ${themeColors.textTertiary}`}>#{rowIndex + 1}</span>
                  </div>
                </td>
                {metrics.map(metric => {
                  const cell = row.metrics[metric.key];
                  const isHovered = hoveredCell?.country === row.country && hoveredCell?.metric === metric.key;
                  
                  return (
                    <td
                      key={metric.key}
                      className={`p-1 text-center relative`}
                      onMouseEnter={() => setHoveredCell({ country: row.country, metric: metric.key })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {cell ? (
                        <div
                          className={`p-2 rounded ${getHeatColor(cell.normalizedValue)} ${
                            isHovered ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <span className={`text-xs font-medium ${
                            cell.normalizedValue >= 40 ? 'text-white' : isDarkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            {formatValue(cell.value, metric.format)}
                          </span>
                          {isHovered && (
                            <div className={`absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 rounded shadow-lg text-xs whitespace-nowrap ${
                              isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                            } border ${themeColors.border}`}>
                              <p className="font-semibold">{row.country}</p>
                              <p>{metric.label}</p>
                              <p>Value: {formatValue(cell.value, metric.format)}</p>
                              <p>Rank: #{cell.rank}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <span className={`text-xs ${themeColors.textTertiary}`}>—</span>
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className={`p-2 text-center`}>
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${
                    row.totalScore >= 70 ? (isDarkMode ? 'bg-green-900' : 'bg-green-100') :
                    row.totalScore >= 40 ? (isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100') :
                    (isDarkMode ? 'bg-red-900' : 'bg-red-100')
                  }`}>
                    <span className={`text-sm font-bold ${
                      row.totalScore >= 70 ? (isDarkMode ? 'text-green-400' : 'text-green-700') :
                      row.totalScore >= 40 ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-700') :
                      (isDarkMode ? 'text-red-400' : 'text-red-700')
                    }`}>
                      {row.totalScore.toFixed(0)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <p className={`text-xs ${themeColors.textTertiary}`}>
          <strong>Score:</strong> Composite score (0-100) based on normalized performance across all metrics. 
          Click on column headers to sort. Click on rows to filter/compare specific countries.
        </p>
      </div>
    </div>
  );
};

export default TechHeatmapChart;

'use client';

import React, { useState, useMemo } from 'react';
import { TechnologyData, CountryData, COUNTRY_NAMES } from '../services/worldbank';
import { techChartColors, formatNumber, formatPercent } from '../data/technologyIndicators';

interface InnovationRankingTableProps {
  isDarkMode: boolean;
  techData: TechnologyData;
  selectedYear: number;
}

type SortField = 'country' | 'patents' | 'rdSpending' | 'hightechExports' | 'researchers' | 'publications' | 'score';
type SortDirection = 'asc' | 'desc';

interface CountryRanking {
  country: string;
  patents: number | null;
  rdSpending: number | null;
  hightechExports: number | null;
  researchers: number | null;
  publications: number | null;
  score: number;
}

const InnovationRankingTable: React.FC<InnovationRankingTableProps> = ({
  isDarkMode,
  techData,
  selectedYear
}) => {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper to get value for a country from data array
  const getValue = (data: CountryData[], country: string, year: number): number | null => {
    // Try exact year first
    const yearData = data.find(d => d.year === year);
    if (yearData && yearData[country] !== undefined && yearData[country] !== null) {
      return yearData[country] as number;
    }
    // Try previous years as fallback
    for (let y = year - 1; y >= year - 3; y--) {
      const fallbackData = data.find(d => d.year === y);
      if (fallbackData && fallbackData[country] !== undefined && fallbackData[country] !== null) {
        return fallbackData[country] as number;
      }
    }
    return null;
  };

  // Calculate innovation score (normalized composite)
  const calculateScore = (ranking: Omit<CountryRanking, 'score'>): number => {
    let score = 0;
    let factors = 0;

    // Patents (normalized to 0-25 scale, max ~1.5M for China)
    if (ranking.patents !== null) {
      score += Math.min((ranking.patents / 1500000) * 25, 25);
      factors++;
    }

    // R&D Spending (normalized to 0-25 scale, max ~5%)
    if (ranking.rdSpending !== null) {
      score += Math.min((ranking.rdSpending / 5) * 25, 25);
      factors++;
    }

    // High-tech exports (normalized to 0-25 scale, max ~50%)
    if (ranking.hightechExports !== null) {
      score += Math.min((ranking.hightechExports / 50) * 25, 25);
      factors++;
    }

    // Researchers (normalized to 0-25 scale, max ~8000 per million)
    if (ranking.researchers !== null) {
      score += Math.min((ranking.researchers / 8000) * 25, 25);
      factors++;
    }

    // Return average if we have data, otherwise 0
    return factors > 0 ? score / factors * 4 : 0; // Scale to 0-100
  };

  // Build rankings data
  const rankings = useMemo(() => {
    const countries = Object.values(COUNTRY_NAMES);
    
    return countries.map(country => {
      const patents = getValue(techData.patentApplicationsResident, country, selectedYear);
      const rdSpending = getValue(techData.rdSpending, country, selectedYear);
      const hightechExports = getValue(techData.hightechExports, country, selectedYear);
      const researchers = getValue(techData.researchersRD, country, selectedYear);
      const publications = getValue(techData.scientificPublications, country, selectedYear);

      const baseRanking = {
        country,
        patents,
        rdSpending,
        hightechExports,
        researchers,
        publications
      };

      return {
        ...baseRanking,
        score: calculateScore(baseRanking)
      };
    });
  }, [techData, selectedYear]);

  // Sort and filter rankings
  const sortedRankings = useMemo(() => {
    let filtered = rankings.filter(r => 
      r.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let aVal: number | string | null = a[sortField];
      let bVal: number | string | null = b[sortField];

      // Handle nulls
      if (aVal === null) aVal = sortDirection === 'desc' ? -Infinity : Infinity;
      if (bVal === null) bVal = sortDirection === 'desc' ? -Infinity : Infinity;

      // String comparison for country
      if (sortField === 'country') {
        return sortDirection === 'asc' 
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }

      // Numeric comparison
      return sortDirection === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [rankings, sortField, sortDirection, searchTerm]);

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort indicator
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="ml-1 opacity-30">↕</span>;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    headerBg: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    rowHover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
  };

  return (
    <div className={`rounded-xl ${themeColors.cardBg} border ${themeColors.border} overflow-hidden`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${themeColors.border}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className={`text-lg font-semibold ${themeColors.text}`}>
              Innovation Rankings ({selectedYear})
            </h3>
            <p className={`text-sm ${themeColors.textSecondary}`}>
              Composite ranking based on patents, R&amp;D, exports, and research capacity
            </p>
          </div>
          
          {/* Search */}
          <input
            type="text"
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`px-3 py-2 rounded-lg text-sm w-full md:w-48 ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
            } border`}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={themeColors.headerBg}>
            <tr>
              <th className={`px-4 py-3 text-left text-xs font-medium ${themeColors.textSecondary} uppercase tracking-wider`}>
                Rank
              </th>
              <th 
                className={`px-4 py-3 text-left text-xs font-medium ${themeColors.textSecondary} uppercase tracking-wider cursor-pointer`}
                onClick={() => handleSort('country')}
              >
                Country <SortIndicator field="country" />
              </th>
              <th 
                className={`px-4 py-3 text-right text-xs font-medium ${themeColors.textSecondary} uppercase tracking-wider cursor-pointer`}
                onClick={() => handleSort('score')}
              >
                Score <SortIndicator field="score" />
              </th>
              <th 
                className={`px-4 py-3 text-right text-xs font-medium ${themeColors.textSecondary} uppercase tracking-wider cursor-pointer hidden md:table-cell`}
                onClick={() => handleSort('patents')}
              >
                Patents <SortIndicator field="patents" />
              </th>
              <th 
                className={`px-4 py-3 text-right text-xs font-medium ${themeColors.textSecondary} uppercase tracking-wider cursor-pointer hidden md:table-cell`}
                onClick={() => handleSort('rdSpending')}
              >
                R&amp;D (%) <SortIndicator field="rdSpending" />
              </th>
              <th 
                className={`px-4 py-3 text-right text-xs font-medium ${themeColors.textSecondary} uppercase tracking-wider cursor-pointer hidden lg:table-cell`}
                onClick={() => handleSort('hightechExports')}
              >
                High-Tech (%) <SortIndicator field="hightechExports" />
              </th>
              <th 
                className={`px-4 py-3 text-right text-xs font-medium ${themeColors.textSecondary} uppercase tracking-wider cursor-pointer hidden lg:table-cell`}
                onClick={() => handleSort('researchers')}
              >
                Researchers <SortIndicator field="researchers" />
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${themeColors.border}`}>
            {sortedRankings.map((ranking, index) => (
              <tr 
                key={ranking.country}
                className={`${themeColors.rowHover} transition-colors`}
              >
                <td className={`px-4 py-3 text-sm ${themeColors.textTertiary}`}>
                  {index + 1}
                </td>
                <td className={`px-4 py-3`}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: techChartColors[ranking.country] }}
                    />
                    <span className={`text-sm font-medium ${themeColors.text}`}>
                      {ranking.country}
                    </span>
                  </div>
                </td>
                <td className={`px-4 py-3 text-right`}>
                  <div className="flex items-center justify-end gap-2">
                    <div className={`w-16 h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${ranking.score}%`,
                          backgroundColor: techChartColors[ranking.country]
                        }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${themeColors.text} w-10 text-right`}>
                      {ranking.score.toFixed(0)}
                    </span>
                  </div>
                </td>
                <td className={`px-4 py-3 text-right text-sm ${themeColors.text} hidden md:table-cell`}>
                  {ranking.patents !== null ? formatNumber(ranking.patents) : '-'}
                </td>
                <td className={`px-4 py-3 text-right text-sm ${themeColors.text} hidden md:table-cell`}>
                  {ranking.rdSpending !== null ? formatPercent(ranking.rdSpending) : '-'}
                </td>
                <td className={`px-4 py-3 text-right text-sm ${themeColors.text} hidden lg:table-cell`}>
                  {ranking.hightechExports !== null ? formatPercent(ranking.hightechExports) : '-'}
                </td>
                <td className={`px-4 py-3 text-right text-sm ${themeColors.text} hidden lg:table-cell`}>
                  {ranking.researchers !== null ? formatNumber(ranking.researchers) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className={`px-6 py-3 border-t ${themeColors.border} ${themeColors.headerBg}`}>
        <p className={`text-xs ${themeColors.textTertiary}`}>
          Score is a composite index (0-100) based on patent applications, R&amp;D spending (% GDP), 
          high-tech exports (% manufactured), and researchers per million people. 
          Click column headers to sort.
        </p>
      </div>
    </div>
  );
};

export default InnovationRankingTable;

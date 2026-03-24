'use client';

import React, { useMemo, useState } from 'react';
import { CountryData } from '../services/worldbank';
import { culturalChartColors, formatNumber, culturalCapitalWeights } from '../data/culturalMetrics';

interface CulturalRankingTableProps {
  isDarkMode: boolean;
  heritageData: { [country: string]: { total: number; cultural: number; natural: number; mixed: number } };
  tourismArrivals: CountryData[];
  tourismReceipts: CountryData[];
  creativeGoodsExports: { [country: string]: number };
  creativeServicesExports: { [country: string]: number };
  museumDensity: { [country: string]: number };
  creativeCities: { [country: string]: { total: number; fields: string[] } };
  culturalEmployment: { [country: string]: number };
  featureFilms: { [country: string]: number };
  intangibleHeritage: { [country: string]: number };
  musicRevenue: { [country: string]: number };
  libraryDensity: { [country: string]: number };
  selectedCountries: string[];
}

type SortField = 'rank' | 'heritage' | 'intangible' | 'tourism' | 'creativeGoods' | 'creativeServices' | 'museums' | 'cities' | 'employment' | 'films' | 'music' | 'libraries';

const CulturalRankingTable: React.FC<CulturalRankingTableProps> = ({
  isDarkMode, heritageData, tourismArrivals, tourismReceipts,
  creativeGoodsExports, creativeServicesExports, museumDensity,
  creativeCities, culturalEmployment, featureFilms,
  intangibleHeritage, musicRevenue, libraryDensity, selectedCountries,
}) => {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortAsc, setSortAsc] = useState(true);

  const getLatestValue = (data: CountryData[], country: string): number | null => {
    for (let i = data.length - 1; i >= 0; i--) {
      const value = data[i][country];
      if (value !== undefined && value !== null && typeof value === 'number') return value;
    }
    return null;
  };

  const normalize = (value: number, min: number, max: number): number => {
    if (max === min) return 0.5;
    return (value - min) / (max - min);
  };

  const rankings = useMemo(() => {
    const countries = selectedCountries.filter(c => heritageData[c]);

    const rawData = countries.map(country => ({
      country,
      heritage: heritageData[country]?.total || 0,
      intangible: intangibleHeritage[country] || 0,
      tourism: getLatestValue(tourismArrivals, country) || 0,
      tourismReceipts: getLatestValue(tourismReceipts, country) || 0,
      creativeGoods: creativeGoodsExports[country] || 0,
      creativeServices: creativeServicesExports[country] || 0,
      museums: museumDensity[country] || 0,
      libraries: libraryDensity[country] || 0,
      cities: creativeCities[country]?.total || 0,
      employment: culturalEmployment[country] || 0,
      films: featureFilms[country] || 0,
      music: musicRevenue[country] || 0,
    }));

    const fields = ['heritage', 'intangible', 'tourism', 'creativeGoods', 'creativeServices', 'museums', 'libraries', 'cities', 'employment', 'films', 'music'] as const;
    const mins: any = {};
    const maxs: any = {};
    fields.forEach(f => {
      const vals = rawData.map(d => (d as any)[f]).filter((v: number) => v > 0);
      mins[f] = Math.min(...vals, 0);
      maxs[f] = Math.max(...vals, 1);
    });

    return rawData.map(d => {
      const heritageScore = normalize(d.heritage, mins.heritage, maxs.heritage) * 0.10;
      const intangibleScore = normalize(d.intangible, mins.intangible, maxs.intangible) * 0.06;
      const tourismScore = normalize(d.tourism, mins.tourism, maxs.tourism) * 0.10;
      const goodsScore = normalize(d.creativeGoods, mins.creativeGoods, maxs.creativeGoods) * 0.10;
      const servicesScore = normalize(d.creativeServices, mins.creativeServices, maxs.creativeServices) * 0.08;
      const museumsScore = normalize(d.museums, mins.museums, maxs.museums) * 0.08;
      const librariesScore = normalize(d.libraries, mins.libraries, maxs.libraries) * 0.06;
      const citiesScore = normalize(d.cities, mins.cities, maxs.cities) * 0.08;
      const employmentScore = normalize(d.employment, mins.employment, maxs.employment) * 0.08;
      const filmsScore = normalize(d.films, mins.films, maxs.films) * 0.06;
      const musicScore = normalize(d.music, mins.music, maxs.music) * 0.07;

      const compositeScore = (heritageScore + intangibleScore + tourismScore + goodsScore + servicesScore + museumsScore + librariesScore + citiesScore + employmentScore + filmsScore + musicScore) * 100;

      return { ...d, compositeScore, rank: 0 };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .map((d, i) => ({ ...d, rank: i + 1 }));
  }, [selectedCountries, heritageData, tourismArrivals, tourismReceipts, creativeGoodsExports, creativeServicesExports, museumDensity, creativeCities, culturalEmployment, featureFilms, intangibleHeritage, musicRevenue, libraryDensity]);

  const sortedRankings = useMemo(() => {
    const sorted = [...rankings];
    sorted.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortField) {
        case 'heritage': aVal = a.heritage; bVal = b.heritage; break;
        case 'intangible': aVal = a.intangible; bVal = b.intangible; break;
        case 'tourism': aVal = a.tourism; bVal = b.tourism; break;
        case 'creativeGoods': aVal = a.creativeGoods; bVal = b.creativeGoods; break;
        case 'creativeServices': aVal = a.creativeServices; bVal = b.creativeServices; break;
        case 'museums': aVal = a.museums; bVal = b.museums; break;
        case 'libraries': aVal = a.libraries; bVal = b.libraries; break;
        case 'cities': aVal = a.cities; bVal = b.cities; break;
        case 'employment': aVal = a.employment; bVal = b.employment; break;
        case 'films': aVal = a.films; bVal = b.films; break;
        case 'music': aVal = a.music; bVal = b.music; break;
        default: aVal = a.compositeScore; bVal = b.compositeScore;
      }
      return sortAsc ? bVal - aVal : aVal - bVal;
    });
    return sorted;
  }, [rankings, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const headerClass = `px-3 py-2 text-xs font-medium cursor-pointer hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`;
  const cellClass = `px-3 py-3 text-sm`;

  return (
    <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
      <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Cultural Capital Rankings
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Composite score based on heritage, tourism, creative economy, and cultural infrastructure
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
              <th className={`${headerClass} text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} onClick={() => handleSort('rank')}>
                # {sortField === 'rank' && (sortAsc ? '↓' : '↑')}
              </th>
              <th className={`${headerClass} text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Country</th>
              <th className={`${headerClass} text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} onClick={() => handleSort('heritage')}>
                Heritage {sortField === 'heritage' && (sortAsc ? '↓' : '↑')}
              </th>
              <th className={`${headerClass} text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} onClick={() => handleSort('intangible')}>
                Intangible {sortField === 'intangible' && (sortAsc ? '↓' : '↑')}
              </th>
              <th className={`${headerClass} text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} onClick={() => handleSort('tourism')}>
                Tourism {sortField === 'tourism' && (sortAsc ? '↓' : '↑')}
              </th>
              <th className={`${headerClass} text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} onClick={() => handleSort('creativeGoods')}>
                Creative $ {sortField === 'creativeGoods' && (sortAsc ? '↓' : '↑')}
              </th>
              <th className={`${headerClass} text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} onClick={() => handleSort('museums')}>
                Museums {sortField === 'museums' && (sortAsc ? '↓' : '↑')}
              </th>
              <th className={`${headerClass} text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} onClick={() => handleSort('libraries')}>
                Libraries {sortField === 'libraries' && (sortAsc ? '↓' : '↑')}
              </th>
              <th className={`${headerClass} text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} onClick={() => handleSort('films')}>
                Films {sortField === 'films' && (sortAsc ? '↓' : '↑')}
              </th>
              <th className={`${headerClass} text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} onClick={() => handleSort('music')}>
                Music $ {sortField === 'music' && (sortAsc ? '↓' : '↑')}
              </th>
              <th className={`${headerClass} text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedRankings.map((row) => (
              <tr
                key={row.country}
                className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
              >
                <td className={`${cellClass} font-bold`} style={{ color: culturalChartColors[row.country] }}>
                  {row.rank}
                </td>
                <td className={`${cellClass} font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {row.country}
                </td>
                <td className={`${cellClass} text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {row.heritage}
                </td>
                <td className={`${cellClass} text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {row.intangible || '-'}
                </td>
                <td className={`${cellClass} text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {row.tourism > 0 ? formatNumber(row.tourism) : 'N/A'}
                </td>
                <td className={`${cellClass} text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  ${row.creativeGoods.toFixed(1)}B
                </td>
                <td className={`${cellClass} text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {row.museums}
                </td>
                <td className={`${cellClass} text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {row.libraries || '-'}
                </td>
                <td className={`${cellClass} text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {row.films > 0 ? formatNumber(row.films) : 'N/A'}
                </td>
                <td className={`${cellClass} text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {row.music > 0 ? `$${row.music.toFixed(1)}B` : '-'}
                </td>
                <td className={`${cellClass} text-right font-bold`}>
                  <span className={`px-2 py-1 rounded-md text-xs ${
                    row.compositeScore > 60 ? (isDarkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700') :
                    row.compositeScore > 30 ? (isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700') :
                    (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
                  }`}>
                    {row.compositeScore.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CulturalRankingTable;

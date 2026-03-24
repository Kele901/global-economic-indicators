'use client';

import React, { useMemo } from 'react';
import { CountryData } from '../services/worldbank';
import { culturalChartColors } from '../data/culturalMetrics';

interface CulturalHeatmapChartProps {
  isDarkMode: boolean;
  heritageData: { [country: string]: { total: number } };
  tourismArrivals: CountryData[];
  creativeGoodsExports: { [country: string]: number };
  creativeServicesExports: { [country: string]: number };
  museumDensity: { [country: string]: number };
  culturalEmployment: { [country: string]: number };
  featureFilms: { [country: string]: number };
  educationExpenditure: CountryData[];
  intangibleHeritage: { [country: string]: number };
  musicRevenue: { [country: string]: number };
  gamingRevenue: { [country: string]: number };
  libraryDensity: { [country: string]: number };
  selectedCountries: string[];
}

const metrics = [
  { key: 'heritage', label: 'Heritage' },
  { key: 'intangible', label: 'Intangible' },
  { key: 'tourism', label: 'Tourism' },
  { key: 'creativeGoods', label: 'Goods $' },
  { key: 'creativeServices', label: 'Services $' },
  { key: 'museums', label: 'Museums' },
  { key: 'libraries', label: 'Libraries' },
  { key: 'employment', label: 'Jobs' },
  { key: 'films', label: 'Films' },
  { key: 'music', label: 'Music' },
  { key: 'gaming', label: 'Gaming' },
  { key: 'education', label: 'Education' },
];

const getHeatColor = (normalized: number, isDarkMode: boolean): string => {
  if (normalized === -1) return isDarkMode ? '#1F2937' : '#F3F4F6';
  if (normalized < 0.2) return isDarkMode ? '#1E3A5F' : '#DBEAFE';
  if (normalized < 0.4) return isDarkMode ? '#1E40AF' : '#93C5FD';
  if (normalized < 0.6) return isDarkMode ? '#2563EB' : '#60A5FA';
  if (normalized < 0.8) return isDarkMode ? '#7C3AED' : '#8B5CF6';
  return isDarkMode ? '#A855F7' : '#7C3AED';
};

const CulturalHeatmapChart: React.FC<CulturalHeatmapChartProps> = ({
  isDarkMode, heritageData, tourismArrivals, creativeGoodsExports,
  creativeServicesExports, museumDensity, culturalEmployment,
  featureFilms, educationExpenditure, intangibleHeritage,
  musicRevenue, gamingRevenue, libraryDensity, selectedCountries,
}) => {
  const getLatestValue = (data: CountryData[], country: string): number | null => {
    for (let i = data.length - 1; i >= 0; i--) {
      const value = data[i][country];
      if (value !== undefined && value !== null && typeof value === 'number') return value;
    }
    return null;
  };

  const heatmapData = useMemo(() => {
    const rawValues: { [metric: string]: number[] } = {};
    metrics.forEach(m => { rawValues[m.key] = []; });

    const countryValues = selectedCountries.map(country => {
      const vals: { [key: string]: number | null } = {
        heritage: heritageData[country]?.total || null,
        intangible: intangibleHeritage[country] || null,
        tourism: getLatestValue(tourismArrivals, country),
        creativeGoods: creativeGoodsExports[country] || null,
        creativeServices: creativeServicesExports[country] || null,
        museums: museumDensity[country] || null,
        libraries: libraryDensity[country] || null,
        employment: culturalEmployment[country] || null,
        films: featureFilms[country] || null,
        music: musicRevenue[country] || null,
        gaming: gamingRevenue[country] || null,
        education: getLatestValue(educationExpenditure, country),
      };

      metrics.forEach(m => {
        if (vals[m.key] !== null) rawValues[m.key].push(vals[m.key]!);
      });

      return { country, ...vals };
    });

    const mins: { [key: string]: number } = {};
    const maxs: { [key: string]: number } = {};
    metrics.forEach(m => {
      const vals = rawValues[m.key];
      mins[m.key] = Math.min(...vals, 0);
      maxs[m.key] = Math.max(...vals, 1);
    });

    return countryValues.map(cv => {
      const normalized: { [key: string]: number } = {};
      metrics.forEach(m => {
        const val = (cv as any)[m.key];
        if (val === null || val === undefined) {
          normalized[m.key] = -1;
        } else {
          normalized[m.key] = maxs[m.key] === mins[m.key] ? 0.5 : (val - mins[m.key]) / (maxs[m.key] - mins[m.key]);
        }
      });
      return { country: cv.country, raw: cv, normalized };
    });
  }, [selectedCountries, heritageData, tourismArrivals, creativeGoodsExports, creativeServicesExports, museumDensity, culturalEmployment, featureFilms, educationExpenditure, intangibleHeritage, musicRevenue, gamingRevenue, libraryDensity]);

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
  };

  return (
    <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
      <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Cultural Capital Heatmap</h3>
      <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>
        Normalized scores across cultural metrics (darker = stronger)
      </p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className={`text-left text-xs font-medium px-2 py-2 ${themeColors.textSecondary}`}>Country</th>
              {metrics.map(m => (
                <th key={m.key} className={`text-center text-xs font-medium px-2 py-2 ${themeColors.textSecondary}`}>
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map(row => (
              <tr key={row.country}>
                <td className={`text-sm font-medium px-2 py-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {row.country}
                </td>
                {metrics.map(m => {
                  const val = row.normalized[m.key];
                  const bg = getHeatColor(val, isDarkMode);
                  return (
                    <td key={m.key} className="px-1 py-1">
                      <div
                        className="w-full h-8 rounded flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: bg,
                          color: val > 0.5 ? '#FFFFFF' : isDarkMode ? '#D1D5DB' : '#374151',
                        }}
                        title={`${row.country} - ${m.label}: ${val === -1 ? 'N/A' : (val * 100).toFixed(0) + '%'}`}
                      >
                        {val === -1 ? '-' : (val * 100).toFixed(0)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`flex items-center justify-center gap-2 mt-4 text-xs ${themeColors.textSecondary}`}>
        <span>Low</span>
        {['#DBEAFE', '#93C5FD', '#60A5FA', '#8B5CF6', '#7C3AED'].map((color, i) => (
          <div key={i} className="w-8 h-3 rounded-sm" style={{ backgroundColor: isDarkMode ? ['#1E3A5F', '#1E40AF', '#2563EB', '#7C3AED', '#A855F7'][i] : color }} />
        ))}
        <span>High</span>
      </div>
    </div>
  );
};

export default CulturalHeatmapChart;

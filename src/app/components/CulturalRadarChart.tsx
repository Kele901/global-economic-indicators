'use client';

import React, { useMemo } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { CountryData } from '../services/worldbank';
import { culturalChartColors } from '../data/culturalMetrics';

interface CulturalRadarChartProps {
  isDarkMode: boolean;
  heritageData: { [country: string]: { total: number } };
  tourismArrivals: CountryData[];
  creativeGoodsExports: { [country: string]: number };
  museumDensity: { [country: string]: number };
  culturalEmployment: { [country: string]: number };
  featureFilms: { [country: string]: number };
  softPowerRankings: { [country: string]: { rank: number; score: number } };
  musicRevenue: { [country: string]: number };
  libraryDensity: { [country: string]: number };
  selectedCountries: string[];
}

const radarMetrics = [
  { key: 'heritage', label: 'Heritage' },
  { key: 'tourism', label: 'Tourism' },
  { key: 'creative', label: 'Creative Trade' },
  { key: 'museums', label: 'Museums' },
  { key: 'libraries', label: 'Libraries' },
  { key: 'employment', label: 'Cultural Jobs' },
  { key: 'films', label: 'Film Industry' },
  { key: 'music', label: 'Music Industry' },
  { key: 'softpower', label: 'Soft Power' },
];

const CulturalRadarChart: React.FC<CulturalRadarChartProps> = ({
  isDarkMode, heritageData, tourismArrivals, creativeGoodsExports,
  museumDensity, culturalEmployment, featureFilms, softPowerRankings,
  musicRevenue, libraryDensity, selectedCountries,
}) => {
  const getLatestValue = (data: CountryData[], country: string): number | null => {
    for (let i = data.length - 1; i >= 0; i--) {
      const value = data[i][country];
      if (value !== undefined && value !== null && typeof value === 'number') return value;
    }
    return null;
  };

  const radarData = useMemo(() => {
    const countries = selectedCountries.slice(0, 5);

    const rawByMetric: { [metric: string]: { [country: string]: number } } = {};
    radarMetrics.forEach(m => { rawByMetric[m.key] = {}; });

    countries.forEach(country => {
      rawByMetric.heritage[country] = heritageData[country]?.total || 0;
      rawByMetric.tourism[country] = getLatestValue(tourismArrivals, country) || 0;
      rawByMetric.creative[country] = creativeGoodsExports[country] || 0;
      rawByMetric.museums[country] = museumDensity[country] || 0;
      rawByMetric.libraries[country] = libraryDensity[country] || 0;
      rawByMetric.employment[country] = culturalEmployment[country] || 0;
      rawByMetric.films[country] = featureFilms[country] || 0;
      rawByMetric.music[country] = musicRevenue[country] || 0;
      rawByMetric.softpower[country] = softPowerRankings[country]?.score || 0;
    });

    const maxByMetric: { [metric: string]: number } = {};
    radarMetrics.forEach(m => {
      const vals = Object.values(rawByMetric[m.key]);
      maxByMetric[m.key] = Math.max(...vals, 1);
    });

    return radarMetrics.map(m => {
      const entry: any = { metric: m.label };
      countries.forEach(country => {
        entry[country] = Math.round((rawByMetric[m.key][country] / maxByMetric[m.key]) * 100);
      });
      return entry;
    });
  }, [selectedCountries, heritageData, tourismArrivals, creativeGoodsExports, museumDensity, culturalEmployment, featureFilms, softPowerRankings, musicRevenue, libraryDensity]);

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    tickColor: isDarkMode ? '#9CA3AF' : '#6B7280',
  };

  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
    borderRadius: '8px',
    color: isDarkMode ? '#F3F4F6' : '#111827',
  };

  const countriesToShow = selectedCountries.slice(0, 5);

  return (
    <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
      <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Cultural Profile Comparison</h3>
      <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>
        Radar chart showing relative strengths across cultural dimensions (max 5 countries)
      </p>

      <div className="w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: themeColors.tickColor, fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: themeColors.tickColor, fontSize: 10 }}
              tickCount={5}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            {countriesToShow.map((country, index) => (
              <Radar
                key={country}
                name={country}
                dataKey={country}
                stroke={culturalChartColors[country] || '#8B5CF6'}
                fill={culturalChartColors[country] || '#8B5CF6'}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CulturalRadarChart;

'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Line, Cell,
} from 'recharts';
import { CountryData } from '../services/worldbank';
import { culturalChartColors, formatNumber, formatCurrency, trademarkFallbackData } from '../data/culturalMetrics';

interface CreativeEconomyChartProps {
  isDarkMode: boolean;
  creativeGoodsExports: { [country: string]: number };
  creativeServicesExports: { [country: string]: number };
  trademarkData: CountryData[];
  featureFilms: { [country: string]: number };
  culturalEmployment: { [country: string]: number };
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

type ViewMode = 'goods' | 'services' | 'films' | 'employment';

const CreativeEconomyChart: React.FC<CreativeEconomyChartProps> = ({
  isDarkMode, creativeGoodsExports, creativeServicesExports, trademarkData,
  featureFilms, culturalEmployment, selectedCountries,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('goods');

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    gridColor: isDarkMode ? '#374151' : '#E5E7EB',
    tickColor: isDarkMode ? '#9CA3AF' : '#6B7280',
  };

  const goodsVsServicesData = useMemo(() => {
    return selectedCountries
      .filter(c => creativeGoodsExports[c] || creativeServicesExports[c])
      .map(country => ({
        country,
        Goods: creativeGoodsExports[country] || 0,
        Services: creativeServicesExports[country] || 0,
        Total: (creativeGoodsExports[country] || 0) + (creativeServicesExports[country] || 0),
      }))
      .sort((a, b) => b.Total - a.Total);
  }, [creativeGoodsExports, creativeServicesExports, selectedCountries]);

  const filmsData = useMemo(() => {
    return selectedCountries
      .filter(c => featureFilms[c])
      .map(country => ({ country, Films: featureFilms[country] }))
      .sort((a, b) => b.Films - a.Films);
  }, [featureFilms, selectedCountries]);

  const employmentData = useMemo(() => {
    return selectedCountries
      .filter(c => culturalEmployment[c])
      .map(country => ({ country, Employment: culturalEmployment[country] }))
      .sort((a, b) => b.Employment - a.Employment);
  }, [culturalEmployment, selectedCountries]);

  const trademarkChartData = useMemo(() => {
    const source = trademarkData.length > 0 ? trademarkData : trademarkFallbackData;
    const recent = source.slice(-15);
    return recent
      .map(yearData => {
        const entry: any = { year: yearData.year };
        selectedCountries.forEach(country => {
          if (yearData[country] !== undefined && yearData[country] !== null) {
            entry[country] = yearData[country];
          }
        });
        return entry;
      })
      .filter(entry => Object.keys(entry).length > 1);
  }, [trademarkData, selectedCountries]);

  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
    borderRadius: '8px',
    color: isDarkMode ? '#F3F4F6' : '#111827',
  };

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-emerald-500 text-emerald-400' : 'bg-white border-emerald-400 text-emerald-700'
      }`}>
        <h3 className="font-semibold">Creative Economy Indicators</h3>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Explore the economic dimensions of culture including creative goods and services trade,
          cultural employment, and film production across nations.
        </p>
      </div>

      <div className={`flex flex-wrap gap-2 p-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {([
          { id: 'goods' as ViewMode, label: 'Creative Trade' },
          { id: 'films' as ViewMode, label: 'Film Production' },
          { id: 'employment' as ViewMode, label: 'Cultural Employment' },
          { id: 'services' as ViewMode, label: 'Trademark Trends' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === tab.id
                ? isDarkMode ? 'bg-emerald-600 text-white' : 'bg-white text-gray-900 shadow'
                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {viewMode === 'goods' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Creative Goods vs Services Exports</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>Billions USD, 2023 UNCTAD data</p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goodsVsServicesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis dataKey="country" tick={{ fill: themeColors.tickColor, fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fill: themeColors.tickColor, fontSize: 12 }} label={{ value: 'Billion USD', angle: -90, position: 'insideLeft', fill: themeColors.tickColor }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => `$${value.toFixed(1)}B`} />
                <Legend />
                <Bar dataKey="Goods" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Services" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'films' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Feature Films Produced Annually</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>Number of feature-length films per year</p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filmsData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis type="number" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <YAxis dataKey="country" type="category" tick={{ fill: themeColors.tickColor, fontSize: 12 }} width={75} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Films" radius={[0, 4, 4, 0]}>
                  {filmsData.map((entry, index) => (
                    <Cell key={index} fill={culturalChartColors[entry.country] || '#D946EF'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'employment' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Cultural Employment Share</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>% of total employment in cultural and creative sectors</p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employmentData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis dataKey="country" tick={{ fill: themeColors.tickColor, fontSize: 11 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fill: themeColors.tickColor, fontSize: 12 }} label={{ value: '% of employment', angle: -90, position: 'insideLeft', fill: themeColors.tickColor }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Bar dataKey="Employment" radius={[4, 4, 0, 0]}>
                  {employmentData.map((entry, index) => (
                    <Cell key={index} fill={culturalChartColors[entry.country] || '#84CC16'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'services' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Trademark Applications Over Time</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>Direct resident trademark filings (World Bank / WIPO)</p>
          {trademarkChartData.length > 0 ? (
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trademarkChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                  <XAxis dataKey="year" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                  <YAxis tick={{ fill: themeColors.tickColor, fontSize: 12 }} tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatNumber(value)} />
                  <Legend />
                  {selectedCountries.slice(0, 8).map(country => (
                    <Line
                      key={country}
                      type="monotone"
                      dataKey={country}
                      stroke={culturalChartColors[country] || '#8B5CF6'}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`w-full h-[300px] flex flex-col items-center justify-center rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
              <p className={`text-sm ${themeColors.textSecondary}`}>Trademark data is loading or unavailable for the selected countries.</p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Try selecting different countries or refresh the page.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreativeEconomyChart;

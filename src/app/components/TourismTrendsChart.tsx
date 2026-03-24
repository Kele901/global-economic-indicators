'use client';

import React, { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Bar, Area,
} from 'recharts';
import { CountryData } from '../services/worldbank';
import {
  culturalChartColors, formatNumber, formatCurrency,
  tourismReceiptsFallbackData, tourismExpenditureFallbackData,
} from '../data/culturalMetrics';

interface TourismTrendsChartProps {
  isDarkMode: boolean;
  tourismArrivals: CountryData[];
  tourismReceipts: CountryData[];
  tourismExpenditure: CountryData[];
  netMigration: CountryData[];
  softPowerRankings: { [country: string]: { rank: number; score: number } };
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

type ViewMode = 'arrivals' | 'receipts' | 'migration' | 'softpower';

const TourismTrendsChart: React.FC<TourismTrendsChartProps> = ({
  isDarkMode, tourismArrivals, tourismReceipts, tourismExpenditure,
  netMigration, softPowerRankings, selectedCountries,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('arrivals');

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    gridColor: isDarkMode ? '#374151' : '#E5E7EB',
    tickColor: isDarkMode ? '#9CA3AF' : '#6B7280',
  };

  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
    borderRadius: '8px',
    color: isDarkMode ? '#F3F4F6' : '#111827',
  };

  const arrivalsData = useMemo(() => {
    if (tourismArrivals.length === 0) return [];
    return tourismArrivals.slice(-15).map(yearData => {
      const entry: any = { year: yearData.year };
      selectedCountries.forEach(country => {
        if (yearData[country] !== undefined) entry[country] = yearData[country];
      });
      return entry;
    });
  }, [tourismArrivals, selectedCountries]);

  const receiptsData = useMemo(() => {
    const hasLiveReceipts = tourismReceipts.length > 0;
    const hasLiveExpend = tourismExpenditure.length > 0;

    const receiptsMap = new Map<number, any>();
    const expendMap = new Map<number, any>();

    // Populate from fallback first so live data overrides it
    tourismReceiptsFallbackData.forEach(d => receiptsMap.set(Number(d.year), { ...d }));
    tourismExpenditureFallbackData.forEach(d => expendMap.set(Number(d.year), { ...d }));

    // Overlay live data (values are in raw USD, need to convert to billions)
    if (hasLiveReceipts) {
      tourismReceipts.forEach(d => {
        const year = Number(d.year);
        const existing = receiptsMap.get(year) || { year };
        Object.entries(d).forEach(([key, val]) => {
          if (key !== 'year' && val !== undefined && val !== null) {
            existing[key] = Number(val) / 1e9;
          }
        });
        receiptsMap.set(year, existing);
      });
    }
    if (hasLiveExpend) {
      tourismExpenditure.forEach(d => {
        const year = Number(d.year);
        const existing = expendMap.get(year) || { year };
        Object.entries(d).forEach(([key, val]) => {
          if (key !== 'year' && val !== undefined && val !== null) {
            existing[key] = Number(val) / 1e9;
          }
        });
        expendMap.set(year, existing);
      });
    }

    const allYears = new Set<number>([...receiptsMap.keys(), ...expendMap.keys()]);
    const sortedYears = Array.from(allYears).sort((a, b) => a - b).slice(-15);
    const countries = selectedCountries.slice(0, 6);

    return sortedYears
      .map(year => {
        const receiptsYear = receiptsMap.get(year);
        const expendYear = expendMap.get(year);
        const entry: any = { year };
        countries.forEach(country => {
          const rv = receiptsYear?.[country];
          const ev = expendYear?.[country];
          if (rv !== undefined && rv !== null) entry[`${country}_receipts`] = Number(rv);
          if (ev !== undefined && ev !== null) entry[`${country}_expenditure`] = Number(ev);
        });
        return entry;
      })
      .filter(entry => Object.keys(entry).length > 1);
  }, [tourismReceipts, tourismExpenditure, selectedCountries]);

  const migrationData = useMemo(() => {
    if (netMigration.length === 0) return [];
    return netMigration.slice(-6).map(yearData => {
      const entry: any = { year: yearData.year };
      selectedCountries.forEach(country => {
        if (yearData[country] !== undefined) entry[country] = yearData[country];
      });
      return entry;
    });
  }, [netMigration, selectedCountries]);

  const softPowerData = useMemo(() => {
    return selectedCountries
      .filter(c => softPowerRankings[c])
      .map(country => ({
        country,
        rank: softPowerRankings[country].rank,
        score: softPowerRankings[country].score,
      }))
      .sort((a, b) => a.rank - b.rank);
  }, [softPowerRankings, selectedCountries]);

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-blue-500 text-blue-400' : 'bg-white border-blue-400 text-blue-700'
      }`}>
        <h3 className="font-semibold">Tourism and Soft Power</h3>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Tourism flows and cultural influence metrics reveal a country&apos;s global attractiveness
          and the economic value of its cultural assets.
        </p>
      </div>

      <div className={`flex flex-wrap gap-2 p-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {([
          { id: 'arrivals' as ViewMode, label: 'Tourism Arrivals' },
          { id: 'receipts' as ViewMode, label: 'Receipts vs Spending' },
          { id: 'migration' as ViewMode, label: 'Net Migration' },
          { id: 'softpower' as ViewMode, label: 'Soft Power' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === tab.id
                ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 shadow'
                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {viewMode === 'arrivals' && arrivalsData.length > 0 && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>International Tourism Arrivals</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>Number of inbound tourists over time</p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={arrivalsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    stroke={culturalChartColors[country] || '#3B82F6'}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'receipts' && receiptsData.length > 0 && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Tourism Receipts vs Expenditure</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>Billions USD - top selected countries</p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={receiptsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis dataKey="year" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <YAxis tick={{ fill: themeColors.tickColor, fontSize: 12 }} label={{ value: 'Billion $', angle: -90, position: 'insideLeft', fill: themeColors.tickColor }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => `$${value.toFixed(1)}B`} />
                <Legend />
                {selectedCountries.slice(0, 6).map(country => {
                  const hasReceipts = receiptsData.some(d => d[`${country}_receipts`] !== undefined);
                  const hasExpend = receiptsData.some(d => d[`${country}_expenditure`] !== undefined);
                  if (!hasReceipts && !hasExpend) return null;
                  return (
                    <React.Fragment key={country}>
                      {hasReceipts && (
                        <Line
                          type="monotone"
                          dataKey={`${country}_receipts`}
                          name={`${country} Receipts`}
                          stroke={culturalChartColors[country] || '#3B82F6'}
                          strokeWidth={2}
                          dot={false}
                          connectNulls
                        />
                      )}
                      {hasExpend && (
                        <Line
                          type="monotone"
                          dataKey={`${country}_expenditure`}
                          name={`${country} Expenditure`}
                          stroke={culturalChartColors[country] || '#3B82F6'}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                          connectNulls
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'migration' && migrationData.length > 0 && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Net Migration</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>
            Positive values indicate cultural pull (more immigrants than emigrants)
          </p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={migrationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis dataKey="year" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <YAxis tick={{ fill: themeColors.tickColor, fontSize: 12 }} tickFormatter={(v) => formatNumber(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatNumber(value)} />
                <Legend />
                {selectedCountries.slice(0, 8).map(country => (
                  <Bar
                    key={country}
                    dataKey={country}
                    fill={culturalChartColors[country] || '#14B8A6'}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'softpower' && softPowerData.length > 0 && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Global Soft Power Rankings</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>Brand Finance Global Soft Power Index 2024</p>
          <div className="space-y-3">
            {softPowerData.map((item) => (
              <div key={item.country} className="flex items-center gap-4">
                <div className={`w-8 text-center font-bold text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  #{item.rank}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${themeColors.text}`}>{item.country}</span>
                    <span className={`text-sm ${themeColors.textSecondary}`}>{item.score.toFixed(1)}</span>
                  </div>
                  <div className={`h-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.score / 80) * 100}%`,
                        backgroundColor: culturalChartColors[item.country] || '#3B82F6',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TourismTrendsChart;

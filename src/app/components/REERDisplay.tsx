'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import {
  REER_DATA,
  type REERData,
  type CurrencyCode
} from '../data/currencyHierarchyData';
import { useREERData } from '../hooks/useREERData';

interface REERDisplayProps {
  isDarkMode: boolean;
}

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  CHF: '🇨🇭',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  NZD: '🇳🇿',
  CNY: '🇨🇳',
  SEK: '🇸🇪',
  NOK: '🇳🇴',
  MXN: '🇲🇽',
  BRL: '🇧🇷',
  INR: '🇮🇳',
  ZAR: '🇿🇦',
  TRY: '🇹🇷',
  RUB: '🇷🇺'
};

const REERDisplay: React.FC<REERDisplayProps> = ({ isDarkMode }) => {
  const [sortBy, setSortBy] = useState<'deviation' | 'currency'>('deviation');
  const [filterValuation, setFilterValuation] = useState<'all' | 'overvalued' | 'undervalued'>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode | null>(null);

  const { reerData: liveReerData, loading, isLive, refetch } = useREERData();

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800/50' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    gridColor: isDarkMode ? '#374151' : '#e5e7eb'
  };

  const reerDataSource = useMemo(() => {
    if (liveReerData.length > 0) {
      return liveReerData.map(d => ({
        currency: d.currency as CurrencyCode,
        current: d.current,
        historicalAverage: d.historicalAverage,
        deviation: d.deviation,
        isOvervalued: d.isOvervalued,
        trend: d.trend,
        lastUpdated: d.lastUpdated
      }));
    }
    return REER_DATA;
  }, [liveReerData]);

  const filteredData = useMemo(() => {
    let data = [...reerDataSource];
    
    if (filterValuation === 'overvalued') {
      data = data.filter(d => d.isOvervalued);
    } else if (filterValuation === 'undervalued') {
      data = data.filter(d => !d.isOvervalued);
    }
    
    if (sortBy === 'deviation') {
      data.sort((a, b) => b.deviation - a.deviation);
    } else {
      data.sort((a, b) => a.currency.localeCompare(b.currency));
    }
    
    return data;
  }, [sortBy, filterValuation, reerDataSource]);

  const chartData = useMemo(() => {
    return filteredData.map(d => ({
      currency: d.currency,
      deviation: d.deviation,
      current: d.current
    }));
  }, [filteredData]);

  const stats = useMemo(() => {
    const overvalued = reerDataSource.filter(d => d.isOvervalued);
    const undervalued = reerDataSource.filter(d => !d.isOvervalued);
    const maxOvervalued = reerDataSource.reduce((max, d) => d.deviation > max.deviation ? d : max, reerDataSource[0]);
    const maxUndervalued = reerDataSource.reduce((min, d) => d.deviation < min.deviation ? d : min, reerDataSource[0]);
    
    return {
      overvaluedCount: overvalued.length,
      undervaluedCount: undervalued.length,
      maxOvervalued,
      maxUndervalued
    };
  }, [reerDataSource]);

  const getDeviationColor = (deviation: number): string => {
    if (deviation >= 20) return '#ef4444'; // Very overvalued - red
    if (deviation >= 10) return '#f97316'; // Overvalued - orange
    if (deviation >= -10) return '#22c55e'; // Fair value - green
    if (deviation >= -20) return '#3b82f6'; // Undervalued - blue
    return '#8b5cf6'; // Very undervalued - purple
  };

  const getValuationLabel = (deviation: number): string => {
    if (deviation >= 20) return 'Very Overvalued';
    if (deviation >= 10) return 'Overvalued';
    if (deviation >= -10) return 'Fair Value';
    if (deviation >= -20) return 'Undervalued';
    return 'Very Undervalued';
  };

  const getTrendIcon = (trend: 'appreciating' | 'depreciating' | 'stable') => {
    switch (trend) {
      case 'appreciating':
        return <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>↑</span>;
      case 'depreciating':
        return <span className={isDarkMode ? 'text-red-400' : 'text-red-600'}>↓</span>;
      case 'stable':
        return <span className={themeColors.textTertiary}>→</span>;
    }
  };

  const CustomTooltip = ({ active, payload }: { 
    active?: boolean; 
    payload?: Array<{ payload: { currency: string; deviation: number; current: number } }>;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const fullData = reerDataSource.find(d => d.currency === data.currency);
    
    return (
      <div className={`p-3 rounded-lg shadow-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{CURRENCY_FLAGS[data.currency]}</span>
          <span className={`font-bold ${themeColors.text}`}>{data.currency}</span>
        </div>
        <div className={`text-lg font-bold`} style={{ color: getDeviationColor(data.deviation) }}>
          {data.deviation >= 0 ? '+' : ''}{data.deviation.toFixed(1)}%
        </div>
        <div className={`text-sm ${themeColors.textSecondary}`}>
          {getValuationLabel(data.deviation)}
        </div>
        <div className={`text-xs mt-1 ${themeColors.textTertiary}`}>
          REER Index: {data.current.toFixed(1)} (avg: 100)
        </div>
        {fullData && (
          <div className={`text-xs mt-1 ${themeColors.textTertiary}`}>
            Trend: {fullData.trend}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`rounded-xl overflow-hidden ${themeColors.cardBg}`}>
      <div className={`px-4 py-3 border-b ${themeColors.border}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`text-lg font-semibold ${themeColors.text}`}>
              Real Effective Exchange Rate (REER)
            </h3>
            <p className={`text-sm ${themeColors.textSecondary}`}>
              Currency valuation relative to historical averages (BIS data)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className={`text-xs ${themeColors.textTertiary}`}>
                {isLive ? 'Live' : 'Cached'}
              </span>
            </div>
            <button
              onClick={refetch}
              disabled={loading}
              className={`px-2 py-1 text-xs rounded ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              } disabled:opacity-50`}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`text-xs ${themeColors.textTertiary}`}>Overvalued</div>
            <div className={`text-xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              {stats.overvaluedCount}
            </div>
            <div className={`text-xs ${themeColors.textSecondary}`}>currencies</div>
          </div>
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`text-xs ${themeColors.textTertiary}`}>Undervalued</div>
            <div className={`text-xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {stats.undervaluedCount}
            </div>
            <div className={`text-xs ${themeColors.textSecondary}`}>currencies</div>
          </div>
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`text-xs ${themeColors.textTertiary}`}>Most Overvalued</div>
            <div className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              {CURRENCY_FLAGS[stats.maxOvervalued.currency]} +{stats.maxOvervalued.deviation.toFixed(1)}%
            </div>
            <div className={`text-xs ${themeColors.textSecondary}`}>{stats.maxOvervalued.currency}</div>
          </div>
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`text-xs ${themeColors.textTertiary}`}>Most Undervalued</div>
            <div className={`text-lg font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {CURRENCY_FLAGS[stats.maxUndervalued.currency]} {stats.maxUndervalued.deviation.toFixed(1)}%
            </div>
            <div className={`text-xs ${themeColors.textSecondary}`}>{stats.maxUndervalued.currency}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <h4 className={`text-xs font-semibold mb-2 ${themeColors.textTertiary}`}>FILTER</h4>
            <div className="flex gap-2">
              {(['all', 'overvalued', 'undervalued'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setFilterValuation(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filterValuation === filter
                      ? filter === 'overvalued'
                        ? isDarkMode
                          ? 'bg-red-900/30 border-red-600 text-red-400'
                          : 'bg-red-50 border-red-300 text-red-700'
                        : filter === 'undervalued'
                          ? isDarkMode
                            ? 'bg-blue-900/30 border-blue-600 text-blue-400'
                            : 'bg-blue-50 border-blue-300 text-blue-700'
                          : isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-900'
                      : isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className={`text-xs font-semibold mb-2 ${themeColors.textTertiary}`}>SORT BY</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('deviation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  sortBy === 'deviation'
                    ? isDarkMode
                      ? 'bg-blue-900/30 border-blue-600 text-blue-400'
                      : 'bg-blue-50 border-blue-300 text-blue-700'
                    : isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                Deviation
              </button>
              <button
                onClick={() => setSortBy('currency')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  sortBy === 'currency'
                    ? isDarkMode
                      ? 'bg-blue-900/30 border-blue-600 text-blue-400'
                      : 'bg-blue-50 border-blue-300 text-blue-700'
                    : isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                Currency
              </button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-72 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }}
                axisLine={{ stroke: themeColors.gridColor }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="currency"
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: themeColors.gridColor }}
                width={60}
                tickFormatter={(value) => `${CURRENCY_FLAGS[value] || ''} ${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={0} stroke={isDarkMode ? '#6b7280' : '#9ca3af'} strokeWidth={2} />
              <ReferenceLine x={10} stroke={isDarkMode ? '#ef4444' : '#fca5a5'} strokeDasharray="3 3" />
              <ReferenceLine x={-10} stroke={isDarkMode ? '#3b82f6' : '#93c5fd'} strokeDasharray="3 3" />
              <Bar dataKey="deviation" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getDeviationColor(entry.deviation)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Currency Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredData.map(data => (
            <div
              key={data.currency}
              onClick={() => setSelectedCurrency(selectedCurrency === data.currency ? null : data.currency)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              } ${selectedCurrency === data.currency ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CURRENCY_FLAGS[data.currency]}</span>
                  <span className={`font-bold ${themeColors.text}`}>{data.currency}</span>
                </div>
                {getTrendIcon(data.trend)}
              </div>
              
              <div className="flex items-center gap-2">
                <span
                  className="text-xl font-bold"
                  style={{ color: getDeviationColor(data.deviation) }}
                >
                  {data.deviation >= 0 ? '+' : ''}{data.deviation.toFixed(1)}%
                </span>
              </div>
              
              <div className={`text-xs ${themeColors.textTertiary}`}>
                {getValuationLabel(data.deviation)}
              </div>

              {/* Visual gauge */}
              <div className="mt-2 relative h-2 rounded-full overflow-hidden">
                <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <div
                  className="absolute top-0 h-full transition-all"
                  style={{
                    backgroundColor: getDeviationColor(data.deviation),
                    left: data.deviation >= 0 ? '50%' : `${50 + (data.deviation / 60) * 50}%`,
                    width: `${Math.abs(data.deviation) / 60 * 50}%`
                  }}
                />
                <div className={`absolute top-0 left-1/2 w-0.5 h-full ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} />
              </div>

              {selectedCurrency === data.currency && (
                <div className={`mt-2 pt-2 border-t text-xs ${themeColors.border}`}>
                  <div className={themeColors.textSecondary}>
                    REER Index: {data.current.toFixed(1)}
                  </div>
                  <div className={themeColors.textTertiary}>
                    Historical Avg: {data.historicalAverage}
                  </div>
                  <div className={themeColors.textTertiary}>
                    Updated: {data.lastUpdated}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className={`mt-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${themeColors.text}`}>
            Understanding REER
          </h4>
          <div className="flex flex-wrap gap-4 text-xs mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
              <span className={themeColors.textSecondary}>Very Overvalued (&gt;+20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }} />
              <span className={themeColors.textSecondary}>Overvalued (+10% to +20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }} />
              <span className={themeColors.textSecondary}>Fair Value (-10% to +10%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }} />
              <span className={themeColors.textSecondary}>Undervalued (-20% to -10%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#8b5cf6' }} />
              <span className={themeColors.textSecondary}>Very Undervalued (&lt;-20%)</span>
            </div>
          </div>
          <p className={`text-xs ${themeColors.textTertiary}`}>
            REER measures a currency&apos;s value relative to a basket of trading partners, 
            adjusted for inflation. A value above 100 suggests overvaluation; below 100 
            suggests undervaluation. Historical average is set to 100.
          </p>
        </div>
      </div>
    </div>
  );
};

export default REERDisplay;

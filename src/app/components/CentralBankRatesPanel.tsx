'use client';

import React, { useState, useMemo } from 'react';
import {
  CENTRAL_BANK_RATES,
  type CentralBankRate
} from '../data/currencyHierarchyData';

interface CentralBankRatesPanelProps {
  isDarkMode: boolean;
}

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  JPY: '🇯🇵',
  GBP: '🇬🇧',
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

const CentralBankRatesPanel: React.FC<CentralBankRatesPanelProps> = ({ isDarkMode }) => {
  const [sortBy, setSortBy] = useState<'rate' | 'currency' | 'trend'>('rate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterTrend, setFilterTrend] = useState<'all' | 'rising' | 'falling' | 'stable'>('all');

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800/50' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  const filteredAndSortedRates = useMemo(() => {
    let rates = [...CENTRAL_BANK_RATES];
    
    // Filter by trend
    if (filterTrend !== 'all') {
      rates = rates.filter(r => r.trend === filterTrend);
    }
    
    // Sort
    rates.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'rate':
          comparison = a.rate - b.rate;
          break;
        case 'currency':
          comparison = a.currency.localeCompare(b.currency);
          break;
        case 'trend':
          const trendOrder = { rising: 0, stable: 1, falling: 2 };
          comparison = trendOrder[a.trend] - trendOrder[b.trend];
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return rates;
  }, [sortBy, sortDirection, filterTrend]);

  const rateStats = useMemo(() => {
    const rates = CENTRAL_BANK_RATES.map(r => r.rate);
    return {
      max: Math.max(...rates),
      min: Math.min(...rates),
      avg: rates.reduce((a, b) => a + b, 0) / rates.length,
      rising: CENTRAL_BANK_RATES.filter(r => r.trend === 'rising').length,
      falling: CENTRAL_BANK_RATES.filter(r => r.trend === 'falling').length,
      stable: CENTRAL_BANK_RATES.filter(r => r.trend === 'stable').length
    };
  }, []);

  const getTrendIcon = (trend: 'rising' | 'falling' | 'stable') => {
    switch (trend) {
      case 'rising':
        return <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>▲</span>;
      case 'falling':
        return <span className={isDarkMode ? 'text-red-400' : 'text-red-600'}>▼</span>;
      case 'stable':
        return <span className={themeColors.textTertiary}>●</span>;
    }
  };

  const getTrendColor = (trend: 'rising' | 'falling' | 'stable') => {
    switch (trend) {
      case 'rising':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      case 'falling':
        return isDarkMode ? 'text-red-400' : 'text-red-600';
      case 'stable':
        return themeColors.textTertiary;
    }
  };

  const getRateChange = (rate: CentralBankRate) => {
    const change = rate.rate - rate.previousRate;
    if (change === 0) return null;
    return change;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysUntilMeeting = (dateStr: string) => {
    const meetingDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    meetingDate.setHours(0, 0, 0, 0);
    const diffTime = meetingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const toggleSort = (field: 'rate' | 'currency' | 'trend') => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden ${themeColors.cardBg}`}>
      <div className={`px-4 py-3 border-b ${themeColors.border}`}>
        <h3 className={`text-lg font-semibold ${themeColors.text}`}>
          Central Bank Interest Rates
        </h3>
        <p className={`text-sm ${themeColors.textSecondary}`}>
          Current policy rates and upcoming meeting schedules
        </p>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`text-xs ${themeColors.textTertiary}`}>Highest Rate</div>
            <div className={`text-xl font-bold ${themeColors.text}`}>{rateStats.max.toFixed(2)}%</div>
            <div className={`text-xs ${themeColors.textSecondary}`}>
              {CENTRAL_BANK_RATES.find(r => r.rate === rateStats.max)?.currency}
            </div>
          </div>
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`text-xs ${themeColors.textTertiary}`}>Lowest Rate</div>
            <div className={`text-xl font-bold ${themeColors.text}`}>{rateStats.min.toFixed(2)}%</div>
            <div className={`text-xs ${themeColors.textSecondary}`}>
              {CENTRAL_BANK_RATES.find(r => r.rate === rateStats.min)?.currency}
            </div>
          </div>
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`text-xs ${themeColors.textTertiary}`}>Average Rate</div>
            <div className={`text-xl font-bold ${themeColors.text}`}>{rateStats.avg.toFixed(2)}%</div>
          </div>
          <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`text-xs ${themeColors.textTertiary}`}>Rate Trend</div>
            <div className="flex gap-2 mt-1">
              <span className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                ▲ {rateStats.rising}
              </span>
              <span className={`text-sm ${themeColors.textTertiary}`}>
                ● {rateStats.stable}
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                ▼ {rateStats.falling}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <h4 className={`text-xs font-semibold mb-2 ${themeColors.textTertiary}`}>FILTER BY TREND</h4>
            <div className="flex gap-2">
              {(['all', 'rising', 'stable', 'falling'] as const).map(trend => (
                <button
                  key={trend}
                  onClick={() => setFilterTrend(trend)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filterTrend === trend
                      ? trend === 'rising'
                        ? isDarkMode
                          ? 'bg-green-900/30 border-green-600 text-green-400'
                          : 'bg-green-50 border-green-300 text-green-700'
                        : trend === 'falling'
                          ? isDarkMode
                            ? 'bg-red-900/30 border-red-600 text-red-400'
                            : 'bg-red-50 border-red-300 text-red-700'
                          : isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-900'
                      : isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {trend === 'all' ? 'All' : `${trend.charAt(0).toUpperCase()}${trend.slice(1)}`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className={`text-xs font-semibold mb-2 ${themeColors.textTertiary}`}>SORT BY</h4>
            <div className="flex gap-2">
              {(['rate', 'currency', 'trend'] as const).map(field => (
                <button
                  key={field}
                  onClick={() => toggleSort(field)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                    sortBy === field
                      ? isDarkMode
                        ? 'bg-blue-900/30 border-blue-600 text-blue-400'
                        : 'bg-blue-50 border-blue-300 text-blue-700'
                      : isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {sortBy === field && (
                    <span>{sortDirection === 'desc' ? '↓' : '↑'}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rate Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAndSortedRates.map(rate => {
            const change = getRateChange(rate);
            const daysUntil = getDaysUntilMeeting(rate.nextMeeting);
            const isSoon = daysUntil <= 7;
            
            return (
              <div
                key={rate.currency}
                className={`p-4 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{CURRENCY_FLAGS[rate.currency]}</span>
                    <div>
                      <div className={`text-lg font-bold ${themeColors.text}`}>
                        {rate.currency}
                      </div>
                      <div className={`text-xs ${themeColors.textTertiary}`}>
                        {rate.bankAbbrev}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className={`text-xl font-bold ${themeColors.text}`}>
                        {rate.rate.toFixed(2)}%
                      </span>
                      {getTrendIcon(rate.trend)}
                    </div>
                    {change !== null && (
                      <div className={`text-xs ${change > 0 ? getTrendColor('rising') : getTrendColor('falling')}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank Name */}
                <div className={`text-sm ${themeColors.textSecondary} mb-2`}>
                  {rate.bank}
                </div>

                {/* Details */}
                <div className="flex justify-between text-xs">
                  <div>
                    <span className={themeColors.textTertiary}>Last Updated:</span>{' '}
                    <span className={themeColors.textSecondary}>{formatDate(rate.lastUpdated)}</span>
                  </div>
                </div>

                {/* Next Meeting */}
                <div className={`mt-2 pt-2 border-t ${themeColors.border}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className={themeColors.textTertiary}>Next Meeting:</span>
                    <span className={`font-medium ${
                      isSoon
                        ? isDarkMode ? 'text-amber-400' : 'text-amber-600'
                        : themeColors.text
                    }`}>
                      {formatDate(rate.nextMeeting)}
                      {isSoon && ` (${daysUntil}d)`}
                    </span>
                  </div>
                </div>

                {/* Rate Bar */}
                <div className="mt-2">
                  <div className={`h-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-1.5 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${Math.min(rate.rate / rateStats.max * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming Meetings */}
        <div className={`mt-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${themeColors.text}`}>
            Upcoming Central Bank Meetings (Next 30 Days)
          </h4>
          <div className="flex flex-wrap gap-2">
            {CENTRAL_BANK_RATES
              .filter(r => getDaysUntilMeeting(r.nextMeeting) <= 30 && getDaysUntilMeeting(r.nextMeeting) >= 0)
              .sort((a, b) => new Date(a.nextMeeting).getTime() - new Date(b.nextMeeting).getTime())
              .map(rate => {
                const days = getDaysUntilMeeting(rate.nextMeeting);
                return (
                  <div
                    key={rate.currency}
                    className={`px-3 py-1.5 rounded-lg text-xs border ${
                      days <= 7
                        ? isDarkMode
                          ? 'bg-amber-900/30 border-amber-600 text-amber-400'
                          : 'bg-amber-50 border-amber-300 text-amber-700'
                        : isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-300'
                          : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    {CURRENCY_FLAGS[rate.currency]} {rate.bankAbbrev}: {formatDate(rate.nextMeeting)}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentralBankRatesPanel;

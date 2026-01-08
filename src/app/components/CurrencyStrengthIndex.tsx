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
  HISTORICAL_RATES,
  type CurrencyCode
} from '../data/currencyHierarchyData';

interface CurrencyStrengthIndexProps {
  isDarkMode: boolean;
}

type TimePeriod = '1W' | '1M' | '3M' | '6M' | '1Y';

const CURRENCIES: CurrencyCode[] = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'];

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  CHF: '🇨🇭',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  NZD: '🇳🇿'
};

const CurrencyStrengthIndex: React.FC<CurrencyStrengthIndexProps> = ({ isDarkMode }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1M');
  const [sortBy, setSortBy] = useState<'strength' | 'name'>('strength');

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800/50' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    gridColor: isDarkMode ? '#374151' : '#e5e7eb'
  };

  const getDaysForPeriod = (period: TimePeriod): number => {
    switch (period) {
      case '1W': return 7;
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': return 365;
    }
  };

  // Calculate strength based on % change vs USD
  const strengthData = useMemo(() => {
    const days = getDaysForPeriod(selectedPeriod);
    
    const results = CURRENCIES.map(currency => {
      // Find the pair that includes this currency vs USD
      let pair = `${currency}/USD`;
      let inverted = false;
      
      if (!HISTORICAL_RATES[pair]) {
        pair = `USD/${currency}`;
        inverted = true;
      }
      
      const rates = HISTORICAL_RATES[pair]?.rates;
      if (!rates || rates.length === 0) {
        return { currency, strength: 0, change: 0 };
      }
      
      const recentRates = rates.slice(-days);
      if (recentRates.length < 2) {
        return { currency, strength: 0, change: 0 };
      }
      
      const startRate = recentRates[0].rate;
      const endRate = recentRates[recentRates.length - 1].rate;
      
      let change = ((endRate - startRate) / startRate) * 100;
      
      // If pair is USD/XXX, a higher rate means XXX weakened
      // If pair is XXX/USD, a higher rate means XXX strengthened
      if (inverted) {
        change = -change;
      }
      
      // Strength score: convert % change to a -100 to +100 scale
      // Typical currency moves are 0-10% over a month, so scale accordingly
      const scaleFactor = selectedPeriod === '1W' ? 5 : selectedPeriod === '1M' ? 2 : 1;
      const strength = Math.max(-100, Math.min(100, change * 10 * scaleFactor));
      
      return { currency, strength, change };
    });
    
    // Add USD as baseline (0)
    results.push({ currency: 'USD' as CurrencyCode, strength: 0, change: 0 });
    
    // Sort
    if (sortBy === 'strength') {
      results.sort((a, b) => b.strength - a.strength);
    } else {
      results.sort((a, b) => a.currency.localeCompare(b.currency));
    }
    
    return results;
  }, [selectedPeriod, sortBy]);

  const getStrengthColor = (strength: number) => {
    if (strength >= 50) return '#22c55e';
    if (strength >= 20) return '#84cc16';
    if (strength > -20) return '#6b7280';
    if (strength > -50) return '#f59e0b';
    return '#ef4444';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 50) return 'Very Strong';
    if (strength >= 20) return 'Strong';
    if (strength > -20) return 'Neutral';
    if (strength > -50) return 'Weak';
    return 'Very Weak';
  };

  const CustomTooltip = ({ active, payload }: { 
    active?: boolean; 
    payload?: Array<{ payload: { currency: string; strength: number; change: number } }>;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className={`p-3 rounded-lg shadow-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{CURRENCY_FLAGS[data.currency]}</span>
          <span className={`font-bold ${themeColors.text}`}>{data.currency}</span>
        </div>
        <div className={`text-lg font-bold`} style={{ color: getStrengthColor(data.strength) }}>
          {data.strength >= 0 ? '+' : ''}{data.strength.toFixed(1)}
        </div>
        <div className={`text-sm ${themeColors.textSecondary}`}>
          {getStrengthLabel(data.strength)}
        </div>
        <div className={`text-xs mt-1 ${themeColors.textTertiary}`}>
          vs USD: {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
        </div>
      </div>
    );
  };

  return (
    <div className={`rounded-xl overflow-hidden ${themeColors.cardBg}`}>
      <div className={`px-4 py-3 border-b ${themeColors.border}`}>
        <h3 className={`text-lg font-semibold ${themeColors.text}`}>
          Currency Strength Index
        </h3>
        <p className={`text-sm ${themeColors.textSecondary}`}>
          Relative currency performance based on exchange rate changes vs USD
        </p>
      </div>

      <div className="p-6">
        {/* Period Selection */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <h4 className={`text-sm font-semibold mb-2 ${themeColors.textSecondary}`}>
              TIME PERIOD
            </h4>
            <div className="flex gap-2">
              {(['1W', '1M', '3M', '6M', '1Y'] as TimePeriod[]).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedPeriod === period
                      ? isDarkMode
                        ? 'bg-blue-900/30 border-blue-600 text-blue-400'
                        : 'bg-blue-50 border-blue-300 text-blue-700'
                      : isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className={`text-sm font-semibold mb-2 ${themeColors.textSecondary}`}>
              SORT BY
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('strength')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  sortBy === 'strength'
                    ? isDarkMode
                      ? 'bg-blue-900/30 border-blue-600 text-blue-400'
                      : 'bg-blue-50 border-blue-300 text-blue-700'
                    : isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                Strength
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  sortBy === 'name'
                    ? isDarkMode
                      ? 'bg-blue-900/30 border-blue-600 text-blue-400'
                      : 'bg-blue-50 border-blue-300 text-blue-700'
                    : isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                Name
              </button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-72 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={strengthData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }}
                axisLine={{ stroke: themeColors.gridColor }}
                domain={[-100, 100]}
                tickFormatter={(value) => `${value}`}
              />
              <YAxis
                type="category"
                dataKey="currency"
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: themeColors.gridColor }}
                width={50}
                tickFormatter={(value) => `${CURRENCY_FLAGS[value] || ''} ${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={0} stroke={isDarkMode ? '#6b7280' : '#9ca3af'} />
              <Bar dataKey="strength" radius={[0, 4, 4, 0]}>
                {strengthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStrengthColor(entry.strength)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Currency Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {strengthData.map(data => (
            <div
              key={data.currency}
              className={`p-3 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CURRENCY_FLAGS[data.currency]}</span>
                  <span className={`font-bold ${themeColors.text}`}>{data.currency}</span>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{ color: getStrengthColor(data.strength) }}
                >
                  {data.strength >= 0 ? '+' : ''}{data.strength.toFixed(0)}
                </span>
              </div>
              
              {/* Strength Bar */}
              <div className="relative h-2 rounded-full overflow-hidden mb-1">
                <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <div
                  className="absolute top-0 h-full transition-all"
                  style={{
                    backgroundColor: getStrengthColor(data.strength),
                    left: data.strength >= 0 ? '50%' : `${50 + data.strength / 2}%`,
                    width: `${Math.abs(data.strength) / 2}%`
                  }}
                />
                <div className={`absolute top-0 left-1/2 w-0.5 h-full ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} />
              </div>
              
              <div className={`text-xs ${themeColors.textTertiary}`}>
                {getStrengthLabel(data.strength)}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className={`mt-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${themeColors.text}`}>
            Strength Scale
          </h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }} />
              <span className={themeColors.textSecondary}>Very Strong (+50 to +100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#84cc16' }} />
              <span className={themeColors.textSecondary}>Strong (+20 to +50)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#6b7280' }} />
              <span className={themeColors.textSecondary}>Neutral (-20 to +20)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }} />
              <span className={themeColors.textSecondary}>Weak (-50 to -20)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
              <span className={themeColors.textSecondary}>Very Weak (-100 to -50)</span>
            </div>
          </div>
          <p className={`mt-2 text-xs ${themeColors.textTertiary}`}>
            Strength is calculated based on percentage change against USD over the selected period.
            USD is shown as the baseline (0) since all comparisons are relative to it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurrencyStrengthIndex;

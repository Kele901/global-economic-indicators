'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  HISTORICAL_RATES,
  getHistoricalRates,
  type HistoricalRate
} from '../data/currencyHierarchyData';

interface HistoricalRateChartProps {
  isDarkMode: boolean;
}

type TimePeriod = '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';

const AVAILABLE_PAIRS = Object.keys(HISTORICAL_RATES);

const PAIR_COLORS: Record<string, string> = {
  'EUR/USD': '#3b82f6',
  'GBP/USD': '#8b5cf6',
  'USD/JPY': '#f59e0b',
  'USD/CHF': '#06b6d4',
  'AUD/USD': '#f97316',
  'USD/CAD': '#ec4899',
  'NZD/USD': '#22c55e',
  'EUR/GBP': '#ef4444',
  'EUR/JPY': '#6366f1',
  'GBP/JPY': '#14b8a6'
};

const HistoricalRateChart: React.FC<HistoricalRateChartProps> = ({ isDarkMode }) => {
  const [selectedPair, setSelectedPair] = useState<string>('EUR/USD');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1Y');
  const [showSMA, setShowSMA] = useState<boolean>(false);

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
      case '5Y': return 365 * 5;
    }
  };

  const filteredData = useMemo(() => {
    const allRates = getHistoricalRates(selectedPair);
    if (!allRates) return [];
    
    const days = getDaysForPeriod(selectedPeriod);
    return allRates.slice(-days);
  }, [selectedPair, selectedPeriod]);

  // Calculate SMA (20-day)
  const dataWithSMA = useMemo(() => {
    if (!showSMA) return filteredData.map(d => ({ ...d, sma: null }));
    
    const smaPeriod = 20;
    return filteredData.map((point, idx) => {
      if (idx < smaPeriod - 1) {
        return { ...point, sma: null };
      }
      const sum = filteredData
        .slice(idx - smaPeriod + 1, idx + 1)
        .reduce((acc, p) => acc + p.rate, 0);
      return { ...point, sma: sum / smaPeriod };
    });
  }, [filteredData, showSMA]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    const rates = filteredData.map(d => d.rate);
    const current = rates[rates.length - 1];
    const start = rates[0];
    const high = Math.max(...rates);
    const low = Math.min(...rates);
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    const change = current - start;
    const changePercent = (change / start) * 100;
    
    return { current, start, high, low, avg, change, changePercent };
  }, [filteredData]);

  const CustomTooltip = ({ active, payload, label }: { 
    active?: boolean; 
    payload?: Array<{ value: number; dataKey: string; color: string }>; 
    label?: string 
  }) => {
    if (!active || !payload || !payload.length) return null;

    const rate = payload.find(p => p.dataKey === 'rate');
    const sma = payload.find(p => p.dataKey === 'sma');

    return (
      <div className={`p-3 rounded-lg shadow-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`text-xs ${themeColors.textTertiary} mb-1`}>
          {label}
        </div>
        {rate && (
          <div className={`text-lg font-bold ${themeColors.text}`}>
            {rate.value.toFixed(4)}
          </div>
        )}
        {sma && sma.value && (
          <div className={`text-sm ${themeColors.textSecondary}`}>
            SMA(20): {(sma.value as number).toFixed(4)}
          </div>
        )}
      </div>
    );
  };

  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    if (selectedPeriod === '1W') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    if (selectedPeriod === '1M' || selectedPeriod === '3M') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  return (
    <div className={`rounded-xl overflow-hidden ${themeColors.cardBg}`}>
      <div className={`px-4 py-3 border-b ${themeColors.border}`}>
        <h3 className={`text-lg font-semibold ${themeColors.text}`}>
          Historical Exchange Rates
        </h3>
        <p className={`text-sm ${themeColors.textSecondary}`}>
          Exchange rate trends over time
        </p>
      </div>

      <div className="p-6">
        {/* Pair Selection */}
        <div className="mb-6">
          <h4 className={`text-sm font-semibold mb-2 ${themeColors.textSecondary}`}>
            SELECT CURRENCY PAIR
          </h4>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_PAIRS.map(pair => (
              <button
                key={pair}
                onClick={() => setSelectedPair(pair)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  selectedPair === pair
                    ? isDarkMode
                      ? 'bg-blue-900/30 border-blue-600 text-blue-400'
                      : 'bg-blue-50 border-blue-300 text-blue-700'
                    : isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: PAIR_COLORS[pair] }}
                />
                {pair}
              </button>
            ))}
          </div>
        </div>

        {/* Period Selection */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <h4 className={`text-sm font-semibold mb-2 ${themeColors.textSecondary}`}>
              TIME PERIOD
            </h4>
            <div className="flex gap-2">
              {(['1W', '1M', '3M', '6M', '1Y', '5Y'] as TimePeriod[]).map(period => (
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
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                showSMA
                  ? isDarkMode
                    ? 'bg-purple-900/30 border-purple-600 text-purple-400'
                    : 'bg-purple-50 border-purple-300 text-purple-700'
                  : isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Show SMA(20)
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`text-xs ${themeColors.textTertiary}`}>Current</div>
              <div className={`text-lg font-bold ${themeColors.text}`}>
                {stats.current.toFixed(4)}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`text-xs ${themeColors.textTertiary}`}>Change</div>
              <div className={`text-lg font-bold ${
                stats.change >= 0
                  ? isDarkMode ? 'text-green-400' : 'text-green-600'
                  : isDarkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(4)} ({stats.changePercent.toFixed(2)}%)
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`text-xs ${themeColors.textTertiary}`}>High</div>
              <div className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                {stats.high.toFixed(4)}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`text-xs ${themeColors.textTertiary}`}>Low</div>
              <div className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                {stats.low.toFixed(4)}
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`text-xs ${themeColors.textTertiary}`}>Average</div>
              <div className={`text-lg font-bold ${themeColors.text}`}>
                {stats.avg.toFixed(4)}
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataWithSMA}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
              <XAxis
                dataKey="date"
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }}
                axisLine={{ stroke: themeColors.gridColor }}
                tickFormatter={formatXAxis}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }}
                axisLine={{ stroke: themeColors.gridColor }}
                domain={['auto', 'auto']}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip content={<CustomTooltip />} />
              {stats && (
                <ReferenceLine
                  y={stats.avg}
                  stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
                  strokeDasharray="5 5"
                  label={{
                    value: 'Avg',
                    position: 'right',
                    fill: isDarkMode ? '#9ca3af' : '#6b7280',
                    fontSize: 10
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="rate"
                stroke={PAIR_COLORS[selectedPair] || '#3b82f6'}
                strokeWidth={2}
                dot={false}
                name="Rate"
              />
              {showSMA && (
                <Line
                  type="monotone"
                  dataKey="sma"
                  stroke="#a855f7"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="5 5"
                  name="SMA(20)"
                  connectNulls={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className={`mt-4 p-3 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-0.5"
                style={{ backgroundColor: PAIR_COLORS[selectedPair] }}
              />
              <span className={themeColors.textSecondary}>{selectedPair} Exchange Rate</span>
            </div>
            {showSMA && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-purple-500" style={{ background: 'repeating-linear-gradient(to right, #a855f7, #a855f7 3px, transparent 3px, transparent 6px)' }} />
                <span className={themeColors.textSecondary}>20-Day Simple Moving Average</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5" style={{ background: 'repeating-linear-gradient(to right, #6b7280, #6b7280 3px, transparent 3px, transparent 6px)' }} />
              <span className={themeColors.textSecondary}>Period Average</span>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className={`mt-4 text-xs ${themeColors.textTertiary}`}>
          Note: Historical data is simulated for demonstration purposes. In production, 
          this would connect to real exchange rate data feeds.
        </div>
      </div>
    </div>
  );
};

export default HistoricalRateChart;

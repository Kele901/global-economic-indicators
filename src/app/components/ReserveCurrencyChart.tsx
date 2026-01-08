'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  RESERVE_SHARES,
  getLatestReserveShares,
  type ReserveShare
} from '../data/currencyHierarchyData';

interface ReserveCurrencyChartProps {
  isDarkMode: boolean;
}

const CURRENCY_COLORS: Record<string, string> = {
  USD: '#3b82f6', // blue
  EUR: '#22c55e', // green
  JPY: '#f59e0b', // amber
  GBP: '#8b5cf6', // purple
  CNY: '#ef4444', // red
  CHF: '#06b6d4', // cyan
  AUD: '#f97316', // orange
  CAD: '#ec4899', // pink
  other: '#6b7280' // gray
};

const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  JPY: 'Japanese Yen',
  GBP: 'British Pound',
  CNY: 'Chinese Yuan',
  CHF: 'Swiss Franc',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  other: 'Other Currencies'
};

const ReserveCurrencyChart: React.FC<ReserveCurrencyChartProps> = ({ isDarkMode }) => {
  const [viewType, setViewType] = useState<'area' | 'pie'>('area');
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([
    'USD', 'EUR', 'JPY', 'GBP', 'CNY', 'CHF', 'AUD', 'CAD', 'other'
  ]);

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800/50' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    gridColor: isDarkMode ? '#374151' : '#e5e7eb',
    tooltipBg: isDarkMode ? '#1f2937' : '#ffffff'
  };

  const latestData = useMemo(() => getLatestReserveShares(), []);

  const pieData = useMemo(() => {
    return Object.entries(latestData)
      .filter(([key]) => key !== 'year' && selectedCurrencies.includes(key))
      .map(([key, value]) => ({
        name: CURRENCY_NAMES[key] || key,
        value: value as number,
        currency: key
      }))
      .sort((a, b) => b.value - a.value);
  }, [latestData, selectedCurrencies]);

  const toggleCurrency = (currency: string) => {
    if (selectedCurrencies.includes(currency)) {
      if (selectedCurrencies.length > 1) {
        setSelectedCurrencies(prev => prev.filter(c => c !== currency));
      }
    } else {
      setSelectedCurrencies(prev => [...prev, currency]);
    }
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className={`p-3 rounded-lg shadow-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`font-semibold mb-2 ${themeColors.text}`}>
          {label}
        </div>
        <div className="space-y-1">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: entry.color }}
                />
                <span className={themeColors.textSecondary}>
                  {CURRENCY_NAMES[entry.dataKey] || entry.dataKey}
                </span>
              </div>
              <span className={`font-medium ${themeColors.text}`}>
                {entry.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; currency: string } }> }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className={`p-3 rounded-lg shadow-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: CURRENCY_COLORS[data.currency] }}
          />
          <span className={`font-semibold ${themeColors.text}`}>{data.name}</span>
        </div>
        <div className={`text-lg font-bold ${themeColors.text} mt-1`}>
          {data.value.toFixed(1)}%
        </div>
      </div>
    );
  };

  // Calculate changes over different periods
  const calculateChange = (currency: keyof ReserveShare, yearsBack: number) => {
    const currentIdx = RESERVE_SHARES.length - 1;
    const pastIdx = Math.max(0, currentIdx - yearsBack);
    const current = RESERVE_SHARES[currentIdx][currency] as number;
    const past = RESERVE_SHARES[pastIdx][currency] as number;
    return current - past;
  };

  return (
    <div className={`rounded-xl overflow-hidden ${themeColors.cardBg}`}>
      <div className={`px-4 py-3 border-b ${themeColors.border}`}>
        <h3 className={`text-lg font-semibold ${themeColors.text}`}>
          Global Reserve Currency Shares
        </h3>
        <p className={`text-sm ${themeColors.textSecondary}`}>
          IMF COFER Data - Allocated Foreign Exchange Reserves by Currency
        </p>
      </div>

      <div className="p-6">
        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewType('area')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                viewType === 'area'
                  ? isDarkMode
                    ? 'bg-blue-900/30 border-blue-600 text-blue-400'
                    : 'bg-blue-50 border-blue-300 text-blue-700'
                  : isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              📈 Historical Trend
            </button>
            <button
              onClick={() => setViewType('pie')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                viewType === 'pie'
                  ? isDarkMode
                    ? 'bg-blue-900/30 border-blue-600 text-blue-400'
                    : 'bg-blue-50 border-blue-300 text-blue-700'
                  : isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              🥧 Current Distribution
            </button>
          </div>

          <div className={`text-xs ${themeColors.textTertiary}`}>
            Data: 2000-{latestData.year}
          </div>
        </div>

        {/* Currency Toggle */}
        <div className="mb-4">
          <h4 className={`text-sm font-semibold mb-2 ${themeColors.textSecondary}`}>
            SELECT CURRENCIES
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CURRENCY_COLORS).map(([currency, color]) => (
              <button
                key={currency}
                onClick={() => toggleCurrency(currency)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  selectedCurrencies.includes(currency)
                    ? isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-900'
                    : isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-500'
                      : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded ${!selectedCurrencies.includes(currency) ? 'opacity-30' : ''}`}
                  style={{ backgroundColor: color }}
                />
                {currency}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 mt-4">
          {viewType === 'area' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RESERVE_SHARES}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis
                  dataKey="year"
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: themeColors.gridColor }}
                />
                <YAxis
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: themeColors.gridColor }}
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedCurrencies.includes('USD') && (
                  <Area type="monotone" dataKey="USD" stackId="1" stroke={CURRENCY_COLORS.USD} fill={CURRENCY_COLORS.USD} fillOpacity={0.8} name="USD" />
                )}
                {selectedCurrencies.includes('EUR') && (
                  <Area type="monotone" dataKey="EUR" stackId="1" stroke={CURRENCY_COLORS.EUR} fill={CURRENCY_COLORS.EUR} fillOpacity={0.8} name="EUR" />
                )}
                {selectedCurrencies.includes('JPY') && (
                  <Area type="monotone" dataKey="JPY" stackId="1" stroke={CURRENCY_COLORS.JPY} fill={CURRENCY_COLORS.JPY} fillOpacity={0.8} name="JPY" />
                )}
                {selectedCurrencies.includes('GBP') && (
                  <Area type="monotone" dataKey="GBP" stackId="1" stroke={CURRENCY_COLORS.GBP} fill={CURRENCY_COLORS.GBP} fillOpacity={0.8} name="GBP" />
                )}
                {selectedCurrencies.includes('CNY') && (
                  <Area type="monotone" dataKey="CNY" stackId="1" stroke={CURRENCY_COLORS.CNY} fill={CURRENCY_COLORS.CNY} fillOpacity={0.8} name="CNY" />
                )}
                {selectedCurrencies.includes('CHF') && (
                  <Area type="monotone" dataKey="CHF" stackId="1" stroke={CURRENCY_COLORS.CHF} fill={CURRENCY_COLORS.CHF} fillOpacity={0.8} name="CHF" />
                )}
                {selectedCurrencies.includes('AUD') && (
                  <Area type="monotone" dataKey="AUD" stackId="1" stroke={CURRENCY_COLORS.AUD} fill={CURRENCY_COLORS.AUD} fillOpacity={0.8} name="AUD" />
                )}
                {selectedCurrencies.includes('CAD') && (
                  <Area type="monotone" dataKey="CAD" stackId="1" stroke={CURRENCY_COLORS.CAD} fill={CURRENCY_COLORS.CAD} fillOpacity={0.8} name="CAD" />
                )}
                {selectedCurrencies.includes('other') && (
                  <Area type="monotone" dataKey="other" stackId="1" stroke={CURRENCY_COLORS.other} fill={CURRENCY_COLORS.other} fillOpacity={0.8} name="Other" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name.split(' ')[0]} ${value.toFixed(1)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CURRENCY_COLORS[entry.currency]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Current Shares and Changes */}
        <div className={`mt-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${themeColors.text}`}>
            Current Reserve Shares ({latestData.year})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(latestData)
              .filter(([key]) => key !== 'year')
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([currency, value]) => {
                const change5Y = calculateChange(currency as keyof ReserveShare, 5);
                const change10Y = calculateChange(currency as keyof ReserveShare, 10);
                const isPositive5Y = change5Y > 0;
                
                return (
                  <div
                    key={currency}
                    className={`p-3 rounded-lg border ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: CURRENCY_COLORS[currency] }}
                      />
                      <span className={`text-sm font-semibold ${themeColors.text}`}>
                        {currency}
                      </span>
                    </div>
                    <div className={`text-xl font-bold ${themeColors.text}`}>
                      {(value as number).toFixed(1)}%
                    </div>
                    <div className="flex gap-2 mt-1 text-xs">
                      <span className={isPositive5Y
                        ? isDarkMode ? 'text-green-400' : 'text-green-600'
                        : isDarkMode ? 'text-red-400' : 'text-red-600'
                      }>
                        {isPositive5Y ? '+' : ''}{change5Y.toFixed(1)}% (5Y)
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Key Insights */}
        <div className={`mt-4 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-2 ${themeColors.text}`}>
            Key Trends
          </h4>
          <div className={`text-sm ${themeColors.textSecondary} space-y-1`}>
            <p>• USD dominance has declined from 71.1% (2000) to {latestData.USD}% ({latestData.year})</p>
            <p>• CNY entered IMF SDR basket in 2016, now at {latestData.CNY}% of reserves</p>
            <p>• EUR share stabilized around 20% after eurozone debt crisis</p>
            <p>• AUD and CAD emerged as reserve currencies post-2012</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReserveCurrencyChart;

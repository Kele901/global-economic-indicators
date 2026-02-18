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
  ReferenceLine,
  Legend
} from 'recharts';
import { CountryData } from '../services/worldbank';
import { techChartColors, formatNumber } from '../data/technologyIndicators';

interface IPTradeBalanceChartProps {
  isDarkMode: boolean;
  ipReceipts: CountryData[];
  ipPayments: CountryData[];
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

interface BalanceDataPoint {
  country: string;
  receipts: number;
  payments: number;
  balance: number;
  isPositive: boolean;
}

const IPTradeBalanceChart: React.FC<IPTradeBalanceChartProps> = ({
  isDarkMode,
  ipReceipts,
  ipPayments,
  selectedCountries,
  onCountryChange
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2021);
  const [viewMode, setViewMode] = useState<'balance' | 'breakdown'>('balance');
  const [sortBy, setSortBy] = useState<'balance' | 'receipts' | 'payments'>('balance');

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    gridColor: isDarkMode ? '#374151' : '#E5E7EB',
    axisColor: isDarkMode ? '#9CA3AF' : '#6B7280',
    positiveColor: isDarkMode ? '#10B981' : '#059669',
    negativeColor: isDarkMode ? '#EF4444' : '#DC2626'
  };

  const availableYears = useMemo(() => {
    if (!ipReceipts?.length) return [];
    return ipReceipts.map(d => d.year).filter(y => y >= 2000).sort((a, b) => b - a);
  }, [ipReceipts]);

  const balanceData = useMemo(() => {
    if (!ipReceipts?.length || !ipPayments?.length) return [];

    const receiptsYear = ipReceipts.find(d => d.year === selectedYear);
    const paymentsYear = ipPayments.find(d => d.year === selectedYear);

    if (!receiptsYear || !paymentsYear) return [];

    const allCountries = new Set<string>();
    Object.keys(receiptsYear).forEach(k => k !== 'year' && allCountries.add(k));
    Object.keys(paymentsYear).forEach(k => k !== 'year' && allCountries.add(k));

    const data: BalanceDataPoint[] = [];

    allCountries.forEach(country => {
      const receipts = (receiptsYear[country] as number) || 0;
      const payments = (paymentsYear[country] as number) || 0;

      if (receipts > 0 || payments > 0) {
        const balance = receipts - payments;
        data.push({
          country,
          receipts,
          payments,
          balance,
          isPositive: balance >= 0
        });
      }
    });

    return data.sort((a, b) => {
      switch (sortBy) {
        case 'receipts': return b.receipts - a.receipts;
        case 'payments': return b.payments - a.payments;
        default: return b.balance - a.balance;
      }
    });
  }, [ipReceipts, ipPayments, selectedYear, sortBy]);

  const filteredData = useMemo(() => {
    if (selectedCountries.length === 0) return balanceData.slice(0, 20);
    return balanceData.filter(d => selectedCountries.includes(d.country));
  }, [balanceData, selectedCountries]);

  const totals = useMemo(() => {
    const surplus = balanceData.filter(d => d.isPositive);
    const deficit = balanceData.filter(d => !d.isPositive);
    return {
      surplusCount: surplus.length,
      deficitCount: deficit.length,
      totalReceipts: balanceData.reduce((sum, d) => sum + d.receipts, 0),
      totalPayments: balanceData.reduce((sum, d) => sum + d.payments, 0),
      largestSurplus: surplus[0]?.country || 'N/A',
      largestDeficit: deficit[deficit.length - 1]?.country || 'N/A'
    };
  }, [balanceData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0]?.payload as BalanceDataPoint;
    if (!data) return null;

    return (
      <div className={`p-3 rounded-lg shadow-lg border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <p className="font-semibold mb-2" style={{ color: techChartColors[data.country] || '#6B7280' }}>
          {data.country}
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-green-500">
            IP Receipts: <span className="font-medium">${formatNumber(data.receipts / 1e9)}B</span>
          </p>
          <p className="text-red-500">
            IP Payments: <span className="font-medium">${formatNumber(data.payments / 1e9)}B</span>
          </p>
          <p className={`pt-1 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} ${
            data.isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            Net Balance: <span className="font-medium">
              {data.isPositive ? '+' : ''}${formatNumber(data.balance / 1e9)}B
            </span>
          </p>
        </div>
      </div>
    );
  };

  const allCountries = useMemo(() => {
    return balanceData.map(d => d.country);
  }, [balanceData]);

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      onCountryChange(selectedCountries.filter(c => c !== country));
    } else if (selectedCountries.length < 20) {
      onCountryChange([...selectedCountries, country]);
    }
  };

  return (
    <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${themeColors.text}`}>
            IP Trade Balance
          </h3>
          <p className={`text-sm ${themeColors.textSecondary}`}>
            Intellectual Property Receipts vs Payments ({selectedYear})
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            } border`}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'balance' | 'breakdown')}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            } border`}
          >
            <option value="balance">Net Balance</option>
            <option value="breakdown">Receipts vs Payments</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'balance' | 'receipts' | 'payments')}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'
            } border`}
          >
            <option value="balance">Sort by Balance</option>
            <option value="receipts">Sort by Receipts</option>
            <option value="payments">Sort by Payments</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'} border ${isDarkMode ? 'border-green-800' : 'border-green-200'}`}>
          <p className={`text-xs ${themeColors.textTertiary}`}>IP Surplus Countries</p>
          <p className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
            {totals.surplusCount}
          </p>
          <p className={`text-xs ${themeColors.textTertiary}`}>Largest: {totals.largestSurplus}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'} border ${isDarkMode ? 'border-red-800' : 'border-red-200'}`}>
          <p className={`text-xs ${themeColors.textTertiary}`}>IP Deficit Countries</p>
          <p className={`text-xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
            {totals.deficitCount}
          </p>
          <p className={`text-xs ${themeColors.textTertiary}`}>Largest: {totals.largestDeficit}</p>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}>
          <p className={`text-xs ${themeColors.textTertiary}`}>Global IP Receipts</p>
          <p className={`text-xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            ${formatNumber(totals.totalReceipts / 1e9)}B
          </p>
        </div>
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'} border ${isDarkMode ? 'border-purple-800' : 'border-purple-200'}`}>
          <p className={`text-xs ${themeColors.textTertiary}`}>Global IP Payments</p>
          <p className={`text-xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            ${formatNumber(totals.totalPayments / 1e9)}B
          </p>
        </div>
      </div>

      {/* Country Selection */}
      <div className="mb-4">
        <p className={`text-sm ${themeColors.textTertiary} mb-2`}>
          Filter countries (showing {filteredData.length}):
        </p>
        <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
          {allCountries.slice(0, 25).map(country => (
            <button
              key={country}
              onClick={() => toggleCountry(country)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCountries.includes(country)
                  ? 'text-white'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={selectedCountries.includes(country) ? {
                backgroundColor: techChartColors[country] || '#6B7280'
              } : {}}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'balance' ? (
            <BarChart
              data={filteredData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} horizontal={true} vertical={false} />
              <XAxis
                type="number"
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 11 }}
                tickFormatter={(value) => `$${(value / 1e9).toFixed(0)}B`}
              />
              <YAxis
                type="category"
                dataKey="country"
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 11 }}
                width={75}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={0} stroke={themeColors.axisColor} strokeWidth={2} />
              <Bar dataKey="balance" name="Net Balance" radius={[0, 4, 4, 0]}>
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isPositive ? themeColors.positiveColor : themeColors.negativeColor}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={filteredData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
              <XAxis
                type="number"
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 11 }}
                tickFormatter={(value) => `$${(value / 1e9).toFixed(0)}B`}
              />
              <YAxis
                type="category"
                dataKey="country"
                stroke={themeColors.axisColor}
                tick={{ fill: themeColors.axisColor, fontSize: 11 }}
                width={75}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="receipts" name="IP Receipts" fill={themeColors.positiveColor} radius={[0, 4, 4, 0]} />
              <Bar dataKey="payments" name="IP Payments" fill={themeColors.negativeColor} radius={[0, 4, 4, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend/Explanation */}
      <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <p className={`text-xs ${themeColors.textTertiary}`}>
          <strong>IP Receipts:</strong> Income from licensing patents, trademarks, copyrights, and other intellectual property to foreign entities. 
          <strong className="ml-2">IP Payments:</strong> Costs paid to foreign entities for using their intellectual property.
          <strong className="ml-2">Positive balance</strong> indicates a country is a net IP exporter (innovation leader).
        </p>
      </div>
    </div>
  );
};

export default IPTradeBalanceChart;

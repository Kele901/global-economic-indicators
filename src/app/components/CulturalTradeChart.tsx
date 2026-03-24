'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Line, Cell,
} from 'recharts';
import { CountryData } from '../services/worldbank';
import { culturalChartColors, formatCurrency, ipReceiptsFallbackData, ipPaymentsFallbackData } from '../data/culturalMetrics';

interface CulturalTradeChartProps {
  isDarkMode: boolean;
  ipReceipts: CountryData[];
  ipPayments: CountryData[];
  culturalGoodsImports: Record<string, number>;
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

type ViewMode = 'ipFlows' | 'tradeBalance' | 'goodsImports';

const CulturalTradeChart: React.FC<CulturalTradeChartProps> = ({
  isDarkMode,
  ipReceipts,
  ipPayments,
  culturalGoodsImports,
  selectedCountries,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('ipFlows');

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

  const balancePositive = isDarkMode ? '#10B981' : '#059669';
  const balanceNegative = isDarkMode ? '#EF4444' : '#DC2626';

  const ipFlowsData = useMemo(() => {
    const liveReceipts = ipReceipts || [];
    const livePayments = ipPayments || [];
    const usingFallback = liveReceipts.length === 0 && livePayments.length === 0;
    const safeReceipts = liveReceipts.length > 0 ? liveReceipts : ipReceiptsFallbackData as CountryData[];
    const safePayments = livePayments.length > 0 ? livePayments : ipPaymentsFallbackData as CountryData[];
    const scale = usingFallback ? 1e9 : 1;
    const receiptYearSet = new Set(safeReceipts.map(d => d.year));
    const paymentYearSet = new Set(safePayments.map(d => d.year));
    const allYears = new Set<number>([...receiptYearSet, ...paymentYearSet]);
    const sortedYears = Array.from(allYears).sort((a, b) => a - b).slice(-20);
    const countries = selectedCountries.slice(0, 6);

    return sortedYears
      .map(year => {
        const receiptsRow = safeReceipts.find(d => d.year === year);
        const paymentsRow = safePayments.find(d => d.year === year);
        const entry: Record<string, number | string> = { year };
        countries.forEach(country => {
          const rv = receiptsRow?.[country];
          const pv = paymentsRow?.[country];
          if (rv !== undefined && rv !== null && typeof rv === 'number') {
            entry[`${country}_receipts`] = rv * scale;
          }
          if (pv !== undefined && pv !== null && typeof pv === 'number') {
            entry[`${country}_payments`] = pv * scale;
          }
        });
        return entry;
      })
      .filter(entry => Object.keys(entry).length > 1);
  }, [ipReceipts, ipPayments, selectedCountries]);

  const tradeBalanceData = useMemo(() => {
    const liveReceipts2 = ipReceipts || [];
    const livePayments2 = ipPayments || [];
    const usingFallback2 = liveReceipts2.length === 0 && livePayments2.length === 0;
    const safeReceipts = liveReceipts2.length > 0 ? liveReceipts2 : ipReceiptsFallbackData as CountryData[];
    const safePayments = livePayments2.length > 0 ? livePayments2 : ipPaymentsFallbackData as CountryData[];
    const scale = usingFallback2 ? 1e9 : 1;
    const receiptYears = new Set(safeReceipts.map(d => d.year));
    const commonYears = safePayments
      .map(d => d.year)
      .filter(y => receiptYears.has(y))
      .sort((a, b) => b - a);
    const latestYear = commonYears[0];
    if (latestYear === undefined) return [];

    const receiptsRow = safeReceipts.find(d => d.year === latestYear);
    const paymentsRow = safePayments.find(d => d.year === latestYear);
    if (!receiptsRow || !paymentsRow) return [];

    return selectedCountries
      .map(country => {
        const r = receiptsRow[country];
        const p = paymentsRow[country];
        const receipts = typeof r === 'number' ? r * scale : NaN;
        const payments = typeof p === 'number' ? p * scale : NaN;
        if (Number.isNaN(receipts) || Number.isNaN(payments)) return null;
        const net = receipts - payments;
        return { country, net, year: latestYear };
      })
      .filter((row): row is { country: string; net: number; year: number } => row !== null)
      .sort((a, b) => b.net - a.net);
  }, [ipReceipts, ipPayments, selectedCountries]);

  const goodsImportsData = useMemo(() => {
    return selectedCountries
      .filter(c => culturalGoodsImports[c] !== undefined && culturalGoodsImports[c] !== null)
      .map(country => ({
        country,
        value: culturalGoodsImports[country],
      }))
      .sort((a, b) => b.value - a.value);
  }, [culturalGoodsImports, selectedCountries]);

  return (
    <div className="space-y-6">
      <div
        className={`p-4 rounded-lg border ${
          isDarkMode
            ? 'bg-gray-800 border-teal-500 text-teal-400'
            : 'bg-white border-teal-400 text-teal-700'
        }`}
      >
        <h3 className="font-semibold">Cultural & IP Trade</h3>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Intellectual property receipts and payments over time, net creative IP balance, and cultural
          goods imports across selected economies.
        </p>
      </div>

      <div
        className={`flex flex-wrap gap-2 p-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
      >
        {(
          [
            { id: 'ipFlows' as ViewMode, label: 'IP Receipts vs Payments' },
            { id: 'tradeBalance' as ViewMode, label: 'Creative Trade Balance' },
            { id: 'goodsImports' as ViewMode, label: 'Cultural Goods Imports' },
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setViewMode(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === tab.id
                ? isDarkMode
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-900 shadow'
                : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {viewMode === 'ipFlows' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>
            IP Receipts vs Payments
          </h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>
            World Bank BPM6 — current USD
          </p>
          {ipFlowsData.length > 0 ? (
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={ipFlowsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                  <XAxis dataKey="year" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: themeColors.tickColor, fontSize: 12 }}
                    tickFormatter={(v: number) => formatCurrency(v)}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  {selectedCountries.slice(0, 6).map(country => {
                    const hasReceipts = ipFlowsData.some(d => d[`${country}_receipts`] !== undefined);
                    const hasPayments = ipFlowsData.some(d => d[`${country}_payments`] !== undefined);
                    if (!hasReceipts && !hasPayments) return null;
                    const stroke = culturalChartColors[country] || '#14B8A6';
                    return (
                      <React.Fragment key={country}>
                        {hasReceipts && (
                          <Line
                            type="monotone"
                            dataKey={`${country}_receipts`}
                            name={`${country} Receipts`}
                            stroke={stroke}
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                          />
                        )}
                        {hasPayments && (
                          <Line
                            type="monotone"
                            dataKey={`${country}_payments`}
                            name={`${country} Payments`}
                            stroke={stroke}
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
          ) : (
            <div
              className={`w-full h-[300px] flex flex-col items-center justify-center rounded-lg ${
                isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
              }`}
            >
              <p className={`text-sm ${themeColors.textSecondary}`}>
                IP receipts and payments data is loading or unavailable for the selected countries.
              </p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Try selecting different countries or refresh the page.
              </p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'tradeBalance' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>
            Creative Trade Balance
          </h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>
            Net IP balance (receipts − payments), latest common year
            {tradeBalanceData[0] ? ` (${tradeBalanceData[0].year})` : ''}
          </p>
          {tradeBalanceData.length > 0 ? (
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tradeBalanceData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                  <XAxis
                    dataKey="country"
                    tick={{ fill: themeColors.tickColor, fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis
                    tick={{ fill: themeColors.tickColor, fontSize: 12 }}
                    tickFormatter={(v: number) => formatCurrency(v)}
                    label={{
                      value: 'Net (USD)',
                      angle: -90,
                      position: 'insideLeft',
                      fill: themeColors.tickColor,
                    }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="net" name="Net IP balance" radius={[4, 4, 0, 0]}>
                    {tradeBalanceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.net >= 0 ? balancePositive : balanceNegative}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div
              className={`w-full h-[300px] flex flex-col items-center justify-center rounded-lg ${
                isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
              }`}
            >
              <p className={`text-sm ${themeColors.textSecondary}`}>
                No overlapping IP receipts and payments year found for the selected countries.
              </p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'goodsImports' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>
            Cultural Goods Imports
          </h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>
            Estimated cultural goods imports (billions USD)
          </p>
          {goodsImportsData.length > 0 ? (
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={goodsImportsData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                  <XAxis type="number" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                  <YAxis
                    dataKey="country"
                    type="category"
                    tick={{ fill: themeColors.tickColor, fontSize: 12 }}
                    width={75}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => `$${Number(value).toFixed(1)}B`}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {goodsImportsData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={culturalChartColors[entry.country] || '#14B8A6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div
              className={`w-full h-[300px] flex flex-col items-center justify-center rounded-lg ${
                isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
              }`}
            >
              <p className={`text-sm ${themeColors.textSecondary}`}>
                No cultural goods import values for the selected countries.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CulturalTradeChart;

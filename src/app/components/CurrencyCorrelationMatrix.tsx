'use client';

import React, { useState, useMemo } from 'react';
import {
  CURRENCY_CORRELATIONS,
  getCorrelation,
  type CurrencyCode
} from '../data/currencyHierarchyData';

interface CurrencyCorrelationMatrixProps {
  isDarkMode: boolean;
}

const MAJOR_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'];

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  CHF: '🇨🇭',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  NZD: '🇳🇿',
  SEK: '🇸🇪',
  NOK: '🇳🇴',
  MXN: '🇲🇽',
  BRL: '🇧🇷',
  ZAR: '🇿🇦',
  TRY: '🇹🇷'
};

const CurrencyCorrelationMatrix: React.FC<CurrencyCorrelationMatrixProps> = ({ isDarkMode }) => {
  const [selectedPair, setSelectedPair] = useState<{ c1: CurrencyCode; c2: CurrencyCode } | null>(null);
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800/50' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  // Get unique currencies from correlations
  const allCurrencies = useMemo(() => {
    const currencies = new Set<CurrencyCode>();
    CURRENCY_CORRELATIONS.forEach(c => {
      currencies.add(c.currency1);
      currencies.add(c.currency2);
    });
    return Array.from(currencies).sort();
  }, []);

  const displayCurrencies = showAllCurrencies
    ? allCurrencies
    : MAJOR_CURRENCIES.filter(c => allCurrencies.includes(c));

  // Build correlation matrix
  const correlationMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number | null>> = {};
    
    displayCurrencies.forEach(c1 => {
      matrix[c1] = {};
      displayCurrencies.forEach(c2 => {
        if (c1 === c2) {
          matrix[c1][c2] = 1; // Self-correlation
        } else {
          const corr = getCorrelation(c1, c2);
          matrix[c1][c2] = corr !== undefined ? corr : null;
        }
      });
    });
    
    return matrix;
  }, [displayCurrencies]);

  const getCorrelationColor = (corr: number | null): string => {
    if (corr === null) return isDarkMode ? 'bg-gray-800' : 'bg-gray-100';
    if (corr === 1) return isDarkMode ? 'bg-gray-700' : 'bg-gray-200';
    
    // Color scale from red (-1) through gray (0) to green (+1)
    if (corr >= 0.7) return isDarkMode ? 'bg-green-700' : 'bg-green-200';
    if (corr >= 0.4) return isDarkMode ? 'bg-green-800' : 'bg-green-100';
    if (corr >= 0.1) return isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-50';
    if (corr >= -0.1) return isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
    if (corr >= -0.4) return isDarkMode ? 'bg-amber-900/50' : 'bg-amber-50';
    if (corr >= -0.7) return isDarkMode ? 'bg-red-900/50' : 'bg-red-100';
    return isDarkMode ? 'bg-red-800' : 'bg-red-200';
  };

  const getCorrelationTextColor = (corr: number | null): string => {
    if (corr === null) return themeColors.textTertiary;
    if (corr === 1) return themeColors.textTertiary;
    
    if (corr >= 0.7) return isDarkMode ? 'text-green-300' : 'text-green-700';
    if (corr >= 0.4) return isDarkMode ? 'text-green-400' : 'text-green-600';
    if (corr >= 0.1) return isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
    if (corr >= -0.1) return themeColors.textSecondary;
    if (corr >= -0.4) return isDarkMode ? 'text-amber-400' : 'text-amber-600';
    if (corr >= -0.7) return isDarkMode ? 'text-red-400' : 'text-red-600';
    return isDarkMode ? 'text-red-300' : 'text-red-700';
  };

  const getCorrelationDescription = (corr: number): string => {
    if (corr >= 0.7) return 'Strong positive correlation';
    if (corr >= 0.4) return 'Moderate positive correlation';
    if (corr >= 0.1) return 'Weak positive correlation';
    if (corr >= -0.1) return 'No significant correlation';
    if (corr >= -0.4) return 'Weak negative correlation';
    if (corr >= -0.7) return 'Moderate negative correlation';
    return 'Strong negative correlation';
  };

  // Find highest and lowest correlations
  const extremeCorrelations = useMemo(() => {
    let highest = { c1: '', c2: '', corr: -2 };
    let lowest = { c1: '', c2: '', corr: 2 };
    
    CURRENCY_CORRELATIONS.forEach(c => {
      if (c.correlation > highest.corr) {
        highest = { c1: c.currency1, c2: c.currency2, corr: c.correlation };
      }
      if (c.correlation < lowest.corr) {
        lowest = { c1: c.currency1, c2: c.currency2, corr: c.correlation };
      }
    });
    
    return { highest, lowest };
  }, []);

  return (
    <div className={`rounded-xl overflow-hidden ${themeColors.cardBg}`}>
      <div className={`px-4 py-3 border-b ${themeColors.border}`}>
        <h3 className={`text-lg font-semibold ${themeColors.text}`}>
          Currency Correlation Matrix
        </h3>
        <p className={`text-sm ${themeColors.textSecondary}`}>
          1-year correlation between currency pairs (vs USD)
        </p>
      </div>

      <div className="p-6">
        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowAllCurrencies(!showAllCurrencies)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              showAllCurrencies
                ? isDarkMode
                  ? 'bg-blue-900/30 border-blue-600 text-blue-400'
                  : 'bg-blue-50 border-blue-300 text-blue-700'
                : isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
            }`}
          >
            {showAllCurrencies ? 'Show Major Only' : 'Show All Currencies'}
          </button>
        </div>

        {/* Correlation Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className={`p-2 text-xs font-medium ${themeColors.textTertiary}`} />
                {displayCurrencies.map(currency => (
                  <th
                    key={currency}
                    className={`p-2 text-xs font-medium ${themeColors.text}`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{CURRENCY_FLAGS[currency]}</span>
                      <span>{currency}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayCurrencies.map(row => (
                <tr key={row}>
                  <td className={`p-2 text-xs font-medium ${themeColors.text}`}>
                    <div className="flex items-center gap-1">
                      <span>{CURRENCY_FLAGS[row]}</span>
                      <span>{row}</span>
                    </div>
                  </td>
                  {displayCurrencies.map(col => {
                    const corr = correlationMatrix[row]?.[col];
                    const isSelected = selectedPair?.c1 === row && selectedPair?.c2 === col;
                    
                    return (
                      <td
                        key={col}
                        onClick={() => corr !== null && corr !== 1 && setSelectedPair({ c1: row, c2: col })}
                        className={`p-1 cursor-pointer transition-all ${
                          isSelected ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div
                          className={`w-10 h-10 flex items-center justify-center rounded text-xs font-medium ${
                            getCorrelationColor(corr)
                          } ${getCorrelationTextColor(corr)}`}
                        >
                          {corr !== null ? (corr === 1 ? '—' : corr.toFixed(2)) : '—'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Pair Details */}
        {selectedPair && correlationMatrix[selectedPair.c1]?.[selectedPair.c2] !== null && (
          <div className={`mt-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{CURRENCY_FLAGS[selectedPair.c1]}</span>
              <span className={`text-lg font-bold ${themeColors.text}`}>{selectedPair.c1}</span>
              <span className={themeColors.textTertiary}>↔</span>
              <span className="text-2xl">{CURRENCY_FLAGS[selectedPair.c2]}</span>
              <span className={`text-lg font-bold ${themeColors.text}`}>{selectedPair.c2}</span>
            </div>
            <div className={`text-2xl font-bold ${getCorrelationTextColor(correlationMatrix[selectedPair.c1][selectedPair.c2])}`}>
              {correlationMatrix[selectedPair.c1][selectedPair.c2]?.toFixed(2)}
            </div>
            <div className={`text-sm ${themeColors.textSecondary}`}>
              {getCorrelationDescription(correlationMatrix[selectedPair.c1][selectedPair.c2] || 0)}
            </div>
          </div>
        )}

        {/* Correlation Legend */}
        <div className={`mt-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${themeColors.text}`}>
            Correlation Scale
          </h4>
          <div className="flex items-center gap-1">
            <span className={`text-xs ${themeColors.textTertiary}`}>-1.0</span>
            <div className="flex-1 flex">
              <div className={`flex-1 h-4 ${isDarkMode ? 'bg-red-800' : 'bg-red-200'}`} />
              <div className={`flex-1 h-4 ${isDarkMode ? 'bg-red-900/50' : 'bg-red-100'}`} />
              <div className={`flex-1 h-4 ${isDarkMode ? 'bg-amber-900/50' : 'bg-amber-50'}`} />
              <div className={`flex-1 h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
              <div className={`flex-1 h-4 ${isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-50'}`} />
              <div className={`flex-1 h-4 ${isDarkMode ? 'bg-green-800' : 'bg-green-100'}`} />
              <div className={`flex-1 h-4 ${isDarkMode ? 'bg-green-700' : 'bg-green-200'}`} />
            </div>
            <span className={`text-xs ${themeColors.textTertiary}`}>+1.0</span>
          </div>
          <div className="flex justify-between mt-1 text-xs">
            <span className={isDarkMode ? 'text-red-400' : 'text-red-600'}>Strong Negative</span>
            <span className={themeColors.textTertiary}>Neutral</span>
            <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>Strong Positive</span>
          </div>
        </div>

        {/* Key Correlations */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              Highest Positive Correlation
            </h4>
            <div className="flex items-center gap-2">
              <span>{CURRENCY_FLAGS[extremeCorrelations.highest.c1]}</span>
              <span className={themeColors.text}>{extremeCorrelations.highest.c1}</span>
              <span className={themeColors.textTertiary}>↔</span>
              <span>{CURRENCY_FLAGS[extremeCorrelations.highest.c2]}</span>
              <span className={themeColors.text}>{extremeCorrelations.highest.c2}</span>
              <span className={`ml-auto font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                {extremeCorrelations.highest.corr.toFixed(2)}
              </span>
            </div>
            <p className={`text-xs mt-1 ${themeColors.textTertiary}`}>
              These currencies tend to move in the same direction
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              Highest Negative Correlation
            </h4>
            <div className="flex items-center gap-2">
              <span>{CURRENCY_FLAGS[extremeCorrelations.lowest.c1]}</span>
              <span className={themeColors.text}>{extremeCorrelations.lowest.c1}</span>
              <span className={themeColors.textTertiary}>↔</span>
              <span>{CURRENCY_FLAGS[extremeCorrelations.lowest.c2]}</span>
              <span className={themeColors.text}>{extremeCorrelations.lowest.c2}</span>
              <span className={`ml-auto font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                {extremeCorrelations.lowest.corr.toFixed(2)}
              </span>
            </div>
            <p className={`text-xs mt-1 ${themeColors.textTertiary}`}>
              These currencies tend to move in opposite directions
            </p>
          </div>
        </div>

        {/* Notes */}
        <div className={`mt-4 text-xs ${themeColors.textTertiary}`}>
          <p>• Click on any cell to see detailed correlation information</p>
          <p>• Correlations are based on 1-year daily returns vs USD</p>
          <p>• Correlations can change over time and during market stress</p>
        </div>
      </div>
    </div>
  );
};

export default CurrencyCorrelationMatrix;

'use client';

import React, { useState, useMemo } from 'react';
import {
  CURRENCY_REGIMES,
  type CurrencyCode,
  type RegimeType,
  type CurrencyRegime
} from '../data/currencyHierarchyData';

interface CurrencyRegimeInfoProps {
  isDarkMode: boolean;
  selectedCurrency?: CurrencyCode;
}

const REGIME_TYPE_INFO: Record<RegimeType, { label: string; color: string; bgColor: string; description: string }> = {
  free_float: {
    label: 'Free Float',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Exchange rate determined entirely by market forces'
  },
  managed_float: {
    label: 'Managed Float',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Market-determined with central bank intervention'
  },
  pegged: {
    label: 'Pegged',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'Fixed exchange rate to another currency'
  },
  currency_board: {
    label: 'Currency Board',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    description: 'Fixed rate with full foreign reserve backing'
  },
  dollarized: {
    label: 'Dollarized',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    description: 'Uses foreign currency as legal tender'
  }
};

const REGIME_TYPE_INFO_DARK: Record<RegimeType, { color: string; bgColor: string }> = {
  free_float: { color: 'text-green-400', bgColor: 'bg-green-900/30 border-green-700' },
  managed_float: { color: 'text-blue-400', bgColor: 'bg-blue-900/30 border-blue-700' },
  pegged: { color: 'text-amber-400', bgColor: 'bg-amber-900/30 border-amber-700' },
  currency_board: { color: 'text-purple-400', bgColor: 'bg-purple-900/30 border-purple-700' },
  dollarized: { color: 'text-red-400', bgColor: 'bg-red-900/30 border-red-700' }
};

const CurrencyRegimeInfo: React.FC<CurrencyRegimeInfoProps> = ({
  isDarkMode,
  selectedCurrency
}) => {
  const [filterType, setFilterType] = useState<RegimeType | 'all'>('all');
  const [expandedCurrency, setExpandedCurrency] = useState<CurrencyCode | null>(
    selectedCurrency || null
  );

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800/50' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  const filteredRegimes = useMemo(() => {
    if (filterType === 'all') return CURRENCY_REGIMES;
    return CURRENCY_REGIMES.filter(regime => regime.type === filterType);
  }, [filterType]);

  const regimeStats = useMemo(() => {
    const stats: Record<RegimeType, number> = {
      free_float: 0,
      managed_float: 0,
      pegged: 0,
      currency_board: 0,
      dollarized: 0
    };
    CURRENCY_REGIMES.forEach(regime => {
      stats[regime.type]++;
    });
    return stats;
  }, []);

  const getRegimeStyle = (type: RegimeType) => {
    const info = isDarkMode ? REGIME_TYPE_INFO_DARK[type] : REGIME_TYPE_INFO[type];
    return info;
  };

  const getFlexibilityBar = (flexibility: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(level => (
          <div
            key={level}
            className={`w-3 h-3 rounded ${
              level <= flexibility
                ? 'bg-blue-500'
                : isDarkMode
                  ? 'bg-gray-700'
                  : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`rounded-xl overflow-hidden ${themeColors.cardBg}`}>
      <div className={`px-4 py-3 border-b ${themeColors.border}`}>
        <h3 className={`text-lg font-semibold ${themeColors.text}`}>
          Currency Exchange Rate Regimes
        </h3>
        <p className={`text-sm ${themeColors.textSecondary}`}>
          Classification of how currencies are managed relative to other currencies
        </p>
      </div>

      <div className="p-6">
        {/* Regime Type Summary */}
        <div className="mb-6">
          <h4 className={`text-sm font-semibold mb-3 ${themeColors.textSecondary}`}>
            REGIME DISTRIBUTION
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filterType === 'all'
                  ? isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-900'
                  : isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({CURRENCY_REGIMES.length})
            </button>
            {(Object.keys(regimeStats) as RegimeType[]).map(type => {
              const info = REGIME_TYPE_INFO[type];
              const style = getRegimeStyle(type);
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filterType === type
                      ? `${style.bgColor} ${style.color}`
                      : isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {info.label} ({regimeStats[type]})
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className={`mb-6 p-3 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className={themeColors.textTertiary}>Flexibility:</span>
              <div className="flex items-center gap-1">
                <span className={themeColors.textTertiary}>Low</span>
                {getFlexibilityBar(3)}
                <span className={themeColors.textTertiary}>High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredRegimes.map(regime => {
            const style = getRegimeStyle(regime.type);
            const info = REGIME_TYPE_INFO[regime.type];
            const isExpanded = expandedCurrency === regime.currency;

            return (
              <div
                key={regime.currency}
                onClick={() => setExpandedCurrency(isExpanded ? null : regime.currency)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                } ${isExpanded ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${
                  isDarkMode && isExpanded ? 'ring-offset-gray-900' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className={`text-lg font-bold ${themeColors.text}`}>
                      {regime.currency}
                    </span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${style.bgColor} ${style.color} border`}>
                      {info.label}
                    </span>
                  </div>
                  {getFlexibilityBar(regime.flexibility)}
                </div>

                <p className={`text-sm ${themeColors.textSecondary} mb-2`}>
                  {regime.description}
                </p>

                {regime.peggedTo && (
                  <div className={`text-xs ${themeColors.textTertiary}`}>
                    Pegged to: <span className={themeColors.text}>{regime.peggedTo}</span>
                  </div>
                )}

                {isExpanded && (
                  <div className={`mt-3 pt-3 border-t ${themeColors.border}`}>
                    <p className={`text-xs ${themeColors.textSecondary}`}>
                      {regime.details}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Regime Type Explanations */}
        <div className={`mt-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${themeColors.text}`}>
            Understanding Exchange Rate Regimes
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {(Object.entries(REGIME_TYPE_INFO) as [RegimeType, typeof REGIME_TYPE_INFO[RegimeType]][]).map(([type, info]) => (
              <div key={type} className="flex gap-2">
                <span className={`text-xs font-medium ${isDarkMode ? REGIME_TYPE_INFO_DARK[type].color : info.color}`}>
                  {info.label}:
                </span>
                <span className={`text-xs ${themeColors.textSecondary}`}>
                  {info.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyRegimeInfo;

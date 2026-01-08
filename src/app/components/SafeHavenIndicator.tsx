'use client';

import React, { useState, useMemo } from 'react';
import {
  SAFE_HAVEN_CURRENCIES,
  type CurrencyCode,
  type SafeHavenCategory,
  type SafeHavenCurrency
} from '../data/currencyHierarchyData';

interface SafeHavenIndicatorProps {
  isDarkMode: boolean;
}

const CATEGORY_INFO: Record<SafeHavenCategory, { label: string; color: string; bgColor: string; icon: string; description: string }> = {
  primary: {
    label: 'Primary Safe Haven',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
    icon: '🛡️',
    description: 'Strongest flight-to-quality destinations during market stress'
  },
  secondary: {
    label: 'Secondary Safe Haven',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: '🏛️',
    description: 'Moderate safe haven properties with some risk sensitivity'
  },
  neutral: {
    label: 'Neutral',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200',
    icon: '⚖️',
    description: 'Mixed characteristics, not strongly risk-on or risk-off'
  },
  risk_on: {
    label: 'Risk-On',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    icon: '📈',
    description: 'Appreciates during risk appetite, depreciates during stress'
  }
};

const CATEGORY_INFO_DARK: Record<SafeHavenCategory, { color: string; bgColor: string }> = {
  primary: { color: 'text-emerald-400', bgColor: 'bg-emerald-900/30 border-emerald-700' },
  secondary: { color: 'text-blue-400', bgColor: 'bg-blue-900/30 border-blue-700' },
  neutral: { color: 'text-gray-400', bgColor: 'bg-gray-700/50 border-gray-600' },
  risk_on: { color: 'text-red-400', bgColor: 'bg-red-900/30 border-red-700' }
};

const SafeHavenIndicator: React.FC<SafeHavenIndicatorProps> = ({ isDarkMode }) => {
  const [selectedCategory, setSelectedCategory] = useState<SafeHavenCategory | 'all'>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode | null>(null);
  const [marketSentiment, setMarketSentiment] = useState<'risk_on' | 'risk_off' | 'neutral'>('neutral');

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800/50' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  const filteredCurrencies = useMemo(() => {
    if (selectedCategory === 'all') return SAFE_HAVEN_CURRENCIES;
    return SAFE_HAVEN_CURRENCIES.filter(c => c.category === selectedCategory);
  }, [selectedCategory]);

  const sortedCurrencies = useMemo(() => {
    return [...filteredCurrencies].sort((a, b) => b.score - a.score);
  }, [filteredCurrencies]);

  const getCategoryStyle = (category: SafeHavenCategory) => {
    return isDarkMode ? CATEGORY_INFO_DARK[category] : CATEGORY_INFO[category];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
    if (score >= 60) return isDarkMode ? 'text-blue-400' : 'text-blue-600';
    if (score >= 40) return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    if (score >= 20) return isDarkMode ? 'text-amber-400' : 'text-amber-600';
    return isDarkMode ? 'text-red-400' : 'text-red-600';
  };

  const getExpectedBehavior = (category: SafeHavenCategory) => {
    if (marketSentiment === 'risk_off') {
      if (category === 'primary' || category === 'secondary') return '↑ Appreciate';
      if (category === 'risk_on') return '↓ Depreciate';
      return '→ Stable';
    } else if (marketSentiment === 'risk_on') {
      if (category === 'primary' || category === 'secondary') return '↓ May weaken';
      if (category === 'risk_on') return '↑ Appreciate';
      return '→ Stable';
    }
    return '→ Stable';
  };

  const getExpectedBehaviorColor = (category: SafeHavenCategory) => {
    const behavior = getExpectedBehavior(category);
    if (behavior.includes('↑')) return isDarkMode ? 'text-green-400' : 'text-green-600';
    if (behavior.includes('↓')) return isDarkMode ? 'text-red-400' : 'text-red-600';
    return themeColors.textTertiary;
  };

  return (
    <div className={`rounded-xl overflow-hidden ${themeColors.cardBg}`}>
      <div className={`px-4 py-3 border-b ${themeColors.border}`}>
        <h3 className={`text-lg font-semibold ${themeColors.text}`}>
          Safe Haven Currency Classification
        </h3>
        <p className={`text-sm ${themeColors.textSecondary}`}>
          Currency behavior during periods of market stress and risk aversion
        </p>
      </div>

      <div className="p-6">
        {/* Market Sentiment Selector */}
        <div className="mb-6">
          <h4 className={`text-sm font-semibold mb-3 ${themeColors.textSecondary}`}>
            CURRENT MARKET SENTIMENT (Simulation)
          </h4>
          <div className="flex gap-2">
            {(['risk_on', 'neutral', 'risk_off'] as const).map(sentiment => (
              <button
                key={sentiment}
                onClick={() => setMarketSentiment(sentiment)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  marketSentiment === sentiment
                    ? sentiment === 'risk_on'
                      ? isDarkMode
                        ? 'bg-green-900/30 border-green-600 text-green-400'
                        : 'bg-green-50 border-green-300 text-green-700'
                      : sentiment === 'risk_off'
                        ? isDarkMode
                          ? 'bg-red-900/30 border-red-600 text-red-400'
                          : 'bg-red-50 border-red-300 text-red-700'
                        : isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-300'
                          : 'bg-gray-100 border-gray-300 text-gray-700'
                    : isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                {sentiment === 'risk_on' ? '📈 Risk-On' : sentiment === 'risk_off' ? '🛡️ Risk-Off' : '⚖️ Neutral'}
              </button>
            ))}
          </div>
          <p className={`mt-2 text-xs ${themeColors.textTertiary}`}>
            {marketSentiment === 'risk_on'
              ? 'Market favoring higher-yielding, riskier assets'
              : marketSentiment === 'risk_off'
                ? 'Flight to safety - investors seeking protection'
                : 'Balanced risk appetite'
            }
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h4 className={`text-sm font-semibold mb-3 ${themeColors.textSecondary}`}>
            FILTER BY CATEGORY
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedCategory === 'all'
                  ? isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-900'
                  : isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              All Currencies
            </button>
            {(Object.entries(CATEGORY_INFO) as [SafeHavenCategory, typeof CATEGORY_INFO[SafeHavenCategory]][]).map(([cat, info]) => {
              const style = getCategoryStyle(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedCategory === cat
                      ? `${style.bgColor} ${style.color}`
                      : isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {info.icon} {info.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Currency Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedCurrencies.map(currency => {
            const catInfo = CATEGORY_INFO[currency.category];
            const style = getCategoryStyle(currency.category);
            const isSelected = selectedCurrency === currency.currency;

            return (
              <div
                key={currency.currency}
                onClick={() => setSelectedCurrency(isSelected ? null : currency.currency)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${
                  isDarkMode && isSelected ? 'ring-offset-gray-900' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${themeColors.text}`}>
                      {currency.currency}
                    </span>
                    <span className="text-xl">{catInfo.icon}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(currency.score)}`}>
                      {currency.score}
                    </div>
                    <div className={`text-[10px] ${themeColors.textTertiary}`}>
                      Safety Score
                    </div>
                  </div>
                </div>

                <div className={`text-xs px-2 py-1 rounded mb-2 inline-block ${style.bgColor} ${style.color} border`}>
                  {catInfo.label}
                </div>

                <p className={`text-sm ${themeColors.textSecondary} mb-2`}>
                  {currency.description}
                </p>

                {/* Expected Behavior */}
                <div className={`text-xs ${themeColors.textTertiary}`}>
                  Expected now:{' '}
                  <span className={`font-medium ${getExpectedBehaviorColor(currency.category)}`}>
                    {getExpectedBehavior(currency.category)}
                  </span>
                </div>

                {/* Safety Score Bar */}
                <div className="mt-2">
                  <div className={`h-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        currency.score >= 80
                          ? 'bg-emerald-500'
                          : currency.score >= 60
                            ? 'bg-blue-500'
                            : currency.score >= 40
                              ? 'bg-gray-500'
                              : currency.score >= 20
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                      }`}
                      style={{ width: `${currency.score}%` }}
                    />
                  </div>
                </div>

                {isSelected && (
                  <div className={`mt-3 pt-3 border-t ${themeColors.border}`}>
                    <h5 className={`text-xs font-semibold mb-2 ${themeColors.text}`}>
                      Key Characteristics:
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {currency.characteristics.map((char, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] px-2 py-1 rounded ${
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Category Legend */}
        <div className={`mt-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${themeColors.text}`}>
            Understanding Safe Haven Classifications
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {(Object.entries(CATEGORY_INFO) as [SafeHavenCategory, typeof CATEGORY_INFO[SafeHavenCategory]][]).map(([cat, info]) => (
              <div key={cat} className="flex gap-2">
                <span className="text-lg">{info.icon}</span>
                <div>
                  <span className={`text-xs font-medium ${isDarkMode ? CATEGORY_INFO_DARK[cat].color : info.color}`}>
                    {info.label}:
                  </span>
                  <p className={`text-xs ${themeColors.textSecondary}`}>
                    {info.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeHavenIndicator;

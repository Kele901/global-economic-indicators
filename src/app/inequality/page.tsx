'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import dynamic from 'next/dynamic';

const InequalityCharts = dynamic(
  () => import('../components/InequalityCharts'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading charts...</span>
      </div>
    ),
  }
);

export default function InequalityPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [showInfo, setShowInfo] = useState(true);

  const themeColors = {
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  return (
    <div className={`min-h-screen ${themeColors.background} ${themeColors.text}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Inequality</h1>
              <p className={`${themeColors.textSecondary} max-w-2xl`}>
                Income inequality, wealth concentration, and the dynamics of capital &mdash; grounded
                in Piketty&apos;s <em>Capital in the Twenty-First Century</em> and 250 years of data.
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        {showInfo && (
          <div className={`mb-6 p-5 rounded-xl border ${themeColors.cardBg} ${themeColors.border} relative`}>
            <button
              onClick={() => setShowInfo(false)}
              className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-900'}`}
            >
              Dismiss
            </button>
            <h2 className="text-lg font-bold mb-2">About This Section</h2>
            <p className={`text-sm leading-relaxed ${themeColors.textSecondary}`}>
              This page uses Thomas Piketty&apos;s <em>Capital in the Twenty-First Century</em> (2014)
              as its primary academic framework, supplemented by Kuznets (1955), Milanovic (2016),
              Saez &amp; Zucman (2019), Atkinson (2015), Deaton (2013), and Sen (1999). It covers
              Piketty&apos;s central thesis (<strong>r &gt; g</strong>), the Kuznets curve and its
              critique, income and wealth inequality across countries and centuries, historical dynamics
              from the Gilded Age to the present, a live global Gini map, and the tax and policy
              levers that shape distributional outcomes.
            </p>
            <p className={`text-xs mt-2 ${themeColors.textTertiary}`}>
              Historical data based on Piketty (2014), World Inequality Database, and Piketty &amp; Saez (2003).
              Global Gini data fetched live from the World Bank API. All figures are approximate and
              intended for educational purposes.
            </p>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>r &gt; g</div>
            <div className={`text-sm ${themeColors.textSecondary}`}>Piketty&apos;s Central Thesis</div>
          </div>
          <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>~50%</div>
            <div className={`text-sm ${themeColors.textSecondary}`}>US Top 10% Income Share</div>
          </div>
          <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>35%</div>
            <div className={`text-sm ${themeColors.textSecondary}`}>US Top 1% Wealth Share</div>
          </div>
          <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>250yr</div>
            <div className={`text-sm ${themeColors.textSecondary}`}>Historical Data Span</div>
          </div>
        </div>

        {/* Charts Component */}
        <InequalityCharts isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

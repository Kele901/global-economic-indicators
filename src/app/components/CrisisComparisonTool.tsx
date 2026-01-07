'use client';

import React, { useState, useMemo } from 'react';
import { 
  crisisEvents, 
  cycleIndicators,
  getCrisisTypeColor,
  getCrisisTypeLabel,
  getSeverityLabel,
  getCrisisGenerationColor,
  classifyCrisisGeneration,
  getCurrentPushPullBalance,
  type CrisisEvent,
  type CrisisType
} from '../data/economicCycles';

interface CrisisComparisonToolProps {
  isDarkMode: boolean;
}

interface HistoricalComparison {
  crisis: CrisisEvent;
  similarityScore: number;
  matchingFactors: string[];
  differingFactors: string[];
}

// Pre-crisis conditions for major historical crises (enhanced with Handbook metrics)
const crisisConditions: Record<string, {
  debtToGdp: number;
  privateDebt: number;
  interestRates: number;
  inflation: number;
  unemployment: number;
  yieldCurve: number;
  stockValuation: number;
  // New Handbook of International Economics metrics
  currentAccountGdp: number;       // Current account as % of GDP
  foreignCurrencyDebt: number;     // % of debt in foreign currency
  shortTermDebtReserves: number;   // Short-term external debt / reserves ratio
  realExchangeRateDeviation: number; // % deviation from PPP
  capitalFlowRisk: 'low' | 'medium' | 'high';
  characteristics: string[];
}> = {
  'us-1929-stock': {
    debtToGdp: 16,
    privateDebt: 160,
    interestRates: 6,
    inflation: 0,
    unemployment: 3.2,
    yieldCurve: 0.5,
    stockValuation: 32,
    currentAccountGdp: 0.5,
    foreignCurrencyDebt: 0,
    shortTermDebtReserves: 15,
    realExchangeRateDeviation: 5,
    capitalFlowRisk: 'low',
    characteristics: [
      'Excessive margin debt',
      'Stock speculation mania',
      'Bank overexposure to stocks',
      'Weak agricultural sector'
    ]
  },
  'japan-1990-asset': {
    debtToGdp: 65,
    privateDebt: 210,
    interestRates: 5.25,
    inflation: 3.1,
    unemployment: 2.1,
    yieldCurve: -0.3,
    stockValuation: 70,
    currentAccountGdp: 1.5,
    foreignCurrencyDebt: 5,
    shortTermDebtReserves: 20,
    realExchangeRateDeviation: 35, // Yen very overvalued
    capitalFlowRisk: 'low',
    characteristics: [
      'Real estate bubble',
      'Stock market at record highs',
      'Excessive corporate leverage',
      'Strong yen appreciation'
    ]
  },
  'us-2008-banking': {
    debtToGdp: 65,
    privateDebt: 175,
    interestRates: 5.02,
    inflation: 2.8,
    unemployment: 4.6,
    yieldCurve: 0.2,
    stockValuation: 27,
    currentAccountGdp: -5.1,
    foreignCurrencyDebt: 0,
    shortTermDebtReserves: 25,
    realExchangeRateDeviation: -10,
    capitalFlowRisk: 'medium',
    characteristics: [
      'Housing bubble',
      'Subprime mortgage exposure',
      'Bank leverage at extremes',
      'CDO/derivative complexity'
    ]
  },
  'greece-2010-debt': {
    debtToGdp: 127,
    privateDebt: 120,
    interestRates: 1,
    inflation: 4.7,
    unemployment: 9.6,
    yieldCurve: 2.5,
    stockValuation: 15,
    currentAccountGdp: -10.1,
    foreignCurrencyDebt: 0, // Euro, but no devaluation option
    shortTermDebtReserves: 0, // In eurozone
    realExchangeRateDeviation: 20, // Overvalued within euro
    capitalFlowRisk: 'high',
    characteristics: [
      'Unsustainable fiscal deficits',
      'Hidden government debt',
      'Eurozone rigidity',
      'Competitiveness gap'
    ]
  },
  'argentina-2001-debt': {
    debtToGdp: 54,
    privateDebt: 45,
    interestRates: 25,
    inflation: -1.1,
    unemployment: 18,
    yieldCurve: -5,
    stockValuation: 10,
    currentAccountGdp: -3.2,
    foreignCurrencyDebt: 85, // Classic original sin
    shortTermDebtReserves: 180, // Short-term debt > reserves
    realExchangeRateDeviation: 40, // Peso highly overvalued under peg
    capitalFlowRisk: 'high',
    characteristics: [
      'Currency peg unsustainable',
      'Fiscal deficit spiral',
      'External debt burden',
      'High original sin (FX debt)',
      'Political instability'
    ]
  },
  'germany-1923-inflation': {
    debtToGdp: 40,
    privateDebt: 20,
    interestRates: 5,
    inflation: 29500,
    unemployment: 4,
    yieldCurve: 0,
    stockValuation: 5,
    currentAccountGdp: -5,
    foreignCurrencyDebt: 80, // Reparations in gold/foreign currency
    shortTermDebtReserves: 500,
    realExchangeRateDeviation: -95, // Currency collapsed
    capitalFlowRisk: 'high',
    characteristics: [
      'War reparations burden',
      'Money printing spiral',
      'Currency collapse',
      'Political chaos'
    ]
  },
  'global-2020-pandemic': {
    debtToGdp: 108,
    privateDebt: 150,
    interestRates: 1.5,
    inflation: 2.3,
    unemployment: 3.5,
    yieldCurve: 0.3,
    stockValuation: 31,
    currentAccountGdp: -2.8,
    foreignCurrencyDebt: 0,
    shortTermDebtReserves: 30,
    realExchangeRateDeviation: 0,
    capitalFlowRisk: 'medium',
    characteristics: [
      'External shock (pandemic)',
      'High valuations pre-crisis',
      'Low rates pre-crisis',
      'High corporate debt'
    ]
  },
  'asia-1997-currency': {
    debtToGdp: 35,
    privateDebt: 120,
    interestRates: 8,
    inflation: 5.8,
    unemployment: 2.5,
    yieldCurve: 1,
    stockValuation: 20,
    currentAccountGdp: -7.9,
    foreignCurrencyDebt: 70, // High original sin
    shortTermDebtReserves: 200, // Classic 3rd gen crisis
    realExchangeRateDeviation: 25,
    capitalFlowRisk: 'high',
    characteristics: [
      'Pegged currencies',
      'Short-term FX debt > reserves',
      'Current account deficits',
      'Capital flow bonanza ending'
    ]
  }
};

// Current conditions (enhanced with Handbook metrics)
const currentConditions = {
  debtToGdp: 123,
  privateDebt: 150,
  interestRates: 5.33,
  inflation: 3.2,
  unemployment: 4.2,
  yieldCurve: 0.5,
  stockValuation: 32,
  // Handbook of International Economics metrics
  currentAccountGdp: -3.0,         // US current account deficit
  foreignCurrencyDebt: 0,          // US borrows in own currency (no original sin)
  shortTermDebtReserves: 35,       // Not relevant for reserve currency issuer
  realExchangeRateDeviation: 5,    // Dollar slightly overvalued
  capitalFlowRisk: 'low' as const, // Safe haven status
  characteristics: [
    'High government debt levels',
    'Elevated interest rates after rapid hikes',
    'Inflation moderating but above target',
    'Tight labor market',
    'High equity valuations',
    'Commercial real estate stress',
    'Reserve currency issuer (safe haven)',
    'No original sin exposure'
  ]
};

const CrisisComparisonTool: React.FC<CrisisComparisonToolProps> = ({ isDarkMode }) => {
  const [selectedCrisis, setSelectedCrisis] = useState<string | null>(null);
  const [showAllCrises, setShowAllCrises] = useState(false);

  // Get current capital flow assessment
  const capitalFlowBalance = useMemo(() => getCurrentPushPullBalance(), []);

  // Calculate similarity scores (enhanced with Handbook metrics)
  const comparisons: HistoricalComparison[] = useMemo(() => {
    return Object.entries(crisisConditions).map(([crisisId, conditions]) => {
      const crisis = crisisEvents.find(c => c.id === crisisId);
      if (!crisis) return null;

      const matchingFactors: string[] = [];
      const differingFactors: string[] = [];
      let score = 0;
      let factors = 0;

      // Compare debt levels
      const debtDiff = Math.abs(currentConditions.debtToGdp - conditions.debtToGdp);
      if (debtDiff < 20) {
        matchingFactors.push('Similar public debt levels');
        score += 20 - debtDiff;
      } else {
        differingFactors.push(`Public debt ${currentConditions.debtToGdp > conditions.debtToGdp ? 'higher' : 'lower'} now`);
      }
      factors += 20;

      // Compare private debt
      const privateDiff = Math.abs(currentConditions.privateDebt - conditions.privateDebt);
      if (privateDiff < 30) {
        matchingFactors.push('Similar private debt levels');
        score += 20 - privateDiff / 1.5;
      } else {
        differingFactors.push(`Private debt ${currentConditions.privateDebt > conditions.privateDebt ? 'higher' : 'lower'} now`);
      }
      factors += 20;

      // Compare rates
      const rateDiff = Math.abs(currentConditions.interestRates - conditions.interestRates);
      if (rateDiff < 2) {
        matchingFactors.push('Similar interest rate environment');
        score += 15;
      } else {
        differingFactors.push(`Rates ${currentConditions.interestRates > conditions.interestRates ? 'higher' : 'lower'} now`);
      }
      factors += 15;

      // Compare unemployment
      const unempDiff = Math.abs(currentConditions.unemployment - conditions.unemployment);
      if (unempDiff < 2) {
        matchingFactors.push('Similar unemployment levels');
        score += 10;
      }
      factors += 10;

      // Compare stock valuations
      const valuationDiff = Math.abs(currentConditions.stockValuation - conditions.stockValuation);
      if (valuationDiff < 10) {
        matchingFactors.push('Similar market valuations');
        score += 20;
      }
      factors += 20;

      // Compare yield curve
      if (Math.abs(currentConditions.yieldCurve - conditions.yieldCurve) < 1) {
        matchingFactors.push('Similar yield curve shape');
        score += 15;
      }
      factors += 15;

      // NEW: Compare current account (Handbook metric)
      const caDiff = Math.abs(currentConditions.currentAccountGdp - conditions.currentAccountGdp);
      if (caDiff < 3) {
        matchingFactors.push('Similar current account position');
        score += 10;
      } else if (conditions.currentAccountGdp < -5) {
        differingFactors.push('US has smaller current account deficit');
      }
      factors += 10;

      // NEW: Compare original sin exposure (Handbook metric)
      if (conditions.foreignCurrencyDebt > 50 && currentConditions.foreignCurrencyDebt < 10) {
        differingFactors.push('US has no original sin (borrows in own currency)');
        // This is protective, so reduce similarity
        score -= 10;
      } else if (Math.abs(currentConditions.foreignCurrencyDebt - conditions.foreignCurrencyDebt) < 20) {
        matchingFactors.push('Similar currency debt exposure');
        score += 10;
      }
      factors += 10;

      // NEW: Compare capital flow risk
      if (currentConditions.capitalFlowRisk === conditions.capitalFlowRisk) {
        matchingFactors.push('Similar capital flow risk profile');
        score += 10;
      } else if (conditions.capitalFlowRisk === 'high' && currentConditions.capitalFlowRisk === 'low') {
        differingFactors.push('US has safe haven status (lower sudden stop risk)');
        score -= 5;
      }
      factors += 10;

      const similarityScore = Math.max(0, Math.min(100, Math.round((score / factors) * 100)));

      return {
        crisis,
        similarityScore,
        matchingFactors,
        differingFactors
      };
    }).filter((c): c is HistoricalComparison => c !== null)
      .sort((a, b) => b.similarityScore - a.similarityScore);
  }, []);

  const topComparison = comparisons[0];
  const selectedComparison = selectedCrisis 
    ? comparisons.find(c => c.crisis.id === selectedCrisis)
    : topComparison;

  const displayedCrises = showAllCrises ? comparisons : comparisons.slice(0, 4);

  return (
    <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          &quot;This Time is Different?&quot; - Historical Comparison
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Comparing current conditions to pre-crisis periods (Reinhart-Rogoff methodology)
        </p>
      </div>

      <div className="p-6">
        {/* Top Match Alert */}
        {topComparison && topComparison.similarityScore > 50 && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            topComparison.similarityScore > 70
              ? isDarkMode ? 'bg-red-900/30 border-red-500' : 'bg-red-50 border-red-500'
              : topComparison.similarityScore > 50
                ? isDarkMode ? 'bg-amber-900/30 border-amber-500' : 'bg-amber-50 border-amber-500'
                : isDarkMode ? 'bg-blue-900/30 border-blue-500' : 'bg-blue-50 border-blue-500'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <svg className={`w-5 h-5 ${
                topComparison.similarityScore > 70 ? 'text-red-500' : 'text-amber-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <span className={`font-semibold ${
                topComparison.similarityScore > 70 
                  ? isDarkMode ? 'text-red-400' : 'text-red-700'
                  : isDarkMode ? 'text-amber-400' : 'text-amber-700'
              }`}>
                {topComparison.similarityScore}% Similar to {topComparison.crisis.name}
              </span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Current economic conditions show significant parallels to pre-crisis conditions 
              of the {topComparison.crisis.year} {getCrisisTypeLabel(topComparison.crisis.type).toLowerCase()}.
            </p>
          </div>
        )}

        {/* Current Conditions */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Current Economic Conditions (2024)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Public Debt/GDP</div>
              <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentConditions.debtToGdp}%
              </div>
            </div>
            <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Fed Funds Rate</div>
              <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentConditions.interestRates}%
              </div>
            </div>
            <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Inflation</div>
              <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentConditions.inflation}%
              </div>
            </div>
            <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>CAPE Ratio</div>
              <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentConditions.stockValuation}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {currentConditions.characteristics.map((char, idx) => (
              <span 
                key={idx}
                className={`text-xs px-2 py-1 rounded ${
                  isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                }`}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* International Macro Indicators (Handbook Framework) */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-50'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
            📚 International Macro Indicators (Handbook of Int&apos;l Economics)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Current Account/GDP</div>
              <div className={`text-lg font-bold ${currentConditions.currentAccountGdp < -4 ? 'text-red-500' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentConditions.currentAccountGdp}%
              </div>
            </div>
            <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Original Sin Index</div>
              <div className={`text-lg font-bold text-green-500`}>
                {currentConditions.foreignCurrencyDebt}%
              </div>
              <div className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Low (USD issuer)</div>
            </div>
            <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>REER Deviation</div>
              <div className={`text-lg font-bold ${Math.abs(currentConditions.realExchangeRateDeviation) > 15 ? 'text-amber-500' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentConditions.realExchangeRateDeviation > 0 ? '+' : ''}{currentConditions.realExchangeRateDeviation}%
              </div>
            </div>
            <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Sudden Stop Risk</div>
              <div className={`text-lg font-bold text-green-500`}>
                Low
              </div>
              <div className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Safe haven</div>
            </div>
            <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Capital Flow Balance</div>
              <div className={`text-lg font-bold capitalize ${
                capitalFlowBalance.net === 'inflow' ? 'text-green-500' :
                capitalFlowBalance.net === 'outflow' ? 'text-red-500' :
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {capitalFlowBalance.net}
              </div>
            </div>
          </div>
          <p className={`mt-3 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Metrics from Handbook of International Economics: Original Sin (Eichengreen), Sudden Stops (Calvo), Real Exchange Rate assessment
          </p>
        </div>

        {/* Historical Crisis Comparison Cards */}
        <div className="mb-4">
          <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Historical Crisis Comparisons
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedCrises.map(comparison => (
              <button
                key={comparison.crisis.id}
                onClick={() => setSelectedCrisis(
                  selectedCrisis === comparison.crisis.id ? null : comparison.crisis.id
                )}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedCrisis === comparison.crisis.id
                    ? isDarkMode 
                      ? 'bg-blue-900/30 border-blue-500' 
                      : 'bg-blue-50 border-blue-500'
                    : isDarkMode
                      ? 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCrisisTypeColor(comparison.crisis.type) }}
                    />
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {comparison.crisis.name}
                    </span>
                  </div>
                  <div className={`text-lg font-bold ${
                    comparison.similarityScore > 70 ? 'text-red-500' :
                    comparison.similarityScore > 50 ? 'text-amber-500' :
                    comparison.similarityScore > 30 ? 'text-blue-500' :
                    'text-green-500'
                  }`}>
                    {comparison.similarityScore}%
                  </div>
                </div>
                
                <div className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {comparison.crisis.year} • {comparison.crisis.country} • {getCrisisTypeLabel(comparison.crisis.type)}
                </div>

                {/* Similarity Bar */}
                <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${comparison.similarityScore}%`,
                      backgroundColor: comparison.similarityScore > 70 ? '#ef4444' :
                        comparison.similarityScore > 50 ? '#f59e0b' :
                        comparison.similarityScore > 30 ? '#3b82f6' : '#22c55e'
                    }}
                  />
                </div>

                {/* Matching factors preview */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {comparison.matchingFactors.slice(0, 2).map((factor, idx) => (
                    <span 
                      key={idx}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      ✓ {factor}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {comparisons.length > 4 && (
            <button
              onClick={() => setShowAllCrises(!showAllCrises)}
              className={`mt-3 text-sm font-medium ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              {showAllCrises ? 'Show Less' : `Show ${comparisons.length - 4} More`}
            </button>
          )}
        </div>

        {/* Selected Crisis Detail */}
        {selectedComparison && (
          <div className={`mt-6 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getCrisisTypeColor(selectedComparison.crisis.type) }}
                />
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedComparison.crisis.name} ({selectedComparison.crisis.year})
                </h4>
              </div>
              <span className={`text-2xl font-bold ${
                selectedComparison.similarityScore > 70 ? 'text-red-500' :
                selectedComparison.similarityScore > 50 ? 'text-amber-500' :
                'text-blue-500'
              }`}>
                {selectedComparison.similarityScore}% Similar
              </span>
            </div>

            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {selectedComparison.crisis.description}
            </p>

            {/* Pre-crisis conditions comparison */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h5 className={`text-xs font-semibold mb-2 text-green-500`}>
                  ✓ MATCHING FACTORS
                </h5>
                <div className="space-y-1">
                  {selectedComparison.matchingFactors.map((factor, idx) => (
                    <div 
                      key={idx}
                      className={`text-xs px-2 py-1 rounded ${
                        isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className={`text-xs font-semibold mb-2 text-red-500`}>
                  ✗ DIFFERING FACTORS
                </h5>
                <div className="space-y-1">
                  {selectedComparison.differingFactors.map((factor, idx) => (
                    <div 
                      key={idx}
                      className={`text-xs px-2 py-1 rounded ${
                        isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Crisis outcome */}
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h5 className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                CRISIS OUTCOME
              </h5>
              <div className="grid grid-cols-3 gap-3">
                {selectedComparison.crisis.gdpDecline && (
                  <div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>GDP Decline</div>
                    <div className="text-lg font-bold text-red-500">-{selectedComparison.crisis.gdpDecline}%</div>
                  </div>
                )}
                {selectedComparison.crisis.recoveryYears && (
                  <div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Recovery Time</div>
                    <div className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {selectedComparison.crisis.recoveryYears} years
                    </div>
                  </div>
                )}
                <div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Severity</div>
                  <div className={`text-lg font-bold ${
                    selectedComparison.crisis.severity >= 4 ? 'text-red-500' :
                    selectedComparison.crisis.severity >= 3 ? 'text-amber-500' :
                    'text-yellow-500'
                  }`}>
                    {getSeverityLabel(selectedComparison.crisis.severity)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className={`mt-6 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Based on methodology from &quot;This Time is Different&quot; by Reinhart &amp; Rogoff. 
          Historical parallels are informative but not predictive. Past crises had unique 
          circumstances that may not apply to current conditions.
        </p>
      </div>
    </div>
  );
};

export default CrisisComparisonTool;


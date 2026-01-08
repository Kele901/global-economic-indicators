'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import dynamic from 'next/dynamic';
import CycleTimeline from '../components/CycleTimeline';
import DebtCycleChart from '../components/DebtCycleChart';
import CyclePhaseIndicator from '../components/CyclePhaseIndicator';
import CrisisComparisonTool from '../components/CrisisComparisonTool';
import InternationalMacroFrameworks from '../components/InternationalMacroFrameworks';
import { 
  crisisEvents, 
  empireCycles, 
  debtCyclePhases,
  getCrisisTypeColor,
  getCrisisTypeLabel,
  type CrisisEvent,
  type EmpireCycle,
  type DebtCyclePhase,
  type CrisisType,
  type CrisisGeneration
} from '../data/economicCycles';

// Dynamically import the map to avoid SSR issues with react-simple-maps
const CrisisWorldMap = dynamic(
  () => import('../components/CrisisWorldMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading map...</span>
      </div>
    )
  }
);

const EconomicCyclesPage = () => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [selectedEmpire, setSelectedEmpire] = useState<EmpireCycle | null>(null);
  const [selectedCrisis, setSelectedCrisis] = useState<CrisisEvent | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<DebtCyclePhase | null>(null);
  const [crisisFilter, setCrisisFilter] = useState<CrisisType | 'all'>('all');
  const [decadeFilter, setDecadeFilter] = useState<number | 'all'>('all');
  const [generationFilter, setGenerationFilter] = useState<CrisisGeneration | 'all'>('all');
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Dispatch theme change event
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('themeChange'));
    }
  }, [isDarkMode]);

  // Theme colors
  const themeColors = {
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  };

  // Generate decade options for filter
  const decades = [];
  for (let d = 1800; d <= 2020; d += 10) {
    decades.push(d);
  }

  // Stats for header
  const totalCrises = crisisEvents.length;
  const bankingCrises = crisisEvents.filter(c => c.type === 'banking').length;
  const debtCrises = crisisEvents.filter(c => c.type === 'sovereign_debt').length;
  const currencyCrises = crisisEvents.filter(c => c.type === 'currency').length;

  return (
    <div className={`min-h-screen ${themeColors.background} ${themeColors.text}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Global Economic &amp; Market Cycles
            </h1>
            <p className={`${themeColors.textSecondary} max-w-2xl`}>
              Understanding the patterns of rise and fall in economies and markets through 
              the lens of Ray Dalio&apos;s &quot;The Changing World Order&quot; and Reinhart-Rogoff&apos;s 
              &quot;This Time is Different&quot;.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={themeColors.textSecondary}>Light</span>
            <button
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${
                isDarkMode ? 'translate-x-6' : ''
              }`} />
            </button>
            <span className={themeColors.textSecondary}>Dark</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {empireCycles.length}
            </div>
            <div className={`text-sm ${themeColors.textSecondary}`}>Major Empire Cycles</div>
          </div>
          <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              {totalCrises}
            </div>
            <div className={`text-sm ${themeColors.textSecondary}`}>Financial Crises Documented</div>
          </div>
          <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {debtCyclePhases.filter(p => p.cycleType === 'long_term').length}
            </div>
            <div className={`text-sm ${themeColors.textSecondary}`}>Long-term Debt Phases</div>
          </div>
          <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              500+
            </div>
            <div className={`text-sm ${themeColors.textSecondary}`}>Years of Data</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex flex-wrap gap-2 mb-8 p-1 rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          {[
            { id: 'overview', label: 'Cycle Overview', icon: '📊' },
            { id: 'empires', label: 'Empire Cycles', icon: '👑' },
            { id: 'crises', label: 'Crisis History', icon: '⚠️' },
            { id: 'debt', label: 'Debt Cycles', icon: '📈' },
            { id: 'macro', label: 'Macro Frameworks', icon: '📚' },
            { id: 'compare', label: 'Compare to Today', icon: '🔍' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === tab.id
                  ? isDarkMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-900 shadow'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Section: Overview */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Intro Quote */}
            <p className={`text-center italic ${themeColors.textSecondary}`}>
              &quot;History doesn&apos;t repeat itself, but it often rhymes.&quot;
              <span className={`text-sm ${themeColors.textTertiary} ml-2`}>— Mark Twain</span>
            </p>

            {/* Current Cycle Phase */}
            <CyclePhaseIndicator isDarkMode={isDarkMode} />

            {/* Key Concepts */}
            <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <h2 className="text-xl font-bold mb-4">Key Frameworks</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    Ray Dalio&apos;s Big Cycle
                  </h3>
                  <p className={`text-sm ${themeColors.textSecondary} mb-3`}>
                    Empires rise and fall in predictable patterns lasting 200-300 years. 
                    Key determinants include education, innovation, competitiveness, 
                    military strength, trade, and reserve currency status.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Education', 'Innovation', 'Trade', 'Military', 'Currency'].map(factor => (
                      <span 
                        key={factor}
                        className={`text-xs px-2 py-1 rounded ${
                          isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    Reinhart-Rogoff Crisis Patterns
                  </h3>
                  <p className={`text-sm ${themeColors.textSecondary} mb-3`}>
                    Financial crises follow remarkably similar patterns across countries 
                    and centuries. Common precursors include excessive debt, asset bubbles, 
                    and overconfidence that &quot;this time is different.&quot;
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Banking', 'Sovereign Debt', 'Currency', 'Inflation'].map(type => (
                      <span 
                        key={type}
                        className={`text-xs px-2 py-1 rounded ${
                          isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {type} Crisis
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: Empire Cycles */}
        {activeSection === 'empires' && (
          <div className="space-y-8">
            <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <h2 className="text-xl font-bold mb-2">The Big Cycle: Rise and Fall of Empires</h2>
              <p className={`${themeColors.textSecondary} mb-6`}>
                Based on Ray Dalio&apos;s analysis in &quot;The Changing World Order,&quot; empires follow 
                predictable patterns of rise, peak, and decline over roughly 250-year cycles.
              </p>
              <CycleTimeline 
                isDarkMode={isDarkMode}
                selectedEmpire={selectedEmpire}
                onSelectEmpire={setSelectedEmpire}
              />
            </div>

            {/* Empire Details Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {empireCycles.map(empire => (
                <div 
                  key={empire.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedEmpire?.id === empire.id
                      ? isDarkMode 
                        ? 'bg-blue-900/30 border-blue-500' 
                        : 'bg-blue-50 border-blue-500'
                      : `${themeColors.cardBg} ${themeColors.border} hover:shadow-lg`
                  }`}
                  onClick={() => setSelectedEmpire(
                    selectedEmpire?.id === empire.id ? null : empire
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: empire.color }}
                    />
                    <h3 className="font-semibold">{empire.fullName}</h3>
                  </div>
                  <div className={`text-xs ${themeColors.textTertiary} mb-2`}>
                    Peak: {empire.peakStart} - {empire.peakEnd}
                  </div>
                  <p className={`text-sm ${themeColors.textSecondary} line-clamp-2`}>
                    {empire.description}
                  </p>
                  {empire.reserveCurrency && (
                    <div className={`mt-2 text-xs px-2 py-1 rounded inline-block ${
                      isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
                    }`}>
                      Reserve Currency: {empire.reserveCurrency}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Crisis History */}
        {activeSection === 'crises' && (
          <div className="space-y-8">
            {/* Filters */}
            <div className={`p-4 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className={`text-xs ${themeColors.textTertiary} block mb-1`}>
                    Crisis Type
                  </label>
                  <select
                    value={crisisFilter}
                    onChange={(e) => setCrisisFilter(e.target.value as CrisisType | 'all')}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white text-gray-900 border-gray-300'
                    } border`}
                  >
                    <option value="all">All Types</option>
                    <option value="banking">Banking Crisis</option>
                    <option value="sovereign_debt">Sovereign Debt</option>
                    <option value="currency">Currency Crisis</option>
                    <option value="inflation">Inflation Crisis</option>
                    <option value="stock_market">Stock Market Crash</option>
                  </select>
                </div>
                <div>
                  <label className={`text-xs ${themeColors.textTertiary} block mb-1`}>
                    Decade
                  </label>
                  <select
                    value={decadeFilter}
                    onChange={(e) => setDecadeFilter(
                      e.target.value === 'all' ? 'all' : parseInt(e.target.value)
                    )}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white text-gray-900 border-gray-300'
                    } border`}
                  >
                    <option value="all">All Decades</option>
                    {decades.map(d => (
                      <option key={d} value={d}>{d}s</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`text-xs ${themeColors.textTertiary} block mb-1`}>
                    Crisis Model (Handbook)
                  </label>
                  <select
                    value={generationFilter}
                    onChange={(e) => setGenerationFilter(e.target.value as CrisisGeneration | 'all')}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white text-gray-900 border-gray-300'
                    } border`}
                  >
                    <option value="all">All Models</option>
                    <option value="1st">1st Gen (Fundamentals)</option>
                    <option value="2nd">2nd Gen (Self-Fulfilling)</option>
                    <option value="3rd">3rd Gen (Balance Sheet)</option>
                  </select>
                </div>
                <div className={`ml-auto text-sm ${themeColors.textSecondary}`}>
                  Based on Reinhart-Rogoff &amp; Handbook of Int&apos;l Economics
                </div>
              </div>
            </div>

            {/* Crisis Map */}
            <div className={`rounded-xl overflow-hidden ${themeColors.cardBg} border ${themeColors.border}`}>
              <div className={`px-4 py-3 border-b ${themeColors.border}`}>
                <h2 className="text-xl font-bold">Global Crisis Map</h2>
                <p className={`text-sm ${themeColors.textSecondary}`}>
                  200+ years of financial crises mapped across the globe
                </p>
              </div>
              <CrisisWorldMap
                isDarkMode={isDarkMode}
                selectedCrisis={selectedCrisis}
                onSelectCrisis={setSelectedCrisis}
                filterType={crisisFilter}
                filterDecade={decadeFilter}
                filterGeneration={generationFilter}
              />
            </div>

            {/* Crisis Type Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {([
                { type: 'banking', count: bankingCrises },
                { type: 'sovereign_debt', count: debtCrises },
                { type: 'currency', count: currencyCrises },
                { type: 'inflation', count: crisisEvents.filter(c => c.type === 'inflation').length },
                { type: 'stock_market', count: crisisEvents.filter(c => c.type === 'stock_market').length },
              ] as { type: CrisisType; count: number }[]).map(item => (
                <button
                  key={item.type}
                  onClick={() => setCrisisFilter(crisisFilter === item.type ? 'all' : item.type)}
                  className={`p-4 rounded-xl text-center transition-all ${
                    crisisFilter === item.type
                      ? 'ring-2 ring-blue-500'
                      : ''
                  } ${themeColors.cardBg} border ${themeColors.border} hover:shadow-lg`}
                >
                  <div 
                    className="w-4 h-4 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: getCrisisTypeColor(item.type) }}
                  />
                  <div className="text-2xl font-bold">{item.count}</div>
                  <div className={`text-xs ${themeColors.textSecondary}`}>
                    {getCrisisTypeLabel(item.type)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section: Debt Cycles */}
        {activeSection === 'debt' && (
          <div className="space-y-8">
            <div className={`px-4 py-3 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-purple-500 text-purple-400' 
                : 'bg-white border-purple-400 text-purple-700'
            }`}>
              <h3 className="font-semibold">
                Dalio&apos;s Debt Cycle Framework
              </h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Long-term debt cycles last 50-75 years, while short-term business cycles 
                last 5-10 years. The current long-term cycle began after WWII and may be 
                reaching its late stages.
              </p>
            </div>

            <DebtCycleChart
              isDarkMode={isDarkMode}
              cycleType="both"
              selectedPhase={selectedPhase}
              onSelectPhase={setSelectedPhase}
            />

            {/* Short-term Cycles */}
            <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
              <h3 className="text-lg font-semibold mb-4">Recent Business Cycles</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {debtCyclePhases
                  .filter(p => p.cycleType === 'short_term')
                  .slice(-6)
                  .map(phase => (
                    <div 
                      key={phase.id}
                      className={`p-4 rounded-lg border ${
                        isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getCrisisTypeColor(
                            phase.phase === 'depression' ? 'banking' : 
                            phase.phase === 'bubble' ? 'stock_market' : 'currency'
                          ) }}
                        />
                        <span className="font-medium">{phase.name}</span>
                      </div>
                      <div className={`text-xs ${themeColors.textTertiary} mb-2`}>
                        {phase.startYear} - {phase.endYear}
                      </div>
                      <p className={`text-sm ${themeColors.textSecondary}`}>
                        {phase.description}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Section: International Macro Frameworks */}
        {activeSection === 'macro' && (
          <div className="space-y-8">
            <InternationalMacroFrameworks darkMode={isDarkMode} />
          </div>
        )}

        {/* Section: Compare to Today */}
        {activeSection === 'compare' && (
          <div className="space-y-8">
            <CrisisComparisonTool isDarkMode={isDarkMode} />
          </div>
        )}

        {/* Footer / Sources */}
        <div className={`mt-12 p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className="font-semibold mb-3">Sources &amp; Methodology</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className={`text-sm font-medium mb-2 ${themeColors.textSecondary}`}>
                Primary Sources
              </h4>
              <ul className={`text-sm space-y-1 ${themeColors.textTertiary}`}>
                <li>• Ray Dalio - &quot;The Changing World Order&quot; (2021)</li>
                <li>• Reinhart &amp; Rogoff - &quot;This Time is Different&quot; (2009)</li>
                <li>• Federal Reserve Economic Data (FRED)</li>
                <li>• World Bank Development Indicators</li>
                <li>• Bank for International Settlements (BIS)</li>
              </ul>
            </div>
            <div>
              <h4 className={`text-sm font-medium mb-2 ${themeColors.textSecondary}`}>
                Academic Frameworks (Handbook of Int&apos;l Economics Vol. 3)
              </h4>
              <ul className={`text-sm space-y-1 ${themeColors.textTertiary}`}>
                <li>• Krugman (1979) - &quot;Balance of Payments Crises&quot;</li>
                <li>• Obstfeld (1994) - &quot;The Logic of Currency Crises&quot;</li>
                <li>• Calvo (1998) - &quot;Capital Flows and Crises&quot;</li>
                <li>• Eichengreen, Hausmann &amp; Panizza - &quot;Original Sin&quot;</li>
                <li>• Reinhart &amp; Rogoff - &quot;Debt Intolerance&quot;</li>
              </ul>
            </div>
            <div>
              <h4 className={`text-sm font-medium mb-2 ${themeColors.textSecondary}`}>
                Disclaimer
              </h4>
              <p className={`text-sm ${themeColors.textTertiary}`}>
                This visualization is for educational purposes only. Historical patterns 
                are informative but not predictive of future events. Economic conditions 
                are complex and past crises had unique circumstances that may not apply 
                to current situations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomicCyclesPage;


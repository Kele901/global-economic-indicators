'use client';

import React, { useState, useMemo } from 'react';
import {
  crisisGenerationModels,
  capitalFlowEvents,
  exchangeRateConcepts,
  debtVulnerabilityConcepts,
  countryDebtProfiles,
  pushPullFactors,
  getCrisisGenerationColor,
  getCapitalFlowTypeColor,
  getCapitalFlowTypeLabel,
  getVulnerabilityScoreColor,
  getVulnerabilityLevel,
  getCurrentPushPullBalance,
  CrisisGenerationModel,
  CapitalFlowEvent,
  ExchangeRateConcept,
  CountryDebtProfile,
  PushPullFactor
} from '../data/economicCycles';

interface InternationalMacroFrameworksProps {
  darkMode: boolean;
}

type SubSection = 'crisis-models' | 'capital-flows' | 'exchange-rates' | 'debt-vulnerability';

export default function InternationalMacroFrameworks({ darkMode }: InternationalMacroFrameworksProps) {
  const [activeSubSection, setActiveSubSection] = useState<SubSection>('crisis-models');
  const [selectedGeneration, setSelectedGeneration] = useState<string | null>('1st');
  const [selectedFlowType, setSelectedFlowType] = useState<string>('all');
  const [selectedConcept, setSelectedConcept] = useState<string | null>('overshooting');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const pushPullBalance = useMemo(() => getCurrentPushPullBalance(), []);

  const filteredCapitalFlows = useMemo(() => {
    if (selectedFlowType === 'all') return capitalFlowEvents;
    return capitalFlowEvents.filter(e => e.type === selectedFlowType);
  }, [selectedFlowType]);

  const sortedDebtProfiles = useMemo(() => {
    return [...countryDebtProfiles].sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore);
  }, []);

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${cardBg} rounded-xl p-6 shadow-lg ${borderColor} border`}>
        <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>
          International Macro Frameworks
        </h2>
        <p className={`${textSecondary}`}>
          Academic frameworks from the Handbook of International Economics Vol. 3 - Understanding currency crises, 
          capital flows, exchange rate dynamics, and debt vulnerabilities.
        </p>
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'crisis-models', label: '🔄 Crisis Generation Models', icon: '🔄' },
          { id: 'capital-flows', label: '💸 Capital Flows', icon: '💸' },
          { id: 'exchange-rates', label: '💱 Exchange Rates', icon: '💱' },
          { id: 'debt-vulnerability', label: '⚠️ Debt Vulnerability', icon: '⚠️' }
        ].map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSubSection(section.id as SubSection)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeSubSection === section.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : `${cardBg} ${textSecondary} hover:bg-indigo-50 dark:hover:bg-gray-700`
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Crisis Generation Models Section */}
      {activeSubSection === 'crisis-models' && (
        <div className="space-y-6">
          {/* Generation Selector */}
          <div className={`${cardBg} rounded-xl p-6 shadow-lg ${borderColor} border`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>
              Currency Crisis Generation Models
            </h3>
            <p className={`${textSecondary} mb-6`}>
              Academic models evolved through three "generations" to explain different types of currency crises.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {crisisGenerationModels.map((model) => (
                <button
                  key={model.generation}
                  onClick={() => setSelectedGeneration(model.generation)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedGeneration === model.generation
                      ? `border-current shadow-lg`
                      : `${borderColor} hover:border-gray-400`
                  }`}
                  style={{
                    borderColor: selectedGeneration === model.generation 
                      ? getCrisisGenerationColor(model.generation) 
                      : undefined
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: getCrisisGenerationColor(model.generation) }}
                    >
                      {model.generation}
                    </div>
                    <div>
                      <div className={`font-semibold ${textPrimary}`}>{model.name}</div>
                      <div className={`text-sm ${textSecondary}`}>{model.year}</div>
                    </div>
                  </div>
                  <div className={`text-sm ${textSecondary}`}>
                    {model.theorists.join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Generation Detail */}
          {selectedGeneration && (
            <div className={`${cardBg} rounded-xl p-6 shadow-lg ${borderColor} border`}>
              {crisisGenerationModels
                .filter(m => m.generation === selectedGeneration)
                .map(model => (
                  <div key={model.generation} className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
                        style={{ backgroundColor: getCrisisGenerationColor(model.generation) }}
                      >
                        {model.generation}
                      </div>
                      <div>
                        <h4 className={`text-xl font-bold ${textPrimary}`}>{model.name}</h4>
                        <p className={`${textSecondary} mt-1`}>{model.description}</p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                      <h5 className={`font-semibold ${textPrimary} mb-2`}>Mechanism</h5>
                      <p className={textSecondary}>{model.mechanism}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className={`font-semibold ${textPrimary} mb-3`}>Key Indicators</h5>
                        <ul className="space-y-2">
                          {model.keyIndicators.map((indicator, i) => (
                            <li key={i} className={`flex items-center gap-2 ${textSecondary}`}>
                              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                              {indicator}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className={`font-semibold ${textPrimary} mb-3`}>Warning Signals</h5>
                        <ul className="space-y-2">
                          {model.warningSignals.map((signal, i) => (
                            <li key={i} className={`flex items-center gap-2 ${textSecondary}`}>
                              <span className="text-amber-500">⚠️</span>
                              {signal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h5 className={`font-semibold ${textPrimary} mb-3`}>Historical Examples</h5>
                      <div className="flex flex-wrap gap-2">
                        {model.historicalExamples.map((example, i) => (
                          <span
                            key={i}
                            className={`px-3 py-1 rounded-full text-sm ${
                              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Capital Flows Section */}
      {activeSubSection === 'capital-flows' && (
        <div className="space-y-6">
          {/* Push/Pull Balance */}
          <div className={`${cardBg} rounded-xl p-6 shadow-lg ${borderColor} border`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>
              Current Push/Pull Capital Flow Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
                <div className={`text-sm font-medium ${darkMode ? 'text-red-300' : 'text-red-600'}`}>Push Factors (DM)</div>
                <div className={`text-3xl font-bold ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{pushPullBalance.push}</div>
                <div className={`text-sm ${textSecondary}`}>Driving outflows from EM</div>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                <div className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-600'}`}>Pull Factors (EM)</div>
                <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>{pushPullBalance.pull}</div>
                <div className={`text-sm ${textSecondary}`}>Attracting inflows to EM</div>
              </div>
              <div className={`p-4 rounded-lg ${
                pushPullBalance.net === 'inflow' 
                  ? (darkMode ? 'bg-green-900' : 'bg-green-100')
                  : pushPullBalance.net === 'outflow'
                    ? (darkMode ? 'bg-red-900' : 'bg-red-100')
                    : (darkMode ? 'bg-gray-700' : 'bg-gray-100')
              }`}>
                <div className={`text-sm font-medium ${textSecondary}`}>Net Assessment</div>
                <div className={`text-3xl font-bold capitalize ${
                  pushPullBalance.net === 'inflow' ? 'text-green-500' 
                  : pushPullBalance.net === 'outflow' ? 'text-red-500' 
                  : textPrimary
                }`}>
                  {pushPullBalance.net}
                </div>
                <div className={`text-sm ${textSecondary}`}>Current capital flow direction</div>
              </div>
            </div>
          </div>

          {/* Push/Pull Factors Grid */}
          <div className={`${cardBg} rounded-xl p-6 shadow-lg ${borderColor} border`}>
            <h4 className={`text-lg font-bold ${textPrimary} mb-4`}>Push & Pull Factors (Calvo Framework)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Push Factors */}
              <div>
                <h5 className={`font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  Push Factors (from Developed Markets)
                </h5>
                <div className="space-y-2">
                  {pushPullFactors.filter(f => f.type === 'push').map(factor => (
                    <div key={factor.id} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`font-medium ${textPrimary}`}>{factor.name}</div>
                          <div className={`text-sm ${textSecondary}`}>{factor.description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            factor.currentLevel === 'high' ? 'bg-red-100 text-red-700' :
                            factor.currentLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {factor.currentLevel}
                          </span>
                          <span className={`text-lg ${factor.direction === 'outflow' ? 'text-red-500' : 'text-green-500'}`}>
                            {factor.direction === 'outflow' ? '↓' : '↑'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pull Factors */}
              <div>
                <h5 className={`font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Pull Factors (from Emerging Markets)
                </h5>
                <div className="space-y-2">
                  {pushPullFactors.filter(f => f.type === 'pull').map(factor => (
                    <div key={factor.id} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`font-medium ${textPrimary}`}>{factor.name}</div>
                          <div className={`text-sm ${textSecondary}`}>{factor.description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            factor.currentLevel === 'high' ? 'bg-green-100 text-green-700' :
                            factor.currentLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {factor.currentLevel}
                          </span>
                          <span className={`text-lg ${factor.direction === 'inflow' ? 'text-green-500' : 'text-red-500'}`}>
                            {factor.direction === 'inflow' ? '↑' : '↓'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Capital Flow Events Timeline */}
          <div className={`${cardBg} rounded-xl p-6 shadow-lg ${borderColor} border`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className={`text-lg font-bold ${textPrimary}`}>Historical Capital Flow Events</h4>
              <div className="flex gap-2">
                {['all', 'sudden_stop', 'capital_bonanza', 'flight_to_safety'].map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedFlowType(type)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedFlowType === type
                        ? type === 'all' 
                          ? 'bg-indigo-600 text-white'
                          : 'text-white'
                        : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`
                    }`}
                    style={{
                      backgroundColor: selectedFlowType === type && type !== 'all'
                        ? getCapitalFlowTypeColor(type as any)
                        : undefined
                    }}
                  >
                    {type === 'all' ? 'All' : getCapitalFlowTypeLabel(type as any)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredCapitalFlows.map(event => (
                <div 
                  key={event.id}
                  className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-l-4`}
                  style={{ borderLeftColor: getCapitalFlowTypeColor(event.type) }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className={`font-semibold ${textPrimary}`}>
                        {event.country} ({event.year}{event.endYear ? `-${event.endYear}` : ''})
                      </div>
                      <div className={`text-sm ${textSecondary} mt-1`}>{event.description}</div>
                    </div>
                    <div className="text-right">
                      <span 
                        className="px-2 py-1 rounded text-xs font-bold text-white"
                        style={{ backgroundColor: getCapitalFlowTypeColor(event.type) }}
                      >
                        {getCapitalFlowTypeLabel(event.type)}
                      </span>
                      <div className={`text-lg font-bold mt-1 ${event.magnitude > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {event.magnitude > 0 ? '+' : ''}{event.magnitude}% GDP
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {event.triggers.slice(0, 3).map((trigger, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded text-xs ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} ${textSecondary}`}>
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exchange Rates Section */}
      {activeSubSection === 'exchange-rates' && (
        <div className="space-y-6">
          <div className={`${cardBg} rounded-xl p-6 shadow-lg ${borderColor} border`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>
              Exchange Rate Theory Frameworks
            </h3>
            <p className={`${textSecondary} mb-6`}>
              Key academic models explaining exchange rate behavior and policy constraints.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Concept List */}
              <div className="space-y-2">
                {exchangeRateConcepts.map(concept => (
                  <button
                    key={concept.id}
                    onClick={() => setSelectedConcept(concept.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedConcept === concept.id
                        ? 'bg-indigo-600 text-white'
                        : `${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} ${textSecondary}`
                    }`}
                  >
                    <div className="font-medium">{concept.name}</div>
                    <div className={`text-sm ${selectedConcept === concept.id ? 'text-indigo-200' : ''}`}>
                      {concept.theorist} ({concept.year})
                    </div>
                  </button>
                ))}
              </div>

              {/* Concept Detail */}
              <div className="lg:col-span-2">
                {exchangeRateConcepts
                  .filter(c => c.id === selectedConcept)
                  .map(concept => (
                    <div key={concept.id} className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                      <h4 className={`text-xl font-bold ${textPrimary} mb-2`}>{concept.name}</h4>
                      <div className={`${textSecondary} mb-4`}>
                        <span className="font-medium">{concept.theorist}</span> ({concept.year})
                      </div>
                      
                      <p className={`${textSecondary} mb-4`}>{concept.description}</p>
                      
                      <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                        <h5 className={`font-semibold ${textPrimary} mb-2`}>Mechanism</h5>
                        <p className={textSecondary}>{concept.mechanism}</p>
                      </div>

                      {concept.formula && (
                        <div className={`p-4 rounded-lg mb-4 font-mono text-sm ${darkMode ? 'bg-gray-800 text-green-400' : 'bg-gray-900 text-green-400'}`}>
                          {concept.formula}
                        </div>
                      )}

                      <div className="mb-4">
                        <h5 className={`font-semibold ${textPrimary} mb-2`}>Implications</h5>
                        <ul className="space-y-1">
                          {concept.implications.map((impl, i) => (
                            <li key={i} className={`flex items-start gap-2 ${textSecondary}`}>
                              <span className="text-indigo-500 mt-1">→</span>
                              {impl}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-amber-50'}`}>
                        <h5 className={`font-semibold ${textPrimary} mb-1`}>Empirical Evidence</h5>
                        <p className={`text-sm ${textSecondary}`}>{concept.empiricalEvidence}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debt Vulnerability Section */}
      {activeSubSection === 'debt-vulnerability' && (
        <div className="space-y-6">
          {/* Vulnerability Concepts */}
          <div className={`${cardBg} rounded-xl p-6 shadow-lg ${borderColor} border`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>
              Debt Vulnerability Concepts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {debtVulnerabilityConcepts.map(concept => (
                <div 
                  key={concept.id}
                  className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg ${
                      concept.concept === 'debt_intolerance' ? 'bg-red-500' :
                      concept.concept === 'original_sin' ? 'bg-amber-500' :
                      'bg-green-500'
                    }`}>
                      {concept.concept === 'debt_intolerance' ? '📊' :
                       concept.concept === 'original_sin' ? '💱' : '🛡️'}
                    </div>
                    <div>
                      <div className={`font-bold ${textPrimary}`}>{concept.name}</div>
                      <div className={`text-xs ${textSecondary}`}>
                        {concept.theorists.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm ${textSecondary} mb-3`}>{concept.description}</p>
                  <div className={`text-xs ${textSecondary} italic`}>
                    {concept.currentRelevance}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Country Vulnerability Matrix */}
          <div className={`${cardBg} rounded-xl p-6 shadow-lg ${borderColor} border`}>
            <h4 className={`text-lg font-bold ${textPrimary} mb-4`}>
              Country Debt Vulnerability Matrix
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${borderColor}`}>
                    <th className={`text-left py-2 px-3 ${textSecondary} font-medium`}>Country</th>
                    <th className={`text-center py-2 px-3 ${textSecondary} font-medium`}>Vulnerability</th>
                    <th className={`text-center py-2 px-3 ${textSecondary} font-medium`}>Debt Intolerance</th>
                    <th className={`text-center py-2 px-3 ${textSecondary} font-medium`}>Original Sin</th>
                    <th className={`text-center py-2 px-3 ${textSecondary} font-medium`}>Safe Haven</th>
                    <th className={`text-center py-2 px-3 ${textSecondary} font-medium`}>Debt/GDP</th>
                    <th className={`text-center py-2 px-3 ${textSecondary} font-medium`}>FX Debt %</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDebtProfiles.map(profile => (
                    <tr 
                      key={profile.countryCode}
                      className={`border-b ${borderColor} cursor-pointer transition-colors ${
                        selectedCountry === profile.countryCode 
                          ? (darkMode ? 'bg-gray-700' : 'bg-indigo-50')
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedCountry(
                        selectedCountry === profile.countryCode ? null : profile.countryCode
                      )}
                    >
                      <td className={`py-3 px-3 ${textPrimary} font-medium`}>
                        <span className="mr-2">{profile.countryCode}</span>
                        {profile.country}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div 
                            className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden"
                          >
                            <div 
                              className="h-full rounded-full"
                              style={{ 
                                width: `${profile.vulnerabilityScore}%`,
                                backgroundColor: getVulnerabilityScoreColor(profile.vulnerabilityScore)
                              }}
                            />
                          </div>
                          <span className={`text-sm font-medium`} style={{ color: getVulnerabilityScoreColor(profile.vulnerabilityScore) }}>
                            {profile.vulnerabilityScore}
                          </span>
                        </div>
                      </td>
                      <td className={`py-3 px-3 text-center ${textSecondary}`}>{profile.debtIntolerance}</td>
                      <td className={`py-3 px-3 text-center ${textSecondary}`}>{profile.originalSinIndex}%</td>
                      <td className="py-3 px-3 text-center">
                        {profile.safeHavenStatus ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className={`py-3 px-3 text-center ${textSecondary}`}>{profile.currentDebtToGdp}%</td>
                      <td className={`py-3 px-3 text-center ${textSecondary}`}>{profile.foreignCurrencyDebtShare}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getVulnerabilityScoreColor(20) }}></div>
                <span className={textSecondary}>Low (0-30)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getVulnerabilityScoreColor(40) }}></div>
                <span className={textSecondary}>Low-Medium (30-50)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getVulnerabilityScoreColor(60) }}></div>
                <span className={textSecondary}>Medium (50-65)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getVulnerabilityScoreColor(75) }}></div>
                <span className={textSecondary}>High (65-80)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getVulnerabilityScoreColor(90) }}></div>
                <span className={textSecondary}>Critical (80+)</span>
              </div>
            </div>
          </div>

          {/* Selected Country Detail */}
          {selectedCountry && (
            <div className={`${cardBg} rounded-xl p-6 shadow-lg ${borderColor} border`}>
              {countryDebtProfiles
                .filter(p => p.countryCode === selectedCountry)
                .map(profile => (
                  <div key={profile.countryCode}>
                    <h4 className={`text-xl font-bold ${textPrimary} mb-4`}>
                      {profile.country} - Debt Profile Analysis
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className={`text-sm ${textSecondary}`}>Overall Vulnerability</div>
                        <div 
                          className="text-3xl font-bold"
                          style={{ color: getVulnerabilityScoreColor(profile.vulnerabilityScore) }}
                        >
                          {profile.vulnerabilityScore}/100
                        </div>
                        <div className={`text-sm ${textSecondary}`}>
                          {getVulnerabilityLevel(profile.vulnerabilityScore)} Risk
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className={`text-sm ${textSecondary}`}>Debt/GDP</div>
                        <div className={`text-3xl font-bold ${textPrimary}`}>{profile.currentDebtToGdp}%</div>
                        <div className={`text-sm ${profile.currentDebtToGdp > 90 ? 'text-red-500' : textSecondary}`}>
                          {profile.currentDebtToGdp > 90 ? 'Above warning threshold' : 'Manageable level'}
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className={`text-sm ${textSecondary}`}>Foreign Currency Debt</div>
                        <div className={`text-3xl font-bold ${profile.foreignCurrencyDebtShare > 50 ? 'text-red-500' : textPrimary}`}>
                          {profile.foreignCurrencyDebtShare}%
                        </div>
                        <div className={`text-sm ${textSecondary}`}>
                          {profile.foreignCurrencyDebtShare > 50 ? 'High FX exposure' : 'Moderate FX exposure'}
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className={`text-sm ${textSecondary}`}>Safe Haven Status</div>
                        <div className={`text-3xl font-bold ${profile.safeHavenStatus ? 'text-green-500' : 'text-amber-500'}`}>
                          {profile.safeHavenStatus ? '✓ Yes' : '✗ No'}
                        </div>
                        <div className={`text-sm ${textSecondary}`}>
                          {profile.reserveCurrencyIssuer ? 'Reserve currency issuer' : 'Non-reserve currency'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
                        <h5 className={`font-semibold ${textPrimary} mb-2`}>Debt Intolerance Assessment</h5>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500 rounded-full"
                              style={{ width: `${profile.debtIntolerance}%` }}
                            />
                          </div>
                          <span className={`font-bold ${textPrimary}`}>{profile.debtIntolerance}/100</span>
                        </div>
                        <p className={`text-sm ${textSecondary} mt-2`}>
                          {profile.debtIntolerance > 70 
                            ? 'High debt intolerance - crisis risk at lower debt levels than DM peers'
                            : profile.debtIntolerance > 40
                              ? 'Moderate debt intolerance - some vulnerability to debt shocks'
                              : 'Low debt intolerance - can sustain higher debt levels'
                          }
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
                        <h5 className={`font-semibold ${textPrimary} mb-2`}>Original Sin Index</h5>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${profile.originalSinIndex}%` }}
                            />
                          </div>
                          <span className={`font-bold ${textPrimary}`}>{profile.originalSinIndex}%</span>
                        </div>
                        <p className={`text-sm ${textSecondary} mt-2`}>
                          {profile.originalSinIndex > 60
                            ? 'High original sin - reliant on foreign currency borrowing, vulnerable to depreciation'
                            : profile.originalSinIndex > 30
                              ? 'Moderate original sin - developing local currency markets'
                              : 'Low original sin - can borrow in own currency internationally'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


'use client';

import React, { useMemo } from 'react';
import { 
  cycleIndicators, 
  getCurrentCyclePhase, 
  getPhaseColor,
  debtCyclePhases,
  type CycleIndicator 
} from '../data/economicCycles';

interface CyclePhaseIndicatorProps {
  isDarkMode: boolean;
}

const CyclePhaseIndicator: React.FC<CyclePhaseIndicatorProps> = ({ isDarkMode }) => {
  const currentPhase = useMemo(() => getCurrentCyclePhase(), []);

  // Calculate overall cycle position based on indicators
  const cycleAssessment = useMemo(() => {
    let warningCount = 0;
    let dangerCount = 0;
    let normalCount = 0;

    cycleIndicators.forEach(indicator => {
      const value = indicator.currentValue;
      if (value >= indicator.dangerThreshold || 
          (indicator.name.includes('Yield') && value <= indicator.dangerThreshold)) {
        dangerCount++;
      } else if (value >= indicator.warningThreshold ||
                 (indicator.name.includes('Yield') && value <= indicator.warningThreshold)) {
        warningCount++;
      } else {
        normalCount++;
      }
    });

    const total = cycleIndicators.length;
    const riskScore = (dangerCount * 2 + warningCount) / (total * 2) * 100;

    let phase: 'early' | 'mid' | 'late' | 'crisis';
    let label: string;
    let color: string;

    if (riskScore < 25) {
      phase = 'early';
      label = 'Early Cycle';
      color = '#22c55e';
    } else if (riskScore < 50) {
      phase = 'mid';
      label = 'Mid Cycle';
      color = '#3b82f6';
    } else if (riskScore < 75) {
      phase = 'late';
      label = 'Late Cycle';
      color = '#f59e0b';
    } else {
      phase = 'crisis';
      label = 'Crisis Warning';
      color = '#ef4444';
    }

    return {
      phase,
      label,
      color,
      riskScore: Math.round(riskScore),
      warningCount,
      dangerCount,
      normalCount
    };
  }, []);

  // Determine gauge position (0-180 degrees)
  const gaugeRotation = (cycleAssessment.riskScore / 100) * 180;

  const getIndicatorStatus = (indicator: CycleIndicator) => {
    const value = indicator.currentValue;
    const isInverted = indicator.name.includes('Yield');
    
    if (isInverted) {
      if (value <= indicator.dangerThreshold) return 'danger';
      if (value <= indicator.warningThreshold) return 'warning';
      return 'normal';
    } else {
      if (value >= indicator.dangerThreshold) return 'danger';
      if (value >= indicator.warningThreshold) return 'warning';
      return 'normal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'danger': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Where Are We in the Cycle?
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Current economic indicators compared to historical patterns
        </p>
      </div>

      <div className="p-6">
        {/* Main Gauge and Phase Display */}
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Semicircle Gauge */}
          <div className="relative flex-shrink-0">
            <svg viewBox="0 0 200 120" className="w-64 h-40">
              {/* Background arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                strokeWidth="16"
                strokeLinecap="round"
              />
              
              {/* Gradient segments */}
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="33%" stopColor="#3b82f6" />
                  <stop offset="66%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              
              {/* Colored arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="16"
                strokeLinecap="round"
                opacity={0.8}
              />
              
              {/* Needle */}
              <g transform={`rotate(${gaugeRotation - 90}, 100, 100)`}>
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="35"
                  stroke={cycleAssessment.color}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="8"
                  fill={cycleAssessment.color}
                />
              </g>
              
              {/* Labels */}
              <text x="15" y="115" className="text-[10px]" fill={isDarkMode ? '#9ca3af' : '#6b7280'}>Early</text>
              <text x="170" y="115" className="text-[10px]" fill={isDarkMode ? '#9ca3af' : '#6b7280'}>Crisis</text>
            </svg>
            
            {/* Center Label */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: cycleAssessment.color }}
              >
                {cycleAssessment.label}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Risk Score: {cycleAssessment.riskScore}%
              </div>
            </div>
          </div>

          {/* Current Phase Info */}
          <div className="flex-1 w-full">
            {currentPhase && (
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getPhaseColor(currentPhase.phase) }}
                  />
                  <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentPhase.name}
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    ({currentPhase.startYear}-Present)
                  </span>
                </div>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {currentPhase.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentPhase.characteristics.slice(0, 3).map((char, idx) => (
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
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                <div className="text-2xl font-bold text-green-500">{cycleAssessment.normalCount}</div>
                <div className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>Normal</div>
              </div>
              <div className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
                <div className="text-2xl font-bold text-amber-500">{cycleAssessment.warningCount}</div>
                <div className={`text-xs ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>Warning</div>
              </div>
              <div className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                <div className="text-2xl font-bold text-red-500">{cycleAssessment.dangerCount}</div>
                <div className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>Elevated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicator Grid */}
        <div className="mt-6">
          <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Key Economic Indicators
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {cycleIndicators.map((indicator, idx) => {
              const status = getIndicatorStatus(indicator);
              const statusColor = getStatusColor(status);
              const percentOfDanger = Math.min(100, (indicator.currentValue / indicator.dangerThreshold) * 100);

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                    isDarkMode 
                      ? 'bg-gray-900/50 border-gray-700 hover:border-gray-600' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {indicator.name}
                    </span>
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0 ml-1"
                      style={{ backgroundColor: statusColor }}
                    />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span 
                      className="text-lg font-bold"
                      style={{ color: statusColor }}
                    >
                      {indicator.currentValue}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {indicator.unit}
                    </span>
                  </div>
                  
                  {/* Mini progress bar */}
                  <div className={`mt-2 h-1 rounded-full overflow-hidden ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, percentOfDanger)}%`,
                        backgroundColor: statusColor
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-1">
                    <span className={`text-[9px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      Avg: {indicator.historicalAverage}{indicator.unit}
                    </span>
                    <span className={`text-[9px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      Danger: {indicator.dangerThreshold}{indicator.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historical Phase Reference */}
        <div className="mt-6">
          <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Dalio&apos;s Long-Term Debt Cycle Phases
          </h4>
          <div className="flex flex-wrap gap-2">
            {debtCyclePhases
              .filter(p => p.cycleType === 'long_term')
              .map((phase, index) => {
                const isCurrent = currentPhase?.id === phase.id;
                // Color palette for each phase
                const phaseColors = [
                  { light: 'border-green-400 text-green-700', dark: 'border-green-500 text-green-400' },      // Recovery
                  { light: 'border-emerald-400 text-emerald-700', dark: 'border-emerald-500 text-emerald-400' }, // Expansion
                  { light: 'border-red-400 text-red-700', dark: 'border-red-500 text-red-400' },              // Shock
                  { light: 'border-blue-400 text-blue-700', dark: 'border-blue-500 text-blue-400' },          // Moderation
                  { light: 'border-purple-400 text-purple-700', dark: 'border-purple-500 text-purple-400' },  // Crisis/QE
                  { light: 'border-amber-400 text-amber-700', dark: 'border-amber-500 text-amber-400' },      // Pandemic
                  { light: 'border-orange-400 text-orange-700', dark: 'border-orange-500 text-orange-400' },  // Normalization
                ];
                const colorSet = phaseColors[index % phaseColors.length];
                
                return (
                  <span
                    key={phase.id}
                    className={`text-xs px-3 py-1.5 rounded-lg border ${
                      isDarkMode 
                        ? `bg-gray-800 ${colorSet.dark}` 
                        : `bg-white ${colorSet.light}`
                    } ${isCurrent ? 'font-semibold ring-2 ring-offset-1 ' + (isDarkMode ? 'ring-white/30' : 'ring-gray-400/50') : ''}`}
                  >
                    {phase.name}
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}> ({phase.startYear}-{phase.endYear > 2025 ? 'now' : phase.endYear})</span>
                    {isCurrent && <span className="ml-1">←</span>}
                  </span>
                );
              })}
          </div>
        </div>

        {/* Disclaimer */}
        <p className={`mt-4 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          This assessment is based on Ray Dalio&apos;s debt cycle framework from &quot;The Changing World Order&quot;. 
          Indicators are approximated and should not be used for investment decisions.
        </p>
      </div>
    </div>
  );
};

export default CyclePhaseIndicator;


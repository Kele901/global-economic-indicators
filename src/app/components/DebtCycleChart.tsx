'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { debtCyclePhases, getPhaseColor, type DebtCyclePhase } from '../data/economicCycles';

// Debt intolerance thresholds (from Handbook of International Economics)
const DEBT_THRESHOLDS = {
  emWarning: 35,      // Emerging market warning threshold
  emDanger: 50,       // EM "debt intolerance" crisis threshold
  dmWarning: 90,      // Developed market warning threshold
  dmDanger: 130,      // DM elevated risk threshold
  safeHavenLimit: 200 // Even safe havens face pressure above this
};

interface DebtCycleChartProps {
  isDarkMode: boolean;
  cycleType?: 'long_term' | 'short_term' | 'both';
  onSelectPhase?: (phase: DebtCyclePhase | null) => void;
  selectedPhase?: DebtCyclePhase | null;
  showDebtIntolerance?: boolean;  // Show Handbook debt intolerance thresholds
}

// Historical debt-to-GDP data (approximated from Federal Reserve data)
const historicalDebtData = [
  { year: 1945, usDebt: 118, privateDebt: 40, phase: 'postwar-recovery' },
  { year: 1950, usDebt: 86, privateDebt: 55, phase: 'postwar-recovery' },
  { year: 1955, usDebt: 66, privateDebt: 65, phase: 'postwar-recovery' },
  { year: 1960, usDebt: 54, privateDebt: 72, phase: 'postwar-recovery' },
  { year: 1965, usDebt: 46, privateDebt: 80, phase: 'great-moderation-start' },
  { year: 1970, usDebt: 37, privateDebt: 88, phase: 'great-moderation-start' },
  { year: 1975, usDebt: 35, privateDebt: 95, phase: 'great-moderation-start' },
  { year: 1980, usDebt: 33, privateDebt: 100, phase: 'volcker-era' },
  { year: 1982, usDebt: 35, privateDebt: 98, phase: 'volcker-era' },
  { year: 1985, usDebt: 43, privateDebt: 110, phase: 'great-moderation' },
  { year: 1990, usDebt: 56, privateDebt: 125, phase: 'great-moderation' },
  { year: 1995, usDebt: 67, privateDebt: 130, phase: 'great-moderation' },
  { year: 2000, usDebt: 58, privateDebt: 140, phase: 'great-moderation' },
  { year: 2005, usDebt: 64, privateDebt: 160, phase: 'great-moderation' },
  { year: 2007, usDebt: 65, privateDebt: 175, phase: 'great-moderation' },
  { year: 2008, usDebt: 74, privateDebt: 172, phase: 'gfc-deleveraging' },
  { year: 2009, usDebt: 87, privateDebt: 165, phase: 'gfc-deleveraging' },
  { year: 2010, usDebt: 95, privateDebt: 158, phase: 'gfc-deleveraging' },
  { year: 2012, usDebt: 103, privateDebt: 150, phase: 'gfc-deleveraging' },
  { year: 2015, usDebt: 105, privateDebt: 148, phase: 'gfc-deleveraging' },
  { year: 2019, usDebt: 108, privateDebt: 150, phase: 'gfc-deleveraging' },
  { year: 2020, usDebt: 134, privateDebt: 160, phase: 'pandemic-response' },
  { year: 2021, usDebt: 128, privateDebt: 155, phase: 'pandemic-response' },
  { year: 2022, usDebt: 123, privateDebt: 150, phase: 'rate-normalization' },
  { year: 2023, usDebt: 123, privateDebt: 148, phase: 'rate-normalization' },
  { year: 2024, usDebt: 124, privateDebt: 150, phase: 'rate-normalization' },
];

// Interest rate history
const interestRateData = [
  { year: 1945, rate: 0.38 },
  { year: 1950, rate: 1.59 },
  { year: 1955, rate: 1.89 },
  { year: 1960, rate: 3.22 },
  { year: 1965, rate: 4.07 },
  { year: 1970, rate: 7.17 },
  { year: 1975, rate: 5.82 },
  { year: 1980, rate: 13.35 },
  { year: 1982, rate: 12.26 },
  { year: 1985, rate: 8.10 },
  { year: 1990, rate: 8.10 },
  { year: 1995, rate: 5.84 },
  { year: 2000, rate: 6.40 },
  { year: 2005, rate: 3.21 },
  { year: 2007, rate: 5.02 },
  { year: 2008, rate: 1.93 },
  { year: 2009, rate: 0.16 },
  { year: 2010, rate: 0.18 },
  { year: 2012, rate: 0.14 },
  { year: 2015, rate: 0.13 },
  { year: 2019, rate: 2.16 },
  { year: 2020, rate: 0.37 },
  { year: 2021, rate: 0.08 },
  { year: 2022, rate: 1.68 },
  { year: 2023, rate: 5.02 },
  { year: 2024, rate: 5.33 },
];

// Combine data
const combinedData = historicalDebtData.map(d => {
  const rateData = interestRateData.find(r => r.year === d.year);
  const phaseData = debtCyclePhases.find(p => p.id === d.phase);
  return {
    ...d,
    rate: rateData?.rate || 0,
    totalDebt: d.usDebt + d.privateDebt,
    phaseName: phaseData?.name || '',
    phaseType: phaseData?.cycleType || 'long_term',
  };
});

const DebtCycleChart: React.FC<DebtCycleChartProps> = ({
  isDarkMode,
  cycleType = 'both',
  onSelectPhase,
  selectedPhase,
  showDebtIntolerance = true
}) => {
  const [activeView, setActiveView] = useState<'debt' | 'rates' | 'combined'>('combined');
  const [hoveredPhase, setHoveredPhase] = useState<DebtCyclePhase | null>(null);
  const [showThresholds, setShowThresholds] = useState(showDebtIntolerance);

  const filteredPhases = useMemo(() => {
    if (cycleType === 'both') return debtCyclePhases;
    return debtCyclePhases.filter(p => p.cycleType === cycleType);
  }, [cycleType]);

  const longTermPhases = filteredPhases.filter(p => p.cycleType === 'long_term');
  const shortTermPhases = filteredPhases.filter(p => p.cycleType === 'short_term');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0]?.payload;
    const phase = debtCyclePhases.find(p => p.id === data?.phase);

    return (
      <div className={`p-3 rounded-lg shadow-xl border ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <div className="font-semibold mb-2">{label}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-4 text-sm">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-medium">
              {entry.name.includes('Rate') ? `${entry.value.toFixed(2)}%` : `${entry.value}%`}
            </span>
          </div>
        ))}
        {phase && (
          <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getPhaseColor(phase.phase) }}
              />
              <span className="text-xs font-medium">{phase.name}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Long-Term Debt Cycle
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              US Government & Private Debt as % of GDP (1945-Present)
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <div className={`flex rounded-lg overflow-hidden border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              {(['combined', 'debt', 'rates'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeView === view
                      ? isDarkMode 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-800 text-gray-400 hover:text-white'
                        : 'bg-gray-50 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {view === 'combined' ? 'All' : view === 'debt' ? 'Debt' : 'Rates'}
                </button>
              ))}
            </div>
            
            {/* Debt Intolerance Toggle */}
            <button
              onClick={() => setShowThresholds(!showThresholds)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                showThresholds
                  ? isDarkMode 
                    ? 'bg-amber-600/20 border-amber-500 text-amber-400' 
                    : 'bg-amber-100 border-amber-300 text-amber-700'
                  : isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
              title="Show Debt Intolerance Thresholds (Handbook of Int'l Economics)"
            >
              📊 Thresholds
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combinedData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="totalDebtGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="publicDebtGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="privateDebtGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                vertical={false}
              />

              <XAxis 
                dataKey="year" 
                stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
                tick={{ fontSize: 11 }}
                tickLine={false}
              />

              <YAxis 
                yAxisId="debt"
                stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
                tick={{ fontSize: 11 }}
                tickLine={false}
                domain={[0, 300]}
                label={{ 
                  value: 'Debt (% GDP)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { 
                    textAnchor: 'middle',
                    fill: isDarkMode ? '#6b7280' : '#9ca3af',
                    fontSize: 11
                  }
                }}
              />

              {(activeView === 'rates' || activeView === 'combined') && (
                <YAxis 
                  yAxisId="rates"
                  orientation="right"
                  stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  domain={[0, 20]}
                  label={{ 
                    value: 'Fed Rate (%)', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { 
                      textAnchor: 'middle',
                      fill: isDarkMode ? '#6b7280' : '#9ca3af',
                      fontSize: 11
                    }
                  }}
                />
              )}

              <Tooltip content={<CustomTooltip />} />

              <Legend 
                wrapperStyle={{ paddingTop: 20 }}
                iconType="circle"
                iconSize={8}
              />

              {/* Phase Reference Areas */}
              {longTermPhases.map(phase => (
                <ReferenceArea
                  key={phase.id}
                  yAxisId="debt"
                  x1={phase.startYear}
                  x2={Math.min(phase.endYear, 2024)}
                  fill={getPhaseColor(phase.phase)}
                  fillOpacity={hoveredPhase?.id === phase.id ? 0.15 : 0.05}
                  onMouseEnter={() => setHoveredPhase(phase)}
                  onMouseLeave={() => setHoveredPhase(null)}
                  onClick={() => onSelectPhase?.(selectedPhase?.id === phase.id ? null : phase)}
                  style={{ cursor: 'pointer' }}
                />
              ))}

              {/* Debt Areas */}
              {(activeView === 'debt' || activeView === 'combined') && (
                <>
                  <Area
                    yAxisId="debt"
                    type="monotone"
                    dataKey="totalDebt"
                    name="Total Debt"
                    stroke="#8b5cf6"
                    fill="url(#totalDebtGradient)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="debt"
                    type="monotone"
                    dataKey="usDebt"
                    name="Public Debt"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="debt"
                    type="monotone"
                    dataKey="privateDebt"
                    name="Private Debt"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </>
              )}

              {/* Interest Rate Line */}
              {(activeView === 'rates' || activeView === 'combined') && (
                <Line
                  yAxisId="rates"
                  type="monotone"
                  dataKey="rate"
                  name="Fed Funds Rate"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              )}

              {/* Debt Intolerance Threshold Lines (Handbook of Int'l Economics) */}
              {showThresholds && (activeView === 'debt' || activeView === 'combined') && (
                <>
                  {/* EM Debt Intolerance Zone */}
                  <ReferenceArea
                    yAxisId="debt"
                    y1={DEBT_THRESHOLDS.emWarning}
                    y2={DEBT_THRESHOLDS.emDanger}
                    fill="#f59e0b"
                    fillOpacity={0.08}
                    label={{
                      value: 'EM Warning Zone (35-50%)',
                      position: 'insideTopRight',
                      fill: isDarkMode ? '#fbbf24' : '#d97706',
                      fontSize: 8
                    }}
                  />
                  <ReferenceLine 
                    yAxisId="debt"
                    y={DEBT_THRESHOLDS.emDanger}
                    stroke="#f59e0b"
                    strokeDasharray="6 3"
                    strokeOpacity={0.6}
                    label={{ 
                      value: 'EM Debt Intolerance (50%)', 
                      position: 'insideBottomRight',
                      fill: isDarkMode ? '#fbbf24' : '#d97706',
                      fontSize: 8
                    }}
                  />
                  
                  {/* DM Warning Zone */}
                  <ReferenceArea
                    yAxisId="debt"
                    y1={DEBT_THRESHOLDS.dmWarning}
                    y2={DEBT_THRESHOLDS.dmDanger}
                    fill="#ef4444"
                    fillOpacity={0.05}
                  />
                  <ReferenceLine 
                    yAxisId="debt"
                    y={DEBT_THRESHOLDS.dmWarning}
                    stroke="#ef4444"
                    strokeDasharray="6 3"
                    strokeOpacity={0.5}
                    label={{ 
                      value: 'DM Warning (90%)', 
                      position: 'insideBottomLeft',
                      fill: isDarkMode ? '#f87171' : '#dc2626',
                      fontSize: 8
                    }}
                  />
                  
                  {/* Safe Haven Elevated Risk */}
                  <ReferenceLine 
                    yAxisId="debt"
                    y={DEBT_THRESHOLDS.safeHavenLimit}
                    stroke="#a855f7"
                    strokeDasharray="3 3"
                    strokeOpacity={0.4}
                    label={{ 
                      value: 'Safe Haven Stress (200%)', 
                      position: 'insideTopRight',
                      fill: isDarkMode ? '#c084fc' : '#9333ea',
                      fontSize: 8
                    }}
                  />
                </>
              )}

              {/* Key Event Reference Lines */}
              <ReferenceLine 
                yAxisId="debt"
                x={1971} 
                stroke={isDarkMode ? '#fbbf24' : '#d97706'}
                strokeDasharray="4 4"
                label={{ 
                  value: 'End Gold Standard', 
                  position: 'top',
                  fill: isDarkMode ? '#fbbf24' : '#d97706',
                  fontSize: 9
                }}
              />
              <ReferenceLine 
                yAxisId="debt"
                x={2008} 
                stroke={isDarkMode ? '#ef4444' : '#dc2626'}
                strokeDasharray="4 4"
                label={{ 
                  value: 'GFC', 
                  position: 'top',
                  fill: isDarkMode ? '#ef4444' : '#dc2626',
                  fontSize: 9
                }}
              />
              <ReferenceLine 
                yAxisId="debt"
                x={2020} 
                stroke={isDarkMode ? '#a855f7' : '#9333ea'}
                strokeDasharray="4 4"
                label={{ 
                  value: 'COVID', 
                  position: 'top',
                  fill: isDarkMode ? '#a855f7' : '#9333ea',
                  fontSize: 9
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Phase Timeline */}
      <div className={`px-4 pb-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h4 className={`text-xs font-semibold mt-3 mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          LONG-TERM DEBT CYCLE PHASES
        </h4>
        <div className="flex flex-wrap gap-2">
          {longTermPhases.map((phase, index) => {
            // Color palette matching CyclePhaseIndicator
            const phaseColors = [
              { light: 'border-green-400 text-green-700', dark: 'border-green-500 text-green-400' },
              { light: 'border-emerald-400 text-emerald-700', dark: 'border-emerald-500 text-emerald-400' },
              { light: 'border-red-400 text-red-700', dark: 'border-red-500 text-red-400' },
              { light: 'border-blue-400 text-blue-700', dark: 'border-blue-500 text-blue-400' },
              { light: 'border-purple-400 text-purple-700', dark: 'border-purple-500 text-purple-400' },
              { light: 'border-amber-400 text-amber-700', dark: 'border-amber-500 text-amber-400' },
              { light: 'border-orange-400 text-orange-700', dark: 'border-orange-500 text-orange-400' },
            ];
            const colorSet = phaseColors[index % phaseColors.length];
            const isSelected = selectedPhase?.id === phase.id;
            
            return (
              <button
                key={phase.id}
                onClick={() => onSelectPhase?.(isSelected ? null : phase)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  isDarkMode 
                    ? `bg-gray-800 ${colorSet.dark}` 
                    : `bg-white ${colorSet.light}`
                } ${isSelected ? 'font-semibold ring-2 ring-offset-1 ' + (isDarkMode ? 'ring-white/30' : 'ring-gray-400/50') : ''}`}
              >
                {phase.name}
                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}> ({phase.startYear}-{phase.endYear > 2025 ? 'now' : phase.endYear})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Debt Intolerance Explanation */}
      {showThresholds && (
        <div className={`px-4 pb-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
            <h5 className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
              📚 Debt Intolerance (Reinhart, Rogoff & Savastano)
            </h5>
            <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <strong>Debt intolerance</strong> refers to the inability of emerging markets to manage levels of external 
              debt that would be manageable for advanced economies. Countries with a history of default face crisis at 
              much lower debt-to-GDP ratios (35-50%) than developed markets (90%+).
            </p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className={`p-2 rounded text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="text-amber-500 font-bold text-sm">35-50%</div>
                <div className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>EM Crisis Zone</div>
              </div>
              <div className={`p-2 rounded text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="text-red-500 font-bold text-sm">90%</div>
                <div className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>DM Warning</div>
              </div>
              <div className={`p-2 rounded text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="text-green-500 font-bold text-sm">124%</div>
                <div className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>US Current</div>
              </div>
            </div>
            <p className={`text-[10px] mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              The US benefits from &quot;safe haven&quot; status and reserve currency privilege, allowing higher debt tolerance. 
              This privilege may diminish over time.
            </p>
          </div>
        </div>
      )}

      {/* Selected Phase Details */}
      {selectedPhase && (
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getPhaseColor(selectedPhase.phase) }}
                />
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedPhase.name}
                </h4>
                <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  ({selectedPhase.startYear} - {selectedPhase.endYear})
                </span>
              </div>
              <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedPhase.description}
              </p>
            </div>
            <button
              onClick={() => onSelectPhase?.(null)}
              className={`p-1 rounded-full hover:bg-gray-700/50 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Phase Indicators */}
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Interest Rates</div>
              <div className={`text-sm font-semibold ${
                selectedPhase.interestRateTrend === 'rising' ? 'text-red-500' :
                selectedPhase.interestRateTrend === 'falling' ? 'text-green-500' :
                selectedPhase.interestRateTrend === 'high' ? 'text-red-400' :
                'text-green-400'
              }`}>
                {selectedPhase.interestRateTrend.charAt(0).toUpperCase() + selectedPhase.interestRateTrend.slice(1)}
              </div>
            </div>
            <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Debt Trend</div>
              <div className={`text-sm font-semibold ${
                selectedPhase.debtTrend === 'rising' ? 'text-red-500' :
                selectedPhase.debtTrend === 'falling' ? 'text-green-500' :
                'text-yellow-500'
              }`}>
                {selectedPhase.debtTrend.charAt(0).toUpperCase() + selectedPhase.debtTrend.slice(1)}
              </div>
            </div>
            <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Asset Prices</div>
              <div className={`text-sm font-semibold ${
                selectedPhase.assetPrices === 'rising' ? 'text-green-500' :
                selectedPhase.assetPrices === 'falling' ? 'text-red-500' :
                'text-yellow-500'
              }`}>
                {selectedPhase.assetPrices.charAt(0).toUpperCase() + selectedPhase.assetPrices.slice(1)}
              </div>
            </div>
          </div>

          {/* Characteristics */}
          <div className="flex flex-wrap gap-1">
            {selectedPhase.characteristics.map((char, idx) => (
              <span 
                key={idx}
                className={`text-xs px-2 py-1 rounded ${
                  isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
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
};

export default DebtCycleChart;


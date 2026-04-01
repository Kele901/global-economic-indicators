'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  TooltipProps,
} from 'recharts';
import {
  historicalMarketData,
  sectorRotations,
  globalMarketClock,
  getBuffettIndicatorZone,
  getCAPEZone,
  type SectorRotation,
  type MarketClockPosition,
} from '../data/marketCyclesData';

interface MarketCycleIndicatorsProps {
  isDarkMode: boolean;
}

type ViewKey = 'buffett' | 'cape' | 'clock' | 'sectors';

const viewLabels: Record<ViewKey, string> = {
  buffett: 'Buffett Indicator',
  cape: 'Shiller CAPE',
  clock: 'Global Market Clock',
  sectors: 'Sector Rotation',
};

const policyIcon = (stance: MarketClockPosition['policyStance']) => {
  if (stance === 'easing') return '↓';
  if (stance === 'tightening') return '↑';
  return '→';
};

const perfBadge = (level: SectorRotation['bondPerformance'], isDark: boolean) => {
  const map: Record<string, { text: string; bg: string; fg: string }> = {
    strong: { text: 'Strong', bg: isDark ? 'bg-green-900/50' : 'bg-green-100', fg: 'text-green-400' },
    moderate: { text: 'Moderate', bg: isDark ? 'bg-yellow-900/50' : 'bg-yellow-100', fg: 'text-yellow-500' },
    weak: { text: 'Weak', bg: isDark ? 'bg-red-900/50' : 'bg-red-100', fg: 'text-red-400' },
  };
  const s = map[level];
  return (
    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${s.bg} ${s.fg}`}>
      {s.text}
    </span>
  );
};

const CustomBuffettTooltip = ({ active, payload, label, isDarkMode }: TooltipProps<number, string> & { isDarkMode: boolean }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value as number;
  const zone = getBuffettIndicatorZone(val);
  return (
    <div className={`rounded-lg border px-3 py-2 text-xs shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}>
      <p className="font-semibold mb-1">{label}</p>
      <p>Buffett Indicator: <span className="font-bold" style={{ color: zone.color }}>{val}%</span></p>
      <p className="mt-0.5" style={{ color: zone.color }}>{zone.label}</p>
    </div>
  );
};

const CustomCAPETooltip = ({ active, payload, label, isDarkMode }: TooltipProps<number, string> & { isDarkMode: boolean }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value as number;
  const zone = getCAPEZone(val);
  return (
    <div className={`rounded-lg border px-3 py-2 text-xs shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}>
      <p className="font-semibold mb-1">{label}</p>
      <p>CAPE Ratio: <span className="font-bold" style={{ color: zone.color }}>{val}</span></p>
      <p className="mt-0.5" style={{ color: zone.color }}>{zone.label}</p>
    </div>
  );
};

const capeAnnotations: { year: number; label: string; y: number }[] = [
  { year: 2000, label: 'Dot-Com Peak', y: 44.2 },
  { year: 2009, label: 'GFC Trough', y: 13.3 },
  { year: 1982, label: 'Volcker Low', y: 7.4 },
  { year: 2021, label: 'Post-COVID Peak', y: 38.3 },
];

export default function MarketCycleIndicators({ isDarkMode }: MarketCycleIndicatorsProps) {
  const [activeView, setActiveView] = useState<ViewKey>('buffett');

  const axisStroke = isDarkMode ? '#6b7280' : '#9ca3af';
  const gridStroke = isDarkMode ? '#374151' : '#e5e7eb';

  const latestData = historicalMarketData[historicalMarketData.length - 1];
  const currentBuffett = latestData.buffettIndicator ?? 0;
  const currentCAPE = latestData.shillerCAPE ?? 0;
  const buffettZone = getBuffettIndicatorZone(currentBuffett);
  const capeZone = getCAPEZone(currentCAPE);

  const phaseOrder: SectorRotation['phase'][] = ['early', 'mid', 'late', 'recession'];
  const phaseLabels: Record<string, string> = {
    early: 'Early Cycle',
    mid: 'Mid Cycle',
    late: 'Late Cycle',
    recession: 'Recession',
  };
  const phaseColors: Record<string, string> = {
    early: '#22c55e',
    mid: '#3b82f6',
    late: '#f59e0b',
    recession: '#ef4444',
  };

  const groupedByPhase = phaseOrder.reduce<Record<string, MarketClockPosition[]>>((acc, phase) => {
    acc[phase] = globalMarketClock.filter((m) => m.phase === phase);
    return acc;
  }, {});

  const currentSectorPhase: SectorRotation['phase'] = 'late';
  const sectorMap = sectorRotations.reduce<Record<string, SectorRotation>>((acc, s) => {
    acc[s.phase] = s;
    return acc;
  }, {});

  return (
    <div className={`rounded-2xl border p-5 ${isDarkMode ? 'bg-gray-900/60 border-gray-700/50' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Market Valuation &amp; Cycle Positioning
        </h2>
        <div className="flex gap-1.5 flex-wrap">
          {(['buffett', 'cape', 'clock', 'sectors'] as ViewKey[]).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeView === view
                  ? isDarkMode
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-blue-500 text-white shadow-md'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {viewLabels[view]}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'buffett' && (
        <div>
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className={`rounded-xl px-4 py-2.5 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Current Value
              </p>
              <p className="text-2xl font-bold" style={{ color: buffettZone.color }}>
                {currentBuffett}%
              </p>
            </div>
            <div>
              <span
                className="inline-block text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${buffettZone.color}20`, color: buffettZone.color }}
              >
                {buffettZone.label}
              </span>
              <p className={`text-[11px] mt-1 max-w-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {buffettZone.assessment}
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={historicalMarketData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="buffettGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="year" stroke={axisStroke} tick={{ fontSize: 11 }} />
              <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} domain={[30, 210]} />
              <Tooltip content={<CustomBuffettTooltip isDarkMode={isDarkMode} />} />
              <ReferenceArea y1={0} y2={75} fill="#22c55e" fillOpacity={0.06} />
              <ReferenceArea y1={75} y2={115} fill="#fbbf24" fillOpacity={0.06} />
              <ReferenceArea y1={115} y2={140} fill="#f97316" fillOpacity={0.06} />
              <ReferenceArea y1={140} y2={210} fill="#ef4444" fillOpacity={0.06} />
              <ReferenceLine y={100} stroke="#6b7280" strokeDasharray="6 3" label={{ value: 'Fair Value', fill: axisStroke, fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine y={75} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Undervalued', fill: '#22c55e', fontSize: 10, position: 'insideBottomRight' }} />
              <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Overvalued', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
              <Area
                type="monotone"
                dataKey="buffettIndicator"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#buffettGrad)"
                dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className={`text-[10px] mt-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            Total US stock market capitalization as a percentage of GDP. Source: Federal Reserve, BEA.
          </p>
        </div>
      )}

      {activeView === 'cape' && (
        <div>
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className={`rounded-xl px-4 py-2.5 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Current CAPE
              </p>
              <p className="text-2xl font-bold" style={{ color: capeZone.color }}>
                {currentCAPE}
              </p>
            </div>
            <div>
              <span
                className="inline-block text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${capeZone.color}20`, color: capeZone.color }}
              >
                {capeZone.label}
              </span>
              <p className={`text-[11px] mt-1 max-w-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Historical average ~17. Values above 30 have preceded major corrections.
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={historicalMarketData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="capeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="year" stroke={axisStroke} tick={{ fontSize: 11 }} />
              <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} domain={[5, 50]} />
              <Tooltip content={<CustomCAPETooltip isDarkMode={isDarkMode} />} />
              <ReferenceLine y={17} stroke="#6b7280" strokeDasharray="6 3" label={{ value: 'Hist. Avg (~17)', fill: axisStroke, fontSize: 10, position: 'insideTopRight' }} />
              {capeAnnotations.map((a) => (
                <ReferenceLine
                  key={a.label}
                  x={a.year}
                  stroke={isDarkMode ? '#4b5563' : '#d1d5db'}
                  strokeDasharray="3 3"
                  label={{ value: a.label, fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 9, position: 'top', offset: 8 }}
                />
              ))}
              <Area
                type="monotone"
                dataKey="shillerCAPE"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#capeGrad)"
                dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className={`text-[10px] mt-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            Cyclically Adjusted Price-to-Earnings ratio (Shiller P/E). 10-year inflation-adjusted earnings.
          </p>
        </div>
      )}

      {activeView === 'clock' && (
        <div>
          <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            12 major economies positioned by estimated business-cycle phase
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {phaseOrder.map((phase) => (
              <div
                key={phase}
                className={`rounded-xl border p-3.5 ${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: phaseColors[phase] }}
                  />
                  <h3
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: phaseColors[phase] }}
                  >
                    {phaseLabels[phase]}
                  </h3>
                  <span className={`ml-auto text-[10px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    {groupedByPhase[phase].length} economies
                  </span>
                </div>
                <div className="space-y-2">
                  {groupedByPhase[phase].map((m) => (
                    <div
                      key={m.code}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${isDarkMode ? 'bg-gray-900/60' : 'bg-white'}`}
                    >
                      <span className={`font-bold w-7 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {m.code}
                      </span>
                      <span className={`flex-1 truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {m.country}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${phaseColors[phase]}18`,
                          color: phaseColors[phase],
                        }}
                      >
                        {phase}
                      </span>
                      <span className={`text-[10px] w-14 text-right ${m.gdpGrowth >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                        GDP {m.gdpGrowth > 0 ? '+' : ''}{m.gdpGrowth}%
                      </span>
                      <span className={`text-[10px] w-14 text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        CPI {m.inflationRate}%
                      </span>
                      <span
                        className="text-sm w-5 text-center"
                        title={`Policy: ${m.policyStance}`}
                      >
                        {policyIcon(m.policyStance)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={`flex items-center gap-4 mt-3 text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <span>↑ Tightening</span>
            <span>→ Neutral</span>
            <span>↓ Easing</span>
          </div>
        </div>
      )}

      {activeView === 'sectors' && (
        <div>
          <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Classic sector rotation through the business cycle — estimated current phase:{' '}
            <span className="font-bold" style={{ color: phaseColors[currentSectorPhase] }}>
              {phaseLabels[currentSectorPhase]}
            </span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {phaseOrder.map((phase) => {
              const s = sectorMap[phase];
              const isCurrent = phase === currentSectorPhase;
              return (
                <div
                  key={phase}
                  className={`rounded-xl border p-4 transition-all ${
                    isCurrent
                      ? isDarkMode
                        ? 'border-blue-500/60 bg-blue-950/20 ring-1 ring-blue-500/30'
                        : 'border-blue-400 bg-blue-50/60 ring-1 ring-blue-300'
                      : isDarkMode
                        ? 'border-gray-700/50 bg-gray-800/60'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <h3
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: s.color }}
                    >
                      {s.label}
                    </h3>
                    {isCurrent && (
                      <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                        Current
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] mb-3 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {s.description}
                  </p>

                  <div className="space-y-2 mb-3">
                    <div>
                      <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-green-400/80' : 'text-green-600'}`}>
                        Leading Sectors
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {s.leadingSectors.map((sec) => (
                          <span
                            key={sec}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}
                          >
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-red-400/80' : 'text-red-600'}`}>
                        Lagging Sectors
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {s.laggingSectors.map((sec) => (
                          <span
                            key={sec}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}
                          >
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={`border-t pt-2.5 ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3 text-[10px]">
                      <div className="flex items-center gap-1">
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Bonds</span>
                        {perfBadge(s.bondPerformance, isDarkMode)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Stocks</span>
                        {perfBadge(s.stockPerformance, isDarkMode)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Commod.</span>
                        {perfBadge(s.commodityPerformance, isDarkMode)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            {phaseOrder.map((phase, i) => (
              <React.Fragment key={phase}>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-md ${phase === currentSectorPhase ? 'ring-1' : ''}`}
                  style={{
                    backgroundColor: `${phaseColors[phase]}18`,
                    color: phaseColors[phase],
                    boxShadow: phase === currentSectorPhase ? `0 0 0 2px ${phaseColors[phase]}` : 'none',
                  }}
                >
                  {phaseLabels[phase]}
                </span>
                {i < phaseOrder.length - 1 && (
                  <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

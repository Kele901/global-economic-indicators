'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  ComposedChart,
  Bar,
  Cell,
} from 'recharts';
import {
  monetaryRegimes,
  centralBankRateHistory,
  m2GrowthHistory,
  type MonetaryRegime,
} from '../data/marketCyclesData';

interface MonetaryPolicyRegimeTimelineProps {
  isDarkMode: boolean;
}

type ActiveView = 'regimes' | 'rates' | 'm2';

const viewTabs: { key: ActiveView; label: string }[] = [
  { key: 'regimes', label: 'Policy Regimes' },
  { key: 'rates', label: 'Central Bank Rates' },
  { key: 'm2', label: 'Money Supply' },
];

const bankColors = {
  fed: '#3b82f6',
  boe: '#ef4444',
  ecb: '#8b5cf6',
  boj: '#22c55e',
};

const bankLabels: Record<string, string> = {
  fed: 'Federal Reserve',
  boe: 'Bank of England',
  ecb: 'European Central Bank',
  boj: 'Bank of Japan',
};

const MonetaryPolicyRegimeTimeline: React.FC<MonetaryPolicyRegimeTimelineProps> = ({
  isDarkMode,
}) => {
  const [activeView, setActiveView] = useState<ActiveView>('regimes');
  const [selectedRegime, setSelectedRegime] = useState<MonetaryRegime | null>(null);
  const [hoveredRegime, setHoveredRegime] = useState<MonetaryRegime | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const timelineHeight = 420;
  const padding = { left: 50, right: 40, top: 70, bottom: 60 };
  const chartWidth = containerWidth - padding.left - padding.right;

  const tlStartYear = 1870;
  const tlEndYear = 2030;
  const totalYears = tlEndYear - tlStartYear;

  const yearToX = useCallback(
    (year: number) => padding.left + ((year - tlStartYear) / totalYears) * chartWidth,
    [chartWidth]
  );

  const yearMarkers: number[] = [];
  for (let y = 1880; y <= 2020; y += 20) yearMarkers.push(y);

  const regimeBarHeight = 32;
  const regimeGap = 6;
  const regimeStartY = padding.top + 10;

  const handleRegimeMouseMove = (e: React.MouseEvent, regime: MonetaryRegime) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    setHoveredRegime(regime);
  };

  const allKeyEvents = monetaryRegimes.flatMap((r) =>
    r.keyEvents.map((ev) => ({ ...ev, regimeColor: r.color, regimeId: r.id }))
  );

  const renderRegimeTimeline = () => {
    const eventY =
      regimeStartY + monetaryRegimes.length * (regimeBarHeight + regimeGap) + 16;

    return (
      <div ref={containerRef} className="relative w-full" style={{ minHeight: timelineHeight + 80 }}>
        <svg width="100%" height={timelineHeight} className="overflow-visible">
          {yearMarkers.map((year) => (
            <g key={year}>
              <line
                x1={yearToX(year)}
                y1={padding.top}
                x2={yearToX(year)}
                y2={timelineHeight - padding.bottom}
                stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
                strokeDasharray="4,4"
              />
              <text
                x={yearToX(year)}
                y={timelineHeight - padding.bottom + 18}
                textAnchor="middle"
                className={`text-[10px] ${isDarkMode ? 'fill-gray-500' : 'fill-gray-400'}`}
              >
                {year}
              </text>
            </g>
          ))}

          <line
            x1={yearToX(2026)}
            y1={padding.top - 10}
            x2={yearToX(2026)}
            y2={timelineHeight - padding.bottom}
            stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
            strokeWidth={2}
            strokeDasharray="6,3"
          />
          <text
            x={yearToX(2026)}
            y={padding.top - 16}
            textAnchor="middle"
            className={`text-[10px] font-semibold ${isDarkMode ? 'fill-blue-400' : 'fill-blue-600'}`}
          >
            Today
          </text>

          {monetaryRegimes.map((regime, idx) => {
            const y = regimeStartY + idx * (regimeBarHeight + regimeGap);
            const x = yearToX(regime.startYear);
            const w = yearToX(regime.endYear) - x;
            const isSelected = selectedRegime?.id === regime.id;
            const isHovered = hoveredRegime?.id === regime.id;
            const opacity = isSelected || isHovered ? 1 : 0.75;

            return (
              <g
                key={regime.id}
                className="cursor-pointer"
                onClick={() =>
                  setSelectedRegime(selectedRegime?.id === regime.id ? null : regime)
                }
                onMouseMove={(e) => handleRegimeMouseMove(e, regime)}
                onMouseLeave={() => setHoveredRegime(null)}
              >
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={regimeBarHeight}
                  rx={4}
                  fill={regime.color}
                  opacity={opacity}
                  className="transition-opacity duration-200"
                />

                {w > 60 && (
                  <text
                    x={x + w / 2}
                    y={y + regimeBarHeight / 2 + 4}
                    textAnchor="middle"
                    className="text-[10px] font-semibold fill-white"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
                  >
                    {regime.name}
                  </text>
                )}

                {isSelected && (
                  <rect
                    x={x - 2}
                    y={y - 2}
                    width={w + 4}
                    height={regimeBarHeight + 4}
                    rx={6}
                    fill="none"
                    stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
                    strokeWidth={2}
                  />
                )}
              </g>
            );
          })}

          {allKeyEvents.map((ev, idx) => {
            const cx = yearToX(ev.year);
            if (cx < padding.left || cx > containerWidth - padding.right) return null;
            return (
              <g key={`${ev.regimeId}-${idx}`}>
                <rect
                  x={cx - 4}
                  y={eventY - 4}
                  width={8}
                  height={8}
                  fill={ev.regimeColor}
                  opacity={0.8}
                  transform={`rotate(45, ${cx}, ${eventY})`}
                />
              </g>
            );
          })}

          <text
            x={padding.left}
            y={eventY + 18}
            className={`text-[9px] ${isDarkMode ? 'fill-gray-500' : 'fill-gray-400'}`}
          >
            ◆ Key events
          </text>
        </svg>

        {hoveredRegime && (
          <div
            className={`absolute z-50 p-3 rounded-lg shadow-xl border max-w-xs pointer-events-none ${
              isDarkMode
                ? 'bg-gray-900 border-gray-700 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
            style={{
              left: Math.min(tooltipPos.x + 12, containerWidth - 280),
              top: Math.min(tooltipPos.y + 12, timelineHeight - 120),
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: hoveredRegime.color }}
              />
              <span className="font-semibold text-sm">{hoveredRegime.name}</span>
            </div>
            <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {hoveredRegime.startYear}–{hoveredRegime.endYear}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {hoveredRegime.description}
            </p>
            <p className={`text-[10px] mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Click for details
            </p>
          </div>
        )}

        {selectedRegime && (
          <div
            className={`mt-2 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedRegime.color }}
                />
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRegime.name}{' '}
                  <span className={`text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({selectedRegime.startYear}–{selectedRegime.endYear})
                  </span>
                </h4>
              </div>
              <button
                onClick={() => setSelectedRegime(null)}
                className={`p-1 rounded-full ${
                  isDarkMode ? 'hover:bg-gray-700/50 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {selectedRegime.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {selectedRegime.characteristics.map((c) => (
                <span
                  key={c}
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-[10px] uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Avg Inflation
                </div>
                <div className={`text-lg font-bold ${selectedRegime.averageInflation > 5 ? 'text-red-400' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRegime.averageInflation}%
                </div>
              </div>
              <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-[10px] uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Avg Growth
                </div>
                <div className={`text-lg font-bold ${selectedRegime.averageGrowth > 3 ? 'text-green-400' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRegime.averageGrowth}%
                </div>
              </div>
              <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-[10px] uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Duration
                </div>
                <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRegime.endYear - selectedRegime.startYear} yrs
                </div>
              </div>
              <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-[10px] uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Key Events
                </div>
                <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRegime.keyEvents.length}
                </div>
              </div>
            </div>

            <div>
              <h5 className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                KEY EVENTS
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedRegime.keyEvents.map((ev, idx) => (
                  <div
                    key={idx}
                    className={`px-2 py-1 rounded text-xs ${
                      isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="font-semibold">{ev.year}:</span> {ev.event}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const RatesTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number | null; color: string }>; label?: number }) => {
    if (!active || !payload) return null;
    return (
      <div
        className={`p-3 rounded-lg shadow-xl border ${
          isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        <div className="font-semibold text-sm mb-1">{label}</div>
        {payload.map((entry) =>
          entry.value != null ? (
            <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                {bankLabels[entry.dataKey] ?? entry.dataKey}:
              </span>
              <span className="font-medium">{entry.value}%</span>
            </div>
          ) : null
        )}
      </div>
    );
  };

  const renderCentralBankRates = () => {
    const regimesInRange = monetaryRegimes.filter(
      (r) => r.endYear >= 1970 && r.startYear <= 2025
    );

    const significantEvents = [
      { year: 1973, label: 'OPEC Embargo' },
      { year: 1979, label: 'Volcker' },
      { year: 1999, label: 'Euro Launch' },
      { year: 2008, label: 'GFC' },
      { year: 2020, label: 'COVID' },
      { year: 2022, label: 'Hike Cycle' },
    ];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={centralBankRateHistory} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <defs>
            {Object.entries(bankColors).map(([key, color]) => (
              <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
          />

          {regimesInRange.map((r) => (
            <ReferenceArea
              key={r.id}
              x1={Math.max(r.startYear, 1970)}
              x2={Math.min(r.endYear, 2025)}
              fill={r.color}
              fillOpacity={0.06}
            />
          ))}

          {significantEvents.map((ev) => (
            <ReferenceLine
              key={ev.year}
              x={ev.year}
              stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
              strokeDasharray="3 3"
              label={{
                value: ev.label,
                position: 'top',
                fill: isDarkMode ? '#9ca3af' : '#6b7280',
                fontSize: 9,
              }}
            />
          ))}

          <XAxis
            dataKey="year"
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: isDarkMode ? '#374151' : '#d1d5db' }}
          />
          <YAxis
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: isDarkMode ? '#374151' : '#d1d5db' }}
            tickFormatter={(v: number) => `${v}%`}
            domain={[-1, 'auto']}
          />
          <Tooltip content={<RatesTooltip />} />
          <Legend iconType="circle" iconSize={8} />

          <Line
            type="monotone"
            dataKey="fed"
            name="Federal Reserve"
            stroke={bankColors.fed}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="boe"
            name="Bank of England"
            stroke={bankColors.boe}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="ecb"
            name="European Central Bank"
            stroke={bankColors.ecb}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="boj"
            name="Bank of Japan"
            stroke={bankColors.boj}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const M2Tooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: number }) => {
    if (!active || !payload?.[0]) return null;
    const val = payload[0].value;
    return (
      <div
        className={`p-3 rounded-lg shadow-xl border ${
          isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        <div className="font-semibold text-sm mb-1">{label}</div>
        <div className="flex items-center gap-2 text-xs">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: val >= 0 ? '#22c55e' : '#ef4444' }}
          />
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>M2 YoY:</span>
          <span className="font-medium">
            {val > 0 ? '+' : ''}
            {val}%
          </span>
        </div>
        {val > 20 && (
          <div className="mt-1 text-[10px] text-amber-400">⚠ Extreme monetary expansion</div>
        )}
      </div>
    );
  };

  const renderM2 = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={m2GrowthHistory} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
        <defs>
          <linearGradient id="m2-positive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="m2-negative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
        />
        <XAxis
          dataKey="year"
          tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: isDarkMode ? '#374151' : '#d1d5db' }}
        />
        <YAxis
          tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: isDarkMode ? '#374151' : '#d1d5db' }}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip content={<M2Tooltip />} />
        <ReferenceLine
          y={0}
          stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
          strokeWidth={1.5}
        />

        <ReferenceLine
          x={2020}
          stroke="#f59e0b"
          strokeDasharray="4 4"
          label={{
            value: 'COVID spike',
            position: 'top',
            fill: '#f59e0b',
            fontSize: 10,
            fontWeight: 600,
          }}
        />

        <Bar dataKey="us" name="M2 Growth (YoY %)" radius={[2, 2, 0, 0]}>
          {m2GrowthHistory.map((entry, idx) => (
            <Cell
              key={idx}
              fill={entry.us >= 0 ? 'url(#m2-positive)' : 'url(#m2-negative)'}
            />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
      <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Monetary Policy Through the Ages
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              From the gold standard to quantitative easing — 150+ years of central banking
            </p>
          </div>

          <div className={`flex rounded-lg p-0.5 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            {viewTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeView === tab.key
                    ? isDarkMode
                      ? 'bg-gray-600 text-white shadow-sm'
                      : 'bg-white text-gray-900 shadow-sm'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        {activeView === 'regimes' && renderRegimeTimeline()}
        {activeView === 'rates' && renderCentralBankRates()}
        {activeView === 'm2' && renderM2()}
      </div>
    </div>
  );
};

export default MonetaryPolicyRegimeTimeline;

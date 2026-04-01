'use client';

import React, { useState, useCallback } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Cell,
  Label,
} from 'recharts';
import {
  minskyPhases,
  minskyMoments,
  type MinskyPhase,
  type MinskyMomentEvent,
} from '../data/marketCyclesData';

interface MinskyMomentTrackerProps {
  isDarkMode: boolean;
}

const PHASE_COLORS: Record<string, string> = {
  hedge: '#22c55e',
  speculative: '#f59e0b',
  ponzi: '#ef4444',
};

const CURRENT_PHASE = 'speculative';

const getImpactSize = (event: MinskyMomentEvent): number => {
  const abs = Math.abs(event.assetPriceGrowth) + event.privateCreditGrowth;
  if (abs > 60) return 200;
  if (abs > 40) return 140;
  if (abs > 25) return 100;
  return 70;
};

const getPhaseBadgeClasses = (phase: string, isDarkMode: boolean): string => {
  const map: Record<string, string> = {
    hedge: isDarkMode
      ? 'bg-green-900/50 text-green-300 border-green-700'
      : 'bg-green-100 text-green-800 border-green-300',
    speculative: isDarkMode
      ? 'bg-amber-900/50 text-amber-300 border-amber-700'
      : 'bg-amber-100 text-amber-800 border-amber-300',
    ponzi: isDarkMode
      ? 'bg-red-900/50 text-red-300 border-red-700'
      : 'bg-red-100 text-red-800 border-red-300',
  };
  return map[phase] || '';
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: MinskyMomentEvent }>;
  isDarkMode: boolean;
}

const ScatterTooltip: React.FC<CustomTooltipProps> = ({ active, payload, isDarkMode }) => {
  if (!active || !payload?.length) return null;
  const event = payload[0].payload;
  const phase = minskyPhases.find((p) => p.id === event.minskyPhase);

  return (
    <div
      className={`rounded-lg border p-3 shadow-xl max-w-xs ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: PHASE_COLORS[event.minskyPhase] }}
        />
        <span className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {event.name}
        </span>
        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {event.year}
        </span>
      </div>
      {phase && (
        <span
          className={`inline-block text-[10px] px-1.5 py-0.5 rounded border mb-1.5 ${getPhaseBadgeClasses(event.minskyPhase, isDarkMode)}`}
        >
          {phase.name}
        </span>
      )}
      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {event.description}
      </p>
      <div className={`mt-2 grid grid-cols-2 gap-2 text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <div>Credit Growth: <span className="font-medium">{event.privateCreditGrowth}%</span></div>
        <div>Asset Price: <span className="font-medium">{event.assetPriceGrowth}%</span></div>
      </div>
    </div>
  );
};

const PhaseFlowBox: React.FC<{
  phase: MinskyPhase;
  isCurrent: boolean;
  isDarkMode: boolean;
}> = ({ phase, isCurrent, isDarkMode }) => (
  <div
    className={`relative flex-1 min-w-[200px] rounded-xl border-2 p-4 transition-all ${
      isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''
    } ${isDarkMode ? 'ring-offset-gray-900' : 'ring-offset-white'}`}
    style={{ borderColor: phase.color }}
  >
    {isCurrent && (
      <span className="absolute -top-2.5 left-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-500 text-white">
        Current Est.
      </span>
    )}
    <div className="flex items-center gap-2 mb-2">
      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: phase.color }} />
      <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        {phase.name}
      </h4>
    </div>
    <p className={`text-xs mb-3 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
      {phase.description}
    </p>
    <div className="flex flex-wrap gap-1">
      {phase.characteristics.map((c) => (
        <span
          key={c}
          className={`text-[10px] px-1.5 py-0.5 rounded ${
            isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {c}
        </span>
      ))}
    </div>
  </div>
);

const FlowArrow: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
  <div className="flex items-center justify-center px-1 flex-shrink-0">
    <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
      <path
        d="M2 12H26M26 12L18 4M26 12L18 20"
        stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const NOTABLE_LABELS = ['Global Financial Crisis', 'Dot-Com Bust', 'Asian Financial Crisis', 'Crypto Winter'];

const CustomScatterDot: React.FC<{
  cx?: number;
  cy?: number;
  payload?: MinskyMomentEvent;
  highlightedYear: number | null;
}> = ({ cx, cy, payload, highlightedYear }) => {
  if (!cx || !cy || !payload) return null;
  const size = getImpactSize(payload);
  const r = Math.sqrt(size) / 2;
  const isHighlighted = highlightedYear === payload.year;
  const color = PHASE_COLORS[payload.minskyPhase];

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        fillOpacity={isHighlighted ? 0.9 : 0.7}
        stroke={isHighlighted ? '#3b82f6' : color}
        strokeWidth={isHighlighted ? 3 : 1.5}
      />
      {NOTABLE_LABELS.includes(payload.name) && (
        <text
          x={cx}
          y={cy - r - 6}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill={color}
        >
          {payload.name.length > 20
            ? payload.name.replace('Global Financial Crisis', 'GFC')
            : payload.name}
        </text>
      )}
    </g>
  );
};

export default function MinskyMomentTracker({ isDarkMode }: MinskyMomentTrackerProps) {
  const [highlightedYear, setHighlightedYear] = useState<number | null>(null);

  const sortedMoments = [...minskyMoments].sort((a, b) => b.year - a.year);

  const handleTimelineClick = useCallback((year: number) => {
    setHighlightedYear((prev) => (prev === year ? null : year));
  }, []);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const headingText = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const axisColor = isDarkMode ? '#6b7280' : '#9ca3af';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${headingText}`}>
          Minsky Financial Instability Hypothesis
        </h2>
        <p className={`mt-1 text-sm ${secondaryText}`}>
          Stability breeds complacency, complacency breeds risk-taking, and risk-taking breeds
          instability — the inherent progression from hedge to speculative to Ponzi finance.
        </p>
      </div>

      {/* A) Minsky Progression Flow */}
      <div className={`rounded-xl border p-5 ${cardBg}`}>
        <h3 className={`text-lg font-semibold mb-4 ${headingText}`}>
          Minsky Progression Flow
        </h3>
        <div className="flex flex-col lg:flex-row items-stretch gap-2">
          {minskyPhases.map((phase, i) => (
            <React.Fragment key={phase.id}>
              <PhaseFlowBox
                phase={phase}
                isCurrent={phase.id === CURRENT_PHASE}
                isDarkMode={isDarkMode}
              />
              {i < minskyPhases.length - 1 && <FlowArrow isDarkMode={isDarkMode} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* B) Minsky Moments Scatter Plot */}
      <div className={`rounded-xl border p-5 ${cardBg}`}>
        <h3 className={`text-lg font-semibold mb-1 ${headingText}`}>
          Minsky Moments — Credit &amp; Asset Price Scatter
        </h3>
        <p className={`text-xs mb-4 ${secondaryText}`}>
          Each bubble represents a historical Minsky Moment. Size reflects combined impact severity.
          The shaded area marks the danger zone of high credit growth combined with elevated asset prices.
        </p>

        <div className="flex flex-wrap gap-4 mb-4">
          {minskyPhases.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span className={`text-xs ${secondaryText}`}>{p.name}</span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={420}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
            <XAxis
              type="number"
              dataKey="privateCreditGrowth"
              domain={[0, 30]}
              tick={{ fill: axisColor, fontSize: 11 }}
              stroke={axisColor}
            >
              <Label
                value="Private Credit Growth (%)"
                offset={-10}
                position="insideBottom"
                style={{ fill: axisColor, fontSize: 12 }}
              />
            </XAxis>
            <YAxis
              type="number"
              dataKey="assetPriceGrowth"
              domain={[-70, 90]}
              tick={{ fill: axisColor, fontSize: 11 }}
              stroke={axisColor}
            >
              <Label
                value="Asset Price Growth (%)"
                angle={-90}
                position="insideLeft"
                style={{ fill: axisColor, fontSize: 12 }}
                offset={5}
              />
            </YAxis>

            <ReferenceArea
              x1={14}
              x2={30}
              y1={30}
              y2={90}
              fill={isDarkMode ? '#ef444420' : '#fecaca40'}
              stroke={isDarkMode ? '#ef444460' : '#fca5a560'}
              strokeDasharray="4 4"
              label={{
                value: 'DANGER ZONE',
                position: 'insideTopRight',
                fill: isDarkMode ? '#f87171' : '#dc2626',
                fontSize: 10,
                fontWeight: 700,
              }}
            />

            <Tooltip
              content={<ScatterTooltip isDarkMode={isDarkMode} />}
              cursor={{ strokeDasharray: '3 3', stroke: axisColor }}
            />

            <Scatter
              data={minskyMoments}
              shape={(props: Record<string, unknown>) => (
                <CustomScatterDot
                  cx={props.cx as number}
                  cy={props.cy as number}
                  payload={props.payload as MinskyMomentEvent}
                  highlightedYear={highlightedYear}
                />
              )}
            >
              {minskyMoments.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PHASE_COLORS[entry.minskyPhase]}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* C) Historical Minsky Moments Timeline */}
      <div className={`rounded-xl border p-5 ${cardBg}`}>
        <h3 className={`text-lg font-semibold mb-4 ${headingText}`}>
          Historical Minsky Moments
        </h3>
        <div className="space-y-0">
          {sortedMoments.map((event, idx) => {
            const phase = minskyPhases.find((p) => p.id === event.minskyPhase);
            const isHighlighted = highlightedYear === event.year;

            return (
              <button
                key={`${event.year}-${event.name}`}
                onClick={() => handleTimelineClick(event.year)}
                className={`w-full text-left flex gap-4 p-3 rounded-lg transition-colors ${
                  isHighlighted
                    ? isDarkMode
                      ? 'bg-blue-900/30 border border-blue-700'
                      : 'bg-blue-50 border border-blue-200'
                    : isDarkMode
                      ? 'hover:bg-gray-700/50 border border-transparent'
                      : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center flex-shrink-0 pt-1">
                  <span
                    className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                    style={{
                      borderColor: PHASE_COLORS[event.minskyPhase],
                      backgroundColor: isHighlighted ? PHASE_COLORS[event.minskyPhase] : 'transparent',
                    }}
                  />
                  {idx < sortedMoments.length - 1 && (
                    <div
                      className="w-px flex-1 mt-1"
                      style={{
                        backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
                      }}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold tabular-nums ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {event.year}
                    </span>
                    <span className={`text-sm font-semibold ${headingText}`}>
                      {event.name}
                    </span>
                    {phase && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getPhaseBadgeClasses(event.minskyPhase, isDarkMode)}`}
                      >
                        {phase.label}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${secondaryText}`}>
                    {event.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

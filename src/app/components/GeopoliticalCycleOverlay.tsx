'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  reserveCurrencyShares,
  thucydidesTrapEvents,
  majorConflicts,
  type ReserveCurrencyShare,
  type ThucydidesTrapEvent,
  type ConflictCycleEvent,
} from '../data/marketCyclesData';

interface GeopoliticalCycleOverlayProps {
  isDarkMode: boolean;
}

type ActiveView = 'reserves' | 'thucydides' | 'conflicts';

const VIEW_TABS: { key: ActiveView; label: string }[] = [
  { key: 'reserves', label: 'Reserve Currencies' },
  { key: 'thucydides', label: 'Thucydides Trap' },
  { key: 'conflicts', label: 'Conflicts & Cycles' },
];

const CURRENCY_CONFIG = [
  { key: 'usd', label: 'USD', color: '#3b82f6' },
  { key: 'eur', label: 'EUR', color: '#8b5cf6' },
  { key: 'gbp', label: 'GBP', color: '#22c55e' },
  { key: 'jpy', label: 'JPY', color: '#ef4444' },
  { key: 'cny', label: 'CNY', color: '#f59e0b' },
  { key: 'other', label: 'Other', color: '#6b7280' },
] as const;

const OUTCOME_STYLES = {
  war: {
    light: 'bg-red-100 text-red-700',
    dark: 'bg-red-900/30 text-red-400',
    label: 'War',
  },
  peaceful: {
    light: 'bg-green-100 text-green-700',
    dark: 'bg-green-900/30 text-green-400',
    label: 'Peaceful',
  },
  ongoing: {
    light: 'bg-amber-100 text-amber-700',
    dark: 'bg-amber-900/30 text-amber-400',
    label: 'Ongoing',
  },
} as const;

const CONFLICT_TYPE_COLORS: Record<ConflictCycleEvent['type'], string> = {
  military: '#ef4444',
  economic: '#f59e0b',
  proxy: '#3b82f6',
};

function ReserveCurrencyTooltip({
  active,
  payload,
  label,
  isDarkMode,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
  isDarkMode: boolean;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={`rounded-lg border p-3 shadow-lg ${
        isDarkMode
          ? 'border-gray-700 bg-gray-800 text-gray-100'
          : 'border-gray-200 bg-white text-gray-900'
      }`}
    >
      <p className="mb-2 text-sm font-semibold">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {CURRENCY_CONFIG.find((c) => c.key === entry.name)?.label ?? entry.name}
            </span>
          </div>
          <span className="font-medium">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

function ReserveCurrencyView({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="space-y-4">
      <h3
        className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
      >
        Global Reserve Currency Composition
      </h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={reserveCurrencyShares} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDarkMode ? '#374151' : '#e5e7eb'}
            />
            <XAxis
              dataKey="year"
              tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
              stroke={isDarkMode ? '#4b5563' : '#d1d5db'}
            />
            <YAxis
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
              stroke={isDarkMode ? '#4b5563' : '#d1d5db'}
              domain={[0, 100]}
            />
            <Tooltip
              content={<ReserveCurrencyTooltip isDarkMode={isDarkMode} />}
            />
            <Legend
              formatter={(value: string) =>
                CURRENCY_CONFIG.find((c) => c.key === value)?.label ?? value
              }
              wrapperStyle={{ fontSize: 12 }}
            />
            {CURRENCY_CONFIG.map((currency) => (
              <Area
                key={currency.key}
                type="monotone"
                dataKey={currency.key}
                stackId="1"
                stroke={currency.color}
                fill={currency.color}
                fillOpacity={0.8}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OutcomeBadge({ outcome, isDarkMode }: { outcome: ThucydidesTrapEvent['outcome']; isDarkMode: boolean }) {
  const style = OUTCOME_STYLES[outcome];
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isDarkMode ? style.dark : style.light
      }`}
    >
      {style.label}
    </span>
  );
}

function ThucydidesTimeline({ events, isDarkMode }: { events: ThucydidesTrapEvent[]; isDarkMode: boolean }) {
  const minYear = 1793;
  const maxYear = 2030;
  const range = maxYear - minYear;

  return (
    <div className="mb-6 overflow-x-auto">
      <svg viewBox={`0 0 800 60`} className="w-full min-w-[600px]" preserveAspectRatio="xMidYMid meet">
        <line
          x1="40"
          y1="30"
          x2="760"
          y2="30"
          stroke={isDarkMode ? '#4b5563' : '#d1d5db'}
          strokeWidth="2"
        />
        {[1800, 1850, 1900, 1950, 2000].map((year) => {
          const x = 40 + ((year - minYear) / range) * 720;
          return (
            <g key={year}>
              <line
                x1={x}
                y1="25"
                x2={x}
                y2="35"
                stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
                strokeWidth="1"
              />
              <text
                x={x}
                y="50"
                textAnchor="middle"
                fill={isDarkMode ? '#9ca3af' : '#6b7280'}
                fontSize="10"
              >
                {year}
              </text>
            </g>
          );
        })}
        {events.map((event) => {
          const x1 = 40 + ((event.startYear - minYear) / range) * 720;
          const x2 = 40 + ((event.endYear - minYear) / range) * 720;
          const outcomeColor =
            event.outcome === 'war'
              ? '#ef4444'
              : event.outcome === 'peaceful'
              ? '#22c55e'
              : '#f59e0b';
          return (
            <g key={event.id}>
              <rect
                x={x1}
                y="22"
                width={Math.max(x2 - x1, 4)}
                height="16"
                rx="3"
                fill={outcomeColor}
                fillOpacity={0.6}
              />
              <title>
                {event.risingPower} vs {event.rulingPower} ({event.period})
              </title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ThucydidesTrapView({ isDarkMode }: { isDarkMode: boolean }) {
  const grouped = useMemo(() => {
    const groups: Record<ThucydidesTrapEvent['outcome'], ThucydidesTrapEvent[]> = {
      war: [],
      peaceful: [],
      ongoing: [],
    };
    thucydidesTrapEvents.forEach((e) => groups[e.outcome].push(e));
    return groups;
  }, []);

  const card = (e: ThucydidesTrapEvent) => (
    <div
      key={e.id}
      className={`p-4 rounded-xl border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {e.risingPower}{' '}
            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>vs</span>{' '}
            {e.rulingPower}
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {e.period}
          </p>
        </div>
        <OutcomeBadge outcome={e.outcome} isDarkMode={isDarkMode} />
      </div>
      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {e.description}
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3
        className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
      >
        Thucydides Trap — Power Transitions
      </h3>
      <ThucydidesTimeline events={thucydidesTrapEvents} isDarkMode={isDarkMode} />

      {(['war', 'peaceful', 'ongoing'] as const).map((outcome) =>
        grouped[outcome].length > 0 ? (
          <div key={outcome}>
            <h4
              className={`mb-2 text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {OUTCOME_STYLES[outcome].label} Transitions ({grouped[outcome].length})
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {grouped[outcome].map(card)}
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}

function ConflictTooltip({
  active,
  payload,
  isDarkMode,
}: {
  active?: boolean;
  payload?: Array<{ payload: ConflictCycleEvent }>;
  isDarkMode: boolean;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div
      className={`rounded-lg border p-3 shadow-lg ${
        isDarkMode
          ? 'border-gray-700 bg-gray-800 text-gray-100'
          : 'border-gray-200 bg-white text-gray-900'
      }`}
    >
      <p className="mb-1 text-sm font-semibold">{d.name} ({d.year})</p>
      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Type: <span className="capitalize">{d.type}</span>
      </p>
      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        GDP Impact: {d.gdpImpact}%
      </p>
      <p className={`mt-1 text-xs leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {d.impactOnCycle}
      </p>
    </div>
  );
}

function ConflictsView({ isDarkMode }: { isDarkMode: boolean }) {
  const stats = useMemo(() => {
    const wars = majorConflicts.filter((c) => c.type === 'military').length;
    const crises = majorConflicts.filter((c) => c.type === 'economic').length;
    const avgImpact =
      majorConflicts.reduce((sum, c) => sum + c.gdpImpact, 0) / majorConflicts.length;
    return { wars, crises, avgImpact: avgImpact.toFixed(1) };
  }, []);

  return (
    <div className="space-y-4">
      <h3
        className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
      >
        Major Conflicts &amp; Their Economic Impact
      </h3>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={majorConflicts}
            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDarkMode ? '#374151' : '#e5e7eb'}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 10 }}
              stroke={isDarkMode ? '#4b5563' : '#d1d5db'}
              angle={-35}
              textAnchor="end"
              interval={0}
              height={80}
            />
            <YAxis
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
              stroke={isDarkMode ? '#4b5563' : '#d1d5db'}
              domain={['dataMin - 5', 0]}
            />
            <Tooltip
              content={<ConflictTooltip isDarkMode={isDarkMode} />}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              payload={[
                { value: 'Military', type: 'square', color: CONFLICT_TYPE_COLORS.military },
                { value: 'Economic', type: 'square', color: CONFLICT_TYPE_COLORS.economic },
                { value: 'Proxy', type: 'square', color: CONFLICT_TYPE_COLORS.proxy },
              ]}
            />
            <Bar dataKey="gdpImpact" name="GDP Impact" radius={[4, 4, 0, 0]}>
              {majorConflicts.map((entry, idx) => (
                <Cell key={idx} fill={CONFLICT_TYPE_COLORS[entry.type]} fillOpacity={0.85} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div
        className={`grid grid-cols-3 gap-3 rounded-xl p-4 ${
          isDarkMode ? 'bg-gray-800/70' : 'bg-gray-50'
        }`}
      >
        <div className="text-center">
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
            {stats.wars}
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Military Conflicts
          </p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
            {stats.crises}
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Economic Crises
          </p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {stats.avgImpact}%
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Avg GDP Impact
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GeopoliticalCycleOverlay({ isDarkMode }: GeopoliticalCycleOverlayProps) {
  const [activeView, setActiveView] = useState<ActiveView>('reserves');

  return (
    <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
      <div
        className={`flex items-center justify-between border-b px-5 py-4 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <h2 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Geopolitical Power &amp; Economic Cycles
        </h2>
        <div className="flex gap-1">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeView === tab.key
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {activeView === 'reserves' && <ReserveCurrencyView isDarkMode={isDarkMode} />}
        {activeView === 'thucydides' && <ThucydidesTrapView isDarkMode={isDarkMode} />}
        {activeView === 'conflicts' && <ConflictsView isDarkMode={isDarkMode} />}
      </div>
    </div>
  );
}

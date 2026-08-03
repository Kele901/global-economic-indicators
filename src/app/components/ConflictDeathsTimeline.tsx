'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  UCDP_BATTLE_DEATHS,
  ACTIVE_STATE_CONFLICTS,
  UCDP_REGION_COLORS,
  CURATED_LAST_UPDATED,
} from '../services/defenseCurated';

interface Props {
  isDarkMode: boolean;
}

const REGION_ORDER: (keyof typeof UCDP_REGION_COLORS)[] = [
  'Africa', 'Americas', 'Asia', 'Europe', 'MiddleEast',
];

const REGION_LABEL: Record<string, string> = {
  Africa: 'Africa',
  Americas: 'Americas',
  Asia: 'Asia',
  Europe: 'Europe',
  MiddleEast: 'Middle East',
};

export default function ConflictDeathsTimeline({ isDarkMode }: Props) {
  const merged = useMemo(() => {
    const conflictsByYear: Record<number, number> = {};
    ACTIVE_STATE_CONFLICTS.forEach(c => { conflictsByYear[c.year] = c.count; });
    return UCDP_BATTLE_DEATHS.map(row => ({
      year: row.year,
      Africa: row.Africa,
      Americas: row.Americas,
      Asia: row.Asia,
      Europe: row.Europe,
      MiddleEast: row.MiddleEast,
      activeConflicts: conflictsByYear[row.year] ?? null,
    }));
  }, []);

  const totals = useMemo(() => {
    const totalDeaths = UCDP_BATTLE_DEATHS.reduce((s, r) => s + r.total, 0);
    const latest = UCDP_BATTLE_DEATHS[UCDP_BATTLE_DEATHS.length - 1];
    const latestConflicts = ACTIVE_STATE_CONFLICTS[ACTIVE_STATE_CONFLICTS.length - 1];
    return {
      totalDeaths,
      latestYear: latest?.year ?? 0,
      latestDeaths: latest?.total ?? 0,
      latestConflicts: latestConflicts?.count ?? 0,
    };
  }, []);

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: 8 }
    : { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: 8 };

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';

  return (
    <div className={`rounded-lg border ${cardBg}`}>
      <div className="p-4 sm:p-6 border-b border-inherit flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>
            The Human Cost
          </div>
          <p className={`text-sm ${textSec} max-w-2xl`}>
            Annual battle-related deaths from state-based armed conflicts, stacked by region. Overlay tracks the count of
            active state-based conflicts each year. 1989 to present.
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div>
            <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>{totals.latestYear} deaths</div>
            <div className={`text-lg font-semibold tabular-nums ${textPrimary}`}>{totals.latestDeaths.toLocaleString()}</div>
          </div>
          <div>
            <div className={`text-[11px] uppercase tracking-wider ${textMuted}`}>Active conflicts</div>
            <div className={`text-lg font-semibold tabular-nums ${textPrimary}`}>{totals.latestConflicts}</div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={merged} margin={{ top: 10, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} />
              <XAxis dataKey="year" stroke={axis} />
              <YAxis
                yAxisId="left"
                stroke={axis}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                label={{ value: 'Battle deaths', angle: -90, position: 'insideLeft', fill: axis, fontSize: 12, offset: 10 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={axis}
                tickFormatter={v => `${v}`}
                label={{ value: 'Active conflicts', angle: 90, position: 'insideRight', fill: axis, fontSize: 12, offset: 10 }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: any, name: string) => {
                  if (name === 'activeConflicts') return [`${v} conflicts`, 'Active state-based conflicts'];
                  return [Number(v).toLocaleString(), REGION_LABEL[name] ?? name];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value: string) => value === 'activeConflicts' ? 'Active conflicts' : (REGION_LABEL[value] ?? value)}
              />
              {REGION_ORDER.map(region => (
                <Area
                  key={region}
                  type="monotone"
                  yAxisId="left"
                  dataKey={region}
                  stackId="deaths"
                  stroke={UCDP_REGION_COLORS[region]}
                  fill={UCDP_REGION_COLORS[region]}
                  fillOpacity={0.65}
                />
              ))}
              <Line
                type="monotone"
                yAxisId="right"
                dataKey="activeConflicts"
                stroke={isDarkMode ? '#f8fafc' : '#0f172a'}
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`px-4 sm:px-6 py-3 text-[11px] border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${textMuted}`}>
        Source: UCDP Battle-Related Deaths &amp; Armed Conflict Dataset v25.1 · curated {CURATED_LAST_UPDATED}
      </div>
    </div>
  );
}

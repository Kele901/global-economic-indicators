'use client';

import { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { CountryHistory } from '../services/politicsCurated';

interface Props {
  isDarkMode: boolean;
  history: CountryHistory;
  height?: number;
}

interface SeriesMeta {
  abbr: string;
  name: string;
  color: string;
  peak: number;
}

export default function VoteShareHistoryChart({ isDarkMode, history, height = 340 }: Props) {
  const [showTurnout, setShowTurnout] = useState(false);
  const votes = history.votes;

  const { rows, series, anyContested, allContested } = useMemo(() => {
    const meta = new Map<string, SeriesMeta>();
    for (const v of votes) {
      for (const r of v.results) {
        const m = meta.get(r.abbr);
        meta.set(r.abbr, { abbr: r.abbr, name: r.name, color: r.color, peak: Math.max(m?.peak ?? 0, r.pct) });
      }
    }
    const contested = votes.map((v) => !!v.contested);
    const all = contested.length > 0 && contested.every(Boolean);
    const out = votes.map((v, i) => {
      const row: Record<string, number | string | boolean | undefined> = { year: v.year, type: v.type, contested: v.contested, turnout: v.turnoutPct };
      const touchesContested = contested[i] || contested[i - 1] || contested[i + 1];
      for (const r of v.results) {
        if (all || !contested[i]) row[r.abbr] = r.pct;
        if (!all && touchesContested) row[`${r.abbr}__c`] = r.pct;
      }
      return row;
    });
    return {
      rows: out,
      series: [...meta.values()].sort((a, b) => b.peak - a.peak),
      anyContested: contested.some(Boolean),
      allContested: all,
    };
  }, [votes]);

  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  if (!votes.length) {
    return <p className={`text-sm ${textSec}`}>{history.votesNote ?? 'No competitive national elections.'}</p>;
  }

  const hasTurnout = votes.some((v) => v.turnoutPct != null);
  const maxPct = Math.max(...votes.flatMap((v) => v.results.map((r) => r.pct)), showTurnout ? 100 : 0);
  const yMax = Math.min(100, Math.ceil((maxPct + 5) / 10) * 10);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`text-xs ${textSec}`}>{votes[votes.length - 1].type}, last {votes.length} elections</span>
        {hasTurnout && (
          <label className={`ml-auto flex items-center gap-1.5 text-xs ${textSec}`}>
            <input type="checkbox" checked={showTurnout} onChange={(e) => setShowTurnout(e.target.checked)} />
            Show turnout
          </label>
        )}
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" stroke={axis} tick={{ fontSize: 11 }} />
            <YAxis domain={[0, yMax]} stroke={axis} tick={{ fontSize: 11 }} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}`, fontSize: 12 }}
              labelFormatter={(y, payload) => {
                const row = payload?.[0]?.payload as { type?: string; contested?: boolean } | undefined;
                return `${y}${row?.type ? ` · ${row.type}` : ''}${row?.contested ? ' (not free or fair)' : ''}`;
              }}
              formatter={(v: number, name: string) => [`${v.toFixed(1)}%`, name]}
              itemSorter={(item) => -(Number(item.value) || 0)}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {series.map((s) => (
              <Line
                key={s.abbr}
                type="linear"
                dataKey={s.abbr}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={allContested ? '5 4' : undefined}
                dot={{ r: 3 }}
                connectNulls={false}
              />
            ))}
            {!allContested &&
              anyContested &&
              series.map((s) => (
                <Line
                  key={`${s.abbr}__c`}
                  type="linear"
                  dataKey={`${s.abbr}__c`}
                  name={s.name}
                  legendType="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 3, strokeDasharray: '' }}
                  connectNulls={false}
                  tooltipType="none"
                />
              ))}
            {showTurnout && (
              <Line type="linear" dataKey="turnout" name="Turnout" stroke={axis} strokeDasharray="2 3" strokeWidth={1.5} dot={{ r: 2 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-[11px] mt-2 ${textSec}`}>
        Share of the vote by party or camp; a party missing from an election is shown as a gap.
        {anyContested && ' Dashed lines mark official results from elections that observers judged not free or fair.'}
        {history.votesNote && ` ${history.votesNote}`}
      </p>
    </div>
  );
}

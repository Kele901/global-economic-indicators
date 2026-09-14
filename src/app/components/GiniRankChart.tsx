'use client';

// Live Gini ranking across the 47-country roster. Unlike the rest of the
// inequality page (which is Piketty-derived historical reconstruction), this
// chart is fed straight from World Bank SI.POV.GINI. Survey years differ by
// country, so each bar carries its own year and anything older than the
// staleness threshold is drawn faded and called out in the footnote.

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import type { CountryData } from '../services/worldbank';
import { latestEntry } from '../utils/countryData';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES } from '../utils/countryMappings';
import { useChartTheme } from '../utils/chartTheme';
import ChartCard from './charts/ChartCard';
import ChartTooltip from './charts/ChartTooltip';
import ChartA11yCaption from './ChartA11yCaption';

interface Props {
  isDarkMode: boolean;
  gini: CountryData[] | undefined;
}

const STALE_AFTER_YEARS = 6;

// World Bank's own descriptive bands: below 30 is Nordic-style compression,
// above 45 is the Latin America / Southern Africa cluster.
const BANDS = [
  { max: 30, color: '#10b981', label: 'Under 30 — highly compressed' },
  { max: 35, color: '#84cc16', label: '30-35' },
  { max: 40, color: '#f59e0b', label: '35-40' },
  { max: 45, color: '#f97316', label: '40-45' },
  { max: Infinity, color: '#ef4444', label: '45+ — highly unequal' },
];

function bandColor(gini: number): string {
  return BANDS.find(b => gini < b.max)?.color ?? '#ef4444';
}

export default function GiniRankChart({ isDarkMode, gini }: Props) {
  const theme = useChartTheme(isDarkMode);

  const rows = useMemo(() => {
    const thisYear = new Date().getFullYear();
    return COUNTRY_KEYS
      .map(key => {
        const entry = latestEntry(gini, key);
        if (!entry) return null;
        return {
          key,
          name: COUNTRY_DISPLAY_NAMES[key] ?? key,
          gini: entry.value,
          year: entry.year,
          stale: thisYear - entry.year > STALE_AFTER_YEARS,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.gini - a.gini);
  }, [gini]);

  const median = useMemo(() => {
    if (rows.length === 0) return null;
    const sorted = rows.map(r => r.gini).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
  }, [rows]);

  if (rows.length === 0) {
    return (
      <ChartCard isDarkMode={isDarkMode} height="h-auto">
        <p className={`text-sm ${theme.subtitleCls}`}>
          No live Gini values returned for the current roster. The World Bank only publishes
          SI.POV.GINI for countries with a recent household survey, so this chart stays empty
          until the API responds.
        </p>
      </ChartCard>
    );
  }

  const staleCount = rows.filter(r => r.stale).length;
  const missing = COUNTRY_KEYS.length - rows.length;

  return (
    <ChartCard
      isDarkMode={isDarkMode}
      height={Math.max(420, rows.length * 22)}
      caption={
        <ChartA11yCaption
          title="Gini index by country, latest available survey"
          rows={rows.map(r => ({ label: `${r.name} (${r.year})`, value: r.gini }))}
          extra={median !== null ? `Roster median ${median.toFixed(1)}.` : undefined}
        />
      }
      footnote={
        <>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
            {BANDS.map(b => (
              <span key={b.label} className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: b.color }} />
                {b.label}
              </span>
            ))}
          </div>
          Live World Bank SI.POV.GINI, latest survey available per country. Faded bars are surveys
          more than {STALE_AFTER_YEARS} years old ({staleCount} of {rows.length} shown)
          {missing > 0 ? `; ${missing} roster countries have no published Gini at all` : ''}.
          Gini measures the distribution of income or consumption <em>within</em> a country, so it
          says nothing about how rich that country is — Bangladesh and the Netherlands can land in
          the same band at wildly different income levels.
        </>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 10, right: 30, bottom: 24, left: 10 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 70]}
            stroke={theme.axis}
            tick={{ fontSize: 11 }}
            label={{ value: 'Gini index (0 = perfect equality, 100 = one household holds everything)', position: 'bottom', offset: 6, fill: theme.axis, fontSize: 11 }}
          />
          <YAxis type="category" dataKey="name" stroke={theme.axis} width={110} tick={{ fontSize: 11 }} interval={0} />
          {median !== null && (
            <ReferenceLine
              x={median}
              stroke={theme.axis}
              strokeDasharray="4 4"
              label={{ value: `roster median ${median.toFixed(1)}`, position: 'top', fill: theme.axis, fontSize: 10 }}
            />
          )}
          <Tooltip
            cursor={{ fill: theme.cursor }}
            content={
              <ChartTooltip
                theme={theme}
                format={v => v.toFixed(1)}
                footer={p => {
                  const year = p?.year as number | undefined;
                  const stale = p?.stale as boolean | undefined;
                  if (!year) return null;
                  return stale ? `${year} survey — over ${STALE_AFTER_YEARS} years old` : `${year} survey`;
                }}
              />
            }
          />
          <Bar dataKey="gini" name="Gini index" isAnimationActive={false}>
            {rows.map(r => (
              <Cell key={r.key} fill={bandColor(r.gini)} fillOpacity={r.stale ? 0.45 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

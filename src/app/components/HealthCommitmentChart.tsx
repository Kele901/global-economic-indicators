'use client';

// Live Chapter 1 for /health-ledger. Ranks the roster by current health
// expenditure as a share of GDP (SH.XPD.CHEX.GD.ZS) and overlays life
// expectancy at birth (SP.DYN.LE00.IN) on a second axis. The point is the
// non-relationship: the bars and the line do not track each other.

import { useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
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
  shareTitle?: string;
  healthcareExpenditure: CountryData[] | undefined;
  lifeExpectancy: CountryData[] | undefined;
}

export default function HealthCommitmentChart({ isDarkMode, healthcareExpenditure, lifeExpectancy, shareTitle }: Props) {
  const theme = useChartTheme(isDarkMode);

  const rows = useMemo(() => (
    COUNTRY_KEYS
      .map(key => {
        const spend = latestEntry(healthcareExpenditure, key);
        if (!spend) return null;
        const life = latestEntry(lifeExpectancy, key);
        return {
          key,
          name: COUNTRY_DISPLAY_NAMES[key] ?? key,
          spendPctGdp: spend.value,
          spendYear: spend.year,
          lifeExpectancy: life ? life.value : null,
          lifeYear: life?.year ?? null,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.spendPctGdp - a.spendPctGdp)
  ), [healthcareExpenditure, lifeExpectancy]);

  if (rows.length === 0) {
    return (
      <ChartCard isDarkMode={isDarkMode} shareTitle={shareTitle} height="h-auto">
        <p className={`text-sm ${theme.subtitleCls}`}>
          Live World Bank health-expenditure data has not arrived yet. The curated chapters below
          are unaffected.
        </p>
      </ChartCard>
    );
  }

  const withLife = rows.filter(r => r.lifeExpectancy !== null);
  const bestValue = withLife.length > 0
    ? withLife.reduce((acc, r) => (r.lifeExpectancy! / r.spendPctGdp > acc.lifeExpectancy! / acc.spendPctGdp ? r : acc), withLife[0]!)
    : null;

  return (
    <ChartCard
      isDarkMode={isDarkMode}
      shareTitle={shareTitle}
      height="h-[400px] sm:h-[520px]"
      caption={
        <ChartA11yCaption
          title="Current health expenditure as a share of GDP, latest year"
          unit="%"
          rows={rows.map(r => ({ label: r.name, value: r.spendPctGdp }))}
          extra={bestValue ? `Most life expectancy per point of GDP spent: ${bestValue.name}.` : undefined}
        />
      }
      footnote={
        <>
          Live World Bank SH.XPD.CHEX.GD.ZS and SP.DYN.LE00.IN, latest available year per country
          ({rows.length} of {COUNTRY_KEYS.length} roster countries reporting). The bars are sorted by
          spending, and the life-expectancy line deliberately refuses to sort with them — countries
          spending 5% of GDP reach the same life expectancy as countries spending twice that. Share
          of GDP also flatters poor countries with small economies and small health budgets, which is
          why Chapter 2 re-cuts the same question in per-capita dollars.
        </>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 10, right: 20, bottom: 70, left: 10 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            stroke={theme.axis}
            tick={{ fontSize: 10 }}
            angle={-55}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis
            yAxisId="spend"
            stroke={theme.axis}
            tick={{ fontSize: 11 }}
            label={{ value: 'Health spend, % of GDP', angle: -90, position: 'insideLeft', fill: theme.axis, fontSize: 11 }}
          />
          <YAxis
            yAxisId="life"
            orientation="right"
            domain={[50, 90]}
            stroke={theme.axis}
            tick={{ fontSize: 11 }}
            label={{ value: 'Life expectancy, years', angle: 90, position: 'insideRight', fill: theme.axis, fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: theme.cursor }}
            content={
              <ChartTooltip
                theme={theme}
                format={(v, name) => (name === 'Life expectancy' ? `${v.toFixed(1)} yrs` : `${v.toFixed(1)}% of GDP`)}
                footer={p => {
                  const spendYear = p?.spendYear as number | undefined;
                  const lifeYear = p?.lifeYear as number | null | undefined;
                  if (!spendYear) return null;
                  return lifeYear && lifeYear !== spendYear
                    ? `spend ${spendYear}, life expectancy ${lifeYear}`
                    : `${spendYear}`;
                }}
              />
            }
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar yAxisId="spend" dataKey="spendPctGdp" name="Health spend" isAnimationActive={false}>
            {rows.map(r => (
              <Cell
                key={r.key}
                fill={r.spendPctGdp >= 10 ? theme.palette.info : r.spendPctGdp >= 6 ? theme.palette.positive : theme.palette.warning}
              />
            ))}
          </Bar>
          <Line
            yAxisId="life"
            type="monotone"
            dataKey="lifeExpectancy"
            name="Life expectancy"
            stroke={theme.palette.negative}
            strokeWidth={2}
            dot={{ r: 2 }}
            connectNulls
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

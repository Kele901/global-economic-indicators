'use client';

// Live Chapter 1 for /labor-ledger. Overall unemployment (SL.UEM.TOTL.ZS)
// against youth unemployment (SL.UEM.1524.ZS) for the whole roster, sorted
// by the youth multiple. The gap between the two bars is the part of the
// labour market that headline unemployment hides.

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
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
  unemploymentRates: CountryData[] | undefined;
  youthUnemployment: CountryData[] | undefined;
}

export default function LaborSlackChart({ isDarkMode, unemploymentRates, youthUnemployment }: Props) {
  const theme = useChartTheme(isDarkMode);

  const rows = useMemo(() => (
    COUNTRY_KEYS
      .map(key => {
        const total = latestEntry(unemploymentRates, key);
        const youth = latestEntry(youthUnemployment, key);
        if (!total || !youth) return null;
        return {
          key,
          name: COUNTRY_DISPLAY_NAMES[key] ?? key,
          total: total.value,
          youth: youth.value,
          multiple: youth.value / total.value,
          year: Math.min(total.year, youth.year),
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.multiple - a.multiple)
  ), [unemploymentRates, youthUnemployment]);

  if (rows.length === 0) {
    return (
      <ChartCard isDarkMode={isDarkMode} height="h-auto">
        <p className={`text-sm ${theme.subtitleCls}`}>
          Live World Bank unemployment data has not arrived yet. The curated chapters below are
          unaffected.
        </p>
      </ChartCard>
    );
  }

  const worst = rows[0]!;
  const medianMultiple = rows.map(r => r.multiple).sort((a, b) => a - b)[Math.floor(rows.length / 2)]!;

  return (
    <ChartCard
      isDarkMode={isDarkMode}
      height={Math.max(460, rows.length * 24)}
      caption={
        <ChartA11yCaption
          title="Youth unemployment as a multiple of overall unemployment, latest year"
          unit="x"
          precision={2}
          rows={rows.map(r => ({ label: r.name, value: r.multiple }))}
          extra={`Median youth multiple across the roster is ${medianMultiple.toFixed(1)}x.`}
        />
      }
      footnote={
        <>
          Live World Bank SL.UEM.TOTL.ZS and SL.UEM.1524.ZS, latest available year per country
          ({rows.length} of {COUNTRY_KEYS.length} roster countries reporting both series), sorted by
          the youth multiple. Youth unemployment runs about {medianMultiple.toFixed(1)}x the headline
          rate at the median and {worst.multiple.toFixed(1)}x in {worst.name}. A high multiple on top
          of a low headline rate usually signals a rigid two-tier labour market rather than a weak
          economy — and Chapter 4&apos;s informality figures matter here too: across much of the world
          these rates only describe the formal sector.
        </>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 10, right: 30, bottom: 24, left: 10 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            stroke={theme.axis}
            tick={{ fontSize: 11 }}
            label={{ value: 'Unemployment rate, % of the relevant labour force', position: 'bottom', offset: 6, fill: theme.axis, fontSize: 11 }}
          />
          <YAxis type="category" dataKey="name" stroke={theme.axis} width={110} tick={{ fontSize: 11 }} interval={0} />
          <Tooltip
            cursor={{ fill: theme.cursor }}
            content={
              <ChartTooltip
                theme={theme}
                format={v => `${v.toFixed(1)}%`}
                labelFormat={(label, p) => {
                  const multiple = p?.multiple as number | undefined;
                  return multiple ? `${label} — ${multiple.toFixed(1)}x youth multiple` : String(label);
                }}
                footer={p => {
                  const year = p?.year as number | undefined;
                  return year ? `${year}` : null;
                }}
              />
            }
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="youth" name="Ages 15-24" fill={theme.palette.warning} isAnimationActive={false} />
          <Bar dataKey="total" name="All ages 15+" fill={theme.palette.info} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

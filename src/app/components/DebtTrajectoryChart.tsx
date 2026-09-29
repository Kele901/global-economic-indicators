'use client';

// Multi-decade government-debt trajectories from the live World Bank series
// (GC.DOD.TOTL.GD.ZS). The WEO chart above it only covers 2019-2029, which
// makes every line look like a straight ramp; three decades shows which
// sovereigns actually ratcheted up after 2008 and 2020 and which did not.
//
// The series is long enough that a Brush is the point rather than a garnish.

import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Brush,
} from 'recharts';
import type { CountryData } from '../services/worldbank';
import { DEBT_COUNTRY_META } from '../services/debtCurated';
import { useChartTheme } from '../utils/chartTheme';
import ChartCard from './charts/ChartCard';
import ChartTooltip from './charts/ChartTooltip';
import ChartA11yCaption from './ChartA11yCaption';

interface Props {
  isDarkMode: boolean;
  governmentDebt: CountryData[];
}

const START_YEAR = 1990;
const DEFAULT_SELECTION = ['JPN', 'USA', 'ITA', 'GBR', 'DEU', 'CHN'];

export default function DebtTrajectoryChart({ isDarkMode, governmentDebt }: Props) {
  const theme = useChartTheme(isDarkMode);
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTION);

  const shown = useMemo(
    () => DEBT_COUNTRY_META.filter(m => selected.includes(m.iso3)),
    [selected],
  );

  const rows = useMemo(() => {
    if (!Array.isArray(governmentDebt) || governmentDebt.length === 0) return [];
    return governmentDebt
      .filter(row => Number(row.year) >= START_YEAR)
      .map(row => {
        const out: Record<string, number | string> = { year: Number(row.year) };
        for (const meta of shown) {
          const v = Number(row[meta.wbKey]);
          if (Number.isFinite(v) && v > 0) out[meta.name] = v;
        }
        return out;
      })
      // Years where none of the selected countries reported would otherwise
      // draw as a gap in every line at once.
      .filter(row => Object.keys(row).length > 1)
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [governmentDebt, shown]);

  function toggle(iso3: string) {
    setSelected(prev => (
      prev.includes(iso3)
        ? (prev.length > 1 ? prev.filter(c => c !== iso3) : prev)
        : [...prev, iso3]
    ));
  }

  if (rows.length === 0) {
    return (
      <ChartCard
        isDarkMode={isDarkMode}
        title="Debt Trajectories Since 1990"
        height="h-auto"
      >
        <p className={`text-sm ${theme.subtitleCls}`}>
          Live World Bank central-government-debt data has not arrived yet. Central government debt
          has patchy coverage — several large sovereigns report only general government debt, which
          the IMF WEO chart above uses instead.
        </p>
      </ChartCard>
    );
  }

  const latestYear = rows[rows.length - 1]?.year;
  const a11yRows = shown
    .map(m => {
      for (let i = rows.length - 1; i >= 0; i--) {
        const v = rows[i]![m.name];
        if (typeof v === 'number') return { label: m.name, value: v };
      }
      return { label: m.name, value: null };
    });

  return (
    <ChartCard
      isDarkMode={isDarkMode}
      title="Debt Trajectories Since 1990"
      subtitle="Central government debt as a share of GDP. Drag the handles under the chart to zoom into a period; click a country to add or remove its line."
      height="h-[300px] sm:h-[420px]"
      actions={
        <div className="flex flex-wrap gap-1.5 max-w-lg justify-start sm:justify-end">
          {DEBT_COUNTRY_META.slice(0, 12).map(m => {
            const on = selected.includes(m.iso3);
            return (
              <button
                key={m.iso3}
                onClick={() => toggle(m.iso3)}
                aria-pressed={on}
                className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${
                  on
                    ? 'text-white border-transparent'
                    : isDarkMode
                      ? 'border-gray-600 text-gray-400 hover:text-gray-200'
                      : 'border-gray-300 text-gray-500 hover:text-gray-800'
                }`}
                style={on ? { backgroundColor: m.color } : undefined}
              >
                {m.iso3}
              </button>
            );
          })}
        </div>
      }
      caption={
        <ChartA11yCaption
          title={`Central government debt as a share of GDP, latest available year (through ${latestYear})`}
          unit="%"
          rows={a11yRows}
        />
      }
      footnote={
        <>
          Live World Bank GC.DOD.TOTL.GD.ZS from {START_YEAR}. Reference lines mark the 60%
          Maastricht ceiling and the 100% level above which debt service starts crowding out
          everything else in a budget. Coverage is uneven: this series is <em>central</em>
          {' '}government debt, so it sits below the general-government figures the IMF publishes,
          and some sovereigns skip years entirely — gaps in a line are missing data, not a
          sovereign that stopped borrowing.
        </>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
          <XAxis dataKey="year" stroke={theme.axis} tick={{ fontSize: 11 }} />
          <YAxis stroke={theme.axis} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
          <ReferenceLine y={60} stroke={theme.palette.warning} strokeDasharray="4 4" label={{ value: '60% Maastricht', position: 'insideTopRight', fill: theme.axis, fontSize: 10 }} />
          <ReferenceLine y={100} stroke={theme.palette.negative} strokeDasharray="4 4" label={{ value: '100% of GDP', position: 'insideTopRight', fill: theme.axis, fontSize: 10 }} />
          <Tooltip content={<ChartTooltip theme={theme} unit="% of GDP" sortByValue />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {shown.map(m => (
            <Line
              key={m.iso3}
              type="monotone"
              dataKey={m.name}
              name={m.name}
              stroke={m.color}
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          ))}
          <Brush
            dataKey="year"
            height={24}
            travellerWidth={10}
            stroke={theme.palette.info}
            fill={isDarkMode ? '#1f2937' : '#f9fafb'}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

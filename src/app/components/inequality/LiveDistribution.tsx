'use client';

// Live World Bank distribution charts for the Inequality Ledger: Gini over
// time, income shares by fifth with the Palma ratio, and the Great Gatsby
// curve. Moved here from the Development Ledger so /development can focus on
// human development and poverty.

import { useMemo, useState } from 'react';
import type { CountryKey } from '../../utils/countryMappings';
import { INTERGENERATIONAL_ELASTICITY, latestObs } from '../../services/developmentCurated';
import { useDevSeries } from '../../development/useDevelopmentData';
import { useQuintileShares } from './quintileShares';
import { RankedBars, ScatterPlot, StackedBars, TrendLines } from '../development/charts';
import { ChapterLoadingGuard, CountryPicker, Panel, Segmented } from '../development/ui';

const DEFAULT_KEYS: CountryKey[] = ['USA', 'UK', 'Brazil', 'SouthAfrica', 'China', 'Sweden'];

export function GiniOverTime({ isDarkMode }: { isDarkMode: boolean }) {
  const { data, loading } = useDevSeries(['gini']);
  const [keys, setKeys] = useState<CountryKey[]>(DEFAULT_KEYS);
  return (
    <Panel
      isDarkMode={isDarkMode}
      title="Gini over Time"
      subtitle="Each dot is a household survey; lines join surveys, so a straight segment can span many unobserved years."
      note="World Bank SI.POV.GINI. Some countries measure consumption, others income; income Ginis run higher, so compare trends within a country rather than levels across them."
    >
      <div className="mb-3">
        <CountryPicker isDarkMode={isDarkMode} selected={keys} onChange={setKeys} />
      </div>
      <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
        <TrendLines isDarkMode={isDarkMode} series={data.gini} keys={keys} fromYear={1980} markers format={(v) => v.toFixed(0)} height={380} />
      </ChapterLoadingGuard>
    </Panel>
  );
}

export function WhoGetsWhat({ isDarkMode }: { isDarkMode: boolean }) {
  const { rows, loading } = useQuintileShares();
  const [view, setView] = useState<'palma' | 'quintiles'>('quintiles');
  const sorted = useMemo(() => [...rows].sort((a, b) => (a.palma ?? 0) - (b.palma ?? 0)), [rows]);
  return (
    <Panel
      isDarkMode={isDarkMode}
      title={view === 'quintiles' ? 'Income Shares by Fifth' : 'The Palma Ratio'}
      subtitle={
        view === 'quintiles'
          ? 'Share of income or consumption received by each fifth of the population, latest survey. Sorted from most to least equal.'
          : "Income share of the richest 10% divided by the poorest 40%. Gabriel Palma's observation: the middle half takes roughly half almost everywhere, so the tails are where countries differ."
      }
      actions={
        <Segmented
          isDarkMode={isDarkMode}
          value={view}
          onChange={setView}
          options={[
            { id: 'quintiles', label: 'Quintiles' },
            { id: 'palma', label: 'Palma ratio' },
          ]}
        />
      }
      note="World Bank SI.DST series from household surveys; survey years differ by country. Most of South Asia and Africa measure consumption rather than income, which is always more evenly spread, so countries such as India look more equal here than an income survey would show."
    >
      <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading} height={480}>
        {view === 'quintiles' ? (
          <div className="overflow-y-auto max-h-[560px]">
            <StackedBars
              isDarkMode={isDarkMode}
              rows={sorted.map(({ key, Q1, Q2, Q3, Q4, Q5 }) => ({ key, Q1, Q2, Q3, Q4, Q5 }))}
              domainMax={100}
              stacks={[
                { key: 'Q1', label: 'Poorest 20%', color: '#ef4444' },
                { key: 'Q2', label: 'Second', color: '#f97316' },
                { key: 'Q3', label: 'Middle', color: '#eab308' },
                { key: 'Q4', label: 'Fourth', color: '#22c55e' },
                { key: 'Q5', label: 'Richest 20%', color: '#3b82f6' },
              ]}
              format={(v) => `${v.toFixed(0)}%`}
            />
          </div>
        ) : (
          <RankedBars
            isDarkMode={isDarkMode}
            rows={sorted.filter((r) => r.palma != null).map((r) => ({ key: r.key, value: r.palma!, year: r.year }))}
            higherIsBetter={false}
            format={(v) => v.toFixed(2)}
            color={() => '#e11d48'}
          />
        )}
      </ChapterLoadingGuard>
    </Panel>
  );
}

export function GreatGatsbyCurve({ isDarkMode }: { isDarkMode: boolean }) {
  const { data, loading } = useDevSeries(['gini']);
  const rows = useMemo(
    () =>
      (Object.keys(INTERGENERATIONAL_ELASTICITY) as CountryKey[])
        .map((k) => {
          const g = latestObs(data.gini, k);
          const ige = INTERGENERATIONAL_ELASTICITY[k];
          return g && ige != null ? { key: k, x: g.value, y: ige } : null;
        })
        .filter((r): r is NonNullable<typeof r> => r !== null),
    [data.gini]
  );
  return (
    <Panel
      isDarkMode={isDarkMode}
      title="The Great Gatsby Curve"
      subtitle="Latest Gini against the intergenerational earnings elasticity: how strongly a father's earnings predict his son's. More unequal countries tend to pass advantage down more reliably."
      note="Elasticities are rounded estimates from Corak (2013), measured for cohorts born around the 1960s, so the axes are decades apart. The relationship is a correlation across a small sample, not proof of cause."
    >
      <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
        <ScatterPlot
          isDarkMode={isDarkMode}
          rows={rows}
          xLabel="Gini index (latest)"
          yLabel="Earnings elasticity"
          xFormat={(v) => v.toFixed(0)}
          yFormat={(v) => v.toFixed(2)}
          labelAll
          height={400}
        />
      </ChapterLoadingGuard>
    </Panel>
  );
}

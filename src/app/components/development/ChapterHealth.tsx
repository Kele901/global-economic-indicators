'use client';

import { useMemo, useState } from 'react';
import { COUNTRY_KEYS } from '../../utils/countryMappings';
import { latestObs } from '../../services/developmentCurated';
import { useDevSeries, type DevAlias } from '../../development/useDevelopmentData';
import { RankedBars, ScatterPlot, StackedBars } from './charts';
import { latestRows, pairRows, rowsToCsv, type ChapterProps } from './data';
import { ChapterHeader, ChapterLoadingGuard, ChapterMeta, Panel, Segmented } from './ui';

const ALIASES: DevAlias[] = [
  'under5Mortality', 'maternalMortality', 'physiciansPer1000', 'hospitalBeds', 'immunizationDPT', 'immunizationMeasles',
  'uhcCoverage', 'outOfPocket', 'electricityAccess', 'basicWater', 'basicSanitation', 'healthExpenditure', 'lifeExpectancy',
];

type OutcomeId = 'under5Mortality' | 'maternalMortality' | 'immunizationMeasles' | 'hospitalBeds';
const OUTCOMES: { id: OutcomeId; label: string; higherIsBetter: boolean; format: (v: number) => string }[] = [
  { id: 'under5Mortality', label: 'Under-5 mortality', higherIsBetter: false, format: (v) => v.toFixed(1) },
  { id: 'maternalMortality', label: 'Maternal mortality', higherIsBetter: false, format: (v) => v.toFixed(0) },
  { id: 'immunizationMeasles', label: 'Measles vaccination', higherIsBetter: true, format: (v) => `${v.toFixed(0)}%` },
  { id: 'hospitalBeds', label: 'Hospital beds', higherIsBetter: true, format: (v) => v.toFixed(1) },
];

export default function ChapterHealth({ isDarkMode, selected }: ChapterProps) {
  const { data, loading } = useDevSeries(ALIASES);
  const [outcome, setOutcome] = useState<OutcomeId>('under5Mortality');
  const cfg = OUTCOMES.find((o) => o.id === outcome)!;

  const uhcVsOop = useMemo(() => pairRows(data, 'outOfPocket', 'uhcCoverage'), [data]);
  const u5VsDoctors = useMemo(() => pairRows(data, 'physiciansPer1000', 'under5Mortality'), [data]);
  const spendVsLife = useMemo(() => pairRows(data, 'healthExpenditure', 'lifeExpectancy'), [data]);

  const services = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => {
        const e = latestObs(data.electricityAccess, k)?.value;
        const w = latestObs(data.basicWater, k)?.value;
        const s = latestObs(data.basicSanitation, k)?.value;
        const vals = [e, w, s].filter((v): v is number => v != null);
        if (!vals.length) return null;
        return { key: k, Electricity: e ?? 0, Water: w ?? 0, Sanitation: s ?? 0, avg: vals.reduce((a, b) => a + b, 0) / vals.length };
      })
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => a.avg - b.avg),
    [data]
  );

  return (
    <section className="mb-14">
      <ChapterHeader
        isDarkMode={isDarkMode}
        number={7}
        title="Health and Basic Services"
        subtitle="Child survival is the single most sensitive indicator of development. Behind it sit vaccines, clinics, clean water and sanitation, and whether families can afford care when they need it."
      />
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-development-suite', 'wb-health-spend']}
        download={{
          filename: 'development-health',
          title: 'Health and basic services',
          getData: () => rowsToCsv(Object.fromEntries(ALIASES.map((a) => [a, data[a]]))),
        }}
      />

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <Panel
          isDarkMode={isDarkMode}
          title="Health Outcomes"
          subtitle="Under-5 deaths per 1,000 births; maternal deaths per 100,000 births; measles vaccination of 12-23 month olds; beds per 1,000 people."
          actions={<Segmented isDarkMode={isDarkMode} value={outcome} onChange={setOutcome} options={OUTCOMES.map((o) => ({ id: o.id, label: o.label }))} />}
        >
          <RankedBars isDarkMode={isDarkMode} rows={latestRows(data[outcome])} higherIsBetter={cfg.higherIsBetter} highlight={selected} format={cfg.format} />
        </Panel>
        <Panel
          isDarkMode={isDarkMode}
          title="Coverage vs Cost of Care"
          subtitle="Universal health coverage service index (0-100) against out-of-pocket spending as a share of health spending."
          note="High out-of-pocket shares push households into poverty when someone falls ill."
        >
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <ScatterPlot isDarkMode={isDarkMode} rows={uhcVsOop} xLabel="Out-of-pocket % of health spending" yLabel="UHC service coverage" xFormat={(v) => `${v.toFixed(0)}%`} yFormat={(v) => v.toFixed(0)} highlight={selected} />
          </ChapterLoadingGuard>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <Panel isDarkMode={isDarkMode} title="Doctors and Child Survival" subtitle="Physicians per 1,000 people against under-5 mortality.">
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <ScatterPlot isDarkMode={isDarkMode} rows={u5VsDoctors} xLabel="Physicians per 1,000" yLabel="Under-5 deaths per 1,000" xFormat={(v) => v.toFixed(1)} yFormat={(v) => v.toFixed(0)} highlight={selected} />
          </ChapterLoadingGuard>
        </Panel>
        <Panel
          isDarkMode={isDarkMode}
          title="Spending Efficiency"
          subtitle="Current health expenditure (% of GDP) against life expectancy. The US is the outlier: highest spending, below-peer longevity."
        >
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <ScatterPlot isDarkMode={isDarkMode} rows={spendVsLife} xLabel="Health spending % of GDP" yLabel="Life expectancy" xFormat={(v) => `${v.toFixed(0)}%`} yFormat={(v) => v.toFixed(0)} highlight={[...selected, 'USA']} />
          </ChapterLoadingGuard>
        </Panel>
      </div>

      <Panel
        isDarkMode={isDarkMode}
        title="Basic Services Access"
        subtitle="Share of the population with electricity, at least basic drinking water and at least basic sanitation. Sorted from lowest average access."
      >
        <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
          <div className="overflow-y-auto max-h-[520px]">
            <StackedBars
              isDarkMode={isDarkMode}
              rows={services}
              stacked={false}
              domainMax={100}
              stacks={[
                { key: 'Electricity', label: 'Electricity', color: '#f59e0b' },
                { key: 'Water', label: 'Basic water', color: '#0ea5e9' },
                { key: 'Sanitation', label: 'Basic sanitation', color: '#10b981' },
              ]}
              format={(v) => `${v.toFixed(0)}%`}
            />
          </div>
        </ChapterLoadingGuard>
      </Panel>
    </section>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { HCI_SNAPSHOT, HDR, latestObs } from '../../services/developmentCurated';
import { useDevSeries } from '../../development/useDevelopmentData';
import { RankedBars, ScatterPlot, StackedBars } from './charts';
import { latestRows, rowsToCsv, type ChapterProps } from './data';
import { ChapterHeader, ChapterLoadingGuard, ChapterMeta, Panel, Segmented } from './ui';

export default function ChapterHumanCapital({ isDarkMode, selected }: ChapterProps) {
  const { data, loading } = useDevSeries([
    'primaryCompletion', 'secondaryEnrollment', 'tertiaryEnrollment', 'learningPoverty', 'hci', 'lays', 'expectedYearsSchool', 'stunting',
  ]);
  const [scope, setScope] = useState<'selected' | 'all'>('selected');

  const pipeline = useMemo(() => {
    const keys: readonly CountryKey[] = scope === 'all' ? COUNTRY_KEYS : selected;
    return keys
      .map((k) => {
        const p = latestObs(data.primaryCompletion, k);
        const s = latestObs(data.secondaryEnrollment, k);
        const te = latestObs(data.tertiaryEnrollment, k);
        if (!p && !s && !te) return null;
        return { key: k, Primary: p ? Math.min(110, +p.value.toFixed(1)) : 0, Secondary: s ? +s.value.toFixed(1) : 0, Tertiary: te ? +te.value.toFixed(1) : 0 };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [data, scope, selected]);

  const laysVsYears = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => {
        const l = latestObs(data.lays, k);
        const e = latestObs(data.expectedYearsSchool, k);
        return l && e ? { key: k, x: e.value, y: l.value } : null;
      }).filter((r): r is NonNullable<typeof r> => r !== null),
    [data]
  );

  const hciVsHdi = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => {
        const hci = latestObs(data.hci, k)?.value ?? HCI_SNAPSHOT[k]?.value;
        const hdi = HDR[k]?.hdi;
        return hci != null && hdi != null ? { key: k, x: hdi, y: hci } : null;
      }).filter((r): r is NonNullable<typeof r> => r !== null),
    [data.hci]
  );

  return (
    <section className="mb-14">
      <ChapterHeader
        isDarkMode={isDarkMode}
        number={6}
        title="Human Capital"
        subtitle="Years in a classroom are not the same as learning. The World Bank's learning-adjusted years of schooling and learning-poverty measures show how much of the enrolment boom turned into skills."
      />
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-human-capital', 'wb-education', 'undp-hdr']}
        download={{
          filename: 'development-human-capital',
          title: 'Human capital',
          getData: () =>
            rowsToCsv({
              'primary completion %': data.primaryCompletion,
              'secondary enrolment % gross': data.secondaryEnrollment,
              'tertiary enrolment % gross': data.tertiaryEnrollment,
              'learning poverty %': data.learningPoverty,
              'human capital index': data.hci,
              'learning-adjusted years of school': data.lays,
              'stunting %': data.stunting,
            }),
        }}
      />

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <Panel
          isDarkMode={isDarkMode}
          title="The Education Pipeline"
          subtitle="Primary completion, secondary and tertiary gross enrolment (%). Gross rates can exceed 100% when over-age students enrol."
          actions={
            <Segmented
              isDarkMode={isDarkMode}
              value={scope}
              onChange={setScope}
              options={[
                { id: 'selected', label: 'Selected' },
                { id: 'all', label: 'All 47' },
              ]}
            />
          }
        >
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <div className="overflow-y-auto max-h-[520px]">
              <StackedBars
                isDarkMode={isDarkMode}
                rows={pipeline}
                stacked={false}
                stacks={[
                  { key: 'Primary', label: 'Primary completion', color: '#22c55e' },
                  { key: 'Secondary', label: 'Secondary', color: '#3b82f6' },
                  { key: 'Tertiary', label: 'Tertiary', color: '#a855f7' },
                ]}
                format={(v) => `${v.toFixed(0)}%`}
              />
            </div>
          </ChapterLoadingGuard>
        </Panel>
        <Panel
          isDarkMode={isDarkMode}
          title="Learning Poverty"
          subtitle="Share of 10-year-olds who cannot read and understand a simple text, counting out-of-school children as not reading."
          note="Covers low- and middle-income countries with comparable learning assessments."
        >
          <RankedBars isDarkMode={isDarkMode} rows={latestRows(data.learningPoverty)} higherIsBetter={false} highlight={selected} format={(v) => `${v.toFixed(0)}%`} domainMax={100} color={() => '#f97316'} />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <Panel
          isDarkMode={isDarkMode}
          title="Years of School vs Years of Learning"
          subtitle="Expected years of school by age 18 against learning-adjusted years. The vertical distance below the dashed line is schooling that did not translate into learning."
        >
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <ScatterPlot isDarkMode={isDarkMode} rows={laysVsYears} xLabel="Expected years of school" yLabel="Learning-adjusted years" xFormat={(v) => v.toFixed(0)} yFormat={(v) => v.toFixed(0)} highlight={selected} diagonal />
          </ChapterLoadingGuard>
        </Panel>
        <Panel
          isDarkMode={isDarkMode}
          title="Human Capital Index vs HDI"
          subtitle="HCI: the productivity a child born today can expect to reach, relative to full health and complete education (0-1)."
          note="HCI from the World Bank (latest edition, 2020); HDI from UNDP 2025."
        >
          <ScatterPlot isDarkMode={isDarkMode} rows={hciVsHdi} xLabel="HDI" yLabel="Human Capital Index" xFormat={(v) => v.toFixed(2)} yFormat={(v) => v.toFixed(2)} highlight={selected} />
        </Panel>
      </div>

      <Panel
        isDarkMode={isDarkMode}
        title="Child Stunting"
        subtitle="Share of children under five who are too short for their age, a marker of chronic malnutrition that permanently affects learning and earnings."
      >
        <RankedBars isDarkMode={isDarkMode} rows={latestRows(data.stunting, 2010)} higherIsBetter={false} highlight={selected} format={(v) => `${v.toFixed(1)}%`} color={() => '#eab308'} />
      </Panel>
    </section>
  );
}

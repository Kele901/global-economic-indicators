'use client';

import { useCallback, useMemo, useState } from 'react';
import { COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { HDR, latestObs, valueAt } from '../../services/developmentCurated';
import { useDevSeries, type DevAlias } from '../../development/useDevelopmentData';
import { RankedBars, ScatterPlot, StackedBars, TrendLines } from './charts';
import { latestRows, pairRows, rowsToCsv, type ChapterProps } from './data';
import { ChapterHeader, ChapterLoadingGuard, ChapterMeta, CountryPicker, Panel, Segmented, fmt } from './ui';

const ALIASES: DevAlias[] = [
  'employmentAgriculture', 'employmentIndustry', 'employmentServices', 'urbanPopulation', 'gdpPerCapitaPPP', 'gdpPcConst',
  'remittances', 'oda', 'fdi', 'accountOwnership', 'resourceRents',
];

type FlowId = 'remittances' | 'oda' | 'fdi' | 'accountOwnership';
const FLOWS: { id: FlowId; label: string; sub: string; format: (v: number) => string }[] = [
  { id: 'remittances', label: 'Remittances', sub: 'Personal remittances received, % of GDP.', format: (v) => `${v.toFixed(1)}%` },
  { id: 'oda', label: 'Aid', sub: 'Net official development assistance received, % of GNI.', format: (v) => `${v.toFixed(2)}%` },
  { id: 'fdi', label: 'FDI', sub: 'Foreign direct investment net inflows, % of GDP. Negative values are net disinvestment.', format: (v) => `${v.toFixed(1)}%` },
  { id: 'accountOwnership', label: 'Bank accounts', sub: 'Adults (15+) with an account at a financial institution or mobile-money provider (Global Findex).', format: (v) => `${v.toFixed(0)}%` },
];

export default function ChapterStructure({ isDarkMode, selected, onSelectedChange }: ChapterProps) {
  const { data, loading } = useDevSeries(ALIASES);
  const [flow, setFlow] = useState<FlowId>('remittances');
  const cfg = FLOWS.find((f) => f.id === flow)!;

  const sectors = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => {
        const a = latestObs(data.employmentAgriculture, k);
        const i = latestObs(data.employmentIndustry, k);
        const s = latestObs(data.employmentServices, k);
        return a && i && s ? { key: k, Agriculture: +a.value.toFixed(1), Industry: +i.value.toFixed(1), Services: +s.value.toFixed(1) } : null;
      })
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => b.Agriculture - a.Agriculture),
    [data]
  );

  const urbanVsIncome = useMemo(() => pairRows(data, 'gdpPerCapitaPPP', 'urbanPopulation'), [data]);

  const rentsVsHdi = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => {
        const r = latestObs(data.resourceRents, k);
        const h = HDR[k]?.hdi;
        return r && h != null ? { key: k, x: r.value, y: h } : null;
      }).filter((x): x is NonNullable<typeof x> => x !== null),
    [data.resourceRents]
  );

  const relativeToUs = useCallback(
    (_k: CountryKey, year: number, v: number) => {
      const us = valueAt(data.gdpPcConst, 'USA', year);
      return us ? (v / us) * 100 : null;
    },
    [data.gdpPcConst]
  );

  return (
    <section className="mb-14">
      <ChapterHeader
        isDarkMode={isDarkMode}
        number={9}
        title="Structural Change and Money Flows"
        subtitle="Development is a reallocation: workers move from farms to factories and offices, people move to cities, and money arrives from migrants, donors and investors. Many middle-income countries stall partway, the so-called middle-income trap."
      />
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-development-suite', 'wb-remittances']}
        download={{
          filename: 'development-structure',
          title: 'Structural change and flows',
          getData: () => rowsToCsv(Object.fromEntries(ALIASES.map((a) => [a, data[a]]))),
        }}
      />

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <Panel isDarkMode={isDarkMode} title="Where People Work" subtitle="Employment by sector, % of total (ILO modelled). Sorted by farm share.">
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <div className="overflow-y-auto max-h-[560px]">
              <StackedBars
                isDarkMode={isDarkMode}
                rows={sectors}
                domainMax={100}
                stacks={[
                  { key: 'Agriculture', label: 'Agriculture', color: '#84cc16' },
                  { key: 'Industry', label: 'Industry', color: '#f97316' },
                  { key: 'Services', label: 'Services', color: '#6366f1' },
                ]}
                format={(v) => `${v.toFixed(0)}%`}
              />
            </div>
          </ChapterLoadingGuard>
        </Panel>
        <Panel isDarkMode={isDarkMode} title="Urbanisation and Income" subtitle="Urban share of population against GDP per person (PPP, log scale).">
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <ScatterPlot isDarkMode={isDarkMode} rows={urbanVsIncome} xLabel="GDP per person (PPP)" yLabel="Urban %" xLog xFormat={fmt.usdK} yFormat={(v) => `${v.toFixed(0)}%`} highlight={selected} />
          </ChapterLoadingGuard>
        </Panel>
      </div>

      <Panel
        isDarkMode={isDarkMode}
        title="The Middle-Income Trap"
        subtitle="GDP per person as a percentage of the United States (constant 2015 US$). Korea broke out; many others have moved sideways for decades."
        className="mb-6"
      >
        <div className="mb-3">
          <CountryPicker isDarkMode={isDarkMode} selected={selected} onChange={onSelectedChange} />
        </div>
        <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
          <TrendLines
            isDarkMode={isDarkMode}
            series={data.gdpPcConst}
            keys={selected.filter((k) => k !== 'USA')}
            fromYear={1960}
            transform={relativeToUs}
            format={(v) => `${v.toFixed(0)}%`}
            refY={50}
            refLabel="Half of US level"
          />
        </ChapterLoadingGuard>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          isDarkMode={isDarkMode}
          title={cfg.label}
          subtitle={cfg.sub}
          actions={<Segmented isDarkMode={isDarkMode} value={flow} onChange={setFlow} options={FLOWS.map((f) => ({ id: f.id, label: f.label }))} />}
        >
          <RankedBars isDarkMode={isDarkMode} rows={latestRows(data[flow])} highlight={selected} format={cfg.format} />
        </Panel>
        <Panel
          isDarkMode={isDarkMode}
          title="The Resource Curse"
          subtitle="Natural-resource rents (% of GDP) against HDI. Resource wealth is not destiny: Norway and Nigeria are both oil economies."
        >
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <ScatterPlot isDarkMode={isDarkMode} rows={rentsVsHdi} xLabel="Resource rents % of GDP" yLabel="HDI" xFormat={(v) => `${v.toFixed(0)}%`} yFormat={(v) => v.toFixed(2)} highlight={[...selected, 'Norway', 'Nigeria']} />
          </ChapterLoadingGuard>
        </Panel>
      </div>
    </section>
  );
}

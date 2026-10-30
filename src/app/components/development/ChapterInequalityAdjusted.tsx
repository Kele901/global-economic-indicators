'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { HDR, SUBNATIONAL_HDI, latestObs } from '../../services/developmentCurated';
import { useDevSeries } from '../../development/useDevelopmentData';
import { RankedBars, ScatterPlot, StackedBars } from './charts';
import { hdrRows, type ChapterProps } from './data';
import { ChapterHeader, ChapterLoadingGuard, ChapterMeta, Panel, Segmented, countryName, theme } from './ui';

export default function ChapterInequalityAdjusted({ isDarkMode, selected }: ChapterProps) {
  const t = theme(isDarkMode);
  const { data, loading } = useDevSeries(['electricityUrban', 'electricityRural', 'waterUrban', 'waterRural']);
  const [service, setService] = useState<'electricity' | 'water'>('electricity');

  const hdiVsIhdi = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => (HDR[k]?.hdi != null && HDR[k]?.ihdi != null ? { key: k, x: HDR[k]!.hdi!, y: HDR[k]!.ihdi! } : null)).filter(
        (r): r is NonNullable<typeof r> => r !== null
      ),
    []
  );

  const components = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => {
        const r = HDR[k];
        if (!r || r.inequalityLife == null || r.inequalityEducation == null || r.inequalityIncome == null) return null;
        return { key: k, Health: r.inequalityLife, Education: r.inequalityEducation, Income: r.inequalityIncome, total: r.ihdiLoss ?? 0 };
      })
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => b.total - a.total),
    []
  );

  const urbanRural = useMemo(() => {
    const [u, r] = service === 'electricity' ? [data.electricityUrban, data.electricityRural] : [data.waterUrban, data.waterRural];
    return COUNTRY_KEYS.map((k) => {
      const uo = latestObs(u, k);
      const ro = latestObs(r, k);
      if (!uo || !ro) return null;
      return { key: k as CountryKey, Urban: +uo.value.toFixed(1), Rural: +ro.value.toFixed(1), gap: uo.value - ro.value };
    })
      .filter((x): x is NonNullable<typeof x> => x !== null && x.gap > 0.5)
      .sort((a, b) => b.gap - a.gap);
  }, [data, service]);

  const subnational = (Object.keys(SUBNATIONAL_HDI) as CountryKey[])
    .map((k) => ({ key: k, ...SUBNATIONAL_HDI[k]!, national: HDR[k]?.hdi ?? null }))
    .sort((a, b) => b.max - b.min - (a.max - a.min));

  return (
    <section className="mb-14">
      <ChapterHeader
        isDarkMode={isDarkMode}
        number={5}
        title="Inequality-Adjusted Development"
        subtitle="A national average hides who gets the gains. UNDP's inequality-adjusted HDI (IHDI) discounts each dimension by how unequally it is shared, and the gap between HDI and IHDI is the development lost to inequality."
      />
      <ChapterMeta isDarkMode={isDarkMode} sourceIds={['undp-hdr', 'wb-development-suite', 'development-curated']} flags={['curated', 'estimate']} />

      <div className={`rounded-xl border p-4 mb-6 text-sm ${isDarkMode ? 'border-rose-800 bg-rose-900/20 text-rose-200' : 'border-rose-200 bg-rose-50 text-rose-900'}`}>
        Looking for Gini coefficients, income shares by fifth or the Palma ratio? The distribution of income itself now lives in the{' '}
        <Link href="/inequality#chapter-2" className="underline font-medium">
          Inequality Ledger
        </Link>
        . This chapter covers what inequality does to health, schooling and living standards.
      </div>

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <Panel
          isDarkMode={isDarkMode}
          title="Human Development Lost to Inequality"
          subtitle="Percentage difference between HDI and IHDI."
        >
          <RankedBars isDarkMode={isDarkMode} rows={hdrRows((r) => r.ihdiLoss)} higherIsBetter={false} highlight={selected} format={(v) => `${v.toFixed(1)}%`} color={() => '#f43f5e'} />
        </Panel>
        <Panel isDarkMode={isDarkMode} title="HDI vs Inequality-Adjusted HDI" subtitle="The further below the dashed line, the larger the loss.">
          <ScatterPlot isDarkMode={isDarkMode} rows={hdiVsIhdi} xLabel="HDI" yLabel="IHDI" xFormat={(v) => v.toFixed(2)} yFormat={(v) => v.toFixed(2)} highlight={selected} diagonal />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <Panel
          isDarkMode={isDarkMode}
          title="Where the Inequality Is"
          subtitle="Atkinson inequality in each dimension (%). Income inequality dominates in rich countries; health and schooling gaps dominate in poorer ones."
        >
          <div className="overflow-y-auto max-h-[520px]">
            <StackedBars
              isDarkMode={isDarkMode}
              rows={components}
              stacked={false}
              stacks={[
                { key: 'Health', label: 'Life expectancy', color: '#10b981' },
                { key: 'Education', label: 'Education', color: '#3b82f6' },
                { key: 'Income', label: 'Income', color: '#f59e0b' },
              ]}
              format={(v) => `${v.toFixed(0)}%`}
            />
          </div>
        </Panel>
        <Panel
          isDarkMode={isDarkMode}
          title="Urban vs Rural Access"
          subtitle="Share of urban and rural residents with access. Countries with near-universal access in both are omitted."
          actions={
            <Segmented
              isDarkMode={isDarkMode}
              value={service}
              onChange={setService}
              options={[
                { id: 'electricity', label: 'Electricity' },
                { id: 'water', label: 'Basic water' },
              ]}
            />
          }
        >
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <div className="overflow-y-auto max-h-[520px]">
              <StackedBars
                isDarkMode={isDarkMode}
                rows={urbanRural}
                stacked={false}
                domainMax={100}
                stacks={[
                  { key: 'Urban', label: 'Urban', color: '#6366f1' },
                  { key: 'Rural', label: 'Rural', color: '#84cc16' },
                ]}
                format={(v) => `${v.toFixed(0)}%`}
              />
            </div>
          </ChapterLoadingGuard>
        </Panel>
      </div>

      <Panel
        isDarkMode={isDarkMode}
        title="Development Gaps Inside Countries"
        subtitle="Lowest and highest regional HDI (Global Data Lab Subnational HDI). The national value sits somewhere between."
        note="Approximate values; regional definitions differ by country."
      >
        <div className="space-y-2">
          {subnational.map((r) => {
            const lo = 0.3;
            const hi = 1;
            const pos = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`;
            return (
              <div key={r.key} className="grid grid-cols-[7rem_1fr] sm:grid-cols-[8rem_1fr_16rem] items-center gap-3 text-xs">
                <span className={t.text}>{countryName(r.key)}</span>
                <div className={`relative h-6 rounded ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                  <div className="absolute top-2 h-2 rounded bg-emerald-500/60" style={{ left: pos(r.min), width: `calc(${pos(r.max)} - ${pos(r.min)})` }} />
                  {r.national != null && (
                    <div className={`absolute top-0.5 h-5 w-0.5 ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`} style={{ left: pos(r.national) }} title={`National ${r.national.toFixed(3)}`} />
                  )}
                </div>
                <span className={`hidden sm:block text-[11px] ${t.textMuted}`}>
                  {r.minRegion} {r.min.toFixed(2)} {'\u2013'} {r.max.toFixed(2)} {r.maxRegion}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>
    </section>
  );
}

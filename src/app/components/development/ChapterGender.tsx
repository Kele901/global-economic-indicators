'use client';

import { useMemo, useState } from 'react';
import { COUNTRY_KEYS } from '../../utils/countryMappings';
import { HDR, latestObs } from '../../services/developmentCurated';
import { useDevSeries, type DevAlias } from '../../development/useDevelopmentData';
import { RankedBars, ScatterPlot } from './charts';
import { hdrRows, latestRows, pairRows, rowsToCsv, type ChapterProps } from './data';
import { ChapterHeader, ChapterLoadingGuard, ChapterMeta, Panel, Segmented } from './ui';

const ALIASES: DevAlias[] = [
  'lifeExpMale', 'lifeExpFemale', 'femaleLaborForce', 'maleLaborForce', 'adolescentFertility', 'womenParliament', 'youthUnemployment', 'schoolGenderParity',
];

type LiveId = 'adolescentFertility' | 'womenParliament' | 'youthUnemployment' | 'leGap';
const LIVE: { id: LiveId; label: string; sub: string; higherIsBetter: boolean; format: (v: number) => string }[] = [
  { id: 'adolescentFertility', label: 'Adolescent births', sub: 'Births per 1,000 women aged 15-19.', higherIsBetter: false, format: (v) => v.toFixed(0) },
  { id: 'womenParliament', label: 'Women in parliament', sub: 'Share of seats in the lower or single chamber held by women.', higherIsBetter: true, format: (v) => `${v.toFixed(0)}%` },
  { id: 'youthUnemployment', label: 'Youth unemployment', sub: 'Unemployed share of the labour force aged 15-24 (ILO modelled).', higherIsBetter: false, format: (v) => `${v.toFixed(1)}%` },
  { id: 'leGap', label: 'Life expectancy gap', sub: 'Female minus male life expectancy at birth, in years.', higherIsBetter: true, format: (v) => `${v.toFixed(1)} yrs` },
];

export default function ChapterGender({ isDarkMode, selected }: ChapterProps) {
  const { data, loading } = useDevSeries(ALIASES);
  const [index, setIndex] = useState<'gdi' | 'gii'>('gii');
  const [live, setLive] = useState<LiveId>('womenParliament');
  const cfg = LIVE.find((l) => l.id === live)!;

  const gdiRows = useMemo(
    () =>
      hdrRows((r) => r.gdi).map((r) => ({
        ...r,
        value: 1 - Math.abs(1 - r.value),
        display: r.value.toFixed(3),
      })),
    []
  );

  const liveRows = useMemo(() => {
    if (live !== 'leGap') return latestRows(data[live]);
    return COUNTRY_KEYS.map((k) => {
      const f = latestObs(data.lifeExpFemale, k);
      const m = latestObs(data.lifeExpMale, k);
      return f && m ? { key: k, value: f.value - m.value, year: f.year } : null;
    }).filter((r): r is NonNullable<typeof r> => r !== null);
  }, [data, live]);

  const labour = useMemo(() => pairRows(data, 'maleLaborForce', 'femaleLaborForce'), [data]);

  return (
    <section className="mb-14">
      <ChapterHeader
        isDarkMode={isDarkMode}
        number={8}
        title="Gender"
        subtitle="Two UNDP indices frame the gap. The Gender Development Index (GDI) is the ratio of female to male HDI; the Gender Inequality Index (GII) combines reproductive health, empowerment and labour-market gaps into a measure of loss, where 0 is equality."
      />
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['undp-hdr', 'wb-gender']}
        flags={['curated']}
        download={{
          filename: 'development-gender',
          title: 'Gender',
          getData: () => [
            ...COUNTRY_KEYS.map((k) => ({ series: 'UNDP GDI / GII', country: k, gdi: HDR[k]?.gdi, gii: HDR[k]?.gii, giiRank: HDR[k]?.giiRank })),
            ...rowsToCsv(Object.fromEntries(ALIASES.map((a) => [a, data[a]]))),
          ],
        }}
      />

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <Panel
          isDarkMode={isDarkMode}
          title={index === 'gdi' ? 'Gender Development Index' : 'Gender Inequality Index'}
          subtitle={
            index === 'gdi'
              ? 'Female HDI divided by male HDI. Ranked by closeness to parity (1.000); values above 1 mean women score higher.'
              : 'Loss in achievement from gender inequality in maternal mortality, adolescent births, parliamentary seats, secondary education and labour force participation. Lower is better.'
          }
          actions={
            <Segmented
              isDarkMode={isDarkMode}
              value={index}
              onChange={setIndex}
              options={[
                { id: 'gii', label: 'GII' },
                { id: 'gdi', label: 'GDI' },
              ]}
            />
          }
          note="UNDP Human Development Report 2025, data year 2023."
        >
          {index === 'gdi' ? (
            <RankedBars isDarkMode={isDarkMode} rows={gdiRows} highlight={selected} format={(v) => v.toFixed(3)} domainMax={1} color={() => '#a855f7'} />
          ) : (
            <RankedBars isDarkMode={isDarkMode} rows={hdrRows((r) => r.gii)} higherIsBetter={false} highlight={selected} format={(v) => v.toFixed(3)} color={() => '#ec4899'} />
          )}
        </Panel>
        <Panel
          isDarkMode={isDarkMode}
          title="Women and Men in the Labour Force"
          subtitle="Labour force participation, ages 15+ (%). The further below the dashed line, the wider the gap."
        >
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <ScatterPlot isDarkMode={isDarkMode} rows={labour} xLabel="Men %" yLabel="Women %" xFormat={(v) => `${v.toFixed(0)}`} yFormat={(v) => `${v.toFixed(0)}`} highlight={selected} diagonal />
          </ChapterLoadingGuard>
        </Panel>
      </div>

      <Panel
        isDarkMode={isDarkMode}
        title={cfg.label}
        subtitle={cfg.sub}
        actions={<Segmented isDarkMode={isDarkMode} value={live} onChange={setLive} options={LIVE.map((l) => ({ id: l.id, label: l.label }))} />}
      >
        <RankedBars isDarkMode={isDarkMode} rows={liveRows} higherIsBetter={cfg.higherIsBetter} highlight={selected} format={cfg.format} />
      </Panel>
    </section>
  );
}

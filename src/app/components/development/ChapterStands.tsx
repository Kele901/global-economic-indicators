'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { COUNTRY_KEYS, COUNTRY_KEY_TO_SLUG } from '../../utils/countryMappings';
import { HDR, HDR_DATA_YEAR, getIncomeGroup, latestObs } from '../../services/developmentCurated';
import { useDevSeries } from '../../development/useDevelopmentData';
import type { DevMapMetric } from '../DevelopmentWorldMap';
import SkeletonCard from '../SkeletonCard';
import { StackedBars } from './charts';
import { hdrDimensions, type ChapterProps } from './data';
import { ChapterHeader, ChapterMeta, CountryPicker, Panel, countryName, fmt, theme } from './ui';

const DevelopmentWorldMap = dynamic(() => import('../DevelopmentWorldMap'), {
  ssr: false,
  loading: () => <SkeletonCard height="h-[420px]" label="Loading map" />,
});

type SortKey = 'hdiRank' | 'lifeExpectancy' | 'expectedSchooling' | 'meanSchooling' | 'gniPerCapita' | 'ihdiLoss';

export default function ChapterStands({ isDarkMode, selected, onSelectedChange }: ChapterProps) {
  const t = theme(isDarkMode);
  const { data } = useDevSeries(['gdpPerCapitaPPP', 'lifeExpectancy', 'poverty300']);
  const [mapMetric, setMapMetric] = useState<DevMapMetric>('hdi');
  const [sort, setSort] = useState<SortKey>('hdiRank');

  const mapScores = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => ({
        country: k,
        hdi: HDR[k]?.hdi ?? null,
        ihdi: HDR[k]?.ihdi ?? null,
        gdpPc: latestObs(data.gdpPerCapitaPPP, k)?.value ?? null,
        lifeExp: latestObs(data.lifeExpectancy, k)?.value ?? null,
        poverty: latestObs(data.poverty300, k, 2010)?.value ?? null,
      })),
    [data]
  );

  const table = useMemo(() => {
    const rows = COUNTRY_KEYS.filter((k) => HDR[k]?.hdi != null).map((k) => ({ key: k, ...HDR[k]! }));
    const asc = sort === 'hdiRank' || sort === 'ihdiLoss';
    return rows.sort((a, b) => {
      const av = a[sort] ?? (asc ? Infinity : -Infinity);
      const bv = b[sort] ?? (asc ? Infinity : -Infinity);
      return asc ? av - bv : bv - av;
    });
  }, [sort]);

  const dims = useMemo(
    () =>
      table
        .map((r) => {
          const d = hdrDimensions(r.key);
          return d
            ? {
                key: r.key,
                Health: +(d.health * 100).toFixed(1),
                Education: +(d.education * 100).toFixed(1),
                Income: +(d.income * 100).toFixed(1),
              }
            : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [table]
  );

  const th = (key: SortKey, label: string) => (
    <th className="px-2 py-1.5 text-right font-medium">
      <button type="button" onClick={() => setSort(key)} className={sort === key ? t.accent : ''}>
        {label}
        {sort === key ? ' \u25BE' : ''}
      </button>
    </th>
  );

  return (
    <section className="mb-14">
      <ChapterHeader
        isDarkMode={isDarkMode}
        number={1}
        title="Where Development Stands"
        subtitle={`The official UNDP Human Development Index for all 47 economies (data year ${HDR_DATA_YEAR}): a long and healthy life, knowledge, and a decent standard of living, combined as a geometric mean so a weakness in one dimension cannot be fully offset by strength in another.`}
      />
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['undp-hdr', 'wb-development-suite', 'wb-poverty']}
        flags={['curated']}
        download={{
          filename: 'development-hdi-2023',
          title: 'Human Development Index',
          getData: () => table.map((r) => ({ country: countryName(r.key), ...r, trend: undefined })),
        }}
      />

      <div className="grid gap-4 lg:grid-cols-3 mb-4">
        {selected.slice(0, 6).map((k) => {
          const r = HDR[k];
          const pov = latestObs(data.poverty300, k);
          return (
            <Link
              key={k}
              href={`/development/${COUNTRY_KEY_TO_SLUG[k]}`}
              className={`rounded-xl border p-4 transition-colors hover:border-emerald-500 ${t.card}`}
            >
              <div className="flex items-baseline justify-between">
                <span className={`font-semibold ${t.text}`}>{countryName(k)}</span>
                <span className={`text-xs ${t.textMuted}`}>{getIncomeGroup(k)}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold tabular-nums text-emerald-500">{fmt.idx(r?.hdi)}</span>
                <span className={`text-xs ${t.textSec}`}>HDI rank {r?.hdiRank ?? '\u2014'} of 193</span>
              </div>
              <div className={`grid grid-cols-3 gap-2 mt-3 text-[11px] ${t.textSec}`}>
                <div>
                  <div className={t.textMuted}>Life exp.</div>
                  <div className={`tabular-nums ${t.text}`}>{fmt.n1(r?.lifeExpectancy)} yrs</div>
                </div>
                <div>
                  <div className={t.textMuted}>GNI / person</div>
                  <div className={`tabular-nums ${t.text}`}>{fmt.usdK(r?.gniPerCapita)}</div>
                </div>
                <div>
                  <div className={t.textMuted}>Below $3/day</div>
                  <div className={`tabular-nums ${t.text}`}>
                    {pov ? `${pov.value.toFixed(1)}% ('${String(pov.year).slice(2)})` : '\u2014'}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mb-6">
        <CountryPicker isDarkMode={isDarkMode} selected={selected} onChange={onSelectedChange} />
      </div>

      <div className="mb-6">
        <DevelopmentWorldMap isDarkMode={isDarkMode} scoreCards={mapScores} metric={mapMetric} onMetricChange={setMapMetric} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          isDarkMode={isDarkMode}
          title="HDI Ranking and Components"
          subtitle="Click a column to sort. Ranks are out of 193 countries; GNI is per person in 2021 PPP dollars."
          note="Source: UNDP Human Development Report 2025 statistical annex."
        >
          <div className="overflow-auto max-h-[560px]">
            <table className={`w-full text-xs ${t.text}`}>
              <thead className={`sticky top-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${t.textSec}`}>
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium">Country</th>
                  {th('hdiRank', 'HDI')}
                  {th('lifeExpectancy', 'Life exp.')}
                  {th('expectedSchooling', 'Exp. school')}
                  {th('meanSchooling', 'Mean school')}
                  {th('gniPerCapita', 'GNI pc')}
                  {th('ihdiLoss', 'IHDI loss')}
                </tr>
              </thead>
              <tbody>
                {table.map((r) => (
                  <tr key={r.key} className={`border-t ${t.border} ${selected.includes(r.key) ? (isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50') : ''}`}>
                    <td className="px-2 py-1">
                      <Link href={`/development/${COUNTRY_KEY_TO_SLUG[r.key]}`} className="hover:underline">
                        <span className={`tabular-nums mr-1.5 ${t.textMuted}`}>{r.hdiRank}</span>
                        {countryName(r.key)}
                      </Link>
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums font-semibold">{fmt.idx(r.hdi)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt.n1(r.lifeExpectancy)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt.n1(r.expectedSchooling)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt.n1(r.meanSchooling)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt.usd(r.gniPerCapita)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{fmt.pct(r.ihdiLoss)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel
          isDarkMode={isDarkMode}
          title="HDI Dimension Indices"
          subtitle="Each dimension scored 0-100 against UNDP goalposts (life 20-85 years; schooling 15 mean / 18 expected years; income $100-$75,000)."
          note="Recomputed from the published components with the UNDP formula; matches the official HDI to within rounding."
        >
          <div className="overflow-y-auto max-h-[560px]">
            <StackedBars
              isDarkMode={isDarkMode}
              rows={dims}
              stacked={false}
              domainMax={100}
              stacks={[
                { key: 'Health', label: 'Health', color: '#10b981' },
                { key: 'Education', label: 'Education', color: '#3b82f6' },
                { key: 'Income', label: 'Income', color: '#f59e0b' },
              ]}
              format={(v) => v.toFixed(0)}
            />
          </div>
        </Panel>
      </div>
    </section>
  );
}

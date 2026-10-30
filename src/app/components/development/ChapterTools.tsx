'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { COUNTRY_KEYS, COUNTRY_KEY_TO_SLUG, type CountryKey } from '../../utils/countryMappings';
import { HDR, getIncomeGroup, latestObs } from '../../services/developmentCurated';
import { useDevSeries, type DevAlias } from '../../development/useDevelopmentData';
import { TrendLines } from './charts';
import type { ChapterProps } from './data';
import { COMPARE_METRICS, PeersPanel, ProjectionsTable, RadarCompare, TOOLS_ALIASES, YearsBehindTable } from './tools';
import { ChapterHeader, ChapterLoadingGuard, ChapterMeta, CountryPicker, CountrySelect, Panel, countryName, fmt, theme } from './ui';

type SortId = 'hdi' | 'ihdi' | 'gii' | 'gni' | 'life' | 'poverty' | 'internet';

export default function ChapterTools({ isDarkMode, selected, onSelectedChange }: ChapterProps) {
  const t = theme(isDarkMode);
  const { data, loading } = useDevSeries(TOOLS_ALIASES);
  const [country, setCountry] = useState<CountryKey>(selected[selected.length - 1] ?? 'India');
  const [metric, setMetric] = useState<DevAlias>('lifeExpectancy');
  const [sort, setSort] = useState<SortId>('hdi');
  const metricDef = COMPARE_METRICS.find((m) => m.alias === metric) ?? COMPARE_METRICS[0];

  const table = useMemo(() => {
    const rows = COUNTRY_KEYS.map((k) => ({
      key: k,
      group: getIncomeGroup(k) ?? '',
      hdi: HDR[k]?.hdi ?? null,
      rank: HDR[k]?.hdiRank ?? null,
      ihdi: HDR[k]?.ihdi ?? null,
      gii: HDR[k]?.gii ?? null,
      gni: HDR[k]?.gniPerCapita ?? null,
      life: HDR[k]?.lifeExpectancy ?? null,
      poverty: latestObs(data.poverty300, k, 2010)?.value ?? null,
      internet: latestObs(data.internetUsers, k)?.value ?? null,
    }));
    const lowerBetter = sort === 'gii' || sort === 'poverty';
    return rows.sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      if (av == null) return 1;
      if (bv == null) return -1;
      return lowerBetter ? av - bv : bv - av;
    });
  }, [data, sort]);

  const th = (id: SortId, label: string) => (
    <th className="px-2 py-1.5 text-right font-medium">
      <button type="button" onClick={() => setSort(id)} className={sort === id ? t.accent : ''}>
        {label}
        {sort === id ? ' \u25BE' : ''}
      </button>
    </th>
  );

  return (
    <section className="mb-14">
      <ChapterHeader
        isDarkMode={isDarkMode}
        number={13}
        title="Compare and Tools"
        subtitle="Put any country next to its income-group peers, see how many years it trails the frontier, project its SDG indicators to 2030, and compare up to eight countries across every dimension."
      />
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['undp-hdr', 'wb-development-suite', 'wb-poverty']}
        download={{
          filename: 'development-rankings',
          title: 'Development rankings',
          getData: () => table.map((r) => ({ country: countryName(r.key), ...r })),
        }}
      />

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <CountrySelect isDarkMode={isDarkMode} value={country} onChange={setCountry} label="Focus country" />
        <Link href={`/development/${COUNTRY_KEY_TO_SLUG[country]}`} className={`text-xs underline underline-offset-2 ${t.accent}`}>
          Open the full {countryName(country)} development profile {'\u2192'}
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <Panel isDarkMode={isDarkMode} title="Countries Like Me" subtitle="Latest values against the median of income-group peers. Green is better than the peer median, red is worse.">
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <PeersPanel isDarkMode={isDarkMode} data={data} country={country} />
          </ChapterLoadingGuard>
        </Panel>
        <Panel isDarkMode={isDarkMode} title="Years Behind the Leader" subtitle="How long ago the benchmark country reached today's level.">
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <YearsBehindTable isDarkMode={isDarkMode} data={data} country={country} />
          </ChapterLoadingGuard>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <Panel
          isDarkMode={isDarkMode}
          title="On Track for 2030?"
          subtitle={`Straight-line projection of the last ten years of data for ${countryName(country)}.`}
          note="A linear trend ignores shocks and saturation; read it as 'if the recent pace continued'."
        >
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <ProjectionsTable isDarkMode={isDarkMode} data={data} country={country} />
          </ChapterLoadingGuard>
        </Panel>
        <Panel isDarkMode={isDarkMode} title="Multi-Dimensional Comparison" subtitle="The ten index-builder dimensions, each scaled 0-100, for your selected countries.">
          <div className="mb-3">
            <CountryPicker isDarkMode={isDarkMode} selected={selected} onChange={onSelectedChange} />
          </div>
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading} height={420}>
            <RadarCompare isDarkMode={isDarkMode} data={data} keys={selected} />
          </ChapterLoadingGuard>
        </Panel>
      </div>

      <Panel
        isDarkMode={isDarkMode}
        title="Development over Time"
        subtitle={`${metricDef.label} for your selected countries.`}
        actions={
          <select value={metric} onChange={(e) => setMetric(e.target.value as DevAlias)} className={`text-xs rounded-md border px-2 py-1 ${t.input}`}>
            {COMPARE_METRICS.map((m) => (
              <option key={m.alias} value={m.alias}>
                {m.label}
              </option>
            ))}
          </select>
        }
        className="mb-6"
      >
        <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
          <TrendLines
            isDarkMode={isDarkMode}
            series={data[metric]}
            keys={selected}
            fromYear={1960}
            format={metricDef.format}
            markers={metric === 'poverty300'}
            logScale={metric === 'gdpPcConst'}
          />
        </ChapterLoadingGuard>
      </Panel>

      <Panel isDarkMode={isDarkMode} title="Full Rankings" subtitle="All 47 economies. Click a column to sort; click a country for its profile.">
        <div className="overflow-auto max-h-[620px]">
          <table className={`w-full text-xs ${t.text}`}>
            <thead className={`sticky top-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${t.textSec}`}>
              <tr>
                <th className="px-2 py-1.5 text-left font-medium">Country</th>
                <th className="px-2 py-1.5 text-left font-medium">Income group</th>
                {th('hdi', 'HDI')}
                {th('ihdi', 'IHDI')}
                {th('gii', 'GII')}
                {th('gni', 'GNI pc')}
                {th('life', 'Life exp.')}
                {th('poverty', '< $3/day')}
                {th('internet', 'Internet')}
              </tr>
            </thead>
            <tbody>
              {table.map((r) => (
                <tr key={r.key} className={`border-t ${t.border}`}>
                  <td className="px-2 py-1">
                    <Link href={`/development/${COUNTRY_KEY_TO_SLUG[r.key]}`} className="hover:underline">
                      {countryName(r.key)}
                    </Link>
                  </td>
                  <td className={`px-2 py-1 ${t.textSec}`}>{r.group}</td>
                  <td className="px-2 py-1 text-right tabular-nums">
                    {fmt.idx(r.hdi)} <span className={t.textMuted}>#{r.rank ?? '\u2014'}</span>
                  </td>
                  <td className="px-2 py-1 text-right tabular-nums">{fmt.idx(r.ihdi)}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{fmt.idx(r.gii)}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{fmt.usd(r.gni)}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{fmt.n1(r.life)}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{fmt.pct(r.poverty)}</td>
                  <td className="px-2 py-1 text-right tabular-nums">{fmt.pct(r.internet)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  );
}

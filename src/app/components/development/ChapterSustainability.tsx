'use client';

import { useMemo, useState } from 'react';
import { COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { HDR, SDG_TARGETS, sdgStatus, seriesFor, type SdgStatus } from '../../services/developmentCurated';
import { useDevSeries, type DevAlias, type DevData } from '../../development/useDevelopmentData';
import { RankedBars, ScatterPlot } from './charts';
import { hdrRows, latestRows, pairRows, type ChapterProps } from './data';
import { ChapterHeader, ChapterLoadingGuard, ChapterMeta, Panel, Segmented, countryName, theme } from './ui';

export const SDG_ALIASES = [...new Set(SDG_TARGETS.map((s) => s.series))] as DevAlias[];
const ALIASES: DevAlias[] = [...SDG_ALIASES, 'co2PerCapita', 'renewableEnergy', 'mobileSubs', 'broadband'];

export const STATUS_STYLE: Record<SdgStatus, { label: string; cls: string }> = {
  achieved: { label: 'Achieved', cls: 'bg-emerald-500 text-white' },
  'on-track': { label: 'On track for 2030', cls: 'bg-sky-500 text-white' },
  'off-track': { label: 'Off track', cls: 'bg-rose-500 text-white' },
  'no-data': { label: 'No data', cls: 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
};

export function SdgGrid({ isDarkMode, data, keys }: { isDarkMode: boolean; data: DevData; keys: readonly CountryKey[] }) {
  const t = theme(isDarkMode);
  const rows = useMemo(
    () =>
      keys.map((k) => ({
        key: k,
        cells: SDG_TARGETS.map((target) => ({ target, ...sdgStatus(seriesFor(data[target.series as DevAlias], k), target) })),
      })),
    [data, keys]
  );
  return (
    <div>
      <div className="overflow-auto max-h-[620px]">
        <table className="text-[11px] border-separate border-spacing-0.5">
          <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <tr>
              <th className={`text-left px-1 font-medium ${t.textSec}`}>Country</th>
              {SDG_TARGETS.map((s) => (
                <th key={s.id} className={`px-1 font-medium align-bottom ${t.textSec}`} title={s.label}>
                  <div className="w-14 leading-tight">
                    <div className={t.text}>{s.id}</div>
                    <div className="font-normal text-[10px]">{s.label.split(' ').slice(0, 2).join(' ')}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td className={`px-1 pr-3 whitespace-nowrap ${t.text}`}>{countryName(r.key)}</td>
                {r.cells.map((c) => (
                  <td
                    key={c.target.id}
                    className={`w-14 h-6 text-center rounded ${STATUS_STYLE[c.status].cls}`}
                    title={`${c.target.label}: ${STATUS_STYLE[c.status].label}${c.latest ? ` (latest ${c.latest.value.toFixed(1)} in ${c.latest.year}` : ''}${c.projected != null && c.status !== 'achieved' ? `, trend to 2030: ${c.projected.toFixed(1)})` : c.latest ? ')' : ''}`}
                  >
                    {c.latest ? c.latest.value.toFixed(0) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3 mt-3">
        {(Object.keys(STATUS_STYLE) as SdgStatus[]).map((s) => (
          <span key={s} className={`inline-flex items-center gap-1.5 text-[11px] ${t.textSec}`}>
            <span className={`w-3 h-3 rounded ${STATUS_STYLE[s].cls}`} />
            {STATUS_STYLE[s].label}
          </span>
        ))}
      </div>
    </div>
  );
}

type DigitalId = 'internetUsers' | 'mobileSubs' | 'broadband';

export default function ChapterSustainability({ isDarkMode, selected }: ChapterProps) {
  const { data, loading } = useDevSeries(ALIASES);
  const [scope, setScope] = useState<'selected' | 'all'>('all');
  const [digital, setDigital] = useState<DigitalId>('internetUsers');

  const co2VsRenew = useMemo(() => pairRows(data, 'renewableEnergy', 'co2PerCapita'), [data]);
  const phdi = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => (HDR[k]?.hdi != null && HDR[k]?.phdi != null ? { key: k, x: HDR[k]!.hdi!, y: HDR[k]!.phdi! } : null)).filter(
        (r): r is NonNullable<typeof r> => r !== null
      ),
    []
  );

  return (
    <section className="mb-14">
      <ChapterHeader
        isDarkMode={isDarkMode}
        number={11}
        title="Sustainability and the SDGs"
        subtitle="Development that exhausts the planet cannot last. UNDP's planetary-pressures-adjusted HDI discounts each country for its carbon and material footprint, and the Sustainable Development Goal grid shows, country by country, which 2030 targets are already met, on track, or slipping."
      />
      <ChapterMeta isDarkMode={isDarkMode} sourceIds={['undp-hdr', 'wb-development-suite', 'wb-digital-adoption']} flags={['curated']} />

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <Panel isDarkMode={isDarkMode} title="Carbon vs Clean Energy" subtitle="CO2 per person (tonnes, excluding land use) against the renewable share of final energy use.">
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <ScatterPlot isDarkMode={isDarkMode} rows={co2VsRenew} xLabel="Renewable share %" yLabel="CO2 t per person" xFormat={(v) => `${v.toFixed(0)}%`} yFormat={(v) => v.toFixed(0)} highlight={selected} />
          </ChapterLoadingGuard>
        </Panel>
        <Panel
          isDarkMode={isDarkMode}
          title="HDI vs Planetary-Pressures-Adjusted HDI"
          subtitle="The further below the dashed line, the more a country's development leans on emissions and material use."
        >
          <ScatterPlot isDarkMode={isDarkMode} rows={phdi} xLabel="HDI" yLabel="PHDI" xFormat={(v) => v.toFixed(2)} yFormat={(v) => v.toFixed(2)} highlight={[...selected, 'Qatar']} diagonal />
        </Panel>
      </div>

      <Panel
        isDarkMode={isDarkMode}
        title="SDG Progress by Country"
        subtitle="Each cell shows the latest value. Status is from a straight-line projection of the last ten years to 2030. Hover a cell for details."
        actions={
          <Segmented
            isDarkMode={isDarkMode}
            value={scope}
            onChange={setScope}
            options={[
              { id: 'all', label: 'All 47' },
              { id: 'selected', label: 'Selected' },
            ]}
          />
        }
        note="Targets are simplified thresholds for the official SDG indicators (for example, 1.1 uses the $3.00 line with a 3% target, the World Bank's working definition of ending extreme poverty). A linear trend is a rough guide, not a forecast."
        className="mb-6"
      >
        <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading} height={480}>
          <SdgGrid isDarkMode={isDarkMode} data={data} keys={scope === 'all' ? COUNTRY_KEYS : selected} />
        </ChapterLoadingGuard>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel isDarkMode={isDarkMode} title="Planetary Pressure Penalty" subtitle="Percentage difference between HDI and PHDI.">
          <RankedBars
            isDarkMode={isDarkMode}
            rows={hdrRows((r) => (r.hdi && r.phdi ? (1 - r.phdi / r.hdi) * 100 : null))}
            higherIsBetter={false}
            highlight={selected}
            format={(v) => `${v.toFixed(1)}%`}
            color={() => '#0d9488'}
          />
        </Panel>
        <Panel
          isDarkMode={isDarkMode}
          title="The Digital Divide"
          subtitle="Internet users (% of population), mobile subscriptions and fixed broadband (per 100 people)."
          actions={
            <Segmented
              isDarkMode={isDarkMode}
              value={digital}
              onChange={setDigital}
              options={[
                { id: 'internetUsers', label: 'Internet' },
                { id: 'mobileSubs', label: 'Mobile' },
                { id: 'broadband', label: 'Broadband' },
              ]}
            />
          }
        >
          <RankedBars isDarkMode={isDarkMode} rows={latestRows(data[digital])} highlight={selected} format={(v) => v.toFixed(0)} />
        </Panel>
      </div>
    </section>
  );
}

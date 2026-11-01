'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { COUNTRY_REGIONS, REGION_ORDER } from '../../utils/countryMappings';
import { latestOf, median } from '../../utils/inflation/stats';
import { ChartLoading, ChapterMeta, Lede, Panel, countryName, pct, theme, type InflationChapterProps } from './ui';

const GlobalEconomicMap = dynamic(() => import('../GlobalEconomicMap'), {
  ssr: false,
  loading: () => <ChartLoading isDarkMode={false} height={420} />,
});

export default function ChapterMap({ isDarkMode, data }: InflationChapterProps) {
  const t = theme(isDarkMode);
  const regions = useMemo(
    () =>
      REGION_ORDER.map((region) => {
        const vals = COUNTRY_REGIONS[region].flatMap((k) => {
          const obs = latestOf(data.inflationRates, k);
          return obs ? [{ key: k, obs }] : [];
        });
        const sorted = [...vals].sort((a, b) => b.obs.value - a.obs.value);
        return { region, median: median(vals.map((v) => v.obs.value)), high: sorted[0], low: sorted[sorted.length - 1], n: vals.length };
      }),
    [data.inflationRates],
  );
  const title = 'Inflation and cost of living on the map';
  return (
    <div className="space-y-6">
      <Lede isDarkMode={isDarkMode}>
        Countries coloured by their latest inflation rate, with city markers for the cost-of-living index. For animated timelines, other
        metrics and side-by-side comparisons, open inflation in the{' '}
        <Link href="/global-heatmap?metric=inflationRates&view=choropleth" className={`underline underline-offset-2 ${t.accent}`}>
          Global Heatmap
        </Link>
        .
      </Lede>
      <Panel
        isDarkMode={isDarkMode}
        title={title}
        subtitle="Switch between the inflation view, the cost-of-living view, or both. Green is low inflation, red is high."
        actions={
          <Link
            href="/global-heatmap?metric=inflationRates&view=choropleth"
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Open in Global Heatmap <span aria-hidden>&rarr;</span>
          </Link>
        }
      >
        <ChapterMeta isDarkMode={isDarkMode} sourceIds={['wb-inflation', 'numbeo-city-prices']} />
        <div data-chart-container data-chart-title={title}>
          <GlobalEconomicMap isDarkMode={isDarkMode} inflationData={data.inflationRates ?? []} />
        </div>
      </Panel>
      <Panel
        isDarkMode={isDarkMode}
        title="Inflation by region"
        subtitle="Median of each region's latest reading, with its highest and lowest country."
      >
        <ChapterMeta
          isDarkMode={isDarkMode}
          sourceIds={['wb-inflation']}
          download={{
            filename: 'inflation-by-region',
            title: 'Inflation by region',
            getData: () =>
              regions.map((r) => ({
                region: r.region,
                median: r.median,
                highest: r.high && countryName(r.high.key),
                highestValue: r.high?.obs.value,
                lowest: r.low && countryName(r.low.key),
                lowestValue: r.low?.obs.value,
              })),
          }}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {regions.map((r) => (
            <div key={r.region} className={`rounded-lg border p-3 ${t.inset}`}>
              <div className={`text-[11px] uppercase tracking-wider ${t.textMuted}`}>{r.region}</div>
              <div className={`text-xl font-semibold tabular-nums ${t.text}`}>{pct(r.median)}</div>
              <div className={`text-[11px] ${t.textSec}`}>
                {r.high && r.low ? (
                  <>
                    High: {countryName(r.high.key)} {pct(r.high.obs.value)}
                    <br />
                    Low: {countryName(r.low.key)} {pct(r.low.obs.value)}
                  </>
                ) : (
                  'No data'
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

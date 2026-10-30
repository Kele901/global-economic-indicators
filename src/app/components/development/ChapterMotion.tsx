'use client';

import { useMemo, useState } from 'react';
import { COUNTRY_KEYS } from '../../utils/countryMappings';
import { cagr, nearestObs, latestObs } from '../../services/developmentCurated';
import { useDevSeries } from '../../development/useDevelopmentData';
import GapminderBubble from './GapminderBubble';
import { RankedBars, ScatterPlot } from './charts';
import { hdiTrendDelta, type ChapterProps } from './data';
import { ChapterHeader, ChapterLoadingGuard, ChapterMeta, Panel, Segmented, fmt } from './ui';

export default function ChapterMotion({ isDarkMode, selected }: ChapterProps) {
  const { data, loading } = useDevSeries(['gdpPcConst', 'lifeExpectancy', 'population', 'gdpPcPppConst']);
  const [since, setSince] = useState<'1990' | '2000' | '2010'>('1990');

  const rises = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => {
        const d = hdiTrendDelta(k, Number(since));
        return d == null ? null : { key: k, value: d };
      }).filter((r): r is NonNullable<typeof r> => r !== null),
    [since]
  );

  // Beta convergence: do poorer countries in 2000 grow faster? Growth uses the
  // real span between the first and latest observation for each country.
  const convergence = useMemo(
    () =>
      COUNTRY_KEYS.map((k) => {
        const first = nearestObs(data.gdpPcPppConst, k, 2000, 3);
        const last = latestObs(data.gdpPcPppConst, k);
        const g = cagr(first, last);
        return first && g != null ? { key: k, x: first.value, y: g } : null;
      }).filter((r): r is NonNullable<typeof r> => r !== null),
    [data.gdpPcPppConst]
  );

  return (
    <section className="mb-14">
      <ChapterHeader
        isDarkMode={isDarkMode}
        number={2}
        title="Development in Motion"
        subtitle="Six decades of income and life expectancy for every roster economy, in the style of Hans Rosling's Gapminder. Press play: almost every bubble moves up and to the right, but at very different speeds."
      />
      <ChapterMeta
        isDarkMode={isDarkMode}
        sourceIds={['wb-development-suite', 'undp-hdr']}
        download={{
          filename: 'development-convergence',
          title: 'Convergence since 2000',
          getData: () => convergence.map((r) => ({ country: r.key, gdpPc2000: r.x, annualGrowth: r.y })),
        }}
      />
      <Panel
        isDarkMode={isDarkMode}
        title="Income and Health since 1960"
        subtitle="GDP per person (constant 2015 US$) against life expectancy. Bubble size is population; colour is region."
        note="Gaps of up to one year are filled from the nearest observation. Constant-dollar series start in 1960 for most countries but later for some (Russia, Ukraine and others from 1990)."
        className="mb-6"
      >
        <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading} height={460}>
          <GapminderBubble isDarkMode={isDarkMode} data={data} highlight={selected} />
        </ChapterLoadingGuard>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          isDarkMode={isDarkMode}
          title="Rises and Falls in HDI"
          subtitle="Change in the official HDI value. Red bars are countries that went backwards."
          actions={
            <Segmented
              isDarkMode={isDarkMode}
              value={since}
              onChange={setSince}
              options={[
                { id: '1990', label: 'Since 1990' },
                { id: '2000', label: 'Since 2000' },
                { id: '2010', label: 'Since 2010' },
              ]}
            />
          }
          note="UNDP back-calculates HDI trends with consistent methodology, so changes are comparable across years. Countries without a value in the start year are omitted."
        >
          <RankedBars
            isDarkMode={isDarkMode}
            rows={rises}
            highlight={selected}
            format={(v) => (v >= 0 ? `+${v.toFixed(3)}` : v.toFixed(3))}
            color={(r) => (r.value >= 0 ? '#10b981' : '#ef4444')}
          />
        </Panel>

        <Panel
          isDarkMode={isDarkMode}
          title="Are Poorer Countries Catching Up?"
          subtitle="GDP per person around 2000 (PPP, constant 2021 $) against average annual growth since then. A downward slope means convergence."
          note="Growth is compound annual growth over each country's actual span of years, not a fixed period."
        >
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <ScatterPlot
              isDarkMode={isDarkMode}
              rows={convergence}
              xLabel="GDP per person, 2000"
              yLabel="Annual growth %"
              xLog
              xFormat={fmt.usdK}
              yFormat={(v) => `${v.toFixed(1)}%`}
              highlight={selected}
              refY={0}
            />
          </ChapterLoadingGuard>
        </Panel>
      </div>
    </section>
  );
}

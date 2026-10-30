'use client';

import { COUNTRY_KEYS } from '../../utils/countryMappings';
import { HAPPINESS, HDR, SOCIAL_PROGRESS } from '../../services/developmentCurated';
import { useDevSeries } from '../../development/useDevelopmentData';
import DevelopmentIndexBuilder from './DevelopmentIndexBuilder';
import { ScatterPlot } from './charts';
import type { ChapterProps } from './data';
import { ChapterHeader, ChapterLoadingGuard, ChapterMeta, Panel, fmt } from './ui';

function vsIncome(src: Partial<Record<string, number>>) {
  return COUNTRY_KEYS.map((k) => {
    const g = HDR[k]?.gniPerCapita;
    const v = src[k];
    return g && v != null ? { key: k, x: g, y: v } : null;
  }).filter((r): r is NonNullable<typeof r> => r !== null);
}

const SPI_ROWS = vsIncome(SOCIAL_PROGRESS);
const HAPPY_ROWS = vsIncome(HAPPINESS);

export default function ChapterBeyondGdp({ isDarkMode, selected }: ChapterProps) {
  const { data, loading } = useDevSeries(['poverty300', 'internetUsers']);
  const spi = SPI_ROWS;
  const happy = HAPPY_ROWS;

  return (
    <section className="mb-14">
      <ChapterHeader
        isDarkMode={isDarkMode}
        number={12}
        title="Beyond GDP"
        subtitle="Every composite index is a weighted average somebody chose the weights for. Social progress and life satisfaction rise with income but flatten at the top, and the ranking you get depends on what you decide matters. Build your own below."
      />
      <ChapterMeta isDarkMode={isDarkMode} sourceIds={['development-curated', 'undp-hdr']} flags={['estimate']} />

      <div className="grid gap-6 xl:grid-cols-2 mb-6">
        <Panel isDarkMode={isDarkMode} title="Social Progress vs Income" subtitle="Social Progress Index 2025 (0-100) against GNI per person (PPP, log scale)." note="Approximate SPI values, rounded.">
          <ScatterPlot isDarkMode={isDarkMode} rows={spi} xLabel="GNI per person" yLabel="Social Progress Index" xLog xFormat={fmt.usdK} yFormat={(v) => v.toFixed(0)} highlight={selected} />
        </Panel>
        <Panel
          isDarkMode={isDarkMode}
          title="Happiness vs Income"
          subtitle="World Happiness Report 2025 life evaluation (0-10) against GNI per person (PPP, log scale). Mexico, Brazil and the Philippines report more satisfaction than their incomes predict."
          note="Approximate Cantril-ladder averages for 2022-24."
        >
          <ScatterPlot isDarkMode={isDarkMode} rows={happy} xLabel="GNI per person" yLabel="Life evaluation" xLog xFormat={fmt.usdK} yFormat={(v) => v.toFixed(1)} highlight={selected} />
        </Panel>
      </div>

      <Panel
        isDarkMode={isDarkMode}
        title="Build Your Own Development Index"
        subtitle="Weight ten dimensions from 0 to 5. Missing data is skipped rather than scored as zero, and arrows show how far each country moves relative to its HDI rank among these 47."
        note="Each dimension is rescaled to 0-100 first. The URL updates as you move the sliders, so you can share your index."
      >
        <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading} height={520}>
          <DevelopmentIndexBuilder isDarkMode={isDarkMode} data={data} highlight={selected} />
        </ChapterLoadingGuard>
      </Panel>
    </section>
  );
}

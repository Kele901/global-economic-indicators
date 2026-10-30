'use client';

import { useState } from 'react';
import { DEVELOPMENT_STORIES, type DevelopmentStory } from '../../services/developmentCurated';
import { useDevSeries, type DevAlias } from '../../development/useDevelopmentData';
import { TrendLines } from './charts';
import type { ChapterProps } from './data';
import { ChapterHeader, ChapterLoadingGuard, ChapterMeta, Panel, fmt, theme } from './ui';

export const STORY_METRICS: Record<DevelopmentStory['metric'], { alias: DevAlias; label: string; format: (v: number) => string; log?: boolean }> = {
  gdpPcConst: { alias: 'gdpPcConst', label: 'GDP per person (constant 2015 US$, log scale)', format: fmt.usdK, log: true },
  lifeExpectancy: { alias: 'lifeExpectancy', label: 'Life expectancy (years)', format: (v) => v.toFixed(0) },
  poverty300: { alias: 'poverty300', label: 'Share below $3.00 a day (%)', format: (v) => `${v.toFixed(0)}%` },
  under5Mortality: { alias: 'under5Mortality', label: 'Under-5 deaths per 1,000 births', format: (v) => v.toFixed(0) },
};

export function StoryCard({ isDarkMode, story }: { isDarkMode: boolean; story: DevelopmentStory }) {
  const t = theme(isDarkMode);
  const m = STORY_METRICS[story.metric];
  const { data, loading } = useDevSeries([m.alias]);
  return (
    <Panel isDarkMode={isDarkMode} title={story.title} subtitle={story.summary} note={`Chart: ${m.label}. Vertical lines mark turning points, not sole causes.`}>
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ChapterLoadingGuard isDarkMode={isDarkMode} loading={loading}>
            <TrendLines
              isDarkMode={isDarkMode}
              series={data[m.alias]}
              keys={story.countries}
              fromYear={story.from}
              format={m.format}
              events={story.events}
              logScale={m.log}
              markers={story.metric === 'poverty300'}
            />
          </ChapterLoadingGuard>
        </div>
        <div className={`lg:col-span-2 space-y-3 text-sm leading-relaxed ${t.textSec}`}>
          {story.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export default function ChapterStories({ isDarkMode }: ChapterProps) {
  const t = theme(isDarkMode);
  const [active, setActive] = useState(DEVELOPMENT_STORIES[0].id);
  const story = DEVELOPMENT_STORIES.find((s) => s.id === active) ?? DEVELOPMENT_STORIES[0];
  return (
    <section className="mb-14">
      <ChapterHeader
        isDarkMode={isDarkMode}
        number={3}
        title="Development Stories"
        subtitle="Eight paired histories that explain more than any league table: who started where, what changed, and what the data can and cannot tell you about why."
      />
      <ChapterMeta isDarkMode={isDarkMode} sourceIds={['wb-development-suite', 'wb-poverty']} flags={['curated']} />
      <div className="flex flex-wrap gap-1.5 mb-4" role="tablist" aria-label="Development stories">
        {DEVELOPMENT_STORIES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === active}
            onClick={() => setActive(s.id)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${s.id === active ? t.chipActive : t.chip}`}
          >
            {s.title.split(':')[0]}
          </button>
        ))}
      </div>
      <StoryCard isDarkMode={isDarkMode} story={story} />
    </section>
  );
}

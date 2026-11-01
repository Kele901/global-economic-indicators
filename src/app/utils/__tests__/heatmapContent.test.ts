import { describe, it, expect } from 'vitest';
import { COUNTRY_KEYS } from '../countryMappings';
import { ALL_METRICS } from '../metricCategories';
import { HEX_LAYOUT } from '../heatmap/hexLayout';
import { STORIES } from '../heatmap/stories';
import { getExplainer } from '../heatmap/explainers';
import { isHeatmapView } from '../heatmap/views';

describe('hex layout', () => {
  it('places every country on a unique cell', () => {
    const cells = COUNTRY_KEYS.map(k => HEX_LAYOUT[k].join(','));
    expect(new Set(cells).size).toBe(COUNTRY_KEYS.length);
  });
});

describe('stories', () => {
  const metrics = new Set(ALL_METRICS.map(m => m.key));
  const countries = new Set<string>(COUNTRY_KEYS);

  it('only reference known metrics, views and countries', () => {
    for (const story of STORIES) {
      expect(story.steps.length).toBeGreaterThan(2);
      for (const step of story.steps) {
        expect(metrics.has(step.metric)).toBe(true);
        if (step.compare) expect(metrics.has(step.compare)).toBe(true);
        expect(isHeatmapView(step.view)).toBe(true);
        if (step.mode && step.mode !== 'level') expect(step.baseYear).toBeLessThan(step.year);
        for (const c of step.highlight ?? []) expect(countries.has(c)).toBe(true);
      }
    }
  });

  it('have unique ids', () => {
    expect(new Set(STORIES.map(s => s.id)).size).toBe(STORIES.length);
  });
});

describe('explainers', () => {
  it('covers every metric with a link', () => {
    for (const m of ALL_METRICS) {
      const e = getExplainer(m.key);
      expect(e.what.length).toBeGreaterThan(10);
      expect(e.link.href.startsWith('/')).toBe(true);
    }
  });
});

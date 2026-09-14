import { describe, it, expect } from 'vitest';
import { detectTopAnomalies } from '../anomalyDetection';
import type { CountryData } from '../worldbank';

// A flat five-year baseline of 2 with a spike in the sixth year. The
// window std is 0, so these helpers add a little jitter where a real
// z-score is needed.
function series(values: Array<number | undefined>, country = 'USA', startYear = 2017): CountryData[] {
  return values.map((v, i) => {
    const row: CountryData = { year: startYear + i };
    if (v !== undefined) row[country] = v;
    return row;
  });
}

describe('detectTopAnomalies', () => {
  it('flags a reading that sits far above its five-year baseline', () => {
    const data = { inflation: series([2, 2.2, 1.9, 2.1, 2.0, 9.5]) };
    const [anomaly] = detectTopAnomalies({ data });

    expect(anomaly.country).toBe('USA');
    expect(anomaly.metric).toBe('inflation');
    expect(anomaly.latestYear).toBe(2022);
    expect(anomaly.latestValue).toBe(9.5);
    expect(anomaly.meanFiveYear).toBeCloseTo(2.04, 10);
    expect(anomaly.direction).toBe('above');
    expect(anomaly.zScore).toBeGreaterThan(2);
  });

  it('marks readings below the baseline as "below" with a negative score', () => {
    const data = { gdp: series([5, 5.2, 4.9, 5.1, 5.0, -4]) };
    const [anomaly] = detectTopAnomalies({ data });
    expect(anomaly.direction).toBe('below');
    expect(anomaly.zScore).toBeLessThan(-2);
  });

  it('excludes the latest year from its own baseline window', () => {
    const data = { inflation: series([2, 2.2, 1.9, 2.1, 2.0, 9.5]) };
    const [anomaly] = detectTopAnomalies({ data });
    // Mean of the first five points only; including 9.5 would give 3.28.
    expect(anomaly.meanFiveYear).toBeCloseTo(2.04, 10);
  });

  it('ignores series with fewer than five prior observations', () => {
    const data = { inflation: series([2, 2.2, 1.9, 50]) };
    expect(detectTopAnomalies({ data })).toEqual([]);
  });

  it('ignores a flat baseline instead of dividing by a zero standard deviation', () => {
    const data = { inflation: series([2, 2, 2, 2, 2, 50]) };
    expect(detectTopAnomalies({ data })).toEqual([]);
  });

  it('respects the minAbsZ floor', () => {
    // Baseline std is 0.707 and the latest reading is 0.6 above the mean,
    // so z is roughly 0.85: interesting at a loose floor, not at the default.
    const data = { inflation: series([2, 3, 1, 2.5, 1.5, 2.6]) };
    expect(detectTopAnomalies({ data })).toEqual([]);
    expect(detectTopAnomalies({ data, minAbsZ: 0.5 }).length).toBe(1);
  });

  it('sorts by absolute z-score and honours topN', () => {
    const data: Record<string, CountryData[]> = {
      mild: series([2, 2.2, 1.9, 2.1, 2.0, 4]),
      wild: series([2, 2.2, 1.9, 2.1, 2.0, 40]),
      middling: series([2, 2.2, 1.9, 2.1, 2.0, 8]),
    };
    const all = detectTopAnomalies({ data, topN: 10 });
    expect(all.map(a => a.metric)).toEqual(['wild', 'middling', 'mild']);

    const top = detectTopAnomalies({ data, topN: 2 });
    expect(top.map(a => a.metric)).toEqual(['wild', 'middling']);
  });

  it('scores every country in a wide table independently', () => {
    const data: Record<string, CountryData[]> = {
      inflation: [
        { year: 2017, USA: 2.0, Japan: 0.5 },
        { year: 2018, USA: 2.2, Japan: 0.6 },
        { year: 2019, USA: 1.9, Japan: 0.4 },
        { year: 2020, USA: 2.1, Japan: 0.5 },
        { year: 2021, USA: 2.0, Japan: 0.6 },
        { year: 2022, USA: 9.5, Japan: 0.55 },
      ],
    };
    const results = detectTopAnomalies({ data, topN: 10 });
    expect(results.map(r => r.country)).toEqual(['USA']);
  });

  it('honours the metric allowlist', () => {
    const data: Record<string, CountryData[]> = {
      inflation: series([2, 2.2, 1.9, 2.1, 2.0, 9.5]),
      unemployment: series([2, 2.2, 1.9, 2.1, 2.0, 12]),
    };
    const results = detectTopAnomalies({ data, metricAllowlist: ['inflation'], topN: 10 });
    expect(results.map(r => r.metric)).toEqual(['inflation']);
  });

  it('reads years in order regardless of how the rows arrive', () => {
    const shuffled: CountryData[] = [
      { year: 2020, USA: 2.1 },
      { year: 2022, USA: 9.5 },
      { year: 2017, USA: 2.0 },
      { year: 2021, USA: 2.0 },
      { year: 2018, USA: 2.2 },
      { year: 2019, USA: 1.9 },
    ];
    const [anomaly] = detectTopAnomalies({ data: { inflation: shuffled } });
    expect(anomaly.latestYear).toBe(2022);
    expect(anomaly.meanFiveYear).toBeCloseTo(2.04, 10);
  });

  it('skips gaps and non-numeric cells when building the window', () => {
    const withGaps: CountryData[] = [
      { year: 2015, USA: 2.0 },
      { year: 2016, USA: 2.2 },
      { year: 2017 },
      { year: 2018, USA: 1.9 },
      { year: 2019, USA: 2.1 },
      { year: 2020, USA: 2.0 },
      { year: 2021, USA: 9.5 },
    ];
    const [anomaly] = detectTopAnomalies({ data: { inflation: withGaps } });
    expect(anomaly.latestYear).toBe(2021);
    expect(anomaly.meanFiveYear).toBeCloseTo(2.04, 10);
  });

  it('returns an empty list for empty or missing series', () => {
    expect(detectTopAnomalies({ data: {} })).toEqual([]);
    expect(detectTopAnomalies({ data: { inflation: [] } })).toEqual([]);
  });
});

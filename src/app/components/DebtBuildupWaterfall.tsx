'use client';

// Year-by-year decomposition of how one country's debt ratio got from where
// it was to where it is.
//
// The trajectory chart above this shows the same numbers as a line, which
// makes a debt build-up look like a smooth slope. As a waterfall it becomes
// obvious that the ratio is not a trend at all: it is a handful of very
// large crisis-year jumps with long flat or slowly-improving stretches in
// between, which is the single most important fact about public debt
// dynamics and the hardest one to see in a line.

import { useMemo, useState } from 'react';
import type { CountryData } from '../services/worldbank';
import { DEBT_COUNTRY_META } from '../services/debtCurated';
import WaterfallChart, { type WaterfallStep } from './charts/WaterfallChart';
import ChartMeta from './ChartMeta';

interface Props {
  isDarkMode: boolean;
  governmentDebt: CountryData[];
}

// Years that explain most of the jumps, so the tooltip can say why rather
// than leaving the reader to guess.
const CONTEXT: Record<number, string> = {
  2008: 'Global financial crisis begins',
  2009: 'Recession: GDP falls, so the ratio rises even at flat debt',
  2010: 'Euro-area sovereign crisis',
  2012: 'Second euro-area crisis wave',
  2020: 'Covid: emergency spending plus a GDP collapse',
  2021: 'Recovery lifts GDP, flattering the ratio',
  2022: 'Inflation erodes the real value of existing debt',
};

export default function DebtBuildupWaterfall({ isDarkMode, governmentDebt }: Props) {
  const withData = useMemo(() => {
    return DEBT_COUNTRY_META.filter(m =>
      governmentDebt.some(row => Number.isFinite(Number(row[m.wbKey])) && Number(row[m.wbKey]) > 0),
    );
  }, [governmentDebt]);

  const [iso3, setIso3] = useState<string | null>(null);
  const meta = withData.find(m => m.iso3 === iso3) ?? withData[0];

  const [startYear, setStartYear] = useState(2007);

  const { steps, span } = useMemo(() => {
    if (!meta) return { steps: [] as WaterfallStep[], span: null as null | { from: number; to: number } };

    const series = governmentDebt
      .map(row => ({ year: Number(row.year), value: Number(row[meta.wbKey]) }))
      .filter(p => Number.isFinite(p.year) && Number.isFinite(p.value) && p.value > 0)
      .filter(p => p.year >= startYear)
      .sort((a, b) => a.year - b.year);

    if (series.length < 3) return { steps: [] as WaterfallStep[], span: null };

    const firstPt = series[0]!;
    const lastPt = series[series.length - 1]!;

    const built: WaterfallStep[] = [
      { label: `${firstPt.year} level`, value: firstPt.value, kind: 'total' },
    ];

    for (let i = 1; i < series.length; i++) {
      const prev = series[i - 1]!;
      const cur = series[i]!;
      built.push({
        label: String(cur.year),
        value: cur.value - prev.value,
        kind: 'delta',
        note: CONTEXT[cur.year],
      });
    }

    built.push({ label: `${lastPt.year} level`, value: lastPt.value, kind: 'total' });

    return { steps: built, span: { from: firstPt.year, to: lastPt.year } };
  }, [governmentDebt, meta, startYear]);

  const pill = (active: boolean) =>
    `text-[11px] px-2 py-1 rounded-md border transition-colors ${
      active
        ? 'bg-rose-500/15 border-rose-500 text-rose-400'
        : isDarkMode
          ? 'border-gray-600 text-gray-400 hover:text-gray-200'
          : 'border-gray-300 text-gray-500 hover:text-gray-800'
    }`;

  const biggestJump = useMemo(() => {
    const deltas = steps.filter(s => s.kind === 'delta');
    if (deltas.length === 0) return null;
    return deltas.reduce((best, s) => (s.value > best.value ? s : best), deltas[0]!);
  }, [steps]);

  return (
    <WaterfallChart
      isDarkMode={isDarkMode}
      steps={steps}
      title={`How ${meta?.name ?? 'This Country'} Built Its Debt Ratio`}
      subtitle={span
        ? `Annual change in central government debt as a share of GDP, ${span.from} to ${span.to}. Red bars added to the ratio, green bars reduced it.`
        : 'Annual change in central government debt as a share of GDP.'}
      provenance={<ChartMeta sourceId="wb-government-debt" isDarkMode={isDarkMode} />}
      valueFormat={v => `${v.toFixed(0)}%`}
      yLabel="Debt, % of GDP"
      risingIsGood={false}
      height="h-[460px]"
      actions={
        <div className="flex flex-col gap-1.5 items-end">
          <div className="flex flex-wrap gap-1.5 justify-end">
            {[1995, 2007, 2015].map(y => (
              <button key={y} onClick={() => setStartYear(y)} aria-pressed={startYear === y} className={pill(startYear === y)}>
                From {y}
              </button>
            ))}
          </div>
          <select
            value={meta?.iso3 ?? ''}
            onChange={e => setIso3(e.target.value)}
            aria-label="Country"
            className={`text-[11px] px-2 py-1 rounded-md border ${
              isDarkMode ? 'bg-gray-900 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800'
            }`}
          >
            {withData.map(m => (
              <option key={m.iso3} value={m.iso3}>{m.name}</option>
            ))}
          </select>
        </div>
      }
      footnote={
        <>
          Live World Bank GC.DOD.TOTL.GD.ZS.
          {biggestJump && ` The largest single-year increase in this window is ${biggestJump.label}, at ${biggestJump.value.toFixed(0)} percentage points.`}
          {' '}A ratio can fall three ways — pay debt down, grow the denominator, or inflate the
          real value of the numerator away — and this chart cannot tell them apart, which is exactly
          why post-2021 improvements in several countries should not be read as fiscal consolidation.
          Gaps in the World Bank series mean some countries jump several years between bars; the
          bar is still the change between consecutive available readings.
        </>
      }
    />
  );
}

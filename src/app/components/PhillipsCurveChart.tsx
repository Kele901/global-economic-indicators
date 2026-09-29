'use client';

// The Phillips curve, drawn honestly: unemployment on the x-axis, inflation
// on the y-axis, and the years joined in order.
//
// Drawn as a static scatter the relationship looks like noise. Drawn as a
// path it becomes legible as a sequence of regimes — a downward-sloping
// 1960s, the loops of the 1970s stagflation, a flat 2010s where
// unemployment fell for a decade with barely any inflation response, and
// the 2021-23 vertical spike where inflation moved without unemployment
// moving at all. That is why the curve is taught as unstable rather than
// as a policy dial.

import { useMemo, useState } from 'react';
import type { CountryData } from '../services/worldbank';
import ConnectedScatter, { type ScatterPath } from './charts/ConnectedScatter';
import ChartMeta from './ChartMeta';

interface Props {
  isDarkMode: boolean;
  unemploymentRates: CountryData[] | undefined;
  inflationRates: CountryData[] | undefined;
}

const CANDIDATES: { key: string; label: string; color: string }[] = [
  { key: 'USA',       label: 'United States', color: '#2563eb' },
  { key: 'UK',        label: 'United Kingdom', color: '#dc2626' },
  { key: 'Germany',   label: 'Germany',       color: '#f59e0b' },
  { key: 'France',    label: 'France',        color: '#7c3aed' },
  { key: 'Japan',     label: 'Japan',         color: '#0891b2' },
  { key: 'Italy',     label: 'Italy',         color: '#16a34a' },
  { key: 'Spain',     label: 'Spain',         color: '#db2777' },
  { key: 'Canada',    label: 'Canada',        color: '#ea580c' },
  { key: 'Australia', label: 'Australia',     color: '#65a30d' },
];

const ERAS = [
  { id: 'all',   label: 'Full record', from: 1980, to: 2100 },
  { id: 'great', label: '1991-2007',   from: 1991, to: 2007 },
  { id: 'post',  label: '2008-2019',   from: 2008, to: 2019 },
  { id: 'covid', label: '2019-today',  from: 2019, to: 2100 },
];

export default function PhillipsCurveChart({ isDarkMode, unemploymentRates, inflationRates }: Props) {
  const [selected, setSelected] = useState<string[]>(['USA', 'UK']);
  const [eraId, setEraId] = useState('all');

  const era = ERAS.find(e => e.id === eraId)!;

  const paths = useMemo<ScatterPath[]>(() => {
    if (!Array.isArray(unemploymentRates) || !Array.isArray(inflationRates)) return [];

    const inflationByYear = new Map<number, CountryData>();
    inflationRates.forEach(row => inflationByYear.set(Number(row.year), row));

    return CANDIDATES
      .filter(c => selected.includes(c.key))
      .map(c => {
        const points = unemploymentRates
          .map(row => {
            const year = Number(row.year);
            if (year < era.from || year > era.to) return null;
            const u = Number(row[c.key]);
            const infRow = inflationByYear.get(year);
            const pi = infRow ? Number(infRow[c.key]) : NaN;
            // Unemployment of exactly zero is a missing reading in this
            // shape; inflation of exactly zero is vanishingly rare but
            // legitimate, so only the former is screened.
            if (!Number.isFinite(u) || u === 0 || !Number.isFinite(pi)) return null;
            return { t: year, x: u, y: pi };
          })
          .filter((p): p is { t: number; x: number; y: number } => p !== null);

        return { key: c.key, label: c.label, color: c.color, points };
      })
      .filter(p => p.points.length >= 2);
  }, [unemploymentRates, inflationRates, selected, era]);

  const toggle = (key: string) => {
    setSelected(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key].slice(-4)));
  };

  const pill = (active: boolean) =>
    `text-[11px] px-2 py-1 rounded-md border transition-colors ${
      active
        ? 'bg-blue-500/15 border-blue-500 text-blue-500'
        : isDarkMode
          ? 'border-gray-600 text-gray-400 hover:text-gray-200'
          : 'border-gray-300 text-gray-500 hover:text-gray-800'
    }`;

  return (
    <ConnectedScatter
      isDarkMode={isDarkMode}
      paths={paths}
      xLabel="Unemployment rate (%)"
      yLabel="Inflation rate (%)"
      title="The Phillips Curve, Traced Year by Year"
      subtitle="Each dot is one year; the line joins them in order. If the trade-off between unemployment and inflation were stable, these paths would trace a single downward-sloping curve rather than wander."
      provenance={<ChartMeta sourceId="wb-inflation" isDarkMode={isDarkMode} />}
      xFormat={v => `${v.toFixed(1)}%`}
      yFormat={v => `${v.toFixed(1)}%`}
      yReference={0}
      labelEvery={4}
      actions={
        <div className="flex flex-col gap-1.5 items-end">
          <div className="flex flex-wrap gap-1.5 justify-start sm:justify-end">
            {ERAS.map(e => (
              <button key={e.id} onClick={() => setEraId(e.id)} aria-pressed={eraId === e.id} className={pill(eraId === e.id)}>
                {e.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 justify-start sm:justify-end max-w-xl">
            {CANDIDATES.map(c => (
              <button
                key={c.key}
                onClick={() => toggle(c.key)}
                aria-pressed={selected.includes(c.key)}
                className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                  selected.includes(c.key)
                    ? 'text-white border-transparent'
                    : isDarkMode
                      ? 'border-gray-600 text-gray-400 hover:text-gray-200'
                      : 'border-gray-300 text-gray-500 hover:text-gray-800'
                }`}
                style={selected.includes(c.key) ? { backgroundColor: c.color } : undefined}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      }
      footnote={
        <>
          Live World Bank consumer price inflation (FP.CPI.TOTL.ZG) against ILO-modelled unemployment
          (SL.UEM.TOTL.ZS), annual. Up to four economies at a time; the most recently clicked wins
          when you exceed four. Two honest limits: annual data smooths away the within-year dynamics
          central banks actually respond to, and the curve modern policy is built on relates
          <em> unexpected</em> inflation to unemployment, which requires an expectations series this
          chart does not have. Read it as evidence that the raw relationship is unstable, not as an
          estimate of the trade-off.
        </>
      }
    />
  );
}

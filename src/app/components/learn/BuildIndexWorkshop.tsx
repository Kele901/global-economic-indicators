'use client';

// Workshop: build your own development index.
//
// The point of this one is destructive rather than constructive. Every
// composite index you will ever read — HDI, competitiveness rankings,
// "best countries to live in" lists — is a weighted average that somebody
// chose the weights for. Move the sliders and the ranking rearranges
// completely, which is the fact those rankings are least keen to advertise.
//
// Numbers are a fixed illustrative snapshot so the workshop always works
// offline and the ranking is reproducible when a class does this together.

import { useMemo, useState } from 'react';

interface Props { isDarkMode: boolean; }

interface Indicator {
  id: string;
  label: string;
  short: string;
  unit: string;
  // Whether a higher raw value should score higher.
  higherIsBetter: boolean;
  note: string;
}

const INDICATORS: Indicator[] = [
  { id: 'income',    label: 'Income per person',   short: 'Income',    unit: '$',     higherIsBetter: true,  note: 'GDP per person, adjusted for local prices.' },
  { id: 'life',      label: 'Life expectancy',     short: 'Health',    unit: ' yrs',  higherIsBetter: true,  note: 'How long a newborn can expect to live.' },
  { id: 'school',    label: 'Years of schooling',  short: 'Education', unit: ' yrs',  higherIsBetter: true,  note: 'Average years of education for adults.' },
  { id: 'equality',  label: 'Income equality',     short: 'Equality',  unit: '',      higherIsBetter: true,  note: '100 minus the Gini index, so higher means more evenly shared.' },
  { id: 'emissions', label: 'Emissions per person',short: 'Emissions', unit: 't',     higherIsBetter: false, note: 'Tonnes of CO₂ per person. Lower scores better here.' },
];

interface Country {
  name: string;
  flag: string;
  values: Record<string, number>;
}

// Illustrative, rounded figures in the right ballpark for recent years.
const COUNTRIES: Country[] = [
  { name: 'Norway',        flag: '🇳🇴', values: { income: 79000, life: 83.2, school: 13.0, equality: 73, emissions: 7.5 } },
  { name: 'United States', flag: '🇺🇸', values: { income: 76000, life: 77.5, school: 13.7, equality: 60, emissions: 14.4 } },
  { name: 'Germany',       flag: '🇩🇪', values: { income: 63000, life: 80.7, school: 14.2, equality: 68, emissions: 7.7 } },
  { name: 'Japan',         flag: '🇯🇵', values: { income: 46000, life: 84.5, school: 13.4, equality: 67, emissions: 8.0 } },
  { name: 'Costa Rica',    flag: '🇨🇷', values: { income: 24000, life: 80.3, school:  9.0, equality: 53, emissions: 1.6 } },
  { name: 'China',         flag: '🇨🇳', values: { income: 21000, life: 78.2, school:  8.1, equality: 63, emissions: 8.0 } },
  { name: 'Brazil',        flag: '🇧🇷', values: { income: 17000, life: 75.9, school:  8.3, equality: 48, emissions: 2.3 } },
  { name: 'India',         flag: '🇮🇳', values: { income:  8300, life: 70.2, school:  6.6, equality: 65, emissions: 2.0 } },
  { name: 'Kenya',         flag: '🇰🇪', values: { income:  5800, life: 63.7, school:  7.0, equality: 60, emissions: 0.4 } },
  { name: 'Qatar',         flag: '🇶🇦', values: { income: 114000, life: 79.5, school: 10.2, equality: 59, emissions: 35.6 } },
];

// Three named weightings the reader can jump to, each of which is a real
// argument someone makes about what development means.
const PRESETS: { id: string; label: string; blurb: string; weights: Record<string, number> }[] = [
  {
    id: 'hdi',
    label: 'The UN way',
    blurb: 'Income, health and education in equal thirds. This is roughly the Human Development Index.',
    weights: { income: 33, life: 33, school: 34, equality: 0, emissions: 0 },
  },
  {
    id: 'money',
    label: 'Money only',
    blurb: 'Rank purely on income per person, the way GDP league tables do.',
    weights: { income: 100, life: 0, school: 0, equality: 0, emissions: 0 },
  },
  {
    id: 'green',
    label: 'Fair and green',
    blurb: 'Weight equality and low emissions heavily, income lightly.',
    weights: { income: 10, life: 20, school: 15, equality: 30, emissions: 25 },
  },
];

export default function BuildIndexWorkshop({ isDarkMode }: Props) {
  const [weights, setWeights] = useState<Record<string, number>>({ ...PRESETS[0]!.weights });
  const [activePreset, setActivePreset] = useState('hdi');

  const bg = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const rowBg = isDarkMode ? 'bg-gray-800' : 'bg-gray-50';

  const totalWeight = INDICATORS.reduce((s, ind) => s + (weights[ind.id] ?? 0), 0);

  const ranking = useMemo(() => {
    // Min-max normalisation per indicator, flipped for the ones where low
    // is good, so every indicator becomes a 0-100 score before weighting.
    const scored = COUNTRIES.map(c => {
      let weighted = 0;
      const parts: Record<string, number> = {};
      INDICATORS.forEach(ind => {
        const vals = COUNTRIES.map(x => x.values[ind.id]!);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const raw = c.values[ind.id]!;
        const unit = max === min ? 50 : ((raw - min) / (max - min)) * 100;
        const score = ind.higherIsBetter ? unit : 100 - unit;
        parts[ind.id] = score;
        weighted += score * (weights[ind.id] ?? 0);
      });
      return {
        ...c,
        parts,
        // Dividing by the total keeps the score on a 0-100 scale whatever
        // the sliders add up to, so the reader never has to make them sum
        // to 100 by hand.
        score: totalWeight > 0 ? weighted / totalWeight : 0,
      };
    });
    return scored.sort((a, b) => b.score - a.score);
  }, [weights, totalWeight]);

  // How far the ranking has moved from the UN-style baseline, which is the
  // single number that makes the lesson land.
  const baselineOrder = useMemo(() => {
    const base = COUNTRIES.map(c => {
      let weighted = 0;
      INDICATORS.forEach(ind => {
        const vals = COUNTRIES.map(x => x.values[ind.id]!);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const unit = max === min ? 50 : ((c.values[ind.id]! - min) / (max - min)) * 100;
        const score = ind.higherIsBetter ? unit : 100 - unit;
        weighted += score * (PRESETS[0]!.weights[ind.id] ?? 0);
      });
      return { name: c.name, score: weighted / 100 };
    }).sort((a, b) => b.score - a.score);
    return base.map(b => b.name);
  }, []);

  const biggestMove = useMemo(() => {
    let best: { name: string; delta: number } | null = null;
    ranking.forEach((c, i) => {
      const was = baselineOrder.indexOf(c.name);
      const delta = was - i;
      if (best === null || Math.abs(delta) > Math.abs(best.delta)) best = { name: c.name, delta };
    });
    return best as { name: string; delta: number } | null;
  }, [ranking, baselineOrder]);

  const setWeight = (id: string, value: number) => {
    setWeights(prev => ({ ...prev, [id]: value }));
    setActivePreset('custom');
  };

  const applyPreset = (id: string) => {
    const preset = PRESETS.find(p => p.id === id);
    if (!preset) return;
    setWeights({ ...preset.weights });
    setActivePreset(id);
  };

  const presetBlurb = PRESETS.find(p => p.id === activePreset)?.blurb
    ?? 'Your own weighting. There is no rule that makes one set of weights more correct than another.';

  return (
    <div className={`rounded-md border p-4 ${bg}`}>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {PRESETS.map(p => (
          <button
            key={p.id}
            onClick={() => applyPreset(p.id)}
            aria-pressed={activePreset === p.id}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
              activePreset === p.id
                ? 'bg-blue-500/15 border-blue-500 text-blue-500'
                : isDarkMode
                  ? 'border-gray-600 text-gray-400 hover:text-gray-200'
                  : 'border-gray-300 text-gray-500 hover:text-gray-800'
            }`}
          >
            {p.label}
          </button>
        ))}
        {activePreset === 'custom' && (
          <span className="text-[11px] px-2.5 py-1 rounded-full border border-purple-500 bg-purple-500/15 text-purple-400">
            Your weighting
          </span>
        )}
      </div>
      <p className={`text-xs mb-4 ${muted}`}>{presetBlurb}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sliders */}
        <div className="space-y-3">
          {INDICATORS.map(ind => (
            <label key={ind.id} className="block">
              <div className="flex justify-between items-baseline text-xs">
                <span className={text}>
                  {ind.label}
                  {!ind.higherIsBetter && <span className={`ml-1 ${muted}`}>(lower is better)</span>}
                </span>
                <span className={`tabular-nums font-semibold ${text}`}>
                  {totalWeight > 0 ? Math.round(((weights[ind.id] ?? 0) / totalWeight) * 100) : 0}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={weights[ind.id] ?? 0}
                onChange={e => setWeight(ind.id, Number(e.target.value))}
                aria-label={`Weight for ${ind.label}`}
                className="w-full"
              />
              <span className={`text-[10px] ${muted}`}>{ind.note}</span>
            </label>
          ))}
          {totalWeight === 0 && (
            <p className="text-xs text-amber-500">
              Every weight is zero, so there is nothing to rank. Raise at least one slider.
            </p>
          )}
        </div>

        {/* Ranking */}
        <div>
          <div className={`text-[11px] uppercase tracking-wider font-semibold mb-2 ${muted}`}>
            Your ranking
          </div>
          <ol className="space-y-1">
            {ranking.map((c, i) => {
              const was = baselineOrder.indexOf(c.name);
              const delta = was - i;
              return (
                <li key={c.name} className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${rowBg}`}>
                  <span className={`text-[11px] w-5 tabular-nums ${muted}`}>{i + 1}</span>
                  <span aria-hidden>{c.flag}</span>
                  <span className={`text-sm flex-1 truncate ${text}`}>{c.name}</span>
                  {delta !== 0 && (
                    <span className={`text-[10px] tabular-nums ${delta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {delta > 0 ? `▲${delta}` : `▼${Math.abs(delta)}`}
                    </span>
                  )}
                  <span className={`text-xs tabular-nums font-semibold ${text}`}>{c.score.toFixed(1)}</span>
                </li>
              );
            })}
          </ol>
          <p className={`text-[10px] mt-2 ${muted}`}>
            Arrows show movement against the UN-style weighting, not against last year.
          </p>
        </div>
      </div>

      <div className={`mt-4 rounded-md border p-3 text-xs ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-amber-50 border-amber-100 text-gray-700'}`}>
        {biggestMove && biggestMove.delta !== 0 ? (
          <>
            <span className="font-semibold">{biggestMove.name}</span> moves{' '}
            {Math.abs(biggestMove.delta)} place{Math.abs(biggestMove.delta) === 1 ? '' : 's'}{' '}
            {biggestMove.delta > 0 ? 'up' : 'down'} on your weighting compared with the UN&apos;s.
            Nothing about the country changed — only what you decided to count.
          </>
        ) : (
          <>Your weighting happens to produce the same order as the UN&apos;s. Try pushing emissions or equality up and watch it break.</>
        )}
      </div>

      <p className={`text-xs mt-3 ${muted}`}>
        This is why you should always ask what went into a ranking before believing it. The figures
        here are rounded illustrative values for ten countries; a real index covers nearly 200 and
        makes exactly the same kind of arbitrary choice about weights.
      </p>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { HAPPINESS, HDR, SOCIAL_PROGRESS, indexScore, latestObs, normalise } from '../../services/developmentCurated';
import type { DevData } from '../../development/useDevelopmentData';
import { countryName, theme } from './ui';

export const INDEX_DIMENSIONS = [
  { id: 'income', label: 'Income', note: 'GNI per person (PPP), log scale' },
  { id: 'health', label: 'Health', note: 'Life expectancy at birth' },
  { id: 'education', label: 'Education', note: 'Expected and mean years of schooling' },
  { id: 'equality', label: 'Equality', note: 'Low HDI loss to inequality' },
  { id: 'gender', label: 'Gender', note: '1 minus the Gender Inequality Index' },
  { id: 'planet', label: 'Planet', note: 'Low emissions and material-use penalty (PHDI / HDI)' },
  { id: 'poverty', label: 'No poverty', note: 'Share above $3.00 a day' },
  { id: 'digital', label: 'Digital', note: 'Internet users' },
  { id: 'wellbeing', label: 'Wellbeing', note: 'World Happiness Report life evaluation' },
  { id: 'social', label: 'Social progress', note: 'Social Progress Index' },
] as const;

export type DimensionId = (typeof INDEX_DIMENSIONS)[number]['id'];
export type Weights = Record<DimensionId, number>;

const zero = Object.fromEntries(INDEX_DIMENSIONS.map((d) => [d.id, 0])) as Weights;

export const INDEX_PRESETS: { id: string; label: string; blurb: string; weights: Weights }[] = [
  {
    id: 'composite',
    label: 'Ledger composite',
    blurb: 'A broad view: every dimension counts, with the three HDI dimensions weighted most.',
    weights: { income: 3, health: 3, education: 3, equality: 2, gender: 2, planet: 2, poverty: 2, digital: 1, wellbeing: 1, social: 1 },
  },
  { id: 'hdi', label: 'HDI-style', blurb: 'Income, health and education only, the UNDP recipe.', weights: { ...zero, income: 1, health: 1, education: 1 } },
  {
    id: 'equality',
    label: 'Equality first',
    blurb: 'How fairly gains are shared: inequality, gender gaps and extreme poverty dominate.',
    weights: { ...zero, income: 1, equality: 3, gender: 2, poverty: 2 },
  },
  { id: 'green', label: 'Green', blurb: 'Human development only counts if the planet can afford it.', weights: { ...zero, income: 1, health: 2, education: 2, planet: 4 } },
  { id: 'wellbeing', label: 'Wellbeing', blurb: 'What people report about their own lives, plus social outcomes.', weights: { ...zero, health: 1, wellbeing: 3, social: 2 } },
];

export function dimensionScores(key: CountryKey, data: DevData): Record<DimensionId, number | null> {
  const r = HDR[key];
  const edu =
    r?.expectedSchooling != null && r?.meanSchooling != null
      ? ((Math.min(r.expectedSchooling, 18) / 18 + Math.min(r.meanSchooling, 15) / 15) / 2) * 100
      : null;
  const pov = latestObs(data.poverty300, key, 2010)?.value;
  return {
    income: r?.gniPerCapita ? normalise(Math.log(r.gniPerCapita), Math.log(1000), Math.log(80000)) : null,
    health: normalise(r?.lifeExpectancy, 50, 85),
    education: edu,
    equality: normalise(r?.ihdiLoss, 3, 35, true),
    gender: r?.gii != null ? (1 - r.gii) * 100 : null,
    planet: r?.hdi && r?.phdi ? normalise(r.phdi / r.hdi, 0.6, 1) : null,
    poverty: pov != null ? 100 - pov : null,
    digital: latestObs(data.internetUsers, key)?.value ?? null,
    wellbeing: HAPPINESS[key] != null ? HAPPINESS[key]! * 10 : null,
    social: SOCIAL_PROGRESS[key] ?? null,
  };
}

export function encodeWeights(w: Weights): string {
  return INDEX_DIMENSIONS.map((d) => w[d.id]).join('');
}

export function decodeWeights(s: string | null): Weights | null {
  if (!s || !/^[0-5]{10}$/.test(s)) return null;
  return Object.fromEntries(INDEX_DIMENSIONS.map((d, i) => [d.id, Number(s[i])])) as Weights;
}

export default function DevelopmentIndexBuilder({ isDarkMode, data, highlight = [] }: { isDarkMode: boolean; data: DevData; highlight?: CountryKey[] }) {
  const t = theme(isDarkMode);
  const [weights, setWeights] = useState<Weights>(INDEX_PRESETS[0].weights);

  useEffect(() => {
    const fromUrl = decodeWeights(new URLSearchParams(window.location.search).get('w'));
    if (fromUrl) setWeights(fromUrl);
  }, []);

  const setAndShare = (w: Weights) => {
    setWeights(w);
    const url = new URL(window.location.href);
    url.searchParams.set('w', encodeWeights(w));
    window.history.replaceState(null, '', url.toString());
  };

  const hdiRank = useMemo(() => {
    const ranked = COUNTRY_KEYS.filter((k) => HDR[k]?.hdi != null).sort((a, b) => HDR[b]!.hdi! - HDR[a]!.hdi!);
    return new Map(ranked.map((k, i) => [k, i + 1]));
  }, []);

  const ranking = useMemo(() => {
    const rows = COUNTRY_KEYS.map((k) => ({ key: k, score: indexScore(dimensionScores(k, data), weights) }))
      .filter((r): r is { key: CountryKey; score: number } => r.score != null)
      .sort((a, b) => b.score - a.score);
    return rows.map((r, i) => ({ ...r, rank: i + 1, shift: (hdiRank.get(r.key) ?? i + 1) - (i + 1) }));
  }, [data, weights, hdiRank]);

  const active = INDEX_PRESETS.find((p) => encodeWeights(p.weights) === encodeWeights(weights));

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {INDEX_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setAndShare(p.weights)}
              className={`px-2.5 py-1 text-xs rounded-full border ${active?.id === p.id ? t.chipActive : t.chip}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className={`text-xs ${t.textSec}`}>{active ? active.blurb : 'Custom weights. The link in your address bar now reproduces this index.'}</p>
        <div className="space-y-2.5">
          {INDEX_DIMENSIONS.map((d) => (
            <label key={d.id} className="block">
              <div className="flex justify-between text-xs">
                <span className={t.text}>{d.label}</span>
                <span className={`tabular-nums ${t.textMuted}`}>{weights[d.id]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={weights[d.id]}
                onChange={(e) => setAndShare({ ...weights, [d.id]: Number(e.target.value) })}
                className="w-full accent-emerald-600"
                aria-label={`${d.label} weight`}
              />
              <div className={`text-[10px] ${t.textMuted}`}>{d.note}</div>
            </label>
          ))}
        </div>
      </div>
      <div className="lg:col-span-3">
        <div className={`flex justify-between text-[11px] mb-1 ${t.textMuted}`}>
          <span>Rank, score (0-100) and change vs HDI rank within the roster</span>
        </div>
        <ol className="overflow-y-auto max-h-[560px] space-y-1 pr-1">
          {ranking.map((r) => (
            <li key={r.key} className="grid grid-cols-[1.75rem_8.5rem_1fr_3rem_3rem] items-center gap-2 text-xs">
              <span className={`tabular-nums text-right ${t.textMuted}`}>{r.rank}</span>
              <span className={`truncate ${highlight.includes(r.key) ? 'font-semibold ' + t.accent : t.text}`}>{countryName(r.key)}</span>
              <span className={`h-3 rounded ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <span className="block h-3 rounded bg-emerald-500" style={{ width: `${r.score}%` }} />
              </span>
              <span className={`tabular-nums text-right ${t.text}`}>{r.score.toFixed(0)}</span>
              <span className={`tabular-nums text-right ${r.shift > 0 ? 'text-emerald-500' : r.shift < 0 ? 'text-rose-500' : t.textMuted}`}>
                {r.shift > 0 ? `\u25B2${r.shift}` : r.shift < 0 ? `\u25BC${-r.shift}` : '\u2013'}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

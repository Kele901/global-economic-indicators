'use client';

// PM2.5 exposure heatmap-style grid, coloured by distance from the WHO
// annual guideline (5 µg/m³) and the interim target 4 (10 µg/m³). Uses the
// World Bank EN.ATM.PM25.MC.M3 series for the tracked country roster.

import { useMemo } from 'react';
import type { CountryData } from '../services/worldbank';
import { CLIMATE_COUNTRY_META } from '../services/climateCurated';
import { latestEntry } from '../utils/countryData';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

interface Props {
  isDarkMode: boolean;
  pm25: CountryData[];
}

interface Cell {
  country: string;
  value: number;
  year: number;
  tier: 'below' | 'target' | 'moderate' | 'high' | 'severe';
}

const TITLE = 'Mean PM2.5 exposure · µg/m³';

const WHO_GUIDELINE = 5;
const WHO_IT4 = 10;
const WHO_IT3 = 15;
const WHO_IT2 = 25;

function classify(value: number): Cell['tier'] {
  if (value <= WHO_GUIDELINE) return 'below';
  if (value <= WHO_IT4) return 'target';
  if (value <= WHO_IT3) return 'moderate';
  if (value <= WHO_IT2) return 'high';
  return 'severe';
}

const TIER_STYLES = {
  below:    { dark: 'bg-emerald-500/30 text-emerald-100', light: 'bg-emerald-200 text-emerald-900', label: '≤5 (guideline)' },
  target:   { dark: 'bg-lime-500/30 text-lime-100',      light: 'bg-lime-200 text-lime-900',        label: '≤10 (IT-4)' },
  moderate: { dark: 'bg-amber-500/30 text-amber-100',    light: 'bg-amber-200 text-amber-900',      label: '≤15 (IT-3)' },
  high:     { dark: 'bg-orange-500/40 text-orange-100',  light: 'bg-orange-300 text-orange-900',    label: '≤25 (IT-2)' },
  severe:   { dark: 'bg-rose-500/50 text-rose-100',      light: 'bg-rose-400 text-rose-950',        label: '>25 µg/m³' },
};

export default function AirPollutionGrid({ isDarkMode, pm25 }: Props) {
  const cells: Cell[] = useMemo(() => {
    return CLIMATE_COUNTRY_META
      .map(meta => {
        const entry = latestEntry(pm25, meta.wbKey);
        if (!entry) return null;
        return {
          country: meta.name,
          value: entry.value,
          year: entry.year,
          tier: classify(entry.value),
        };
      })
      .filter((c): c is Cell => c !== null)
      .sort((a, b) => b.value - a.value);
  }, [pm25]);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';

  if (cells.length === 0) {
    return (
      <div className={`rounded-lg border p-6 text-sm ${cardBg} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        PM2.5 exposure data is temporarily unavailable.
      </div>
    );
  }

  return (
    <div id={slugify(TITLE)} className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="mb-4 flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>
            {TITLE}
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Latest annual mean by country. WHO annual guideline is 5 µg/m³ — interim targets step up in 5-15 µg/m³ bands.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <SocialShareMenu title={TITLE} isDarkMode={isDarkMode} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {cells.map(c => {
          const style = TIER_STYLES[c.tier];
          const cls = isDarkMode ? style.dark : style.light;
          return (
            <div key={c.country} className={`rounded-md p-3 flex flex-col justify-between ${cls}`}>
              <div className="text-[11px] uppercase tracking-wider opacity-80">{c.country}</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-bold tabular-nums">{c.value.toFixed(1)}</span>
                <span className="text-[10px] opacity-70">{c.year}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
        {(Object.keys(TIER_STYLES) as (keyof typeof TIER_STYLES)[]).map(t => {
          const style = TIER_STYLES[t];
          const cls = isDarkMode ? style.dark : style.light;
          return (
            <span key={t} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded ${cls}`}>
              <span className="w-2 h-2 rounded-full bg-current opacity-60" />
              {style.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

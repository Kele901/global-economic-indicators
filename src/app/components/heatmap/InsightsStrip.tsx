'use client';

import { COUNTRY_DISPLAY_NAMES, type CountryKey } from '../../utils/countryMappings';
import type { Insight } from '../../utils/heatmap/insights';
import { heatmapTheme } from './theme';

const ICON: Record<Insight['kind'], string> = {
  spread: '\u2195',
  mover: '\u21C5',
  outlier: '\u25C9',
  record: '\u2605',
  coverage: '\u24D8',
};

interface Props {
  insights: Insight[];
  year: number | null;
  isDarkMode: boolean;
  onSelectCountry: (country: CountryKey) => void;
}

export default function InsightsStrip({ insights, year, isDarkMode, onSelectCountry }: Props) {
  const tc = heatmapTheme(isDarkMode);
  if (insights.length === 0) return null;
  return (
    <section aria-label="What stands out" className={`rounded-xl border p-4 mb-4 ${tc.card}`}>
      <h2 className={`text-xs uppercase tracking-wider mb-3 ${tc.textSec}`}>What stands out in {year}</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {insights.map((insight, i) => (
          <li key={i} className={`flex gap-2.5 p-2.5 rounded-lg text-sm leading-relaxed ${tc.subtle}`}>
            <span aria-hidden className={`shrink-0 w-5 text-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{ICON[insight.kind]}</span>
            <span>
              {insight.parts.map((p, j) =>
                typeof p === 'string' ? (
                  <span key={j}>{p}</span>
                ) : (
                  <button key={j} onClick={() => onSelectCountry(p.country)}
                    className={`font-semibold underline decoration-dotted underline-offset-2 ${isDarkMode ? 'hover:text-blue-300' : 'hover:text-blue-700'}`}>
                    {COUNTRY_DISPLAY_NAMES[p.country]}
                  </button>
                ),
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

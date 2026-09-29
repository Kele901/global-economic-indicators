'use client';

// Hero ticker for /inequality: the most and least equal economies in the
// roster by live World Bank Gini, each stamped with its survey year so the
// reader can see how uneven the underlying survey coverage is.

import { useMemo } from 'react';
import type { CountryData } from '../services/worldbank';
import { latestEntry } from '../utils/countryData';
import { COUNTRY_KEYS, COUNTRY_DISPLAY_NAMES } from '../utils/countryMappings';
import ChartA11yCaption from './ChartA11yCaption';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

const SHARE_TITLE = 'Most and least equal economies by Gini index';

interface Props {
  isDarkMode: boolean;
  gini: CountryData[] | undefined;
}

export default function GiniTicker({ isDarkMode, gini }: Props) {
  const rows = useMemo(() => {
    const all = COUNTRY_KEYS
      .map(key => {
        const entry = latestEntry(gini, key);
        return entry
          ? { name: COUNTRY_DISPLAY_NAMES[key] ?? key, gini: entry.value, year: entry.year }
          : null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.gini - a.gini);
    // Most unequal eight, then the most equal eight, so the ticker reads as a
    // single sweep from one end of the distribution to the other.
    return [...all.slice(0, 8), ...all.slice(-8).reverse()];
  }, [gini]);

  const bg = isDarkMode
    ? 'from-gray-900 via-gray-800 to-gray-900 border-gray-700'
    : 'from-white via-rose-50 to-white border-rose-100';

  if (rows.length === 0) {
    return (
      <div className={`rounded-lg border bg-gradient-to-r px-4 py-3 text-sm ${bg} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Waiting on live World Bank Gini values…
      </div>
    );
  }

  return (
    <div id={slugify(SHARE_TITLE)} className="flex items-center gap-2">
      <div className={`flex-1 min-w-0 rounded-lg border bg-gradient-to-r overflow-hidden ${bg}`} aria-label="Gini index by country, most and least equal">
        <ChartA11yCaption
          title="Gini index, latest available survey"
          precision={1}
          rows={rows.map(r => ({ label: `${r.name} (${r.year})`, value: r.gini }))}
        />
        <div className="flex gap-6 py-3 px-4 overflow-x-auto whitespace-nowrap text-sm">
          {rows.concat(rows).map((r, i) => {
            const tone = r.gini >= 45 ? 'text-rose-500' : r.gini < 30 ? 'text-emerald-500' : 'text-amber-500';
            return (
              <span key={i} className="inline-flex items-center gap-2">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{r.name}</span>
                <span className={`tabular-nums font-semibold ${tone}`}>{r.gini.toFixed(1)}</span>
                <span className={`text-xs tabular-nums ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{r.year}</span>
              </span>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <SocialShareMenu title={SHARE_TITLE} isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

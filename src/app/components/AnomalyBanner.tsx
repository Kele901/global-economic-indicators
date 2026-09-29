'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchGlobalData } from '../services/worldbank';
import { detectTopAnomalies, type AnomalyReading } from '../services/anomalyDetection';
import { getMetricByKey } from '../utils/metricCategories';
import { COUNTRY_DISPLAY_NAMES, type CountryKey } from '../utils/countryMappings';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

interface Props { isDarkMode: boolean; }

const TITLE = 'Latest anomalies (|z| ≥ 2)';

// Dashboard banner surfacing the 3 most anomalous readings (|z| >= 2)
// vs each series' rolling 5-year mean. Silently degrades to null if
// data isn't loaded yet or nothing exceeds the threshold.
export default function AnomalyBanner({ isDarkMode }: Props) {
  const [anomalies, setAnomalies] = useState<AnomalyReading[] | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchGlobalData()
      .then(d => {
        if (cancelled) return;
        const top = detectTopAnomalies({
          data: d as unknown as Record<string, import('../services/worldbank').CountryData[]>,
          topN: 3,
          minAbsZ: 2,
          metricAllowlist: [
            'inflation', 'inflationRates', 'gdpGrowth', 'unemployment',
            'unemploymentRates', 'interestRates', 'governmentDebt',
          ],
        });
        setAnomalies(top);
      })
      .catch(() => setAnomalies([]));
    return () => { cancelled = true; };
  }, []);

  const formatted = useMemo(() => {
    if (!anomalies) return [];
    return anomalies.map(a => {
      const label = getMetricByKey(a.metric)?.label ?? a.metric;
      const displayCountry = COUNTRY_DISPLAY_NAMES[a.country as CountryKey] ?? a.country;
      const arrow = a.direction === 'above' ? '↑' : '↓';
      const sigma = Math.abs(a.zScore).toFixed(1);
      return {
        key: `${a.country}-${a.metric}`,
        text: `${displayCountry} ${label} ${arrow} ${sigma}σ vs 5-yr mean`,
      };
    });
  }, [anomalies]);

  if (dismissed || !anomalies || anomalies.length === 0) return null;

  return (
    <div
      id={slugify(TITLE)}
      className={`rounded-lg border px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 ${
        isDarkMode
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-100'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="min-w-0 sm:flex-1">
        <div className={`text-[11px] uppercase tracking-widest font-medium mb-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
          {TITLE}
        </div>
        <ul className="text-sm space-y-0.5">
          {formatted.map(f => (<li key={f.key}>• {f.text}</li>))}
        </ul>
      </div>
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        <SocialShareMenu title={TITLE} isDarkMode={isDarkMode} />
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss anomaly banner"
          className={`text-xs px-2 py-1 rounded border shrink-0 ${
            isDarkMode ? 'border-amber-500/40 hover:bg-amber-500/10' : 'border-amber-300 hover:bg-amber-100/60'
          }`}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

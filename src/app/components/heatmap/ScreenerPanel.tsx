'use client';

import { useState } from 'react';
import { METRIC_CATEGORIES, getMetricByKey } from '../../utils/metricCategories';
import { COUNTRY_DISPLAY_NAMES, type CountryKey } from '../../utils/countryMappings';
import type { ScreenerCondition } from '../../utils/heatmap/screener';
import { extent, valuesForYear, type HeatmapData } from '../../utils/heatmap/values';
import { heatmapTheme } from './theme';

const MAX_CONDITIONS = 3;
const SPARSE_BELOW = 10;

const PRESETS: { label: string; conditions: ScreenerCondition[] }[] = [
  { label: 'Debt strain', conditions: [{ metric: 'governmentDebt', op: '>', value: 90 }, { metric: 'gdpGrowth', op: '<', value: 1.5 }] },
  { label: 'Stagflation risk', conditions: [{ metric: 'inflationRates', op: '>', value: 5 }, { metric: 'gdpGrowth', op: '<', value: 1 }] },
  { label: 'Tight labour market', conditions: [{ metric: 'unemploymentRates', op: '<', value: 4 }] },
  { label: 'Fast and stable', conditions: [{ metric: 'gdpGrowth', op: '>', value: 3 }, { metric: 'inflationRates', op: '<', value: 4 }] },
];

interface Props {
  data: HeatmapData;
  year: number | null;
  conditions: ScreenerCondition[];
  matches: CountryKey[];
  isDarkMode: boolean;
  onChange: (conditions: ScreenerCondition[]) => void;
  onSelectCountry: (country: CountryKey) => void;
}

export default function ScreenerPanel({ data, year, conditions, matches, isDarkMode, onChange, onSelectCountry }: Props) {
  const tc = heatmapTheme(isDarkMode);
  const [open, setOpen] = useState(conditions.length > 0);
  const update = (i: number, patch: Partial<ScreenerCondition>) => onChange(conditions.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const reporting = (metric: string) => (year === null ? 0 : Object.keys(valuesForYear(data, metric, year)).length);
  const sparse = year === null ? [] : conditions
    .filter(c => reporting(c.metric) < SPARSE_BELOW)
    .map(c => getMetricByKey(c.metric)?.label ?? c.metric);

  return (
    <section aria-label="Country screener" className={`rounded-xl border mb-4 ${tc.card}`}>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left">
        <span>
          <span className="font-semibold">Country screener</span>
          <span className={`ml-2 text-xs ${tc.textSec}`}>
            {conditions.length ? `${matches.length} ${matches.length === 1 ? 'country matches' : 'countries match'} ${conditions.length} ${conditions.length === 1 ? 'condition' : 'conditions'}` : 'Filter countries by up to three conditions'}
          </span>
        </span>
        <svg className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`text-xs self-center ${tc.textSec}`}>Presets:</span>
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => onChange(p.conditions)} className={`px-2.5 py-1 rounded-md border text-xs ${tc.chip}`}>{p.label}</button>
            ))}
          </div>
          <div className="space-y-2">
            {conditions.map((c, i) => {
              const def = getMetricByKey(c.metric);
              const range = year !== null ? extent(valuesForYear(data, c.metric, year)) : null;
              const count = reporting(c.metric);
              return (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  {i > 0 && <span className={`text-xs font-semibold ${tc.textSec}`}>AND</span>}
                  <select value={c.metric} onChange={e => update(i, { metric: e.target.value })}
                    className={`flex-1 min-w-[180px] px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`} aria-label="Screener metric">
                    {METRIC_CATEGORIES.map(cat => (
                      <optgroup key={cat.id} label={cat.label}>
                        {cat.metrics.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <select value={c.op} onChange={e => update(i, { op: e.target.value as ScreenerCondition['op'] })}
                    className={`px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`} aria-label="Comparison">
                    <option value=">">above</option>
                    <option value="<">below</option>
                  </select>
                  <input type="number" value={Number.isFinite(c.value) ? c.value : ''} step="any"
                    onChange={e => update(i, { value: e.target.value === '' ? Number.NaN : Number(e.target.value) })}
                    className={`w-28 px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`} aria-label="Threshold" />
                  {range && range.max !== range.min && def && (
                    <span className={`text-xs ${tc.textSec}`}>range {def.format(range.min)} to {def.format(range.max)}</span>
                  )}
                  {year !== null && count < SPARSE_BELOW && (
                    <span className={`text-xs ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                      {count === 0 ? `no data for ${year}` : `only ${count} reporting for ${year}`}
                    </span>
                  )}
                  <button onClick={() => onChange(conditions.filter((_, j) => j !== i))} aria-label="Remove condition"
                    className={`ml-auto px-2 py-1 rounded-md text-xs ${tc.chip} border`}>Remove</button>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {conditions.length < MAX_CONDITIONS && (
              <button onClick={() => onChange([...conditions, { metric: 'gdpGrowth', op: '>', value: 0 }])}
                className={`px-3 py-1.5 rounded-lg border text-sm ${tc.selectBg}`}>+ Add condition</button>
            )}
            {conditions.length > 0 && (
              <button onClick={() => onChange([])} className={`px-3 py-1.5 rounded-lg border text-sm ${tc.chip}`}>Clear</button>
            )}
          </div>
          {conditions.length > 0 && (
            <div className="mt-3">
              <p className={`text-xs uppercase tracking-wider mb-2 ${tc.textSec}`}>Matches in {year}</p>
              {matches.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {matches.map(ck => (
                    <button key={ck} onClick={() => onSelectCountry(ck)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}`}>
                      {COUNTRY_DISPLAY_NAMES[ck]}
                    </button>
                  ))}
                </div>
              ) : (
                <p className={`text-sm ${tc.textSec}`}>
                  {sparse.length
                    ? `${sparse.join(' and ')} ${sparse.length === 1 ? 'has' : 'have'} little or no data for ${year} yet. Try an earlier year.`
                    : 'No country meets every condition for this year.'}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

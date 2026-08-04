'use client';

// Table of the top 20 emitters' Nationally Determined Contributions under
// the Paris Agreement, cross-referenced with their latest emissions
// trajectory. When live per-capita or absolute emissions are available for
// a country we compute the % change from the baseline year and show it
// alongside the pledge so users can eyeball who is on track.

import { useMemo } from 'react';
import type { CountryData } from '../services/worldbank';
import { NDC_2035_TARGETS } from '../services/climateCurated';
import { latestEntry } from '../utils/countryData';

interface Props {
  isDarkMode: boolean;
  co2EmissionsKt: CountryData[];
}

function valueAtYear(series: CountryData[] | undefined, key: string, year: number): number | null {
  if (!Array.isArray(series)) return null;
  const row = series.find(r => Number(r.year) === year);
  if (!row) return null;
  const v = Number(row[key]);
  return !Number.isNaN(v) && v > 0 ? v : null;
}

export default function NdcTargetTable({ isDarkMode, co2EmissionsKt }: Props) {
  const rows = useMemo(() => {
    return NDC_2035_TARGETS.map(t => {
      const baseline = valueAtYear(co2EmissionsKt, t.country, t.baselineYear);
      const latest = latestEntry(co2EmissionsKt, t.country);
      const actualChangePct = baseline && latest && baseline > 0
        ? ((latest.value - baseline) / baseline) * 100
        : null;
      const gapVsTarget = actualChangePct != null ? actualChangePct + t.reductionPct : null;
      const onTrack = gapVsTarget != null ? gapVsTarget < 0 : null;
      return {
        ...t,
        baseline,
        latest,
        actualChangePct,
        gapVsTarget,
        onTrack,
      };
    });
  }, [co2EmissionsKt]);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const border = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const rowHover = isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>
          Nationally Determined Contributions · top-20 emitters
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Pledged reduction from each baseline year, alongside the actual change in absolute CO₂ so far
          (World Bank EN.ATM.CO2E.KT). Green means the country is currently ahead of pledge; red means it&apos;s trending in the wrong direction.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <thead>
            <tr className={`text-[11px] uppercase tracking-wider ${textMuted} border-b ${border}`}>
              <th className="text-left py-2 pr-4">Country</th>
              <th className="text-right py-2 pr-4">Baseline</th>
              <th className="text-right py-2 pr-4">Target</th>
              <th className="text-right py-2 pr-4">Actual change</th>
              <th className="text-right py-2 pr-4">Status</th>
              <th className="text-left py-2 pr-0">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const statusChip = r.onTrack === null
                ? isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                : r.onTrack
                  ? isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                  : isDarkMode ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-800';
              const statusText = r.onTrack === null
                ? '—'
                : r.onTrack ? 'On track' : 'Off track';
              return (
                <tr key={r.country} className={`border-b ${border} ${rowHover}`}>
                  <td className="py-2 pr-4">
                    <div className="font-medium">{r.countryLabel}</div>
                    <div className={`text-[11px] ${textMuted}`}>
                      base {r.baselineYear} → target {r.targetYear} · {r.scope}
                    </div>
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.baselineYear}</td>
                  <td className="py-2 pr-4 text-right tabular-nums text-emerald-500">
                    −{r.reductionPct}%
                  </td>
                  <td className={`py-2 pr-4 text-right tabular-nums ${
                    r.actualChangePct == null
                      ? textMuted
                      : r.actualChangePct < 0
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                  }`}>
                    {r.actualChangePct == null
                      ? '—'
                      : `${r.actualChangePct > 0 ? '+' : ''}${r.actualChangePct.toFixed(1)}%`}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    <span className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${statusChip}`}>
                      {statusText}
                    </span>
                  </td>
                  <td className={`py-2 pr-0 text-[11px] ${textMuted}`}>{r.notes ?? ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

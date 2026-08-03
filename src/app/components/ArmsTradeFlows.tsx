'use client';

import { useMemo } from 'react';
import type { CountryData } from '../services/worldbank';
import { DEFENSE_COUNTRY_BY_WBKEY } from '../services/defenseCurated';

interface Props {
  isDarkMode: boolean;
  armsExports: CountryData[]; // MS.MIL.XPRT.KD — SIPRI TIV in constant 1990 US$
  armsImports: CountryData[]; // MS.MIL.MPRT.KD
}

interface RankedRow {
  wbKey: string;
  label: string;
  color: string;
  value: number; // most-recent 5-year sum, in millions of TIV (data is already stated in that unit range)
  year: number; // most recent year included
}

// Sum the last 5 years of non-zero values for each country, mimicking the
// SIPRI convention of reporting arms transfers on a rolling 5-year window.
function last5YearSum(series: CountryData[], key: string): { sum: number; latestYear: number } {
  const values: { year: number; value: number }[] = [];
  for (let i = series.length - 1; i >= 0 && values.length < 5; i--) {
    const v = Number(series[i][key]);
    if (!isNaN(v) && v > 0) values.push({ year: Number(series[i].year), value: v });
  }
  const sum = values.reduce((s, v) => s + v.value, 0);
  const latestYear = values.length ? values[0].year : 0;
  return { sum, latestYear };
}

function collectRanked(series: CountryData[]): RankedRow[] {
  if (!series || series.length === 0) return [];
  const seenKeys = new Set<string>();
  series.forEach(row => Object.keys(row).forEach(k => { if (k !== 'year') seenKeys.add(k); }));

  const rows: RankedRow[] = [];
  seenKeys.forEach(key => {
    const { sum, latestYear } = last5YearSum(series, key);
    if (sum <= 0) return;
    const meta = DEFENSE_COUNTRY_BY_WBKEY[key];
    rows.push({
      wbKey: key,
      label: meta?.name ?? key,
      color: meta?.color ?? '#94a3b8',
      value: sum,
      year: latestYear,
    });
  });

  return rows.sort((a, b) => b.value - a.value).slice(0, 10);
}

function formatTiv(v: number): string {
  // SIPRI TIV values are in millions of constant 1990 US$. World Bank publishes
  // them in absolute units, so we display as "$X.YB TIV" for readability.
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B TIV`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M TIV`;
  return `$${v.toLocaleString()} TIV`;
}

function ColumnList({
  title,
  subtitle,
  rows,
  isDarkMode,
  colorAccent,
  align = 'right',
}: {
  title: string;
  subtitle: string;
  rows: RankedRow[];
  isDarkMode: boolean;
  colorAccent: string;
  align?: 'left' | 'right';
}) {
  const max = rows[0]?.value ?? 1;
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';

  return (
    <div className="flex-1 min-w-0">
      <div className={`text-[11px] uppercase tracking-wider ${textMuted}`} style={{ color: colorAccent }}>
        {title}
      </div>
      <p className={`text-xs mb-3 ${textSec}`}>{subtitle}</p>
      <div className="space-y-2">
        {rows.map((r, i) => {
          const barWidth = (r.value / max) * 100;
          return (
            <div key={r.wbKey} className="flex items-center gap-2">
              <div className={`text-[10px] font-bold w-4 ${textMuted} ${align === 'right' ? 'text-right' : 'text-left'}`}>
                {i + 1}
              </div>
              <div className={`flex-1 min-w-0 flex ${align === 'right' ? 'flex-row-reverse' : ''} items-center gap-2`}>
                <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} flex-1`}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: r.color,
                      marginLeft: align === 'right' ? 'auto' : 0,
                    }}
                  />
                </div>
                <div className={`text-xs font-medium truncate w-24 ${textPrimary} ${align === 'right' ? 'text-right' : 'text-left'}`}>
                  {r.label}
                </div>
              </div>
              <div className={`text-[11px] tabular-nums w-24 ${textMuted} ${align === 'right' ? 'text-left' : 'text-right'}`}>
                {formatTiv(r.value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ArmsTradeFlows({ isDarkMode, armsExports, armsImports }: Props) {
  const exportsTop = useMemo(() => collectRanked(armsExports), [armsExports]);
  const importsTop = useMemo(() => collectRanked(armsImports), [armsImports]);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';

  if (!exportsTop.length && !importsTop.length) {
    return (
      <div className={`h-72 rounded-lg border flex items-center justify-center text-sm ${cardBg} ${textMuted}`}>
        Arms trade data (SIPRI TIV via World Bank) is unavailable.
      </div>
    );
  }

  const latestYear = Math.max(
    exportsTop[0]?.year ?? 0,
    importsTop[0]?.year ?? 0,
  );

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>
          The Arms Trade
        </div>
        <p className={`text-sm ${textSec}`}>
          Top 10 exporters vs top 10 importers of major conventional weapons — SIPRI trend indicator values (constant 1990 US$),
          rolling 5-year sum ending {latestYear || 'latest available year'}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColumnList
          title="Top Exporters"
          subtitle="Whose weapons armed the world."
          rows={exportsTop}
          isDarkMode={isDarkMode}
          colorAccent={isDarkMode ? '#60a5fa' : '#2563eb'}
        />
        <ColumnList
          title="Top Importers"
          subtitle="Who bought the most."
          rows={importsTop}
          isDarkMode={isDarkMode}
          colorAccent={isDarkMode ? '#f87171' : '#dc2626'}
          align="left"
        />
      </div>

      <p className={`text-xs mt-4 ${textMuted}`}>
        TIV (Trend Indicator Value) is SIPRI&apos;s comparable measure of arms transfers based on production cost of the underlying military capability, not market price.
      </p>
    </div>
  );
}

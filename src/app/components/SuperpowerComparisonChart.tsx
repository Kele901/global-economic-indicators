'use client';

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { CountryData } from '../services/worldbank';
import { DEFENSE_COUNTRY_META, DEFENSE_COUNTRY_LOOKUP, SUPERPOWER_ISO3 } from '../services/defenseCurated';

interface Props {
  isDarkMode: boolean;
  militaryExpenditureUsd: CountryData[];
  militaryExpenditurePctGdp: CountryData[];
}

type Mode = 'usd' | 'pct_gdp';

// Slice a CountryData series to a set of wbKeys and years >= yearFrom.
// Values <= 0 are treated as missing to keep lines from touching the axis.
function shapeForChart(series: CountryData[], wbKeys: string[], yearFrom: number) {
  return series
    .filter(row => Number(row.year) >= yearFrom)
    .map(row => {
      const out: Record<string, number | undefined> = { year: Number(row.year) };
      wbKeys.forEach(k => {
        const v = Number(row[k]);
        out[k] = !isNaN(v) && v > 0 ? v : undefined;
      });
      return out;
    });
}

function formatUsdShort(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9)  return `$${Math.round(value / 1e9)}B`;
  if (value >= 1e6)  return `$${Math.round(value / 1e6)}M`;
  return `$${value.toLocaleString()}`;
}

export default function SuperpowerComparisonChart({
  isDarkMode,
  militaryExpenditureUsd,
  militaryExpenditurePctGdp,
}: Props) {
  const superpowers = useMemo(
    () => SUPERPOWER_ISO3.map(iso => DEFENSE_COUNTRY_LOOKUP[iso]).filter(Boolean),
    [],
  );
  const wbKeys = superpowers.map(c => c.wbKey);

  // The USD indicator (MS.MIL.XPND.CD) is intermittently WAF-blocked by the
  // World Bank API. When most superpowers are missing we'd render a chart
  // with a single lonely line (USA-only, filled by the FRED FDEFX fallback),
  // which is worse than the % GDP view. Require at least 3 of the 10
  // superpowers to have USD data before offering the Nominal $ mode.
  const MIN_USD_COVERAGE = 3;
  const usdCoverageCount = useMemo(() => {
    if (!militaryExpenditureUsd || militaryExpenditureUsd.length === 0) return 0;
    const covered = new Set<string>();
    for (const row of militaryExpenditureUsd) {
      for (const key of wbKeys) {
        const v = Number(row[key]);
        if (!isNaN(v) && v > 0) covered.add(key);
      }
    }
    return covered.size;
  }, [militaryExpenditureUsd, wbKeys]);
  const usdHasData = usdCoverageCount >= MIN_USD_COVERAGE;

  const [mode, setMode] = useState<Mode>(usdHasData ? 'usd' : 'pct_gdp');

  const data = useMemo(() => {
    const source = mode === 'usd' ? militaryExpenditureUsd : militaryExpenditurePctGdp;
    // Show the full World Bank window (1960+). Recharts connectNulls will
    // bridge gaps where individual countries have shorter histories
    // (e.g. China's MS.MIL.XPND.CD only starts at 1989, Russia at 1988).
    return shapeForChart(source, wbKeys, 1960);
  }, [mode, militaryExpenditureUsd, militaryExpenditurePctGdp, wbKeys]);

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: 8 }
    : { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: 8 };

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const yAxisFormatter = mode === 'usd' ? formatUsdShort : (v: number) => `${v.toFixed(1)}%`;
  const tooltipValueFormatter = mode === 'usd'
    ? (v: number) => formatUsdShort(v)
    : (v: number) => `${v.toFixed(2)}%`;

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className={`text-xs uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Superpowers · Military Spending
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Top-10 spenders since 1960. Toggle between absolute dollars and share of GDP.
          </p>
        </div>
        <div
          role="group"
          aria-label="Display unit for military spending"
          className={`inline-flex rounded-md border text-xs overflow-hidden ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <button
            type="button"
            onClick={() => usdHasData && setMode('usd')}
            disabled={!usdHasData}
            aria-pressed={mode === 'usd'}
            aria-label={usdHasData ? 'Show military spending in nominal US dollars' : 'Nominal dollar view unavailable — falling back to % of GDP'}
            title={usdHasData
              ? undefined
              : `USD series unavailable — only ${usdCoverageCount}/${wbKeys.length} superpowers returned data (World Bank blocked MS.MIL.XPND.CD)`}
            className={`px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${!usdHasData
              ? (isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed')
              : mode === 'usd'
                ? (isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-700')
                : (isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50')}`}
          >
            Nominal $
          </button>
          <button
            type="button"
            onClick={() => setMode('pct_gdp')}
            aria-pressed={mode === 'pct_gdp'}
            aria-label="Show military spending as a share of GDP"
            className={`px-3 py-1.5 border-l focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${mode === 'pct_gdp'
              ? (isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-700')
              : (isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50')}`}
          >
            % of GDP
          </button>
        </div>
      </div>

      {!usdHasData && (
        <div className={`mb-3 text-xs rounded-md px-3 py-2 border ${
          isDarkMode
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          Showing % of GDP: World Bank blocked the absolute-dollar series (MS.MIL.XPND.CD),
          so only {usdCoverageCount} of {wbKeys.length} superpowers came back with USD data.
        </div>
      )}

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="year" stroke={axis} />
            <YAxis stroke={axis} tickFormatter={yAxisFormatter} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: any, name: string) => {
                const meta = superpowers.find(s => s.wbKey === name);
                return [tooltipValueFormatter(Number(v)), meta?.name ?? name];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value: string) => {
                const meta = superpowers.find(s => s.wbKey === value);
                return meta?.name ?? value;
              }}
            />
            {superpowers.map(meta => (
              <Line
                key={meta.iso3}
                type="monotone"
                dataKey={meta.wbKey}
                stroke={meta.color}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

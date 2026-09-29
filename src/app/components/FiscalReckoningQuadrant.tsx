'use client';

// Fiscal reckoning quadrant. Scatter plot: X = government debt-to-GDP,
// Y = interest-growth differential (r − g). Reference lines at 60%
// debt (Maastricht) and r-g = 0 divide the space into four regimes:
//   ┌────────────────────────────────────────────────┐
//   │ Slow squeeze     │ Debt spiral                  │
//   │ (r>g, low debt)  │ (r>g, high debt)             │
//   │ Safe growth      │ Growth-out                   │
//   │ (r<g, low debt)  │ (r<g, high debt — Japan-ish) │
//   └────────────────────────────────────────────────┘

import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';
import type { CountryData } from '../services/worldbank';
import { DEBT_COUNTRY_META } from '../services/debtCurated';
import { latestEntry } from '../utils/countryData';
import { useViewportSize } from '../hooks/useViewportSize';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

const TITLE = 'Fiscal Reckoning Quadrant';

interface Props {
  isDarkMode: boolean;
  governmentDebt: CountryData[];
  gdpGrowth: CountryData[];
  interestRates: CountryData[];
}

export default function FiscalReckoningQuadrant({ isDarkMode, governmentDebt, gdpGrowth, interestRates }: Props) {
  const { isMobile } = useViewportSize();

  const points = useMemo(() => {
    return DEBT_COUNTRY_META
      .map(meta => {
        const d = latestEntry(governmentDebt, meta.wbKey);
        const g = latestEntry(gdpGrowth, meta.wbKey);
        const r = latestEntry(interestRates, meta.wbKey);
        if (!d || !g || !r) return null;
        return {
          name: meta.name,
          debt: d.value,
          rg: r.value - g.value,
          color: meta.color,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [governmentDebt, gdpGrowth, interestRates]);

  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }
    : { backgroundColor: '#fff',    border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div id={slugify(TITLE)} className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
        <h3 className={`text-base sm:text-lg font-semibold ${text}`}>{TITLE}</h3>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <SocialShareMenu title={TITLE} isDarkMode={isDarkMode} />
        </div>
      </div>
      <p className={`text-xs mb-4 ${muted}`}>
        X: government debt as % of GDP. Y: interest-rate minus GDP-growth (r − g). Top-right = debt spiral; bottom-right = growth-out; bottom-left = safe; top-left = slow squeeze.
      </p>
      <div className="h-[300px] sm:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: isMobile ? 12 : 30, left: isMobile ? 0 : 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis
              type="number"
              dataKey="debt"
              name="Debt/GDP"
              stroke={axis}
              tick={{ fontSize: isMobile ? 9 : 11 }}
              tickFormatter={v => `${v}%`}
              label={isMobile ? undefined : { value: 'Government debt (% GDP)', position: 'insideBottom', offset: -10, fill: axis, fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="rg"
              name="r − g"
              stroke={axis}
              tick={{ fontSize: isMobile ? 9 : 11 }}
              tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`}
              label={isMobile ? undefined : { value: 'r − g (pp)', angle: -90, position: 'insideLeft', fill: axis, fontSize: 11 }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: number, name: string) => [
                name === 'Debt/GDP' ? `${value.toFixed(1)}%` : `${value.toFixed(2)}pp`,
                name,
              ]}
              labelFormatter={() => ''}
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const p = payload[0].payload as { name: string; debt: number; rg: number };
                return (
                  <div style={tooltipStyle} className="px-3 py-2 text-xs">
                    <div className="font-semibold">{p.name}</div>
                    <div>Debt: {p.debt.toFixed(1)}%</div>
                    <div>r − g: {p.rg >= 0 ? '+' : ''}{p.rg.toFixed(2)}pp</div>
                  </div>
                );
              }}
            />
            <ReferenceLine x={60} stroke="#eab308" strokeDasharray="3 3">
              <Label value="60% (Maastricht)" position="top" fill="#eab308" fontSize={10} />
            </ReferenceLine>
            <ReferenceLine x={90} stroke="#ef4444" strokeDasharray="3 3" />
            <ReferenceLine y={0} stroke={axis} />
            <Scatter data={points} name="Countries">
              {points.map((p, i) => (
                <Cell key={i} fill={p.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

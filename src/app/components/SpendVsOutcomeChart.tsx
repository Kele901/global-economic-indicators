'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, ZAxis } from 'recharts';
import { useMemo } from 'react';
import { SPEND_OUTCOME_2023, HEALTH_COUNTRY_META } from '../services/healthCurated';

interface Props { isDarkMode: boolean; }

export default function SpendVsOutcomeChart({ isDarkMode }: Props) {
  const data = useMemo(() =>
    SPEND_OUTCOME_2023.map(r => ({
      x: r.healthSpendPerCapUsd,
      y: r.lifeExpectancy,
      z: r.healthSpendPctGdp,
      code: r.code,
      name: HEALTH_COUNTRY_META.find(m => m.code === r.code)?.name ?? r.code,
    })),
  []);

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const dot = isDarkMode ? '#10b981' : '#059669';

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name="Spend per capita" unit=" $" stroke={axis} scale="log" domain={['auto', 'auto']}
                   label={{ value: 'Health spend per capita (USD, log scale)', position: 'bottom', offset: 10, fill: axis, fontSize: 12 }} />
            <YAxis type="number" dataKey="y" name="Life expectancy" unit=" yr" stroke={axis} domain={[50, 90]}
                   label={{ value: 'Life expectancy (yr)', angle: -90, position: 'insideLeft', fill: axis, fontSize: 12 }} />
            <ZAxis type="number" dataKey="z" range={[60, 400]} name="% GDP" />
            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}` }} cursor={{ strokeDasharray: '3 3' }}
              formatter={(v: any, n: any) => [typeof v === 'number' ? v.toLocaleString() : v, n]} />
            <Scatter data={data} fill={dot}>
              <LabelList dataKey="code" position="right" style={{ fill: axis, fontSize: 10 }} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Bubble size = health spending as % of GDP. The US pays roughly 3× the OECD median per capita yet trails on life expectancy — the classic US outlier that dominates every version of this chart.
      </p>
    </div>
  );
}

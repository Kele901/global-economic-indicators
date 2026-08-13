'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WAGES_2023, LABOR_COUNTRY_META } from '../services/laborCurated';

interface Props { isDarkMode: boolean; }

export default function WagesChart({ isDarkMode }: Props) {
  const data = [...WAGES_2023]
    .sort((a, b) => b.medianHourlyUsdPpp - a.medianHourlyUsdPpp)
    .map(r => ({
      name: LABOR_COUNTRY_META.find(m => m.code === r.code)?.name.split(' ')[0] ?? r.code,
      wage: r.medianHourlyUsdPpp,
      growth: r.realWageGrowth2019to2023Pct,
    }));

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="h-[520px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 30 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis type="number" stroke={axis} label={{ value: 'USD-PPP per hour (2023)', position: 'bottom', offset: 0, fill: axis, fontSize: 11 }} />
            <YAxis type="category" dataKey="name" stroke={axis} width={100} />
            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}` }}
                     formatter={(v: any, k: any, entry: any) => {
                       if (k === 'wage') return [`$${v.toFixed(2)}`, 'Median hourly wage'];
                       return [v, k];
                     }} />
            <Bar dataKey="wage" name="Median hourly wage">
              {data.map((d, i) => (
                <Cell key={i} fill={d.growth >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Green bars: real wages grew 2019-2023. Red: shrank. High inflation between 2021-2023 wiped out cash-wage growth for most European economies.
      </p>
    </div>
  );
}

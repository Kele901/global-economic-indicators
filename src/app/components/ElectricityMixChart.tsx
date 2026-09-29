'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ELECTRICITY_MIX_2023, ENERGY_COUNTRY_META } from '../services/energyCurated';

interface Props { isDarkMode: boolean; }

export default function ElectricityMixChart({ isDarkMode }: Props) {
  const data = ELECTRICITY_MIX_2023.map(r => ({
    name: ENERGY_COUNTRY_META.find(m => m.code === r.code)?.name.split(' ')[0] ?? r.code,
    ...r,
  }));

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="h-[400px] sm:h-[520px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 30 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis type="number" stroke={axis} domain={[0, 100]} unit="%" />
            <YAxis type="category" dataKey="name" stroke={axis} width={80} />
            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}` }} />
            <Legend />
            <Bar dataKey="coal"       stackId="a" fill="#78716c" name="Coal" />
            <Bar dataKey="gas"        stackId="a" fill="#94a3b8" name="Gas" />
            <Bar dataKey="oil"        stackId="a" fill="#7c2d12" name="Oil" />
            <Bar dataKey="nuclear"    stackId="a" fill="#a855f7" name="Nuclear" />
            <Bar dataKey="hydro"      stackId="a" fill="#3b82f6" name="Hydro" />
            <Bar dataKey="windSolar"  stackId="a" fill="#22c55e" name="Wind + Solar" />
            <Bar dataKey="otherRenew" stackId="a" fill="#14b8a6" name="Other renew" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        France runs on nuclear, Norway on hydro, Qatar on gas, India on coal. The green share (wind+solar+other renew) is climbing everywhere but the pace varies wildly.
      </p>
    </div>
  );
}

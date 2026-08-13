'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RESERVES_2024, ENERGY_COUNTRY_META } from '../services/energyCurated';

interface Props { isDarkMode: boolean; }

export default function ReservesRankingChart({ isDarkMode }: Props) {
  const data = RESERVES_2024
    .map(r => ({
      name: ENERGY_COUNTRY_META.find(m => m.code === r.code)?.name.split(' ')[0] ?? r.code,
      oil: r.oilReservesBnBarrels,
      gas: r.gasReservesTcf / 6,   // rough BOE conversion
      coal: r.coalReservesBnTonnes * 4.5, // rough BOE (Bn tonnes coal ~4.5 Bboe)
    }))
    .sort((a, b) => (b.oil + b.gas + b.coal) - (a.oil + a.gas + a.coal));

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="h-[520px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 30 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis type="number" stroke={axis} label={{ value: 'Bn barrels of oil equivalent', position: 'bottom', offset: 0, fill: axis, fontSize: 11 }} />
            <YAxis type="category" dataKey="name" stroke={axis} width={90} />
            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}` }} />
            <Legend />
            <Bar dataKey="oil"  stackId="a" fill="#7c2d12" name="Oil" />
            <Bar dataKey="gas"  stackId="a" fill="#0ea5e9" name="Gas (BOE)" />
            <Bar dataKey="coal" stackId="a" fill="#57534e" name="Coal (BOE)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Reserves converted to a common barrel-of-oil-equivalent basis. Russia and the US lead on total hydrocarbon reserves; Venezuela and Saudi Arabia lead on crude oil alone; China and Australia hold most of the world&apos;s coal.
      </p>
    </div>
  );
}

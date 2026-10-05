'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GENDER_GAP_2025, laborCountryName } from '../services/laborCurated';

interface Props { isDarkMode: boolean; }

export default function GenderGapChart({ isDarkMode }: Props) {
  const data = [...GENDER_GAP_2025]
    .sort((a, b) => (a.maleLfp - a.femaleLfp) - (b.maleLfp - b.femaleLfp))
    .map(r => ({
      name: laborCountryName(r.code, { short: true }),
      male: r.maleLfp,
      female: r.femaleLfp,
      gap: r.maleLfp - r.femaleLfp,
    }));

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="h-[480px] sm:h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 30 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis type="number" stroke={axis} unit="%" domain={[0, 100]} />
            <YAxis type="category" dataKey="name" stroke={axis} width={100} interval={0} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}` }}
              formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
            />
            <Legend />
            <Bar dataKey="male"   fill="#3b82f6" name="Male LFP" />
            <Bar dataKey="female" fill="#f472b6" name="Female LFP" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Sorted narrowest-gap first. ILO modelled estimates for 2025, ages 15+. Nigeria, Sweden and Norway are closest to parity (Nigeria because almost everyone works, mostly informally); India, Turkey and Mexico run gaps of 30-45 percentage points. The gap is one of the strongest untapped-growth signals in labour economics.
      </p>
    </div>
  );
}

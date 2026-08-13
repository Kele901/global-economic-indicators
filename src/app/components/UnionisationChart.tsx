'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { UNION_DENSITY_2023, LABOR_COUNTRY_META } from '../services/laborCurated';

interface Props { isDarkMode: boolean; }

export default function UnionisationChart({ isDarkMode }: Props) {
  const data = [...UNION_DENSITY_2023]
    .sort((a, b) => b.collectiveBargainingCoveragePct - a.collectiveBargainingCoveragePct)
    .map(r => ({
      name: LABOR_COUNTRY_META.find(m => m.code === r.code)?.name.split(' ')[0] ?? r.code,
      density: r.unionDensityPct,
      coverage: r.collectiveBargainingCoveragePct,
    }));

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke={axis} angle={-30} textAnchor="end" height={60} />
            <YAxis stroke={axis} unit="%" />
            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}` }} />
            <Legend />
            <Bar dataKey="coverage" name="Collective bargaining coverage" fill="#8b5cf6" />
            <Bar dataKey="density"  name="Union density"                  fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        France has 8% union density but 98% collective bargaining coverage — because sectoral agreements extend to non-members. The US pattern is the opposite: coverage tracks density closely.
      </p>
    </div>
  );
}

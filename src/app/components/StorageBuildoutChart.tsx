'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { STORAGE_BUILDOUT_2015_2030 } from '../services/energyCurated';

interface Props { isDarkMode: boolean; }

export default function StorageBuildoutChart({ isDarkMode }: Props) {
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={STORAGE_BUILDOUT_2015_2030} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" stroke={axis} />
            <YAxis stroke={axis} label={{ value: 'Cumulative GWh', angle: -90, position: 'insideLeft', fill: axis, fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}` }} />
            <Legend />
            <Area type="monotone" dataKey="china"       stackId="1" name="China"       fill="#ef4444" stroke="#ef4444" fillOpacity={0.7} />
            <Area type="monotone" dataKey="usa"         stackId="1" name="USA"         fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.7} />
            <Area type="monotone" dataKey="europe"      stackId="1" name="Europe"      fill="#22c55e" stroke="#22c55e" fillOpacity={0.7} />
            <Area type="monotone" dataKey="restOfWorld" stackId="1" name="Rest of world" fill="#f59e0b" stroke="#f59e0b" fillOpacity={0.7} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Battery storage went from a rounding error (1 GWh in 2015) to 220 GWh by 2024 and is projected past 1,500 GWh by 2030. China leads the manufacturing and deployment race.
      </p>
    </div>
  );
}

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { WORKING_AGE_2000_2050 } from '../services/laborCurated';

interface Props { isDarkMode: boolean; }

export default function WorkingAgeTrajectoryChart({ isDarkMode }: Props) {
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={WORKING_AGE_2000_2050} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" stroke={axis} />
            <YAxis stroke={axis} label={{ value: 'Working-age population (millions, 15-64)', angle: -90, position: 'insideLeft', fill: axis, fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}` }} />
            <Legend />
            <ReferenceLine x={2024} stroke={axis} strokeDasharray="3 3" label={{ value: 'Today', position: 'top', fill: axis, fontSize: 10 }} />
            <Line type="monotone" dataKey="india"     name="India"     stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="china"     name="China"     stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="nigeria"   name="Nigeria"   stroke="#84cc16" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="usa"       name="USA"       stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="eu27"      name="EU-27"     stroke="#8b5cf6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="indonesia" name="Indonesia" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="brazil"    name="Brazil"    stroke="#14b8a6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="japan"     name="Japan"     stroke="#f43f5e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        China's working-age population peaked in 2015 and is set to lose ~260M people by 2050. Nigeria overtakes both the US and EU by mid-century. The demographic cliff for the West is the demographic dividend for Africa.
      </p>
    </div>
  );
}

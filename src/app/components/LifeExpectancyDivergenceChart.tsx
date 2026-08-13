'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea } from 'recharts';
import { LIFE_EXPECTANCY_1990_2023 } from '../services/healthCurated';

interface Props { isDarkMode: boolean; }

export default function LifeExpectancyDivergenceChart({ isDarkMode }: Props) {
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={LIFE_EXPECTANCY_1990_2023} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" stroke={axis} />
            <YAxis stroke={axis} domain={[45, 85]} />
            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}` }} />
            <Legend />
            <ReferenceArea x1={2019} x2={2021} fill={isDarkMode ? '#f87171' : '#fecaca'} fillOpacity={0.2}
                           label={{ value: 'COVID', position: 'insideTop', fill: axis, fontSize: 10 }} />
            <Line type="monotone" dataKey="hicAvg"  name="High income"        stroke="#2563eb" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="umicAvg" name="Upper-middle"       stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="lmicAvg" name="Lower-middle"       stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="licAvg"  name="Low income"         stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Convergence stalled and briefly reversed during COVID. The absolute HIC–LIC gap remains ~16 years — down from 24 in 1990 but still enormous.
      </p>
    </div>
  );
}

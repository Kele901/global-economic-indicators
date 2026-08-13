'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea } from 'recharts';
import { YOUTH_UNEMPLOYMENT_2010_2024 } from '../services/laborCurated';

interface Props { isDarkMode: boolean; }

export default function YouthUnemploymentTimeline({ isDarkMode }: Props) {
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={YOUTH_UNEMPLOYMENT_2010_2024} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" stroke={axis} />
            <YAxis stroke={axis} unit="%" domain={[8, 22]} />
            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}` }} />
            <Legend />
            <ReferenceArea x1={2020} x2={2021} fill={isDarkMode ? '#f87171' : '#fecaca'} fillOpacity={0.2}
                           label={{ value: 'COVID', position: 'insideTop', fill: axis, fontSize: 10 }} />
            <Line type="monotone" dataKey="world"      name="World"           stroke="#3b82f6" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="advanced"   name="Advanced"        stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="emerging"   name="Emerging"        stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="developing" name="Developing"      stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Youth unemployment fell in advanced economies between 2013-2019, spiked during COVID, then converged again. Emerging-market youth unemployment consistently runs 3-4pp above the developing-country average.
      </p>
    </div>
  );
}

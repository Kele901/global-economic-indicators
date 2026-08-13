'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DISEASE_BURDEN_1990_2023 } from '../services/healthCurated';

interface Props { isDarkMode: boolean; }

export default function DiseaseBurdenTimeline({ isDarkMode }: Props) {
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DISEASE_BURDEN_1990_2023} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" stroke={axis} />
            <YAxis stroke={axis} label={{ value: 'DALY rate per 100k', angle: -90, position: 'insideLeft', fill: axis, fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}` }} />
            <Legend />
            <Area type="monotone" dataKey="communicable"   name="Communicable"    stackId="1" fill="#f43f5e" stroke="#f43f5e" fillOpacity={0.6} />
            <Area type="monotone" dataKey="cardiovascular" name="Cardiovascular"  stackId="1" fill="#dc2626" stroke="#dc2626" fillOpacity={0.6} />
            <Area type="monotone" dataKey="cancer"         name="Cancer"          stackId="1" fill="#8b5cf6" stroke="#8b5cf6" fillOpacity={0.6} />
            <Area type="monotone" dataKey="respiratory"    name="Respiratory"     stackId="1" fill="#0ea5e9" stroke="#0ea5e9" fillOpacity={0.6} />
            <Area type="monotone" dataKey="mental"         name="Mental / neuro"  stackId="1" fill="#14b8a6" stroke="#14b8a6" fillOpacity={0.6} />
            <Area type="monotone" dataKey="injuries"       name="Injuries"        stackId="1" fill="#f59e0b" stroke="#f59e0b" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        The dominant global health story since 1990 is the collapse of communicable-disease burden (child mortality, HIV, TB, malaria) even as NCDs — cardiovascular, cancer, mental — held steady. COVID reversed part of the trend in 2020-21.
      </p>
    </div>
  );
}

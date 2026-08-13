'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, ReferenceLine } from 'recharts';
import { DUAL_BURDEN_2022, HEALTH_COUNTRY_META } from '../services/healthCurated';

interface Props { isDarkMode: boolean; }

export default function DualBurdenChart({ isDarkMode }: Props) {
  const data = DUAL_BURDEN_2022.map(r => ({
    x: r.undernourishedPctPop,
    y: r.obesityPctAdults,
    code: r.code,
    name: HEALTH_COUNTRY_META.find(m => m.code === r.code)?.name ?? r.code,
  }));

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name="Undernourished" unit="%" stroke={axis} domain={[0, 25]}
                   label={{ value: 'Undernourished (% of population)', position: 'bottom', offset: 10, fill: axis, fontSize: 12 }} />
            <YAxis type="number" dataKey="y" name="Obesity" unit="%" stroke={axis} domain={[0, 50]}
                   label={{ value: 'Adult obesity rate (%)', angle: -90, position: 'insideLeft', fill: axis, fontSize: 12 }} />
            <ReferenceLine x={10} stroke={axis} strokeDasharray="4 4" label={{ value: 'High hunger', fill: axis, fontSize: 10, position: 'insideTopRight' }} />
            <ReferenceLine y={25} stroke={axis} strokeDasharray="4 4" label={{ value: 'High obesity', fill: axis, fontSize: 10, position: 'insideTopRight' }} />
            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}` }} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data} fill="#f97316">
              <LabelList dataKey="code" position="right" style={{ fill: axis, fontSize: 10 }} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        The quadrant with both high hunger AND high obesity (Egypt, Mexico, South Africa) is the modern paradox — cheap ultra-processed calories meet inadequate protein and micronutrient intake in the same population.
      </p>
    </div>
  );
}

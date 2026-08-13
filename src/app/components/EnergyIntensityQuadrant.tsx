'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, ReferenceLine } from 'recharts';
import { ENERGY_INTENSITY_2023, ENERGY_COUNTRY_META } from '../services/energyCurated';

interface Props { isDarkMode: boolean; }

export default function EnergyIntensityQuadrant({ isDarkMode }: Props) {
  const data = ENERGY_INTENSITY_2023.map(r => ({
    x: r.kgoePer1000UsdPpp,
    y: r.yoyChangePct,
    code: r.code,
    name: ENERGY_COUNTRY_META.find(m => m.code === r.code)?.name ?? r.code,
  }));

  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';

  return (
    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name="Intensity" unit=" kgoe" stroke={axis}
                   label={{ value: 'Energy intensity (kgoe / $1,000 GDP-PPP)', position: 'bottom', offset: 10, fill: axis, fontSize: 12 }} />
            <YAxis type="number" dataKey="y" name="YoY change" unit="%" stroke={axis} domain={[-5, 5]}
                   label={{ value: 'YoY change (%)', angle: -90, position: 'insideLeft', fill: axis, fontSize: 12 }} />
            <ReferenceLine y={0} stroke={axis} />
            <ReferenceLine x={100} stroke={axis} strokeDasharray="4 4" />
            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: `1px solid ${grid}` }} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data} fill="#0ea5e9">
              <LabelList dataKey="code" position="right" style={{ fill: axis, fontSize: 10 }} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Bottom-left is the target: low intensity and getting more efficient. The Middle East runs high-intensity oil-and-gas economies; Switzerland and the UK show what mature-services efficiency looks like.
      </p>
    </div>
  );
}

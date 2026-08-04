'use client';

// Data-centre electricity consumption chart. IEA Electricity 2025
// projections show data centres more than doubling their share of
// global electricity by 2030 — driven by generative AI training and
// inference workloads.

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { DATA_CENTRE_ENERGY_2015_2030 } from '../services/aiCurated';
import { useViewportSize } from '../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
}

export default function DataCenterEnergyChart({ isDarkMode }: Props) {
  const { isMobile } = useViewportSize();
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }
    : { backgroundColor: '#fff',    border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
      <h3 className={`text-base sm:text-lg font-semibold mb-1 ${text}`}>Data-Centre Electricity, 2015-2030</h3>
      <p className={`text-xs mb-4 ${muted}`}>Terawatt-hours per year. IEA Electricity 2025 projects data centres to consume ~1,450 TWh by 2030 — roughly 3% of global electricity — with US &amp; China accounting for ~80% of the growth.</p>
      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DATA_CENTRE_ENERGY_2015_2030} margin={{ top: 10, right: isMobile ? 8 : 20, left: isMobile ? 0 : 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="year" stroke={axis} tick={{ fontSize: isMobile ? 9 : 11 }} />
            <YAxis stroke={axis} tick={{ fontSize: isMobile ? 9 : 11 }} tickFormatter={v => `${v}`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} TWh`, '']} />
            {!isMobile && <Legend />}
            <ReferenceLine x={2024} stroke={axis} strokeDasharray="3 3" />
            <Area type="monotone" dataKey="usa"   stackId="a" name="United States" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
            <Area type="monotone" dataKey="china" stackId="a" name="China"         stroke="#dc2626" fill="#dc2626" fillOpacity={0.6} />
            <Area type="monotone" dataKey="eu"    stackId="a" name="EU-27"         stroke="#facc15" fill="#facc15" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

'use client';

// Two-axis line chart of Baltic Dry Index (dry-bulk shipping cost) and
// Drewry World Container Index (USD/40ft box) 2020-2025. Highlights the
// covid supply-chain bull run (BDI 500 → 5100, WCI $1400 → $10k) and the
// 2024 Red Sea / Suez disruption bump.

import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceArea,
} from 'recharts';
import { SHIPPING_INDEX_MONTHLY } from '../services/tradeCurated';
import { useViewportSize } from '../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
}

export default function ShippingIndexChart({ isDarkMode }: Props) {
  const { isMobile } = useViewportSize();
  const data = useMemo(() => SHIPPING_INDEX_MONTHLY.map(r => ({ ...r })), []);

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: 6,
    color: isDarkMode ? '#f3f4f6' : '#111827',
    fontSize: 12,
  };

  return (
    <div className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className={`text-xs uppercase tracking-wider mb-1 ${textMuted}`}>
        Freight cost indices
      </div>
      <p className={`text-sm mb-4 ${textSec}`}>
        Baltic Dry Index (BDI, dry-bulk carriers) and Drewry World Container Index (USD per 40-ft box). Covid 2021-2022 bull run visible on both; 2024 Red Sea disruption re-inflated the WCI.
      </p>
      <div className={isMobile ? 'h-[320px]' : 'h-[420px]'}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={isMobile ? { top: 8, right: 8, bottom: 8, left: 0 } : { top: 10, right: 40, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="date" stroke={axis} tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis
              yAxisId="left"
              stroke={axis}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 40 : 60}
              label={isMobile ? undefined : { value: 'BDI', angle: -90, position: 'insideLeft', fill: axis, fontSize: 12 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={axis}
              tickFormatter={v => `$${(v/1000).toFixed(0)}k`}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 40 : 60}
              label={isMobile ? undefined : { value: 'WCI', angle: 90, position: 'insideRight', fill: axis, fontSize: 12 }}
            />
            <ReferenceArea x1="2021-06" x2="2022-06" yAxisId="left" fill={isDarkMode ? '#f59e0b' : '#fde68a'} fillOpacity={0.15} />
            <ReferenceArea x1="2023-11" x2="2024-07" yAxisId="left" fill={isDarkMode ? '#3b82f6' : '#bfdbfe'} fillOpacity={0.15} />
            <Tooltip contentStyle={tooltipStyle} />
            {!isMobile && <Legend wrapperStyle={{ fontSize: 11 }} />}
            <Line yAxisId="left" type="monotone" dataKey="bdi" name="Baltic Dry Index" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="wci" name="Drewry WCI ($/40ft)" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

'use client';

// Timeline of frontier LLM releases 2018-2025. Rendered as a scatter
// where X-axis is release date, Y-axis is estimated training FLOPs
// (log). Each dot is coloured by lab. Closed-model releases with
// unknown FLOPs are collapsed onto a "closed" band at the top of the
// chart.

import { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MODEL_RELEASES_2018_2025 } from '../services/aiCurated';
import { useViewportSize } from '../hooks/useViewportSize';

interface Props {
  isDarkMode: boolean;
}

const LAB_COLORS: Record<string, string> = {
  'OpenAI':               '#10b981',
  'Anthropic':            '#f97316',
  'Google':               '#3b82f6',
  'Google DeepMind':      '#3b82f6',
  'DeepMind':             '#6366f1',
  'Meta':                 '#2563eb',
  'DeepSeek':             '#dc2626',
  'Alibaba':              '#f59e0b',
  'Moonshot AI':          '#8b5cf6',
};

const CLOSED_FLOPS = 500;  // sentinel Y-position for closed models

function toDateNum(d: string): number {
  return new Date(d + 'T00:00:00Z').getTime() / (86400e3 * 365.25) + 1970;
}

export default function ModelReleasesTimeline({ isDarkMode }: Props) {
  const { isMobile } = useViewportSize();
  const [labFilter, setLabFilter] = useState<string | 'all'>('all');

  const labs = useMemo(() => Array.from(new Set(MODEL_RELEASES_2018_2025.map(m => m.lab))).sort(), []);

  const points = useMemo(() => {
    return MODEL_RELEASES_2018_2025
      .filter(m => labFilter === 'all' || m.lab === labFilter)
      .map(m => ({
        name: m.name,
        lab: m.lab,
        dateNum: toDateNum(m.date),
        flops: m.trainingFlops ?? CLOSED_FLOPS,
        isClosed: m.trainingFlops == null,
        params: m.params,
        country: m.country,
        modality: m.modality,
      }));
  }, [labFilter]);

  const axis = isDarkMode ? '#9ca3af' : '#6b7280';
  const grid = isDarkMode ? '#374151' : '#e5e7eb';
  const tooltipStyle: React.CSSProperties = isDarkMode
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }
    : { backgroundColor: '#fff',    border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const text = isDarkMode ? 'text-white' : 'text-gray-900';
  const muted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const btnBase = 'text-xs px-2.5 py-1 rounded-md border transition-colors';
  const btnActive = isDarkMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-600 border-blue-600 text-white';
  const btnIdle = isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white' : 'bg-white border-gray-200 text-gray-700 hover:text-gray-900';

  return (
    <div className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className={`text-base sm:text-lg font-semibold ${text}`}>Frontier Model Releases, 2018-2025</h3>
          <p className={`text-xs ${muted}`}>Y-axis: training compute in 10²³ FLOPs (log scale). &quot;Closed&quot; releases (top band) don&apos;t publish their compute budget.</p>
        </div>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by lab">
          <button className={`${btnBase} ${labFilter === 'all' ? btnActive : btnIdle}`} onClick={() => setLabFilter('all')} aria-pressed={labFilter === 'all'}>All labs</button>
          {labs.map(l => (
            <button key={l} className={`${btnBase} ${labFilter === l ? btnActive : btnIdle}`} onClick={() => setLabFilter(l)} aria-pressed={labFilter === l}>{l}</button>
          ))}
        </div>
      </div>
      <div className="h-[300px] sm:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: isMobile ? 12 : 30, left: isMobile ? 0 : 10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis
              type="number"
              dataKey="dateNum"
              domain={[2018, 2026]}
              stroke={axis}
              tick={{ fontSize: isMobile ? 9 : 11 }}
              tickFormatter={v => `${Math.floor(v)}`}
              ticks={[2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]}
              label={isMobile ? undefined : { value: 'Release year', position: 'insideBottom', offset: -10, fill: axis, fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="flops"
              scale="log"
              domain={[0.00001, 1000]}
              stroke={axis}
              tick={{ fontSize: isMobile ? 9 : 10 }}
              tickFormatter={v => v === CLOSED_FLOPS ? 'closed' : `10^${Math.log10(v * 1e23).toFixed(0)}`}
              label={isMobile ? undefined : { value: 'Training compute (FLOPs)', angle: -90, position: 'insideLeft', fill: axis, fontSize: 11 }}
              ticks={[0.00001, 0.001, 0.1, 10, 500]}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const p = payload[0].payload as {
                  name: string; lab: string; dateNum: number; flops: number; isClosed: boolean; params: string; country: string; modality: string;
                };
                const yr = Math.floor(p.dateNum);
                const frac = p.dateNum - yr;
                const month = Math.round(frac * 12);
                return (
                  <div style={tooltipStyle} className="px-3 py-2 text-xs">
                    <div className="font-semibold">{p.name}</div>
                    <div>{p.lab} · {p.country}</div>
                    <div>{yr}-{String(month).padStart(2, '0')}</div>
                    <div>Params: {p.params}</div>
                    <div>Modality: {p.modality}</div>
                    <div>{p.isClosed ? 'FLOP budget closed' : `${(p.flops * 1e23).toExponential(1)} FLOP`}</div>
                  </div>
                );
              }}
            />
            <Scatter data={points}>
              {points.map((p, i) => (
                <Cell key={i} fill={LAB_COLORS[p.lab] ?? '#9ca3af'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

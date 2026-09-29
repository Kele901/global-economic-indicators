'use client';

// Two data layers: (1) the WTO simple-mean applied tariff by country from
// the curated snapshot (horizontal bar), and (2) the US↔China running
// weighted-average tariff timeline from 2018-2025 (line overlay in a
// separate panel).

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line, ReferenceDot,
} from 'recharts';
import { WTO_APPLIED_TARIFFS_2024, TARIFF_TIMELINE } from '../services/tradeCurated';
import { useViewportSize } from '../hooks/useViewportSize';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

const TITLE = 'Tariff walls';
const BILATERAL_TITLE = 'US↔China bilateral tariffs (2018-2025)';

interface Props {
  isDarkMode: boolean;
}

export default function TariffWallChart({ isDarkMode }: Props) {
  const { isMobile } = useViewportSize();

  const barData = useMemo(() =>
    [...WTO_APPLIED_TARIFFS_2024]
      .sort((a, b) => b.simpleMeanPct - a.simpleMeanPct)
      .map(r => ({
        country: r.countryLabel,
        Agricultural: r.agriculturalPct,
        'Non-agricultural': r.nonAgriculturalPct,
      })),
    []);

  const lineData = useMemo(() =>
    TARIFF_TIMELINE.map(e => ({
      date: e.date,
      'US tariff on China': e.usTariffOnChina,
      'China tariff on US': e.chinaTariffOnUs,
    })),
    []);

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
    <div id={slugify(TITLE)} className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
        <div className={`text-xs uppercase tracking-wider ${textMuted}`}>
          {TITLE}
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <SocialShareMenu title={TITLE} isDarkMode={isDarkMode} />
        </div>
      </div>
      <p className={`text-sm mb-4 ${textSec}`}>
        Top: WTO applied simple-mean tariffs 2024, split agricultural vs. non-agricultural. India, South Korea, and Argentina protect agriculture heavily. Bottom: US↔China bilateral tariffs, showing the 2018-19 trade war and the 2025 second-Trump escalation.
      </p>
      <div className={`grid grid-cols-1 gap-6`}>
        <div className={isMobile ? 'h-[420px]' : 'h-[520px]'}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={isMobile ? { top: 8, right: 8, bottom: 8, left: 60 } : { top: 10, right: 20, bottom: 10, left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} />
              <XAxis type="number" stroke={axis} tickFormatter={v => `${v}%`} tick={{ fontSize: isMobile ? 10 : 12 }} />
              <YAxis type="category" dataKey="country" stroke={axis} width={isMobile ? 70 : 90} tick={{ fontSize: isMobile ? 9 : 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toFixed(1)}%`} />
              {!isMobile && <Legend wrapperStyle={{ fontSize: 11 }} />}
              <Bar dataKey="Agricultural" stackId="a" fill={isDarkMode ? '#f59e0b' : '#d97706'} />
              <Bar dataKey="Non-agricultural" stackId="a" fill={isDarkMode ? '#3b82f6' : '#2563eb'} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div id={slugify(BILATERAL_TITLE)} className={`flex flex-col ${isMobile ? 'h-[320px]' : 'h-[380px]'}`}>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <div className={`text-xs ${textMuted}`}>{BILATERAL_TITLE}</div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <SocialShareMenu title={BILATERAL_TITLE} isDarkMode={isDarkMode} />
            </div>
          </div>
          <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={isMobile ? { top: 8, right: 8, bottom: 8, left: 0 } : { top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} />
              <XAxis dataKey="date" stroke={axis} tick={{ fontSize: isMobile ? 10 : 12 }} />
              <YAxis stroke={axis} tickFormatter={v => `${v}%`} tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 40 : 60} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toFixed(1)}%`} />
              {!isMobile && <Legend wrapperStyle={{ fontSize: 11 }} />}
              <Line type="monotone" dataKey="US tariff on China" stroke="#dc2626" strokeWidth={2} dot />
              <Line type="monotone" dataKey="China tariff on US" stroke="#f97316" strokeWidth={2} dot />
              <ReferenceDot x="2025-04-09" y={145} r={6} fill="#dc2626" stroke="none" label={{ value: 'Peak 145%', position: 'top', fill: axis, fontSize: 10 }} />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

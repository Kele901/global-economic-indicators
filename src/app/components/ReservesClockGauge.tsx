'use client';

import { useMemo, useState } from 'react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { GLOBAL_RESERVES_AGGREGATES, type GlobalReservesAggregate } from '../data/resourceStaticData';
import SocialShareMenu from './SocialShareMenu';
import { slugify } from '../lib/share';

interface Props {
  isDarkMode: boolean;
}

// Years-to-depletion buckets used to colour each gauge:
//   Red  = < 30 yr (short horizon)
//   Amber = 30-70 yr (moderate)
//   Green = > 70 yr (long horizon)
function bandForYears(years: number): { color: string; band: string } {
  if (years < 30) return { color: '#ef4444', band: 'Tight' };
  if (years < 70) return { color: '#f59e0b', band: 'Moderate' };
  return { color: '#10b981', band: 'Ample' };
}

// Fixed reference max so every gauge is comparable at a glance.
const MAX_YEARS = 200;

interface Gauge {
  agg: GlobalReservesAggregate;
  years: number;
  band: string;
  color: string;
}

export default function ReservesClockGauge({ isDarkMode }: Props) {
  const [filter, setFilter] = useState<'all' | 'energy' | 'metals'>('all');

  const gauges: Gauge[] = useMemo(
    () =>
      GLOBAL_RESERVES_AGGREGATES.filter(a => filter === 'all' || a.category === filter).map(agg => {
        const years = agg.reserves / agg.annualProduction;
        const { color, band } = bandForYears(years);
        return { agg, years, band, color };
      }),
    [filter],
  );

  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSec = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const trackColor = isDarkMode ? '#374151' : '#f3f4f6';

  return (
    <div id={slugify('Years Until Depletion')} className={`rounded-lg border p-4 sm:p-6 ${cardBg}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h4 className={`text-base font-semibold ${textPrimary}`}>Years Until Depletion</h4>
          <p className={`text-xs mt-0.5 ${textSec}`}>
            Global proven reserves divided by current annual production. Not a prediction — resources are found and lost every year.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
        <div className="flex gap-1">
          {(['all', 'energy', 'metals'] as const).map(k => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`text-xs px-3 py-1.5 rounded-md capitalize transition-colors ${
                filter === k
                  ? 'bg-amber-500 text-white'
                  : isDarkMode
                    ? 'bg-gray-900 text-gray-400 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
          <SocialShareMenu title="Years Until Depletion" isDarkMode={isDarkMode} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {gauges.map(({ agg, years, band, color }) => {
          const chartData = [{ name: agg.label, value: Math.min(years, MAX_YEARS) }];
          return (
            <div
              key={agg.id}
              className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className={`text-sm font-medium ${textPrimary}`}>{agg.label}</span>
                <span className={`text-[10px] uppercase tracking-wider ${textSec}`}>{agg.category}</span>
              </div>
              <div className="relative h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={chartData}
                    startAngle={210}
                    endAngle={-30}
                  >
                    <PolarAngleAxis type="number" domain={[0, MAX_YEARS]} tick={false} />
                    <RadialBar
                      dataKey="value"
                      cornerRadius={8}
                      background={{ fill: trackColor }}
                      fill={color}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold tabular-nums" style={{ color }}>
                    {years >= 100 ? Math.round(years) : years.toFixed(1)}
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider ${textSec}`}>years</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${color}22`, color }}
                >
                  {band}
                </span>
                <span className={`text-[10px] ${textSec}`}>
                  {agg.reserves.toLocaleString()} {agg.unit}
                </span>
              </div>
              {agg.notes && (
                <p className={`text-[11px] mt-2 leading-snug ${textSec}`}>{agg.notes}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

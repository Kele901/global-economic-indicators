'use client';

// One price-history chart for one city: a toggleable legend, a line per
// selected series, and a download button. Every city section on /inflation
// renders through this, driven by CITY_PROFILES.

import { useMemo, useRef, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartDownloadButton from '../ChartDownloadButton';
import SocialShareMenu from '../SocialShareMenu';
import type { CitySection } from '../../data/costOfLiving';
import { theme } from './ui';

interface CityPriceChartProps {
  section: CitySection;
  cityName: string;
  currencySymbol: string;
  decimals: number;
  isDarkMode: boolean;
  /** Replaces the section blurb's currency note, e.g. when prices are shown in USD. */
  currencyNote?: string;
}

export default function CityPriceChart({ section, cityName, currencySymbol, decimals, isDarkMode, currencyNote }: CityPriceChartProps) {
  const t = theme(isDarkMode);
  const chartRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string[]>(() => section.series.map((s) => s.key));

  const title = `${cityName} ${section.title}`;

  const format = useMemo(
    () => (value: number | null | undefined) =>
      value === null || value === undefined || Number.isNaN(Number(value))
        ? 'N/A'
        : `${currencySymbol}${Number(value).toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}`,
    [currencySymbol, decimals],
  );

  const toggle = (key: string) => setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <div
      ref={chartRef}
      id={`${section.id}-${cityName.toLowerCase().replace(/\s+/g, '-')}`}
      data-chart-container
      data-chart-title={title}
      className={`rounded-xl border p-4 sm:p-5 scroll-mt-24 ${t.card}`}
    >
      <div className="flex justify-between items-start mb-1 gap-3 flex-wrap">
        <h4 className={`text-base font-semibold ${t.text}`}>{section.title}</h4>
        <div className="flex items-center gap-2">
          <ChartDownloadButton
            chartElement={chartRef.current}
            chartRef={chartRef}
            chartData={{ title, data: section.data, type: 'line', countries: selected }}
            variant="outline"
            size="sm"
          />
          <SocialShareMenu title={title} isDarkMode={isDarkMode} size="sm" iconOnly className="shrink-0" />
        </div>
      </div>

      <p className={`text-xs sm:text-sm mb-3 ${t.textSec}`}>
        {section.blurb}
        {currencyNote && <> {currencyNote}</>}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {section.series.map((item) => {
          const isSelected = selected.includes(item.key);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggle(item.key)}
              aria-pressed={isSelected}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isSelected ? (isDarkMode ? 'bg-gray-900 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300 shadow-sm') : `${t.chip} opacity-60`
              }`}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: item.color }} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={section.data} margin={{ top: 5, right: 16, left: 4, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
            <XAxis dataKey="year" stroke={t.axis} tick={{ fontSize: 11 }} />
            <YAxis stroke={t.axis} tick={{ fontSize: 11 }} tickFormatter={(v) => format(v)} width={72} />
            <Tooltip contentStyle={t.tooltip} formatter={(value: number) => format(value)} labelFormatter={(label) => `Year: ${label}`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {section.series
              .filter((item) => selected.includes(item.key))
              .map((item) => (
                <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-[11px] mt-2 ${t.textMuted}`}>Source: Numbeo.com crowd-sourced prices, annual snapshots.</p>
    </div>
  );
}

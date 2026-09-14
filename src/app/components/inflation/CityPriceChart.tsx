'use client';

// One price-history chart for one city: a toggleable legend, a line per
// selected series, and a download button. Every city section on /inflation
// renders through this, driven by CITY_PROFILES.

import { useMemo, useRef, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartDownloadButton from '../ChartDownloadButton';
import type { CitySection } from '../../data/costOfLiving';

interface CityPriceChartProps {
  section: CitySection;
  cityName: string;
  currencySymbol: string;
  decimals: number;
  isDarkMode: boolean;
}

export default function CityPriceChart({
  section,
  cityName,
  currencySymbol,
  decimals,
  isDarkMode,
}: CityPriceChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string[]>(() => section.series.map(s => s.key));

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

  const toggle = (key: string) =>
    setSelected(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));

  const axisColor = isDarkMode ? '#e5e7eb' : '#374151';

  return (
    <div
      ref={chartRef}
      id={`${section.id}-${cityName.toLowerCase().replace(/\s+/g, '-')}`}
      data-chart-container
      data-chart-title={title}
      className={`rounded-lg shadow p-4 mb-6 ${isDarkMode ? 'bg-[#181f2a]' : 'bg-white'} transition-colors duration-200`}
    >
      <div className="flex justify-between items-start mb-2 gap-4">
        <h3 className="text-lg font-semibold">{section.title}</h3>
        <ChartDownloadButton
          chartElement={chartRef.current}
          chartRef={chartRef}
          chartData={{ title, data: section.data, type: 'line', countries: selected }}
          variant="outline"
          size="sm"
        />
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{section.blurb}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">Data source: Numbeo.com</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {section.series.map(item => {
          const isSelected = selected.includes(item.key);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggle(item.key)}
              aria-pressed={isSelected}
              className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-blue-100 text-blue-900 border-blue-400'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              style={{ borderColor: item.color }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ background: item.color }}
                aria-hidden="true"
              />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={section.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#ccc'} />
            <XAxis
              dataKey="year"
              stroke={axisColor}
              tick={{ fill: axisColor, fontWeight: 500 }}
            />
            <YAxis
              stroke={axisColor}
              tick={{ fill: axisColor, fontWeight: 500 }}
              tickFormatter={v => format(v)}
              width={80}
            />
            <Tooltip
              contentStyle={
                isDarkMode
                  ? { backgroundColor: '#232946', border: '1px solid #6366f1', color: '#fff', fontSize: 16 }
                  : { fontSize: 16 }
              }
              labelStyle={{ color: isDarkMode ? '#fff' : '#374151', fontWeight: 600 }}
              formatter={(value: number) => format(value)}
              labelFormatter={label => `Year: ${label}`}
            />
            <Legend wrapperStyle={{ color: axisColor, fontWeight: 600, fontSize: 15 }} />
            {section.series
              .filter(item => selected.includes(item.key))
              .map(item => (
                <Line
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  name={item.label}
                  stroke={item.color}
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { fetchGlobalData, CountryData } from '../../services/worldbank';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_COLORS, type CountryKey } from '../../utils/countryMappings';
import { getMetricByKey, formatMetricValue } from '../../utils/metricCategories';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function EmbedChartPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chartType = params?.type as string || 'chart';

  const metric = searchParams?.get('metric') || 'gdpGrowth';
  const countries = (searchParams?.get('countries') || 'USA,UK').split(',');
  const periodParam = searchParams?.get('period') || '10';
  const period = parseInt(periodParam) || 10;
  const theme = searchParams?.get('theme') || 'light';

  const [data, setData] = useState<Record<string, CountryData[]> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalData().then(d => { setData(d as any); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const axisColor = isDark ? '#9ca3af' : '#6b7280';
  const tooltipStyle = isDark
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '8px' } as React.CSSProperties
    : { backgroundColor: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '8px' } as React.CSSProperties;

  const metricDef = getMetricByKey(metric);

  const chartData = useMemo(() => {
    if (!data) return [];
    const series = (data as any)[metric] as CountryData[] | undefined;
    if (!series) return [];
    const currentYear = new Date().getFullYear();
    const startYear = period > 0 ? currentYear - period : 0;
    return series.filter(r => Number(r.year) >= startYear).map(row => {
      const point: Record<string, any> = { year: row.year };
      countries.forEach(ck => {
        const v = Number(row[ck.trim()]);
        if (!isNaN(v)) point[ck.trim()] = v;
      });
      return point;
    });
  }, [data, metric, countries, period]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-[300px] ${isDark ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500'}`}>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`p-3 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h3 className="text-sm font-semibold mb-2">{metricDef?.label || metric}</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="year" stroke={axisColor} tick={{ fontSize: 10 }} />
            <YAxis stroke={axisColor} tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            {countries.map((ck, i) => {
              const key = ck.trim();
              return (
                <Line key={key} type="monotone" dataKey={key}
                  name={COUNTRY_DISPLAY_NAMES[key as CountryKey] || key}
                  stroke={COUNTRY_COLORS[key as CountryKey] || ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b'][i % 4]}
                  dot={false} strokeWidth={2} connectNulls />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

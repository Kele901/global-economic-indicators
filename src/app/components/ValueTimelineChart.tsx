import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { formatCurrency } from '../services/inflationCalculator';

interface ValueTimelineChartProps {
  data: { year: number; value: number }[];
  country: string;
  originalAmount: number;
  originalYear: number;
  targetYear: number;
  targetValue: number;
  isDarkMode: boolean;
}

const ValueTimelineChart: React.FC<ValueTimelineChartProps> = ({
  data,
  country,
  originalAmount,
  originalYear,
  targetYear,
  targetValue,
  isDarkMode
}) => {
  if (data.length === 0) {
    return (
      <div className={`p-8 text-center rounded-lg ${
        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'
      }`}>
        No data available for the selected period
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <p className="font-semibold mb-1">{data.year}</p>
          <p className="text-sm">
            Equivalent value: <span className="font-bold">{formatCurrency(data.value, country, data.year)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const padding = (maxValue - minValue) * 0.1;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDarkMode ? '#374151' : '#e5e7eb'}
          />
          <XAxis
            dataKey="year"
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px' }}
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
          />
          <YAxis
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px' }}
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
            domain={[minValue - padding, maxValue + padding]}
            tickFormatter={(value) => formatCurrency(value, country)}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Reference line for original year */}
          <ReferenceLine
            x={originalYear}
            stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
            strokeDasharray="5 5"
            label={{
              value: `Start: ${originalYear}`,
              position: 'top',
              fill: isDarkMode ? '#60a5fa' : '#3b82f6',
              fontSize: 12
            }}
          />
          
          {/* Reference line for target year */}
          <ReferenceLine
            x={targetYear}
            stroke={isDarkMode ? '#34d399' : '#10b981'}
            strokeDasharray="5 5"
            label={{
              value: `End: ${targetYear}`,
              position: 'top',
              fill: isDarkMode ? '#34d399' : '#10b981',
              fontSize: 12
            }}
          />
          
          <Line
            type="monotone"
            dataKey="value"
            stroke={isDarkMode ? '#8b5cf6' : '#7c3aed'}
            strokeWidth={3}
            dot={{ fill: isDarkMode ? '#8b5cf6' : '#7c3aed', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
          }`}></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            Original Year: {originalYear} ({formatCurrency(originalAmount, country, originalYear)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isDarkMode ? 'bg-green-400' : 'bg-green-600'
          }`}></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            Target Year: {targetYear} ({formatCurrency(targetValue, country, targetYear)})
          </span>
        </div>
      </div>
    </div>
  );
};

export default ValueTimelineChart;


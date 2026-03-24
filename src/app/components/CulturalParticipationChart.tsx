'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import { culturalChartColors } from '../data/culturalMetrics';

interface CulturalParticipationChartProps {
  isDarkMode: boolean;
  libraryDensity: Record<string, number>;
  performingArts: Record<string, number>;
  culturalParticipation: Record<string, number>;
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

type ViewMode = 'libraries' | 'performing' | 'participation';

const CulturalParticipationChart: React.FC<CulturalParticipationChartProps> = ({
  isDarkMode,
  libraryDensity,
  performingArts,
  culturalParticipation,
  selectedCountries,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('libraries');

  const themeColors = {
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    gridColor: isDarkMode ? '#374151' : '#E5E7EB',
    tickColor: isDarkMode ? '#9CA3AF' : '#6B7280',
  };

  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
    borderRadius: '8px',
    color: isDarkMode ? '#F3F4F6' : '#111827',
  };

  const libraryData = useMemo(() => {
    return selectedCountries
      .filter(c => libraryDensity[c] != null && !Number.isNaN(libraryDensity[c]))
      .map(country => ({ country, Density: libraryDensity[country] }))
      .sort((a, b) => b.Density - a.Density);
  }, [libraryDensity, selectedCountries]);

  const performingData = useMemo(() => {
    return selectedCountries
      .filter(c => performingArts[c] != null && !Number.isNaN(performingArts[c]))
      .map(country => ({ country, Attendance: performingArts[country] }))
      .sort((a, b) => b.Attendance - a.Attendance);
  }, [performingArts, selectedCountries]);

  const participationData = useMemo(() => {
    return selectedCountries
      .filter(c => culturalParticipation[c] != null && !Number.isNaN(culturalParticipation[c]))
      .map(country => ({ country, Rate: culturalParticipation[country] }))
      .sort((a, b) => b.Rate - a.Rate);
  }, [culturalParticipation, selectedCountries]);

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-blue-500 text-blue-400' : 'bg-white border-blue-400 text-blue-700'
      }`}>
        <h3 className="font-semibold">Cultural Participation</h3>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Library access, performing arts attendance, and self-reported cultural participation
          highlight how populations engage with culture in daily life.
        </p>
      </div>

      <div className={`flex flex-wrap gap-2 p-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {([
          { id: 'libraries' as ViewMode, label: 'Library Density' },
          { id: 'performing' as ViewMode, label: 'Performing Arts' },
          { id: 'participation' as ViewMode, label: 'Cultural Participation' },
        ]).map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setViewMode(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === tab.id
                ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 shadow'
                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {viewMode === 'libraries' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Library Density</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>Public libraries per million inhabitants</p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={libraryData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis dataKey="country" tick={{ fill: themeColors.tickColor, fontSize: 11 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => `${value} per million`} />
                <Bar dataKey="Density" radius={[4, 4, 0, 0]}>
                  {libraryData.map((entry, index) => (
                    <Cell key={index} fill={culturalChartColors[entry.country] || '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'performing' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Performing Arts</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>Performing arts attendance per capita</p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performingData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis dataKey="country" tick={{ fill: themeColors.tickColor, fontSize: 11 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => `${Number(value).toFixed(1)} per capita`} />
                <Bar dataKey="Attendance" radius={[4, 4, 0, 0]}>
                  {performingData.map((entry, index) => (
                    <Cell key={index} fill={culturalChartColors[entry.country] || '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'participation' && (
        <div className={`p-6 rounded-xl ${themeColors.cardBg} border ${themeColors.border}`}>
          <h3 className={`text-lg font-semibold mb-1 ${themeColors.text}`}>Cultural Participation</h3>
          <p className={`text-sm mb-4 ${themeColors.textSecondary}`}>Share of population participating in cultural activities</p>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participationData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
                <XAxis type="number" tick={{ fill: themeColors.tickColor, fontSize: 12 }} />
                <YAxis dataKey="country" type="category" tick={{ fill: themeColors.tickColor, fontSize: 12 }} width={75} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => `${Number(value).toFixed(1)}%`} />
                <Bar dataKey="Rate" radius={[0, 4, 4, 0]}>
                  {participationData.map((entry, index) => (
                    <Cell key={index} fill={culturalChartColors[entry.country] || '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default CulturalParticipationChart;

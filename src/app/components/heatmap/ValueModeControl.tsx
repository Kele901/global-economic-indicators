'use client';

import type { ValueMode } from '../../utils/heatmap/values';
import { heatmapTheme } from './theme';

const MODES: { id: ValueMode; label: string }[] = [
  { id: 'level', label: 'Level' },
  { id: 'change', label: 'Change' },
  { id: 'pctChange', label: '% change' },
];

interface Props {
  mode: ValueMode;
  baseYear: number;
  years: number[];
  selectedYear: number | null;
  isDarkMode: boolean;
  onModeChange: (mode: ValueMode) => void;
  onBaseYearChange: (year: number) => void;
}

export default function ValueModeControl({ mode, baseYear, years, selectedYear, isDarkMode, onModeChange, onBaseYearChange }: Props) {
  const tc = heatmapTheme(isDarkMode);
  const baseOptions = years.filter(y => selectedYear === null || y < selectedYear);
  return (
    <div className="flex items-end gap-2">
      <div>
        <label className={`block text-xs uppercase tracking-wider mb-1 ${tc.textSec}`}>Show</label>
        <div className={`flex rounded-lg border overflow-hidden ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => onModeChange(m.id)}
              className={`px-3 py-2 text-sm transition-colors ${mode === m.id
                ? 'bg-blue-600 text-white'
                : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50')}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
      {mode !== 'level' && (
        <div className="min-w-[100px]">
          <label className={`block text-xs uppercase tracking-wider mb-1 ${tc.textSec}`}>Since</label>
          <select value={baseYear} onChange={e => onBaseYearChange(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-lg border text-sm ${tc.selectBg}`}>
            {baseOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

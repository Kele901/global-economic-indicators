export interface HeatmapTheme {
  bg: string;
  card: string;
  text: string;
  textSec: string;
  ocean: string;
  land: string;
  border: string;
  selectBg: string;
  chip: string;
  chipActive: string;
  subtle: string;
}

export function heatmapTheme(isDark: boolean): HeatmapTheme {
  return isDark ? {
    bg: 'bg-gray-900', card: 'bg-gray-800 border-gray-700', text: 'text-white',
    textSec: 'text-gray-400', ocean: '#0a1929', land: '#1e293b', border: '#374151',
    selectBg: 'bg-gray-700 text-white border-gray-600',
    chip: 'border-gray-600 text-gray-400 hover:border-gray-500',
    chipActive: 'border-blue-500 bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30',
    subtle: 'bg-gray-700/50',
  } : {
    bg: 'bg-gray-50', card: 'bg-white border-gray-200', text: 'text-gray-900',
    textSec: 'text-gray-500', ocean: '#e3f2fd', land: '#e5e7eb', border: '#d1d5db',
    selectBg: 'bg-white text-gray-900 border-gray-300',
    chip: 'border-gray-200 text-gray-600 hover:border-gray-300',
    chipActive: 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500/30',
    subtle: 'bg-gray-50',
  };
}

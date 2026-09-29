'use client';

// Single source of truth for chart chrome colours. Before this module every
// chart re-declared its own `const grid = isDarkMode ? '#374151' : '#e5e7eb'`
// pair and picked series colours by hand, which meant the colour-blind
// schemes in utils/colorSchemes.ts only reached the handful of charts that
// remembered to call getPalette(). useChartTheme resolves both at once:
// dark-mode chrome plus the reader's active palette.

import { useMemo } from 'react';
import { useColorScheme } from '../hooks/useColorScheme';
import { getPalette, type Palette } from './colorSchemes';

export interface ChartTheme {
  // Recharts chrome
  grid: string;
  axis: string;
  cursor: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  // Tailwind class fragments for the surrounding card
  cardCls: string;
  titleCls: string;
  subtitleCls: string;
  captionCls: string;
  // Colour
  palette: Palette;
  series: string[];
  // Convenience for the common up/down/flat decision
  tone: (value: number, invert?: boolean) => string;
  isDarkMode: boolean;
}

export function useChartTheme(isDarkMode: boolean): ChartTheme {
  const [scheme] = useColorScheme();

  return useMemo(() => {
    const palette = getPalette(scheme);
    const series = [
      palette.series1, palette.series2, palette.series3,
      palette.series4, palette.series5, palette.series6,
    ];

    return {
      grid: isDarkMode ? '#374151' : '#e5e7eb',
      axis: isDarkMode ? '#9ca3af' : '#6b7280',
      cursor: isDarkMode ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.10)',
      tooltipBg: isDarkMode ? '#1f2937' : '#ffffff',
      tooltipBorder: isDarkMode ? '#374151' : '#e5e7eb',
      tooltipText: isDarkMode ? '#f3f4f6' : '#111827',
      cardCls: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
      titleCls: isDarkMode ? 'text-white' : 'text-gray-900',
      subtitleCls: isDarkMode ? 'text-gray-400' : 'text-gray-600',
      captionCls: isDarkMode ? 'text-gray-400' : 'text-gray-600',
      palette,
      series,
      tone: (value: number, invert = false) => {
        if (value === 0) return palette.neutral;
        const good = invert ? value < 0 : value > 0;
        return good ? palette.positive : palette.negative;
      },
      isDarkMode,
    };
  }, [isDarkMode, scheme]);
}

// Non-hook escape hatch for the handful of places that need theme colours
// outside a component (chart config objects, download helpers, tests).
export function chartChrome(isDarkMode: boolean) {
  return {
    grid: isDarkMode ? '#374151' : '#e5e7eb',
    axis: isDarkMode ? '#9ca3af' : '#6b7280',
    tooltipBg: isDarkMode ? '#1f2937' : '#ffffff',
    tooltipBorder: isDarkMode ? '#374151' : '#e5e7eb',
  };
}

// Assigns a stable colour to each key in a series list, cycling the active
// palette. Stable means the same key keeps its colour when the list is
// re-sorted or filtered, which hand-rolled index lookups usually break.
export function seriesColorMap(keys: readonly string[], series: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  keys.forEach((key, i) => { map[key] = series[i % series.length]!; });
  return map;
}

// Shortens axis and end-of-line labels on narrow screens, where Recharts
// has no wrapping and long country names collide or push the plot inward.
export function truncateLabel(label: unknown, max: number): string {
  const s = String(label ?? '');
  return s.length > max ? `${s.slice(0, Math.max(1, max - 1)).trimEnd()}…` : s;
}

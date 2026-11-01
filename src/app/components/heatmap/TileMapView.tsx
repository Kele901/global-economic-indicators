'use client';

import { useState } from 'react';
import { COUNTRY_DISPLAY_NAMES, COUNTRY_ISO3, COUNTRY_KEYS, type CountryKey } from '../../utils/countryMappings';
import { HEX_COLUMNS, HEX_LAYOUT, HEX_ROWS, hexCenter, hexPoints } from '../../utils/heatmap/hexLayout';
import { getHeatmapColor, type HeatmapStyleId } from '../../utils/heatmap/palettes';
import type { CountryValues } from '../../utils/heatmap/values';
import { heatmapTheme } from './theme';

const R = 30;

interface Props {
  values: CountryValues;
  min: number;
  max: number;
  style: HeatmapStyleId;
  isDarkMode: boolean;
  selected: CountryKey | null;
  highlight: Set<CountryKey> | null;
  label: string;
  format: (v: number) => string;
  onSelect: (country: CountryKey) => void;
}

// Equal-area hexagons so small states (Singapore, Qatar, Israel) carry the
// same visual weight as large ones.
export default function TileMapView({ values, min, max, style, isDarkMode, selected, highlight, label, format, onSelect }: Props) {
  const tc = heatmapTheme(isDarkMode);
  const [hover, setHover] = useState<CountryKey | null>(null);
  const width = Math.sqrt(3) * R * (HEX_COLUMNS + 0.5);
  const height = R * 1.5 * (HEX_ROWS - 1) + R * 2;
  const hv = hover ? values[hover] : undefined;

  return (
    <div>
      <div className={`h-10 mb-1 text-sm flex items-center gap-2 ${tc.textSec}`} aria-live="polite">
        {hover
          ? <><span className={`font-semibold ${tc.text}`}>{COUNTRY_DISPLAY_NAMES[hover]}</span><span>{label}: {hv !== undefined ? format(hv) : 'no data'}</span></>
          : 'Hover a hexagon for its value; click for the full breakdown.'}
      </div>
      <svg viewBox={`0 0 ${width.toFixed(0)} ${height.toFixed(0)}`} className="w-full h-auto" role="img" aria-label={`Hexagon tile map of ${label}`}>
        <defs>
          <pattern id="tile-nodata" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill={tc.land} />
            <line x1="0" y1="0" x2="0" y2="6" stroke={tc.border} strokeWidth="2" />
          </pattern>
        </defs>
        {COUNTRY_KEYS.map(ck => {
          const [col, row] = HEX_LAYOUT[ck];
          const [cx, cy] = hexCenter(col, row, R);
          const v = values[ck];
          const fill = v !== undefined ? getHeatmapColor(style, v, min, max, isDarkMode) : 'url(#tile-nodata)';
          const dim = highlight && !highlight.has(ck);
          const isSel = selected === ck;
          return (
            <g key={ck} onMouseEnter={() => setHover(ck)} onMouseLeave={() => setHover(h => (h === ck ? null : h))}
              onClick={() => v !== undefined && onSelect(ck)} style={{ cursor: v !== undefined ? 'pointer' : 'default', opacity: dim ? 0.25 : 1, transition: 'opacity 300ms' }}>
              <polygon points={hexPoints(cx, cy, R - 1.5)} fill={fill}
                stroke={isSel || hover === ck ? '#f59e0b' : (isDarkMode ? '#111827' : '#ffffff')} strokeWidth={isSel ? 3 : hover === ck ? 2.5 : 1.5}
                style={{ transition: 'fill 800ms' }} />
              <text x={cx} y={cy - 2} textAnchor="middle" fontSize="11" fontWeight="700" fill={isDarkMode ? '#f9fafb' : '#111827'}
                style={{ paintOrder: 'stroke', stroke: isDarkMode ? 'rgba(17,24,39,0.6)' : 'rgba(255,255,255,0.7)', strokeWidth: 3, pointerEvents: 'none' }}>
                {COUNTRY_ISO3[ck]}
              </text>
              {v !== undefined && (
                <text x={cx} y={cy + 11} textAnchor="middle" fontSize="8.5" fill={isDarkMode ? '#e5e7eb' : '#1f2937'}
                  style={{ paintOrder: 'stroke', stroke: isDarkMode ? 'rgba(17,24,39,0.6)' : 'rgba(255,255,255,0.7)', strokeWidth: 2.5, pointerEvents: 'none' }}>
                  {format(v)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

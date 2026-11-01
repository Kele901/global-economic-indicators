import { COUNTRY_ISO2, type CountryKey } from '../countryMappings';

export type HeatmapStyleId = 'thermal' | 'viridis' | 'magma' | 'ocean' | 'diverging' | 'monochrome' | 'sunset' | 'forest';

export interface HeatmapStyle {
  id: HeatmapStyleId;
  label: string;
  preview: string[];
  interpolate: (t: number, isDark: boolean) => string;
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function lerpRGB(c1: [number, number, number], c2: [number, number, number], t: number): string {
  return `rgb(${Math.round(lerp(c1[0], c2[0], t))},${Math.round(lerp(c1[1], c2[1], t))},${Math.round(lerp(c1[2], c2[2], t))})`;
}

function multiStopRGB(stops: [number, number, number][], t: number): string {
  const n = stops.length - 1;
  const idx = Math.min(Math.floor(t * n), n - 1);
  const local = (t * n) - idx;
  return lerpRGB(stops[idx], stops[idx + 1], local);
}

export const HEATMAP_STYLES: HeatmapStyle[] = [
  { id: 'thermal', label: 'Thermal', preview: ['#3b82f6', '#a855f7', '#dc2626'],
    interpolate: (t) => multiStopRGB([[59,130,246],[168,85,247],[220,38,38]], t) },
  { id: 'viridis', label: 'Viridis', preview: ['#440154', '#21918c', '#fde725'],
    interpolate: (t) => multiStopRGB([[68,1,84],[59,82,139],[33,145,140],[94,201,98],[253,231,37]], t) },
  { id: 'magma', label: 'Magma', preview: ['#000004', '#b73779', '#fcfdbf'],
    interpolate: (t) => multiStopRGB([[0,0,4],[81,18,124],[183,55,121],[252,135,97],[252,253,191]], t) },
  { id: 'ocean', label: 'Ocean', preview: ['#0c1445', '#0ea5e9', '#67e8f9'],
    interpolate: (t, isDark) => multiStopRGB(isDark ? [[12,20,69],[6,78,140],[14,165,233],[103,232,249]] : [[8,47,73],[14,116,178],[56,189,248],[186,230,253]], t) },
  { id: 'diverging', label: 'Diverging', preview: ['#ef4444', '#fafafa', '#22c55e'],
    interpolate: (t, isDark) => { const mid = isDark ? [55,65,81] : [250,250,250]; return multiStopRGB([[239,68,68],[251,146,60],mid as [number,number,number],[74,222,128],[34,197,94]], t); } },
  { id: 'monochrome', label: 'Mono', preview: ['#1e293b', '#64748b', '#f1f5f9'],
    interpolate: (t, isDark) => multiStopRGB(isDark ? [[30,41,59],[71,85,105],[148,163,184],[226,232,240]] : [[15,23,42],[51,65,85],[100,116,139],[241,245,249]], t) },
  { id: 'sunset', label: 'Sunset', preview: ['#1e1b4b', '#e11d48', '#fbbf24'],
    interpolate: (t) => multiStopRGB([[30,27,75],[109,40,217],[225,29,72],[249,115,22],[251,191,36]], t) },
  { id: 'forest', label: 'Forest', preview: ['#14532d', '#22c55e', '#fef08a'],
    interpolate: (t) => multiStopRGB([[20,83,45],[22,101,52],[34,197,94],[163,230,53],[254,240,138]], t) },
];

export function isHeatmapStyle(v: string | undefined): v is HeatmapStyleId {
  return !!v && HEATMAP_STYLES.some(s => s.id === v);
}

export function getHeatmapColor(styleId: HeatmapStyleId, value: number, min: number, max: number, isDark: boolean): string {
  if (max === min) return isDark ? '#374151' : '#d1d5db';
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return HEATMAP_STYLES.find(s => s.id === styleId)!.interpolate(t, isDark);
}

export function getGradientCSS(styleId: HeatmapStyleId, isDark: boolean): string {
  const style = HEATMAP_STYLES.find(s => s.id === styleId)!;
  const colors = Array.from({ length: 11 }, (_, i) => style.interpolate(i / 10, isDark));
  return `linear-gradient(to right, ${colors.join(', ')})`;
}

// Metrics that benefit from diverging palette (can be negative)
export const DIVERGING_METRICS = new Set([
  'budgetBalance', 'currentAccount', 'populationGrowth', 'tradeBalance', 'fdi',
]);

export const CONTRAST_STYLE: Partial<Record<HeatmapStyleId, HeatmapStyleId>> = {
  thermal: 'ocean', ocean: 'thermal', viridis: 'magma', magma: 'viridis',
  diverging: 'sunset', sunset: 'diverging', monochrome: 'forest', forest: 'monochrome',
};

export function flagFor(country: CountryKey): string {
  const iso2 = COUNTRY_ISO2[country];
  if (!iso2) return '';
  return String.fromCodePoint(...iso2.toUpperCase().split('').map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Centroids (lon, lat) for bubble markers.
export const COUNTRY_CENTROIDS: Record<CountryKey, [number, number]> = {
  USA: [-98.5, 39.8], Canada: [-106.3, 56.1], UK: [-3.4, 55.4], France: [2.2, 46.2],
  Germany: [10.4, 51.2], Italy: [12.6, 41.9], Japan: [138.3, 36.2], Australia: [133.8, -25.3],
  Mexico: [-102.5, 23.6], SouthKorea: [127.8, 35.9], Spain: [-3.7, 40.5], Sweden: [18.6, 60.1],
  Switzerland: [8.2, 46.8], Turkey: [35.2, 38.9], Nigeria: [8.7, 9.1], China: [104.2, 35.9],
  Russia: [105.3, 61.5], Brazil: [-51.9, -14.2], Chile: [-71.5, -35.7], Argentina: [-63.6, -38.4],
  India: [78.9, 20.6], Norway: [8.5, 60.5], Netherlands: [5.3, 52.1], Portugal: [-8.2, 39.4],
  Belgium: [4.5, 50.5], Indonesia: [113.9, -0.8], SouthAfrica: [22.9, -30.6], Poland: [19.1, 51.9],
  SaudiArabia: [45.1, 23.9], Egypt: [30.8, 26.8], Israel: [34.9, 31.0], Singapore: [103.8, 1.4],
  Colombia: [-74.3, 4.6], Greece: [21.8, 39.1], Ukraine: [31.2, 48.4], Iran: [53.7, 32.4],
  UAE: [53.8, 23.4], Qatar: [51.2, 25.4], Morocco: [-7.1, 31.8], Kenya: [37.9, 0.0],
  Ethiopia: [40.5, 9.1], Ghana: [-1.0, 7.9], Vietnam: [108.3, 14.1], Thailand: [101.0, 15.9],
  Philippines: [121.8, 12.9], Pakistan: [69.3, 30.4], Bangladesh: [90.4, 23.7],
};

export const REGION_COLORS: Record<string, string> = {
  'North America': '#3b82f6',
  'Latin America': '#f59e0b',
  'Europe': '#8b5cf6',
  'Eurasia': '#ef4444',
  'Middle East & North Africa': '#06b6d4',
  'Sub-Saharan Africa': '#65a30d',
  'Asia-Pacific': '#ec4899',
};

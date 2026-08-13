import type { ColorScheme } from '../hooks/useColorScheme';

// Semantic palette used across ticker gradients, KPI cards, chart
// strokes and fills. The values below map the site's default red-
// green-heavy palette onto three colour-vision-safe alternatives.
//
// Sources for the alternative palettes:
//   - Wong (2011) "Color blindness" — Nature Methods (base 8-colour
//     palette safe for deuteranopia + protanopia).
//   - IBM Design colour-blind-safe palette (blue/orange/yellow spine).
//   - ColorBrewer 2.0 sequential ramps for the tritanopia scheme.
//
// Only the semantic slots that appear in Recharts strokes / KPI
// backgrounds are enumerated. Add new keys sparingly.
export type PaletteSlot =
  | 'positive'      // "good" / increase / green baseline
  | 'negative'      // "bad" / decrease / red baseline
  | 'neutral'       // slate / grey
  | 'accent'        // brand cyan / teal
  | 'warning'       // amber / orange
  | 'info'          // blue / indigo
  | 'series1'
  | 'series2'
  | 'series3'
  | 'series4'
  | 'series5'
  | 'series6';

export type Palette = Record<PaletteSlot, string>;

// Default palette matches the existing site colours already used in
// Tailwind config and Recharts calls. Keep these here as the single
// source of truth so future refactors have one place to touch.
const defaultPalette: Palette = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral:  '#64748b',
  accent:   '#0891b2',
  warning:  '#f59e0b',
  info:     '#3b82f6',
  series1:  '#3b82f6',
  series2:  '#f59e0b',
  series3:  '#10b981',
  series4:  '#ef4444',
  series5:  '#8b5cf6',
  series6:  '#ec4899',
};

// Deuteranopia + protanopia: avoid green/red confusion. Uses the
// Wong palette (blue-orange-yellow spine).
const deuteranopiaPalette: Palette = {
  positive: '#0072B2',
  negative: '#D55E00',
  neutral:  '#666666',
  accent:   '#56B4E9',
  warning:  '#E69F00',
  info:     '#009E73',
  series1:  '#0072B2',
  series2:  '#E69F00',
  series3:  '#56B4E9',
  series4:  '#D55E00',
  series5:  '#CC79A7',
  series6:  '#F0E442',
};

const protanopiaPalette: Palette = deuteranopiaPalette;

// Tritanopia: avoid blue/yellow confusion. Uses ColorBrewer purples
// and oranges as anchors.
const tritanopiaPalette: Palette = {
  positive: '#1B7837',
  negative: '#762A83',
  neutral:  '#525252',
  accent:   '#1F78B4',
  warning:  '#B35806',
  info:     '#5AAE61',
  series1:  '#1B7837',
  series2:  '#762A83',
  series3:  '#B35806',
  series4:  '#1F78B4',
  series5:  '#5AAE61',
  series6:  '#E7298A',
};

export const PALETTES: Record<ColorScheme, Palette> = {
  default:       defaultPalette,
  deuteranopia:  deuteranopiaPalette,
  protanopia:    protanopiaPalette,
  tritanopia:    tritanopiaPalette,
};

export function getPalette(scheme: ColorScheme): Palette {
  return PALETTES[scheme] ?? defaultPalette;
}

export const COLOR_SCHEME_LABELS: Record<ColorScheme, string> = {
  default:      'Default palette',
  deuteranopia: 'Deuteranopia-safe (green-blind)',
  protanopia:   'Protanopia-safe (red-blind)',
  tritanopia:   'Tritanopia-safe (blue-blind)',
};

export const COLOR_SCHEME_DESCRIPTIONS: Record<ColorScheme, string> = {
  default:      'Standard red/green semantic palette.',
  deuteranopia: 'Uses blue/orange (Wong 2011) so gains and losses stay distinguishable for the ~5% of viewers with green-weak vision.',
  protanopia:   'Same blue/orange scheme, tuned for the ~1% of viewers with red-weak vision.',
  tritanopia:   'Purple/green/orange (ColorBrewer) so charts stay legible for viewers with blue-weak vision.',
};

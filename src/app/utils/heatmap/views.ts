export type HeatmapView = 'choropleth' | 'bubble' | 'ranked' | 'comparison' | 'table' | 'scatter' | 'tiles' | 'quiz';

export const VIEW_MODE_CONFIG: { id: HeatmapView; label: string; icon: string; description: string }[] = [
  { id: 'choropleth', label: 'Choropleth', icon: 'M', description: 'Countries colored by value' },
  { id: 'bubble', label: 'Bubble Map', icon: 'B', description: 'Scaled circles on each country' },
  { id: 'ranked', label: 'Ranked Bars', icon: 'R', description: 'Animated ranking that races through the years' },
  { id: 'comparison', label: 'Compare', icon: 'C', description: 'Two metrics side by side or on one bivariate map' },
  { id: 'table', label: 'Table', icon: 'T', description: 'Sortable table with multiple metrics' },
  { id: 'scatter', label: 'Scatter', icon: 'S', description: 'Plot two metrics against each other' },
  { id: 'tiles', label: 'Tile Map', icon: 'H', description: 'Every country as an equal-sized hexagon' },
  { id: 'quiz', label: 'Quiz', icon: 'Q', description: 'Test your knowledge of the data' },
];

export const MAP_VIEWS = new Set<HeatmapView>(['choropleth', 'bubble', 'comparison']);

export function isHeatmapView(v: string | undefined): v is HeatmapView {
  return !!v && VIEW_MODE_CONFIG.some(c => c.id === v);
}

import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const metadata: Metadata = withOgImage('/global-heatmap', {
  title: 'Global Heatmap | Global Economic Indicators',
  description:
    'Choropleth heatmap across 60+ economic, defense, climate and cultural indicators. Toggle categories and compare countries at a glance.',
  keywords:
    'global heatmap, choropleth, world map, economic indicators, GDP, inflation, unemployment, cultural capital, defense spending, climate emissions',
  alternates: { canonical: '/global-heatmap' },
  openGraph: {
    type: 'website',
    title: 'Global Heatmap — 60+ indicators on one world map',
    description:
      'One-click category toggles across economic, defense, climate, and cultural data.',
  },
});

export default function GlobalHeatmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

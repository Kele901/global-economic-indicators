import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const metadata: Metadata = withOgImage('/economic-gravity', {
  title: 'Economic Gravity Model | Global Economic Indicators',
  description: 'Visualize bilateral trade relationships using the economic gravity model. See how GDP size and geographic distance predict trade flows between nations worldwide.',
});

export default function EconomicGravityLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const metadata: Metadata = withOgImage('/trading-places', {
  title: 'Trading Places | Global Economic Indicators',
  description: 'Analyze global trade flows, bilateral trade balances, export composition by sector, and trade openness. Compare how nations participate in international commerce.',
});

export default function TradingPlacesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

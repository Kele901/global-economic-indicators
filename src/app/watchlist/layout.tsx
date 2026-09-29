import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const metadata: Metadata = withOgImage('/watchlist', {
  title: 'Watchlist | Global Economic Indicators',
  description:
    'Pin countries and indicators to a personal watchlist to track changes across sessions. Local-only, no account required.',
  keywords:
    'watchlist, saved indicators, tracked countries, personalisation, dashboard alerts',
  alternates: { canonical: '/watchlist' },
  openGraph: {
    type: 'website',
    title: 'Watchlist — pin the countries and indicators that matter',
    description:
      'A personal, browser-local view across your chosen countries and metrics.',
  },
});

export default function WatchlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

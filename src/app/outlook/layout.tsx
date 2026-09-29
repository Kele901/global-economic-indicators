import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const metadata: Metadata = withOgImage('/outlook', {
  title: 'Economic Outlook | Global Economic Indicators',
  description:
    'Consensus and IMF-WEO growth, inflation and current-account projections across major economies with historical accuracy scoring.',
  keywords:
    'economic outlook, growth forecast, IMF WEO, consensus forecast, inflation forecast, current account, projection accuracy',
  alternates: { canonical: '/outlook' },
  openGraph: {
    type: 'website',
    title: 'Economic Outlook — forecasts vs realised outcomes',
    description:
      'IMF WEO projections, consensus forecasts, and how well each track record has held up.',
  },
});

export default function OutlookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

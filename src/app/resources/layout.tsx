import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const revalidate = 3600;

export const metadata: Metadata = withOgImage('/resources', {
  title: 'Resource Atlas | Global Economic Indicators',
  description:
    'Interactive scrollytelling on oil, gas, metals and agricultural commodities. Live FRED / EIA prices, historical super-cycles, and country-level reserves and production.',
  keywords:
    'oil prices, natural gas, copper, gold, wheat, commodities, EIA crude reserves, FRED commodity data, resource curse, petrostates',
  alternates: { canonical: '/resources' },
  openGraph: {
    type: 'article',
    title: 'Resource Atlas — commodities, reserves, super-cycles',
    description:
      'Live commodity prices with 30-day sparklines, EIA reserves and production, and curated super-cycle era annotations.',
  },
});

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

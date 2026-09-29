import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const metadata: Metadata = withOgImage('/reports', {
  title: 'Reports | Global Economic Indicators',
  description:
    'Generate custom, printable economic reports across the countries and indicators you care about. Export as PDF or share as a link.',
  keywords:
    'economic reports, custom report, PDF export, country brief, macro report, tearsheet',
  alternates: { canonical: '/reports' },
  openGraph: {
    type: 'website',
    title: 'Reports — build a custom macro tearsheet',
    description:
      'Assemble country- and indicator-scoped reports with PDF export.',
  },
});

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

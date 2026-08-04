import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Sources | Global Economic Indicators',
  description:
    'Transparency page listing every dataset the site consumes: provider, refresh cadence, live-vs-snapshot status, series IDs, and source URLs.',
  keywords:
    'data sources, data provenance, World Bank, FRED, OECD, SIPRI, NASA GISTEMP, BIS, EIA, Frankfurter API, methodology transparency',
  alternates: { canonical: '/data-sources' },
  openGraph: {
    type: 'website',
    title: 'Data Sources — full transparency registry',
    description:
      'Search, filter and inspect every live or curated dataset powering the dashboards and epic ledgers.',
  },
};

export default function DataSourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

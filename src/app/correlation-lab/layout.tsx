import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Correlation Lab | Global Economic Indicators',
  description: 'Pick any two economic metrics, lag one by N years, and see the Pearson correlation across every country in our dataset. Interactive scatter and top-10 matches included.',
  keywords: 'correlation, lagged correlation, Pearson, economic metrics, cross-country, scatter',
  alternates: { canonical: '/correlation-lab' },
};

export default function CorrelationLabLayout({ children }: { children: React.ReactNode }) {
  return children;
}

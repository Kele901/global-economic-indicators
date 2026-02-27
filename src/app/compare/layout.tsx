import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Country Comparison | Global Economic Indicators',
  description: 'Compare key economic indicators across 30+ major economies. Select countries and metrics for side-by-side analysis using data from the World Bank, IMF, OECD, and more.',
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}

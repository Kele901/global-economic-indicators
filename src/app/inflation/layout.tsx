import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inflation Tracker | Global Economic Indicators',
  description: 'Track consumer price inflation across 30+ economies with historical data. Compare inflation rates, analyze trends, and understand how price changes affect global purchasing power.',
};

export default function InflationLayout({ children }: { children: React.ReactNode }) {
  return children;
}

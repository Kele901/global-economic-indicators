import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inflation Calculator | Global Economic Indicators',
  description: 'Calculate how inflation has affected purchasing power over time. Enter an amount and time period to see the real value of money across different economies and years.',
};

export default function InflationCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const metadata: Metadata = withOgImage('/currency-hierarchy', {
  title: 'Currency Hierarchy | Global Economic Indicators',
  description: 'Analyze global currency strength, central bank policy rates, reserve currency composition, real effective exchange rates, and safe-haven indicators across major economies.',
});

export default function CurrencyHierarchyLayout({ children }: { children: React.ReactNode }) {
  return children;
}

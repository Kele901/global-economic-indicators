import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Import the client component dynamically to prevent server-side rendering
const CurrencyHierarchyVisualization = dynamic(
  () => import('./CurrencyHierarchyVisualization').then(mod => mod.default),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'Currency Hierarchy | Global Economic Indicators',
  description: 'Interactive visualization of global currency relationships and exchange rates',
  keywords: 'currency hierarchy, exchange rates, forex, global currencies, USD, EUR, JPY, GBP',
};

export default function CurrencyHierarchyPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <CurrencyHierarchyVisualization />
    </div>
  );
} 
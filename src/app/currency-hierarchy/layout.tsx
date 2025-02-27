import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Currency Hierarchy',
  description: 'Interactive visualization of global currency relationships and exchange rates',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function CurrencyHierarchyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Methodology | Global Economic Indicators',
  description: 'How Global Economic Indicators collects, normalizes, and presents economic data. Learn about our API sources, caching strategy, data normalization, composite scores, and limitations.',
};

export default function MethodologyLayout({ children }: { children: React.ReactNode }) {
  return children;
}

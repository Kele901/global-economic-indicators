import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const metadata: Metadata = withOgImage('/disclaimer', {
  title: 'Disclaimer | Global Economic Indicators',
  description: 'Disclaimer for Global Economic Indicators. Important information about data accuracy, limitations, and the educational nature of our economic data platform.',
});

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return children;
}

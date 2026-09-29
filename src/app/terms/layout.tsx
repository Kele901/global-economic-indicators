import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const metadata: Metadata = withOgImage('/terms', {
  title: 'Terms of Service | Global Economic Indicators',
  description: 'Terms of Service for Global Economic Indicators. Understand the conditions for using our platform, data disclaimers, intellectual property rights, and limitations of liability.',
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

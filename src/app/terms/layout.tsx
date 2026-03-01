import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Global Economic Indicators',
  description: 'Terms of Service for Global Economic Indicators. Understand the conditions for using our platform, data disclaimers, intellectual property rights, and limitations of liability.',
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

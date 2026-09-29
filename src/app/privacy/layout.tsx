import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const metadata: Metadata = withOgImage('/privacy', {
  title: 'Privacy Policy | Global Economic Indicators',
  description: 'Privacy Policy for Global Economic Indicators. Learn how we collect, use, and protect your data, including our use of Google AdSense, cookies, and third-party analytics.',
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}

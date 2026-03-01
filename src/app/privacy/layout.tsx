import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Global Economic Indicators',
  description: 'Privacy Policy for Global Economic Indicators. Learn how we collect, use, and protect your data, including our use of Google AdSense, cookies, and third-party analytics.',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}

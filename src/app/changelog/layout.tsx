import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog | Global Economic Indicators',
  description: 'What changed on globaleconindicators.info and when. New ledgers, dataset refreshes, performance and accessibility upgrades.',
  keywords: 'changelog, release notes, updates, global economic indicators',
  alternates: { canonical: '/changelog' },
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children;
}

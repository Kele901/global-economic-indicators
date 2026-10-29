import type { Metadata } from 'next';
import { withOgImage } from '../../lib/og';

export const metadata: Metadata = withOgImage('/politics-ledger/match', {
  title: 'Political Match Quiz: Which Parties Are Closest to You? | Global Economic Indicators',
  description:
    'Answer twelve statements on the economy and society, see where you sit on the ideological map, and find your nearest parties and governments across 47 countries.',
  keywords: 'political quiz, political compass, which party am I, political match, ideology test, left right quiz',
  alternates: { canonical: '/politics-ledger/match' },
  openGraph: {
    type: 'website',
    title: 'Find your political match across 47 countries',
    description: 'Twelve statements, one ideological map, and the parties around the world closest to your views.',
  },
}, { section: 'Politics Ledger \u00b7 Quiz', metric: 'Which parties are closest to you?' });

export default function PoliticalMatchLayout({ children }: { children: React.ReactNode }) {
  return children;
}

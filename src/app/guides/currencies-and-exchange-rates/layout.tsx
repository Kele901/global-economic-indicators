import { guideMetadata } from '../../lib/guideMetadata';
import GuideJsonLd from '../../components/GuideJsonLd';

export const metadata = guideMetadata('currencies-and-exchange-rates');

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GuideJsonLd slug="currencies-and-exchange-rates" />
      {children}
    </>
  );
}

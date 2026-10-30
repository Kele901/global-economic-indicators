import { guideMetadata } from '../../lib/guideMetadata';
import GuideJsonLd from '../../components/GuideJsonLd';

export const metadata = guideMetadata('trade-networks');

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GuideJsonLd slug="trade-networks" />
      {children}
    </>
  );
}

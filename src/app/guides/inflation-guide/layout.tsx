import { guideMetadata } from '../../lib/guideMetadata';
import GuideJsonLd from '../../components/GuideJsonLd';

export const metadata = guideMetadata('inflation-guide');

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GuideJsonLd slug="inflation-guide" />
      {children}
    </>
  );
}

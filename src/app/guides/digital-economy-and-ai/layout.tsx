import { guideMetadata } from '../../lib/guideMetadata';
import GuideJsonLd from '../../components/GuideJsonLd';

export const metadata = guideMetadata('digital-economy-and-ai');

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GuideJsonLd slug="digital-economy-and-ai" />
      {children}
    </>
  );
}

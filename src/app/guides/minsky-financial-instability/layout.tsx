import { guideMetadata } from '../../lib/guideMetadata';
import GuideJsonLd from '../../components/GuideJsonLd';

export const metadata = guideMetadata('minsky-financial-instability');

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GuideJsonLd slug="minsky-financial-instability" />
      {children}
    </>
  );
}

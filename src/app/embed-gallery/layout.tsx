import type { Metadata } from 'next';
import { withOgImage } from '../lib/og';

export const metadata: Metadata = withOgImage('/embed-gallery', {
  title: 'Embed Gallery | Global Economic Indicators',
  description: 'Six most-embedded chart types with live previews and copy-ready iframe code. Drop them into any blog, newsroom, or dashboard.',
  keywords: 'chart embed, iframe, embed gallery, world bank chart, economic data widget',
  alternates: { canonical: '/embed-gallery' },
});

export default function EmbedGalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}

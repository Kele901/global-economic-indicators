import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Embed Builder | Global Economic Indicators',
  description:
    'Configure a lightweight embed of any chart or metric, then copy an iframe snippet you can drop into blogs, wikis or Notion.',
  keywords:
    'embed builder, iframe embed, chart embed, blog widget, notion embed, dashboard sharing',
  alternates: { canonical: '/embed-builder' },
  openGraph: {
    type: 'website',
    title: 'Embed Builder — configure a chart, copy an iframe',
    description:
      'Pick a chart, pick your countries, copy the snippet.',
  },
};

export default function EmbedBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Global Economic Indicators',
  description: 'Get in touch with Global Economic Indicators. Send us questions, feedback, or feature requests. Browse frequently asked questions about our data sources, update frequency, and methodology.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

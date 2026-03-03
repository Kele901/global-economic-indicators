import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Economic Chart Widget | Global Economic Indicators',
  robots: 'noindex',
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-transparent">
      {children}
      <div className="text-center py-1">
        <a
          href="https://global-economic-indicators.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-gray-400 hover:text-blue-500 transition-colors"
        >
          Powered by Global Economic Indicators
        </a>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Economic Chart Widget | Global Economic Indicators',
  robots: 'noindex',
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body className={`${inter.className} bg-transparent`}>
        <div className="w-full">
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
      </body>
    </html>
  );
}

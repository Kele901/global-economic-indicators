import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import Navbar from './components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Global Economic Indicators Dashboard | World Bank Data Analysis',
  description: 'Comprehensive analysis of global economic indicators including interest rates, employment, GDP, inflation, and debt across major economies. Data sourced from the World Bank.',
  keywords: 'economic indicators, world bank data, global economy, interest rates, employment rates, GDP growth, inflation rates, economic analysis, financial data, economic trends',
  authors: [{ name: 'Global Economic Indicators' }],
  creator: 'Global Economic Indicators',
  publisher: 'Global Economic Indicators',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Global Economic Indicators Dashboard',
    description: 'Comprehensive analysis of global economic indicators from the World Bank',
    siteName: 'Global Economic Indicators',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="google-adsense-account" content="ca-pub-1726759813423594" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1726759813423594"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          <Navbar />

          <main className="flex-grow">
            {children}
          </main>

          <footer className="bg-gray-50 dark:bg-gray-800 mt-8 sm:mt-12">
            <div className="max-w-4xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">About Us</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    We provide comprehensive economic data analysis and visualization, 
                    helping users understand global economic trends through reliable 
                    World Bank data.
                  </p>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Data Sources</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    All economic data is sourced from the World Bank's official databases, 
                    ensuring accuracy and reliability in our analysis.
                  </p>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Legal</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    © {new Date().getFullYear()} Global Economic Indicators.
                    This site uses cookies for analytics and personalized content.
                    By using this site, you agree to our privacy policy.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
} 
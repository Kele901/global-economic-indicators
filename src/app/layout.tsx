import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import Navbar from './components/Navbar';
import ThemeProvider from './components/ThemeProvider';
import CookieConsent from './components/CookieConsent';

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
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-grow">
              {children}
            </main>

            <footer className="bg-gray-50 dark:bg-gray-800 mt-8 sm:mt-12 transition-colors duration-200">
              <div className="max-w-5xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white transition-colors duration-200">About Us</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-200 mb-3">
                      Free, open-access platform providing comprehensive economic data analysis
                      and visualization across 30+ global economies.
                    </p>
                    <div className="flex flex-col gap-1.5 text-xs sm:text-sm">
                      <a href="/about" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">About</a>
                      <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">Contact</a>
                      <a href="/methodology" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">Methodology</a>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white transition-colors duration-200">Guides</h3>
                    <div className="flex flex-col gap-1.5 text-xs sm:text-sm">
                      <a href="/guides/reading-economic-data" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">How to Read Economic Data</a>
                      <a href="/guides/understanding-interest-rates" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">Understanding Interest Rates</a>
                      <a href="/guides/inflation-guide" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">Understanding Inflation</a>
                      <a href="/guides/how-central-banks-work" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">How Central Banks Work</a>
                      <a href="/guides/glossary" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">Glossary</a>
                      <a href="/guides/reading-economic-data" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 font-medium mt-1">View All Guides &rarr;</a>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white transition-colors duration-200">Data Sources</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-200">
                      Data sourced from the World Bank, IMF, FRED, OECD, WIPO, ITU,
                      Eurostat, and the Bank for International Settlements.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white transition-colors duration-200">Legal</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-200 mb-3">
                      © {new Date().getFullYear()} Global Economic Indicators.
                      This site uses cookies for analytics and personalized content.
                    </p>
                    <div className="flex flex-col gap-1.5 text-xs sm:text-sm">
                      <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">Privacy Policy</a>
                      <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">Terms of Service</a>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
} 
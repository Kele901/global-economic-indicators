import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import ThemeProvider from './components/ThemeProvider';
import CookieConsent from './components/CookieConsent';
import AdSenseLoader from './components/AdSenseLoader';
import StatusWidget from './components/StatusWidget';
import CommandPalette from './components/CommandPalette';
import RouteTracker from './components/RouteTracker';
import CitationDropdown from './components/CitationDropdown';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from './lib/site';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Global Economic Indicators Dashboard | World Bank Data Analysis',
  description: SITE_DESCRIPTION,
  keywords: 'economic indicators, world bank data, global economy, interest rates, employment rates, GDP growth, inflation rates, economic analysis, financial data, economic trends',
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: 'index, follow',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: 'Global Economic Indicators Dashboard',
    description: 'Comprehensive analysis of global economic indicators from the World Bank',
    siteName: SITE_NAME,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Economic Indicators Dashboard',
    description: 'Comprehensive analysis of global economic indicators from the World Bank',
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
        {/*
          Theme, applied before the browser paints.

          Every page holds `isDarkMode` in localStorage via useLocalStorage,
          which cannot read storage until the React tree mounts. Without this
          script a returning dark-mode reader gets one white frame on every
          navigation. Kept as a raw inline script rather than next/script so
          it is guaranteed to run before first paint, and wrapped in try/catch
          because storage access throws outright in some privacy modes.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('isDarkMode');var d=s==='true';var r=document.documentElement;r.setAttribute('data-theme',d?'dark':'light');if(d){r.classList.add('dark')}}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});`,
          }}
        />
        <meta name="google-adsense-account" content="ca-pub-1726759813423594" />
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
                      <a href="/glossary" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">Glossary</a>
                      <a href="/guides" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200 font-medium mt-1">View All Guides &rarr;</a>
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
                      Essential cookies remember preferences. Advertising cookies load only if you accept them.
                    </p>
                    <div className="flex flex-col gap-1.5 text-xs sm:text-sm">
                      <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">Privacy Policy</a>
                      <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">Terms of Service</a>
                      <a href="/disclaimer" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">Disclaimer</a>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 flex-wrap">
                  <CitationDropdown />
                  <StatusWidget />
                </div>
                <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  Site Created by Kelechi Okoye-Ahaneku
                </div>
              </div>
            </footer>
          </div>
          <CookieConsent />
          <AdSenseLoader />
          <CommandPalette />
          <RouteTracker />
        </ThemeProvider>
      </body>
    </html>
  );
} 
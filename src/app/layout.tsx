import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: '%s | Global Economic Indicators',
    default: 'Global Economic Indicators',
  },
  description: 'Interactive visualization of global economic indicators and currency relationships',
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
          <header className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="max-w-4xl mx-auto py-4 px-4">
              <nav className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-lg font-semibold">Global Economic Indicators</div>
                <div className="flex items-center gap-6">
                  <a 
                    href="/" 
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Dashboard
                  </a>
                  <a 
                    href="/currency-hierarchy" 
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Currency Hierarchy
                  </a>
                  <a 
                    href="https://github.com/Kele901/global-economic-indicators" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View on GitHub
                  </a>
                </div>
              </nav>
            </div>
          </header>

          <main className="flex-grow">
            {children}
          </main>

          <footer className="bg-gray-50 dark:bg-gray-800 mt-12">
            <div className="max-w-4xl mx-auto py-8 px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">About Us</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We provide comprehensive economic data analysis and visualization, 
                    helping users understand global economic trends through reliable 
                    World Bank data.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Data Sources</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All economic data is sourced from the World Bank's official databases, 
                    ensuring accuracy and reliability in our analysis.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Legal</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
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
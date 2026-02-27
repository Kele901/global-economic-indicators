'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function AboutPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">About Global Economic Indicators</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="mb-4 text-base leading-relaxed">
              Global Economic Indicators is a free, open-access platform dedicated to making complex economic
              data accessible and understandable for everyone. We believe that informed citizens, students,
              researchers, and professionals should be able to explore and compare economic performance across
              nations without paywalls or complicated interfaces.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Our goal is to bridge the gap between raw institutional datasets and meaningful insight. By
              combining data from the world&apos;s most trusted economic institutions with interactive
              visualizations, we empower users to discover trends, compare countries, and develop a deeper
              understanding of the global economy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
            <p className="mb-4 text-base leading-relaxed">
              The platform provides a comprehensive suite of tools and dashboards that cover the full
              spectrum of macroeconomic analysis. Each feature is designed to present data in a clear,
              interactive format that supports both casual exploration and serious research.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {[
                {
                  title: 'Economic Dashboard',
                  desc: 'Track GDP growth, unemployment, inflation, interest rates, government debt, and trade balances across 30+ countries with historical data from 1990 to present.'
                },
                {
                  title: 'Currency Hierarchy',
                  desc: 'Analyze currency strength, central bank policy rates, reserve currency composition, real effective exchange rates, and safe-haven indicators across global markets.'
                },
                {
                  title: 'Economic Gravity Model',
                  desc: 'Visualize bilateral trade relationships between nations using the economic gravity model, showing how GDP and distance influence trade flows.'
                },
                {
                  title: 'Economic Cycles',
                  desc: 'Explore historical business cycles, debt super-cycles, and financial crises through interactive timelines, maps, and comparison tools.'
                },
                {
                  title: 'Technology & Innovation',
                  desc: 'Compare R&D spending, patent applications, high-tech exports, AI development, venture capital, and digital economy metrics across countries.'
                },
                {
                  title: 'Trading Places',
                  desc: 'Analyze global trade flows, bilateral trade balances, export composition, and trade openness with detailed breakdowns by sector and partner.'
                },
                {
                  title: 'Country Comparison',
                  desc: 'Select any combination of countries and compare them side-by-side across dozens of economic metrics with interactive charts and data exports.'
                },
                {
                  title: 'Inflation Tools',
                  desc: 'Track consumer price inflation across economies and use our inflation calculator to understand the real purchasing power impact over time.'
                }
              ].map(item => (
                <div
                  key={item.title}
                  className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                >
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Data Sources</h2>
            <p className="mb-4 text-base leading-relaxed">
              Accuracy and reliability are foundational to our platform. We source data exclusively from
              internationally recognized institutions that maintain rigorous standards for data collection,
              verification, and publication. Below are the primary sources we draw from and how each
              contributes to the platform.
            </p>
            <div className="space-y-4">
              {[
                {
                  name: 'World Bank',
                  desc: 'The World Development Indicators database is our primary source for cross-country economic comparisons. It provides standardized data on GDP, trade, employment, education, technology, and infrastructure for over 200 countries, with coverage spanning decades.'
                },
                {
                  name: 'Federal Reserve Economic Data (FRED)',
                  desc: 'Maintained by the Federal Reserve Bank of St. Louis, FRED provides detailed U.S. economic data including interest rates, money supply, employment figures, and technology indicators. We use FRED to supplement World Bank data with high-frequency U.S. metrics.'
                },
                {
                  name: 'International Monetary Fund (IMF)',
                  desc: 'The IMF provides data on government finances, balance of payments, exchange rates, and debt statistics. Their World Economic Outlook projections help contextualize historical trends.'
                },
                {
                  name: 'OECD',
                  desc: 'The Organisation for Economic Co-operation and Development supplies data on education outcomes, STEM graduates, labor market statistics, and R&D personnel for its 38 member countries and partner economies.'
                },
                {
                  name: 'WIPO',
                  desc: 'The World Intellectual Property Organization provides global patent and trademark filing statistics, which we use to track innovation activity and intellectual property trends across nations.'
                },
                {
                  name: 'ITU',
                  desc: 'The International Telecommunication Union supplies data on internet penetration, mobile subscriptions, and broadband access, forming the foundation of our digital infrastructure metrics.'
                },
                {
                  name: 'Eurostat',
                  desc: 'The statistical office of the European Union provides detailed data on EU member states, including R&D expenditure, high-tech trade, and digital economy indicators with granular breakdowns.'
                },
                {
                  name: 'Bank for International Settlements (BIS)',
                  desc: 'The BIS provides central bank policy rate data and international banking statistics that inform our currency hierarchy and monetary policy analysis.'
                }
              ].map(source => (
                <div
                  key={source.name}
                  className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                >
                  <h3 className="font-semibold mb-1">{source.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {source.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <p className="mb-4 text-base leading-relaxed">
              When you visit a page on Global Economic Indicators, the application fetches data from the
              relevant APIs in real time. To provide a fast experience and reduce load on upstream services,
              we cache responses both on the server (via Next.js API routes) and on the client (via local
              storage with a 24-hour time-to-live). This means your first visit fetches fresh data, while
              subsequent visits within the same day load almost instantly.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Where live API data is unavailable or delayed, we supplement with curated fallback datasets
              compiled from official publications and reports. These fallback values are clearly sourced and
              updated periodically to reflect the latest available figures. Our technology page, for example,
              combines live World Bank data with static datasets for venture capital funding, AI patent
              filings, and startup ecosystem metrics.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              All charts and visualizations are rendered client-side using Recharts, an open-source charting
              library built on React and D3. Maps use react-simple-maps for geographic visualizations. The
              application is built with Next.js and deployed on Vercel for global performance and reliability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Who This Is For</h2>
            <p className="mb-4 text-base leading-relaxed">
              Global Economic Indicators serves a diverse audience. Economics students use the platform to
              supplement their coursework with real data. Journalists and analysts reference our charts for
              quick comparisons. Policy researchers explore long-term trends across countries.
              Individual investors and business professionals use the data to understand the macroeconomic
              environment in markets they operate in. Educators use our guides to introduce economic
              concepts with real-world context.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Whether you are comparing R&amp;D spending between nations, tracking inflation trends over
              two decades, or exploring how currency strength correlates with trade balances, our platform
              is designed to make that exploration intuitive and informative.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Open and Free</h2>
            <p className="mb-4 text-base leading-relaxed">
              The platform is entirely free to use. There are no subscriptions, no premium tiers, and no
              registration required. We believe economic literacy is a public good, and access to quality
              data should not be restricted by cost. The site is supported by non-intrusive advertising
              to cover hosting and development costs.
            </p>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Get Started</h2>
            <p className="mb-3 leading-relaxed">
              Ready to explore? Here are some good starting points:
            </p>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">Dashboard</a> &mdash; Overview of key indicators across all tracked economies
              </li>
              <li>
                <a href="/compare" className="text-blue-600 dark:text-blue-400 hover:underline">Compare Countries</a> &mdash; Side-by-side analysis of any combination of nations
              </li>
              <li>
                <a href="/technology" className="text-blue-600 dark:text-blue-400 hover:underline">Technology &amp; Innovation</a> &mdash; R&amp;D, patents, AI, and digital economy metrics
              </li>
              <li>
                <a href="/guides/reading-economic-data" className="text-blue-600 dark:text-blue-400 hover:underline">How to Read Economic Data</a> &mdash; A beginner-friendly guide to interpreting charts and indicators
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

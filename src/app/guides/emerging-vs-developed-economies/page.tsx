'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function EmergingDevelopedGuide() {
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
        <div className="mb-4">
          <a href="/guides/reading-economic-data" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">&larr; All Guides</a>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Emerging vs. Developed Economies</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          How economists classify countries, why the distinction matters for data interpretation, and what to watch when comparing across income groups.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">The Classification</h2>
            <p className="mb-4 text-base leading-relaxed">
              The world&apos;s economies are broadly divided into developed (advanced) and emerging
              (developing) markets, though the exact criteria vary by institution. The IMF, World
              Bank, and MSCI each use different classification systems. Generally, developed
              economies have high per-capita incomes, mature financial markets, strong institutions,
              and diversified economic structures. Emerging markets have lower incomes but faster
              growth, less developed financial systems, and often greater dependence on commodity
              exports or manufacturing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Key Differences</h2>
            <div className="space-y-4">
              {[
                { name: 'Growth Rates', desc: 'Emerging markets typically grow at 4-7% annually versus 1-3% for developed economies. This growth premium reflects catch-up dynamics: it is easier to grow by adopting existing technologies and practices than by innovating at the frontier.' },
                { name: 'Inflation', desc: 'Emerging markets generally experience higher and more volatile inflation due to less credible central banks, supply chain inefficiencies, and greater exposure to food and energy price shocks.' },
                { name: 'Currency Risk', desc: 'Emerging market currencies are more volatile and prone to sudden depreciation during global risk-off episodes. Many emerging markets borrow in US dollars, creating additional vulnerability when their currency weakens.' },
                { name: 'Data Quality', desc: 'Developed economies have comprehensive, timely, and reliable statistical agencies. Emerging market data can be less frequent, subject to larger revisions, and sometimes politically influenced. Data gaps are more common.' },
                { name: 'Institutional Depth', desc: 'Rule of law, property rights, regulatory transparency, and central bank independence tend to be stronger in developed economies. These institutional factors affect everything from investor confidence to inflation management.' },
                { name: 'Demographics', desc: 'Many emerging markets have younger, growing populations that provide a workforce dividend. Most developed economies face aging populations and shrinking workforces, which constrain long-term growth.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Middle-Income Trap</h2>
            <p className="mb-4 text-base leading-relaxed">
              Many countries grow rapidly at low income levels by adopting existing technology
              and moving labor from agriculture to manufacturing, but then stall at middle-income
              levels. This &ldquo;middle-income trap&rdquo; affects countries that become too
              expensive for low-cost manufacturing but have not yet developed the innovation
              capacity to compete with advanced economies. Brazil, Mexico, and South Africa
              have struggled with this dynamic for decades. South Korea and Taiwan are notable
              success stories that broke through to high-income status.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Comparing Across Income Groups</h2>
            <p className="mb-4 text-base leading-relaxed">
              When using our platform to compare emerging and developed economies, keep several
              caveats in mind. Growth rates are not directly comparable because a developing
              economy starting from a low base will naturally post higher percentage growth.
              Debt-to-GDP ratios have different sustainability thresholds for countries that
              borrow in their own currency versus foreign currencies. Technology metrics like
              R&amp;D spending and patent filings reflect different stages of development
              rather than effort levels.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Our <a href="/compare" className="text-blue-600 dark:text-blue-400 hover:underline">Compare Countries</a> tool
              is particularly useful for examining these differences, allowing you to place
              any combination of developed and emerging economies side by side across dozens
              of indicators.
            </p>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore More</h2>
            <ul className="space-y-2">
              <li><a href="/compare" className="text-blue-600 dark:text-blue-400 hover:underline">Compare Countries</a> &mdash; Side-by-side cross-country analysis</li>
              <li><a href="/guides/gdp-and-national-accounts" className="text-blue-600 dark:text-blue-400 hover:underline">GDP and National Accounts</a> &mdash; Understanding economic output measures</li>
              <li><a href="/guides/currencies-and-exchange-rates" className="text-blue-600 dark:text-blue-400 hover:underline">Currencies and Exchange Rates</a> &mdash; Currency risk in emerging markets</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

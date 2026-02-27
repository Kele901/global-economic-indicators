'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function GDPGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">GDP and National Accounts</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          What GDP measures, why it matters, and how to interpret the different ways economic output is reported.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Is GDP?</h2>
            <p className="mb-4 text-base leading-relaxed">
              Gross Domestic Product is the total monetary value of all finished goods and services
              produced within a country&apos;s borders in a specific time period, usually a year
              or quarter. It is the single most widely used measure of an economy&apos;s size and
              performance. When news reports say &ldquo;the economy grew by 2.5 percent,&rdquo;
              they are referring to GDP growth.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              GDP can be calculated three ways, all of which should produce the same result: the
              expenditure approach (what is spent), the income approach (what is earned), and the
              production approach (what is produced). The expenditure approach is most common:
              GDP equals consumption plus investment plus government spending plus net exports.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Nominal vs. Real GDP</h2>
            <p className="mb-4 text-base leading-relaxed">
              Nominal GDP measures output at current market prices. If all prices doubled but
              the same amount of goods were produced, nominal GDP would double even though the
              real economy had not grown at all. Real GDP adjusts for inflation by measuring
              output at constant prices from a base year, providing a clearer picture of actual
              economic growth.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              The difference between nominal and real GDP growth is captured by the GDP deflator,
              a broad measure of price changes across the entire economy. When you see GDP growth
              figures on our platform, they typically represent real GDP growth, which strips out
              inflation to show genuine changes in economic output.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">GDP Per Capita</h2>
            <p className="mb-4 text-base leading-relaxed">
              Total GDP tells you the size of an economy, but it does not tell you how well
              off the average person is. China&apos;s GDP is the second largest in the world,
              yet its GDP per capita ranks around 70th because the output is shared among 1.4
              billion people. GDP per capita divides total GDP by population, providing a rough
              proxy for average living standards.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              High GDP per capita countries like Luxembourg, Switzerland, and Norway are not
              necessarily the largest economies, but their citizens tend to enjoy higher incomes
              and better public services. However, GDP per capita says nothing about how evenly
              that income is distributed within a country.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Purchasing Power Parity (PPP)</h2>
            <p className="mb-4 text-base leading-relaxed">
              When comparing GDP across countries, market exchange rates can be misleading. A
              haircut that costs two dollars in India and thirty dollars in New York does not
              mean New York produces fifteen times more haircutting service. Purchasing Power
              Parity adjusts for price differences between countries, giving a more accurate
              comparison of real living standards.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              On a PPP basis, China&apos;s economy has already surpassed the United States, while
              at market exchange rates the US remains larger. India ranks third on a PPP basis
              but roughly fifth at market rates. PPP is particularly important when comparing
              developed and developing economies, where price levels differ dramatically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">GDP Growth and Recessions</h2>
            <p className="mb-4 text-base leading-relaxed">
              GDP growth rates tell you the pace of economic expansion. Most developed economies
              grow at two to three percent annually in normal times. Emerging markets can sustain
              five to seven percent or higher. A recession is commonly defined as two consecutive
              quarters of negative GDP growth, though the official determination in the United
              States is made by the NBER Business Cycle Dating Committee based on a broader set
              of indicators.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitations of GDP</h2>
            <ul className={`list-disc ml-6 mb-4 space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Inequality blind:</strong> GDP does not measure how income is distributed. A country can have high GDP per capita while most citizens live in poverty.</li>
              <li><strong>Ignores unpaid work:</strong> Household labor, caregiving, and volunteer work are not counted despite their economic value.</li>
              <li><strong>Environmental costs:</strong> Natural disasters can boost GDP (through rebuilding) even though they destroy wealth. Pollution and resource depletion are not subtracted.</li>
              <li><strong>Quality of life:</strong> GDP does not capture health outcomes, leisure time, education quality, or personal freedom, all of which matter for well-being.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Using GDP Data on Our Platform</h2>
            <p className="mb-4 text-base leading-relaxed">
              GDP and GDP growth are central metrics on our <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">Dashboard</a> and
              <a href="/compare" className="text-blue-600 dark:text-blue-400 hover:underline"> Compare Countries</a> pages.
              You can track GDP growth trends over decades, compare output levels across economies,
              and see how GDP relates to other indicators like employment, inflation, and trade.
            </p>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore More</h2>
            <ul className="space-y-2">
              <li><a href="/compare" className="text-blue-600 dark:text-blue-400 hover:underline">Compare Countries</a> &mdash; Side-by-side GDP analysis</li>
              <li><a href="/guides/understanding-employment-data" className="text-blue-600 dark:text-blue-400 hover:underline">Understanding Employment Data</a> &mdash; How jobs relate to GDP</li>
              <li><a href="/guides/emerging-vs-developed-economies" className="text-blue-600 dark:text-blue-400 hover:underline">Emerging vs Developed Economies</a> &mdash; Why growth rates differ</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function InflationGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Understanding Inflation</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          What drives price increases, how inflation is measured, and why central banks treat it as a primary policy target.
        </p>

        <div className={`rounded-lg p-4 sm:p-5 mb-8 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'}`}>
          <h2 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Key Takeaways</h2>
          <ul className={`text-sm space-y-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>&bull; Inflation measures the rate at which prices rise; moderate inflation (~2%) is considered healthy, while high inflation erodes purchasing power.</li>
            <li>&bull; CPI is the most common measure, but core inflation (excluding food and energy) is what central banks watch most closely.</li>
            <li>&bull; Inflation can be caused by excess demand (demand-pull), rising costs (cost-push), or expectations becoming self-fulfilling.</li>
            <li>&bull; The 2021&ndash;2023 global inflation surge demonstrated how supply shocks and massive fiscal stimulus can combine to create price pressures.</li>
          </ul>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Is Inflation?</h2>
            <p className="mb-4 text-base leading-relaxed">
              Inflation is the rate at which the general level of prices for goods and services
              rises over time, eroding purchasing power. When inflation is three percent, a basket
              of goods that cost one hundred dollars a year ago now costs one hundred and three
              dollars. Your money buys less than it did before.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Moderate inflation (typically around two percent annually) is considered healthy in
              most economic frameworks. It encourages spending and investment rather than hoarding
              cash, and it gives central banks room to lower real interest rates during downturns.
              Problems arise when inflation is too high (eroding savings and creating uncertainty)
              or too low (risking deflation, where falling prices discourage spending because
              consumers expect things to get cheaper).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How Inflation Is Measured</h2>
            <div className="space-y-4">
              {[
                { name: 'Consumer Price Index (CPI)', desc: 'The most widely cited inflation measure. CPI tracks the average change in prices paid by consumers for a fixed basket of goods and services including food, housing, transportation, healthcare, and recreation. Most countries publish CPI data monthly.' },
                { name: 'Core Inflation', desc: 'CPI excluding volatile food and energy prices. Because food and energy costs can swing dramatically due to weather, geopolitics, and commodity markets, core inflation gives a cleaner view of underlying price trends. Central banks often focus on core inflation for policy decisions.' },
                { name: 'Producer Price Index (PPI)', desc: 'Measures price changes from the perspective of producers rather than consumers. PPI tracks input costs for manufacturers and can serve as a leading indicator: rising producer prices often translate into higher consumer prices with a lag.' },
                { name: 'GDP Deflator', desc: 'A broader measure that captures price changes across the entire economy, not just consumer goods. The GDP deflator is the ratio of nominal GDP to real GDP and reflects inflation in investment, government spending, and net exports as well as consumption.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What Causes Inflation?</h2>
            <p className="mb-4 text-base leading-relaxed">
              Economists generally identify three main drivers of inflation:
            </p>
            <ul className={`list-disc ml-6 mb-4 space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Demand-pull inflation:</strong> When aggregate demand in an economy outpaces the economy&apos;s capacity to produce goods and services. This often happens during economic booms or when governments inject large amounts of stimulus spending.</li>
              <li><strong>Cost-push inflation:</strong> When the cost of production inputs (raw materials, energy, labor) rises, forcing businesses to pass higher costs to consumers. The oil price shocks of the 1970s are a classic example.</li>
              <li><strong>Monetary inflation:</strong> When the money supply grows faster than the economy&apos;s output. More money chasing the same amount of goods pushes prices higher. Central banks manage this through interest rate policy and open market operations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Hyperinflation: When Prices Spiral</h2>
            <p className="mb-4 text-base leading-relaxed">
              Hyperinflation is an extreme form where prices increase by fifty percent or more per
              month. Historical examples include Germany in the early 1920s, Zimbabwe in 2008 (where
              inflation peaked at roughly 79.6 billion percent per month), and Venezuela in the late
              2010s. Hyperinflation typically results from a collapse in government finances, loss of
              confidence in the currency, and excessive money printing to cover fiscal deficits.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Our <a href="/economic-cycles" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Cycles</a> page
              documents many of these episodes and places them in the context of broader debt cycles
              and financial crises.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Inflation and Interest Rates</h2>
            <p className="mb-4 text-base leading-relaxed">
              Central banks use interest rates as their primary tool to manage inflation. When
              inflation rises above the target, the central bank raises the policy rate to make
              borrowing more expensive, cooling demand and reducing price pressure. When inflation
              is below target and the economy is weakening, it cuts rates to stimulate activity.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              The real interest rate (nominal rate minus inflation) is what matters for economic
              decisions. If the nominal rate is five percent but inflation is four percent, the real
              cost of borrowing is only one percent. Negative real rates (when inflation exceeds the
              nominal rate) effectively reward borrowers and penalize savers, which is why sustained
              low-rate environments combined with rising inflation generate significant policy debate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Using Our Inflation Tools</h2>
            <p className="mb-4 text-base leading-relaxed">
              Our <a href="/inflation" className="text-blue-600 dark:text-blue-400 hover:underline">Inflation page</a> tracks
              consumer price inflation across all economies in our dataset, with historical trends
              going back decades. The <a href="/inflation-calculator" className="text-blue-600 dark:text-blue-400 hover:underline">Inflation Calculator</a> lets
              you enter a currency amount and time period to see how purchasing power has changed,
              making the abstract concept of inflation concrete and personal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Real-World Example: Post-Pandemic Inflation (2021&ndash;2023)</h2>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Following the COVID-19 pandemic, a perfect storm of inflationary forces hit the global economy.
                Supply chains were disrupted as factories closed and shipping bottlenecked. Energy prices surged,
                amplified by the Russia-Ukraine conflict in 2022. Simultaneously, governments had injected trillions
                in fiscal stimulus while central banks held rates near zero. US CPI peaked at 9.1 percent in June
                2022, the highest since 1981. The UK hit 11.1 percent; Germany saw 10.4 percent. This forced the
                fastest coordinated interest rate hiking cycle in decades, demonstrating the tight link between
                inflation, monetary policy, and economic activity.
              </p>
            </div>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Related Guides</h2>
            <ul className="space-y-2">
              <li><a href="/inflation" className="text-blue-600 dark:text-blue-400 hover:underline">Inflation Dashboard</a> &mdash; Track price changes across economies</li>
              <li><a href="/inflation-calculator" className="text-blue-600 dark:text-blue-400 hover:underline">Inflation Calculator</a> &mdash; Calculate purchasing power over time</li>
              <li><a href="/guides/understanding-interest-rates" className="text-blue-600 dark:text-blue-400 hover:underline">Understanding Interest Rates</a> &mdash; How central banks respond to inflation</li>
              <li><a href="/guides/how-central-banks-work" className="text-blue-600 dark:text-blue-400 hover:underline">How Central Banks Work</a> &mdash; Tools for fighting inflation</li>
              <li><a href="/guides/economic-cycles-explained" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Cycles Explained</a> &mdash; Inflation crises in historical context</li>
              <li><a href="/guides/glossary" className="text-blue-600 dark:text-blue-400 hover:underline">Glossary</a> &mdash; Definitions of key economic terms</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

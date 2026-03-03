'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function DebtSustainabilityGuide() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);

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
        <div className="flex justify-between items-center mb-4">
          <a href="/guides/reading-economic-data" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">&larr; All Guides</a>
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Light</span>
            <button
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 shadow-sm ${isDarkMode ? 'translate-x-6' : ''}`} />
            </button>
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dark</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Debt Sustainability Explained</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          What makes government debt sustainable, how analysts assess fiscal health, and what warning signs indicate a country may be approaching a debt crisis.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">The Core Question</h2>
            <p className="mb-4 text-base leading-relaxed">
              Debt sustainability analysis asks a simple but critical question: can a government
              continue to service its debt without requiring extraordinary measures like default,
              hyperinflation, or a bailout? The answer depends not on the absolute size of the debt,
              but on the relationship between the debt stock, the cost of servicing it, and the
              economy&apos;s capacity to generate revenue.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              A country with $10 trillion in debt might be perfectly sustainable, while one with
              $10 billion might be in crisis. What matters is the debt relative to GDP, the interest
              rate relative to growth, and the government&apos;s ability to run primary surpluses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Key Metrics</h2>
            <div className="space-y-4">
              {[
                { name: 'Debt-to-GDP Ratio', desc: 'Total government debt divided by annual GDP. The Maastricht Treaty set 60% as a benchmark for EU members, but many advanced economies now exceed 100%. Japan sustains over 250% thanks to domestic financing and yen-denominated debt. Context always matters more than any single threshold.' },
                { name: 'Interest-Growth Differential (r - g)', desc: 'The difference between the effective interest rate on government debt (r) and the nominal GDP growth rate (g). When r > g, the debt ratio rises automatically even with a balanced budget, because debt grows faster than the economy. When g > r, the debt ratio shrinks naturally over time. This single metric is often the most important indicator of sustainability.' },
                { name: 'Primary Balance', desc: 'Government revenue minus non-interest spending. A primary surplus means the government collects more than it spends (excluding interest payments), generating cash to service debt. A primary deficit means the government is borrowing not just to pay interest but also to fund operations -- a more precarious position.' },
                { name: 'Debt Service Ratio', desc: 'Annual interest payments as a percentage of government revenue. When a large share of revenue goes to interest payments, less is available for public services, infrastructure, and crisis response. A ratio above 20% is considered a significant warning sign.' },
                { name: 'Budget Balance', desc: 'Total government revenue minus total spending (including interest). A fiscal deficit adds to the debt stock each year, while a surplus reduces it. Most major economies have run persistent deficits since 2008.' },
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Debt Dynamics Equation</h2>
            <p className="mb-4 text-base leading-relaxed">
              The change in the debt-to-GDP ratio from one year to the next can be decomposed into
              two forces:
            </p>
            <div className={`p-4 rounded-lg text-center font-mono text-lg mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              &Delta;(Debt/GDP) = (r - g) &times; (Debt/GDP) - Primary Balance
            </div>
            <p className="mb-4 text-base leading-relaxed">
              The first term shows the automatic debt dynamics: when the interest rate exceeds
              growth (r &gt; g), debt grows on autopilot. The second term shows the government&apos;s
              fiscal effort: a primary surplus subtracts from debt, while a primary deficit adds
              to it. Sustainability requires that the fiscal effort offsets the automatic growth
              of debt over time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Historical Examples</h2>
            <div className="space-y-4">
              {[
                { name: 'Japan (Sustained High Debt)', desc: 'Japan has maintained debt above 200% of GDP for over a decade. Low interest rates (near 0%), massive domestic savings that fund the debt, and yen-denominated borrowing allow Japan to sustain what would be crisis-level debt in most other countries.' },
                { name: 'Greece (2010-2012 Crisis)', desc: 'Greece\'s debt reached about 180% of GDP amid weak growth, high interest rates, and an inability to devalue its currency (being in the eurozone). The interest-growth differential was severely negative, requiring EU/IMF bailouts and a forced restructuring that imposed losses on bondholders.' },
                { name: 'United States', desc: 'US debt exceeds 120% of GDP but is considered sustainable due to the dollar\'s reserve currency status, deep capital markets, and the Federal Reserve\'s credibility. However, rising interest rates and persistent deficits mean the interest-growth differential is narrowing.' },
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Sustainability Score</h2>
            <p className="mb-4 text-base leading-relaxed">
              The <a href="/debt" className="text-blue-600 dark:text-blue-400 hover:underline">Debt Sustainability Dashboard</a> computes
              a composite score (0-100) for each country by weighing four factors: the debt-to-GDP
              level, the debt service burden, the budget balance, and the interest-growth differential.
              Countries in the green zone (70+) have manageable debt dynamics. Yellow (40-70)
              indicates elevated risk. Red (below 40) signals serious sustainability concerns.
              Click any country on the scorecard to add it to the trajectory charts and explore
              its debt path in detail.
            </p>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore More</h2>
            <ul className="space-y-2">
              <li><a href="/debt" className="text-blue-600 dark:text-blue-400 hover:underline">Debt Sustainability Dashboard</a> &mdash; Interactive debt analysis and scoring</li>
              <li><a href="/guides/government-debt-explained" className="text-blue-600 dark:text-blue-400 hover:underline">Government Debt Explained</a> &mdash; Broader guide to sovereign debt concepts</li>
              <li><a href="/guides/economic-forecasting" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Forecasting &amp; Outlook</a> &mdash; How debt projections are produced</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

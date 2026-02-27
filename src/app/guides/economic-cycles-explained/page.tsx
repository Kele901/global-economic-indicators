'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function EconomicCyclesGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Economic Cycles Explained</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          How economies expand and contract, why crises recur, and what frameworks like Dalio&apos;s debt cycles and Reinhart-Rogoff&apos;s crisis patterns teach us.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Are Economic Cycles?</h2>
            <p className="mb-4 text-base leading-relaxed">
              Economic cycles are recurring fluctuations in economic activity that economies experience
              over time. Every market economy moves through periods of expansion (growth, rising
              employment, increasing output) followed by periods of contraction (recession, rising
              unemployment, falling output). These fluctuations are not random; they follow patterns
              shaped by credit creation, investor psychology, policy responses, and structural shifts
              in the economy.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Understanding these cycles is essential for interpreting economic data. A rising
              unemployment rate means something very different during a normal business cycle
              downturn than during a systemic financial crisis. The depth, duration, and recovery
              path of each downturn depends on which type of cycle is at play.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Business Cycle</h2>
            <p className="mb-4 text-base leading-relaxed">
              The short-term business cycle typically lasts five to eight years and consists of
              four phases: expansion, peak, contraction, and trough. During expansion, GDP grows,
              businesses hire, and consumer confidence rises. At the peak, growth slows as the
              economy reaches capacity constraints. Contraction follows as spending and investment
              decline. At the trough, the economy bottoms out before the next expansion begins.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Central banks actively manage the business cycle through monetary policy. They lower
              interest rates during contractions to stimulate borrowing and spending, and raise
              rates during expansions to prevent overheating and inflation. This intervention
              smooths the cycle but cannot eliminate it entirely.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Dalio&apos;s Long-Term Debt Cycle</h2>
            <p className="mb-4 text-base leading-relaxed">
              Ray Dalio, founder of Bridgewater Associates, identified a longer cycle spanning
              roughly 50 to 75 years that he calls the long-term debt cycle. Unlike the business
              cycle, which revolves around short-term credit fluctuations, the long-term debt cycle
              tracks the gradual accumulation of debt across an entire economy over decades.
            </p>
            <div className="space-y-4">
              {[
                { name: 'Early Phase', desc: 'Debt levels are low, credit is used productively, and incomes grow faster than debts. This creates a virtuous cycle of borrowing, investing, and growth. The post-World War II era in the United States exemplifies this phase.' },
                { name: 'Bubble Phase', desc: 'As confidence builds over decades, lending standards loosen. Debt grows faster than income but asset prices rise to cover the difference. People borrow against rising asset values, creating a self-reinforcing bubble. The mid-2000s housing boom is a classic example.' },
                { name: 'Deleveraging', desc: 'The bubble bursts. Asset prices fall, debts become unsustainable, and the economy enters a painful period of debt reduction. Unlike a normal recession, cutting interest rates alone is insufficient because rates are already near zero. This is what occurred in 2008-2012.' },
                { name: 'Recovery', desc: 'Through a combination of debt restructuring, austerity, wealth transfers, and money printing (quantitative easing), the economy gradually reduces its debt burden and begins a new long-term cycle.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Reinhart-Rogoff: &ldquo;This Time Is Different&rdquo;</h2>
            <p className="mb-4 text-base leading-relaxed">
              Carmen Reinhart and Kenneth Rogoff analyzed eight centuries of financial crises
              across 66 countries in their landmark study. Their central finding is that financial
              crises are remarkably similar across time and geography. Whether it is a banking
              crisis in 14th century Florence or a sovereign debt default in 21st century Greece,
              the patterns of excessive borrowing, overconfidence, and eventual collapse repeat
              with striking regularity.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              They categorize crises into banking crises, currency crises, sovereign debt defaults,
              and inflation crises. Often these occur in clusters: a banking crisis triggers a
              currency crisis, which leads to a sovereign debt default. Their work demonstrates
              that the phrase &ldquo;this time is different&rdquo; is the most dangerous sentence
              in economics, as each generation believes its financial innovations have eliminated
              the risk of crisis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Types of Financial Crises</h2>
            <div className="space-y-4">
              {[
                { name: 'Banking Crisis', desc: 'Bank failures or systemic bank runs caused by bad loans, asset bubbles, or loss of confidence. Examples include the 2008 Global Financial Crisis and the 1930s Great Depression. Recovery typically takes 4-6 years.' },
                { name: 'Currency Crisis', desc: 'A sharp devaluation of a country\'s currency, often triggered by capital flight or unsustainable exchange rate pegs. The 1997 Asian Financial Crisis saw currencies across Southeast Asia lose 40-80% of their value in months.' },
                { name: 'Sovereign Debt Crisis', desc: 'When a government cannot service its debts and defaults or restructures. Argentina (2001), Greece (2012), and Russia (1998) are prominent modern examples. These often follow banking crises as governments absorb private-sector losses.' },
                { name: 'Inflation Crisis', desc: 'Extreme or hyperinflation that destroys purchasing power. Germany (1923), Zimbabwe (2008), and Venezuela (2018) experienced prices doubling in days or weeks. Usually caused by governments printing money to cover fiscal deficits.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Reading Cycle Data on Our Platform</h2>
            <p className="mb-4 text-base leading-relaxed">
              Our <a href="/economic-cycles" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Cycles</a> page
              provides interactive timelines of historical crises, debt cycle phase indicators,
              a crisis world map, and comparison tools that let you analyze how different types
              of crises have played out across countries and eras. Use the filters to focus on
              specific crisis types, decades, or regions.
            </p>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore More</h2>
            <ul className="space-y-2">
              <li><a href="/economic-cycles" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Cycles Dashboard</a> &mdash; Interactive crisis timelines and maps</li>
              <li><a href="/guides/government-debt-explained" className="text-blue-600 dark:text-blue-400 hover:underline">Government Debt Explained</a> &mdash; Sovereign debt and fiscal sustainability</li>
              <li><a href="/guides/how-central-banks-work" className="text-blue-600 dark:text-blue-400 hover:underline">How Central Banks Work</a> &mdash; Policy tools used to manage cycles</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

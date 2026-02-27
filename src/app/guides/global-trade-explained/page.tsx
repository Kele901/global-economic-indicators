'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function GlobalTradeGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Global Trade Explained</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          How international trade works, what the key indicators measure, and how to interpret trade data on our platform.
        </p>

        <div className={`rounded-lg p-4 sm:p-5 mb-8 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'}`}>
          <h2 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Key Takeaways</h2>
          <ul className={`text-sm space-y-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>&bull; Trade enables countries to specialize in what they produce most efficiently, raising overall global output.</li>
            <li>&bull; Trade balance, trade openness, and current account are the core metrics for assessing a country&apos;s trade position.</li>
            <li>&bull; Exchange rates and trade are deeply linked: a weaker currency boosts exports but makes imports more expensive.</li>
            <li>&bull; The US-China trade war (2018-present) reshaped global supply chains and demonstrated how tariffs ripple through economies.</li>
          </ul>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Why Trade Matters</h2>
            <p className="mb-4 text-base leading-relaxed">
              International trade is the exchange of goods and services across national borders. It
              enables countries to specialize in producing what they do most efficiently and import
              what others produce more cheaply. Trade has been a primary engine of global economic
              growth for centuries, lifting living standards and creating interconnected supply chains
              that span the globe.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              For economists and analysts, trade data reveals the economic health of a nation, its
              competitive advantages, and its dependence on external markets. A country with
              a strong export sector is typically one with productive industries, competitive pricing,
              and valuable natural resources or technological capabilities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Key Trade Indicators</h2>
            <div className="space-y-4">
              {[
                { name: 'Trade Balance', desc: 'The difference between a country\'s exports and imports. A trade surplus (exports exceed imports) means the country earns more from selling abroad than it spends buying foreign goods. A trade deficit means the opposite. Persistent deficits are not necessarily harmful if funded by productive investment inflows.' },
                { name: 'Trade Openness', desc: 'Total trade (exports plus imports) as a percentage of GDP. Higher values indicate greater integration with the global economy. Small, open economies like Singapore or the Netherlands typically have very high trade openness, while large domestic markets like the United States tend to have lower ratios.' },
                { name: 'Current Account Balance', desc: 'A broader measure than the trade balance, the current account includes trade in goods and services, income from foreign investments, and transfer payments. It provides a comprehensive view of a country\'s transactions with the rest of the world.' },
                { name: 'Foreign Direct Investment (FDI)', desc: 'Investment by foreign entities into productive assets within a country, such as factories, offices, or infrastructure. FDI inflows indicate international confidence in a country\'s economic prospects and business environment.' },
                { name: 'High-Tech Exports', desc: 'The share of manufactured exports classified as high-technology, including aerospace, computers, pharmaceuticals, and scientific instruments. A higher share indicates advanced manufacturing capabilities and technological sophistication.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Comparative Advantage</h2>
            <p className="mb-4 text-base leading-relaxed">
              The theory of comparative advantage, first articulated by David Ricardo in the early
              nineteenth century, explains why trade benefits all participants even when one country
              can produce everything more cheaply than another. The key insight is that countries
              benefit by specializing in goods where their relative efficiency advantage is greatest,
              and trading for everything else.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              In practice, comparative advantage is shaped by factors including natural resources,
              labor costs, education levels, technological capability, and infrastructure quality.
              Countries like Germany excel in precision engineering and automobiles, while nations
              like Bangladesh have a comparative advantage in labor-intensive textile manufacturing.
              Our Trading Places dashboard visualizes these patterns through export composition data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Trade and Currency</h2>
            <p className="mb-4 text-base leading-relaxed">
              Exchange rates and trade are deeply interconnected. A weaker domestic currency makes
              exports cheaper for foreign buyers (boosting exports) while making imports more
              expensive (reducing imports). This is why some countries have historically been accused
              of deliberate currency devaluation to gain trade advantages. Conversely, a strong
              currency benefits consumers by making imports cheaper but can hurt exporters by pricing
              their goods out of foreign markets.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Economic Gravity Model</h2>
            <p className="mb-4 text-base leading-relaxed">
              Our <a href="/economic-gravity" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Gravity</a> page
              uses a model inspired by Newton&apos;s law of gravitation to explain bilateral trade
              flows. The model predicts that trade between two countries is proportional to the product
              of their economic sizes (GDP) and inversely proportional to the distance between them.
              Larger economies trade more with each other, and proximity reduces transportation costs
              and logistical barriers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Reading Trade Data on Our Platform</h2>
            <p className="mb-4 text-base leading-relaxed">
              Our <a href="/trading-places" className="text-blue-600 dark:text-blue-400 hover:underline">Trading Places</a> dashboard
              provides detailed trade flow analysis, bilateral trade breakdowns, export composition
              by sector, and trade openness comparisons. The main dashboard also includes trade
              balance data as a key indicator for cross-country comparison. On the Technology page,
              high-tech exports and ICT goods trade data reveal each country&apos;s position in
              global technology value chains.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Real-World Example: The US-China Trade War</h2>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Beginning in 2018, the United States imposed tariffs on over $360 billion of Chinese imports,
                with China retaliating with tariffs on $110 billion of US goods. The immediate effects included
                higher prices for US consumers, reduced Chinese exports to the US, and supply chain disruptions
                across Asia. Companies began &ldquo;friend-shoring&rdquo; production to Vietnam, India, and
                Mexico. Global trade growth slowed from 4.6 percent in 2017 to 0.9 percent in 2019. The episode
                demonstrated how interconnected modern supply chains are and how tariff policies create cascading
                effects far beyond the two countries directly involved.
              </p>
            </div>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Related Guides</h2>
            <ul className="space-y-2">
              <li><a href="/trading-places" className="text-blue-600 dark:text-blue-400 hover:underline">Trading Places Dashboard</a> &mdash; Analyze global trade flows</li>
              <li><a href="/economic-gravity" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Gravity Model</a> &mdash; Visualize bilateral trade relationships</li>
              <li><a href="/guides/currencies-and-exchange-rates" className="text-blue-600 dark:text-blue-400 hover:underline">Currencies and Exchange Rates</a> &mdash; How currencies affect trade</li>
              <li><a href="/guides/emerging-vs-developed-economies" className="text-blue-600 dark:text-blue-400 hover:underline">Emerging vs Developed Economies</a> &mdash; Trade patterns by income group</li>
              <li><a href="/guides/glossary" className="text-blue-600 dark:text-blue-400 hover:underline">Glossary</a> &mdash; Definitions of key economic terms</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

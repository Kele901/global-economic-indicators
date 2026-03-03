'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function TradeNetworksGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Trade Networks &amp; Supply Chains</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          How international trade connects economies, what trade balances reveal, why supply chain concentration matters, and how to read trade network visualizations.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Why Trade Matters</h2>
            <p className="mb-4 text-base leading-relaxed">
              International trade is the exchange of goods and services across borders. It allows
              countries to specialize in what they produce most efficiently and import what others
              produce better, raising living standards for both trading partners. Global trade has
              grown from roughly 20% of world GDP in the 1970s to over 50% today, making economies
              far more interconnected and interdependent.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              However, this interconnection also creates vulnerabilities. When a major trading
              partner faces an economic shock, its effects propagate through trade channels. The
              COVID-19 pandemic starkly illustrated how supply chain disruptions in one country can
              cascade globally, causing shortages and price spikes thousands of miles away.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Key Trade Concepts</h2>
            <div className="space-y-4">
              {[
                { name: 'Bilateral Trade', desc: 'Trade between two specific countries. Each bilateral relationship has an export and import component. When Country A exports $100B to Country B and imports $80B, Country A has a $20B trade surplus with Country B (and B has a $20B deficit with A).' },
                { name: 'Trade Balance', desc: 'The difference between a country\'s total exports and total imports. A trade surplus means exports exceed imports, while a deficit means the reverse. Persistent deficits mean a country consumes more than it produces and finances the gap with foreign borrowing or asset sales.' },
                { name: 'Trade Openness', desc: 'Total trade (exports + imports) as a percentage of GDP. Small, resource-rich economies like Singapore (trade exceeding 300% of GDP) are extremely open, while large, diversified economies like the US (about 25%) are less trade-dependent. Higher openness typically correlates with faster growth but greater exposure to external shocks.' },
                { name: 'Comparative Advantage', desc: 'The principle that countries benefit from specializing in goods they can produce at lower opportunity cost, even if another country can produce everything more efficiently in absolute terms. This is why Germany exports cars and Saudi Arabia exports oil.' },
                { name: 'Terms of Trade', desc: 'The ratio of export prices to import prices. When a country\'s terms of trade improve (export prices rise faster than import prices), it can buy more imports with the same volume of exports, effectively becoming wealthier.' },
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Supply Chain Concentration Risk</h2>
            <p className="mb-4 text-base leading-relaxed">
              Supply chain concentration occurs when a large share of a country&apos;s trade depends
              on a single partner or a small number of partners. This creates vulnerability:
              if that partner imposes trade restrictions, faces a natural disaster, or experiences
              political instability, the concentrated country has limited alternatives.
            </p>
            <ul className={`list-disc pl-6 space-y-2 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Geographic concentration:</strong> Many European countries depend heavily on Russian energy imports (now being diversified after 2022). Many Asian economies depend on China as both a supplier and a market.</li>
              <li><strong>Product concentration:</strong> Countries that export primarily one commodity (oil for Saudi Arabia, copper for Chile) face severe economic swings when that commodity&apos;s price changes.</li>
              <li><strong>Chokepoint risks:</strong> Global trade routes pass through narrow straits (Malacca, Suez, Hormuz) where disruptions can affect the entire system. The 2021 Suez Canal blockage by the Ever Given disrupted global trade for weeks.</li>
            </ul>
            <p className="mt-4 mb-4 text-base leading-relaxed">
              Our <a href="/trade-network" className="text-blue-600 dark:text-blue-400 hover:underline">Trade Network Visualization</a> includes
              a concentration chart showing which countries have the most concentrated trade partnerships
              and identifying their dominant partner.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Reading Trade Visualizations</h2>
            <p className="mb-4 text-base leading-relaxed">
              On our Trade Network page, selecting a country reveals several views:
            </p>
            <div className="space-y-4">
              {[
                { name: 'Exports & Imports Chart', desc: 'Horizontal bar chart showing the volume of trade with each partner, split into exports (outgoing goods/services) and imports (incoming). Longer bars indicate larger trade relationships.' },
                { name: 'Trade Balance', desc: 'The net position with each partner. Green bars indicate a surplus (exporting more than importing), red bars indicate a deficit. This reveals which relationships are balanced and which are one-sided.' },
                { name: 'Openness Rankings', desc: 'A bar chart ranking countries by trade openness (trade as % of GDP). This contextualizes how integrated each economy is with global markets relative to its size.' },
                { name: 'Concentration Chart', desc: 'Shows the share of trade accounted for by each country\'s top partner. Higher concentration means greater dependency on a single relationship and more vulnerability to disruption.' },
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Trade and Development</h2>
            <p className="mb-4 text-base leading-relaxed">
              Trade plays a crucial role in economic development. Emerging economies that opened
              to trade (South Korea, China, Vietnam) have experienced dramatic growth and poverty
              reduction. However, the benefits are not automatic: countries need infrastructure,
              institutions, and human capital to take advantage of trade opportunities. Trade can
              also create winners and losers within a country, as some industries expand while
              others face import competition, making trade policy a politically sensitive topic.
            </p>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore More</h2>
            <ul className="space-y-2">
              <li><a href="/trade-network" className="text-blue-600 dark:text-blue-400 hover:underline">Trade Network Visualization</a> &mdash; Interactive bilateral trade explorer</li>
              <li><a href="/guides/development-inequality" className="text-blue-600 dark:text-blue-400 hover:underline">Human Development &amp; Inequality</a> &mdash; How trade connects to development outcomes</li>
              <li><a href="/guides/scenario-analysis" className="text-blue-600 dark:text-blue-400 hover:underline">Scenario Analysis &amp; Correlations</a> &mdash; Simulate trade shock impacts</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

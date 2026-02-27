'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function CurrenciesGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Currencies and Exchange Rates</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          How currencies work, what drives exchange rates, and why some currencies dominate global finance while others remain regional.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Determines a Currency&apos;s Value?</h2>
            <p className="mb-4 text-base leading-relaxed">
              A currency&apos;s value is determined by supply and demand in foreign exchange
              markets, the largest financial markets in the world with over six trillion dollars
              in daily trading volume. Several fundamental factors drive this supply and demand:
              interest rate differentials between countries, inflation expectations, trade balances,
              political stability, and overall economic performance.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              When a country offers higher interest rates than its peers, foreign investors move
              capital there to earn better returns, increasing demand for its currency and pushing
              its value up. Conversely, high inflation erodes a currency&apos;s purchasing power
              and typically leads to depreciation. These forces interact continuously, creating
              the fluctuations visible in exchange rate charts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Exchange Rate Regimes</h2>
            <div className="space-y-4">
              {[
                { name: 'Free Floating', desc: 'The currency\'s value is determined entirely by market forces. The US dollar, euro, British pound, and Japanese yen all float freely. Central banks may intervene occasionally but do not target a specific rate.' },
                { name: 'Managed Float', desc: 'The currency floats but the central bank actively intervenes to influence its value, often to prevent excessive volatility or maintain competitiveness. India, Singapore, and many emerging markets use this approach.' },
                { name: 'Fixed Peg', desc: 'The currency is locked to another currency (usually the US dollar) at a set rate. Hong Kong has maintained a peg to the USD since 1983. This provides stability but requires large foreign reserves to defend.' },
                { name: 'Currency Board', desc: 'A stricter form of fixed peg where every unit of domestic currency must be backed by foreign reserves. This eliminates monetary policy flexibility but provides maximum credibility.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Currency Hierarchy</h2>
            <p className="mb-4 text-base leading-relaxed">
              Not all currencies are equal in the international monetary system. They form a
              hierarchy based on their role in global trade, finance, and central bank reserves.
              At the top sits the US dollar, which accounts for roughly 58 percent of global
              foreign exchange reserves, dominates commodity pricing, and serves as the primary
              settlement currency for international trade.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Below the dollar are major currencies like the euro, Japanese yen, British pound,
              and Swiss franc, which are widely traded and held as reserves. The next tier includes
              regional currencies like the Australian dollar, Canadian dollar, and Chinese yuan,
              which are important in their regions but play a smaller global role. At the base
              are local currencies of smaller or less stable economies, which are rarely held
              internationally and may be subject to capital controls.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Key Currency Concepts</h2>
            <div className="space-y-4">
              {[
                { name: 'Real Effective Exchange Rate (REER)', desc: 'Measures a currency\'s value against a basket of trading partners, adjusted for inflation differentials. A rising REER means the currency is becoming more expensive relative to its partners, which can hurt export competitiveness.' },
                { name: 'Carry Trade', desc: 'A strategy where investors borrow in a low-interest-rate currency and invest in a high-interest-rate currency, profiting from the rate differential. This was historically done borrowing in yen and investing in Australian dollars or emerging market currencies.' },
                { name: 'Safe Haven Currency', desc: 'Currencies that appreciate during global crises as investors seek safety. The US dollar, Swiss franc, and Japanese yen are the primary safe havens. During the 2020 pandemic crash, all three strengthened significantly.' },
                { name: 'Purchasing Power Parity (PPP)', desc: 'The exchange rate at which a basket of goods costs the same in two countries. The famous Big Mac Index uses hamburger prices as a simple PPP comparison. PPP rates often differ significantly from market exchange rates.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Currency Crises</h2>
            <p className="mb-4 text-base leading-relaxed">
              Currency crises occur when a country&apos;s exchange rate collapses rapidly, often
              triggering broader economic distress. The 1992 Black Wednesday crisis forced the
              British pound out of the European Exchange Rate Mechanism. The 1997 Asian Crisis
              saw the Thai baht, Indonesian rupiah, and South Korean won lose 40 to 80 percent
              of their value within months. More recently, the Turkish lira lost over 40 percent
              in 2021 alone amid unorthodox monetary policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Exploring Currencies on Our Platform</h2>
            <p className="mb-4 text-base leading-relaxed">
              Our <a href="/currency-hierarchy" className="text-blue-600 dark:text-blue-400 hover:underline">Currency Hierarchy</a> dashboard
              visualizes the tiered structure of global currencies with live exchange rate data,
              central bank policy rates, reserve composition breakdowns, and safe-haven indicators.
              Compare how different currencies perform across the hierarchy and track real-time
              rate changes.
            </p>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore More</h2>
            <ul className="space-y-2">
              <li><a href="/currency-hierarchy" className="text-blue-600 dark:text-blue-400 hover:underline">Currency Hierarchy Dashboard</a> &mdash; Live exchange rates and currency analysis</li>
              <li><a href="/guides/understanding-interest-rates" className="text-blue-600 dark:text-blue-400 hover:underline">Understanding Interest Rates</a> &mdash; How rates drive currency values</li>
              <li><a href="/guides/how-central-banks-work" className="text-blue-600 dark:text-blue-400 hover:underline">How Central Banks Work</a> &mdash; Monetary policy and currency management</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

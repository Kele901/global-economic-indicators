'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function CentralBanksGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">How Central Banks Work</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          The institutions that control monetary policy, their tools, mandates, and how their decisions ripple through the global economy.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Central Banks Do</h2>
            <p className="mb-4 text-base leading-relaxed">
              Central banks are public institutions responsible for managing a country&apos;s
              monetary policy, supervising its banking system, and maintaining financial stability.
              Unlike commercial banks that serve individuals and businesses, central banks serve
              the government and the banking system itself. They are the &ldquo;lender of last
              resort,&rdquo; providing emergency liquidity to banks facing temporary shortfalls.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Most modern central banks operate with some degree of independence from the
              government, allowing them to make policy decisions based on economic conditions
              rather than political pressures. This independence is considered crucial for
              maintaining low and stable inflation, as politicians may be tempted to pursue
              short-term growth at the expense of long-term price stability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Major Central Banks</h2>
            <div className="space-y-4">
              {[
                { name: 'Federal Reserve (Fed)', desc: 'The US central bank, established in 1913. Has a dual mandate: maximum employment and price stability. Its decisions influence global markets because the US dollar is the world\'s reserve currency. Chaired by a presidentially appointed governor serving a four-year term.' },
                { name: 'European Central Bank (ECB)', desc: 'Manages monetary policy for the 20 eurozone countries. Has a single mandate of price stability, targeting inflation near but below 2 percent. Must balance the needs of diverse economies from Germany to Greece within a single monetary framework.' },
                { name: 'Bank of Japan (BOJ)', desc: 'Has pursued ultraloose monetary policy for over two decades to combat deflation, including negative interest rates and massive asset purchases. Japan\'s experience is studied globally as a cautionary tale about the limits of monetary stimulus.' },
                { name: 'Bank of England (BOE)', desc: 'One of the oldest central banks, founded in 1694. Targets 2 percent inflation and has been a pioneer of inflation targeting and forward guidance communications strategies.' },
                { name: 'People\'s Bank of China (PBOC)', desc: 'Operates under less formal independence than Western central banks, with the State Council retaining influence over major policy decisions. Manages the yuan\'s exchange rate and deploys a wider range of policy tools including reserve requirement ratios and window guidance to banks.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Policy Tools</h2>
            <div className="space-y-4">
              {[
                { name: 'Interest Rate Policy', desc: 'The primary tool. By setting the benchmark rate at which banks borrow overnight, the central bank influences all other interest rates in the economy. Higher rates cool demand; lower rates stimulate it.' },
                { name: 'Quantitative Easing (QE)', desc: 'When interest rates hit zero, central banks can purchase government bonds and other assets to inject money into the financial system. This lowers long-term rates and encourages risk-taking. The Fed\'s balance sheet grew from $900 billion to over $8 trillion through QE programs.' },
                { name: 'Forward Guidance', desc: 'Communication about the expected future path of policy. By signaling that rates will stay low for an extended period, central banks can influence long-term rates and market expectations without changing the current rate.' },
                { name: 'Reserve Requirements', desc: 'Central banks can require commercial banks to hold a minimum percentage of deposits as reserves. Lowering the requirement frees up capital for lending; raising it constrains credit. This tool is more commonly used in emerging markets.' },
                { name: 'Yield Curve Control', desc: 'Targeting specific long-term bond yields rather than just the overnight rate. The Bank of Japan pioneered this approach by capping ten-year government bond yields, effectively controlling borrowing costs across the entire maturity spectrum.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Inflation Targeting</h2>
            <p className="mb-4 text-base leading-relaxed">
              Most major central banks now target an inflation rate of around two percent. This
              framework, pioneered by New Zealand in 1990, provides a clear anchor for expectations.
              When businesses and workers expect two percent inflation, they set prices and wages
              accordingly, creating a self-fulfilling prophecy that keeps inflation stable. The
              challenge arises when actual inflation diverges significantly from the target, as
              occurred globally in 2021-2023 when post-pandemic supply shocks and stimulus spending
              pushed inflation to levels not seen in decades.
            </p>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore More</h2>
            <ul className="space-y-2">
              <li><a href="/currency-hierarchy" className="text-blue-600 dark:text-blue-400 hover:underline">Currency Hierarchy Dashboard</a> &mdash; Central bank rates and currency analysis</li>
              <li><a href="/guides/understanding-interest-rates" className="text-blue-600 dark:text-blue-400 hover:underline">Understanding Interest Rates</a> &mdash; How rate decisions affect the economy</li>
              <li><a href="/guides/inflation-guide" className="text-blue-600 dark:text-blue-400 hover:underline">Understanding Inflation</a> &mdash; What central banks are trying to control</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

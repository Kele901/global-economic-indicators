'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function InterestRatesGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Understanding Interest Rates</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          A guide to how central banks set rates, why they matter, and how to interpret interest rate data on our platform.
        </p>

        <div className={`rounded-lg p-4 sm:p-5 mb-8 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'}`}>
          <h2 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Key Takeaways</h2>
          <ul className={`text-sm space-y-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>&bull; Interest rates are the single most influential price in any economy, affecting borrowing, saving, currency values, and asset prices.</li>
            <li>&bull; Central banks raise rates to fight inflation and lower them to stimulate growth, creating recurring cycles.</li>
            <li>&bull; Rate differentials between countries drive exchange rate movements and international capital flows.</li>
            <li>&bull; The 2022-2023 hiking cycle saw the fastest rate increases in decades as central banks combated post-pandemic inflation.</li>
          </ul>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Are Interest Rates?</h2>
            <p className="mb-4 text-base leading-relaxed">
              An interest rate is the cost of borrowing money, expressed as a percentage of the principal amount
              per year. When you take out a loan or mortgage, the interest rate determines how much extra
              you pay the lender above the original amount. When you deposit money in a savings account, the
              interest rate determines how much the bank pays you for holding your funds.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              At the macroeconomic level, interest rates are one of the most powerful tools available to
              policymakers. They influence the cost of credit for businesses and consumers, the attractiveness
              of a currency to foreign investors, the pace of economic growth, and the rate of inflation.
              Nearly every financial decision in an economy is affected, directly or indirectly, by the
              prevailing interest rate environment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Role of Central Banks</h2>
            <p className="mb-4 text-base leading-relaxed">
              Each country&apos;s central bank (such as the Federal Reserve in the United States, the
              European Central Bank in the Eurozone, or the Bank of Japan) sets a benchmark interest rate
              known as the policy rate. This rate serves as the anchor for all other interest rates in
              the economy. When the central bank raises its policy rate, borrowing becomes more expensive
              throughout the economy. When it lowers the rate, borrowing becomes cheaper.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Central banks adjust policy rates primarily to manage inflation and support employment.
              When inflation is rising faster than the target (typically around two percent for most
              developed economies), the central bank raises rates to cool spending and investment. When
              the economy is slowing and unemployment is rising, it lowers rates to stimulate borrowing,
              investment, and consumer spending.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Types of Interest Rates</h2>
            <div className={`space-y-4`}>
              {[
                { name: 'Policy Rate', desc: 'The benchmark rate set by the central bank. Also called the federal funds rate (U.S.), bank rate (U.K.), or main refinancing rate (ECB). This is the rate tracked in our Currency Hierarchy dashboard.' },
                { name: 'Interbank Rate', desc: 'The rate at which commercial banks lend to each other overnight. Examples include SOFR (U.S.), SONIA (U.K.), and EURIBOR (Eurozone). These closely track the policy rate but are market-determined.' },
                { name: 'Lending Rate', desc: 'The rate commercial banks charge customers for loans. This is typically several percentage points above the policy rate, reflecting the bank\'s operating costs and risk assessment.' },
                { name: 'Deposit Rate', desc: 'The rate banks pay depositors for savings. Usually below the policy rate, the gap between lending and deposit rates (the spread) represents the bank\'s margin.' },
                { name: 'Bond Yield', desc: 'The return an investor earns by holding a government or corporate bond. Long-term bond yields reflect market expectations about future interest rates and inflation.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How Interest Rates Affect the Economy</h2>
            <p className="mb-4 text-base leading-relaxed">
              Higher interest rates make borrowing more expensive. Businesses delay expansion plans,
              consumers reduce spending on credit, and mortgage costs rise, cooling the housing market.
              This tends to slow economic growth and reduce inflationary pressure. However, higher rates
              also attract foreign capital seeking better returns, which can strengthen the domestic currency.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Lower interest rates have the opposite effect. Cheap credit encourages business investment,
              consumer spending, and home purchases. Economic activity tends to accelerate. However,
              prolonged low rates can fuel asset bubbles, excessive debt accumulation, and eventual
              inflationary pressure, as seen in many economies following the extended low-rate periods
              after the 2008 financial crisis and the 2020 pandemic response.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Interest Rates and Currency Value</h2>
            <p className="mb-4 text-base leading-relaxed">
              Interest rate differentials between countries are a primary driver of exchange rate
              movements. When a country raises its rates relative to others, its currency tends to
              appreciate because foreign investors move capital to earn the higher return. This
              relationship is central to the carry trade strategy and is visible in our Currency
              Hierarchy analysis tools.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Reading Interest Rate Data on Our Platform</h2>
            <p className="mb-4 text-base leading-relaxed">
              On our <a href="/currency-hierarchy" className="text-blue-600 dark:text-blue-400 hover:underline">Currency Hierarchy</a> page,
              you can view current central bank policy rates for all tracked economies, compare rate
              levels across countries, and explore how rate changes correlate with currency strength
              and economic performance. The main dashboard also includes interest rate data as one of
              the key indicators available for cross-country comparison.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Real-World Example: The 2022&ndash;2023 Rate Hiking Cycle</h2>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                In March 2022, US inflation hit 8.5 percent, the highest in four decades. The Federal Reserve
                responded with the most aggressive rate hiking cycle since the 1980s, raising the federal funds
                rate from near zero to 5.25&ndash;5.50 percent in just 16 months. The ECB followed with similar
                hikes. The result was a sharp tightening of financial conditions globally: mortgage rates doubled,
                technology stock valuations fell, and emerging market currencies came under pressure as capital
                flowed toward higher US yields. By late 2023, inflation was retreating in most economies, but the
                debate over how long rates should remain elevated continued.
              </p>
            </div>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Related Guides</h2>
            <ul className="space-y-2">
              <li><a href="/currency-hierarchy" className="text-blue-600 dark:text-blue-400 hover:underline">Currency Hierarchy Dashboard</a> &mdash; Compare central bank rates globally</li>
              <li><a href="/guides/how-central-banks-work" className="text-blue-600 dark:text-blue-400 hover:underline">How Central Banks Work</a> &mdash; Deep dive into monetary policy tools</li>
              <li><a href="/guides/inflation-guide" className="text-blue-600 dark:text-blue-400 hover:underline">Understanding Inflation</a> &mdash; How inflation and interest rates interact</li>
              <li><a href="/guides/currencies-and-exchange-rates" className="text-blue-600 dark:text-blue-400 hover:underline">Currencies and Exchange Rates</a> &mdash; How rate differentials move currencies</li>
              <li><a href="/guides/glossary" className="text-blue-600 dark:text-blue-400 hover:underline">Glossary</a> &mdash; Definitions of key economic terms</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

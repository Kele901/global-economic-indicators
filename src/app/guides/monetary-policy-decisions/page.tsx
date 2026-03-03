'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function MonetaryPolicyDecisionsGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Understanding Monetary Policy Decisions</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          How central banks set interest rates, the tools they use beyond rate changes, and why monetary policy decisions ripple through the global economy.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Is Monetary Policy?</h2>
            <p className="mb-4 text-base leading-relaxed">
              Monetary policy is the process by which a central bank manages the supply of money and
              the cost of borrowing to achieve macroeconomic objectives, primarily price stability
              (low and stable inflation) and maximum employment. Unlike fiscal policy (government
              spending and taxation), monetary policy is typically set by an independent institution
              insulated from political pressure, allowing it to take unpopular but necessary decisions
              like raising interest rates during an economic boom.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              The most visible tool is the <strong>policy interest rate</strong>, sometimes called the
              overnight rate, federal funds rate (in the US), or bank rate. This is the rate at which
              commercial banks borrow from the central bank or from each other on a short-term basis.
              Changes to this rate cascade through the entire financial system, affecting mortgage rates,
              corporate bond yields, savings account returns, and even stock prices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Rate Decision Process</h2>
            <p className="mb-4 text-base leading-relaxed">
              Central banks typically meet on a fixed schedule (e.g., the Fed meets eight times a year)
              to review economic data and decide whether to adjust the policy rate. At each meeting,
              the committee votes on one of three outcomes:
            </p>
            <div className="space-y-4">
              {[
                { name: 'Rate Hike (Tightening)', desc: 'Raises the cost of borrowing to slow economic activity and bring down inflation. Typically used when inflation is running above the central bank\'s target (usually around 2%). Higher rates discourage borrowing, reduce spending, and strengthen the currency.' },
                { name: 'Rate Cut (Easing)', desc: 'Lowers the cost of borrowing to stimulate economic activity. Used during recessions or when growth is slowing and inflation is subdued. Cheaper credit encourages businesses to invest and consumers to spend, though it can weaken the currency.' },
                { name: 'Hold (No Change)', desc: 'Keeps the rate unchanged when the committee judges that current policy is appropriate. A hold can be "hawkish" (leaning toward future hikes) or "dovish" (leaning toward future cuts) depending on the accompanying statement and press conference tone.' },
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Beyond Interest Rates</h2>
            <p className="mb-4 text-base leading-relaxed">
              Modern central banks employ a broader toolkit, especially since the 2008 financial crisis
              pushed rates to near-zero in many economies:
            </p>
            <div className="space-y-4">
              {[
                { name: 'Quantitative Easing (QE)', desc: 'The central bank purchases government bonds and other assets to inject money into the financial system, lowering long-term interest rates when short-term rates are already near zero. The Fed, ECB, and Bank of Japan have all used QE extensively.' },
                { name: 'Quantitative Tightening (QT)', desc: 'The reverse of QE: the central bank allows bonds on its balance sheet to mature without reinvesting, or actively sells them, draining liquidity from the system and putting upward pressure on yields.' },
                { name: 'Forward Guidance', desc: 'Communicating the likely future path of policy rates to shape market expectations. Phrases like "rates will remain elevated for some time" or "we expect to begin easing by mid-year" directly influence long-term borrowing costs before any actual rate change occurs.' },
                { name: 'Reserve Requirements', desc: 'The fraction of deposits that banks must hold as reserves. Lowering requirements frees up more money for lending. This tool is used more frequently by emerging market central banks like the PBoC.' },
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Transmission Mechanisms</h2>
            <p className="mb-4 text-base leading-relaxed">
              When a central bank changes its policy rate, the effects ripple outward through several channels:
            </p>
            <ul className={`list-disc pl-6 space-y-2 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Interest rate channel:</strong> Changes in the policy rate feed through to commercial lending rates, mortgage rates, and savings rates, directly affecting the cost of credit for households and businesses.</li>
              <li><strong>Exchange rate channel:</strong> Higher rates attract foreign capital seeking better returns, increasing demand for the domestic currency and causing it to appreciate. This makes imports cheaper but exports more expensive.</li>
              <li><strong>Wealth channel:</strong> Rate changes affect asset prices. Higher rates typically push bond prices and stock valuations lower, reducing household wealth and dampening consumption.</li>
              <li><strong>Expectations channel:</strong> Central bank communication shapes inflation expectations. If businesses expect inflation to remain at 2%, they set prices and wages accordingly, making the target self-fulfilling.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Policy Divergence Between Central Banks</h2>
            <p className="mb-4 text-base leading-relaxed">
              Different economies face different conditions, so central banks often move in opposite
              directions. When the Federal Reserve raises rates while the European Central Bank holds
              or cuts, the interest rate differential widens, causing capital to flow toward the
              higher-yielding currency. This policy divergence has profound effects on exchange rates,
              trade competitiveness, and capital flows to emerging markets, which often borrow in
              dollars and suffer when the dollar strengthens.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Our <a href="/monetary-policy" className="text-blue-600 dark:text-blue-400 hover:underline">Monetary Policy Tracker</a> visualizes
              these divergences by showing rate paths for all major central banks side by side, along with
              their most recent decisions and forward guidance statements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Reading the Decision Timeline</h2>
            <p className="mb-4 text-base leading-relaxed">
              On our Monetary Policy Tracker page, the decision timeline shows each central bank&apos;s
              recent actions color-coded by type: <span className="text-red-500 font-semibold">red for hikes</span>,
              <span className="text-green-500 font-semibold"> green for cuts</span>, and
              <span className="text-yellow-500 font-semibold"> yellow for holds</span>. The magnitude of
              the change (e.g., +25bps, -50bps) tells you how aggressive the move was. A 25-basis-point
              change is standard; 50 or 75 basis points signals urgency. The forward guidance section
              summarizes each bank&apos;s communicated outlook, helping you anticipate future moves.
            </p>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore More</h2>
            <ul className="space-y-2">
              <li><a href="/monetary-policy" className="text-blue-600 dark:text-blue-400 hover:underline">Monetary Policy Tracker</a> &mdash; Live rate decisions and forward guidance</li>
              <li><a href="/guides/how-central-banks-work" className="text-blue-600 dark:text-blue-400 hover:underline">How Central Banks Work</a> &mdash; Structure and mandates of major central banks</li>
              <li><a href="/guides/scenario-analysis" className="text-blue-600 dark:text-blue-400 hover:underline">Scenario Analysis &amp; Correlations</a> &mdash; Simulate rate change impacts</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

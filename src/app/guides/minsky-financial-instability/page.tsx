'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function MinskyFinancialInstabilityGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Minsky&apos;s Financial Instability Hypothesis</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Why long stretches of calm in finance can plant the seeds of crisis, how hedge and Ponzi finance differ, and what policymakers watch for when credit runs ahead of the real economy.
        </p>
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Who Was Hyman Minsky?</h2>
            <p className="mb-4 text-base leading-relaxed">
              Hyman Minsky (1919&ndash;1996) was a post-Keynesian economist whose work on financial fragility received little mainstream attention while he was alive. His framework stressed that capitalist economies with modern banking are inherently prone to boom-and-bust dynamics driven by debt and expectations, not only by &ldquo;real&rdquo; shocks to productivity or preferences.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              After the global financial crisis of 2007&ndash;2009, his ideas moved to the center of public debate. PIMCO&apos;s Paul McCulley popularized the phrase &ldquo;Minsky Moment&rdquo; to describe the instant when lenders and investors lose confidence, funding dries up, and a previously stable credit boom unwinds in a rush. Minsky&apos;s core insight is counterintuitive: periods of stability do not prove the system is safe; they encourage risk-taking that can make the system fragile.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Three Types of Finance</h2>
            <p className="mb-4 text-base leading-relaxed">
              Minsky classified borrowing positions by whether expected cash flows are sufficient to meet debt obligations. The economy rarely sits in one box; over a cycle, balance sheets often migrate from safer structures toward riskier ones.
            </p>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <h3 className="font-semibold mb-1">Hedge Finance</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Cash flows from operations or income are expected to cover both interest and principal over the life of the loan. Repayment does not depend on refinancing markets or rising asset prices. This is the most conservative structure: default risk is lower because the borrower can service debt from ordinary inflows.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <h3 className="font-semibold mb-1">Speculative Finance</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Cash flows cover interest but not principal; the borrower must roll over debt or sell assets when obligations come due. Viability hinges on continued market access and stable funding conditions. A shock to credit markets or a spike in rates can turn a manageable position into a crisis.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <h3 className="font-semibold mb-1">Ponzi Finance</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Cash flows cover neither principal nor interest in full; the borrower depends on asset price appreciation, new borrowing, or external subsidies to stay current. The name echoes Charles Ponzi, but Minsky used the term for ordinary firms and households when their repayment plans assume ever-higher valuations or perpetual cheap credit, not only for fraud schemes.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Instability Dynamic</h2>
            <p className="mb-4 text-base leading-relaxed">
              In Minsky&apos;s story, stability breeds complacency. Long expansions with few defaults lead lenders to compete on terms, loosen covenants, and extend credit to weaker borrowers. Households and firms respond by taking on more leverage, often justified by recent gains in asset prices and the memory of uninterrupted growth.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              The financial structure of the economy shifts: hedge positions give way to speculative ones, and speculative positions edge toward Ponzi finance as margins of safety shrink. The system looks robust until a discrete event&mdash;a policy tightening, a funding freeze, or a reassessment of collateral&mdash;triggers the &ldquo;Minsky Moment,&rdquo; when confidence snaps and the process runs in reverse. Forced deleveraging, fire sales, and credit contraction can amplify a modest shock into a deep recession.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Historical Minsky Moments</h2>
            <p className="mb-4 text-base leading-relaxed">
              Many crises fit the Minsky narrative: credit and asset prices run ahead of income, then a sudden repricing exposes fragile funding structures.
            </p>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <h3 className="font-semibold mb-1">2008 Global Financial Crisis</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Subprime mortgages, securitization chains, and shadow banking created chains of speculative and Ponzi-like exposure: repayment relied on refinancing, rising house prices, and the assumption that structured products would always find buyers.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <h3 className="font-semibold mb-1">2000 Dot-Com Bust</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Equity markets funded companies with minimal revenue and aggressive cash-burn models. When new capital stopped arriving at the same pace, valuations collapsed and the speculative funding model broke.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <h3 className="font-semibold mb-1">1997 Asian Financial Crisis</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Short-term foreign-currency borrowing and pegged exchange rates left borrowers exposed when capital flows reversed. Debt serviced in dollars while revenues were local became a classic mismatch when currencies and asset prices fell together.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <h3 className="font-semibold mb-1">2022 Crypto Stress</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Episodes around FTX, Terra/Luna, and interconnected leverage in decentralized finance illustrated Ponzi-like reliance on token appreciation and continuous inflows rather than sustainable cash flows from real economic activity.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Identifying Minsky Dynamics Today</h2>
            <p className="mb-4 text-base leading-relaxed">
              There is no single dial labeled &ldquo;Minsky risk,&rdquo; but analysts look for combinations of rapid credit growth, stretched valuations, and rising debt service burdens relative to income. Common indicators include:
            </p>
            <ul className={`list-disc ml-6 mb-4 space-y-2 text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Credit to the private non-financial sector growing persistently faster than nominal GDP, signaling leverage building in the economy.</li>
              <li>Private debt service ratios, which capture how much income is absorbed by interest and principal payments.</li>
              <li>Asset price-to-income metrics (housing, equities) that rise far above historical norms without a matching improvement in fundamentals.</li>
              <li>Firm- and sector-level leverage, including off-balance-sheet commitments and short-term wholesale funding that must be rolled frequently.</li>
            </ul>
            <p className="mb-4 text-base leading-relaxed">
              The Bank for International Settlements publishes a credit-to-GDP gap, which compares the ratio of credit to GDP to its long-run trend. Large positive gaps are interpreted as early warnings that credit may be outrunning sustainable economic expansion&mdash;one operational way to flag Minsky-type buildup, though no indicator is foolproof.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Policy Implications</h2>
            <p className="mb-4 text-base leading-relaxed">
              If instability is endogenous to finance, policy cannot rely only on cleaning up after crashes. Macroprudential tools&mdash;such as caps on loan-to-value ratios, countercyclical capital buffers for banks, and stress tests that assume simultaneous shocks to asset prices and funding&mdash;aim to lean against the cycle before positions become systemically Ponzi-like.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              A long-running debate opposes &ldquo;lean&rdquo; versus &ldquo;clean&rdquo;: whether central banks and regulators should try to deflate credit and asset bubbles preemptively, or focus on low inflation and financial stability ex post. Minsky&apos;s framework tends to support a more proactive &ldquo;lean&rdquo; view, while critics worry about misidentifying bubbles and over-tightening. In practice, many jurisdictions now combine monetary policy with macroprudential policy to address financial-cycle risks without putting the entire burden on short-term interest rates alone.
            </p>
          </section>

          <section className={`rounded-lg p-4 sm:p-5 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'}`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Key Takeaways</h2>
            <ul className={`text-sm space-y-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>&bull; Minsky argued that stability encourages risk-taking, so calm markets can mask rising fragility rather than prove resilience.</li>
              <li>&bull; Hedge, speculative, and Ponzi finance describe how tightly cash flows cover debt; economies often migrate toward riskier structures late in a boom.</li>
              <li>&bull; A &ldquo;Minsky Moment&rdquo; is the break in confidence when funding and asset prices no longer support fragile balance sheets.</li>
              <li>&bull; Credit gaps, debt service burdens, and valuation ratios help monitor buildup; the BIS credit gap is a widely cited macro indicator.</li>
              <li>&bull; Macroprudential rules and the lean-versus-clean debate frame how aggressively policymakers try to prevent versus repair financial excess.</li>
            </ul>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore Economic Cycles</h2>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              See cycle indicators, Minsky-phase framing, and interactive dashboards tied to credit and asset dynamics on our economic cycles page.
            </p>
            <a
              href="/economic-cycles"
              className="inline-block text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Open Economic Cycles &rarr;
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

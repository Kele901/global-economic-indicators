'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function MonetaryPolicyRegimesGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Monetary Policy Regimes Through History</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          How the rules of money changed from the gold standard to floating rates, QE, and today&apos;s search for a stable &ldquo;normal.&rdquo;
        </p>
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Is a Monetary Regime?</h2>
            <p className="mb-4 text-base leading-relaxed">
              A monetary regime is the institutional framework that governs how money is created, how exchange rates are anchored (or left to float), and how central banks relate to governments and markets. It is not just a policy stance on a given day but the set of constraints and expectations that shape behavior over years or decades. Each regime tends to leave a signature on inflation dynamics, growth volatility, and the way financial crises unfold.
            </p>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Regimes differ in whether the price level is tied to a commodity, a foreign currency, or domestic policy discretion; whether capital flows freely; and whether the lender of last resort can create reserves without a hard external constraint. Those choices determine how shocks propagate and who bears the adjustment cost.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Classical Gold Standard (1870&ndash;1914)</h2>
            <p className="mb-4 text-base leading-relaxed">
              Under the classical gold standard, national currencies were defined as fixed weights of gold, and central banks stood ready to buy or sell gold at that parity. The system encouraged long-horizon price stability and predictable exchange rates, which supported trade and investment across the British-led international economy.
            </p>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <h3 className="font-semibold mb-2">Adjustment and limits</h3>
              <p className={`text-sm leading-relaxed mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                David Hume&apos;s specie-flow mechanism described how trade imbalances could self-correct: a country that imported more than it exported would see gold drain out, tighten money, and experience deflation until competitiveness improved. In practice, adjustment was often painful, biased toward deflation rather than symmetric inflation abroad, and London&apos;s role as banker to the world concentrated power and responsibility in the United Kingdom.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Interwar Chaos (1914&ndash;1944)</h2>
            <p className="mb-4 text-base leading-relaxed">
              World War I forced countries to suspend convertibility and finance massive spending. After the war, several powers tried to restore gold at pre-war parities without reconciling domestic wages, debts, and productivity. The United Kingdom&apos;s return in 1925 at the old rate is often cited as an overvalued pound that hurt industry and employment.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Competitive devaluations, protectionist tariffs, and &ldquo;beggar-thy-neighbor&rdquo; trade policies spread as each country sought export relief. Meanwhile, Germany&apos;s hyperinflation undermined faith in paper money and social order. The interwar period showed how fragile fixed-exchange commitments become when fiscal needs, war reparations, and banking panics collide.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Bretton Woods (1944&ndash;1971)</h2>
            <p className="mb-4 text-base leading-relaxed">
              The Bretton Woods conference designed a system in which the US dollar was pegged to gold at $35 per ounce and other currencies pegged to the dollar within narrow bands. The International Monetary Fund and World Bank were created to oversee adjustment and reconstruction. Capital controls were common; the arrangement prioritized trade and stability over pure financial openness.
            </p>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <h3 className="font-semibold mb-2">The Triffin Dilemma and the end</h3>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                As global trade grew, the world needed more dollar liquidity, which required the United States to run balance-of-payments deficits. Those same outflows eventually strained confidence that all foreign-held dollars could be redeemed in gold. Robert Triffin highlighted this contradiction. In 1971, President Nixon closed the gold window, ending direct dollar convertibility and marking the transition toward the modern era of fiat currencies and managed floats.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Great Inflation (1971&ndash;1982)</h2>
            <p className="mb-4 text-base leading-relaxed">
              Floating exchange rates removed an external anchor just as oil shocks and wage-price spirals hit. Many central banks struggled to anchor expectations; political pressure sometimes favored short-run growth over price stability. Federal Reserve Chair Arthur Burns is often associated with insufficiently tight policy relative to rising inflation, illustrating how credibility can erode when the public doubts the central bank&apos;s commitment.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Paul Volcker&apos;s tenure brought &ldquo;shock therapy&rdquo;: the federal funds rate reached roughly twenty percent as the Fed squeezed demand to break inflation psychology. The cost included a deep recession, but it also restored the idea that the central bank could and would prioritize stable money over immediate popularity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Great Moderation (1982&ndash;2007)</h2>
            <p className="mb-4 text-base leading-relaxed">
              From the mid-1980s through the mid-2000s, many advanced economies enjoyed lower macroeconomic volatility and more stable inflation. Central bank independence spread; explicit or implicit inflation targets became common. The Taylor Rule and related frameworks gave markets a shorthand for how policy might respond to output and inflation gaps.
            </p>
            <ul className={`list-disc ml-6 mb-4 space-y-2 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Financial deregulation and innovation expanded credit and securitization.</li>
              <li>Markets began to price in a &ldquo;Greenspan put&rdquo;&mdash;the belief that the Fed would cushion serious equity or funding stress with easier policy.</li>
            </ul>
            <p className="mb-4 text-base leading-relaxed">
              The period&apos;s stability may have encouraged risk-taking and leverage that set the stage for the global financial crisis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">QE Era (2007&ndash;2021)</h2>
            <p className="mb-4 text-base leading-relaxed">
              When policy rates hit the effective zero lower bound after the 2008 crisis, major central banks turned to large-scale asset purchases&mdash;quantitative easing&mdash;to ease financial conditions and support inflation and employment targets. Some jurisdictions experimented with negative policy rates. Forward guidance became a primary tool for shaping expectations when cuts alone were insufficient.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              The COVID-19 shock triggered another wave of aggressive easing, emergency lending facilities, and balance-sheet expansion. Central bank assets grew to multiples of pre-crisis levels, blurring lines between monetary and fiscal support. The era redefined what &ldquo;normal&rdquo; policy looked like and raised long-run questions about exit strategies and market dependence on central bank liquidity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Current Normalization</h2>
            <p className="mb-4 text-base leading-relaxed">
              Post-pandemic supply disruptions and demand recovery brought the highest inflation in decades across many economies. Central banks embarked on one of the fastest hiking cycles since the Volcker years. Financial stress reappeared in episodes such as the March 2023 failure of Silicon Valley Bank, highlighting how rapid rate increases can destabilize institutions that relied on cheap funding and long-duration assets.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Unwinding QE through balance-sheet runoff or sales (&ldquo;quantitative tightening&rdquo;) runs alongside rate policy. Debates over &ldquo;higher for longer&rdquo; versus early easing reflect uncertainty about the neutral rate, fiscal trajectories, and whether inflation has truly returned to target. The current regime is one of discretionary inflation targeting under floating rates, with large central bank balance sheets as a legacy condition rather than a temporary oddity.
            </p>
          </section>

          <section>
            <div className={`rounded-lg p-4 sm:p-5 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'}`}>
              <h2 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Key Takeaways</h2>
              <ul className={`text-sm space-y-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>&bull; A monetary regime is the durable rulebook for money creation, exchange rates, and central bank power&mdash;not just the level of interest rates today.</li>
                <li>&bull; Hard anchors (gold, dollar-gold) can stabilize prices but create adjustment strains and, under Bretton Woods, internal contradictions like the Triffin dilemma.</li>
                <li>&bull; Losing credibility is costly to regain; Volcker-style tightening showed recessions can be the price of restoring trust in low inflation.</li>
                <li>&bull; The Great Moderation combined credible targets with financial innovation that also built fragility; the QE era expanded tools and balance sheets in ways markets still digest.</li>
                <li>&bull; Normalization after shocks is inherently bumpy: rapid hikes stress banks and markets, while shrinking large balance sheets remains an unfinished experiment.</li>
              </ul>
            </div>
          </section>

          <section className={`p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">See It in the App</h2>
            <p className={`mb-4 text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Explore regimes, cycles, and policy timelines alongside interactive charts on our economic cycles hub.
            </p>
            <a href="/economic-cycles" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Open Economic Cycles &rarr;</a>
          </section>
        </div>
      </div>
    </div>
  );
}

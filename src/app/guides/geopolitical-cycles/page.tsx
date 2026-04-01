'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function GeopoliticalCyclesGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Geopolitical Cycles and the Global Economy</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          How shifts in power, conflict, and monetary order interact with macroeconomic cycles, reserve currencies, and investment risk.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Geopolitics and Economics</h2>
            <p className="mb-4 text-base leading-relaxed">
              Macroeconomics does not unfold in a vacuum. Power transitions, wars, sanctions, and alliances
              reshape trade routes, energy prices, fiscal priorities, and the rules of the international
              monetary system. When a dominant state guarantees sea lanes or financial plumbing, borrowing
              costs and investment flows across the world adjust. When that order frays, uncertainty rises
              and cycles lengthen or amplify. Treating geopolitics as separate from economics misses how
              expectations, institutions, and coercion jointly drive inflation, growth, and asset prices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Reserve Currency Privilege</h2>
            <p className="mb-4 text-base leading-relaxed">
              A reserve currency is one that central banks and institutions hold in large quantities to
              settle trade, intervene in markets, and store value. The issuer typically enjoys lower
              borrowing costs, seigniorage from global demand for its liabilities, and outsized influence
              over payment systems and sanctions. Barry Eichengreen described this as the &ldquo;exorbitant
              privilege&rdquo; of the United States: the dollar&apos;s role lets America fund external
              deficits on easier terms than other countries. Historically, sterling filled this role before
              World War I; war finance, gold strains, and New York&apos;s deepening markets gradually
              shifted the center to the dollar, cemented after 1945.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              The privilege is not fixed. IMF Currency Composition of Official Foreign Exchange Reserves
              (COFER) data show the dollar&apos;s share of allocated global reserves around 71 percent in
              2000 and roughly 58 percent today&mdash;a gradual erosion, not an overnight break, as other
              assets and diversification slowly chip away at dominance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Thucydides Trap</h2>
            <p className="mb-4 text-base leading-relaxed">
              Graham Allison popularized the &ldquo;Thucydides Trap&rdquo;: when a rising power threatens
              to displace a ruling one, both sides face incentives that make catastrophic conflict more
              likely. Thucydides himself wrote that the growth of Athenian power and the fear it produced
              in Sparta made war inevitable. Allison&apos;s survey of modern cases finds war in twelve of
              sixteen rivalries; the exceptions include managed competition rather than hot war.
            </p>
            <div className="space-y-4">
              {[
                {
                  name: 'Germany vs Britain (World War I)',
                  desc: 'Industrial and naval competition in Europe helped turn diplomatic crises into a general war, disrupting trade and ending the classical gold standard era.',
                },
                {
                  name: 'Japan vs United States (World War II)',
                  desc: "Clash over Pacific spheres and resource access culminated in total war and a wholesale reordering of Asia's economic architecture.",
                },
                {
                  name: 'Soviet Union vs United States (Cold War)',
                  desc: 'Ideological and military rivalry stayed mostly below the threshold of direct superpower war, illustrating a peaceful exception with still-enormous economic costs.',
                },
                {
                  name: 'China vs United States (ongoing)',
                  desc: 'Trade, technology, and security competition shape supply chains, industrial policy, and capital flows without a settled end state.',
                },
              ].map((item) => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How Wars Shape Economic Cycles</h2>
            <p className="mb-4 text-base leading-relaxed">
              Major conflicts reset institutions and growth paths. World War I strained belligerents&apos;
              finances and helped end the gold standard as we knew it. World War II produced Bretton Woods,
              the IMF and World Bank, and a Pax Americana that defined postwar cycles. The Cold War channeled
              spending into R&amp;D that later commercialized into the internet and GPS. The Gulf War
              underscored oil as a transmission belt from the Middle East to global inflation and recessions.
              After 9/11, security spending, deficits, and financial surveillance reshaped fiscal and
              regulatory priorities. Russia&apos;s invasion of Ukraine accelerated energy repricing,
              sanctions, and talk of deglobalization, feeding volatility in trade and investment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The De-dollarization Debate</h2>
            <p className="mb-4 text-base leading-relaxed">
              BRICS summits and China&apos;s promotion of the renminbi reflect political appetite for
              alternatives to dollar-centric plumbing. Yet practical substitutes remain limited: the euro
              zone is a large economy but politically fragmented on fiscal and security policy; the RMB is
              not fully convertible with deep open capital markets like the dollar&apos;s; gold is a store
              of value but awkward for invoicing and settling modern trade at scale. Network effects,
              legal frameworks, and liquidity in U.S. Treasuries create inertia that short-run bilateral
              deals rarely overturn.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Implications for Investors</h2>
            <p className="mb-4 text-base leading-relaxed">
              Geopolitical risk often shows up as a higher required return on assets exposed to chokepoints,
              autocratic partners, or sanctions. Firms have diversified supply chains and brought production
              closer to end markets (nearshoring, friend-shoring). Defense spending cycles respond to threat
              perceptions, creating sector-specific booms and busts. Sanctions and export controls can strand
              assets or suddenly close markets, so scenario analysis and country concentration matter as much
              as valuation multiples.
            </p>
            <ul className={`list-disc ml-6 space-y-2 text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Watch the geopolitical risk premium in emerging-market spreads and equity volatility.</li>
              <li>Map supply chains for single-country or single-strait dependency.</li>
              <li>Track fiscal plans tied to industrial policy and defense budgets.</li>
              <li>Stress-test portfolios for sanctions and asset-freeze scenarios.</li>
            </ul>
          </section>

          <div className={`rounded-lg p-4 sm:p-5 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'}`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Key Takeaways</h2>
            <ul className={`text-sm space-y-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>&bull; Power transitions and conflict reshape trade, money, and growth; macro models need geopolitical context.</li>
              <li>&bull; Reserve currency status confers borrowing advantages and influence but can erode slowly, as COFER illustrates.</li>
              <li>&bull; The Thucydides Trap highlights structural tension between rising and ruling powers; history mixes war and cold peace.</li>
              <li>&bull; Wars and shocks reset monetary regimes and technology paths, leaving long shadows on cycles.</li>
              <li>&bull; De-dollarization is politically loud but economically constrained by liquidity, convertibility, and networks.</li>
              <li>&bull; Portfolios should price sanctions risk, supply-chain geography, and defense-led fiscal shifts.</li>
            </ul>
          </div>

          <section className={`p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore on the platform</h2>
            <p className={`mb-4 text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Our Economic Cycles experience ties together historical phases, policy regimes, and cycle
              overlays so you can connect macro narratives to data.
            </p>
            <a
              href="/economic-cycles"
              className="inline-block text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Open Economic Cycles &rarr;
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

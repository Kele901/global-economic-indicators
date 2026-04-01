'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function MarketCycleIndicatorsGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Market Cycle Indicators</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          How valuation ratios, sector behavior, global timing, and the yield curve help locate markets within the recurring rhythm from undervaluation through euphoria, stress, and recovery.
        </p>
        <div className="space-y-8">
          <div className={`rounded-lg p-4 sm:p-5 mb-8 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'}`}>
            <h2 className="text-lg font-semibold mb-3">Key Takeaways</h2>
            <ul className={`list-disc ml-6 space-y-2 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Market cycle indicators estimate where prices sit between cheap, fair, expensive, and crisis—not a timetable for trades.</li>
              <li>The Buffett Indicator and Shiller CAPE compress a lot of information into single ratios; both excel at extremes but miss nuance at the margin.</li>
              <li>Sector rotation reflects how earnings expectations, rates, and risk appetite shift across early, mid, late, and defensive phases.</li>
              <li>A global market clock reminds you that the United States, Europe, Japan, and China rarely share the same phase—diversification and currency matter.</li>
              <li>Combine signals: yield curve, valuations, and rotation disagree often; false positives and negatives are why judgment and risk management still dominate timing.</li>
            </ul>
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What Are Market Cycle Indicators?</h2>
            <p className="mb-4 text-base leading-relaxed">
              Market cycle indicators are tools that summarize where financial markets likely sit within a repeating pattern: assets look cheap after fear and forced selling, re-rate toward fair value as confidence returns, stretch into overvaluation as optimism compounds, then correct—sometimes violently—before the process begins again. They do not predict the day of the next drawdown; they describe conditions under which future returns have historically been higher or lower on average.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Used well, these measures anchor expectations: they explain why identical news can move prices differently at a trough versus a peak, and why &ldquo;this time is different&rdquo; often appears exactly when several independent gauges align at historic extremes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Buffett Indicator</h2>
            <p className="mb-4 text-base leading-relaxed">
              The Buffett Indicator divides total stock market capitalization by nominal GDP. Warren Buffett called it &ldquo;probably the best single measure of where valuations stand.&rdquo; The idea is simple: corporate value cannot indefinitely outrun the economic output that ultimately supports profits. Practitioners often express the ratio as a percentage of GDP.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Rule-of-thumb bands are illustrative, not laws: readings materially below roughly 75% of GDP have often coincided with cheaper markets; roughly 75% to 115% with more neutral territory; and sustained levels above about 140% with rich valuations. The measure rose into stretched territory before the 2000 equity peak and again ahead of the 2007–2009 crisis, which burnished its reputation for flagging euphoric phases.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Limitations are structural. U.S. firms earn an increasing share of profits abroad, so domestic GDP understates the earnings base. Large-scale quantitative easing and buybacks can lift market cap relative to GDP without an equivalent jump in economic throughput. Treat the Buffett Indicator as a macro sanity check, not a standalone trigger.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Shiller CAPE Ratio</h2>
            <p className="mb-4 text-base leading-relaxed">
              Robert Shiller&apos;s cyclically adjusted price-to-earnings (CAPE) ratio divides real price by average real earnings over the past ten years. Smoothing across a full business cycle dampens the spike and plunge in reported earnings that distorts a simple trailing P/E at turning points.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Long-run averages for the U.S. market cluster near the mid-teens—often cited around 17. CAPE climbed to about 44 around the dot-com peak in 2000, near 27 before the global financial crisis, and in recent years has stood well above historical norms, at times exceeding 35. Those episodes illustrate how expensive markets can remain—and for how long—before a catalyst arrives.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              CAPE is not static truth. Changes in accounting, payout policy (buybacks versus dividends), sector weights (technology versus financials), and globalization can shift the fair level over decades. Compare CAPE to its own history and to other signals rather than to a single magic number.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Sector Rotation Model</h2>
            <p className="mb-4 text-base leading-relaxed">
              Sector rotation describes how leadership among industries tends to shift as the business cycle ages. Early-cycle recoveries often favor economically sensitive groups such as consumer discretionary and financials when credit spreads improve and rate cuts feed demand. Mid-cycle expansions frequently see industrials and technology participate as capital spending and productivity narratives strengthen.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Late-cycle dynamics—tighter labor markets, rising input costs, and policy restraint—can benefit energy, materials, and sometimes healthcare as investors seek pricing power or defensiveness with a growth tilt. In recessions or severe risk-off periods, utilities and consumer staples often outperform on stable cash flows and dividend demand.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Rotation is driven by evolving earnings revisions, discount rates, and risk appetite—not by a calendar. Portfolio managers use rotation frameworks to tilt factor and sector exposure, always weighing whether the cycle is &ldquo;early&rdquo; in data or already priced in by forward-looking markets.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <h3 className="font-semibold mb-1">Early to mid-cycle</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Discretionary, financials, and cyclicals often lead when growth reaccelerates and policy is supportive.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <h3 className="font-semibold mb-1">Late cycle and downturn</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Commodity-linked sectors, quality defensives, or low-volatility cash-flow stories tend to draw flows as risk budgets shrink.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Global Market Clock</h2>
            <p className="mb-4 text-base leading-relaxed">
              The global market clock places major economies at different points simultaneously. The United States might be late-cycle with tight labor markets while Europe lags on energy and manufacturing, Japan navigates demographics and yield-curve control legacies, and China manages credit and property imbalances on its own timetable.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Those gaps explain why a U.S.-centered slowdown does not automatically become a simultaneous global downturn, and why multinational earnings can diverge from domestic GDP. Capital flows and exchange rates transmit shocks unevenly: when U.S. rates are high and the dollar strong, funding conditions tighten elsewhere, but local stimulus or valuation discounts can still support non-U.S. assets. For allocation, the clock highlights regional equity weights, hedged versus unhedged currency exposure, and where carry and valuation spreads look most compelling once cyclical context is layered in.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Yield Curve as Market Signal</h2>
            <p className="mb-4 text-base leading-relaxed">
              The spread between long and short Treasury yields—commonly the ten-year minus the two-year—compresses when investors expect slower growth or easier policy ahead, and can invert when near-term rates exceed long rates. In the United States, sustained inversions have preceded every recession since 1970, typically with a lag of about six to eighteen months, though the lag varies.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Inversion is not a sell-everything rule; it signals that the bond market prices a policy mistake, financial stress, or growth downshift serious enough to force eventual easing. The 2022–2024 episode featured a deep and persistent inversion as the Federal Reserve hiked aggressively into inflation, prompting debate about whether structural factors (term premia, quantitative tightening, fiscal issuance) lengthened the delay before economic contraction. Interpreting the curve still requires pairing it with credit conditions, real rates, and labor data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Combining Indicators</h2>
            <p className="mb-4 text-base leading-relaxed">
              No single gauge suffices. CAPE can stay elevated for years; the Buffett Indicator struggles with globalization; sector rotation whipsaws around shocks; the yield curve has produced false recession signals outside the United States and occasional late or early calls domestically. A composite view—valuations, curve shape, credit spreads, earnings breadth, and liquidity—reduces reliance on any one failure mode.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Expect false positives (signals without recession) and false negatives (sudden breaks without a clean warning). The payoff of synthesis is not perfect timing but better risk budgeting: position size, liquidity reserves, and scenario planning when multiple independent indicators lean the same way.
            </p>
          </section>

          <div className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h3 className="font-semibold mb-2">Explore cycle tools in the app</h3>
            <p className={`text-sm mb-4 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              The Economic Cycles hub ties together dashboards, timelines, and narrative context so you can compare indicators side by side instead of reading them in isolation.
            </p>
            <a
              href="/economic-cycles"
              className="inline-block text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Go to Economic Cycles &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

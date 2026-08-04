'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function MethodologyPage() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Methodology</h1>

        <div className="space-y-8">
          <section>
            <p className="mb-4 text-base leading-relaxed">
              This page explains how Global Economic Indicators collects, processes, and presents
              economic data. Understanding our methodology helps you interpret the charts and
              figures on the platform with appropriate context and confidence.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Collection</h2>
            <p className="mb-4 text-base leading-relaxed">
              Our platform retrieves data from multiple institutional APIs at the moment a user
              visits a page. This approach ensures that the information displayed reflects the most
              recent data available from each source. The primary data retrieval flow works as follows:
            </p>
            <ol className={`list-decimal ml-6 mb-4 space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>The client-side application requests data from our Next.js API routes, which act as proxy endpoints.</li>
              <li>These server-side routes forward the request to the upstream data provider (e.g., World Bank, FRED) and handle CORS, rate limiting, and error recovery.</li>
              <li>The response is parsed, normalized into a consistent format, and returned to the client.</li>
              <li>The client stores the response in a local cache with a 24-hour time-to-live to minimize redundant API calls.</li>
            </ol>
            <p className="mb-4 text-base leading-relaxed">
              For indicators that lack reliable free APIs, we maintain curated static datasets
              compiled from official institutional reports and publications. These fallback datasets
              are versioned and updated periodically. Examples include venture capital funding data
              (sourced from Crunchbase and Dealroom public reports), AI patent statistics (from WIPO
              annual reports), and digital economy adoption rates (from World Bank Findex and
              eMarketer publications).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">API Sources and Indicator Codes</h2>
            <p className="mb-4 text-base leading-relaxed">
              Each metric displayed on the platform maps to a specific indicator code from its source
              database. This ensures traceability and allows users to verify values against the
              original source. The table below summarizes key sources and their indicator categories.
            </p>
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                    <th className="text-left py-2 pr-4 font-semibold">Source</th>
                    <th className="text-left py-2 pr-4 font-semibold">Indicators</th>
                    <th className="text-left py-2 font-semibold">Update Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  <tr><td className="py-2 pr-4">World Bank</td><td className="py-2 pr-4">GDP, trade, employment, R&amp;D, patents, internet, broadband</td><td className="py-2">Annual (1-2 year lag)</td></tr>
                  <tr><td className="py-2 pr-4">FRED</td><td className="py-2 pr-4">U.S. interest rates, money supply, employment, tech indicators</td><td className="py-2">Monthly/Quarterly</td></tr>
                  <tr><td className="py-2 pr-4">IMF</td><td className="py-2 pr-4">Government debt, exchange rates, balance of payments</td><td className="py-2">Annual/Quarterly</td></tr>
                  <tr><td className="py-2 pr-4">OECD</td><td className="py-2 pr-4">STEM graduates, R&amp;D personnel, labor statistics</td><td className="py-2">Annual</td></tr>
                  <tr><td className="py-2 pr-4">WIPO</td><td className="py-2 pr-4">Patent filings, trademark applications</td><td className="py-2">Annual</td></tr>
                  <tr><td className="py-2 pr-4">ITU</td><td className="py-2 pr-4">Internet users, mobile subscriptions, broadband</td><td className="py-2">Annual</td></tr>
                  <tr><td className="py-2 pr-4">Eurostat</td><td className="py-2 pr-4">EU R&amp;D expenditure, high-tech trade</td><td className="py-2">Annual</td></tr>
                  <tr><td className="py-2 pr-4">BIS</td><td className="py-2 pr-4">Central bank policy rates</td><td className="py-2">Daily/Monthly</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Normalization</h2>
            <p className="mb-4 text-base leading-relaxed">
              Different sources report data in different formats, units, and time granularities.
              We normalize all data into a consistent structure before display:
            </p>
            <ul className={`list-disc ml-6 mb-4 space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Country naming:</strong> All sources use different country identifiers (ISO-2, ISO-3, full names). We standardize to readable names (e.g., &ldquo;SouthKorea&rdquo;, &ldquo;USA&rdquo;, &ldquo;UK&rdquo;) used consistently across the platform.</li>
              <li><strong>Time aggregation:</strong> Monthly or quarterly data is aggregated to annual averages when displayed alongside annual indicators, ensuring consistent time-series comparisons.</li>
              <li><strong>Unit consistency:</strong> Percentages, per-capita figures, and absolute values are clearly labeled. Currency values are reported in current U.S. dollars unless otherwise noted.</li>
              <li><strong>Missing values:</strong> Where a country does not report a value for a given year, that data point is omitted from charts rather than interpolated or estimated.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Caching Strategy</h2>
            <p className="mb-4 text-base leading-relaxed">
              To balance data freshness with performance, we implement a two-tier caching system.
              Server-side API routes cache responses from upstream providers for a configurable
              period, reducing the number of outbound API calls. On the client side, fetched data
              is stored in the browser&apos;s localStorage with a 24-hour time-to-live and a
              version identifier. When we release updates that change data structures or add new
              indicators, incrementing the cache version forces all clients to fetch fresh data on
              their next visit.
            </p>
          </section>

          <section id="derived-metrics">
            <h2 className="text-2xl font-semibold mb-4">Derived Metrics</h2>
            <p className="mb-4 text-base leading-relaxed">
              Some values on the site are not fetched directly from a source — we compute them
              from one or more raw indicators. The definitions below are the exact formulas the
              codebase uses. Every chart that shows a derived value has a &ldquo;?&rdquo;
              methodology popover next to its title that links back to the anchor here.
            </p>

            <div id="real-policy-rate" className="mb-6 scroll-mt-24">
              <h3 className="text-lg font-semibold mb-2">Real policy rate</h3>
              <p className={`text-sm leading-relaxed mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                The nominal short-term policy rate stripped of headline CPI inflation. Captures
                whether monetary policy is restrictive (positive) or stimulative (negative) in
                inflation-adjusted terms. Uses the ex-post approximation
                (nominal − realised inflation) rather than an ex-ante expected-inflation gauge,
                because real-time inflation expectations are only reliably available for a
                handful of economies.
              </p>
              <pre className={`text-xs rounded p-3 overflow-x-auto ${isDarkMode ? 'bg-gray-800 text-emerald-300' : 'bg-gray-100 text-emerald-700'}`}>
{`realPolicyRate = policyRate − CPI YoY (%)

Inputs:
  policyRate  — FRED FEDFUNDS / OECD IRSTCI01 / BIS
  inflation   — World Bank FP.CPI.TOTL.ZG`}
              </pre>
            </div>

            <div id="term-spread" className="mb-6 scroll-mt-24">
              <h3 className="text-lg font-semibold mb-2">Term spread</h3>
              <p className={`text-sm leading-relaxed mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                The 10-year sovereign bond yield minus the short-term policy rate — the most
                common proxy for yield-curve slope. Persistently negative values (an
                &ldquo;inverted curve&rdquo;) have preceded every US recession in the modern
                data set. We use BIS long-term rates hosted on FRED because OECD&apos;s SDMX
                endpoint for IRLTLT is unreliable.
              </p>
              <pre className={`text-xs rounded p-3 overflow-x-auto ${isDarkMode ? 'bg-gray-800 text-emerald-300' : 'bg-gray-100 text-emerald-700'}`}>
{`termSpread = LT bond yield (10Y) − short-term policy rate

Inputs:
  10Y yield   — FRED-hosted BIS IRLTLT01XXM156N
  policyRate  — FRED FEDFUNDS / OECD IRSTCI01 / BIS`}
              </pre>
            </div>

            <div id="income-share-bottom-40" className="mb-6 scroll-mt-24">
              <h3 className="text-lg font-semibold mb-2">Income share of bottom 40%</h3>
              <p className={`text-sm leading-relaxed mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                World Bank publishes income shares by quintile (bottom 20%, second 20%,
                third 20%, fourth 20%, top 20%). It does not publish the bottom-40 boundary
                directly, so we sum the two poorest quintiles. This is arithmetic — no
                estimation or interpolation — but it means bottom-40 is only available for
                the country-years where both quintile series report.
              </p>
              <pre className={`text-xs rounded p-3 overflow-x-auto ${isDarkMode ? 'bg-gray-800 text-emerald-300' : 'bg-gray-100 text-emerald-700'}`}>
{`bottom40 = SI.DST.FRST.20 + SI.DST.02ND.20`}
              </pre>
            </div>

            <div id="palma-ratio" className="mb-6 scroll-mt-24">
              <h3 className="text-lg font-semibold mb-2">Palma ratio</h3>
              <p className={`text-sm leading-relaxed mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Cobham &amp; Sumner (2013) proposed the Palma ratio as a more informative
                inequality gauge than the Gini coefficient, on the argument that the middle
                50-60% of any distribution moves relatively little and that meaningful
                inequality changes are concentrated at the tails.
              </p>
              <pre className={`text-xs rounded p-3 overflow-x-auto ${isDarkMode ? 'bg-gray-800 text-emerald-300' : 'bg-gray-100 text-emerald-700'}`}>
{`palma = top10 / (bottom20 + secondBottom20)

Inputs:
  top10       — WB SI.DST.10TH.10
  bottom40    — sum of SI.DST.FRST.20 + SI.DST.02ND.20`}
              </pre>
            </div>

            <div id="debt-sustainability-score" className="mb-6 scroll-mt-24">
              <h3 className="text-lg font-semibold mb-2">Debt sustainability score</h3>
              <p className={`text-sm leading-relaxed mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                A composite 0-100 score used on <a href="/debt" className="text-blue-600 dark:text-blue-400 hover:underline">/debt</a>.
                Starts at 100 and subtracts points for four warning signals: high debt-to-GDP,
                heavy debt service, structural deficits, and unfavourable
                interest-growth differentials. Weights are ordinal — this is a heuristic,
                not an IMF DSA — but the intuition mirrors standard sovereign-credit
                frameworks.
              </p>
              <pre className={`text-xs rounded p-3 overflow-x-auto ${isDarkMode ? 'bg-gray-800 text-emerald-300' : 'bg-gray-100 text-emerald-700'}`}>
{`score = 100
  − debtToGdp brackets     (>60% → −10, >90% → −20, >120% → −30)
  − debtService brackets   (>5% → −5, >10% → −15, >20% → −25)
  − budgetBalance brackets (< −3% → −10, < −6% → −20; surplus → +5)
  − rGrowthGap brackets    (>0 → −10, >3 → −20; else +5)
score is clamped to [0, 100]

Inputs:
  debtToGdp     — WB GC.DOD.TOTL.GD.ZS
  debtService   — WB DT.TDS.DECT.EX.ZS
  budgetBalance — WB GC.BAL.CASH.GD.ZS
  growth        — WB NY.GDP.MKTP.KD.ZG
  interest      — proxied by WB FR.INR.LEND`}
              </pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Composite Scores and Rankings</h2>
            <p className="mb-4 text-base leading-relaxed">
              Some features, such as the Innovation Ranking Table and the Technology Heatmap, compute
              composite scores by normalizing individual metrics to a 0&ndash;100 scale and applying
              weighted averages. The normalization uses min-max scaling across all countries for the
              selected year. Weights are assigned based on the relative importance and data quality
              of each indicator. These weights are documented in the source code and can be reviewed
              in our technology indicators data file.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitations and Disclaimers</h2>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
              <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li><strong>Reporting lag:</strong> Most international economic indicators are published with a one- to two-year delay. The most recent year shown may not represent the current calendar year.</li>
                <li><strong>Data revisions:</strong> Source institutions periodically revise historical data. Our platform reflects the latest revision available at the time of the API call.</li>
                <li><strong>Coverage gaps:</strong> Not all countries report all indicators. Smaller or less developed economies may have limited data availability.</li>
                <li><strong>Fallback data:</strong> Static datasets are sourced from reputable publications but may not update as frequently as live API data.</li>
                <li><strong>Not financial advice:</strong> The information presented on this platform is for educational and informational purposes only. It should not be interpreted as financial, investment, or policy advice.</li>
              </ul>
            </div>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Questions About Our Methodology?</h2>
            <p className="leading-relaxed">
              If you have questions about how specific data points are calculated or sourced, please
              visit our <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact page</a> to
              get in touch. We are committed to transparency and happy to clarify any aspect of our
              data processing approach.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

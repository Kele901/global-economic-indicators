'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function EconomicForecastingGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Economic Forecasting &amp; Outlook</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          How economic forecasts are produced, what the IMF World Economic Outlook tells us, and how to interpret projections with appropriate skepticism.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Why Forecasts Matter</h2>
            <p className="mb-4 text-base leading-relaxed">
              Economic forecasts influence trillions of dollars in decisions every year. Governments
              use GDP and revenue projections to set budgets. Central banks rely on inflation forecasts
              to calibrate interest rates. Businesses plan investment based on growth expectations.
              Investors price assets using expected earnings, which depend on the economic outlook.
              Understanding how forecasts are produced, and their limitations, is essential for
              interpreting economic data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The IMF World Economic Outlook</h2>
            <p className="mb-4 text-base leading-relaxed">
              The International Monetary Fund publishes its <strong>World Economic Outlook (WEO)</strong> twice
              a year, in April and October, with interim updates in January and July. The WEO covers
              nearly every country and projects key indicators like GDP growth, inflation, unemployment,
              trade volumes, and fiscal balances typically two to five years ahead.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              These projections combine three methodologies:
            </p>
            <div className="space-y-4">
              {[
                { name: 'Econometric Models', desc: 'Statistical models that use historical relationships between variables (e.g., how interest rate changes affect GDP growth) to project future outcomes. The IMF uses its Global Integrated Monetary and Fiscal Model (GIMF) among others.' },
                { name: 'Country Desk Analysis', desc: 'IMF country teams incorporate local knowledge, policy announcements, structural reforms, and political context that pure statistical models might miss. Each country projection reflects both data-driven modeling and expert judgment.' },
                { name: 'Cross-Country Consistency', desc: 'Projections are reconciled globally so that one country\'s export growth aligns with its partners\' import growth, and commodity prices and exchange rates are consistent across forecasts.' },
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Historical vs. Forecast Data</h2>
            <p className="mb-4 text-base leading-relaxed">
              On our <a href="/outlook" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Forecasts &amp; Outlook</a> page,
              charts display both historical data (solid lines) and forecast projections (dashed lines).
              The transition point marks the boundary between what has actually been observed and what
              is projected. It is important to recognize that forecasts become increasingly uncertain
              as they extend further into the future.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              For context, IMF growth forecasts for the current year typically have a margin of error
              of about 1 percentage point, and forecasts two years ahead have errors of 2-3 percentage
              points. During crises (like 2008 or 2020), forecast errors can be much larger, as standard
              models struggle to capture discontinuous events.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Risks and Uncertainty</h2>
            <p className="mb-4 text-base leading-relaxed">
              Every WEO includes a risk assessment identifying factors that could push outcomes above
              or below the baseline projection. These risks are categorized as:
            </p>
            <ul className={`list-disc pl-6 space-y-2 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Upside risks:</strong> Faster-than-expected technology adoption, successful structural reforms, positive supply shocks (e.g., falling energy prices), or stronger consumer confidence.</li>
              <li><strong>Downside risks:</strong> Geopolitical escalation, financial market stress, trade wars, commodity price spikes, pandemic resurgence, or policy mistakes (premature tightening or delayed action).</li>
              <li><strong>Two-sided risks:</strong> Some factors like AI adoption could either accelerate productivity growth (upside) or cause labor market disruption (downside) depending on the transition speed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Regional vs. Country Projections</h2>
            <p className="mb-4 text-base leading-relaxed">
              The WEO provides projections at both the country and regional level. Regional aggregates
              (like &quot;Advanced Economies&quot; or &quot;Emerging and Developing Asia&quot;) are GDP-weighted averages
              that smooth out country-specific noise and reveal broader trends. For example, emerging
              Asia consistently outgrows advanced economies by 2-4 percentage points, reflecting
              catch-up dynamics and demographic dividends.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Our Outlook page shows both levels: country-specific projection charts with historical
              overlays, and a regional bar chart comparing growth expectations across major economic blocs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Interpreting Forecasts Wisely</h2>
            <div className="space-y-4">
              {[
                { name: 'Forecasts Are Not Predictions', desc: 'Projections represent the most likely outcome given current information and assumptions. They are conditional on assumed policy paths, commodity prices, and no major shocks. The actual outcome will almost certainly differ.' },
                { name: 'Direction Matters More Than Precision', desc: 'Is growth accelerating or decelerating? Is inflation rising or falling? The directional trend in forecast revisions is often more informative than the exact numbers.' },
                { name: 'Revisions Tell a Story', desc: 'When the IMF revises its growth forecast for a country upward by 0.5 percentage points between April and October, that reveals new positive information. Tracking revisions over time reveals evolving sentiment about an economy.' },
                { name: 'Compare Multiple Sources', desc: 'The IMF, OECD, World Bank, and private sector forecasters often disagree. The consensus (average across forecasters) tends to outperform any single forecast. Divergence between forecasts signals higher uncertainty.' },
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore More</h2>
            <ul className="space-y-2">
              <li><a href="/outlook" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Forecasts &amp; Outlook</a> &mdash; IMF projections alongside historical data</li>
              <li><a href="/guides/debt-sustainability" className="text-blue-600 dark:text-blue-400 hover:underline">Debt Sustainability Explained</a> &mdash; How debt projections tie into sustainability</li>
              <li><a href="/guides/scenario-analysis" className="text-blue-600 dark:text-blue-400 hover:underline">Scenario Analysis &amp; Correlations</a> &mdash; Build your own &quot;what if&quot; projections</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

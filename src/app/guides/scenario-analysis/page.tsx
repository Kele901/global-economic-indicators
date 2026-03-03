'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function ScenarioAnalysisGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Scenario Analysis &amp; Correlations</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          How the scenario simulator uses historical correlations to project economic impacts, what correlation means (and doesn&apos;t mean), and how to interpret results responsibly.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Is Scenario Analysis?</h2>
            <p className="mb-4 text-base leading-relaxed">
              Scenario analysis is the practice of asking &quot;what if?&quot; questions about the economy.
              What if interest rates rise by 2 percentage points? What if oil prices double? What
              if a country&apos;s GDP growth slows to zero? By modeling the potential consequences of
              these hypothetical changes, analysts, policymakers, and investors can prepare for a
              range of outcomes rather than relying on a single forecast.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Our <a href="/simulator" className="text-blue-600 dark:text-blue-400 hover:underline">&quot;What If&quot; Scenario Simulator</a> uses
              historical correlations between economic variables to estimate how a change in one
              metric might affect others. This is a data-driven approach, but it comes with important
              caveats that every user should understand.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Understanding Correlation</h2>
            <p className="mb-4 text-base leading-relaxed">
              Correlation measures how two variables move together over time. The Pearson correlation
              coefficient ranges from -1 to +1:
            </p>
            <div className="space-y-4">
              {[
                { name: 'Strong Positive (+0.7 to +1.0)', desc: 'The two variables tend to move in the same direction. Example: GDP growth and employment tend to be strongly positively correlated -- when the economy grows, more people are employed.' },
                { name: 'Weak/No Correlation (-0.3 to +0.3)', desc: 'Little to no consistent relationship between the variables. Changes in one do not reliably predict changes in the other.' },
                { name: 'Strong Negative (-1.0 to -0.7)', desc: 'The two variables tend to move in opposite directions. Example: unemployment and GDP growth are typically negatively correlated -- when growth slows, unemployment rises.' },
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Correlation vs. Causation</h2>
            <p className="mb-4 text-base leading-relaxed">
              This is the single most important concept to understand when using the simulator.
              Just because two variables are correlated does not mean one causes the other.
              Correlation can arise from several sources:
            </p>
            <ul className={`list-disc pl-6 space-y-2 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Direct causation:</strong> A central bank raises rates, and borrowing costs increase directly. The causal link is clear and mechanical.</li>
              <li><strong>Reverse causation:</strong> High inflation might correlate with rate hikes, but the rate hikes don&apos;t cause inflation -- they&apos;re a response to it.</li>
              <li><strong>Common cause:</strong> Both GDP growth and stock market returns might rise together, not because one causes the other, but because both are driven by technological innovation or favorable demographics.</li>
              <li><strong>Coincidence:</strong> Some correlations are statistically significant but economically meaningless. The classic example: ice cream sales correlate with drowning deaths, but only because both increase in summer.</li>
            </ul>
            <p className="mt-4 mb-4 text-base leading-relaxed">
              Our simulator labels results as <strong>estimates based on historical correlation</strong>,
              not predictions. Always apply economic reasoning to assess whether a correlation reflects
              a plausible causal mechanism before acting on it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Lagged Correlations</h2>
            <p className="mb-4 text-base leading-relaxed">
              Economic effects often don&apos;t manifest immediately. When a central bank raises interest
              rates, the full impact on GDP growth may take 12-18 months to materialize as the higher
              rates work through mortgage renewals, business investment decisions, and consumer spending
              patterns. The simulator accounts for this by computing <strong>lagged correlations</strong>,
              which measure how a change in one variable today correlates with changes in another
              variable one or two years later.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              A &quot;1yr lag&quot; label on a result means the historical relationship suggests the impact
              appears approximately one year after the initial change. A &quot;0yr lag&quot; means the
              effect tends to appear in the same year. These lag estimates are derived from the
              data and represent average historical patterns, not precise timings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Confidence Levels</h2>
            <p className="mb-4 text-base leading-relaxed">
              Each simulated impact includes a confidence indicator based on the strength and
              consistency of the underlying correlation:
            </p>
            <div className="space-y-4">
              {[
                { name: 'High Confidence', desc: 'Strong correlation (|r| > 0.7) with a sufficient number of data points. The historical pattern is clear and consistent. Example: the negative correlation between interest rates and housing investment tends to be strong and reliable across countries.' },
                { name: 'Medium Confidence', desc: 'Moderate correlation (|r| 0.4-0.7). The relationship exists but is less consistent. External factors frequently modify the impact. Results should be treated as rough directional estimates.' },
                { name: 'Low Confidence', desc: 'Weak correlation (|r| < 0.4) or limited data. The historical relationship is unreliable and the estimated impact may not materialize. Use with caution and supplement with economic reasoning.' },
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitations</h2>
            <ul className={`list-disc pl-6 space-y-2 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Past is not prologue:</strong> Historical correlations can break down during structural economic shifts, regime changes, or unprecedented events.</li>
              <li><strong>Non-linear effects:</strong> The simulator assumes linear relationships, but in reality, a 1% rate hike may have a different proportional effect than a 5% hike. Extreme scenarios may produce unreliable estimates.</li>
              <li><strong>Omitted variables:</strong> The model considers pairwise correlations but not the complex interplay of dozens of simultaneous variables that characterize real economies.</li>
              <li><strong>Country specificity:</strong> Correlations are computed per country, but structural differences between time periods (pre- vs. post-financial crisis) can affect results.</li>
            </ul>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore More</h2>
            <ul className="space-y-2">
              <li><a href="/simulator" className="text-blue-600 dark:text-blue-400 hover:underline">&quot;What If&quot; Scenario Simulator</a> &mdash; Build and run economic scenarios</li>
              <li><a href="/guides/monetary-policy-decisions" className="text-blue-600 dark:text-blue-400 hover:underline">Understanding Monetary Policy Decisions</a> &mdash; How rate changes affect the economy</li>
              <li><a href="/guides/economic-forecasting" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Forecasting &amp; Outlook</a> &mdash; Professional forecasting approaches</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function ReadingEconomicDataGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">How to Read Economic Data</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          A beginner-friendly introduction to interpreting charts, understanding key indicators, and making sense of the numbers on our platform.
        </p>

        <div className={`rounded-lg p-4 sm:p-5 mb-8 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'}`}>
          <h2 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Key Takeaways</h2>
          <ul className={`text-sm space-y-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>&bull; Rates and ratios (GDP growth, unemployment rate) are better for cross-country comparison than absolute numbers.</li>
            <li>&bull; Always check axis scales, time periods, and data sources before drawing conclusions from charts.</li>
            <li>&bull; Context matters: the same metric can mean different things for developed versus emerging economies.</li>
            <li>&bull; Use our 14 in-depth guides below to build understanding of specific economic topics.</li>
          </ul>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <p className="mb-4 text-base leading-relaxed">
              Economic data can feel overwhelming at first. Dozens of indicators, each measured
              differently, across dozens of countries, spanning decades of history. The key to making
              sense of it all is to focus on a few core concepts and build from there. This guide
              introduces the most important ideas you need to confidently explore our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Absolute Numbers vs. Rates and Ratios</h2>
            <p className="mb-4 text-base leading-relaxed">
              Economic indicators come in two main flavors. Absolute numbers tell you the total
              size of something: total GDP, total patent applications, total trade volume. Rates
              and ratios tell you about relative performance: GDP growth rate, R&amp;D as a
              percentage of GDP, unemployment rate. For cross-country comparison, rates and ratios
              are usually more useful because they account for differences in country size.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              For example, China files more total patents than any other country, but when measured
              as patents per million people, smaller innovative economies like South Korea and
              Israel often rank higher. Both perspectives are valuable and tell different stories.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Reading Time-Series Charts</h2>
            <p className="mb-4 text-base leading-relaxed">
              Most charts on our platform show data over time, with years on the horizontal axis
              and values on the vertical axis. When reading these charts, focus on:
            </p>
            <ul className={`list-disc ml-6 mb-4 space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Direction:</strong> Is the line going up, down, or flat? An upward trend in GDP growth is positive; an upward trend in government debt may be concerning.</li>
              <li><strong>Slope:</strong> How steep is the change? A gentle upward trend suggests steady growth; a sharp spike suggests a sudden event or crisis.</li>
              <li><strong>Turning points:</strong> Where does the trend reverse? These inflection points often correspond to policy changes, economic shocks, or structural shifts.</li>
              <li><strong>Comparison:</strong> When multiple countries are shown, look at how their lines relate. Do they move together (correlated) or diverge (independent)?</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Key Economic Indicators Explained</h2>
            <div className="space-y-4">
              {[
                { name: 'GDP Growth', desc: 'Gross Domestic Product growth measures how fast an economy is expanding. Positive growth means the economy is producing more goods and services. Negative growth (recession) means output is shrinking. Most healthy economies grow between two and four percent annually.' },
                { name: 'Unemployment Rate', desc: 'The percentage of the labor force actively seeking but unable to find work. Low unemployment (below five percent) generally indicates a strong economy, while high rates suggest economic distress. The definition varies slightly by country.' },
                { name: 'Inflation Rate', desc: 'The annual rate of change in consumer prices. Most central banks target around two percent. Higher rates erode purchasing power; deflation (negative inflation) can be equally damaging. See our detailed inflation guide for more.' },
                { name: 'Government Debt (% of GDP)', desc: 'Total public debt expressed relative to the size of the economy. Japan exceeds 250 percent while others maintain below 60 percent. Context matters: high debt is more sustainable in countries with strong institutions and low borrowing costs.' },
                { name: 'Trade Balance', desc: 'Exports minus imports. A surplus means the country sells more abroad than it buys; a deficit means the opposite. Neither is inherently good or bad, as the implications depend on the underlying economic structure.' },
                { name: 'Foreign Direct Investment', desc: 'Cross-border investment into productive assets. High FDI inflows signal international confidence in a country\'s business environment and growth prospects.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Common Pitfalls</h2>
            <ul className={`list-disc ml-6 mb-4 space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Confusing correlation with causation:</strong> Two indicators moving together does not mean one causes the other. Always consider alternative explanations.</li>
              <li><strong>Ignoring scale:</strong> A chart that starts at a non-zero baseline can make small changes look dramatic. Always check the axis labels.</li>
              <li><strong>Cherry-picking time periods:</strong> Trends can look very different depending on the start and end dates chosen. Use the full available range for context.</li>
              <li><strong>Comparing unlike metrics:</strong> A country&apos;s GDP growth rate and another&apos;s GDP level are fundamentally different measures and should not be directly compared.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Navigating Our Platform</h2>
            <p className="mb-4 text-base leading-relaxed">
              Each page on Global Economic Indicators is organized around a theme. The main
              Dashboard provides a broad overview. Specialized pages dive deeper into specific
              topics. Most pages include interactive charts where you can select countries, switch
              metrics, and adjust time ranges. Hover over any data point for exact values.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Guides Library</h2>
            <p className="mb-4 text-base leading-relaxed">
              For deeper dives into specific topics, explore our educational guides:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Understanding Interest Rates', href: '/guides/understanding-interest-rates', desc: 'How central banks set rates and why they matter' },
                { title: 'Understanding Inflation', href: '/guides/inflation-guide', desc: 'What drives prices, CPI, and central bank response' },
                { title: 'Global Trade Explained', href: '/guides/global-trade-explained', desc: 'Trade balances, comparative advantage, and trade flows' },
                { title: 'Technology & Innovation Metrics', href: '/guides/technology-innovation-metrics', desc: 'R&D, patents, and how innovation is measured' },
                { title: 'Economic Cycles Explained', href: '/guides/economic-cycles-explained', desc: 'Business cycles, debt crises, and Dalio frameworks' },
                { title: 'Currencies and Exchange Rates', href: '/guides/currencies-and-exchange-rates', desc: 'Forex, reserve currencies, and currency tiers' },
                { title: 'GDP and National Accounts', href: '/guides/gdp-and-national-accounts', desc: 'Nominal vs real GDP, per capita, and PPP' },
                { title: 'Government Debt Explained', href: '/guides/government-debt-explained', desc: 'Sovereign debt, fiscal deficits, and sustainability' },
                { title: 'Emerging vs Developed Economies', href: '/guides/emerging-vs-developed-economies', desc: 'Classification, risk profiles, and comparison tips' },
                { title: 'How Central Banks Work', href: '/guides/how-central-banks-work', desc: 'QE, policy tools, and inflation targeting' },
                { title: 'Understanding Employment Data', href: '/guides/understanding-employment-data', desc: 'Unemployment, participation, and labor metrics' },
                { title: 'Digital Economy and AI', href: '/guides/digital-economy-and-ai', desc: 'AI patents, digital payments, and e-commerce' },
                { title: 'Glossary of Economic Terms', href: '/guides/glossary', desc: 'A-Z definitions of 55+ economic and financial terms' }
              ].map(guide => (
                <a
                  key={guide.href}
                  href={guide.href}
                  className={`block p-4 rounded-lg transition-colors ${
                    isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <h3 className="font-semibold mb-1 text-blue-600 dark:text-blue-400">{guide.title}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{guide.desc}</p>
                </a>
              ))}
            </div>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Ready to Explore?</h2>
            <ul className="space-y-2">
              <li><a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">Dashboard</a> &mdash; Start with the global overview</li>
              <li><a href="/compare" className="text-blue-600 dark:text-blue-400 hover:underline">Compare Countries</a> &mdash; Side-by-side analysis</li>
              <li><a href="/methodology" className="text-blue-600 dark:text-blue-400 hover:underline">Methodology</a> &mdash; How we collect and process data</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

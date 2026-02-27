'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function EmploymentGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Understanding Employment Data</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          What unemployment and employment metrics really measure, their limitations, and how to interpret labor market data across countries.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Key Employment Metrics</h2>
            <div className="space-y-4">
              {[
                { name: 'Unemployment Rate', desc: 'The percentage of the labor force actively seeking but unable to find work. A person must be without a job, available to work, and actively searching to be counted as unemployed. This definition means discouraged workers who have stopped looking are excluded, potentially understating true joblessness.' },
                { name: 'Labor Force Participation Rate', desc: 'The percentage of the working-age population that is either employed or actively seeking employment. A falling participation rate can mask labor market weakness: if people stop looking for work, the unemployment rate can fall even as fewer people are employed.' },
                { name: 'Employment-to-Population Ratio', desc: 'The percentage of the working-age population that is employed. This is arguably the most straightforward measure because it is not affected by changes in who is counted as "in the labor force." If this ratio falls, fewer people are working relative to the population.' },
                { name: 'Underemployment Rate', desc: 'Captures people working part-time who want full-time work, plus marginally attached workers. The ILO\'s broader U-6 measure in the United States is typically 3-5 percentage points higher than the headline unemployment rate.' },
                { name: 'Youth Unemployment', desc: 'The unemployment rate for people aged 15-24. Youth unemployment is typically two to three times the overall rate and can be extremely high in countries with rigid labor markets or skills mismatches. Spain and Greece saw youth unemployment exceed 50 percent during the eurozone crisis.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Full Employment</h2>
            <p className="mb-4 text-base leading-relaxed">
              Full employment does not mean zero unemployment. Some unemployment is natural and
              even desirable: people transitioning between jobs (frictional unemployment), workers
              whose skills do not match available positions (structural unemployment), and seasonal
              fluctuations. Economists estimate the &ldquo;natural rate&rdquo; of unemployment at
              roughly four to five percent for most developed economies, though this varies by
              country and changes over time.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              When unemployment falls below the natural rate, it signals a very tight labor
              market. Employers compete for scarce workers by raising wages, which can feed
              through to higher prices and inflation. This is why the Federal Reserve monitors
              employment alongside inflation when setting interest rates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cross-Country Comparisons</h2>
            <p className="mb-4 text-base leading-relaxed">
              Employment data is not perfectly comparable across countries due to differences in
              definitions, survey methods, and labor market structures. Europe&apos;s stronger
              worker protections mean layoffs are less common during downturns but also make it
              harder for the unemployed to find new positions. Countries with large informal
              sectors (India, Nigeria, Brazil) may have low official unemployment but widespread
              underemployment and precarious work.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Cultural factors also matter. Japan&apos;s very low unemployment rate partly
              reflects a cultural norm against firing workers and a preference for
              underemployment within firms rather than layoffs. Nordic countries have high
              participation rates partly because of extensive childcare and parental leave
              policies that keep both parents in the workforce.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Employment on Our Platform</h2>
            <p className="mb-4 text-base leading-relaxed">
              Unemployment rates and employment-to-population ratios are available on our
              <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline"> Dashboard</a> and
              <a href="/compare" className="text-blue-600 dark:text-blue-400 hover:underline"> Compare Countries</a> page.
              FRED data provides detailed US employment breakdowns. The Technology page includes
              tech-sector employment data showing how the digital economy is reshaping labor markets.
            </p>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore More</h2>
            <ul className="space-y-2">
              <li><a href="/compare" className="text-blue-600 dark:text-blue-400 hover:underline">Compare Countries</a> &mdash; Cross-country employment comparison</li>
              <li><a href="/guides/gdp-and-national-accounts" className="text-blue-600 dark:text-blue-400 hover:underline">GDP and National Accounts</a> &mdash; How employment relates to output</li>
              <li><a href="/guides/reading-economic-data" className="text-blue-600 dark:text-blue-400 hover:underline">How to Read Economic Data</a> &mdash; Interpreting charts and indicators</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function DevelopmentInequalityGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Human Development &amp; Inequality</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Why GDP alone is insufficient, how the Human Development Index captures well-being, what the Gini coefficient reveals about inequality, and how sustainability metrics connect to development.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Beyond GDP</h2>
            <p className="mb-4 text-base leading-relaxed">
              Gross Domestic Product measures the total value of goods and services produced in an
              economy, but it says nothing about how that wealth is distributed, whether citizens
              are healthy and educated, or whether growth is environmentally sustainable. A country
              can have high GDP per capita while large segments of its population live in poverty,
              lack access to healthcare, or face environmental degradation. This is why economists
              and policymakers increasingly look at development indicators that capture the quality
              of life, not just the quantity of economic output.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Human Development Index (HDI)</h2>
            <p className="mb-4 text-base leading-relaxed">
              Introduced by the United Nations Development Programme (UNDP) in 1990, the HDI
              combines three dimensions of human development into a single index scored from 0 to 1:
            </p>
            <div className="space-y-4">
              {[
                { name: 'Health: Life Expectancy at Birth', desc: 'A long and healthy life is the most fundamental aspect of development. This dimension captures not just medical care but also nutrition, sanitation, and safety. Countries with higher life expectancy generally have better healthcare systems and living conditions.' },
                { name: 'Education: Expected and Mean Years of Schooling', desc: 'Knowledge is measured by two sub-indicators: expected years of schooling for children entering school, and mean years of schooling for adults 25 and older. This captures both current educational investment and the accumulated human capital stock.' },
                { name: 'Standard of Living: GNI per Capita (PPP)', desc: 'Gross National Income per capita adjusted for purchasing power parity provides a measure of material well-being that accounts for price differences across countries. A person earning $30,000 in India has far more purchasing power than one earning the same in Norway.' },
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 mb-4 text-base leading-relaxed">
              On our <a href="/development" className="text-blue-600 dark:text-blue-400 hover:underline">Inequality &amp; Development</a> page,
              we compute a simplified HDI-like score using available World Bank data (life expectancy,
              school enrollment, and GDP per capita), normalized and averaged to produce a comparable
              development index for each country.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Gini Coefficient</h2>
            <p className="mb-4 text-base leading-relaxed">
              The Gini coefficient is the most widely used measure of income inequality. It ranges
              from 0 (perfect equality, where everyone has the same income) to 100 (perfect inequality,
              where one person has all the income). In practice, most countries fall between 25 and 65.
            </p>
            <ul className={`list-disc pl-6 space-y-2 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Low inequality (Gini below 30):</strong> Nordic countries like Sweden, Denmark, and Norway. Strong welfare states, progressive taxation, and universal public services compress the income distribution.</li>
              <li><strong>Moderate inequality (Gini 30-40):</strong> Most Western European countries and some advanced Asian economies. Market forces generate inequality, but redistribution policies moderate it.</li>
              <li><strong>High inequality (Gini above 40):</strong> The United States, much of Latin America, and several African nations. Structural factors like racial disparities, weak labor protections, or resource-dependent economies drive wide income gaps.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Social Progress Indicators</h2>
            <p className="mb-4 text-base leading-relaxed">
              Beyond headline indices, specific spending and outcome metrics reveal how governments
              invest in their citizens:
            </p>
            <div className="space-y-4">
              {[
                { name: 'Healthcare Expenditure (% of GDP)', desc: 'How much of national output is devoted to health services. Higher spending doesn\'t always mean better outcomes (the US spends the most but has lower life expectancy than many peers), but very low spending correlates with poor health indicators.' },
                { name: 'Education Expenditure (% of GDP)', desc: 'Government investment in education systems. Countries spending 4-6% of GDP on education tend to have higher literacy rates, better PISA scores, and more skilled workforces. Below 3% often signals underinvestment in human capital.' },
                { name: 'Gender Parity Index', desc: 'The ratio of female to male enrollment in education. A value near 1.0 indicates gender equality in education access. Many developing nations show significant gaps, particularly at the secondary and tertiary levels.' },
                { name: 'Youth Unemployment', desc: 'Unemployment rate among 15-24 year olds. High youth unemployment (above 25%) can indicate structural economic problems, skill mismatches, or lack of opportunity, and carries long-term scarring effects on earnings and career prospects.' },
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Sustainability &amp; Environment</h2>
            <p className="mb-4 text-base leading-relaxed">
              Increasingly, development analysis includes environmental sustainability. A country
              that achieves high GDP growth by depleting natural resources or generating massive
              carbon emissions may be undermining its long-term well-being. Our development page
              includes a scatter plot comparing CO2 emissions per capita against renewable energy
              consumption. The ideal quadrant is <strong>bottom-right</strong>: low emissions and
              high renewable energy use.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Nordic and Western European countries typically lead on sustainability, combining
              high development scores with relatively low carbon intensity. Major emerging economies
              like China and India face the tension between rapid growth and environmental sustainability,
              often having high emissions but growing renewable capacity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Reading the Development Scorecard</h2>
            <p className="mb-4 text-base leading-relaxed">
              On our dashboard, countries are ranked by their computed development score (0-100).
              The score combines life expectancy, education enrollment, GDP per capita, inequality
              (Gini), and healthcare spending into a single comparable number. Keep in mind that
              any composite index involves subjective weighting choices -- the score is meant to
              facilitate comparison, not to be a definitive ranking.
            </p>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore More</h2>
            <ul className="space-y-2">
              <li><a href="/development" className="text-blue-600 dark:text-blue-400 hover:underline">Inequality &amp; Development Index</a> &mdash; Interactive development and inequality dashboard</li>
              <li><a href="/guides/trade-networks" className="text-blue-600 dark:text-blue-400 hover:underline">Trade Networks &amp; Supply Chains</a> &mdash; How trade affects development outcomes</li>
              <li><a href="/global-heatmap" className="text-blue-600 dark:text-blue-400 hover:underline">Global Heatmap</a> &mdash; Visualize development metrics geographically</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

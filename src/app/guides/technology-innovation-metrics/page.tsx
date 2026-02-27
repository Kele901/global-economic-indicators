'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function TechInnovationGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Technology and Innovation Metrics</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          How nations measure innovation, what R&amp;D and patent data reveal, and how to use our Technology page.
        </p>

        <div className={`rounded-lg p-4 sm:p-5 mb-8 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'}`}>
          <h2 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Key Takeaways</h2>
          <ul className={`text-sm space-y-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>&bull; Innovation is measured through inputs (R&amp;D spending, researchers), outputs (patents, publications), and outcomes (high-tech exports, IP revenue).</li>
            <li>&bull; R&amp;D as a share of GDP ranges from under 0.5% in some developing nations to over 4% in Israel and South Korea.</li>
            <li>&bull; China has overtaken the US in total patent filings but quality and citation metrics still favor American and European innovation.</li>
            <li>&bull; The innovation pipeline shows that investment in inputs today drives economic output years or decades later.</li>
          </ul>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Why Measure Innovation?</h2>
            <p className="mb-4 text-base leading-relaxed">
              Innovation is widely recognized as the primary driver of long-term economic growth.
              Countries that invest in research, develop new technologies, and build skilled
              workforces tend to grow faster, create higher-value jobs, and maintain competitive
              advantages in the global economy. Measuring innovation activity helps policymakers,
              investors, and researchers understand where a nation stands and where it is heading.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Unlike GDP or inflation, innovation cannot be captured by a single number. It is
              measured through a collection of proxy indicators, each capturing a different aspect
              of the innovation ecosystem: how much is being invested, how many ideas are being
              generated, how effectively those ideas reach the market, and how the resulting
              technologies affect the economy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Input Indicators: Investment and Workforce</h2>
            <div className="space-y-4">
              {[
                { name: 'R&D Expenditure (% of GDP)', desc: 'The most fundamental measure of innovation investment. It captures spending by government, business, and universities on research and experimental development. Countries like Israel and South Korea spend over four percent of GDP on R&D, while the global average is around two percent.' },
                { name: 'Researchers in R&D', desc: 'The number of full-time equivalent researchers per million people. A higher density indicates stronger human capital dedicated to knowledge creation. Nordic countries and East Asian nations typically lead this metric.' },
                { name: 'STEM Graduates', desc: 'The share of university graduates in science, technology, engineering, and mathematics fields. This pipeline metric indicates a country\'s capacity to supply the technical workforce needed for innovation-driven industries.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Output Indicators: Ideas and IP</h2>
            <div className="space-y-4">
              {[
                { name: 'Patent Applications', desc: 'Patents protect inventions and are a widely used proxy for innovation output. Resident patents reflect domestic invention activity, while non-resident patents indicate foreign interest in a market. China and the United States lead global patent filings by a wide margin.' },
                { name: 'Trademark Applications', desc: 'Trademarks protect brand names and logos. High trademark activity indicates commercial innovation, product development, and entrepreneurial dynamism. Trademark data complements patent data by capturing commercial innovation that may not involve patentable inventions.' },
                { name: 'Scientific Publications', desc: 'The number of scientific and technical journal articles published by a country\'s researchers. This measures the contribution to the global knowledge base and correlates strongly with R&D spending and researcher density.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Outcome Indicators: Economic Impact</h2>
            <div className="space-y-4">
              {[
                { name: 'High-Tech Exports', desc: 'The share of manufactured exports classified as high-technology products. Countries with high shares (such as Singapore, South Korea, and China) have successfully translated innovation investment into globally competitive manufacturing.' },
                { name: 'IP Receipts and Payments', desc: 'Intellectual property royalty flows between countries. Net IP exporters (the United States, Japan, Germany) earn more from licensing their innovations abroad than they pay for foreign IP, indicating valuable knowledge assets.' },
                { name: 'Venture Capital and Startups', desc: 'VC funding levels, unicorn counts, and startup density measure the commercial translation of innovation. These metrics capture the entrepreneurial ecosystem that turns ideas into scalable businesses.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">The Innovation Pipeline</h2>
            <p className="mb-4 text-base leading-relaxed">
              Innovation follows a pipeline from inputs to outcomes. R&amp;D spending and education
              feed into research activities, which produce patents, publications, and trained
              researchers. These outputs then translate into economic outcomes: high-tech exports,
              technology-sector employment, and venture capital activity. Our Technology page&apos;s
              Insights tab visualizes this pipeline through a Sankey flow diagram, showing how
              each country converts innovation inputs into economic value.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Exploring Innovation on Our Platform</h2>
            <p className="mb-4 text-base leading-relaxed">
              Our <a href="/technology" className="text-blue-600 dark:text-blue-400 hover:underline">Technology &amp; Innovation</a> page
              provides ten specialized tabs covering R&amp;D investment, patents and IP, tech trade,
              digital infrastructure, startups, AI and emerging tech, digital economy, tech
              workforce, and advanced analytics. The R&amp;D Efficiency scatter plot shows which
              countries get the most patent output per unit of R&amp;D spending, while the heatmap
              matrix enables multi-metric comparison across all indicators simultaneously.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Real-World Example: South Korea&apos;s Innovation Transformation</h2>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                South Korea offers perhaps the most dramatic innovation success story of the past half century.
                In the 1960s, it was one of the poorest countries in the world. Through sustained investment in
                education, R&amp;D (now over 4.8% of GDP, the world&apos;s highest), and close government-industry
                collaboration, South Korea built globally dominant positions in semiconductors, consumer electronics,
                shipbuilding, and automotive manufacturing. Samsung and SK Hynix produce over 60% of the world&apos;s
                memory chips. This transformation shows how long-term commitment to innovation inputs can transform
                an economy&apos;s position in global value chains within a generation.
              </p>
            </div>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Related Guides</h2>
            <ul className="space-y-2">
              <li><a href="/technology" className="text-blue-600 dark:text-blue-400 hover:underline">Technology &amp; Innovation Dashboard</a> &mdash; Full suite of innovation metrics</li>
              <li><a href="/guides/digital-economy-and-ai" className="text-blue-600 dark:text-blue-400 hover:underline">Digital Economy and AI</a> &mdash; AI patents and digital transformation</li>
              <li><a href="/guides/global-trade-explained" className="text-blue-600 dark:text-blue-400 hover:underline">Global Trade Explained</a> &mdash; How tech exports fit into trade</li>
              <li><a href="/guides/emerging-vs-developed-economies" className="text-blue-600 dark:text-blue-400 hover:underline">Emerging vs Developed Economies</a> &mdash; Innovation across income groups</li>
              <li><a href="/guides/glossary" className="text-blue-600 dark:text-blue-400 hover:underline">Glossary</a> &mdash; Definitions of key economic terms</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

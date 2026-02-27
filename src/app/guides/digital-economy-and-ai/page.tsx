'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function DigitalEconomyGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">The Digital Economy and AI</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          How digitization is reshaping economies, what AI patent data reveals, and how to interpret the metrics of the digital transformation.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Is the Digital Economy?</h2>
            <p className="mb-4 text-base leading-relaxed">
              The digital economy encompasses all economic activity that results from billions
              of daily online connections between people, businesses, devices, data, and processes.
              It includes e-commerce, digital financial services, cloud computing, the platform
              economy, and the data-driven businesses that have become dominant forces in global
              markets. Estimates suggest the digital economy accounts for 15 to 25 percent of
              global GDP, and this share is growing rapidly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Measuring Digital Transformation</h2>
            <div className="space-y-4">
              {[
                { name: 'E-Commerce Penetration', desc: 'The share of retail sales conducted online. China leads globally at roughly 50 percent, followed by South Korea and the UK at around 30 percent. The COVID-19 pandemic accelerated adoption by 3-5 years in most markets.' },
                { name: 'Digital Payments Adoption', desc: 'The percentage of adults using digital payment methods. Sweden leads with over 95 percent cashless transactions. India\'s UPI system processes over 10 billion transactions monthly, making it the world\'s fastest-growing digital payments ecosystem.' },
                { name: 'ICT Service Exports', desc: 'Revenue from selling technology services internationally, including software development, IT consulting, and data processing. India and Ireland are leading exporters relative to their economies, reflecting their roles as global technology service hubs.' },
                { name: 'Internet Penetration', desc: 'The percentage of the population with internet access. While developed nations are near 95 percent, large swaths of Sub-Saharan Africa and South Asia remain below 40 percent, creating a digital divide that constrains economic participation.' },
                { name: 'Broadband Infrastructure', desc: 'Fixed broadband subscriptions per 100 people measures the foundation of digital economy participation. South Korea, Switzerland, and France lead globally, while many developing nations rely primarily on mobile internet access.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">AI Patents and Innovation</h2>
            <p className="mb-4 text-base leading-relaxed">
              AI patent filings have become a key indicator of technological leadership. China
              surpassed the United States in total AI patent applications around 2018 and now
              files roughly twice as many annually. However, patent quality and commercial
              application differ significantly. US-origin AI patents tend to be more widely
              cited and more likely to result in commercial products, while China&apos;s volume
              is partly driven by government incentives and university filing targets.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              The key AI research areas generating the most patents include machine learning
              and deep learning, natural language processing, computer vision, robotics and
              autonomous systems, and AI applications in healthcare. Our Technology page tracks
              AI patent trends alongside general patent activity to show how AI is becoming an
              increasingly dominant share of all innovation output.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Economic Implications</h2>
            <p className="mb-4 text-base leading-relaxed">
              Digitization creates both opportunities and challenges for economies. It enables
              smaller companies in developing nations to access global markets, reduces transaction
              costs, and improves efficiency across industries. However, it also concentrates
              market power among a few large platforms, disrupts traditional employment, and
              creates regulatory challenges around data privacy, competition, and taxation.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              The countries that invest most in digital infrastructure, STEM education, and
              AI research are positioning themselves to capture the largest share of value from
              the digital transformation. This is why our Technology page tracks these metrics
              alongside traditional innovation indicators.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Digital Economy on Our Platform</h2>
            <p className="mb-4 text-base leading-relaxed">
              Our <a href="/technology" className="text-blue-600 dark:text-blue-400 hover:underline">Technology &amp; Innovation</a> page
              includes dedicated tabs for Digital Infrastructure, AI &amp; Emerging Tech, Digital
              Economy, and Startups &amp; VC. Explore e-commerce adoption rates, digital payment
              penetration, AI patent trends, broadband subscriptions, and venture capital flows
              across 30+ countries.
            </p>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore More</h2>
            <ul className="space-y-2">
              <li><a href="/technology" className="text-blue-600 dark:text-blue-400 hover:underline">Technology &amp; Innovation Dashboard</a> &mdash; Full suite of digital economy metrics</li>
              <li><a href="/guides/technology-innovation-metrics" className="text-blue-600 dark:text-blue-400 hover:underline">Technology &amp; Innovation Metrics</a> &mdash; R&amp;D and patent fundamentals</li>
              <li><a href="/guides/emerging-vs-developed-economies" className="text-blue-600 dark:text-blue-400 hover:underline">Emerging vs Developed Economies</a> &mdash; The digital divide</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

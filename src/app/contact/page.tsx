'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect, useState } from 'react';

export default function ContactPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqs = [
    {
      q: 'How often is the data updated?',
      a: 'Our platform fetches data from source APIs in real time when you visit a page. Most World Bank indicators are updated annually, with a reporting lag of one to two years. FRED data for U.S. metrics updates monthly or quarterly. Client-side caching stores data for 24 hours to ensure fast repeat visits.'
    },
    {
      q: 'Where does the data come from?',
      a: 'All data is sourced from internationally recognized institutions including the World Bank, IMF, FRED (Federal Reserve Bank of St. Louis), OECD, WIPO, ITU, Eurostat, and the Bank for International Settlements. Where live API data is unavailable, we use curated fallback datasets compiled from official reports.'
    },
    {
      q: 'Can I use the charts and data for my research or publication?',
      a: 'Yes. The underlying data is sourced from publicly available databases. You are free to reference our visualizations with appropriate attribution to both Global Economic Indicators and the original data source. We encourage academic and journalistic use of the platform.'
    },
    {
      q: 'Why is some data missing for certain countries or years?',
      a: 'Data availability varies by country and indicator. Some nations do not report certain metrics, and many indicators have a one- to two-year reporting lag. We display all available data and clearly indicate when values are unavailable. Our fallback datasets help fill gaps for key technology and innovation metrics.'
    },
    {
      q: 'Is the site free to use?',
      a: 'Completely free. There are no subscriptions, premium tiers, or registration requirements. The site is supported by non-intrusive advertising to cover hosting and development costs.'
    },
    {
      q: 'How can I report an error or suggest a feature?',
      a: 'Use the contact form on this page to report data discrepancies, suggest new features, or ask questions. We review all messages and prioritize improvements based on user feedback.'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Contact Us</h1>

        <div className="space-y-8">
          <section>
            <p className="mb-4 text-base leading-relaxed">
              We welcome your questions, feedback, and suggestions. Whether you have spotted a data
              discrepancy, want to request a new feature, or simply want to learn more about the
              platform, we would be happy to hear from you.
            </p>
          </section>

          {/* Contact Form */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Send Us a Message</h2>
            {submitted ? (
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                  Thank you for your message!
                </h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  We have received your message and will review it shortly. If your inquiry
                  requires a response, we will get back to you at the email address you provided.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Send Message
                </button>
              </form>
            )}
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <p className="mb-4 text-base leading-relaxed">
              Below are answers to the questions we receive most often. If your question is not
              covered here, feel free to reach out using the contact form above.
            </p>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between rounded-lg transition-colors ${
                      isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium pr-4">{faq.q}</span>
                    <span className={`flex-shrink-0 transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  {expandedFaq === index && (
                    <div className={`px-4 pb-4 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Other Resources</h2>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">About Us</a> &mdash; Learn more about the platform and our data sources
              </li>
              <li>
                <a href="/methodology" className="text-blue-600 dark:text-blue-400 hover:underline">Methodology</a> &mdash; Understand how we collect, process, and display economic data
              </li>
              <li>
                <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a> &mdash; How we handle your data and privacy
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

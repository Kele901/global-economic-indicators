'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function PrivacyPolicy() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);

  useEffect(() => {
    // Apply theme
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-8">
          <section>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Global Economic Indicators ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard information when you visit our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-3 leading-relaxed">
              Global Economic Indicators collects minimal information to provide our services effectively:
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">1.1 Automatically Collected Information</h3>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Browser Preferences:</strong> Theme selection (dark/light mode), selected countries, time periods, and chart preferences</li>
              <li><strong>Technical Data:</strong> Browser type, device information, and IP address (collected by our hosting provider)</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, and interaction patterns</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">1.2 Personal Information</h3>
            <p className="mb-3 leading-relaxed">
              We do <strong>NOT</strong> collect any personal identifiable information such as:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Names, email addresses, or phone numbers</li>
              <li>Physical addresses or billing information</li>
              <li>Social security numbers or government IDs</li>
              <li>Financial or payment information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
            <p className="mb-3 leading-relaxed">
              We use cookies and similar technologies to enhance your browsing experience. Cookies are small text files stored on your device.
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Essential Cookies</h3>
            <p className="mb-3 leading-relaxed">We use essential cookies to:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Remember your theme preferences (dark/light mode)</li>
              <li>Store your selected countries and economic metrics</li>
              <li>Maintain your chart configuration settings</li>
              <li>Improve site functionality and user experience</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.2 Managing Cookies</h3>
            <p className="mb-3 leading-relaxed">
              These cookies are stored locally in your browser using localStorage and can be cleared at any time through your browser settings or by clicking "Clear All Data" in your browser's developer console.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Third-Party Advertising</h2>
            
            <h3 className="text-xl font-semibold mb-3">3.1 Google AdSense</h3>
            <p className="mb-3 leading-relaxed">
              We use Google AdSense to display advertisements on our website. Google may use cookies and similar technologies to:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Serve ads based on your prior visits to our website or other websites</li>
              <li>Measure ad performance and engagement</li>
              <li>Provide personalized advertising experiences</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.2 Your Advertising Choices</h3>
            <p className="mb-3 leading-relaxed">
              You can control and opt out of personalized advertising:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>
                Visit <a href="https://www.google.com/settings/ads" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Google's Ads Settings</a> to manage your ad preferences
              </li>
              <li>
                Learn about <a href="https://policies.google.com/technologies/partner-sites" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">how Google uses data when you use our partners' sites or apps</a>
              </li>
              <li>
                Visit <a href="https://www.aboutads.info/choices/" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">AboutAds.info</a> to opt out of interest-based advertising
              </li>
              <li>
                Visit <a href="https://www.youronlinechoices.eu/" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Your Online Choices</a> (for EU users)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Sources and Content</h2>
            <p className="mb-3 leading-relaxed">
              All economic data displayed on our site is sourced from publicly available, reputable databases:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>World Bank:</strong> Economic indicators, GDP, trade data</li>
              <li><strong>International Monetary Fund (IMF):</strong> Government debt, interest rates</li>
              <li><strong>OECD:</strong> Economic statistics for member countries</li>
              <li><strong>FRED (Federal Reserve Economic Data):</strong> United States economic data</li>
              <li><strong>Bank for International Settlements (BIS):</strong> Policy rates</li>
            </ul>
            <p className="mb-3 leading-relaxed">
              We do not claim ownership of this data. All data remains the property of the respective sources.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="mb-3 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your data:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>All data is transmitted over secure HTTPS connections</li>
              <li>No sensitive personal information is collected or stored</li>
              <li>Preference data is stored locally in your browser only</li>
              <li>We use industry-standard hosting security measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="mb-3 leading-relaxed">
              You have the following rights regarding your data:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Access:</strong> You can view all data stored in your browser through developer tools</li>
              <li><strong>Delete:</strong> Clear your browser cookies at any time to remove all stored preferences</li>
              <li><strong>Opt-Out:</strong> Opt out of personalized advertising through the links provided above</li>
              <li><strong>No Account Required:</strong> Use the site without creating an account or providing personal information</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.1 European Users (GDPR)</h3>
            <p className="mb-3 leading-relaxed">
              If you are located in the European Economic Area (EEA), you have additional rights under GDPR:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Right to access your data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
            <p className="mb-3 leading-relaxed">
              Our website is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. 
              If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
            <p className="mb-3 leading-relaxed">
              Our website is hosted on Vercel's infrastructure, which may process data in various countries. By using our website, you consent to the transfer of your data to countries outside your country of residence.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Privacy Policy</h2>
            <p className="mb-3 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. 
              We will notify users of any material changes by updating the "Last Updated" date at the top of this policy. 
              We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
            <p className="mb-3 leading-relaxed">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <p className="mb-2">
                <strong>Website:</strong> <a href="https://www.globaleconindicators.info" className="text-blue-600 dark:text-blue-400 hover:underline">www.globaleconindicators.info</a>
              </p>
              <p>
                <strong>Email:</strong> Contact us through our website
              </p>
            </div>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Summary</h2>
            <ul className="space-y-2">
              <li>✓ We don't collect personal information</li>
              <li>✓ We use cookies only for site functionality and preferences</li>
              <li>✓ Google AdSense may serve personalized ads (you can opt out)</li>
              <li>✓ All economic data is from public, reputable sources</li>
              <li>✓ You have full control over your data and privacy choices</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}


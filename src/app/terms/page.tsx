'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function TermsOfService() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="space-y-8">
          <section>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Welcome to Global Economic Indicators. By accessing or using our website, you agree to be bound by these Terms of Service. 
              Please read them carefully before using our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-3 leading-relaxed">
              By accessing and using Global Economic Indicators (the "Service"), you accept and agree to be bound by the terms and provisions of this agreement. 
              If you do not agree to these terms, please do not use this Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-3 leading-relaxed">
              Global Economic Indicators provides:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Visualization and analysis of global economic data</li>
              <li>Interactive charts and graphs of economic indicators</li>
              <li>Access to publicly available economic statistics</li>
              <li>Educational content about economic trends</li>
              <li>Tools for comparing economic data across countries</li>
            </ul>
            <p className="mb-3 leading-relaxed">
              The Service is provided free of charge and is supported by advertising.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Data Sources and Accuracy</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Third-Party Data</h3>
            <p className="mb-3 leading-relaxed">
              All economic data displayed on our website is sourced from publicly available databases including:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>World Bank</li>
              <li>International Monetary Fund (IMF)</li>
              <li>Organisation for Economic Co-operation and Development (OECD)</li>
              <li>Federal Reserve Economic Data (FRED)</li>
              <li>Bank for International Settlements (BIS)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.2 No Warranty of Accuracy</h3>
            <p className="mb-3 leading-relaxed">
              While we strive to provide accurate and up-to-date information, we make no representations or warranties regarding:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>The accuracy, completeness, or reliability of the data</li>
              <li>The timeliness of data updates</li>
              <li>The availability of data for all countries or time periods</li>
            </ul>
            <p className="mb-3 leading-relaxed">
              Users should verify critical information with original data sources before making important decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Use of Service</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Permitted Use</h3>
            <p className="mb-3 leading-relaxed">You may use the Service for:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Personal research and educational purposes</li>
              <li>Academic and professional analysis</li>
              <li>Non-commercial data visualization</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.2 Prohibited Use</h3>
            <p className="mb-3 leading-relaxed">You agree NOT to:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to the Service or its systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems (bots, scrapers) to access the Service excessively</li>
              <li>Reproduce, duplicate, copy, or resell any part of the Service without permission</li>
              <li>Remove or modify any copyright, trademark, or proprietary notices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Service Content</h3>
            <p className="mb-3 leading-relaxed">
              The design, layout, graphics, and code of this website are owned by Global Economic Indicators and are protected by copyright and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold mb-3">5.2 Economic Data</h3>
            <p className="mb-3 leading-relaxed">
              The economic data displayed on our website belongs to the respective data providers (World Bank, IMF, OECD, etc.). 
              We do not claim ownership of this data. Users must comply with the terms of use of the original data sources.
            </p>

            <h3 className="text-xl font-semibold mb-3">5.3 Charts and Visualizations</h3>
            <p className="mb-3 leading-relaxed">
              Users may download and use charts generated by the Service for personal, educational, or non-commercial purposes, 
              provided proper attribution is given to Global Economic Indicators and the original data sources.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Disclaimer of Warranties</h2>
            <p className="mb-3 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Warranties of merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy or reliability of information</li>
              <li>Uninterrupted or error-free operation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="mb-3 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, GLOBAL ECONOMIC INDICATORS SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or use</li>
              <li>Decisions made based on information from the Service</li>
              <li>Errors or omissions in the data displayed</li>
              <li>Service interruptions or unavailability</li>
            </ul>
            <p className="mb-3 leading-relaxed">
              You use the Service at your own risk. We recommend verifying all information with official sources before making important decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Third-Party Links and Advertising</h2>
            <p className="mb-3 leading-relaxed">
              Our Service may contain links to third-party websites and displays third-party advertisements (Google AdSense). 
              We are not responsible for the content, privacy practices, or terms of these third-party sites or advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Modifications to Service</h2>
            <p className="mb-3 leading-relaxed">
              We reserve the right to:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Modify, suspend, or discontinue the Service at any time</li>
              <li>Change features, functionality, or data sources</li>
              <li>Limit access to certain features or the entire Service</li>
            </ul>
            <p className="mb-3 leading-relaxed">
              We are not liable for any modifications, suspensions, or discontinuations of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="mb-3 leading-relaxed">
              We may update these Terms of Service at any time. Changes will be effective immediately upon posting to the website. 
              Your continued use of the Service after changes are posted constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Privacy</h2>
            <p className="mb-3 leading-relaxed">
              Your use of the Service is also governed by our <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>. 
              Please review our Privacy Policy to understand our data collection and use practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="mb-3 leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with applicable laws, 
              without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Severability</h2>
            <p className="mb-3 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated 
              to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p className="mb-3 leading-relaxed">
              If you have questions about these Terms of Service, please contact us through our website.
            </p>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <p className="mb-2">
                <strong>Website:</strong> <a href="https://www.globaleconindicators.info" className="text-blue-600 dark:text-blue-400 hover:underline">www.globaleconindicators.info</a>
              </p>
            </div>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
            <h2 className="text-xl font-semibold mb-3">⚠️ Important Notice</h2>
            <p className="mb-2">
              <strong>Not Financial Advice:</strong> The information provided on this website is for educational and informational purposes only. 
              It does not constitute financial, investment, legal, or professional advice.
            </p>
            <p>
              <strong>Verify Information:</strong> Always verify data with official sources before making important decisions based on the information provided.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}


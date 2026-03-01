'use client';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function DisclaimerPage() {
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

  const sectionStyle = `mb-8 p-4 sm:p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`;
  const headingStyle = `text-xl sm:text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`;
  const subheadingStyle = `text-lg font-semibold mb-2 mt-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`;
  const textStyle = `text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto p-6 sm:p-8">

        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Disclaimer</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className={`mb-8 p-4 sm:p-6 rounded-lg border ${isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-300'}`}>
          <p className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
            Global Economic Indicators (&quot;globaleconindicators.info&quot;) is an educational and informational platform. 
            The data, charts, analyses, and content presented on this website are provided for general informational 
            purposes only and should not be relied upon as the sole basis for making financial, investment, or policy decisions.
          </p>
        </div>

        {/* Not Financial Advice */}
        <div className={sectionStyle}>
          <h2 className={headingStyle}>1. Not Financial or Investment Advice</h2>
          <p className={textStyle}>
            Nothing on this website constitutes financial advice, investment advice, trading advice, or any other 
            form of professional advice. The economic indicators, visualizations, comparisons, and analyses presented 
            are for educational and informational purposes only.
          </p>
          <p className={`${textStyle} mt-3`}>
            You should not make any financial or investment decision based solely on the information provided on this 
            platform. Always consult with a qualified financial advisor, economist, or other appropriate professional 
            before making decisions that could affect your financial situation.
          </p>
        </div>

        {/* Data Accuracy */}
        <div className={sectionStyle}>
          <h2 className={headingStyle}>2. Data Accuracy and Limitations</h2>
          <h3 className={subheadingStyle}>2.1 Third-Party Data Sources</h3>
          <p className={textStyle}>
            Our data is sourced from publicly available databases maintained by international organizations including 
            the World Bank, International Monetary Fund (IMF), Organisation for Economic Co-operation and Development (OECD), 
            Federal Reserve Economic Data (FRED), World Intellectual Property Organization (WIPO), International 
            Telecommunication Union (ITU), Eurostat, and the Bank for International Settlements (BIS).
          </p>
          <p className={`${textStyle} mt-3`}>
            While we strive to present accurate and up-to-date information, we do not independently verify the data 
            provided by these sources. Data may be subject to revisions, corrections, or methodological changes by the 
            originating organizations at any time.
          </p>

          <h3 className={subheadingStyle}>2.2 Data Processing</h3>
          <p className={textStyle}>
            Data undergoes automated processing, normalization, and formatting for display on our platform. Despite 
            our best efforts, errors may be introduced during data retrieval, processing, or visualization. We make 
            no warranties regarding the completeness, accuracy, reliability, or timeliness of any data presented.
          </p>

          <h3 className={subheadingStyle}>2.3 Historical Data</h3>
          <p className={textStyle}>
            Historical economic data is inherently imperfect. Methodologies for measuring economic indicators have 
            changed over time, and data availability varies significantly across countries and time periods. Gaps in 
            data may be present, and comparisons across countries or long time periods should be interpreted with caution.
          </p>

          <h3 className={subheadingStyle}>2.4 Data Timeliness</h3>
          <p className={textStyle}>
            Economic data is often published with a lag. Most indicators on our platform reflect the latest available 
            data from our sources, which may be several months or even years behind the current date depending on the 
            indicator and country. Data labeled as &quot;current&quot; reflects the most recent available data point, not 
            necessarily real-time conditions.
          </p>
        </div>

        {/* No Guarantees */}
        <div className={sectionStyle}>
          <h2 className={headingStyle}>3. No Guarantees</h2>
          <p className={textStyle}>
            This website and its content are provided on an &quot;as is&quot; and &quot;as available&quot; basis without 
            any warranties of any kind, either express or implied. We disclaim all warranties, including but not limited to:
          </p>
          <ul className={`${textStyle} list-disc list-inside mt-3 space-y-2`}>
            <li>Warranties of merchantability or fitness for a particular purpose</li>
            <li>Warranties that the data is accurate, complete, reliable, or current</li>
            <li>Warranties that the website will be available without interruption</li>
            <li>Warranties that the website is free from errors, viruses, or other harmful components</li>
            <li>Warranties regarding the results obtained from using the data or analysis tools</li>
          </ul>
        </div>

        {/* Limitation of Liability */}
        <div className={sectionStyle}>
          <h2 className={headingStyle}>4. Limitation of Liability</h2>
          <p className={textStyle}>
            To the fullest extent permitted by applicable law, Global Economic Indicators shall not be liable for any 
            direct, indirect, incidental, special, consequential, or punitive damages arising out of or related to your 
            use of, or inability to use, this website or any data, content, or analyses presented on it.
          </p>
          <p className={`${textStyle} mt-3`}>
            This limitation applies regardless of whether the damages are based on warranty, contract, tort, negligence, 
            strict liability, or any other legal theory, even if we have been advised of the possibility of such damages.
          </p>
        </div>

        {/* Third-Party Content */}
        <div className={sectionStyle}>
          <h2 className={headingStyle}>5. Third-Party Content and Links</h2>
          <p className={textStyle}>
            Our platform may contain links to external websites, references to third-party data sources, and 
            advertisements served by Google AdSense. We are not responsible for the content, accuracy, or practices 
            of any third-party websites or services. The inclusion of any link or advertisement does not imply our 
            endorsement of the linked site, its content, or its products.
          </p>
        </div>

        {/* Educational Purpose */}
        <div className={sectionStyle}>
          <h2 className={headingStyle}>6. Educational Purpose</h2>
          <p className={textStyle}>
            The educational guides, glossary, methodology explanations, and analytical content on this platform are 
            intended to help users understand economic concepts and data. While we strive for accuracy in our 
            explanations, economics is a complex field with competing theories and interpretations. Our content 
            represents general educational material and should not be treated as authoritative academic or 
            professional analysis.
          </p>
        </div>

        {/* User Responsibility */}
        <div className={sectionStyle}>
          <h2 className={headingStyle}>7. User Responsibility</h2>
          <p className={textStyle}>
            By using this website, you acknowledge and agree that:
          </p>
          <ul className={`${textStyle} list-disc list-inside mt-3 space-y-2`}>
            <li>You are responsible for your own decisions and actions based on information found on this platform</li>
            <li>You will independently verify any data before using it for important decisions</li>
            <li>You understand that past economic trends do not predict future performance</li>
            <li>You will not hold Global Economic Indicators liable for any losses resulting from your use of this website</li>
            <li>You will refer to official source databases for the most authoritative and current data</li>
          </ul>
        </div>

        {/* Country-Specific Data */}
        <div className={sectionStyle}>
          <h2 className={headingStyle}>8. Country-Specific Data Disclaimer</h2>
          <p className={textStyle}>
            Economic data quality and availability vary significantly by country. Data for some countries may be 
            incomplete, estimated, or based on different methodological standards. Cross-country comparisons should 
            be made with awareness of these limitations. For the most authoritative data on any specific country, 
            please consult that country&apos;s official statistical agency or central bank.
          </p>
        </div>

        {/* Changes to Disclaimer */}
        <div className={sectionStyle}>
          <h2 className={headingStyle}>9. Changes to This Disclaimer</h2>
          <p className={textStyle}>
            We reserve the right to update or modify this disclaimer at any time without prior notice. Changes 
            become effective immediately upon posting on this page. Your continued use of the website after any 
            changes constitutes acceptance of the updated disclaimer. We encourage you to review this page 
            periodically.
          </p>
        </div>

        {/* Contact */}
        <div className={`p-4 sm:p-6 rounded-lg border ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
          <h2 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Questions?</h2>
          <p className={textStyle}>
            If you have any questions about this disclaimer or the data presented on our platform, please visit 
            our{' '}
            <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact page</a>
            {' '}or review our{' '}
            <a href="/methodology" className="text-blue-600 dark:text-blue-400 hover:underline">Methodology</a>
            {' '}for more details on how we source and process data.
          </p>
          <div className="flex flex-wrap gap-3 mt-4 text-sm">
            <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>
            <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
            <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a>
            <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
            <a href="/methodology" className="text-blue-600 dark:text-blue-400 hover:underline">Methodology</a>
          </div>
        </div>

      </div>
    </div>
  );
}

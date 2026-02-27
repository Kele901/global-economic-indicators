'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export default function GovernmentDebtGuide() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Government Debt Explained</h1>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          What sovereign debt is, how it accumulates, why some countries sustain high debt levels while others default, and how to read debt metrics.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Is Government Debt?</h2>
            <p className="mb-4 text-base leading-relaxed">
              Government debt, also called sovereign debt or public debt, is the total amount of
              money a government owes to creditors. It accumulates over time when a government
              spends more than it collects in revenue (running a fiscal deficit) and borrows to
              cover the difference. The debt is typically financed by issuing bonds that domestic
              and foreign investors purchase, effectively lending money to the government in
              exchange for regular interest payments and eventual repayment of the principal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Debt-to-GDP Ratio</h2>
            <p className="mb-4 text-base leading-relaxed">
              The most common way to assess a country&apos;s debt burden is the debt-to-GDP ratio,
              which expresses total public debt as a percentage of annual economic output. A ratio
              of 100 percent means the government owes as much as the entire economy produces in
              a year. This metric is more useful than the absolute debt level because it accounts
              for the economy&apos;s capacity to service the debt.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              Japan&apos;s debt-to-GDP ratio exceeds 250 percent, the highest among major economies,
              yet it has never defaulted. The United States exceeds 120 percent. Meanwhile,
              Argentina and Sri Lanka defaulted at ratios below 100 percent. The threshold for
              sustainability depends on the country&apos;s institutional credibility, the currency
              in which the debt is denominated, interest rate levels, and economic growth prospects.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Why Debt Levels Vary</h2>
            <div className="space-y-4">
              {[
                { name: 'Currency Sovereignty', desc: 'Countries that borrow in their own currency (US, Japan, UK) can always print money to service the debt, though this risks inflation. Countries that borrow in foreign currencies (many emerging markets) face default risk if their currency depreciates.' },
                { name: 'Institutional Credibility', desc: 'Strong institutions, independent central banks, and rule of law give investors confidence that debts will be honored. This allows developed nations to sustain higher debt levels at lower interest rates.' },
                { name: 'Growth Rate vs. Interest Rate', desc: 'If GDP grows faster than the interest rate on debt, the debt-to-GDP ratio naturally shrinks even without spending cuts. This is why fast-growing economies can carry debt more easily than stagnant ones.' },
                { name: 'Domestic vs. Foreign Holders', desc: 'Japan\'s debt is over 90 percent held domestically, creating a stable investor base. Countries dependent on foreign creditors are more vulnerable to capital flight and sudden loss of market access.' }
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Fiscal Deficits and Surpluses</h2>
            <p className="mb-4 text-base leading-relaxed">
              A fiscal deficit occurs when government spending exceeds revenue in a given year.
              The deficit adds to the total debt stock. A surplus (revenue exceeding spending)
              allows the government to pay down debt. Most developed countries have run persistent
              deficits since the 2008 financial crisis, with the COVID-19 pandemic pushing deficits
              to wartime levels in many nations.
            </p>
            <p className="mb-4 text-base leading-relaxed">
              The primary balance strips out interest payments from the deficit calculation,
              showing whether the government&apos;s non-interest spending exceeds its revenue.
              A country can run a headline deficit but a primary surplus if its interest costs
              are the only reason spending exceeds revenue, which is a more sustainable position.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Sovereign Defaults</h2>
            <p className="mb-4 text-base leading-relaxed">
              Sovereign default occurs when a government fails to meet its debt obligations.
              This can mean missing interest payments, refusing to repay principal, or restructuring
              debt on terms unfavorable to creditors. Defaults are far more common than many
              realize: Reinhart and Rogoff documented that most countries have defaulted at least
              once in their history. Argentina has defaulted nine times, Greece effectively
              defaulted in 2012 through a forced debt restructuring, and Russia defaulted on
              domestic debt in 1998.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Debt Data on Our Platform</h2>
            <p className="mb-4 text-base leading-relaxed">
              Government debt-to-GDP ratios are available on our <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">Dashboard</a> and
              <a href="/compare" className="text-blue-600 dark:text-blue-400 hover:underline"> Compare Countries</a> page.
              The <a href="/economic-cycles" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Cycles</a> page
              documents historical sovereign debt crises and places them in the context of
              broader debt super-cycles.
            </p>
          </section>

          <section className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className="text-xl font-semibold mb-3">Explore More</h2>
            <ul className="space-y-2">
              <li><a href="/economic-cycles" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Cycles Dashboard</a> &mdash; Historical debt crises and cycles</li>
              <li><a href="/guides/economic-cycles-explained" className="text-blue-600 dark:text-blue-400 hover:underline">Economic Cycles Explained</a> &mdash; Debt super-cycles and crisis patterns</li>
              <li><a href="/guides/how-central-banks-work" className="text-blue-600 dark:text-blue-400 hover:underline">How Central Banks Work</a> &mdash; Monetary policy and debt monetization</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

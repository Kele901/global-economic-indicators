'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect, useState } from 'react';

const glossaryTerms = [
  { term: 'Austerity', def: 'Government policies aimed at reducing fiscal deficits through spending cuts, tax increases, or both. Often implemented during debt crises, austerity is controversial because it can deepen economic downturns in the short term.' },
  { term: 'Balance of Payments', def: 'A comprehensive record of all economic transactions between a country and the rest of the world, including trade in goods and services, investment flows, and transfers.' },
  { term: 'Basis Point', def: 'One hundredth of a percentage point (0.01%). Used to describe changes in interest rates. A 25 basis point rate hike means the rate increased by 0.25 percentage points.' },
  { term: 'Bond Yield', def: 'The return an investor earns from holding a bond. Yields move inversely to bond prices: when prices rise, yields fall, and vice versa. Government bond yields serve as benchmarks for borrowing costs across the economy.' },
  { term: 'Capital Account', def: 'The portion of the balance of payments that records cross-border investments, including foreign direct investment, portfolio investment, and changes in reserve assets.' },
  { term: 'Carry Trade', def: 'An investment strategy that borrows in a low-interest-rate currency and invests in a higher-yielding currency, profiting from the interest rate differential. Carries risk if exchange rates move unfavorably.' },
  { term: 'Central Bank', def: 'A public institution responsible for managing a country\'s monetary policy, supervising banks, and maintaining financial stability. Examples include the Federal Reserve (US), ECB (Eurozone), and Bank of Japan.' },
  { term: 'Consumer Price Index (CPI)', def: 'A measure tracking the average change in prices paid by consumers for a fixed basket of goods and services. CPI is the most widely used inflation measure and is published monthly in most countries.' },
  { term: 'Core Inflation', def: 'Inflation measured excluding volatile food and energy prices. Provides a cleaner view of underlying price trends and is often used by central banks for policy decisions.' },
  { term: 'Current Account', def: 'The broadest measure of a country\'s trade position, including goods, services, investment income, and transfer payments. A current account deficit means the country imports more value than it exports.' },
  { term: 'Debt-to-GDP Ratio', def: 'Total government debt expressed as a percentage of gross domestic product. A key metric for assessing fiscal sustainability, though the threshold for concern varies by country.' },
  { term: 'Default', def: 'Failure by a borrower to meet debt obligations. Sovereign default occurs when a government cannot service its bonds, either missing payments or restructuring debt on terms unfavorable to creditors.' },
  { term: 'Deflation', def: 'A sustained decrease in the general price level. While falling prices may seem beneficial, deflation can be damaging because it increases the real burden of debt and encourages consumers to delay purchases.' },
  { term: 'Depreciation', def: 'A decrease in a currency\'s value relative to other currencies in foreign exchange markets. Depreciation makes exports cheaper and imports more expensive.' },
  { term: 'Emerging Market', def: 'An economy transitioning from low-income to middle- or upper-middle-income status, typically characterized by rapid growth, industrialization, and increasing integration with global markets.' },
  { term: 'Exchange Rate', def: 'The price of one currency expressed in terms of another. Determined by supply and demand in foreign exchange markets, influenced by interest rates, inflation, trade flows, and capital movements.' },
  { term: 'Fiscal Deficit', def: 'The amount by which government spending exceeds revenue in a given period. Persistent deficits add to the national debt and require borrowing to finance.' },
  { term: 'Fiscal Policy', def: 'Government decisions about taxation and spending used to influence the economy. Expansionary fiscal policy (more spending or lower taxes) stimulates growth; contractionary policy does the opposite.' },
  { term: 'Foreign Direct Investment (FDI)', def: 'Cross-border investment where a foreign entity acquires a lasting interest (usually 10%+ ownership) in a domestic enterprise. Includes building factories, acquiring companies, and reinvesting profits.' },
  { term: 'Forward Guidance', def: 'Central bank communication about the expected future path of monetary policy. By signaling future intentions, central banks can influence market expectations and long-term interest rates.' },
  { term: 'GDP (Gross Domestic Product)', def: 'The total monetary value of all finished goods and services produced within a country\'s borders in a specific period. The most widely used measure of economic size and performance.' },
  { term: 'GDP Deflator', def: 'A measure of the price level of all domestically produced goods and services. Unlike CPI, it covers the entire economy including investment and government spending, not just consumer goods.' },
  { term: 'GDP Per Capita', def: 'Total GDP divided by total population. Provides a rough measure of average economic output per person and is used to compare living standards across countries.' },
  { term: 'Gini Coefficient', def: 'A measure of income inequality ranging from 0 (perfect equality) to 1 (perfect inequality). South Africa (0.63) and Brazil (0.53) have among the highest Gini coefficients; Nordic countries (0.25-0.28) have the lowest.' },
  { term: 'Hyperinflation', def: 'Extremely rapid inflation, typically defined as prices rising by 50% or more per month. Historical examples include Weimar Germany (1923), Zimbabwe (2008), and Venezuela (2018).' },
  { term: 'Inflation', def: 'The rate at which the general level of prices rises over time, eroding purchasing power. Moderate inflation (around 2%) is targeted by most central banks as consistent with economic health.' },
  { term: 'Inflation Targeting', def: 'A monetary policy framework where the central bank commits to achieving a specific inflation rate, typically around 2%. Pioneered by New Zealand in 1990, now used by most major central banks.' },
  { term: 'Interest Rate', def: 'The cost of borrowing money, expressed as a percentage. Central bank policy rates set the benchmark; all other rates in the economy (mortgages, corporate bonds, savings) are influenced by this benchmark.' },
  { term: 'Labor Force Participation Rate', def: 'The percentage of the working-age population that is either employed or actively seeking employment. A falling rate can indicate discouraged workers leaving the labor market.' },
  { term: 'Liquidity', def: 'The ease with which an asset can be converted to cash without significant loss of value. Cash is the most liquid asset; real estate and private equity are among the least liquid.' },
  { term: 'M2 Money Supply', def: 'A broad measure of the money supply including cash, checking deposits, savings deposits, money market securities, and other near-money assets. Tracked as an indicator of inflationary pressure.' },
  { term: 'Monetary Policy', def: 'Central bank actions to manage the money supply and interest rates to achieve macroeconomic objectives, typically price stability and maximum employment.' },
  { term: 'Nominal', def: 'Measured in current prices without adjustment for inflation. Nominal GDP, nominal wages, and nominal interest rates all include the effect of price changes.' },
  { term: 'OECD', def: 'The Organisation for Economic Co-operation and Development, a group of 38 mostly high-income countries that share data and policy analysis. Membership is often used as a proxy for "developed economy" status.' },
  { term: 'Patent', def: 'A government-granted exclusive right to an invention, typically lasting 20 years. Patent filings are used as a proxy for innovation activity and are tracked by WIPO and national patent offices.' },
  { term: 'Purchasing Power Parity (PPP)', def: 'An exchange rate adjustment that equalizes the purchasing power of different currencies, accounting for price level differences between countries. Makes GDP comparisons more meaningful for assessing living standards.' },
  { term: 'Quantitative Easing (QE)', def: 'A monetary policy tool where the central bank purchases government bonds and other assets to inject liquidity and lower long-term interest rates. Used when conventional rate cuts have reached their limit at zero.' },
  { term: 'R&D Expenditure', def: 'Spending on research and development activities, typically expressed as a percentage of GDP. A key input measure of innovation, with global leaders like Israel and South Korea spending over 4% of GDP.' },
  { term: 'Real', def: 'Adjusted for inflation to reflect actual purchasing power. Real GDP, real wages, and real interest rates strip out price changes to show genuine economic changes.' },
  { term: 'Real Effective Exchange Rate (REER)', def: 'A currency\'s trade-weighted average value against a basket of partner currencies, adjusted for inflation differentials. A rising REER indicates declining export competitiveness.' },
  { term: 'Recession', def: 'A significant decline in economic activity. Commonly defined as two consecutive quarters of negative GDP growth, though the official US definition (NBER) uses a broader set of indicators.' },
  { term: 'Reserve Currency', def: 'A currency widely held by central banks and used for international transactions. The US dollar is the dominant reserve currency, followed by the euro, yen, pound, and increasingly the Chinese yuan.' },
  { term: 'Safe Haven', def: 'An asset or currency that investors flock to during periods of market stress. The US dollar, Swiss franc, Japanese yen, US Treasury bonds, and gold are traditional safe havens.' },
  { term: 'Sovereign Debt', def: 'Debt issued or guaranteed by a national government. Sovereign bonds are a primary tool for government borrowing and their yields serve as benchmarks for all other debt in the economy.' },
  { term: 'Stagflation', def: 'A combination of stagnant economic growth, high unemployment, and high inflation. Particularly challenging for policymakers because the usual remedies for slow growth (lower rates) worsen inflation.' },
  { term: 'STEM', def: 'Science, Technology, Engineering, and Mathematics. STEM graduate share is used as an indicator of a country\'s capacity to supply technical workers for innovation-driven industries.' },
  { term: 'Tariff', def: 'A tax imposed on imported goods. Used to protect domestic industries, raise revenue, or as a tool in trade negotiations. Tariffs raise prices for consumers and can provoke retaliatory measures.' },
  { term: 'Terms of Trade', def: 'The ratio of a country\'s export prices to its import prices. Improving terms of trade mean a country can buy more imports for each unit of exports, effectively increasing its real income.' },
  { term: 'Trade Balance', def: 'The difference between a country\'s exports and imports. A surplus means exports exceed imports; a deficit means the opposite. Neither is inherently good or bad.' },
  { term: 'Trade Openness', def: 'Total trade (exports plus imports) as a percentage of GDP. Higher values indicate greater integration with the global economy. Small open economies typically have ratios exceeding 100%.' },
  { term: 'Treasury Bond', def: 'A debt security issued by a national government, typically with maturities of 10 years or more. US Treasuries are considered the global risk-free benchmark.' },
  { term: 'Underemployment', def: 'A situation where workers are employed in positions below their skill level or work fewer hours than desired. Not captured by the headline unemployment rate.' },
  { term: 'Unemployment Rate', def: 'The percentage of the labor force that is jobless and actively seeking work. The most widely cited labor market indicator, though it has significant limitations.' },
  { term: 'Unicorn', def: 'A privately held startup company valued at over one billion US dollars. The term was coined in 2013 when such companies were rare; by 2024 there were over 1,200 globally.' },
  { term: 'Venture Capital', def: 'Private equity financing provided to early-stage, high-growth companies in exchange for ownership stakes. VC funding levels are used as an indicator of startup ecosystem health.' },
  { term: 'Yield Curve', def: 'A graph showing the relationship between bond yields and their maturities. A normal curve slopes upward (longer maturities pay more). An inverted curve (short rates exceed long rates) has historically preceded recessions.' },
  { term: 'Yield Curve Control', def: 'A monetary policy where the central bank targets specific bond yields at certain maturities. The Bank of Japan pioneered this by capping 10-year government bond yields.' },
];

export default function GlossaryPage() {
  const [isDarkMode] = useLocalStorage('isDarkMode', false);
  const [filter, setFilter] = useState('');

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

  const sortedTerms = glossaryTerms.sort((a, b) => a.term.localeCompare(b.term));
  const filteredTerms = filter
    ? sortedTerms.filter(t => t.term.toLowerCase().includes(filter.toLowerCase()) || t.def.toLowerCase().includes(filter.toLowerCase()))
    : sortedTerms;

  const letters = Array.from(new Set(sortedTerms.map(t => t.term[0].toUpperCase()))).sort();

  const groupedTerms: { [key: string]: typeof sortedTerms } = {};
  filteredTerms.forEach(t => {
    const letter = t.term[0].toUpperCase();
    if (!groupedTerms[letter]) groupedTerms[letter] = [];
    groupedTerms[letter].push(t);
  });

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto p-6 sm:p-8">
        <div className="mb-4">
          <a href="/guides/reading-economic-data" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">&larr; All Guides</a>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Glossary of Economic Terms</h1>
        <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Definitions of {glossaryTerms.length} key economic and financial terms used across our platform.
        </p>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search terms..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
        </div>

        {/* Letter Jump Links */}
        {!filter && (
          <div className="flex flex-wrap gap-2 mb-8">
            {letters.map(letter => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {letter}
              </a>
            ))}
          </div>
        )}

        {/* Terms */}
        <div className="space-y-8">
          {Object.entries(groupedTerms).map(([letter, terms]) => (
            <section key={letter} id={`letter-${letter}`}>
              <h2 className={`text-2xl font-bold mb-4 pb-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {letter}
              </h2>
              <div className="space-y-3">
                {terms.map(t => (
                  <div key={t.term} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <h3 className="font-semibold mb-1">{t.term}</h3>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.def}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {filteredTerms.length === 0 && (
          <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No terms found matching &ldquo;{filter}&rdquo;
          </p>
        )}

        <section className={`mt-12 p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
          <h2 className="text-xl font-semibold mb-3">Learn More</h2>
          <p className="mb-3 leading-relaxed">
            For deeper explanations of these concepts, explore our educational guides:
          </p>
          <ul className="space-y-2">
            <li><a href="/guides/reading-economic-data" className="text-blue-600 dark:text-blue-400 hover:underline">How to Read Economic Data</a> &mdash; Beginner&apos;s guide to all guides</li>
            <li><a href="/methodology" className="text-blue-600 dark:text-blue-400 hover:underline">Methodology</a> &mdash; How we source and process data</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

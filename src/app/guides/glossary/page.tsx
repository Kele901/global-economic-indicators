'use client';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect, useState } from 'react';

const glossaryTerms = [
  // A
  { term: 'Aggregate Demand', def: 'The total demand for goods and services in an economy at a given price level and time period. Composed of consumer spending, business investment, government spending, and net exports (exports minus imports).' },
  { term: 'Aggregate Supply', def: 'The total quantity of goods and services that producers are willing to supply at a given price level. In the short run, supply is influenced by wages and input costs; in the long run, it depends on productive capacity.' },
  { term: 'Appreciation', def: 'An increase in a currency\'s value relative to other currencies in foreign exchange markets. Appreciation makes imports cheaper and exports more expensive, potentially widening a trade deficit.' },
  { term: 'Arbitrage', def: 'The practice of exploiting price differences for the same asset across different markets. In efficient markets, arbitrage opportunities are quickly eliminated, keeping prices consistent.' },
  { term: 'Austerity', def: 'Government policies aimed at reducing fiscal deficits through spending cuts, tax increases, or both. Often implemented during debt crises, austerity is controversial because it can deepen economic downturns in the short term.' },
  { term: 'Autarky', def: 'Economic self-sufficiency where a country does not engage in international trade. No modern economy is fully autarkic, but the concept is used as a theoretical baseline for measuring the gains from trade.' },
  // B
  { term: 'Balance of Payments', def: 'A comprehensive record of all economic transactions between a country and the rest of the world, including trade in goods and services, investment flows, and transfers.' },
  { term: 'Balance Sheet Recession', def: 'An economic downturn caused by the private sector prioritizing debt repayment over spending and investment, typically after an asset price collapse. Japan\'s "Lost Decade" (1990s) is the classic example.' },
  { term: 'Bank Run', def: 'A situation where a large number of depositors withdraw funds simultaneously, fearing the bank will become insolvent. Modern deposit insurance schemes are designed to prevent bank runs.' },
  { term: 'Basis Point', def: 'One hundredth of a percentage point (0.01%). Used to describe changes in interest rates. A 25 basis point rate hike means the rate increased by 0.25 percentage points.' },
  { term: 'Bond Yield', def: 'The return an investor earns from holding a bond. Yields move inversely to bond prices: when prices rise, yields fall, and vice versa. Government bond yields serve as benchmarks for borrowing costs across the economy.' },
  { term: 'Bretton Woods System', def: 'The international monetary framework (1944-1971) that pegged currencies to the US dollar, which was convertible to gold at $35 per ounce. Its collapse led to the modern era of floating exchange rates.' },
  { term: 'Budget Surplus/Deficit', def: 'A surplus occurs when government revenue exceeds spending; a deficit is the opposite. Persistent deficits must be financed by borrowing, adding to the national debt.' },
  { term: 'Business Cycle', def: 'The recurring pattern of expansion and contraction in economic activity. Phases include expansion, peak, contraction (recession), and trough. Cycles typically last 6-10 years in developed economies.' },
  // C
  { term: 'Capital Account', def: 'The portion of the balance of payments that records cross-border investments, including foreign direct investment, portfolio investment, and changes in reserve assets.' },
  { term: 'Capital Controls', def: 'Government-imposed restrictions on the flow of money in and out of a country. Used to prevent capital flight, manage exchange rates, or protect financial stability during crises.' },
  { term: 'Capital Flight', def: 'Large-scale movement of financial assets out of a country due to economic or political instability. Capital flight depletes foreign reserves, weakens the currency, and can trigger a financial crisis.' },
  { term: 'Capital Formation', def: 'Investment in physical assets such as machinery, buildings, infrastructure, and inventory. Gross capital formation as a share of GDP indicates how much an economy is investing in future productive capacity.' },
  { term: 'Carbon Tax', def: 'A tax on greenhouse gas emissions designed to internalize the environmental cost of burning fossil fuels. By making carbon-intensive activities more expensive, it incentivizes cleaner alternatives.' },
  { term: 'Carry Trade', def: 'An investment strategy that borrows in a low-interest-rate currency and invests in a higher-yielding currency, profiting from the interest rate differential. Carries risk if exchange rates move unfavorably.' },
  { term: 'Central Bank', def: 'A public institution responsible for managing a country\'s monetary policy, supervising banks, and maintaining financial stability. Examples include the Federal Reserve (US), ECB (Eurozone), and Bank of Japan.' },
  { term: 'Circular Economy', def: 'An economic model that minimizes waste by keeping products, materials, and resources in use for as long as possible. Contrasts with the traditional linear "take-make-dispose" model of production.' },
  { term: 'Comparative Advantage', def: 'The ability of a country to produce a good at a lower opportunity cost than its trading partners. The basis for international trade theory, first articulated by David Ricardo in 1817.' },
  { term: 'Contagion', def: 'The spread of an economic or financial crisis from one country or market to others. Can occur through trade linkages, financial exposure, or shifts in investor sentiment.' },
  { term: 'Consumer Confidence Index', def: 'A survey-based measure of how optimistic consumers feel about the economy and their personal finances. High confidence typically precedes stronger consumer spending.' },
  { term: 'Consumer Price Index (CPI)', def: 'A measure tracking the average change in prices paid by consumers for a fixed basket of goods and services. CPI is the most widely used inflation measure and is published monthly in most countries.' },
  { term: 'Core Inflation', def: 'Inflation measured excluding volatile food and energy prices. Provides a cleaner view of underlying price trends and is often used by central banks for policy decisions.' },
  { term: 'Cost-Push Inflation', def: 'Inflation caused by increases in the cost of production inputs (wages, raw materials, energy), which producers pass on to consumers as higher prices. Contrasts with demand-pull inflation.' },
  { term: 'Credit Default Swap (CDS)', def: 'A financial derivative that acts as insurance against the default of a borrower. Sovereign CDS spreads are widely used to gauge the perceived risk of government default.' },
  { term: 'Credit Rating', def: 'An assessment of a borrower\'s creditworthiness by agencies like Moody\'s, S&P, or Fitch. Sovereign ratings (e.g., AAA, BBB) directly affect government borrowing costs.' },
  { term: 'Crowding Out', def: 'When increased government borrowing drives up interest rates, reducing private sector investment. A key argument against excessive deficit spending.' },
  { term: 'Current Account', def: 'The broadest measure of a country\'s trade position, including goods, services, investment income, and transfer payments. A current account deficit means the country imports more value than it exports.' },
  // D
  { term: 'Debt Service', def: 'The total amount of principal and interest payments a borrower must make on outstanding debt. For governments, debt service as a share of revenue indicates the burden of past borrowing.' },
  { term: 'Debt-to-GDP Ratio', def: 'Total government debt expressed as a percentage of gross domestic product. A key metric for assessing fiscal sustainability, though the threshold for concern varies by country.' },
  { term: 'Default', def: 'Failure by a borrower to meet debt obligations. Sovereign default occurs when a government cannot service its bonds, either missing payments or restructuring debt on terms unfavorable to creditors.' },
  { term: 'Deflation', def: 'A sustained decrease in the general price level. While falling prices may seem beneficial, deflation can be damaging because it increases the real burden of debt and encourages consumers to delay purchases.' },
  { term: 'Demand-Pull Inflation', def: 'Inflation caused by aggregate demand exceeding aggregate supply. When consumers and businesses compete for limited goods, prices are bid upward. Often associated with rapid economic growth.' },
  { term: 'Depreciation', def: 'A decrease in a currency\'s value relative to other currencies in foreign exchange markets. Depreciation makes exports cheaper and imports more expensive.' },
  { term: 'Depression', def: 'A prolonged and severe recession, typically characterized by GDP declining more than 10% or lasting several years. The Great Depression (1929-1939) remains the most referenced example.' },
  { term: 'Deregulation', def: 'The reduction or elimination of government rules and restrictions on business activity. Proponents argue it increases efficiency; critics warn it can lead to market failures and financial instability.' },
  { term: 'Devaluation', def: 'A deliberate downward adjustment of a currency\'s official exchange rate by the government. Distinct from depreciation, which occurs through market forces. Used to boost export competitiveness.' },
  { term: 'Developing Economy', def: 'A country with lower industrialization, income levels, and human development indicators compared to developed nations. Often characterized by rapid population growth, reliance on agriculture, and improving infrastructure.' },
  { term: 'Digital Economy', def: 'Economic activity that results from digital technologies, including e-commerce, fintech, platform businesses, and the data economy. Measured by indicators like internet users, ICT exports, and digital payments adoption.' },
  { term: 'Disinflation', def: 'A reduction in the rate of inflation — prices are still rising, but more slowly. Distinct from deflation, where prices actually fall. Central banks often aim for gradual disinflation when inflation is above target.' },
  { term: 'Disposable Income', def: 'Income remaining after taxes and mandatory deductions. The primary determinant of consumer spending and savings rates, and a key indicator of household financial well-being.' },
  { term: 'Dollarization', def: 'When a country adopts the US dollar (or another foreign currency) as its official currency or for widespread daily transactions, usually due to extreme instability in the domestic currency.' },
  { term: 'Domestic Credit', def: 'Financial resources provided to the private sector by banks and other financial institutions. Domestic credit as a share of GDP indicates financial sector depth and the availability of financing for businesses.' },
  { term: 'Dutch Disease', def: 'When a natural resource boom strengthens the currency, making other exports less competitive and crowding out the manufacturing sector. Named after the Netherlands\' experience with North Sea gas in the 1960s.' },
  // E
  { term: 'Economies of Scale', def: 'Cost advantages that arise when production increases, as fixed costs are spread over more units. A key driver of international trade and industrial concentration.' },
  { term: 'Embargo', def: 'A government order restricting trade with a specific country, often imposed for political rather than economic reasons. Trade embargoes can have severe economic consequences for targeted nations.' },
  { term: 'Emerging Market', def: 'An economy transitioning from low-income to middle- or upper-middle-income status, typically characterized by rapid growth, industrialization, and increasing integration with global markets.' },
  { term: 'Employment Rate', def: 'The percentage of the working-age population (typically ages 15-64) that is employed. Unlike the unemployment rate, it includes discouraged workers who have stopped looking for work.' },
  { term: 'Energy Intensity', def: 'The amount of energy consumed per unit of GDP. Declining energy intensity indicates an economy is becoming more efficient in its energy use, often through technological improvement and structural shifts.' },
  { term: 'Entitlement Spending', def: 'Government expenditure mandated by existing law, such as pensions, healthcare, and social security. These obligations grow automatically with demographics and inflation, limiting fiscal flexibility.' },
  { term: 'Eurozone', def: 'The group of European Union member states that have adopted the euro as their common currency. Currently 20 countries, sharing a single monetary policy set by the European Central Bank.' },
  { term: 'Exchange Rate', def: 'The price of one currency expressed in terms of another. Determined by supply and demand in foreign exchange markets, influenced by interest rates, inflation, trade flows, and capital movements.' },
  { term: 'Exchange Rate Regime', def: 'The framework a country uses to manage its currency\'s value. Ranges from free-floating (market-determined) to fixed (pegged to another currency), with many hybrid arrangements in between.' },
  { term: 'Export Subsidy', def: 'A government payment to domestic producers to make their exports more competitive abroad. Generally prohibited by WTO rules as they distort trade, though agricultural subsidies remain widespread.' },
  { term: 'External Debt', def: 'The total debt a country owes to foreign creditors, including government, corporate, and household borrowings. High external debt denominated in foreign currencies creates vulnerability to exchange rate shocks.' },
  // F
  { term: 'Federal Funds Rate', def: 'The interest rate at which US banks lend reserves to each other overnight. Set by the Federal Reserve, it is the most important benchmark rate in global financial markets.' },
  { term: 'Financial Inclusion', def: 'The degree to which individuals and businesses have access to useful and affordable financial products. Measured by indicators like bank account ownership, credit access, and mobile money usage.' },
  { term: 'Fiscal Cliff', def: 'A situation where previously scheduled tax increases and spending cuts threaten to take effect simultaneously, potentially causing a sharp fiscal contraction. The term gained prominence during US budget negotiations in 2012.' },
  { term: 'Fiscal Deficit', def: 'The amount by which government spending exceeds revenue in a given period. Persistent deficits add to the national debt and require borrowing to finance.' },
  { term: 'Fiscal Multiplier', def: 'The ratio of GDP change to the initial change in government spending or taxation. A multiplier greater than 1 means fiscal stimulus generates more economic activity than the initial spending.' },
  { term: 'Fiscal Policy', def: 'Government decisions about taxation and spending used to influence the economy. Expansionary fiscal policy (more spending or lower taxes) stimulates growth; contractionary policy does the opposite.' },
  { term: 'Fixed Exchange Rate', def: 'A currency regime where the government maintains its currency at a set rate against another currency or basket. Requires the central bank to intervene in foreign exchange markets to maintain the peg.' },
  { term: 'Floating Exchange Rate', def: 'A currency regime where the exchange rate is determined by market forces of supply and demand. Most major currencies (dollar, euro, yen, pound) operate under floating regimes.' },
  { term: 'Foreign Direct Investment (FDI)', def: 'Cross-border investment where a foreign entity acquires a lasting interest (usually 10%+ ownership) in a domestic enterprise. Includes building factories, acquiring companies, and reinvesting profits.' },
  { term: 'Foreign Exchange Reserves', def: 'Assets held by a central bank in foreign currencies, used to back liabilities and influence monetary policy. Adequate reserves (measured in months of imports) signal economic resilience.' },
  { term: 'Forward Guidance', def: 'Central bank communication about the expected future path of monetary policy. By signaling future intentions, central banks can influence market expectations and long-term interest rates.' },
  { term: 'Free Trade Agreement (FTA)', def: 'A pact between countries that reduces or eliminates tariffs, quotas, and other trade barriers. Examples include USMCA (North America), the EU single market, and RCEP (Asia-Pacific).' },
  { term: 'Frictional Unemployment', def: 'Short-term unemployment that occurs when workers are transitioning between jobs. A natural part of a healthy economy and typically not a cause for concern.' },
  // G
  { term: 'GDP (Gross Domestic Product)', def: 'The total monetary value of all finished goods and services produced within a country\'s borders in a specific period. The most widely used measure of economic size and performance.' },
  { term: 'GDP Deflator', def: 'A measure of the price level of all domestically produced goods and services. Unlike CPI, it covers the entire economy including investment and government spending, not just consumer goods.' },
  { term: 'GDP Per Capita', def: 'Total GDP divided by total population. Provides a rough measure of average economic output per person and is used to compare living standards across countries.' },
  { term: 'Gig Economy', def: 'A labor market characterized by short-term, freelance, or contract work rather than permanent employment. Enabled by digital platforms, it raises questions about worker protections and income stability.' },
  { term: 'Gini Coefficient', def: 'A measure of income inequality ranging from 0 (perfect equality) to 1 (perfect inequality). South Africa (0.63) and Brazil (0.53) have among the highest Gini coefficients; Nordic countries (0.25-0.28) have the lowest.' },
  { term: 'Global Value Chain (GVC)', def: 'The full range of activities involved in creating a product across multiple countries, from raw materials to final assembly. Modern manufactured goods often cross borders multiple times before reaching consumers.' },
  { term: 'Globalization', def: 'The increasing integration of economies worldwide through trade, investment, technology transfer, and migration. Has accelerated since the 1990s, though recent trends show selective "deglobalization" in some sectors.' },
  { term: 'Gold Standard', def: 'A monetary system where a currency\'s value is directly linked to a fixed quantity of gold. Abandoned by most countries during the 20th century in favor of fiat currencies managed by central banks.' },
  { term: 'Green Bond', def: 'A fixed-income instrument specifically earmarked to fund climate and environmental projects. The green bond market has grown rapidly, exceeding $500 billion in annual issuance.' },
  { term: 'Greenfield Investment', def: 'A type of foreign direct investment where a company builds new operations in another country from scratch, as opposed to acquiring existing businesses. Creates new jobs and productive capacity.' },
  { term: 'Gross Capital Formation', def: 'Total spending on fixed assets (buildings, machinery, equipment) plus changes in inventories. As a percentage of GDP, it measures how much an economy invests in expanding its productive capacity.' },
  { term: 'Gross National Income (GNI)', def: 'A country\'s total income, including GDP plus net income received from abroad (such as remittances and investment returns). Used by the World Bank for country income classifications.' },
  // H
  { term: 'Hawkish', def: 'A central bank stance favoring higher interest rates and tighter monetary policy to combat inflation, even at the cost of slower economic growth. The opposite of dovish.' },
  { term: 'Hedge Fund', def: 'A pooled investment fund that employs various strategies to earn returns, including leverage, short selling, and derivatives. Typically available only to institutional and high-net-worth investors.' },
  { term: 'Hot Money', def: 'Capital that flows rapidly between countries seeking the highest short-term returns. Hot money inflows can inflate asset bubbles; sudden outflows can trigger currency crises.' },
  { term: 'Household Consumption', def: 'Spending by households on goods and services, including food, housing, transportation, and recreation. Typically the largest component of GDP, often accounting for 50-70% of total economic output.' },
  { term: 'Human Capital', def: 'The economic value of a worker\'s skills, knowledge, and experience. Investment in human capital through education and training is a key driver of productivity growth and economic development.' },
  { term: 'Human Development Index (HDI)', def: 'A composite measure published by the United Nations combining life expectancy, education, and income per capita. Provides a broader measure of development than GDP alone.' },
  { term: 'Hyperinflation', def: 'Extremely rapid inflation, typically defined as prices rising by 50% or more per month. Historical examples include Weimar Germany (1923), Zimbabwe (2008), and Venezuela (2018).' },
  // I
  { term: 'IMF (International Monetary Fund)', def: 'An international organization of 190 countries that promotes global financial stability, provides emergency lending, and offers technical assistance. Countries with balance of payments crises often turn to the IMF.' },
  { term: 'Import Substitution', def: 'An economic policy that encourages domestic production of goods previously imported, typically through tariffs and subsidies. Widely practiced in Latin America and South Asia in the mid-20th century.' },
  { term: 'Income Elasticity', def: 'A measure of how demand for a good changes in response to changes in income. Luxury goods have high income elasticity; necessities like food have low income elasticity.' },
  { term: 'Industrial Policy', def: 'Government strategies to promote specific industries or sectors through subsidies, tax incentives, trade protection, or public investment. Increasingly common as countries compete in high-tech sectors.' },
  { term: 'Inflation', def: 'The rate at which the general level of prices rises over time, eroding purchasing power. Moderate inflation (around 2%) is targeted by most central banks as consistent with economic health.' },
  { term: 'Inflation Expectations', def: 'What businesses, consumers, and financial markets believe future inflation will be. Self-fulfilling: if people expect high inflation, they demand higher wages and raise prices, creating actual inflation.' },
  { term: 'Inflation Targeting', def: 'A monetary policy framework where the central bank commits to achieving a specific inflation rate, typically around 2%. Pioneered by New Zealand in 1990, now used by most major central banks.' },
  { term: 'Informal Economy', def: 'Economic activity that is not registered, regulated, or taxed by the government. Can account for over 30% of GDP in developing countries, complicating economic measurement and tax collection.' },
  { term: 'Infrastructure', def: 'The physical and organizational structures needed for the operation of a society, including transportation, energy, water, and telecommunications networks. A key determinant of economic productivity.' },
  { term: 'Intellectual Property (IP)', def: 'Legal rights protecting creations of the mind, including patents, trademarks, copyrights, and trade secrets. Strong IP protection incentivizes innovation but can restrict access to knowledge.' },
  { term: 'Interest Rate', def: 'The cost of borrowing money, expressed as a percentage. Central bank policy rates set the benchmark; all other rates in the economy (mortgages, corporate bonds, savings) are influenced by this benchmark.' },
  { term: 'Interest Rate Spread', def: 'The difference between two interest rates, commonly the gap between lending and deposit rates. A wider spread indicates higher bank profitability but also potentially less competitive banking.' },
  // J
  { term: 'J-Curve Effect', def: 'The pattern where a currency depreciation initially worsens the trade balance (because existing import contracts are priced in foreign currency) before improving it as export volumes respond to the weaker currency.' },
  { term: 'Jobless Recovery', def: 'An economic recovery where GDP growth resumes but unemployment remains elevated. Often occurs when firms increase productivity through technology and automation rather than hiring new workers.' },
  // K
  { term: 'Keynesian Economics', def: 'An economic theory arguing that government intervention through fiscal and monetary policy is necessary to stabilize the economy, especially during recessions. Named after economist John Maynard Keynes.' },
  // L
  { term: 'Labor Force Participation Rate', def: 'The percentage of the working-age population that is either employed or actively seeking employment. A falling rate can indicate discouraged workers leaving the labor market.' },
  { term: 'Labor Productivity', def: 'The amount of economic output produced per unit of labor input (typically per hour worked). Rising productivity is the primary driver of long-term increases in wages and living standards.' },
  { term: 'Laffer Curve', def: 'A theoretical relationship between tax rates and tax revenue, suggesting that both 0% and 100% tax rates generate zero revenue, with an optimal rate somewhere in between.' },
  { term: 'Leading Indicator', def: 'An economic variable that tends to change before the broader economy shifts. Examples include stock prices, building permits, and consumer confidence. Used to forecast upcoming economic trends.' },
  { term: 'Lender of Last Resort', def: 'A role of central banks to provide emergency funding to financial institutions facing liquidity crises. Prevents bank failures from cascading into systemic financial collapse.' },
  { term: 'Liquidity', def: 'The ease with which an asset can be converted to cash without significant loss of value. Cash is the most liquid asset; real estate and private equity are among the least liquid.' },
  { term: 'Liquidity Trap', def: 'A situation where interest rates are near zero and monetary policy becomes ineffective because people hoard cash rather than spend or invest. Japan\'s experience in the 1990s-2000s is the classic example.' },
  // M
  { term: 'M2 Money Supply', def: 'A broad measure of the money supply including cash, checking deposits, savings deposits, money market securities, and other near-money assets. Tracked as an indicator of inflationary pressure.' },
  { term: 'Macroprudential Policy', def: 'Regulatory measures aimed at ensuring the stability of the financial system as a whole, rather than individual institutions. Includes tools like capital buffers, loan-to-value limits, and stress tests.' },
  { term: 'Manufacturing Value Added', def: 'The contribution of the manufacturing sector to GDP after subtracting input costs. A declining manufacturing share often signals an economy transitioning toward services.' },
  { term: 'Marginal Tax Rate', def: 'The tax rate applied to the last dollar of income earned. Progressive tax systems have higher marginal rates at higher income levels. Affects incentives to earn additional income.' },
  { term: 'Market Capitalization', def: 'The total value of a company\'s outstanding shares (share price x number of shares). For stock markets as a whole, market cap to GDP (the "Buffett indicator") is used to gauge market valuation.' },
  { term: 'Mercantilism', def: 'An economic doctrine holding that a nation\'s wealth depends on maximizing exports and minimizing imports. Though largely discredited by modern economics, mercantilist ideas persist in trade policy debates.' },
  { term: 'Microfinance', def: 'Financial services, including small loans and savings accounts, provided to individuals and small businesses that lack access to conventional banking. Pioneered by Grameen Bank in Bangladesh.' },
  { term: 'Middle Income Trap', def: 'A development challenge where countries achieve middle-income status but struggle to advance to high-income levels due to rising wages eroding competitiveness before innovation-led growth takes over.' },
  { term: 'Monetary Policy', def: 'Central bank actions to manage the money supply and interest rates to achieve macroeconomic objectives, typically price stability and maximum employment.' },
  { term: 'Moral Hazard', def: 'When a party takes on greater risk because they know someone else will bear the consequences. In economics, often discussed in the context of bank bailouts that may encourage reckless lending.' },
  { term: 'Most Favored Nation (MFN)', def: 'A WTO principle requiring that any trade advantage granted to one member must be extended to all members. Ensures non-discriminatory treatment in international trade.' },
  { term: 'Multiplier Effect', def: 'The phenomenon where an initial injection of spending circulates through the economy, generating a larger total increase in income and output than the original amount.' },
  // N
  { term: 'NAFTA/USMCA', def: 'The North American Free Trade Agreement (1994), replaced by the United States-Mexico-Canada Agreement (2020). Eliminated most tariffs between the three countries, creating one of the world\'s largest free trade areas.' },
  { term: 'Natural Rate of Unemployment', def: 'The unemployment rate consistent with stable inflation, also called NAIRU (Non-Accelerating Inflation Rate of Unemployment). Includes frictional and structural unemployment but not cyclical unemployment.' },
  { term: 'Negative Interest Rates', def: 'A policy where the central bank sets its benchmark rate below zero, effectively charging banks for holding excess reserves. Implemented by the ECB, Bank of Japan, and others to stimulate lending.' },
  { term: 'Net Migration', def: 'The difference between the number of immigrants entering and emigrants leaving a country. Positive net migration increases the population and labor force; negative migration can accelerate demographic decline.' },
  { term: 'Nominal', def: 'Measured in current prices without adjustment for inflation. Nominal GDP, nominal wages, and nominal interest rates all include the effect of price changes.' },
  { term: 'Non-Performing Loan (NPL)', def: 'A loan where the borrower has failed to make scheduled payments for a specified period (typically 90 days). The NPL ratio is a key indicator of banking sector health.' },
  // O
  { term: 'OECD', def: 'The Organisation for Economic Co-operation and Development, a group of 38 mostly high-income countries that share data and policy analysis. Membership is often used as a proxy for "developed economy" status.' },
  { term: 'OPEC', def: 'The Organization of the Petroleum Exporting Countries, a cartel of 13 oil-producing nations that coordinates production levels to influence global oil prices. OPEC+ includes additional producers like Russia.' },
  { term: 'Open Market Operations', def: 'The buying and selling of government securities by a central bank to implement monetary policy. Purchases inject money into the banking system; sales withdraw it.' },
  { term: 'Opportunity Cost', def: 'The value of the next best alternative forgone when making a choice. A foundational concept in economics that applies to all decision-making, from personal finance to national policy.' },
  { term: 'Output Gap', def: 'The difference between actual GDP and potential GDP (the maximum sustainable output). A negative gap indicates underutilized resources and slack; a positive gap suggests overheating and inflationary pressure.' },
  // P
  { term: 'Patent', def: 'A government-granted exclusive right to an invention, typically lasting 20 years. Patent filings are used as a proxy for innovation activity and are tracked by WIPO and national patent offices.' },
  { term: 'Pegged Currency', def: 'A currency whose value is fixed to another currency (often the US dollar) or a basket of currencies. The central bank must maintain sufficient reserves to defend the peg.' },
  { term: 'Per Capita Income', def: 'The average income per person in a country, calculated by dividing national income by population. Used alongside GDP per capita to compare living standards internationally.' },
  { term: 'Phillips Curve', def: 'The observed inverse relationship between unemployment and inflation: when unemployment falls, inflation tends to rise, and vice versa. The relationship has weakened in recent decades.' },
  { term: 'Portfolio Investment', def: 'Cross-border investment in financial assets like stocks and bonds, where the investor does not seek a controlling interest. More liquid and volatile than foreign direct investment.' },
  { term: 'Poverty Line', def: 'The minimum income level below which a person is considered to be in poverty. The World Bank\'s international poverty line is $2.15 per day (2017 PPP), while national poverty lines vary significantly.' },
  { term: 'Price Elasticity', def: 'A measure of how much the quantity demanded or supplied of a good changes in response to a price change. Inelastic goods (like gasoline) see little demand change; elastic goods (like luxury items) see large changes.' },
  { term: 'Primary Balance', def: 'The government\'s budget balance excluding interest payments on existing debt. A key indicator of current fiscal policy stance, as it shows whether the government is living within its means apart from legacy debt.' },
  { term: 'Private Equity', def: 'Investment in companies that are not publicly traded on stock exchanges. Includes buyouts, growth capital, and venture capital. Private equity firms typically aim to improve operations before selling.' },
  { term: 'Privatization', def: 'The transfer of government-owned enterprises or assets to private ownership. Common in the 1980s-1990s in the UK, Eastern Europe, and Latin America, aimed at improving efficiency and reducing government burden.' },
  { term: 'Producer Price Index (PPI)', def: 'A measure of average changes in prices received by domestic producers for their output. PPI often leads CPI, as producer cost increases are eventually passed on to consumers.' },
  { term: 'Productivity', def: 'The efficiency with which inputs (labor, capital, materials) are converted into outputs. Total factor productivity — the portion of output not explained by inputs — is a key measure of technological progress.' },
  { term: 'Progressive Tax', def: 'A tax system where higher income earners pay a larger percentage of their income. Most income tax systems are progressive, with tax brackets that increase at higher income levels.' },
  { term: 'Protectionism', def: 'Government policies that restrict international trade to protect domestic industries, including tariffs, quotas, and subsidies. Can preserve jobs in the short term but typically reduces overall economic efficiency.' },
  { term: 'Public Goods', def: 'Goods that are non-excludable (cannot prevent use) and non-rivalrous (one person\'s use does not diminish another\'s). Classic examples include national defense, street lighting, and clean air.' },
  { term: 'Purchasing Managers\' Index (PMI)', def: 'A monthly survey of private sector companies that indicates the health of manufacturing and services sectors. Readings above 50 signal expansion; below 50 signal contraction.' },
  { term: 'Purchasing Power Parity (PPP)', def: 'An exchange rate adjustment that equalizes the purchasing power of different currencies, accounting for price level differences between countries. Makes GDP comparisons more meaningful for assessing living standards.' },
  // Q
  { term: 'Quantitative Easing (QE)', def: 'A monetary policy tool where the central bank purchases government bonds and other assets to inject liquidity and lower long-term interest rates. Used when conventional rate cuts have reached their limit at zero.' },
  { term: 'Quantitative Tightening (QT)', def: 'The reverse of quantitative easing: the central bank reduces its balance sheet by allowing bonds to mature without reinvestment or actively selling assets. Removes liquidity from the financial system.' },
  { term: 'Quota', def: 'A government-imposed limit on the quantity of a specific good that can be imported. Unlike tariffs, quotas directly cap import volumes regardless of price, and can lead to higher domestic prices.' },
  // R
  { term: 'R&D Expenditure', def: 'Spending on research and development activities, typically expressed as a percentage of GDP. A key input measure of innovation, with global leaders like Israel and South Korea spending over 4% of GDP.' },
  { term: 'Real', def: 'Adjusted for inflation to reflect actual purchasing power. Real GDP, real wages, and real interest rates strip out price changes to show genuine economic changes.' },
  { term: 'Real Effective Exchange Rate (REER)', def: 'A currency\'s trade-weighted average value against a basket of partner currencies, adjusted for inflation differentials. A rising REER indicates declining export competitiveness.' },
  { term: 'Recession', def: 'A significant decline in economic activity. Commonly defined as two consecutive quarters of negative GDP growth, though the official US definition (NBER) uses a broader set of indicators.' },
  { term: 'Regressive Tax', def: 'A tax that takes a larger percentage of income from lower-income earners. Sales taxes and value-added taxes (VAT) are regressive because lower-income households spend a higher share of their income.' },
  { term: 'Remittances', def: 'Money sent by migrant workers to their home countries. For some developing nations, remittances exceed foreign aid and FDI combined, providing a vital source of income and foreign exchange.' },
  { term: 'Renewable Energy', def: 'Energy derived from naturally replenishing sources such as solar, wind, hydro, and geothermal. The share of renewable energy in total consumption is a key sustainability metric.' },
  { term: 'Rent-Seeking', def: 'Activities aimed at gaining wealth by manipulating the political or economic environment rather than through productive activity. Examples include lobbying for favorable regulations or monopoly protections.' },
  { term: 'Reserve Currency', def: 'A currency widely held by central banks and used for international transactions. The US dollar is the dominant reserve currency, followed by the euro, yen, pound, and increasingly the Chinese yuan.' },
  { term: 'Reserve Requirement', def: 'The minimum percentage of deposits that a bank must hold in reserve rather than lend out. A tool of monetary policy: higher requirements restrict lending; lower requirements expand it.' },
  { term: 'Resource Curse', def: 'The paradox where countries rich in natural resources (oil, minerals) often have slower economic growth and worse governance than resource-poor countries. Also called the "paradox of plenty."' },
  // S
  { term: 'Safe Haven', def: 'An asset or currency that investors flock to during periods of market stress. The US dollar, Swiss franc, Japanese yen, US Treasury bonds, and gold are traditional safe havens.' },
  { term: 'Sanctions', def: 'Economic penalties imposed by one or more countries on another to compel policy changes. Can include trade restrictions, asset freezes, and exclusion from financial systems like SWIFT.' },
  { term: 'Secular Stagnation', def: 'A theory that advanced economies face persistently weak growth and low interest rates due to structural factors like aging populations, inequality, and declining investment demand.' },
  { term: 'Services Sector', def: 'The portion of the economy that produces intangible goods, including finance, healthcare, education, technology, and hospitality. Dominates GDP in developed economies, typically accounting for 60-80%.' },
  { term: 'Shadow Banking', def: 'Financial intermediation conducted outside the regulated banking system, including money market funds, hedge funds, and securitization vehicles. Can amplify systemic risk due to less oversight.' },
  { term: 'Soft Landing', def: 'A scenario where a central bank successfully slows the economy enough to reduce inflation without triggering a recession. Considered difficult to achieve and relatively rare historically.' },
  { term: 'Sovereign Debt', def: 'Debt issued or guaranteed by a national government. Sovereign bonds are a primary tool for government borrowing and their yields serve as benchmarks for all other debt in the economy.' },
  { term: 'Sovereign Wealth Fund', def: 'A state-owned investment fund, typically funded by commodity revenues or foreign exchange reserves. Major funds include Norway\'s Government Pension Fund, Abu Dhabi Investment Authority, and Singapore\'s GIC.' },
  { term: 'Special Drawing Rights (SDR)', def: 'An international reserve asset created by the IMF, based on a basket of five currencies (dollar, euro, yen, pound, yuan). Used as a unit of account by the IMF and some international organizations.' },
  { term: 'Stagflation', def: 'A combination of stagnant economic growth, high unemployment, and high inflation. Particularly challenging for policymakers because the usual remedies for slow growth (lower rates) worsen inflation.' },
  { term: 'STEM', def: 'Science, Technology, Engineering, and Mathematics. STEM graduate share is used as an indicator of a country\'s capacity to supply technical workers for innovation-driven industries.' },
  { term: 'Stimulus Package', def: 'A combination of government spending increases and tax cuts designed to boost economic activity during a downturn. The size and composition of stimulus packages vary by country and circumstance.' },
  { term: 'Structural Unemployment', def: 'Long-term unemployment caused by fundamental changes in an economy, such as technological displacement, industry decline, or geographic mismatch between workers and jobs.' },
  { term: 'Subsidy', def: 'A government payment or tax benefit provided to individuals or businesses to encourage specific activities. Subsidies can promote social goals but may distort markets and be costly to maintain.' },
  { term: 'Supply Chain', def: 'The network of organizations, resources, and processes involved in producing and delivering a product from raw materials to the end consumer. Supply chain disruptions can cause shortages and inflation.' },
  { term: 'Supply-Side Economics', def: 'An economic theory emphasizing tax cuts, deregulation, and free trade as the primary drivers of economic growth, arguing that policies benefiting producers will increase output and benefit everyone.' },
  { term: 'Systemic Risk', def: 'The risk that the failure of one financial institution or market triggers a cascading collapse of the entire financial system. Addressing systemic risk is a primary goal of macroprudential regulation.' },
  // T
  { term: 'Tariff', def: 'A tax imposed on imported goods. Used to protect domestic industries, raise revenue, or as a tool in trade negotiations. Tariffs raise prices for consumers and can provoke retaliatory measures.' },
  { term: 'Tax Haven', def: 'A jurisdiction with very low or zero tax rates that attracts foreign individuals and companies seeking to minimize tax obligations. Raises concerns about tax base erosion in other countries.' },
  { term: 'Terms of Trade', def: 'The ratio of a country\'s export prices to its import prices. Improving terms of trade mean a country can buy more imports for each unit of exports, effectively increasing its real income.' },
  { term: 'Total Factor Productivity (TFP)', def: 'The portion of output growth not explained by increases in labor and capital inputs. Reflects technological progress, efficiency improvements, and innovation. A key driver of long-term economic growth.' },
  { term: 'Trade Balance', def: 'The difference between a country\'s exports and imports. A surplus means exports exceed imports; a deficit means the opposite. Neither is inherently good or bad.' },
  { term: 'Trade Deficit', def: 'When a country\'s imports exceed its exports. Can reflect strong domestic demand and investment, or structural competitiveness challenges. Must be financed by capital inflows from abroad.' },
  { term: 'Trade Openness', def: 'Total trade (exports plus imports) as a percentage of GDP. Higher values indicate greater integration with the global economy. Small open economies typically have ratios exceeding 100%.' },
  { term: 'Trade War', def: 'An escalating exchange of trade restrictions between countries, with each side imposing tariffs or other barriers in retaliation. Can disrupt global supply chains and reduce economic growth for all parties.' },
  { term: 'Trademark', def: 'A legal protection for a recognizable sign, design, or expression that identifies products or services. Trademark applications are tracked as an indicator of commercial innovation and brand development.' },
  { term: 'Transfer Payments', def: 'Government payments to individuals for which no goods or services are received in return, such as social security, unemployment benefits, and welfare. A key tool for income redistribution.' },
  { term: 'Treasury Bond', def: 'A debt security issued by a national government, typically with maturities of 10 years or more. US Treasuries are considered the global risk-free benchmark.' },
  { term: 'Twin Deficits', def: 'The simultaneous occurrence of a fiscal deficit (government spending exceeding revenue) and a current account deficit (imports exceeding exports). The theory suggests the two are causally linked.' },
  // U
  { term: 'Underemployment', def: 'A situation where workers are employed in positions below their skill level or work fewer hours than desired. Not captured by the headline unemployment rate.' },
  { term: 'Underground Economy', def: 'Economic activity that is hidden from government to evade taxes or regulations. Also called the shadow economy. Can be significant in developing countries with weak institutions.' },
  { term: 'Unemployment Rate', def: 'The percentage of the labor force that is jobless and actively seeking work. The most widely cited labor market indicator, though it has significant limitations.' },
  { term: 'Unicorn', def: 'A privately held startup company valued at over one billion US dollars. The term was coined in 2013 when such companies were rare; by 2024 there were over 1,200 globally.' },
  { term: 'Universal Basic Income (UBI)', def: 'A government program providing regular unconditional cash payments to all citizens regardless of employment status. Debated as a potential response to automation and inequality.' },
  { term: 'Urbanization', def: 'The increasing share of a country\'s population living in urban areas. Associated with industrialization, higher productivity, and better access to services, but also challenges like congestion and inequality.' },
  // V
  { term: 'Value Added', def: 'The difference between the value of a firm\'s output and the cost of its inputs. GDP is essentially the sum of value added across all firms in an economy.' },
  { term: 'Value Added Tax (VAT)', def: 'A consumption tax levied at each stage of production on the value added. Used by over 160 countries. Efficient to collect but regressive, as it takes a higher share of income from lower earners.' },
  { term: 'Velocity of Money', def: 'The rate at which money circulates through the economy. Calculated as nominal GDP divided by the money supply. Declining velocity can offset money supply increases, weakening the impact of monetary policy.' },
  { term: 'Venture Capital', def: 'Private equity financing provided to early-stage, high-growth companies in exchange for ownership stakes. VC funding levels are used as an indicator of startup ecosystem health.' },
  { term: 'Volatility', def: 'The degree of variation in the price of an asset over time. Higher volatility indicates greater uncertainty and risk. Often measured by standard deviation or indices like the VIX for stock markets.' },
  // W
  { term: 'Wage-Price Spiral', def: 'A self-reinforcing cycle where rising wages lead to higher production costs, which lead to higher prices, which lead workers to demand higher wages again. A key concern during periods of high inflation.' },
  { term: 'Washington Consensus', def: 'A set of free-market economic policies (fiscal discipline, trade liberalization, privatization, deregulation) promoted by the IMF and World Bank for developing countries in the 1980s-1990s. Controversial and partially revisited.' },
  { term: 'Wealth Effect', def: 'The tendency for people to spend more when they feel wealthier, typically due to rising asset values (stocks, real estate). An important channel through which monetary policy affects the real economy.' },
  { term: 'World Bank', def: 'An international financial institution providing loans, grants, and technical assistance to developing countries for capital projects. A key source of global economic data and development research.' },
  { term: 'World Trade Organization (WTO)', def: 'An international organization that regulates and facilitates international trade through a rules-based system. Provides a framework for negotiating trade agreements and resolving disputes.' },
  // Y
  { term: 'Yield Curve', def: 'A graph showing the relationship between bond yields and their maturities. A normal curve slopes upward (longer maturities pay more). An inverted curve (short rates exceed long rates) has historically preceded recessions.' },
  { term: 'Yield Curve Control', def: 'A monetary policy where the central bank targets specific bond yields at certain maturities. The Bank of Japan pioneered this by capping 10-year government bond yields.' },
  { term: 'Youth Unemployment', def: 'The unemployment rate among people aged 15-24. Typically higher than the overall rate, it reflects challenges young people face entering the labor market and has long-term economic consequences.' },
  // Z
  { term: 'Zero Lower Bound', def: 'The point at which the central bank\'s policy interest rate reaches zero and cannot be lowered further using conventional tools. Historically seen as a constraint, though negative rates have since been tried.' },
  { term: 'Zero-Sum Game', def: 'A situation where one party\'s gain is exactly another\'s loss. International trade is generally not zero-sum — it creates mutual gains — but specific trade disputes can have zero-sum characteristics.' },
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

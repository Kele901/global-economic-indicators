import { EconomicMetricInfo } from '../components/InfoPanel';

export const economicMetrics: { [key: string]: EconomicMetricInfo } = {
  // Interest Rate Metrics
  interestRate: {
    title: 'Interest Rate',
    description: 'The cost of borrowing money or the return on savings, expressed as a percentage of the principal amount.',
    formula: 'Interest Rate = (Interest Amount / Principal) × 100',
    interpretation: 'Higher rates indicate more expensive borrowing and better returns on savings. Lower rates encourage borrowing and investment but reduce savings returns.',
    implications: [
      'Affects consumer spending and business investment decisions',
      'Influences currency strength and exchange rates',
      'Impacts inflation and economic growth',
      'Affects housing market and mortgage rates',
      'Influences stock and bond market performance'
    ],
    dataSource: 'Central Banks, World Bank',
    frequency: 'Monthly',
    units: 'Percentage (%)',
    relatedMetrics: ['Inflation Rate', 'GDP Growth', 'Unemployment Rate', 'Exchange Rate']
  },

  interestRates: {
    title: 'Interest Rate',
    description: 'The cost of borrowing money or the return on savings, expressed as a percentage of the principal amount.',
    formula: 'Interest Rate = (Interest Amount / Principal) × 100',
    interpretation: 'Higher rates indicate more expensive borrowing and better returns on savings. Lower rates encourage borrowing and investment but reduce savings returns.',
    implications: [
      'Affects consumer spending and business investment decisions',
      'Influences currency strength and exchange rates',
      'Impacts inflation and economic growth',
      'Affects housing market and mortgage rates',
      'Influences stock and bond market performance'
    ],
    dataSource: 'Central Banks, World Bank',
    frequency: 'Monthly',
    units: 'Percentage (%)',
    relatedMetrics: ['Inflation Rate', 'GDP Growth', 'Unemployment Rate', 'Exchange Rate']
  },

  inflationRate: {
    title: 'Inflation Rate',
    description: 'The rate at which the general level of prices for goods and services is rising, eroding purchasing power.',
    formula: 'Inflation Rate = ((Current CPI - Previous CPI) / Previous CPI) × 100',
    interpretation: 'Positive inflation means prices are rising, negative inflation (deflation) means prices are falling. Moderate inflation (2-3%) is generally healthy for economic growth.',
    implications: [
      'Reduces real value of money over time',
      'Affects interest rate decisions by central banks',
      'Impacts wage negotiations and cost-of-living adjustments',
      'Influences investment decisions and asset allocation',
      'Affects international trade competitiveness'
    ],
    dataSource: 'National Statistical Offices, World Bank',
    frequency: 'Monthly',
    units: 'Percentage (%)',
    relatedMetrics: ['Interest Rate', 'CPI', 'GDP Growth', 'Wage Growth']
  },

  inflationRates: {
    title: 'Inflation Rate',
    description: 'The rate at which the general level of prices for goods and services is rising, eroding purchasing power.',
    formula: 'Inflation Rate = ((Current CPI - Previous CPI) / Previous CPI) × 100',
    interpretation: 'Positive inflation means prices are rising, negative inflation (deflation) means prices are falling. Moderate inflation (2-3%) is generally healthy for economic growth.',
    implications: [
      'Reduces real value of money over time',
      'Affects interest rate decisions by central banks',
      'Impacts wage negotiations and cost-of-living adjustments',
      'Influences investment decisions and asset allocation',
      'Affects international trade competitiveness'
    ],
    dataSource: 'National Statistical Offices, World Bank',
    frequency: 'Monthly',
    units: 'Percentage (%)',
    relatedMetrics: ['Interest Rate', 'CPI', 'GDP Growth', 'Wage Growth']
  },

  gdpGrowth: {
    title: 'GDP Growth Rate',
    description: 'The percentage change in Gross Domestic Product from one period to the next, indicating economic expansion or contraction.',
    formula: 'GDP Growth = ((Current GDP - Previous GDP) / Previous GDP) × 100',
    interpretation: 'Positive growth indicates economic expansion, negative growth indicates recession. Higher growth rates suggest stronger economic performance.',
    implications: [
      'Indicates overall economic health and direction',
      'Affects employment levels and job creation',
      'Influences government tax revenue and spending',
      'Impacts business confidence and investment decisions',
      'Affects currency strength and international standing'
    ],
    dataSource: 'National Statistical Offices, IMF, World Bank',
    frequency: 'Quarterly',
    units: 'Percentage (%)',
    relatedMetrics: ['Unemployment Rate', 'Interest Rate', 'Inflation Rate', 'Consumer Spending']
  },

  unemploymentRate: {
    title: 'Unemployment Rate',
    description: 'The percentage of the labor force that is jobless and actively seeking employment.',
    formula: 'Unemployment Rate = (Unemployed People / Labor Force) × 100',
    interpretation: 'Lower rates indicate a stronger job market and economy. Very low rates may lead to wage inflation, while high rates suggest economic weakness.',
    implications: [
      'Indicates labor market health and economic strength',
      'Affects consumer spending and economic growth',
      'Influences wage levels and inflation',
      'Impacts government social spending and tax revenue',
      'Affects political stability and social cohesion'
    ],
    dataSource: 'National Labor Offices, World Bank',
    frequency: 'Monthly',
    units: 'Percentage (%)',
    relatedMetrics: ['GDP Growth', 'Interest Rate', 'Wage Growth', 'Consumer Confidence']
  },

  employmentRate: {
    title: 'Employment Rate',
    description: 'The percentage of working-age population that is currently employed.',
    formula: 'Employment Rate = (Employed People / Working-Age Population) × 100',
    interpretation: 'Higher rates indicate more people are working and contributing to economic output. This metric complements the unemployment rate.',
    implications: [
      'Shows labor force participation and economic activity',
      'Indicates productive capacity of the economy',
      'Affects tax revenue and social security contributions',
      'Influences consumer spending and economic growth',
      'Reflects demographic and social trends'
    ],
    dataSource: 'National Labor Offices, World Bank',
    frequency: 'Monthly',
    units: 'Percentage (%)',
    relatedMetrics: ['Unemployment Rate', 'Labor Force Participation', 'GDP Growth', 'Wage Growth']
  },

  employmentRates: {
    title: 'Employment Rate',
    description: 'The percentage of working-age population that is currently employed.',
    formula: 'Employment Rate = (Employed People / Working-Age Population) × 100',
    interpretation: 'Higher rates indicate more people are working and contributing to economic output. This metric complements the unemployment rate.',
    implications: [
      'Shows labor force participation and economic activity',
      'Indicates productive capacity of the economy',
      'Affects tax revenue and social security contributions',
      'Influences consumer spending and economic growth',
      'Reflects demographic and social trends'
    ],
    dataSource: 'National Labor Offices, World Bank',
    frequency: 'Monthly',
    units: 'Percentage (%)',
    relatedMetrics: ['Unemployment Rate', 'Labor Force Participation', 'GDP Growth', 'Wage Growth']
  },

  governmentDebt: {
    title: 'Government Debt to GDP',
    description: 'The ratio of government debt to Gross Domestic Product, indicating the government\'s debt burden relative to economic size.',
    formula: 'Debt-to-GDP Ratio = (Government Debt / GDP) × 100',
    interpretation: 'Lower ratios indicate healthier public finances. Very high ratios (above 90%) may indicate fiscal stress and reduced economic growth potential.',
    implications: [
      'Affects government borrowing costs and credit ratings',
      'Influences monetary policy and interest rate decisions',
      'Impacts investor confidence and currency strength',
      'Affects future tax burden and government spending',
      'Influences international lending and trade relationships'
    ],
    dataSource: 'National Treasuries, IMF, World Bank',
    frequency: 'Quarterly',
    units: 'Percentage (%)',
    relatedMetrics: ['GDP Growth', 'Interest Rate', 'Inflation Rate', 'Government Spending']
  },

  governmentSpending: {
    title: 'Government Spending',
    description: 'Total government expenditure on goods, services, and transfer payments as a percentage of GDP.',
    formula: 'Government Spending = (Total Government Expenditure / GDP) × 100',
    interpretation: 'Higher levels indicate larger government role in economy. Optimal levels depend on economic conditions and policy objectives.',
    implications: [
      'Affects economic growth and employment',
      'Influences inflation and interest rates',
      'Impacts private sector activity and investment',
      'Affects fiscal sustainability and debt levels',
      'Influences income distribution and social welfare'
    ],
    dataSource: 'National Treasuries, IMF, World Bank',
    frequency: 'Quarterly',
    units: 'Percentage of GDP (%)',
    relatedMetrics: ['Government Debt', 'GDP Growth', 'Tax Revenue', 'Inflation Rate']
  },

  tradeBalance: {
    title: 'Trade Balance',
    description: 'The difference between a country\'s exports and imports of goods and services.',
    formula: 'Trade Balance = Exports - Imports',
    interpretation: 'Positive balance (surplus) means exports exceed imports. Negative balance (deficit) means imports exceed exports.',
    implications: [
      'Affects currency strength and exchange rates',
      'Influences economic growth and employment',
      'Impacts current account and balance of payments',
      'Affects domestic industry competitiveness',
      'Influences international trade relationships'
    ],
    dataSource: 'Customs Authorities, World Trade Organization',
    frequency: 'Monthly',
    units: 'Currency units or percentage of GDP',
    relatedMetrics: ['Exchange Rate', 'GDP Growth', 'Inflation Rate', 'Employment Rate']
  },

  fdi: {
    title: 'Foreign Direct Investment',
    description: 'Investment made by a foreign entity in a country\'s economy, typically involving ownership of business assets.',
    formula: 'FDI = Foreign Investment Inflows - Foreign Investment Outflows',
    interpretation: 'Positive FDI indicates foreign capital is flowing into the country, suggesting confidence in the economy and growth potential.',
    implications: [
      'Brings capital, technology, and expertise',
      'Creates jobs and economic growth',
      'Improves international trade relationships',
      'Enhances productivity and competitiveness',
      'Affects currency strength and exchange rates'
    ],
    dataSource: 'Central Banks, IMF, UNCTAD',
    frequency: 'Quarterly',
    units: 'Currency units or percentage of GDP',
    relatedMetrics: ['GDP Growth', 'Exchange Rate', 'Trade Balance', 'Employment Rate']
  },

  cpi: {
    title: 'Consumer Price Index',
    description: 'A measure of the average change over time in the prices paid by urban consumers for a market basket of consumer goods and services.',
    formula: 'CPI = (Cost of Market Basket in Current Year / Cost of Market Basket in Base Year) × 100',
    interpretation: 'Rising CPI indicates inflation, falling CPI indicates deflation. Base year CPI is typically set to 100.',
    implications: [
      'Primary measure of inflation for consumers',
      'Affects interest rate decisions by central banks',
      'Influences wage negotiations and social security adjustments',
      'Impacts purchasing power and consumer spending',
      'Affects investment returns and asset allocation'
    ],
    dataSource: 'National Statistical Offices, World Bank',
    frequency: 'Monthly',
    units: 'Index (base year = 100)',
    relatedMetrics: ['Inflation Rate', 'Interest Rate', 'Wage Growth', 'Consumer Spending']
  },

  populationGrowth: {
    title: 'Population Growth Rate',
    description: 'The annual percentage change in population size, including natural increase and net migration.',
    formula: 'Population Growth = ((Current Population - Previous Population) / Previous Population) × 100',
    interpretation: 'Positive growth indicates population increase, negative growth indicates population decline. Growth rates affect economic potential and demand.',
    implications: [
      'Affects labor supply and economic growth potential',
      'Influences housing demand and real estate markets',
      'Impacts government services and infrastructure needs',
      'Affects consumer spending and market size',
      'Influences social security and pension systems'
    ],
    dataSource: 'National Statistical Offices, UN Population Division',
    frequency: 'Annually',
    units: 'Percentage (%)',
    relatedMetrics: ['GDP Growth', 'Employment Rate', 'Housing Market', 'Consumer Spending']
  },

  laborProductivity: {
    title: 'Labor Productivity',
    description: 'The amount of economic output produced per hour of labor, measuring economic efficiency.',
    formula: 'Labor Productivity = GDP / Total Hours Worked',
    interpretation: 'Higher productivity indicates more efficient production and higher living standards. Growth in productivity drives long-term economic growth.',
    implications: [
      'Drives long-term economic growth and living standards',
      'Affects wage levels and employment opportunities',
      'Influences international competitiveness',
      'Impacts inflation and interest rate decisions',
      'Affects investment in technology and education'
    ],
    dataSource: 'National Statistical Offices, OECD, World Bank',
    frequency: 'Quarterly',
    units: 'Output per hour worked',
    relatedMetrics: ['GDP Growth', 'Wage Growth', 'Employment Rate', 'Technology Investment']
  },

  giniCoefficient: {
    title: 'Gini Coefficient',
    description: 'A measure of income inequality ranging from 0 (perfect equality) to 1 (perfect inequality).',
    formula: 'Gini = Area between Lorenz curve and equality line / Total area below equality line',
    interpretation: 'Lower values indicate more equal income distribution. Values above 0.4 suggest significant inequality, above 0.5 indicate high inequality.',
    implications: [
      'Affects social stability and political outcomes',
      'Influences consumer spending patterns',
      'Impacts economic growth and development',
      'Affects health outcomes and social mobility',
      'Influences government policy priorities'
    ],
    dataSource: 'National Statistical Offices, World Bank, UN',
    frequency: 'Annually',
    units: 'Coefficient (0-1)',
    relatedMetrics: ['GDP Growth', 'Unemployment Rate', 'Government Spending', 'Social Mobility']
  },

  rdSpending: {
    title: 'Research & Development Spending',
    description: 'Total expenditure on research and development activities as a percentage of GDP.',
    formula: 'R&D Spending = (Total R&D Expenditure / GDP) × 100',
    interpretation: 'Higher levels indicate greater investment in innovation and future economic competitiveness. OECD average is around 2.5% of GDP.',
    implications: [
      'Drives technological innovation and productivity growth',
      'Affects long-term economic competitiveness',
      'Influences job creation in high-tech sectors',
      'Impacts international trade and investment',
      'Affects future economic growth potential'
    ],
    dataSource: 'National Statistical Offices, OECD, UNESCO',
    frequency: 'Annually',
    units: 'Percentage of GDP (%)',
    relatedMetrics: ['Labor Productivity', 'GDP Growth', 'Technology Investment', 'Trade Balance']
  },

  energyConsumption: {
    title: 'Energy Consumption per Capita',
    description: 'Total energy consumption divided by population, indicating energy intensity of economic activity.',
    formula: 'Energy per Capita = Total Energy Consumption / Population',
    interpretation: 'Higher levels may indicate industrial development but also environmental impact. Efficiency improvements can reduce consumption while maintaining output.',
    implications: [
      'Affects environmental sustainability and climate change',
      'Influences energy security and import dependence',
      'Impacts economic competitiveness and costs',
      'Affects public health and quality of life',
      'Influences international energy markets'
    ],
    dataSource: 'International Energy Agency, World Bank',
    frequency: 'Annually',
    units: 'Energy units per person',
    relatedMetrics: ['GDP Growth', 'Population Growth', 'Environmental Impact', 'Trade Balance']
  },

  // Economic Gravity Specific Metrics
  economicCenterOfGravity: {
    title: 'Economic Center of Gravity',
    description: 'The geographic center point where global economic activity is concentrated, calculated based on GDP distribution across regions.',
    formula: 'Center = Σ(Region GDP × Geographic Coordinates) / Total Global GDP',
    interpretation: 'Shows how economic power has shifted geographically over time. Movement indicates changing patterns of global economic dominance.',
    implications: [
      'Reflects shifts in global economic power',
      'Influences trade patterns and investment flows',
      'Affects currency strength and financial markets',
      'Impacts geopolitical relationships and alliances',
      'Shows long-term economic development trends'
    ],
    dataSource: 'Historical Economic Research, World Bank, IMF',
    frequency: 'Historical Analysis',
    units: 'Geographic coordinates',
    relatedMetrics: ['GDP Growth', 'Trade Balance', 'FDI', 'Population Growth']
  },

  gdpShareByRegion: {
    title: 'GDP Share by Region',
    description: 'The percentage of global economic output contributed by different geographic regions over time.',
    formula: 'Regional Share = (Regional GDP / Global GDP) × 100',
    interpretation: 'Shows relative economic importance of different regions. Changes indicate shifts in global economic power and development patterns.',
    implications: [
      'Indicates regional economic development levels',
      'Affects global trade and investment patterns',
      'Influences currency strength and financial markets',
      'Impacts geopolitical power and influence',
      'Shows long-term economic convergence or divergence'
    ],
    dataSource: 'Historical Economic Research, World Bank, IMF',
    frequency: 'Historical Analysis',
    units: 'Percentage of global GDP (%)',
    relatedMetrics: ['Economic Center of Gravity', 'GDP Growth', 'Trade Balance', 'Population Growth']
  },

  // Currency Hierarchy Metrics
  currencyStrength: {
    title: 'Currency Strength Index',
    description: 'A composite measure of a currency\'s value relative to other major currencies, considering trade, investment, and economic factors.',
    formula: 'Strength = Weighted average of exchange rates + Economic fundamentals + Trade factors',
    interpretation: 'Higher values indicate stronger currency. Influenced by interest rates, economic growth, political stability, and trade balance.',
    implications: [
      'Affects international trade competitiveness',
      'Influences inflation and import costs',
      'Impacts foreign investment flows',
      'Affects tourism and cross-border spending',
      'Influences central bank policy decisions'
    ],
    dataSource: 'Central Banks, Forex Markets, IMF',
    frequency: 'Real-time',
    units: 'Index value',
    relatedMetrics: ['Interest Rate', 'Trade Balance', 'GDP Growth', 'Inflation Rate']
  },

  exchangeRate: {
    title: 'Exchange Rate',
    description: 'The value of one currency expressed in terms of another currency.',
    formula: 'Exchange Rate = Base Currency / Quote Currency',
    interpretation: 'Appreciation means the currency is worth more, depreciation means it\'s worth less. Affects trade competitiveness and inflation.',
    implications: [
      'Affects import and export prices',
      'Influences inflation and consumer prices',
      'Impacts foreign investment decisions',
      'Affects tourism and cross-border commerce',
      'Influences central bank monetary policy'
    ],
    dataSource: 'Central Banks, Forex Markets',
    frequency: 'Real-time',
    units: 'Currency pairs (e.g., USD/EUR)',
    relatedMetrics: ['Interest Rate', 'Trade Balance', 'Inflation Rate', 'Currency Strength']
  },

  economicSimilarityAnalysis: {
    title: 'Economic Similarity Analysis',
    description: 'A multi-dimensional analysis that compares countries based on multiple economic indicators to determine their economic similarity and clustering patterns.',
    formula: 'Similarity Score = Weighted average of normalized differences across GDP, inflation, FDI, trade balance, government spending, labor productivity, and Gini coefficient',
    interpretation: 'Lower similarity scores indicate more similar economies. Countries closer together on the scatter plot have more similar economic characteristics and may be suitable for similar policy approaches.',
    implications: [
      'Helps identify economic clusters and regional patterns',
      'Useful for policy coordination between similar economies',
      'Aids in investment diversification strategies',
      'Supports trade agreement negotiations',
      'Helps predict economic contagion risks'
    ],
    dataSource: 'World Bank, IMF, National Statistical Offices',
    frequency: 'Quarterly',
    units: 'Similarity Index (0-100)',
    relatedMetrics: ['GDP Growth', 'Inflation Rate', 'FDI', 'Trade Balance', 'Government Spending', 'Labor Productivity', 'Gini Coefficient']
  },

  // Labor Market Indicators
  laborForceParticipation: {
    title: 'Labor Force Participation Rate',
    description: 'The percentage of the working-age population (15+) that is economically active, either employed or actively seeking employment.',
    formula: 'Labor Force Participation = (Labor Force / Working-Age Population) × 100',
    interpretation: 'Higher rates indicate greater economic activity and productive capacity. Rates vary by demographics, culture, and economic development level.',
    implications: [
      'Affects overall economic output and tax revenue',
      'Influences consumer spending and demand',
      'Impacts pension and social security systems',
      'Reflects gender equality and social policies',
      'Affects long-term economic growth potential'
    ],
    dataSource: 'National Labor Offices, World Bank',
    frequency: 'Quarterly',
    units: 'Percentage (%)',
    relatedMetrics: ['Employment Rate', 'Unemployment Rate', 'GDP Growth', 'Population Growth']
  },

  youthUnemployment: {
    title: 'Youth Unemployment Rate',
    description: 'The unemployment rate among youth aged 15-24, a key indicator of labor market health and future economic prospects.',
    formula: 'Youth Unemployment = (Unemployed Youth / Youth Labor Force) × 100',
    interpretation: 'Youth unemployment is typically 2-3 times higher than overall unemployment. High levels can indicate education-job mismatches and future economic challenges.',
    implications: [
      'Affects long-term career prospects and earnings',
      'Influences social stability and cohesion',
      'Impacts consumer spending and economic growth',
      'Affects education and training policy',
      'Influences migration patterns'
    ],
    dataSource: 'National Labor Offices, ILO, World Bank',
    frequency: 'Quarterly',
    units: 'Percentage (%)',
    relatedMetrics: ['Unemployment Rate', 'Education Expenditure', 'GDP Growth', 'Labor Force Participation']
  },

  femaleLaborForce: {
    title: 'Female Labor Force Participation Rate',
    description: 'The percentage of female working-age population (15+) that is economically active, reflecting gender equality in labor markets.',
    formula: 'Female Participation = (Female Labor Force / Female Working-Age Population) × 100',
    interpretation: 'Higher rates indicate better gender equality and economic utilization of human capital. OECD average is around 65%.',
    implications: [
      'Reflects gender equality and social development',
      'Affects household income and consumer spending',
      'Influences economic growth and productivity',
      'Impacts family structure and birth rates',
      'Affects policy on childcare and parental leave'
    ],
    dataSource: 'National Labor Offices, World Bank, ILO',
    frequency: 'Quarterly',
    units: 'Percentage (%)',
    relatedMetrics: ['Labor Force Participation', 'GDP Growth', 'Education Expenditure', 'Social Spending']
  },

  // Fiscal Indicators
  budgetBalance: {
    title: 'Budget Balance (Fiscal Surplus/Deficit)',
    description: 'Government cash surplus or deficit as a percentage of GDP, indicating fiscal health.',
    formula: 'Budget Balance = (Government Revenue - Government Expenditure) / GDP × 100',
    interpretation: 'Positive values indicate surplus, negative values indicate deficit. Deficits above 3% of GDP are generally considered concerning.',
    implications: [
      'Affects government debt levels and sustainability',
      'Influences interest rates and borrowing costs',
      'Impacts currency strength and investor confidence',
      'Affects future tax and spending policies',
      'Influences economic stimulus capacity'
    ],
    dataSource: 'National Treasuries, IMF, World Bank',
    frequency: 'Quarterly',
    units: 'Percentage of GDP (%)',
    relatedMetrics: ['Government Debt', 'Tax Revenue', 'Government Spending', 'Interest Rate']
  },

  healthcareExpenditure: {
    title: 'Healthcare Expenditure',
    description: 'Current health expenditure as a percentage of GDP, indicating investment in public health.',
    formula: 'Healthcare Expenditure = (Total Health Spending / GDP) × 100',
    interpretation: 'OECD average is around 9% of GDP. Higher spending doesn\'t always correlate with better outcomes, efficiency matters.',
    implications: [
      'Affects public health and life expectancy',
      'Influences government budget and fiscal policy',
      'Impacts economic productivity and labor supply',
      'Affects insurance markets and private sector',
      'Influences pharmaceutical and healthcare industries'
    ],
    dataSource: 'WHO, OECD, World Bank',
    frequency: 'Annually',
    units: 'Percentage of GDP (%)',
    relatedMetrics: ['Life Expectancy', 'Government Spending', 'GDP Growth', 'Population Growth']
  },

  educationExpenditure: {
    title: 'Education Expenditure',
    description: 'Government expenditure on education as a percentage of GDP, reflecting investment in human capital.',
    formula: 'Education Expenditure = (Government Education Spending / GDP) × 100',
    interpretation: 'UNESCO recommends 4-6% of GDP. Higher spending supports long-term economic growth through skilled workforce development.',
    implications: [
      'Affects long-term economic growth and productivity',
      'Influences workforce quality and innovation',
      'Impacts social mobility and inequality',
      'Affects future employment and wage levels',
      'Influences technological advancement'
    ],
    dataSource: 'UNESCO, OECD, World Bank',
    frequency: 'Annually',
    units: 'Percentage of GDP (%)',
    relatedMetrics: ['Labor Productivity', 'GDP Growth', 'Unemployment Rate', 'R&D Spending']
  },

  militaryExpenditure: {
    title: 'Military Expenditure',
    description: 'Military expenditure as a percentage of GDP, indicating defense spending priorities.',
    formula: 'Military Expenditure = (Defense Spending / GDP) × 100',
    interpretation: 'Global average is around 2% of GDP. Higher levels reflect security concerns, geopolitical tensions, or defense industry presence.',
    implications: [
      'Affects fiscal space for other government priorities',
      'Influences geopolitical relationships and alliances',
      'Impacts defense industry and employment',
      'Affects government debt and fiscal sustainability',
      'Influences international security dynamics'
    ],
    dataSource: 'SIPRI, World Bank, National Defense Ministries',
    frequency: 'Annually',
    units: 'Percentage of GDP (%)',
    relatedMetrics: ['Government Spending', 'Budget Balance', 'GDP Growth', 'Government Debt']
  },

  publicDebtService: {
    title: 'Public Debt Service',
    description: 'Interest payments as a percentage of government revenue, indicating debt burden.',
    formula: 'Debt Service = (Interest Payments / Government Revenue) × 100',
    interpretation: 'Higher levels reduce fiscal flexibility and crowd out other spending. Above 20% is considered very high.',
    implications: [
      'Reduces funds available for public services',
      'Affects government credit rating and borrowing costs',
      'Influences fiscal policy flexibility',
      'Impacts future tax and spending decisions',
      'Affects economic growth potential'
    ],
    dataSource: 'National Treasuries, IMF, World Bank',
    frequency: 'Quarterly',
    units: 'Percentage of Revenue (%)',
    relatedMetrics: ['Government Debt', 'Interest Rate', 'Budget Balance', 'Tax Revenue']
  },

  socialSpending: {
    title: 'Social Protection Coverage',
    description: 'Percentage of population covered by social protection programs, indicating social safety net strength.',
    formula: 'Coverage = (Population Covered by Social Programs / Total Population) × 100',
    interpretation: 'Higher coverage indicates stronger social safety nets. Developed countries typically have 80%+ coverage.',
    implications: [
      'Affects poverty levels and income inequality',
      'Influences economic security and consumer confidence',
      'Impacts government fiscal sustainability',
      'Affects social stability and cohesion',
      'Influences political outcomes and policy'
    ],
    dataSource: 'ILO, World Bank, National Social Security Agencies',
    frequency: 'Annually',
    units: 'Percentage (%)',
    relatedMetrics: ['Government Spending', 'Poverty Rate', 'Gini Coefficient', 'Unemployment Rate']
  },

  taxRevenue: {
    title: 'Tax Revenue',
    description: 'Tax revenue as a percentage of GDP, indicating government fiscal capacity.',
    formula: 'Tax Revenue = (Total Tax Collection / GDP) × 100',
    interpretation: 'OECD average is around 34% of GDP. Higher levels indicate greater public sector role and service provision capacity.',
    implications: [
      'Determines government spending capacity',
      'Affects economic incentives and behavior',
      'Influences income distribution',
      'Impacts business investment decisions',
      'Affects fiscal sustainability'
    ],
    dataSource: 'National Tax Authorities, OECD, IMF',
    frequency: 'Quarterly',
    units: 'Percentage of GDP (%)',
    relatedMetrics: ['Government Spending', 'Budget Balance', 'GDP Growth', 'Gini Coefficient']
  },

  // Technology & Innovation
  internetUsers: {
    title: 'Internet Users',
    description: 'Percentage of population with internet access, indicating digital connectivity and technological advancement.',
    formula: 'Internet Users = (People with Internet Access / Total Population) × 100',
    interpretation: 'Higher penetration indicates digital economy development. Above 80% is considered high connectivity.',
    implications: [
      'Affects digital economy and e-commerce growth',
      'Influences education and information access',
      'Impacts productivity and innovation',
      'Affects social connectivity and communication',
      'Influences digital divide and inequality'
    ],
    dataSource: 'ITU, World Bank, National Telecommunications Authorities',
    frequency: 'Annually',
    units: 'Percentage (%)',
    relatedMetrics: ['GDP Growth', 'Education Expenditure', 'Mobile Subscriptions', 'Innovation']
  },

  mobileSubscriptions: {
    title: 'Mobile Cellular Subscriptions',
    description: 'Mobile cellular subscriptions per 100 people, indicating telecommunications infrastructure and adoption.',
    formula: 'Mobile Subscriptions = (Total Mobile Subscriptions / Population) × 100',
    interpretation: 'Can exceed 100% due to multiple subscriptions per person. Indicates connectivity and digital economy development.',
    implications: [
      'Enables mobile commerce and digital payments',
      'Affects communication and business efficiency',
      'Influences economic development and inclusion',
      'Impacts social connectivity and information access',
      'Affects telecommunications industry growth'
    ],
    dataSource: 'ITU, World Bank, National Telecommunications Authorities',
    frequency: 'Annually',
    units: 'Per 100 people',
    relatedMetrics: ['Internet Users', 'GDP Growth', 'Digital Economy', 'Innovation']
  },

  scientificPublications: {
    title: 'Scientific and Technical Publications',
    description: 'Number of scientific and technical journal articles published, indicating research output and innovation capacity.',
    formula: 'Publications = Total peer-reviewed scientific articles published',
    interpretation: 'Higher numbers indicate strong research capacity and innovation ecosystem. Leading countries publish 100,000+ annually.',
    implications: [
      'Reflects research and innovation capacity',
      'Affects technological advancement and competitiveness',
      'Influences talent attraction and retention',
      'Impacts economic growth potential',
      'Affects international scientific standing'
    ],
    dataSource: 'Scopus, Web of Science, UNESCO',
    frequency: 'Annually',
    units: 'Number of articles',
    relatedMetrics: ['R&D Spending', 'Patent Applications', 'Education Expenditure', 'GDP Growth']
  },

  patentApplications: {
    title: 'Patent Applications',
    description: 'Number of patent applications filed by residents, reflecting innovation and intellectual property creation.',
    formula: 'Patent Applications = Total patents filed by domestic residents',
    interpretation: 'Higher numbers indicate strong innovation activity. Leading countries file hundreds of thousands annually.',
    implications: [
      'Reflects innovation and technological advancement',
      'Affects future economic competitiveness',
      'Influences intellectual property value',
      'Impacts technology sector development',
      'Affects long-term economic growth'
    ],
    dataSource: 'WIPO, National Patent Offices',
    frequency: 'Annually',
    units: 'Number of applications',
    relatedMetrics: ['R&D Spending', 'Scientific Publications', 'High-Tech Exports', 'GDP Growth']
  },

  // Trade & International
  ictExports: {
    title: 'ICT Goods Exports',
    description: 'Information and communications technology goods exports as a percentage of total goods exports.',
    formula: 'ICT Exports = (ICT Goods Exports / Total Goods Exports) × 100',
    interpretation: 'Higher percentages indicate strong tech sector and export competitiveness. Leading exporters have 15-30%.',
    implications: [
      'Reflects technological competitiveness',
      'Affects trade balance and currency strength',
      'Influences high-tech employment',
      'Impacts innovation ecosystem',
      'Affects economic growth and development'
    ],
    dataSource: 'UN Comtrade, WTO, World Bank',
    frequency: 'Annually',
    units: 'Percentage of goods exports (%)',
    relatedMetrics: ['High-Tech Exports', 'Trade Balance', 'Innovation', 'GDP Growth']
  },

  tradeOpenness: {
    title: 'Trade Openness',
    description: 'Sum of exports and imports as a percentage of GDP, measuring economic openness to international trade.',
    formula: 'Trade Openness = ((Exports + Imports) / GDP) × 100',
    interpretation: 'Higher values indicate greater integration with global economy. Small open economies often exceed 100%.',
    implications: [
      'Affects economic growth and diversification',
      'Influences vulnerability to external shocks',
      'Impacts currency stability',
      'Affects domestic industry competitiveness',
      'Influences policy autonomy'
    ],
    dataSource: 'WTO, World Bank, National Statistics',
    frequency: 'Quarterly',
    units: 'Percentage of GDP (%)',
    relatedMetrics: ['Trade Balance', 'Exports', 'Imports', 'Exchange Rate']
  },

  tariffRate: {
    title: 'Average Tariff Rate',
    description: 'Simple mean of applied tariff rates on all products, indicating trade policy restrictiveness.',
    formula: 'Tariff Rate = Average of all product-level tariff rates',
    interpretation: 'Lower rates indicate freer trade policies. WTO members average 3-5% for developed countries, higher for developing.',
    implications: [
      'Affects consumer prices and inflation',
      'Influences international trade flows',
      'Impacts domestic industry protection',
      'Affects trade negotiations and agreements',
      'Influences economic efficiency and growth'
    ],
    dataSource: 'WTO, World Bank, National Customs Authorities',
    frequency: 'Annually',
    units: 'Percentage (%)',
    relatedMetrics: ['Trade Balance', 'Trade Openness', 'Inflation Rate', 'Consumer Prices']
  },

  tourismReceipts: {
    title: 'Tourism Receipts',
    description: 'International tourism receipts as a percentage of total exports, showing tourism sector importance.',
    formula: 'Tourism Receipts = (Tourism Revenue / Total Exports) × 100',
    interpretation: 'Higher percentages indicate tourism-dependent economies. Small island nations often have 30%+.',
    implications: [
      'Affects foreign exchange earnings',
      'Influences employment in services sector',
      'Impacts seasonal economic patterns',
      'Affects infrastructure development',
      'Influences vulnerability to external shocks'
    ],
    dataSource: 'UNWTO, World Bank, National Tourism Boards',
    frequency: 'Quarterly',
    units: 'Percentage of exports (%)',
    relatedMetrics: ['Services Value Added', 'Trade Balance', 'Employment Rate', 'Exchange Rate']
  },

  // Financial & Investment
  marketCapitalization: {
    title: 'Market Capitalization',
    description: 'Market capitalization of listed domestic companies as a percentage of GDP, reflecting stock market depth.',
    formula: 'Market Cap = (Total Listed Company Value / GDP) × 100',
    interpretation: 'Higher values indicate developed capital markets. Developed markets often exceed 100% of GDP.',
    implications: [
      'Reflects financial market development',
      'Affects capital availability for businesses',
      'Influences investment opportunities',
      'Impacts wealth distribution',
      'Affects economic growth financing'
    ],
    dataSource: 'Stock Exchanges, World Bank, World Federation of Exchanges',
    frequency: 'Daily (reported quarterly)',
    units: 'Percentage of GDP (%)',
    relatedMetrics: ['FDI', 'GDP Growth', 'Interest Rate', 'Private Investment']
  },

  privateInvestment: {
    title: 'Private Sector Investment',
    description: 'Gross fixed capital formation by private sector as a percentage of GDP, reflecting private investment activity.',
    formula: 'Private Investment = (Private Gross Capital Formation / GDP) × 100',
    interpretation: 'Higher levels indicate business confidence and economic dynamism. Typically 15-25% of GDP in developed economies.',
    implications: [
      'Drives future economic growth and productivity',
      'Reflects business confidence',
      'Affects employment creation',
      'Influences technological advancement',
      'Impacts long-term competitiveness'
    ],
    dataSource: 'National Statistical Offices, World Bank',
    frequency: 'Quarterly',
    units: 'Percentage of GDP (%)',
    relatedMetrics: ['GDP Growth', 'Interest Rate', 'Market Capitalization', 'FDI']
  },

  // Economic Structure
  servicesValueAdded: {
    title: 'Services Sector Value Added',
    description: 'Services sector\'s contribution to GDP as a percentage, indicating economic structure.',
    formula: 'Services = (Services Sector Output / GDP) × 100',
    interpretation: 'Typically 50-75% in developed economies. Higher levels indicate post-industrial economy development.',
    implications: [
      'Reflects economic development stage',
      'Affects employment structure',
      'Influences productivity and growth patterns',
      'Impacts trade patterns and competitiveness',
      'Affects economic resilience'
    ],
    dataSource: 'National Statistical Offices, World Bank',
    frequency: 'Quarterly',
    units: 'Percentage of GDP (%)',
    relatedMetrics: ['Manufacturing Value Added', 'Agriculture Value Added', 'GDP Growth', 'Employment Rate']
  },

  agriculturalValueAdded: {
    title: 'Agricultural Sector Value Added',
    description: 'Agriculture, forestry, and fishing sector\'s contribution to GDP as a percentage.',
    formula: 'Agriculture = (Agricultural Sector Output / GDP) × 100',
    interpretation: 'Typically <5% in developed economies, >20% in developing. Lower levels indicate economic development.',
    implications: [
      'Reflects economic development level',
      'Affects food security and rural livelihoods',
      'Influences environmental sustainability',
      'Impacts trade patterns',
      'Affects urbanization trends'
    ],
    dataSource: 'National Statistical Offices, World Bank, FAO',
    frequency: 'Quarterly',
    units: 'Percentage of GDP (%)',
    relatedMetrics: ['Services Value Added', 'Manufacturing Value Added', 'Population Growth', 'Rural Development']
  },

  manufacturingValueAdded: {
    title: 'Manufacturing Value Added',
    description: 'Manufacturing sector\'s contribution to GDP as a percentage, indicating industrial capacity.',
    formula: 'Manufacturing = (Manufacturing Sector Output / GDP) × 100',
    interpretation: 'Typically 10-25% in industrialized economies. Higher levels indicate strong industrial base.',
    implications: [
      'Reflects industrialization and development level',
      'Affects employment and wage levels',
      'Influences export competitiveness',
      'Impacts technological advancement',
      'Affects economic diversification'
    ],
    dataSource: 'National Statistical Offices, World Bank, UNIDO',
    frequency: 'Quarterly',
    units: 'Percentage of GDP (%)',
    relatedMetrics: ['Services Value Added', 'Agriculture Value Added', 'Exports', 'Labor Productivity']
  },

  householdConsumption: {
    title: 'Household Consumption',
    description: 'Household final consumption expenditure as a percentage of GDP, reflecting consumer spending patterns.',
    formula: 'Household Consumption = (Consumer Spending / GDP) × 100',
    interpretation: 'Typically 50-70% of GDP. Higher levels indicate consumer-driven economies.',
    implications: [
      'Drives economic growth in consumer economies',
      'Affects retail and service sectors',
      'Influences import demand',
      'Impacts inflation and monetary policy',
      'Reflects living standards and confidence'
    ],
    dataSource: 'National Statistical Offices, World Bank',
    frequency: 'Quarterly',
    units: 'Percentage of GDP (%)',
    relatedMetrics: ['GDP Growth', 'Employment Rate', 'Inflation Rate', 'Consumer Confidence']
  },

  newBusinessDensity: {
    title: 'New Business Density',
    description: 'New businesses registered per 1,000 people ages 15-64, indicating entrepreneurial activity.',
    formula: 'Business Density = (New Business Registrations / Working-Age Population in thousands)',
    interpretation: 'Higher values indicate entrepreneurial dynamism. Developed economies typically have 5-15 per 1,000.',
    implications: [
      'Reflects entrepreneurial ecosystem strength',
      'Affects job creation and innovation',
      'Influences economic dynamism and competition',
      'Impacts productivity and efficiency',
      'Affects long-term economic growth'
    ],
    dataSource: 'World Bank Doing Business, National Business Registries',
    frequency: 'Annually',
    units: 'Per 1,000 people ages 15-64',
    relatedMetrics: ['GDP Growth', 'Unemployment Rate', 'Private Investment', 'Innovation']
  },

  renewableEnergy: {
    title: 'Renewable Energy Consumption',
    description: 'Renewable energy consumption as a percentage of total final energy consumption, indicating sustainability efforts.',
    formula: 'Renewable Energy = (Renewable Energy Consumption / Total Energy Consumption) × 100',
    interpretation: 'Higher percentages indicate greater sustainability. Leading countries exceed 40-50%.',
    implications: [
      'Affects environmental sustainability and climate goals',
      'Influences energy security and independence',
      'Impacts energy costs and economic competitiveness',
      'Affects investment in clean technology',
      'Influences international climate commitments'
    ],
    dataSource: 'IEA, World Bank, National Energy Agencies',
    frequency: 'Annually',
    units: 'Percentage (%)',
    relatedMetrics: ['Energy Consumption', 'CO2 Emissions', 'GDP Growth', 'Technology Investment']
  },

  // Additional metrics that were already in UI
  cpiData: {
    title: 'Consumer Price Index',
    description: 'A measure of the average change over time in the prices paid by urban consumers for a market basket of consumer goods and services.',
    formula: 'CPI = (Cost of Market Basket in Current Year / Cost of Market Basket in Base Year) × 100',
    interpretation: 'Rising CPI indicates inflation, falling CPI indicates deflation. Base year CPI is typically set to 100.',
    implications: [
      'Primary measure of inflation for consumers',
      'Affects interest rate decisions by central banks',
      'Influences wage negotiations and social security adjustments',
      'Impacts purchasing power and consumer spending',
      'Affects investment returns and asset allocation'
    ],
    dataSource: 'National Statistical Offices, World Bank',
    frequency: 'Monthly',
    units: 'Index (base year = 100)',
    relatedMetrics: ['Inflation Rate', 'Interest Rate', 'Wage Growth', 'Consumer Spending']
  },

  unemploymentRates: {
    title: 'Unemployment Rate',
    description: 'The percentage of the labor force that is jobless and actively seeking employment.',
    formula: 'Unemployment Rate = (Unemployed People / Labor Force) × 100',
    interpretation: 'Lower rates indicate a stronger job market and economy. Very low rates may lead to wage inflation, while high rates suggest economic weakness.',
    implications: [
      'Indicates labor market health and economic strength',
      'Affects consumer spending and economic growth',
      'Influences wage levels and inflation',
      'Impacts government social spending and tax revenue',
      'Affects political stability and social cohesion'
    ],
    dataSource: 'National Labor Offices, World Bank',
    frequency: 'Monthly',
    units: 'Percentage (%)',
    relatedMetrics: ['GDP Growth', 'Interest Rate', 'Wage Growth', 'Consumer Confidence']
  }
};

export default economicMetrics;

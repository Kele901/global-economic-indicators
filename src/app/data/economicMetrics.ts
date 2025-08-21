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
  }
};

export default economicMetrics;

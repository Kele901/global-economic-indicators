export interface MetricDefinition {
  key: string;
  label: string;
  unit: string;
  format: (v: number) => string;
  domain?: [number, number];
}

export interface MetricCategory {
  id: string;
  label: string;
  metrics: MetricDefinition[];
}

const pct = (v: number) => `${v.toFixed(1)}%`;
const usd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(1)}K` : `$${v.toFixed(0)}`;
const num = (v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(1)}K` : v.toFixed(1);
const idx = (v: number) => v.toFixed(1);
const yrs = (v: number) => `${v.toFixed(1)} yrs`;

export const METRIC_CATEGORIES: MetricCategory[] = [
  {
    id: 'core',
    label: 'Core Economic',
    metrics: [
      { key: 'gdpGrowth', label: 'GDP Growth', unit: '%', format: pct, domain: [-15, 25] },
      { key: 'inflationRates', label: 'Inflation Rate', unit: '%', format: pct, domain: [-5, 30] },
      { key: 'interestRates', label: 'Interest Rate', unit: '%', format: pct, domain: [-1, 20] },
      { key: 'unemploymentRates', label: 'Unemployment Rate', unit: '%', format: pct, domain: [0, 30] },
      { key: 'employmentRates', label: 'Employment Rate', unit: '%', format: pct, domain: [30, 80] },
      { key: 'gdpPerCapitaPPP', label: 'GDP per Capita (PPP)', unit: '$', format: usd },
      { key: 'cpiData', label: 'Consumer Price Index', unit: 'Index', format: idx },
      { key: 'populationGrowth', label: 'Population Growth', unit: '%', format: pct, domain: [-2, 5] },
    ],
  },
  {
    id: 'fiscal',
    label: 'Fiscal & Debt',
    metrics: [
      { key: 'governmentDebt', label: 'Government Debt (% of GDP)', unit: '%', format: pct },
      { key: 'budgetBalance', label: 'Budget Balance (% of GDP)', unit: '%', format: pct, domain: [-20, 20] },
      { key: 'taxRevenue', label: 'Tax Revenue (% of GDP)', unit: '%', format: pct },
      { key: 'governmentSpending', label: 'Govt. Spending (% of GDP)', unit: '%', format: pct },
      { key: 'publicDebtService', label: 'Debt Service (% of Revenue)', unit: '%', format: pct },
      { key: 'grossCapitalFormation', label: 'Gross Capital Formation', unit: '%', format: pct },
      { key: 'militaryExpenditure', label: 'Military Expenditure', unit: '%', format: pct },
    ],
  },
  {
    id: 'trade',
    label: 'Trade & Investment',
    metrics: [
      { key: 'tradeBalance', label: 'Trade (% of GDP)', unit: '%', format: pct },
      { key: 'currentAccount', label: 'Current Account (% of GDP)', unit: '%', format: pct, domain: [-20, 30] },
      { key: 'fdi', label: 'FDI (% of GDP)', unit: '%', format: pct, domain: [-5, 15] },
      { key: 'exports', label: 'Exports (% of GDP)', unit: '%', format: pct },
      { key: 'imports', label: 'Imports (% of GDP)', unit: '%', format: pct },
      { key: 'exchangeRate', label: 'Exchange Rate (LCU/USD)', unit: 'LCU', format: idx },
      { key: 'tradeOpenness', label: 'Trade Openness', unit: '%', format: pct },
      { key: 'tariffRate', label: 'Tariff Rate', unit: '%', format: pct },
      { key: 'tourismReceipts', label: 'Tourism Receipts (% Exports)', unit: '%', format: pct },
      { key: 'reservesMonthsImports', label: 'Reserves (Months of Imports)', unit: 'months', format: idx },
    ],
  },
  {
    id: 'social',
    label: 'Social & Development',
    metrics: [
      { key: 'lifeExpectancy', label: 'Life Expectancy', unit: 'years', format: yrs },
      { key: 'povertyRate', label: 'Poverty Rate', unit: '%', format: pct },
      { key: 'giniCoefficient', label: 'Gini Coefficient', unit: 'Index', format: idx },
      { key: 'healthcareExpenditure', label: 'Healthcare (% of GDP)', unit: '%', format: pct },
      { key: 'educationExpenditure', label: 'Education (% of GDP)', unit: '%', format: pct },
      { key: 'urbanPopulation', label: 'Urban Population', unit: '%', format: pct },
      { key: 'youthUnemployment', label: 'Youth Unemployment', unit: '%', format: pct },
      { key: 'femaleLaborForce', label: 'Female Labor Participation', unit: '%', format: pct },
      { key: 'laborForceParticipation', label: 'Labor Force Participation', unit: '%', format: pct },
      { key: 'householdConsumption', label: 'Household Consumption', unit: '%', format: pct },
    ],
  },
  {
    id: 'technology',
    label: 'Technology & Innovation',
    metrics: [
      { key: 'rdSpending', label: 'R&D Spending (% of GDP)', unit: '%', format: pct },
      { key: 'internetUsers', label: 'Internet Users', unit: '%', format: pct },
      { key: 'hightechExports', label: 'High-Tech Exports', unit: '%', format: pct },
      { key: 'mobileSubscriptions', label: 'Mobile Subscriptions (per 100)', unit: 'per 100', format: idx },
      { key: 'patentApplications', label: 'Patent Applications', unit: 'count', format: num },
      { key: 'scientificPublications', label: 'Scientific Publications', unit: 'count', format: num },
      { key: 'ictExports', label: 'ICT Exports (% of goods)', unit: '%', format: pct },
    ],
  },
  {
    id: 'environment',
    label: 'Energy & Environment',
    metrics: [
      { key: 'co2Emissions', label: 'CO2 Emissions (per capita)', unit: 'tonnes', format: idx },
      { key: 'renewableEnergy', label: 'Renewable Energy', unit: '%', format: pct },
      { key: 'energyConsumption', label: 'Energy Use (kg oil eq.)', unit: 'kg', format: num },
    ],
  },
  {
    id: 'financial',
    label: 'Financial Markets',
    metrics: [
      { key: 'domesticCredit', label: 'Domestic Credit (% of GDP)', unit: '%', format: pct },
      { key: 'marketCapitalization', label: 'Market Cap (% of GDP)', unit: '%', format: pct },
      { key: 'privateInvestment', label: 'Private Investment', unit: '%', format: pct },
      { key: 'newBusinessDensity', label: 'New Business Density', unit: 'per 1K', format: idx },
    ],
  },
  {
    id: 'industry',
    label: 'Industry Composition',
    metrics: [
      { key: 'manufacturingValueAdded', label: 'Manufacturing (% of GDP)', unit: '%', format: pct },
      { key: 'servicesValueAdded', label: 'Services (% of GDP)', unit: '%', format: pct },
      { key: 'agriculturalValueAdded', label: 'Agriculture (% of GDP)', unit: '%', format: pct },
      { key: 'laborProductivity', label: 'Labor Productivity (PPP $)', unit: '$', format: usd },
    ],
  },
];

export const ALL_METRICS: MetricDefinition[] = METRIC_CATEGORIES.flatMap(c => c.metrics);

export function getMetricByKey(key: string): MetricDefinition | undefined {
  return ALL_METRICS.find(m => m.key === key);
}

export function getCategoryForMetric(key: string): MetricCategory | undefined {
  return METRIC_CATEGORIES.find(c => c.metrics.some(m => m.key === key));
}

export function formatMetricValue(key: string, value: number): string {
  const metric = getMetricByKey(key);
  return metric ? metric.format(value) : value.toFixed(2);
}

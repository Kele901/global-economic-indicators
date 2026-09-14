// Metric registry for the cross-country scan views on /compare.
//
// Both the rank-over-time bump chart and the small-multiples sparkline grid
// need the same three things about a metric: which GlobalData series holds
// it, how to format it, and whether up is the good direction. Keeping that in
// one table means adding a metric to both views is a single edit, and the two
// views can never disagree about what "better" means.

export interface CompareMetric {
  id: string;
  label: string;
  // Key on the object returned by fetchGlobalData.
  series: string;
  unit: string;
  // True when a higher reading is the favourable one. Drives rank direction
  // in the bump chart and tile colour in the sparkline grid.
  higherIsBetter: boolean;
  // Some series are genuinely two-sided (current account, net migration) and
  // neither direction is simply better.
  twoSided?: boolean;
  precision?: number;
  // Plain-language note shown under the chart.
  note: string;
  sourceId: string;
}

export const COMPARE_METRICS: CompareMetric[] = [
  {
    id: 'gdpPerCapitaPPP',
    label: 'GDP per capita (PPP)',
    series: 'gdpPerCapitaPPP',
    unit: '',
    higherIsBetter: true,
    precision: 0,
    note: 'Purchasing-power-parity dollars, which adjusts for the fact that the same haircut costs very different amounts in Zurich and Jakarta. It is an average, so it says nothing about distribution — pair it with the Gini rankings on the inequality ledger.',
    sourceId: 'wb-gdp-pcap-ppp',
  },
  {
    id: 'gdpGrowth',
    label: 'GDP growth',
    series: 'gdpGrowth',
    unit: '%',
    higherIsBetter: true,
    note: 'Annual real growth. Small economies swing far harder than large ones, so the top of this ranking turns over almost every year and a single year of it tells you very little.',
    sourceId: 'wb-gdp-growth',
  },
  {
    id: 'inflationRates',
    label: 'Inflation',
    series: 'inflationRates',
    unit: '%',
    higherIsBetter: false,
    note: 'Consumer price inflation. Lower ranks first here, but note that deflation is not a prize — sustained readings below zero are a symptom of demand collapse, not price stability.',
    sourceId: 'wb-inflation',
  },
  {
    id: 'unemploymentRates',
    label: 'Unemployment',
    series: 'unemploymentRates',
    unit: '%',
    higherIsBetter: false,
    note: 'ILO-modelled unemployment. Comparable across countries by construction, but the modelling means a country with a large informal sector can post a low rate without a strong labour market.',
    sourceId: 'wb-unemployment',
  },
  {
    id: 'governmentDebt',
    label: 'Government debt',
    series: 'governmentDebt',
    unit: '% of GDP',
    higherIsBetter: false,
    note: 'Central government debt as a share of GDP. Level alone does not determine sustainability: who holds the debt, in what currency, and at what rate matter at least as much.',
    sourceId: 'wb-government-debt',
  },
  {
    id: 'tradeOpenness',
    label: 'Trade openness',
    series: 'tradeOpenness',
    unit: '% of GDP',
    higherIsBetter: true,
    twoSided: true,
    note: 'Exports plus imports over GDP. High openness means integration and also exposure; entrepôt economies like Singapore exceed 300% because goods are counted on the way in and again on the way out.',
    sourceId: 'wb-trade-balance',
  },
  {
    id: 'currentAccount',
    label: 'Current account',
    series: 'currentAccount',
    unit: '% of GDP',
    higherIsBetter: true,
    twoSided: true,
    note: 'Surplus above zero, deficit below. Neither sign is automatically healthy — a deficit can be productive investment inflow, a surplus can be suppressed domestic demand.',
    sourceId: 'wb-trade-balance',
  },
  {
    id: 'lifeExpectancy',
    label: 'Life expectancy',
    series: 'lifeExpectancy',
    unit: ' yrs',
    higherIsBetter: true,
    note: 'Life expectancy at birth. The single most robust summary of a health system, and the one least sensitive to how a country reports its own statistics.',
    sourceId: 'wb-health-spend',
  },
  {
    id: 'internetUsers',
    label: 'Internet users',
    series: 'internetUsers',
    unit: '%',
    higherIsBetter: true,
    note: 'Share of the population using the internet. Access is not the same as meaningful access: the series counts any use in the last three months, at any speed.',
    sourceId: 'wb-digital-adoption',
  },
  {
    id: 'renewableEnergy',
    label: 'Renewable energy',
    series: 'renewableEnergy',
    unit: '%',
    higherIsBetter: true,
    note: 'Renewables as a share of final energy consumption. Includes traditional biomass, which is why several low-income countries rank above wealthy ones with large wind and solar fleets.',
    sourceId: 'wb-energy-mix',
  },
];

export function getCompareMetric(id: string): CompareMetric | undefined {
  return COMPARE_METRICS.find(m => m.id === id);
}

export function formatCompareValue(metric: CompareMetric, value: number): string {
  const digits = metric.precision ?? 1;
  if (metric.id === 'gdpPerCapitaPPP') {
    return `$${Math.round(value).toLocaleString()}`;
  }
  return `${value.toFixed(digits)}${metric.unit}`;
}

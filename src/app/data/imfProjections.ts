export interface Projection {
  country: string;
  metric: string;
  values: Record<number, number>;
  /** Present on live data: full name, ISO alpha-2 for the flag, and whether this is an IMF aggregate. */
  name?: string;
  iso2?: string | null;
  isGroup?: boolean;
}

export const IMF_GDP_PROJECTIONS: Projection[] = [
  { country: 'World', metric: 'gdpGrowth', values: { 2025: 3.3, 2026: 3.3, 2027: 3.2, 2028: 3.2, 2029: 3.1, 2030: 3.1 } },
  { country: 'USA', metric: 'gdpGrowth', values: { 2025: 2.1, 2026: 1.8, 2027: 1.9, 2028: 2.0, 2029: 2.0, 2030: 2.0 } },
  { country: 'UK', metric: 'gdpGrowth', values: { 2025: 1.5, 2026: 1.4, 2027: 1.5, 2028: 1.5, 2029: 1.5, 2030: 1.5 } },
  { country: 'Japan', metric: 'gdpGrowth', values: { 2025: 1.0, 2026: 0.7, 2027: 0.5, 2028: 0.5, 2029: 0.5, 2030: 0.5 } },
  { country: 'Germany', metric: 'gdpGrowth', values: { 2025: 0.9, 2026: 1.5, 2027: 1.4, 2028: 1.3, 2029: 1.2, 2030: 1.2 } },
  { country: 'France', metric: 'gdpGrowth', values: { 2025: 1.0, 2026: 1.3, 2027: 1.5, 2028: 1.6, 2029: 1.6, 2030: 1.6 } },
  { country: 'China', metric: 'gdpGrowth', values: { 2025: 4.5, 2026: 4.0, 2027: 3.7, 2028: 3.5, 2029: 3.4, 2030: 3.3 } },
  { country: 'India', metric: 'gdpGrowth', values: { 2025: 6.5, 2026: 6.5, 2027: 6.5, 2028: 6.4, 2029: 6.4, 2030: 6.3 } },
  { country: 'Brazil', metric: 'gdpGrowth', values: { 2025: 2.0, 2026: 2.2, 2027: 2.0, 2028: 2.0, 2029: 2.0, 2030: 2.0 } },
  { country: 'Canada', metric: 'gdpGrowth', values: { 2025: 2.2, 2026: 1.9, 2027: 1.8, 2028: 1.8, 2029: 1.8, 2030: 1.8 } },
  { country: 'Australia', metric: 'gdpGrowth', values: { 2025: 2.2, 2026: 2.4, 2027: 2.5, 2028: 2.5, 2029: 2.5, 2030: 2.5 } },
  { country: 'Mexico', metric: 'gdpGrowth', values: { 2025: 1.2, 2026: 1.8, 2027: 2.0, 2028: 2.1, 2029: 2.2, 2030: 2.2 } },
  { country: 'SouthKorea', metric: 'gdpGrowth', values: { 2025: 2.1, 2026: 2.0, 2027: 2.0, 2028: 2.0, 2029: 2.0, 2030: 2.0 } },
  { country: 'Indonesia', metric: 'gdpGrowth', values: { 2025: 5.1, 2026: 5.1, 2027: 5.1, 2028: 5.0, 2029: 5.0, 2030: 5.0 } },
  { country: 'Russia', metric: 'gdpGrowth', values: { 2025: 1.4, 2026: 1.1, 2027: 1.0, 2028: 0.8, 2029: 0.8, 2030: 0.8 } },
  { country: 'Turkey', metric: 'gdpGrowth', values: { 2025: 2.8, 2026: 3.3, 2027: 3.5, 2028: 3.5, 2029: 3.5, 2030: 3.5 } },
];

export const IMF_INFLATION_PROJECTIONS: Projection[] = [
  { country: 'World', metric: 'inflation', values: { 2025: 4.2, 2026: 3.6, 2027: 3.3, 2028: 3.1, 2029: 3.0, 2030: 2.9 } },
  { country: 'USA', metric: 'inflation', values: { 2025: 2.4, 2026: 2.1, 2027: 2.0, 2028: 2.0, 2029: 2.0, 2030: 2.0 } },
  { country: 'UK', metric: 'inflation', values: { 2025: 2.5, 2026: 2.1, 2027: 2.0, 2028: 2.0, 2029: 2.0, 2030: 2.0 } },
  { country: 'Japan', metric: 'inflation', values: { 2025: 2.2, 2026: 2.0, 2027: 1.9, 2028: 2.0, 2029: 2.0, 2030: 2.0 } },
  { country: 'China', metric: 'inflation', values: { 2025: 1.2, 2026: 1.6, 2027: 1.8, 2028: 2.0, 2029: 2.0, 2030: 2.0 } },
  { country: 'India', metric: 'inflation', values: { 2025: 4.1, 2026: 4.0, 2027: 4.0, 2028: 4.0, 2029: 4.0, 2030: 4.0 } },
  { country: 'Brazil', metric: 'inflation', values: { 2025: 4.0, 2026: 3.4, 2027: 3.0, 2028: 3.0, 2029: 3.0, 2030: 3.0 } },
  { country: 'Germany', metric: 'inflation', values: { 2025: 2.2, 2026: 2.0, 2027: 2.0, 2028: 2.0, 2029: 2.0, 2030: 2.0 } },
  { country: 'France', metric: 'inflation', values: { 2025: 2.0, 2026: 1.9, 2027: 1.9, 2028: 2.0, 2029: 2.0, 2030: 2.0 } },
  { country: 'Canada', metric: 'inflation', values: { 2025: 2.3, 2026: 2.1, 2027: 2.0, 2028: 2.0, 2029: 2.0, 2030: 2.0 } },
  { country: 'Australia', metric: 'inflation', values: { 2025: 2.8, 2026: 2.5, 2027: 2.3, 2028: 2.2, 2029: 2.2, 2030: 2.2 } },
];

export const REGIONAL_GDP_PROJECTIONS = [
  { region: 'Advanced Economies', y2025: 1.8, y2026: 1.8, y2027: 1.8, y2028: 1.7 },
  { region: 'Emerging Markets', y2025: 4.2, y2026: 4.3, y2027: 4.3, y2028: 4.3 },
  { region: 'Developing Asia', y2025: 5.2, y2026: 5.0, y2027: 4.9, y2028: 4.8 },
  { region: 'Latin America', y2025: 2.3, y2026: 2.5, y2027: 2.5, y2028: 2.5 },
  { region: 'Sub-Saharan Africa', y2025: 4.3, y2026: 4.4, y2027: 4.5, y2028: 4.5 },
  { region: 'Middle East', y2025: 3.3, y2026: 3.5, y2027: 3.5, y2028: 3.5 },
  { region: 'Europe (Emerging)', y2025: 2.6, y2026: 2.5, y2027: 2.5, y2028: 2.5 },
];

export const GLOBAL_OUTLOOK_SUMMARY = {
  worldGDP: { value: 3.3, change: 0.0, unit: '%' },
  globalInflation: { value: 3.6, change: -0.6, unit: '%' },
  tradeGrowth: { value: 3.5, change: 0.2, unit: '%' },
  oilPrice: { value: 70, change: -3, unit: '$/bbl' },
};

export type RiskLevel = 1 | 2 | 3;

export interface OutlookRisk {
  id: string;
  type: 'downside' | 'upside';
  title: string;
  description: string;
  /** Editorial judgement, not an IMF rating. */
  likelihood: RiskLevel;
  impact: RiskLevel;
  horizon: 'Near term' | 'Medium term' | 'Near & medium term';
  channels: string[];
  /** Most exposed economies for downside risks, best placed for upside ones. 'EU' is the euro area. */
  exposed: { iso2: string; name: string }[];
  watch: string[];
}

export const RISKS: OutlookRisk[] = [
  {
    id: 'trade',
    type: 'downside',
    title: 'Trade policy and fragmentation',
    description: 'Higher tariffs and a drift towards rival trade blocs raise costs, unsettle supply chains and lead firms to delay investment. The uncertainty is a drag in its own right, before any tariff takes effect.',
    likelihood: 3,
    impact: 3,
    horizon: 'Near & medium term',
    channels: ['Trade volumes', 'Business investment', 'Goods prices'],
    exposed: [
      { iso2: 'MX', name: 'Mexico' }, { iso2: 'CA', name: 'Canada' }, { iso2: 'DE', name: 'Germany' },
      { iso2: 'VN', name: 'Vietnam' }, { iso2: 'KR', name: 'South Korea' },
    ],
    watch: ['Effective tariff rates', 'World trade volume growth', 'Manufacturing export orders (PMIs)'],
  },
  {
    id: 'geopolitics',
    type: 'downside',
    title: 'Geopolitical escalation and energy shocks',
    description: 'Wider conflict in energy-producing regions or attacks on shipping lanes could push up oil, gas and freight costs, reviving inflation just as it is easing and hitting energy importers hardest.',
    likelihood: 2,
    impact: 3,
    horizon: 'Near term',
    channels: ['Energy prices', 'Shipping costs', 'Confidence'],
    exposed: [
      { iso2: 'EU', name: 'Euro area' }, { iso2: 'JP', name: 'Japan' }, { iso2: 'IN', name: 'India' },
      { iso2: 'TR', name: 'Türkiye' }, { iso2: 'PK', name: 'Pakistan' },
    ],
    watch: ['Brent crude price', 'European gas prices', 'Container freight rates'],
  },
  {
    id: 'markets',
    type: 'downside',
    title: 'Financial market correction',
    description: 'Equity valuations, especially in technology, are high by historical standards. A sharp repricing, for instance if AI earnings disappoint, would cut household wealth, tighten credit and pull capital out of emerging markets.',
    likelihood: 2,
    impact: 3,
    horizon: 'Near term',
    channels: ['Household wealth', 'Credit conditions', 'Capital flows'],
    exposed: [
      { iso2: 'US', name: 'United States' }, { iso2: 'TR', name: 'Türkiye' }, { iso2: 'ZA', name: 'South Africa' },
      { iso2: 'EG', name: 'Egypt' }, { iso2: 'AR', name: 'Argentina' },
    ],
    watch: ['Equity valuations', 'Corporate credit spreads', 'Emerging-market portfolio flows'],
  },
  {
    id: 'inflation',
    type: 'downside',
    title: 'Sticky inflation, rates higher for longer',
    description: 'If services prices or tariff pass-through keep inflation above target, central banks may hold interest rates high for longer, squeezing borrowers, housing markets and indebted governments.',
    likelihood: 2,
    impact: 2,
    horizon: 'Near term',
    channels: ['Borrowing costs', 'Housing', 'Real incomes'],
    exposed: [
      { iso2: 'US', name: 'United States' }, { iso2: 'GB', name: 'United Kingdom' }, { iso2: 'AU', name: 'Australia' },
      { iso2: 'BR', name: 'Brazil' }, { iso2: 'TR', name: 'Türkiye' },
    ],
    watch: ['Core and services inflation', 'Wage growth', 'Inflation expectations'],
  },
  {
    id: 'china',
    type: 'downside',
    title: "China's structural slowdown",
    description: "A drawn-out property slump, local-government debt and weak household spending could slow China more than expected. That would hurt commodity exporters and Asian supply chains, while surplus output pushes cheap exports abroad.",
    likelihood: 2,
    impact: 2,
    horizon: 'Medium term',
    channels: ['Commodity demand', 'Regional trade', 'Export prices'],
    exposed: [
      { iso2: 'CN', name: 'China' }, { iso2: 'AU', name: 'Australia' }, { iso2: 'CL', name: 'Chile' },
      { iso2: 'KR', name: 'South Korea' }, { iso2: 'BR', name: 'Brazil' },
    ],
    watch: ['Property sales and starts', 'Credit growth', 'Iron ore and copper prices'],
  },
  {
    id: 'fiscal',
    type: 'downside',
    title: 'Public debt and bond yields',
    description: 'Government debt is at or near record highs in many advanced economies, with ageing and defence spending adding pressure. A jump in bond yields could force abrupt budget cuts and raise borrowing costs across the economy.',
    likelihood: 2,
    impact: 2,
    horizon: 'Medium term',
    channels: ['Bond yields', 'Fiscal space', 'Mortgage rates'],
    exposed: [
      { iso2: 'US', name: 'United States' }, { iso2: 'JP', name: 'Japan' }, { iso2: 'IT', name: 'Italy' },
      { iso2: 'FR', name: 'France' }, { iso2: 'GB', name: 'United Kingdom' },
    ],
    watch: ['10-year government bond yields', 'Debt-to-GDP ratios', 'Sovereign credit ratings'],
  },
  {
    id: 'ai',
    type: 'upside',
    title: 'AI-driven productivity boom',
    description: 'Faster adoption of AI across services could lift productivity growth, which has been weak in advanced economies for more than a decade. Spending on data centres, chips and power is already adding to demand.',
    likelihood: 2,
    impact: 3,
    horizon: 'Medium term',
    channels: ['Productivity', 'Business investment', 'Corporate earnings'],
    exposed: [
      { iso2: 'US', name: 'United States' }, { iso2: 'TW', name: 'Taiwan' }, { iso2: 'KR', name: 'South Korea' },
      { iso2: 'CN', name: 'China' }, { iso2: 'IE', name: 'Ireland' },
    ],
    watch: ['Labour productivity growth', 'AI and data-centre investment', 'Business AI adoption surveys'],
  },
  {
    id: 'trade-deals',
    type: 'upside',
    title: 'Trade de-escalation',
    description: 'Negotiated tariff cuts or new trade agreements would remove a major source of uncertainty, releasing postponed investment and supporting the most trade-dependent economies.',
    likelihood: 2,
    impact: 2,
    horizon: 'Near term',
    channels: ['Trade volumes', 'Business investment', 'Confidence'],
    exposed: [
      { iso2: 'MX', name: 'Mexico' }, { iso2: 'CA', name: 'Canada' }, { iso2: 'DE', name: 'Germany' },
      { iso2: 'VN', name: 'Vietnam' }, { iso2: 'CN', name: 'China' },
    ],
    watch: ['Tariff announcements and trade deals', 'Trade policy uncertainty indices', 'Export orders'],
  },
  {
    id: 'disinflation',
    type: 'upside',
    title: 'Faster disinflation and lower rates',
    description: 'If inflation falls faster than expected, helped by cheaper energy, central banks could cut rates sooner and further, supporting housing, investment and consumer spending.',
    likelihood: 2,
    impact: 2,
    horizon: 'Near term',
    channels: ['Borrowing costs', 'Real incomes', 'Housing'],
    exposed: [
      { iso2: 'GB', name: 'United Kingdom' }, { iso2: 'CA', name: 'Canada' }, { iso2: 'AU', name: 'Australia' },
      { iso2: 'SE', name: 'Sweden' }, { iso2: 'BR', name: 'Brazil' },
    ],
    watch: ['Core inflation', 'Central bank guidance', 'Oil price'],
  },
  {
    id: 'green',
    type: 'upside',
    title: 'Clean energy investment',
    description: 'A faster build-out of renewables, grids and batteries would add to investment demand and could lower energy costs over time. Producers of critical minerals stand to gain too.',
    likelihood: 2,
    impact: 1,
    horizon: 'Medium term',
    channels: ['Investment', 'Energy costs', 'Commodity demand'],
    exposed: [
      { iso2: 'CN', name: 'China' }, { iso2: 'IN', name: 'India' }, { iso2: 'CL', name: 'Chile' },
      { iso2: 'ID', name: 'Indonesia' }, { iso2: 'BR', name: 'Brazil' },
    ],
    watch: ['Clean-energy investment', 'Critical-mineral prices', 'Grid connection backlogs'],
  },
];

/**
 * Market Cycles Extended Data
 * 
 * Intellectual foundations:
 * - Kondratiev Long Waves (Nikolai Kondratiev, 1925)
 * - Carlota Perez - "Technological Revolutions and Financial Capital" (2002)
 * - Hyman Minsky - Financial Instability Hypothesis (1992)
 * - Robert Shiller - Irrational Exuberance / CAPE Ratio
 * - Warren Buffett - Total Market Cap / GDP indicator
 * - Ray Dalio - "The Changing World Order" (2021)
 * - Barry Eichengreen - "Exorbitant Privilege" (2011)
 */

// ============================================================================
// KONDRATIEV LONG WAVES
// ============================================================================

export interface KondratievWave {
  id: string;
  number: number;
  name: string;
  startYear: number;
  endYear: number;
  drivingTechnologies: string[];
  color: string;
  phases: {
    spring: { start: number; end: number; label: string };
    summer: { start: number; end: number; label: string };
    autumn: { start: number; end: number; label: string };
    winter: { start: number; end: number; label: string };
  };
  keyInnovations: string[];
  leadingCountry: string;
  description: string;
}

export const kondratievWaves: KondratievWave[] = [
  {
    id: 'k1',
    number: 1,
    name: 'Industrial Revolution',
    startYear: 1780,
    endYear: 1842,
    drivingTechnologies: ['Steam engine', 'Textile machinery', 'Iron'],
    color: '#8b5cf6',
    phases: {
      spring: { start: 1780, end: 1800, label: 'Factory system emerges' },
      summer: { start: 1800, end: 1815, label: 'Napoleonic War boom' },
      autumn: { start: 1815, end: 1825, label: 'Speculative mania' },
      winter: { start: 1825, end: 1842, label: 'Depression & deflation' },
    },
    keyInnovations: ['Spinning jenny', 'Water frame', 'Steam engine', 'Puddling process'],
    leadingCountry: 'United Kingdom',
    description: 'The first industrial revolution transformed Britain from an agrarian economy to the workshop of the world, powered by steam and mechanized textile production.',
  },
  {
    id: 'k2',
    number: 2,
    name: 'Age of Steam & Railways',
    startYear: 1842,
    endYear: 1897,
    drivingTechnologies: ['Railways', 'Steel', 'Telegraph'],
    color: '#3b82f6',
    phases: {
      spring: { start: 1842, end: 1857, label: 'Railway expansion boom' },
      summer: { start: 1857, end: 1873, label: 'Global trade expansion' },
      autumn: { start: 1873, end: 1883, label: 'Gilded Age speculation' },
      winter: { start: 1883, end: 1897, label: 'Long Depression' },
    },
    keyInnovations: ['Bessemer process', 'Telegraph', 'Transcontinental railways', 'Joint-stock companies'],
    leadingCountry: 'United Kingdom',
    description: 'Railways shrank distances and connected markets globally. Steel production scaled dramatically, enabling infrastructure that would define the modern world.',
  },
  {
    id: 'k3',
    number: 3,
    name: 'Age of Electricity & Engineering',
    startYear: 1897,
    endYear: 1949,
    drivingTechnologies: ['Electricity', 'Chemicals', 'Internal combustion'],
    color: '#22c55e',
    phases: {
      spring: { start: 1897, end: 1907, label: 'Electrification begins' },
      summer: { start: 1907, end: 1920, label: 'WWI industrial mobilization' },
      autumn: { start: 1920, end: 1929, label: 'Roaring Twenties' },
      winter: { start: 1929, end: 1949, label: 'Great Depression & WWII' },
    },
    keyInnovations: ['Electric grid', 'Assembly line', 'Radio', 'Synthetic materials', 'Aviation'],
    leadingCountry: 'United States',
    description: 'Electricity and the internal combustion engine powered mass production. The US overtook Britain as the leading economic power during this wave.',
  },
  {
    id: 'k4',
    number: 4,
    name: 'Age of Oil, Autos & Mass Production',
    startYear: 1949,
    endYear: 2000,
    drivingTechnologies: ['Automobiles', 'Petrochemicals', 'Electronics', 'Aviation'],
    color: '#f59e0b',
    phases: {
      spring: { start: 1949, end: 1966, label: 'Post-war golden age' },
      summer: { start: 1966, end: 1973, label: 'Stagflation begins' },
      autumn: { start: 1973, end: 1982, label: 'Oil crises & inflation' },
      winter: { start: 1982, end: 2000, label: 'Financialization era' },
    },
    keyInnovations: ['Transistor', 'Interstate highways', 'Jet engine', 'Green revolution', 'Mainframe computers'],
    leadingCountry: 'United States',
    description: 'Mass production and suburbanization defined the American century. Cheap oil powered a consumer society, while electronics laid the groundwork for the digital age.',
  },
  {
    id: 'k5',
    number: 5,
    name: 'Age of Digital & AI',
    startYear: 2000,
    endYear: 2060,
    drivingTechnologies: ['Internet', 'Mobile', 'AI/ML', 'Cloud computing', 'Biotech'],
    color: '#ef4444',
    phases: {
      spring: { start: 2000, end: 2008, label: 'Web 2.0 & mobile revolution' },
      summer: { start: 2008, end: 2020, label: 'Platform economy & QE era' },
      autumn: { start: 2020, end: 2035, label: 'AI boom & crypto speculation' },
      winter: { start: 2035, end: 2060, label: 'Projected consolidation' },
    },
    keyInnovations: ['Smartphone', 'Cloud computing', 'Deep learning', 'CRISPR', 'Blockchain', 'Large language models'],
    leadingCountry: 'United States / China',
    description: 'The digital revolution is reshaping every industry. AI represents a potential general-purpose technology comparable to electricity, with the US and China competing for leadership.',
  },
];

// ============================================================================
// MARKET CYCLE INDICATORS (FALLBACK DATA)
// ============================================================================

export interface MarketCycleDataPoint {
  year: number;
  month?: number;
  buffettIndicator?: number;
  shillerCAPE?: number;
  yieldCurve10Y2Y?: number;
  yieldCurve10Y3M?: number;
  recessionProbability?: number;
  creditSpread?: number;
  m2GrowthYoY?: number;
  fedFundsRate?: number;
  sp500?: number;
  vix?: number;
}

export const historicalMarketData: MarketCycleDataPoint[] = [
  { year: 1970, buffettIndicator: 78, shillerCAPE: 15.8, yieldCurve10Y2Y: 0.5, recessionProbability: 15, creditSpread: 2.5, m2GrowthYoY: 6.5, fedFundsRate: 7.2 },
  { year: 1973, buffettIndicator: 85, shillerCAPE: 18.5, yieldCurve10Y2Y: -0.2, recessionProbability: 45, creditSpread: 3.2, m2GrowthYoY: 8.1, fedFundsRate: 8.7 },
  { year: 1975, buffettIndicator: 55, shillerCAPE: 8.9, yieldCurve10Y2Y: 2.1, recessionProbability: 5, creditSpread: 3.8, m2GrowthYoY: 12.6, fedFundsRate: 5.2 },
  { year: 1980, buffettIndicator: 52, shillerCAPE: 9.1, yieldCurve10Y2Y: -2.3, recessionProbability: 65, creditSpread: 4.5, m2GrowthYoY: 8.4, fedFundsRate: 13.4 },
  { year: 1982, buffettIndicator: 44, shillerCAPE: 7.4, yieldCurve10Y2Y: 1.8, recessionProbability: 25, creditSpread: 5.2, m2GrowthYoY: 9.3, fedFundsRate: 12.2 },
  { year: 1985, buffettIndicator: 52, shillerCAPE: 11.3, yieldCurve10Y2Y: 1.2, recessionProbability: 8, creditSpread: 3.5, m2GrowthYoY: 8.7, fedFundsRate: 8.1 },
  { year: 1987, buffettIndicator: 62, shillerCAPE: 18.3, yieldCurve10Y2Y: 0.2, recessionProbability: 20, creditSpread: 2.8, m2GrowthYoY: 3.5, fedFundsRate: 6.7 },
  { year: 1990, buffettIndicator: 57, shillerCAPE: 16.0, yieldCurve10Y2Y: -0.1, recessionProbability: 40, creditSpread: 3.5, m2GrowthYoY: 4.2, fedFundsRate: 8.1 },
  { year: 1995, buffettIndicator: 84, shillerCAPE: 20.0, yieldCurve10Y2Y: 0.8, recessionProbability: 5, creditSpread: 2.2, m2GrowthYoY: 4.0, fedFundsRate: 5.8 },
  { year: 2000, buffettIndicator: 148, shillerCAPE: 44.2, yieldCurve10Y2Y: -0.5, recessionProbability: 30, creditSpread: 5.5, m2GrowthYoY: 6.2, fedFundsRate: 6.4 },
  { year: 2003, buffettIndicator: 105, shillerCAPE: 22.9, yieldCurve10Y2Y: 2.5, recessionProbability: 3, creditSpread: 3.3, m2GrowthYoY: 8.2, fedFundsRate: 1.0 },
  { year: 2007, buffettIndicator: 130, shillerCAPE: 27.3, yieldCurve10Y2Y: -0.2, recessionProbability: 40, creditSpread: 2.5, m2GrowthYoY: 5.8, fedFundsRate: 5.0 },
  { year: 2009, buffettIndicator: 62, shillerCAPE: 13.3, yieldCurve10Y2Y: 2.8, recessionProbability: 20, creditSpread: 8.5, m2GrowthYoY: 7.6, fedFundsRate: 0.2 },
  { year: 2013, buffettIndicator: 108, shillerCAPE: 24.0, yieldCurve10Y2Y: 2.4, recessionProbability: 2, creditSpread: 3.4, m2GrowthYoY: 5.5, fedFundsRate: 0.1 },
  { year: 2018, buffettIndicator: 140, shillerCAPE: 33.3, yieldCurve10Y2Y: 0.2, recessionProbability: 15, creditSpread: 3.2, m2GrowthYoY: 3.9, fedFundsRate: 1.8 },
  { year: 2020, buffettIndicator: 115, shillerCAPE: 28.3, yieldCurve10Y2Y: 0.5, recessionProbability: 80, creditSpread: 10.8, m2GrowthYoY: 25.2, fedFundsRate: 0.4 },
  { year: 2021, buffettIndicator: 195, shillerCAPE: 38.3, yieldCurve10Y2Y: 1.5, recessionProbability: 2, creditSpread: 2.9, m2GrowthYoY: 27.0, fedFundsRate: 0.1 },
  { year: 2022, buffettIndicator: 155, shillerCAPE: 29.0, yieldCurve10Y2Y: -0.7, recessionProbability: 35, creditSpread: 4.5, m2GrowthYoY: -1.3, fedFundsRate: 1.7 },
  { year: 2023, buffettIndicator: 170, shillerCAPE: 31.5, yieldCurve10Y2Y: -0.8, recessionProbability: 30, creditSpread: 3.8, m2GrowthYoY: -3.5, fedFundsRate: 5.0 },
  { year: 2024, buffettIndicator: 190, shillerCAPE: 35.5, yieldCurve10Y2Y: -0.3, recessionProbability: 20, creditSpread: 3.2, m2GrowthYoY: 2.5, fedFundsRate: 5.3 },
  { year: 2025, buffettIndicator: 185, shillerCAPE: 34.2, yieldCurve10Y2Y: 0.1, recessionProbability: 25, creditSpread: 3.5, m2GrowthYoY: 4.0, fedFundsRate: 4.5 },
];

// ============================================================================
// SECTOR ROTATION MODEL
// ============================================================================

export interface SectorRotation {
  phase: 'early' | 'mid' | 'late' | 'recession';
  label: string;
  description: string;
  leadingSectors: string[];
  laggingSectors: string[];
  characteristics: string[];
  color: string;
  bondPerformance: 'strong' | 'moderate' | 'weak';
  stockPerformance: 'strong' | 'moderate' | 'weak';
  commodityPerformance: 'weak' | 'moderate' | 'strong';
}

export const sectorRotations: SectorRotation[] = [
  {
    phase: 'early',
    label: 'Early Cycle (Recovery)',
    description: 'Economy emerges from recession. Central banks maintain accommodative policy. Credit begins to expand.',
    leadingSectors: ['Consumer Discretionary', 'Financials', 'Real Estate', 'Industrials'],
    laggingSectors: ['Utilities', 'Healthcare', 'Consumer Staples'],
    characteristics: ['Rising consumer confidence', 'Inventory rebuilding', 'Credit easing', 'Steepening yield curve'],
    color: '#22c55e',
    bondPerformance: 'strong',
    stockPerformance: 'strong',
    commodityPerformance: 'weak',
  },
  {
    phase: 'mid',
    label: 'Mid Cycle (Expansion)',
    description: 'Broadest period of growth. Corporate profits accelerate. Employment strengthens. Moderate policy tightening.',
    leadingSectors: ['Technology', 'Industrials', 'Communication Services', 'Materials'],
    laggingSectors: ['Utilities', 'Consumer Staples'],
    characteristics: ['Strong profit growth', 'Low unemployment', 'Moderate inflation', 'Healthy credit growth'],
    color: '#3b82f6',
    bondPerformance: 'moderate',
    stockPerformance: 'strong',
    commodityPerformance: 'moderate',
  },
  {
    phase: 'late',
    label: 'Late Cycle (Overheating)',
    description: 'Growth decelerates. Inflation picks up. Central banks tighten aggressively. Yield curve flattens or inverts.',
    leadingSectors: ['Energy', 'Materials', 'Healthcare', 'Consumer Staples'],
    laggingSectors: ['Technology', 'Consumer Discretionary', 'Financials'],
    characteristics: ['Rising inflation', 'Tight labor market', 'Aggressive rate hikes', 'Narrowing margins'],
    color: '#f59e0b',
    bondPerformance: 'weak',
    stockPerformance: 'moderate',
    commodityPerformance: 'strong',
  },
  {
    phase: 'recession',
    label: 'Recession (Contraction)',
    description: 'Economic activity contracts. Corporate earnings decline. Central banks pivot to easing. Credit tightens.',
    leadingSectors: ['Utilities', 'Healthcare', 'Consumer Staples', 'Communication Services'],
    laggingSectors: ['Financials', 'Industrials', 'Consumer Discretionary', 'Materials'],
    characteristics: ['Falling GDP', 'Rising unemployment', 'Deflation risk', 'Flight to safety'],
    color: '#ef4444',
    bondPerformance: 'strong',
    stockPerformance: 'weak',
    commodityPerformance: 'weak',
  },
];

// ============================================================================
// GLOBAL MARKET CLOCK POSITIONS
// ============================================================================

export interface MarketClockPosition {
  country: string;
  code: string;
  region: string;
  phase: 'early' | 'mid' | 'late' | 'recession';
  pmiTrend: 'expanding' | 'contracting' | 'neutral';
  gdpGrowth: number;
  inflationRate: number;
  policyStance: 'easing' | 'neutral' | 'tightening';
}

export const globalMarketClock: MarketClockPosition[] = [
  { country: 'United States', code: 'US', region: 'Americas', phase: 'late', pmiTrend: 'expanding', gdpGrowth: 2.5, inflationRate: 3.2, policyStance: 'tightening' },
  { country: 'Eurozone', code: 'EU', region: 'Europe', phase: 'early', pmiTrend: 'neutral', gdpGrowth: 0.8, inflationRate: 2.4, policyStance: 'easing' },
  { country: 'Japan', code: 'JP', region: 'Asia', phase: 'mid', pmiTrend: 'expanding', gdpGrowth: 1.1, inflationRate: 2.8, policyStance: 'tightening' },
  { country: 'China', code: 'CN', region: 'Asia', phase: 'early', pmiTrend: 'contracting', gdpGrowth: 4.5, inflationRate: 0.2, policyStance: 'easing' },
  { country: 'United Kingdom', code: 'UK', region: 'Europe', phase: 'early', pmiTrend: 'expanding', gdpGrowth: 0.6, inflationRate: 3.4, policyStance: 'easing' },
  { country: 'India', code: 'IN', region: 'Asia', phase: 'mid', pmiTrend: 'expanding', gdpGrowth: 6.5, inflationRate: 4.8, policyStance: 'neutral' },
  { country: 'Brazil', code: 'BR', region: 'Americas', phase: 'mid', pmiTrend: 'expanding', gdpGrowth: 2.9, inflationRate: 4.5, policyStance: 'tightening' },
  { country: 'Germany', code: 'DE', region: 'Europe', phase: 'recession', pmiTrend: 'contracting', gdpGrowth: -0.3, inflationRate: 2.2, policyStance: 'easing' },
  { country: 'South Korea', code: 'KR', region: 'Asia', phase: 'mid', pmiTrend: 'expanding', gdpGrowth: 2.2, inflationRate: 2.9, policyStance: 'neutral' },
  { country: 'Australia', code: 'AU', region: 'Oceania', phase: 'late', pmiTrend: 'neutral', gdpGrowth: 1.5, inflationRate: 3.6, policyStance: 'tightening' },
  { country: 'Canada', code: 'CA', region: 'Americas', phase: 'early', pmiTrend: 'neutral', gdpGrowth: 1.1, inflationRate: 2.7, policyStance: 'easing' },
  { country: 'Mexico', code: 'MX', region: 'Americas', phase: 'mid', pmiTrend: 'expanding', gdpGrowth: 3.2, inflationRate: 4.3, policyStance: 'tightening' },
];

// ============================================================================
// MINSKY FINANCIAL INSTABILITY DATA
// ============================================================================

export interface MinskyPhase {
  id: string;
  name: string;
  label: string;
  description: string;
  characteristics: string[];
  color: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
}

export const minskyPhases: MinskyPhase[] = [
  {
    id: 'hedge',
    name: 'Hedge Finance',
    label: 'Hedge',
    description: 'Borrowers can meet all debt obligations (principal + interest) from current cash flows. This is the most stable form of finance.',
    characteristics: ['Conservative lending', 'Positive cash flows cover debt', 'Low leverage ratios', 'Strong underwriting standards'],
    color: '#22c55e',
    riskLevel: 'low',
  },
  {
    id: 'speculative',
    name: 'Speculative Finance',
    label: 'Speculative',
    description: 'Borrowers can cover interest payments but must roll over principal. They depend on asset price appreciation or refinancing.',
    characteristics: ['Rising leverage', 'Interest-only servicing', 'Depends on refinancing', 'Growing optimism', 'Weakening standards'],
    color: '#f59e0b',
    riskLevel: 'moderate',
  },
  {
    id: 'ponzi',
    name: 'Ponzi Finance',
    label: 'Ponzi',
    description: 'Borrowers cannot cover even interest payments from cash flows. They depend entirely on rising asset prices to service or refinance debt.',
    characteristics: ['Extreme leverage', 'Negative cash flow', 'Depends on asset appreciation', 'FOMO-driven lending', 'Fraudulent schemes emerge'],
    color: '#ef4444',
    riskLevel: 'extreme',
  },
];

export interface MinskyMomentEvent {
  year: number;
  name: string;
  minskyPhase: 'hedge' | 'speculative' | 'ponzi';
  privateCreditGrowth: number;
  assetPriceGrowth: number;
  description: string;
}

export const minskyMoments: MinskyMomentEvent[] = [
  { year: 1987, name: 'Black Monday', minskyPhase: 'speculative', privateCreditGrowth: 12, assetPriceGrowth: 35, description: 'Portfolio insurance and program trading created self-reinforcing selling spiral.' },
  { year: 1997, name: 'Asian Financial Crisis', minskyPhase: 'ponzi', privateCreditGrowth: 25, assetPriceGrowth: 40, description: 'Dollar-pegged currencies and foreign-denominated debt created classic Minsky fragility.' },
  { year: 2000, name: 'Dot-Com Bust', minskyPhase: 'ponzi', privateCreditGrowth: 10, assetPriceGrowth: 65, description: 'Venture capital and IPOs funded companies with no path to profitability.' },
  { year: 2008, name: 'Global Financial Crisis', minskyPhase: 'ponzi', privateCreditGrowth: 18, assetPriceGrowth: 45, description: 'Subprime lending, CDOs, and shadow banking created systemic Ponzi finance.' },
  { year: 2015, name: 'China Stock Crash', minskyPhase: 'speculative', privateCreditGrowth: 22, assetPriceGrowth: 80, description: 'Margin lending fueled a speculative bubble in Chinese equities.' },
  { year: 2021, name: 'Everything Bubble', minskyPhase: 'speculative', privateCreditGrowth: 8, assetPriceGrowth: 28, description: 'Zero rates and QE inflated crypto, SPACs, meme stocks, and NFTs simultaneously.' },
  { year: 2022, name: 'Crypto Winter', minskyPhase: 'ponzi', privateCreditGrowth: 5, assetPriceGrowth: -60, description: 'FTX, Terra/Luna, and Three Arrows Capital revealed Ponzi-like structures in DeFi.' },
];

// ============================================================================
// MONETARY POLICY REGIMES
// ============================================================================

export interface MonetaryRegime {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  description: string;
  characteristics: string[];
  color: string;
  keyEvents: { year: number; event: string }[];
  averageInflation: number;
  averageGrowth: number;
}

export const monetaryRegimes: MonetaryRegime[] = [
  {
    id: 'classical-gold',
    name: 'Classical Gold Standard',
    startYear: 1870,
    endYear: 1914,
    description: 'Fixed exchange rates with currencies convertible to gold at set prices. Automatic adjustment via specie flow mechanism.',
    characteristics: ['Price stability (long-run)', 'Deflationary bias', 'Automatic BoP adjustment', 'Limited monetary sovereignty', 'London as financial center'],
    color: '#fbbf24',
    keyEvents: [
      { year: 1870, event: 'Germany adopts gold standard' },
      { year: 1879, event: 'US resumes gold convertibility' },
      { year: 1890, event: 'Barings Crisis' },
      { year: 1907, event: 'Panic of 1907' },
    ],
    averageInflation: 0.1,
    averageGrowth: 2.7,
  },
  {
    id: 'interwar',
    name: 'Interwar Instability',
    startYear: 1914,
    endYear: 1944,
    description: 'Gold standard suspended during WWI, partially restored in 1920s, collapsed in 1930s amid beggar-thy-neighbor devaluations.',
    characteristics: ['Competitive devaluations', 'Hyperinflation episodes', 'Trade wars', 'Capital controls', 'Banking panics'],
    color: '#ef4444',
    keyEvents: [
      { year: 1914, event: 'Gold standard suspended (WWI)' },
      { year: 1923, event: 'German hyperinflation' },
      { year: 1925, event: 'UK returns to gold (overvalued)' },
      { year: 1929, event: 'Wall Street Crash' },
      { year: 1931, event: 'UK abandons gold standard' },
      { year: 1933, event: 'US devalues dollar vs gold' },
    ],
    averageInflation: 3.8,
    averageGrowth: 1.2,
  },
  {
    id: 'bretton-woods',
    name: 'Bretton Woods',
    startYear: 1944,
    endYear: 1971,
    description: 'Dollar-gold standard: USD fixed to gold at $35/oz, other currencies pegged to USD. IMF and World Bank established.',
    characteristics: ['Dollar-gold peg', 'Fixed but adjustable rates', 'Capital controls', 'Triffin Dilemma', 'Growing dollar shortage then glut'],
    color: '#3b82f6',
    keyEvents: [
      { year: 1944, event: 'Bretton Woods conference' },
      { year: 1947, event: 'Marshall Plan begins' },
      { year: 1958, event: 'European currencies become convertible' },
      { year: 1961, event: 'London Gold Pool formed' },
      { year: 1968, event: 'Two-tier gold market' },
      { year: 1971, event: 'Nixon closes gold window' },
    ],
    averageInflation: 2.9,
    averageGrowth: 4.8,
  },
  {
    id: 'great-inflation',
    name: 'Great Inflation',
    startYear: 1971,
    endYear: 1982,
    description: 'Floating exchange rates, oil shocks, and accommodative monetary policy produced the worst peacetime inflation in modern history.',
    characteristics: ['Floating exchange rates', 'Oil price shocks', 'Stagflation', 'Loss of Fed credibility', 'Dollar weakness'],
    color: '#f97316',
    keyEvents: [
      { year: 1971, event: 'Smithsonian Agreement' },
      { year: 1973, event: 'OPEC oil embargo' },
      { year: 1979, event: 'Second oil shock' },
      { year: 1979, event: 'Volcker appointed Fed Chair' },
    ],
    averageInflation: 8.7,
    averageGrowth: 2.8,
  },
  {
    id: 'great-moderation',
    name: 'Great Moderation',
    startYear: 1982,
    endYear: 2007,
    description: 'Central bank independence, inflation targeting, and financial deregulation produced a long period of stable growth and low inflation.',
    characteristics: ['Inflation targeting', 'Central bank independence', 'Financial deregulation', 'Globalization', 'Low volatility'],
    color: '#22c55e',
    keyEvents: [
      { year: 1982, event: 'Volcker breaks inflation' },
      { year: 1987, event: 'Greenspan put after Black Monday' },
      { year: 1989, event: 'RBNZ adopts inflation targeting' },
      { year: 1992, event: 'ERM crisis / BOE targets inflation' },
      { year: 1999, event: 'Euro launched' },
      { year: 2004, event: 'Greenspan conundrum' },
    ],
    averageInflation: 3.0,
    averageGrowth: 3.4,
  },
  {
    id: 'qe-era',
    name: 'QE & Zero Rates',
    startYear: 2007,
    endYear: 2021,
    description: 'Unconventional monetary policy: zero/negative rates, massive asset purchases, forward guidance. Central banks become dominant market actors.',
    characteristics: ['Zero lower bound', 'Quantitative easing', 'Forward guidance', 'Negative rates (EU, Japan)', 'Asset price inflation'],
    color: '#8b5cf6',
    keyEvents: [
      { year: 2008, event: 'Fed cuts to zero, QE1' },
      { year: 2010, event: 'QE2 announced' },
      { year: 2012, event: 'Draghi: "whatever it takes"' },
      { year: 2014, event: 'ECB negative rates' },
      { year: 2016, event: 'BOJ yield curve control' },
      { year: 2020, event: 'COVID: unlimited QE' },
    ],
    averageInflation: 1.8,
    averageGrowth: 1.9,
  },
  {
    id: 'normalization',
    name: 'Rate Normalization',
    startYear: 2021,
    endYear: 2030,
    description: 'Post-pandemic inflation forced the fastest rate hiking cycle in decades. Central banks unwind QE while managing debt sustainability.',
    characteristics: ['Aggressive rate hikes', 'Quantitative tightening', 'Fiscal-monetary tension', 'Inflation persistence', 'Higher-for-longer'],
    color: '#06b6d4',
    keyEvents: [
      { year: 2021, event: 'Inflation surges post-COVID' },
      { year: 2022, event: 'Fed begins fastest hikes since 1980s' },
      { year: 2023, event: 'SVB collapse / banking stress' },
      { year: 2024, event: 'Fed begins cautious easing' },
    ],
    averageInflation: 5.2,
    averageGrowth: 2.1,
  },
];

// Central bank rate history for multi-series chart
export const centralBankRateHistory = [
  { year: 1970, fed: 7.2, boe: 7.0, ecb: null, boj: 6.0 },
  { year: 1975, fed: 5.2, boe: 11.3, ecb: null, boj: 6.5 },
  { year: 1980, fed: 13.4, boe: 17.0, ecb: null, boj: 7.3 },
  { year: 1982, fed: 12.2, boe: 12.0, ecb: null, boj: 5.5 },
  { year: 1985, fed: 8.1, boe: 12.3, ecb: null, boj: 5.0 },
  { year: 1990, fed: 8.1, boe: 14.9, ecb: null, boj: 6.0 },
  { year: 1995, fed: 5.8, boe: 6.7, ecb: null, boj: 0.5 },
  { year: 1999, fed: 5.0, boe: 5.5, ecb: 3.0, boj: 0.0 },
  { year: 2001, fed: 3.9, boe: 5.3, ecb: 4.3, boj: 0.3 },
  { year: 2003, fed: 1.0, boe: 3.8, ecb: 2.0, boj: 0.0 },
  { year: 2005, fed: 3.2, boe: 4.5, ecb: 2.0, boj: 0.0 },
  { year: 2007, fed: 5.0, boe: 5.5, ecb: 3.8, boj: 0.5 },
  { year: 2008, fed: 2.0, boe: 4.7, ecb: 3.8, boj: 0.3 },
  { year: 2009, fed: 0.2, boe: 0.5, ecb: 1.0, boj: 0.1 },
  { year: 2010, fed: 0.2, boe: 0.5, ecb: 1.0, boj: 0.0 },
  { year: 2012, fed: 0.1, boe: 0.5, ecb: 0.8, boj: 0.0 },
  { year: 2015, fed: 0.1, boe: 0.5, ecb: 0.1, boj: -0.1 },
  { year: 2017, fed: 1.0, boe: 0.3, ecb: 0.0, boj: -0.1 },
  { year: 2019, fed: 2.2, boe: 0.8, ecb: 0.0, boj: -0.1 },
  { year: 2020, fed: 0.4, boe: 0.1, ecb: 0.0, boj: -0.1 },
  { year: 2021, fed: 0.1, boe: 0.1, ecb: 0.0, boj: -0.1 },
  { year: 2022, fed: 1.7, boe: 1.8, ecb: 0.6, boj: -0.1 },
  { year: 2023, fed: 5.0, boe: 5.0, ecb: 4.0, boj: -0.1 },
  { year: 2024, fed: 5.3, boe: 5.3, ecb: 4.5, boj: 0.3 },
  { year: 2025, fed: 4.5, boe: 4.5, ecb: 3.5, boj: 0.5 },
];

// M2 Money Supply Growth (YoY %)
export const m2GrowthHistory = [
  { year: 1960, us: 4.5 }, { year: 1965, us: 8.0 }, { year: 1970, us: 6.5 },
  { year: 1975, us: 12.6 }, { year: 1980, us: 8.4 }, { year: 1985, us: 8.7 },
  { year: 1990, us: 4.2 }, { year: 1995, us: 4.0 }, { year: 2000, us: 6.2 },
  { year: 2005, us: 4.1 }, { year: 2007, us: 5.8 }, { year: 2008, us: 9.5 },
  { year: 2009, us: 7.6 }, { year: 2010, us: 3.2 }, { year: 2012, us: 8.1 },
  { year: 2015, us: 5.8 }, { year: 2018, us: 3.9 }, { year: 2019, us: 6.7 },
  { year: 2020, us: 25.2 }, { year: 2021, us: 27.0 }, { year: 2022, us: -1.3 },
  { year: 2023, us: -3.5 }, { year: 2024, us: 2.5 }, { year: 2025, us: 4.0 },
];

// ============================================================================
// GEOPOLITICAL / RESERVE CURRENCY DATA
// ============================================================================

export interface ReserveCurrencyShare {
  year: number;
  usd: number;
  eur: number;
  gbp: number;
  jpy: number;
  cny: number;
  other: number;
}

export const reserveCurrencyShares: ReserveCurrencyShare[] = [
  { year: 1900, usd: 0, eur: 0, gbp: 64, jpy: 0, cny: 0, other: 36 },
  { year: 1920, usd: 25, eur: 0, gbp: 45, jpy: 0, cny: 0, other: 30 },
  { year: 1940, usd: 45, eur: 0, gbp: 30, jpy: 0, cny: 0, other: 25 },
  { year: 1950, usd: 55, eur: 0, gbp: 25, jpy: 0, cny: 0, other: 20 },
  { year: 1960, usd: 60, eur: 0, gbp: 20, jpy: 0, cny: 0, other: 20 },
  { year: 1970, usd: 65, eur: 0, gbp: 12, jpy: 2, cny: 0, other: 21 },
  { year: 1980, usd: 57, eur: 0, gbp: 3, jpy: 4, cny: 0, other: 36 },
  { year: 1990, usd: 50, eur: 0, gbp: 3, jpy: 8, cny: 0, other: 39 },
  { year: 2000, usd: 71, eur: 18, gbp: 3, jpy: 6, cny: 0, other: 2 },
  { year: 2005, usd: 67, eur: 24, gbp: 4, jpy: 4, cny: 0, other: 1 },
  { year: 2010, usd: 62, eur: 26, gbp: 4, jpy: 3, cny: 0, other: 5 },
  { year: 2015, usd: 64, eur: 20, gbp: 5, jpy: 4, cny: 1, other: 6 },
  { year: 2020, usd: 59, eur: 21, gbp: 5, jpy: 6, cny: 2, other: 7 },
  { year: 2023, usd: 58, eur: 20, gbp: 5, jpy: 6, cny: 3, other: 8 },
  { year: 2025, usd: 57, eur: 20, gbp: 5, jpy: 5, cny: 3, other: 10 },
];

export interface ThucydidesTrapEvent {
  id: string;
  risingPower: string;
  rulingPower: string;
  period: string;
  startYear: number;
  endYear: number;
  outcome: 'war' | 'peaceful' | 'ongoing';
  description: string;
  color: string;
}

export const thucydidesTrapEvents: ThucydidesTrapEvent[] = [
  { id: 'tt1', risingPower: 'France', rulingPower: 'Britain', period: '1793-1815', startYear: 1793, endYear: 1815, outcome: 'war', description: 'Napoleonic Wars: French bid for European hegemony ended at Waterloo.', color: '#ef4444' },
  { id: 'tt2', risingPower: 'Russia', rulingPower: 'Britain', period: '1853-1856', startYear: 1853, endYear: 1856, outcome: 'war', description: 'Crimean War: Russian expansion challenged British Mediterranean interests.', color: '#f97316' },
  { id: 'tt3', risingPower: 'Germany', rulingPower: 'Britain/France', period: '1871-1918', startYear: 1871, endYear: 1918, outcome: 'war', description: 'German unification and industrialization challenged European balance of power.', color: '#ef4444' },
  { id: 'tt4', risingPower: 'Japan', rulingPower: 'US/Britain', period: '1931-1945', startYear: 1931, endYear: 1945, outcome: 'war', description: 'Japanese imperial expansion in Asia-Pacific challenged Western colonial order.', color: '#ef4444' },
  { id: 'tt5', risingPower: 'Soviet Union', rulingPower: 'United States', period: '1947-1991', startYear: 1947, endYear: 1991, outcome: 'peaceful', description: 'Cold War: nuclear deterrence prevented direct conflict despite intense rivalry.', color: '#22c55e' },
  { id: 'tt6', risingPower: 'Japan (economic)', rulingPower: 'United States', period: '1970-1991', startYear: 1970, endYear: 1991, outcome: 'peaceful', description: 'Japanese economic miracle generated trade tensions but no military conflict.', color: '#22c55e' },
  { id: 'tt7', risingPower: 'China', rulingPower: 'United States', period: '2010-present', startYear: 2010, endYear: 2030, outcome: 'ongoing', description: 'Chinese economic and military rise is the defining geopolitical contest of the 21st century.', color: '#f59e0b' },
];

export interface ConflictCycleEvent {
  year: number;
  name: string;
  type: 'military' | 'economic' | 'proxy';
  impactOnCycle: string;
  gdpImpact: number;
}

export const majorConflicts: ConflictCycleEvent[] = [
  { year: 1914, name: 'World War I', type: 'military', impactOnCycle: 'Ended Classical Gold Standard, shattered European power structure', gdpImpact: -15 },
  { year: 1929, name: 'Great Depression', type: 'economic', impactOnCycle: 'Collapsed global trade, drove competitive devaluations and protectionism', gdpImpact: -27 },
  { year: 1939, name: 'World War II', type: 'military', impactOnCycle: 'Destroyed European/Japanese economies, established US hegemony', gdpImpact: -20 },
  { year: 1973, name: 'OPEC Oil Embargo', type: 'economic', impactOnCycle: 'Triggered stagflation, ended post-war golden age', gdpImpact: -3 },
  { year: 1979, name: 'Iranian Revolution', type: 'military', impactOnCycle: 'Second oil shock, contributed to Volcker tightening', gdpImpact: -2 },
  { year: 1990, name: 'Gulf War', type: 'military', impactOnCycle: 'Oil price spike, brief recession', gdpImpact: -1 },
  { year: 2001, name: '9/11 & War on Terror', type: 'military', impactOnCycle: 'Massive fiscal expansion, security spending shift', gdpImpact: -1 },
  { year: 2008, name: 'Global Financial Crisis', type: 'economic', impactOnCycle: 'Systemic banking crisis, ushered in QE era', gdpImpact: -4 },
  { year: 2020, name: 'COVID-19 Pandemic', type: 'economic', impactOnCycle: 'Global lockdowns, unprecedented fiscal/monetary response', gdpImpact: -3 },
  { year: 2022, name: 'Russia-Ukraine War', type: 'military', impactOnCycle: 'Energy crisis in Europe, food price shock, accelerated deglobalization', gdpImpact: -1 },
];

// ============================================================================
// YIELD CURVE & LEI FALLBACK DATA
// ============================================================================

export interface YieldCurveDataPoint {
  date: string;
  spread10Y2Y: number;
  spread10Y3M: number;
  isRecession: boolean;
}

export const yieldCurveHistory: YieldCurveDataPoint[] = [
  { date: '1978-01', spread10Y2Y: 0.3, spread10Y3M: 0.8, isRecession: false },
  { date: '1980-01', spread10Y2Y: -2.3, spread10Y3M: -3.5, isRecession: true },
  { date: '1982-01', spread10Y2Y: -0.5, spread10Y3M: -1.2, isRecession: true },
  { date: '1983-01', spread10Y2Y: 1.8, spread10Y3M: 2.2, isRecession: false },
  { date: '1985-01', spread10Y2Y: 1.2, spread10Y3M: 1.5, isRecession: false },
  { date: '1989-01', spread10Y2Y: -0.3, spread10Y3M: -0.5, isRecession: false },
  { date: '1990-07', spread10Y2Y: -0.1, spread10Y3M: 0.2, isRecession: true },
  { date: '1993-01', spread10Y2Y: 2.8, spread10Y3M: 3.5, isRecession: false },
  { date: '1995-01', spread10Y2Y: 0.8, spread10Y3M: 0.9, isRecession: false },
  { date: '1998-01', spread10Y2Y: 0.3, spread10Y3M: 0.5, isRecession: false },
  { date: '2000-03', spread10Y2Y: -0.5, spread10Y3M: -0.8, isRecession: false },
  { date: '2001-03', spread10Y2Y: 0.5, spread10Y3M: 0.8, isRecession: true },
  { date: '2003-01', spread10Y2Y: 2.5, spread10Y3M: 3.2, isRecession: false },
  { date: '2006-07', spread10Y2Y: -0.2, spread10Y3M: -0.3, isRecession: false },
  { date: '2007-12', spread10Y2Y: -0.1, spread10Y3M: 1.5, isRecession: true },
  { date: '2010-01', spread10Y2Y: 2.8, spread10Y3M: 3.7, isRecession: false },
  { date: '2013-01', spread10Y2Y: 1.6, spread10Y3M: 1.9, isRecession: false },
  { date: '2017-01', spread10Y2Y: 1.2, spread10Y3M: 1.5, isRecession: false },
  { date: '2019-08', spread10Y2Y: -0.1, spread10Y3M: -0.3, isRecession: false },
  { date: '2020-03', spread10Y2Y: 0.5, spread10Y3M: 0.3, isRecession: true },
  { date: '2021-03', spread10Y2Y: 1.5, spread10Y3M: 1.6, isRecession: false },
  { date: '2022-07', spread10Y2Y: -0.5, spread10Y3M: 0.2, isRecession: false },
  { date: '2023-07', spread10Y2Y: -1.0, spread10Y3M: -1.8, isRecession: false },
  { date: '2024-01', spread10Y2Y: -0.3, spread10Y3M: -1.4, isRecession: false },
  { date: '2024-09', spread10Y2Y: 0.1, spread10Y3M: -0.1, isRecession: false },
  { date: '2025-01', spread10Y2Y: 0.2, spread10Y3M: 0.1, isRecession: false },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getPhaseColor = (phase: string): string => {
  const colors: Record<string, string> = {
    early: '#22c55e',
    mid: '#3b82f6',
    late: '#f59e0b',
    recession: '#ef4444',
    spring: '#22c55e',
    summer: '#f59e0b',
    autumn: '#ef4444',
    winter: '#3b82f6',
  };
  return colors[phase] || '#6b7280';
};

export const getBuffettIndicatorZone = (value: number): { label: string; color: string; assessment: string } => {
  if (value < 75) return { label: 'Significantly Undervalued', color: '#22c55e', assessment: 'Strong buy signal historically' };
  if (value < 90) return { label: 'Modestly Undervalued', color: '#86efac', assessment: 'Favorable entry point' };
  if (value < 115) return { label: 'Fair Value', color: '#3b82f6', assessment: 'Market near equilibrium' };
  if (value < 140) return { label: 'Modestly Overvalued', color: '#fbbf24', assessment: 'Caution warranted' };
  if (value < 175) return { label: 'Significantly Overvalued', color: '#f97316', assessment: 'Elevated risk of correction' };
  return { label: 'Extremely Overvalued', color: '#ef4444', assessment: 'Historically associated with major drawdowns' };
};

export const getCAPEZone = (value: number): { label: string; color: string } => {
  if (value < 15) return { label: 'Undervalued', color: '#22c55e' };
  if (value < 20) return { label: 'Fair Value', color: '#3b82f6' };
  if (value < 25) return { label: 'Elevated', color: '#fbbf24' };
  if (value < 30) return { label: 'Overvalued', color: '#f97316' };
  return { label: 'Extremely Overvalued', color: '#ef4444' };
};

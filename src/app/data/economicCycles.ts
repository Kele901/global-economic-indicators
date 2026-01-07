/**
 * Economic Cycles Data
 * 
 * Intellectual foundations:
 * - "The Changing World Order" by Ray Dalio
 * - "This Time is Different: Eight Centuries of Financial Folly" by Carmen M. Reinhart and Kenneth S. Rogoff
 * - "Handbook of International Economics Vol. 3" edited by Gene Grossman and Kenneth Rogoff
 *   - Krugman (1979) - "A Model of Balance of Payments Crises"
 *   - Obstfeld (1994) - "The Logic of Currency Crises"
 *   - Calvo (1998) - "Capital Flows and Capital-Market Crises"
 *   - Eichengreen, Hausmann & Panizza - "Original Sin" framework
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type CrisisType = 'banking' | 'sovereign_debt' | 'currency' | 'inflation' | 'stock_market';

export interface EmpireCycle {
  id: string;
  name: string;
  fullName: string;
  riseStart: number;
  peakStart: number;
  peakEnd: number;
  declineEnd: number;
  color: string;
  reserveCurrency?: string;
  description: string;
  keyEvents: { year: number; event: string }[];
  metrics: {
    education: number[];      // [rise, peak, decline] scores 0-100
    innovation: number[];
    competitiveness: number[];
    militaryStrength: number[];
    tradeVolume: number[];
    financialCenter: number[];
    reserveCurrencyStatus: number[];
  };
}

export interface CrisisEvent {
  id: string;
  year: number;
  endYear?: number;
  country: string;
  countryCode: string;
  region: string;
  type: CrisisType;
  severity: 1 | 2 | 3 | 4 | 5;  // 1 = minor, 5 = catastrophic
  name: string;
  description: string;
  gdpDecline?: number;         // Percentage decline
  recoveryYears?: number;
  peakInflation?: number;      // For inflation crises
  debtToGdp?: number;          // For sovereign debt crises
  currencyDecline?: number;    // For currency crises (% depreciation)
  bankFailures?: number;       // For banking crises
  causes: string[];
  consequences: string[];
  crisisGeneration?: CrisisGeneration;  // Handbook of International Economics classification
}

export interface DebtCyclePhase {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  cycleType: 'long_term' | 'short_term';
  phase: 'early' | 'bubble' | 'top' | 'depression' | 'deleveraging' | 'normalization';
  description: string;
  characteristics: string[];
  interestRateTrend: 'rising' | 'falling' | 'low' | 'high';
  debtTrend: 'rising' | 'falling' | 'stable';
  assetPrices: 'rising' | 'falling' | 'stable';
}

export interface CycleIndicator {
  name: string;
  currentValue: number;
  historicalAverage: number;
  precrisisAverage: number;
  warningThreshold: number;
  dangerThreshold: number;
  unit: string;
  interpretation: string;
}

// ============================================================================
// HANDBOOK OF INTERNATIONAL ECONOMICS VOL. 3 - TYPE DEFINITIONS
// ============================================================================

export type CrisisGeneration = '1st' | '2nd' | '3rd';
export type CapitalFlowType = 'sudden_stop' | 'capital_bonanza' | 'flight_to_safety';
export type DebtVulnerabilityType = 'debt_intolerance' | 'original_sin' | 'safe_haven';

export interface CrisisGenerationModel {
  generation: CrisisGeneration;
  name: string;
  theorists: string[];
  year: number;
  mechanism: string;
  keyIndicators: string[];
  historicalExamples: string[];
  description: string;
  warningSignals: string[];
}

export interface CapitalFlowEvent {
  id: string;
  type: CapitalFlowType;
  country: string;
  countryCode: string;
  year: number;
  endYear?: number;
  magnitude: number; // % of GDP
  triggers: string[];
  consequences: string[];
  description: string;
  relatedCrisis?: string; // ID of related crisis event
}

export interface ExchangeRateConcept {
  id: string;
  name: string;
  theorist: string;
  year: number;
  description: string;
  mechanism: string;
  formula?: string;
  implications: string[];
  empiricalEvidence: string;
}

export interface DebtVulnerability {
  id: string;
  concept: DebtVulnerabilityType;
  name: string;
  theorists: string[];
  description: string;
  mechanism: string;
  affectedCountries: string[];
  indicators: string[];
  currentRelevance: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface CountryDebtProfile {
  countryCode: string;
  country: string;
  debtIntolerance: number; // 0-100 score
  originalSinIndex: number; // 0-100 (% debt in foreign currency)
  safeHavenStatus: boolean;
  reserveCurrencyIssuer: boolean;
  currentDebtToGdp: number;
  externalDebtShare: number; // % of total debt
  foreignCurrencyDebtShare: number; // % of debt in foreign currency
  vulnerabilityScore: number; // composite 0-100
}

// ============================================================================
// EMPIRE CYCLES (Ray Dalio Framework)
// ============================================================================

export const empireCycles: EmpireCycle[] = [
  {
    id: 'portuguese',
    name: 'Portugal',
    fullName: 'Portuguese Empire',
    riseStart: 1400,
    peakStart: 1500,
    peakEnd: 1580,
    declineEnd: 1700,
    color: '#006400',
    reserveCurrency: 'Portuguese Real',
    description: 'First global maritime empire, pioneered Age of Discovery with advanced navigation and trade networks spanning Africa, Asia, and South America.',
    keyEvents: [
      { year: 1415, event: 'Conquest of Ceuta - Beginning of overseas expansion' },
      { year: 1488, event: 'Bartolomeu Dias rounds Cape of Good Hope' },
      { year: 1498, event: 'Vasco da Gama reaches India' },
      { year: 1500, event: 'Discovery of Brazil' },
      { year: 1580, event: 'Iberian Union - Portugal under Spanish rule' },
    ],
    metrics: {
      education: [40, 60, 35],
      innovation: [70, 85, 40],
      competitiveness: [60, 80, 35],
      militaryStrength: [50, 70, 30],
      tradeVolume: [60, 90, 40],
      financialCenter: [40, 60, 25],
      reserveCurrencyStatus: [30, 50, 15],
    }
  },
  {
    id: 'spanish',
    name: 'Spain',
    fullName: 'Spanish Empire',
    riseStart: 1469,
    peakStart: 1550,
    peakEnd: 1650,
    declineEnd: 1800,
    color: '#C60B1E',
    reserveCurrency: 'Spanish Dollar (Piece of Eight)',
    description: 'Largest empire in history at its peak. Spanish Dollar became the first global reserve currency, used across the Americas, Europe, and Asia.',
    keyEvents: [
      { year: 1492, event: 'Columbus reaches the Americas' },
      { year: 1519, event: 'Cortés conquers Aztec Empire' },
      { year: 1533, event: 'Pizarro conquers Inca Empire' },
      { year: 1588, event: 'Spanish Armada defeated' },
      { year: 1648, event: 'Peace of Westphalia - Dutch independence' },
      { year: 1713, event: 'Treaty of Utrecht - Loss of European territories' },
    ],
    metrics: {
      education: [45, 55, 30],
      innovation: [55, 60, 25],
      competitiveness: [65, 75, 35],
      militaryStrength: [80, 95, 45],
      tradeVolume: [70, 90, 50],
      financialCenter: [50, 65, 30],
      reserveCurrencyStatus: [60, 85, 35],
    }
  },
  {
    id: 'dutch',
    name: 'Netherlands',
    fullName: 'Dutch Empire',
    riseStart: 1580,
    peakStart: 1630,
    peakEnd: 1720,
    declineEnd: 1800,
    color: '#FF6600',
    reserveCurrency: 'Dutch Guilder',
    description: 'The Dutch Golden Age. Pioneered modern capitalism with the first stock exchange, central bank, and multinational corporation (Dutch East India Company).',
    keyEvents: [
      { year: 1602, event: 'Dutch East India Company founded - First public company' },
      { year: 1609, event: 'Bank of Amsterdam established - First central bank' },
      { year: 1637, event: 'Tulip Mania - First speculative bubble' },
      { year: 1648, event: 'Independence recognized' },
      { year: 1672, event: 'Rampjaar - French invasion crisis' },
      { year: 1795, event: 'French occupation ends Dutch Republic' },
    ],
    metrics: {
      education: [70, 85, 60],
      innovation: [80, 95, 55],
      competitiveness: [85, 95, 50],
      militaryStrength: [60, 75, 35],
      tradeVolume: [90, 98, 55],
      financialCenter: [85, 98, 50],
      reserveCurrencyStatus: [70, 90, 40],
    }
  },
  {
    id: 'british',
    name: 'Britain',
    fullName: 'British Empire',
    riseStart: 1700,
    peakStart: 1815,
    peakEnd: 1914,
    declineEnd: 1970,
    color: '#012169',
    reserveCurrency: 'British Pound Sterling',
    description: 'The largest empire in history. Industrial Revolution originated here. Pound Sterling was the world\'s reserve currency for over a century.',
    keyEvents: [
      { year: 1694, event: 'Bank of England established' },
      { year: 1760, event: 'Industrial Revolution begins' },
      { year: 1815, event: 'Victory at Waterloo - European dominance' },
      { year: 1860, event: 'Peak of "Workshop of the World"' },
      { year: 1914, event: 'WWI begins - Start of decline' },
      { year: 1944, event: 'Bretton Woods - USD replaces GBP' },
      { year: 1956, event: 'Suez Crisis - End of great power status' },
    ],
    metrics: {
      education: [65, 90, 70],
      innovation: [75, 98, 65],
      competitiveness: [80, 95, 55],
      militaryStrength: [75, 98, 50],
      tradeVolume: [85, 98, 60],
      financialCenter: [80, 98, 70],
      reserveCurrencyStatus: [75, 98, 45],
    }
  },
  {
    id: 'american',
    name: 'United States',
    fullName: 'American Empire',
    riseStart: 1870,
    peakStart: 1945,
    peakEnd: 2000,
    declineEnd: 2100, // Projected
    color: '#3C3B6E',
    reserveCurrency: 'US Dollar',
    description: 'Current global superpower. Dollar became world reserve currency at Bretton Woods (1944). Technological and financial leadership, but showing signs of late-cycle dynamics.',
    keyEvents: [
      { year: 1870, event: 'Post-Civil War industrialization surge' },
      { year: 1913, event: 'Federal Reserve established' },
      { year: 1944, event: 'Bretton Woods - Dollar becomes reserve currency' },
      { year: 1945, event: 'WWII victory - Uncontested superpower' },
      { year: 1971, event: 'Nixon ends gold standard' },
      { year: 1991, event: 'Soviet collapse - Sole superpower' },
      { year: 2008, event: 'Financial Crisis - Beginning of QE era' },
      { year: 2020, event: 'COVID response - Unprecedented monetary expansion' },
    ],
    metrics: {
      education: [70, 95, 75],
      innovation: [80, 98, 85],
      competitiveness: [85, 98, 75],
      militaryStrength: [80, 100, 90],
      tradeVolume: [75, 95, 70],
      financialCenter: [80, 100, 90],
      reserveCurrencyStatus: [70, 100, 85],
    }
  },
  {
    id: 'chinese',
    name: 'China',
    fullName: 'Chinese Rise',
    riseStart: 1978,
    peakStart: 2030, // Projected
    peakEnd: 2080,   // Projected
    declineEnd: 2150, // Projected
    color: '#DE2910',
    reserveCurrency: 'Chinese Yuan (Renminbi)',
    description: 'Rising challenger to US hegemony. World\'s largest economy by PPP. Rapidly advancing in technology, infrastructure, and military capability.',
    keyEvents: [
      { year: 1978, event: 'Deng Xiaoping\'s economic reforms begin' },
      { year: 2001, event: 'WTO membership - Integration into global trade' },
      { year: 2010, event: 'Becomes world\'s second largest economy' },
      { year: 2015, event: 'Yuan added to IMF SDR basket' },
      { year: 2020, event: 'World\'s largest economy by PPP' },
      { year: 2025, event: 'Belt and Road Initiative expansion' },
    ],
    metrics: {
      education: [30, 85, 0], // 0 = not yet in decline
      innovation: [20, 90, 0],
      competitiveness: [25, 92, 0],
      militaryStrength: [35, 85, 0],
      tradeVolume: [40, 95, 0],
      financialCenter: [20, 75, 0],
      reserveCurrencyStatus: [10, 50, 0],
    }
  }
];

// ============================================================================
// HISTORICAL CRISIS DATABASE (Reinhart-Rogoff Framework)
// ============================================================================

export const crisisEvents: CrisisEvent[] = [
  // ==================== 1800s ====================
  {
    id: 'uk-1825-banking',
    year: 1825,
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    type: 'banking',
    severity: 4,
    name: 'Panic of 1825',
    description: 'First modern international financial crisis. Triggered by speculative investments in Latin American bonds and mines.',
    gdpDecline: 5,
    recoveryYears: 3,
    bankFailures: 70,
    causes: ['Latin American speculation', 'Bank of England credit expansion', 'Post-Napoleonic War boom'],
    consequences: ['70+ bank failures', 'Credit contraction', 'Economic recession', 'Bank of England reforms']
  },
  {
    id: 'us-1837-banking',
    year: 1837,
    endYear: 1843,
    country: 'United States',
    countryCode: 'US',
    region: 'Americas',
    type: 'banking',
    severity: 5,
    name: 'Panic of 1837',
    description: 'Major financial crisis leading to a 6-year depression. Caused by speculative lending and Jackson\'s banking policies.',
    gdpDecline: 33,
    recoveryYears: 6,
    bankFailures: 343,
    causes: ['Speculation in western lands', 'Specie Circular', 'Bank of England credit tightening', 'End of Second Bank'],
    consequences: ['343 banks closed', '6-year depression', 'High unemployment', 'State debt defaults']
  },
  {
    id: 'ireland-1845-famine',
    year: 1845,
    endYear: 1852,
    country: 'Ireland',
    countryCode: 'IE',
    region: 'Europe',
    type: 'sovereign_debt',
    severity: 5,
    name: 'Great Irish Famine',
    description: 'Potato blight combined with colonial economic policies led to mass starvation and emigration.',
    gdpDecline: 40,
    recoveryYears: 20,
    causes: ['Potato blight', 'British economic policies', 'Land ownership structure'],
    consequences: ['1 million deaths', '1 million emigrated', 'Population halved', 'Long-term economic devastation']
  },
  {
    id: 'us-1857-banking',
    year: 1857,
    country: 'United States',
    countryCode: 'US',
    region: 'Americas',
    type: 'banking',
    severity: 4,
    name: 'Panic of 1857',
    description: 'First worldwide economic crisis. Triggered by declining international trade and railroad speculation.',
    gdpDecline: 8,
    recoveryYears: 2,
    bankFailures: 900,
    causes: ['Railroad speculation', 'Declining grain prices', 'Ohio Life Insurance failure'],
    consequences: ['5,000 businesses failed', 'High unemployment', 'Western expansion slowdown']
  },
  {
    id: 'us-1873-banking',
    year: 1873,
    endYear: 1879,
    country: 'United States',
    countryCode: 'US',
    region: 'Americas',
    type: 'banking',
    severity: 5,
    name: 'Long Depression (Panic of 1873)',
    description: 'Triggered by Jay Cooke & Company failure. Led to 6-year global depression called the Long Depression.',
    gdpDecline: 15,
    recoveryYears: 6,
    bankFailures: 89,
    causes: ['Railroad overbuilding', 'Post-Civil War speculation', 'Demonetization of silver'],
    consequences: ['18,000 businesses failed', 'Unemployment above 14%', 'Railroad bankruptcies', 'Labor unrest']
  },
  {
    id: 'argentina-1890-debt',
    year: 1890,
    country: 'Argentina',
    countryCode: 'AR',
    region: 'Americas',
    type: 'sovereign_debt',
    severity: 5,
    name: 'Baring Crisis',
    description: 'Argentina defaulted on debt, nearly bringing down Barings Bank and triggering global financial panic.',
    gdpDecline: 17,
    recoveryYears: 5,
    debtToGdp: 80,
    causes: ['Excessive foreign borrowing', 'Land speculation', 'Political instability'],
    consequences: ['Baring Brothers bailout', 'President resignation', 'Capital flight', 'Peso depreciation']
  },
  {
    id: 'us-1893-banking',
    year: 1893,
    endYear: 1897,
    country: 'United States',
    countryCode: 'US',
    region: 'Americas',
    type: 'banking',
    severity: 4,
    name: 'Panic of 1893',
    description: 'Caused by railroad overbuilding and shaky railroad financing. Led to bank runs and severe depression.',
    gdpDecline: 12,
    recoveryYears: 4,
    bankFailures: 500,
    causes: ['Railroad overbuilding', 'Gold standard pressure', 'Philadelphia & Reading bankruptcy'],
    consequences: ['500+ bank failures', '15,000 businesses failed', '18% unemployment', 'Coxey\'s Army march']
  },
  {
    id: 'us-1907-banking',
    year: 1907,
    country: 'United States',
    countryCode: 'US',
    region: 'Americas',
    type: 'banking',
    severity: 4,
    name: 'Panic of 1907',
    description: 'Trust company crisis requiring J.P. Morgan\'s intervention. Led directly to creation of Federal Reserve.',
    gdpDecline: 11,
    recoveryYears: 2,
    bankFailures: 25,
    causes: ['Knickerbocker Trust failure', 'Copper market manipulation', 'Lack of central bank'],
    consequences: ['Stock market fell 50%', 'Bank runs', 'J.P. Morgan bailout', 'Federal Reserve creation (1913)']
  },

  // ==================== 1910s-1920s ====================
  {
    id: 'germany-1923-inflation',
    year: 1921,
    endYear: 1923,
    country: 'Germany',
    countryCode: 'DE',
    region: 'Europe',
    type: 'inflation',
    severity: 5,
    name: 'Weimar Hyperinflation',
    description: 'Most famous hyperinflation in history. Prices doubled every few days at peak. Mark became worthless.',
    peakInflation: 29500,
    currencyDecline: 99.99,
    causes: ['WWI reparations', 'Money printing', 'Ruhr occupation', 'Political instability'],
    consequences: ['Middle class wiped out', 'Political radicalization', 'Currency reform (Rentenmark)', 'Rise of extremism'],
    crisisGeneration: '1st'
  },
  {
    id: 'uk-1925-currency',
    year: 1925,
    endYear: 1931,
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    type: 'currency',
    severity: 3,
    name: 'Return to Gold Standard',
    description: 'Churchill\'s decision to return to pre-war gold parity overvalued the pound, depressing exports.',
    gdpDecline: 5,
    currencyDecline: 25,
    causes: ['Overvalued exchange rate', 'Deflationary policies', 'Coal industry decline'],
    consequences: ['High unemployment', 'General Strike 1926', 'Departure from gold 1931', 'Loss of competitiveness']
  },

  // ==================== Great Depression Era ====================
  {
    id: 'us-1929-stock',
    year: 1929,
    endYear: 1933,
    country: 'United States',
    countryCode: 'US',
    region: 'Americas',
    type: 'stock_market',
    severity: 5,
    name: 'Wall Street Crash / Great Depression',
    description: 'The most severe economic depression of the 20th century. Stock market lost 89% of value.',
    gdpDecline: 30,
    recoveryYears: 10,
    bankFailures: 9000,
    causes: ['Stock speculation', 'Margin buying', 'Fed tightening', 'Smoot-Hawley tariffs'],
    consequences: ['25% unemployment', '9,000 bank failures', 'Global depression', 'New Deal reforms']
  },
  {
    id: 'germany-1931-banking',
    year: 1931,
    country: 'Germany',
    countryCode: 'DE',
    region: 'Europe',
    type: 'banking',
    severity: 5,
    name: 'German Banking Crisis',
    description: 'Major banks failed including Danat Bank. Triggered by Austrian Credit-Anstalt collapse.',
    gdpDecline: 25,
    recoveryYears: 3,
    bankFailures: 100,
    causes: ['Credit-Anstalt contagion', 'Capital flight', 'Reparations burden', 'Deflationary spiral'],
    consequences: ['Bank holiday', 'Capital controls', 'Political instability', 'Rise of Nazi party']
  },
  {
    id: 'austria-1931-banking',
    year: 1931,
    country: 'Austria',
    countryCode: 'AT',
    region: 'Europe',
    type: 'banking',
    severity: 5,
    name: 'Credit-Anstalt Collapse',
    description: 'Austria\'s largest bank failed, triggering bank runs across Central Europe.',
    gdpDecline: 22,
    recoveryYears: 4,
    causes: ['Merger with failed banks', 'Agricultural depression', 'German bank exposure'],
    consequences: ['European banking crisis', 'Capital flight', 'Currency controls', 'Spread to Germany']
  },

  // ==================== Post-WWII Crises ====================
  {
    id: 'uk-1976-currency',
    year: 1976,
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    type: 'currency',
    severity: 3,
    name: 'Sterling Crisis / IMF Bailout',
    description: 'UK forced to seek IMF bailout as pound collapsed. Marked low point of British economic decline.',
    currencyDecline: 25,
    debtToGdp: 65,
    causes: ['High inflation', 'Trade union power', 'Oil crisis', 'Budget deficit'],
    consequences: ['IMF conditions', 'Public spending cuts', 'Thatcher election (1979)', 'Monetarist turn'],
    crisisGeneration: '1st'
  },
  {
    id: 'latam-1982-debt',
    year: 1982,
    endYear: 1989,
    country: 'Mexico',
    countryCode: 'MX',
    region: 'Americas',
    type: 'sovereign_debt',
    severity: 5,
    name: 'Latin American Debt Crisis',
    description: 'Mexico\'s default triggered region-wide debt crisis. "Lost decade" for Latin America.',
    gdpDecline: 5,
    recoveryYears: 7,
    debtToGdp: 85,
    causes: ['Oil price crash', 'US interest rate spike', 'Overborrowing', 'Peso overvaluation'],
    consequences: ['Debt restructuring', 'Lost decade', 'Brady Plan', 'Washington Consensus'],
    crisisGeneration: '1st'
  },
  {
    id: 'us-1987-stock',
    year: 1987,
    country: 'United States',
    countryCode: 'US',
    region: 'Americas',
    type: 'stock_market',
    severity: 3,
    name: 'Black Monday',
    description: 'Largest one-day percentage decline in stock market history. Dow fell 22.6%.',
    gdpDecline: 0,
    recoveryYears: 2,
    causes: ['Program trading', 'Portfolio insurance', 'Trade deficit fears', 'Rising interest rates'],
    consequences: ['Circuit breakers implemented', 'Fed liquidity injection', 'Plunge Protection Team', 'Quick recovery']
  },
  {
    id: 'japan-1990-asset',
    year: 1990,
    endYear: 2003,
    country: 'Japan',
    countryCode: 'JP',
    region: 'Asia',
    type: 'stock_market',
    severity: 5,
    name: 'Japanese Asset Bubble Collapse',
    description: 'Stock and real estate bubble burst, leading to "Lost Decades" of stagnation and deflation.',
    gdpDecline: 2,
    recoveryYears: 13,
    causes: ['Asset bubble', 'BOJ rate hikes', 'Land price speculation', 'Bank overexposure'],
    consequences: ['Lost Decades', 'Deflation', 'Zombie banks', 'Zero interest rates']
  },
  {
    id: 'uk-1992-currency',
    year: 1992,
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    type: 'currency',
    severity: 3,
    name: 'Black Wednesday / ERM Crisis',
    description: 'Soros "broke the Bank of England." UK forced out of Exchange Rate Mechanism.',
    currencyDecline: 15,
    causes: ['Overvalued pound in ERM', 'German unification rates', 'Soros speculation'],
    consequences: ['ERM exit', '£3.3bn losses', 'Inflation targeting adopted', 'Euro skepticism'],
    crisisGeneration: '2nd'
  },
  {
    id: 'mexico-1994-currency',
    year: 1994,
    endYear: 1995,
    country: 'Mexico',
    countryCode: 'MX',
    region: 'Americas',
    type: 'currency',
    severity: 4,
    name: 'Tequila Crisis',
    description: 'Peso collapsed after foreign reserves depleted. Required $50 billion US bailout.',
    gdpDecline: 6,
    recoveryYears: 2,
    currencyDecline: 50,
    causes: ['Current account deficit', 'Political instability', 'Peso peg defense', 'Rising US rates'],
    consequences: ['$50bn bailout', 'Banking crisis', 'Contagion to Latin America', 'Free-floating peso'],
    crisisGeneration: '1st'
  },
  {
    id: 'asia-1997-currency',
    year: 1997,
    endYear: 1998,
    country: 'Thailand',
    countryCode: 'TH',
    region: 'Asia',
    type: 'currency',
    severity: 5,
    name: 'Asian Financial Crisis',
    description: 'Started in Thailand, spread across East Asia. Currencies and stock markets collapsed.',
    gdpDecline: 13,
    recoveryYears: 3,
    currencyDecline: 50,
    causes: ['Pegged currencies', 'Current account deficits', 'Short-term foreign debt', 'Speculation'],
    consequences: ['IMF bailouts', 'Currency floats', 'Suharto overthrow', 'Asian reserves buildup'],
    crisisGeneration: '3rd'
  },
  {
    id: 'russia-1998-debt',
    year: 1998,
    country: 'Russia',
    countryCode: 'RU',
    region: 'Europe',
    type: 'sovereign_debt',
    severity: 5,
    name: 'Russian Financial Crisis',
    description: 'Russia defaulted on domestic debt and devalued ruble. LTCM collapse followed.',
    gdpDecline: 5,
    recoveryYears: 2,
    debtToGdp: 95,
    currencyDecline: 70,
    causes: ['Low oil prices', 'Asian contagion', 'Fiscal deficit', 'GKO pyramid'],
    consequences: ['Debt default', '70% devaluation', 'LTCM bailout', 'Putin rise to power'],
    crisisGeneration: '3rd'
  },
  {
    id: 'argentina-2001-debt',
    year: 2001,
    endYear: 2002,
    country: 'Argentina',
    countryCode: 'AR',
    region: 'Americas',
    type: 'sovereign_debt',
    severity: 5,
    name: 'Argentine Great Depression',
    description: 'Largest sovereign default in history at the time ($93 billion). Peso peg collapsed.',
    gdpDecline: 18,
    recoveryYears: 3,
    debtToGdp: 150,
    currencyDecline: 70,
    causes: ['Currency board rigidity', 'Fiscal deficits', 'Overvaluation', 'Global crisis'],
    consequences: ['$93bn default', 'Corralito bank freeze', '5 presidents in 2 weeks', 'Peso float'],
    crisisGeneration: '3rd'
  },

  // ==================== 2000s Crises ====================
  {
    id: 'us-2000-stock',
    year: 2000,
    endYear: 2002,
    country: 'United States',
    countryCode: 'US',
    region: 'Americas',
    type: 'stock_market',
    severity: 3,
    name: 'Dot-com Bubble Burst',
    description: 'Technology stock bubble burst. NASDAQ fell 78% from peak.',
    gdpDecline: 0.3,
    recoveryYears: 3,
    causes: ['Tech speculation', 'IPO mania', 'Overvaluation', 'Fed tightening'],
    consequences: ['$5 trillion lost', 'Tech sector layoffs', 'Accounting scandals', 'Recession 2001']
  },
  {
    id: 'us-2008-banking',
    year: 2008,
    endYear: 2009,
    country: 'United States',
    countryCode: 'US',
    region: 'Americas',
    type: 'banking',
    severity: 5,
    name: 'Global Financial Crisis',
    description: 'Worst financial crisis since Great Depression. Lehman Brothers collapse triggered global panic.',
    gdpDecline: 4.3,
    recoveryYears: 4,
    bankFailures: 465,
    causes: ['Subprime mortgages', 'CDOs and derivatives', 'Excessive leverage', 'Rating agency failures'],
    consequences: ['$700bn TARP', 'QE begins', 'Dodd-Frank', 'European debt crisis'],
    crisisGeneration: '3rd'
  },
  {
    id: 'iceland-2008-banking',
    year: 2008,
    country: 'Iceland',
    countryCode: 'IS',
    region: 'Europe',
    type: 'banking',
    severity: 5,
    name: 'Icelandic Financial Crisis',
    description: 'All major banks failed. Banking system assets were 10x GDP.',
    gdpDecline: 10,
    recoveryYears: 4,
    currencyDecline: 50,
    causes: ['Bank overexpansion', 'Foreign currency borrowing', 'Asset-liability mismatch'],
    consequences: ['All banks nationalized', 'IMF bailout', 'Capital controls', 'Banker prosecutions'],
    crisisGeneration: '3rd'
  },
  {
    id: 'greece-2010-debt',
    year: 2010,
    endYear: 2018,
    country: 'Greece',
    countryCode: 'GR',
    region: 'Europe',
    type: 'sovereign_debt',
    severity: 5,
    name: 'Greek Debt Crisis',
    description: 'Sovereign debt crisis required multiple EU/IMF bailouts totaling €289 billion.',
    gdpDecline: 25,
    recoveryYears: 8,
    debtToGdp: 180,
    causes: ['Hidden deficits', 'Eurozone rigidity', 'Competitiveness gap', 'Tax evasion'],
    consequences: ['€289bn bailouts', 'Severe austerity', '25% GDP contraction', 'Capital controls']
  },
  {
    id: 'cyprus-2013-banking',
    year: 2013,
    country: 'Cyprus',
    countryCode: 'CY',
    region: 'Europe',
    type: 'banking',
    severity: 4,
    name: 'Cypriot Financial Crisis',
    description: 'Banking crisis led to first-ever bail-in of depositors in Eurozone.',
    gdpDecline: 6,
    recoveryYears: 4,
    causes: ['Greek debt exposure', 'Oversized banking sector', 'Russian deposits'],
    consequences: ['Deposit bail-in', '€10bn bailout', 'Capital controls', 'Banking restructuring']
  },

  // ==================== 2010s-2020s ====================
  {
    id: 'china-2015-stock',
    year: 2015,
    country: 'China',
    countryCode: 'CN',
    region: 'Asia',
    type: 'stock_market',
    severity: 3,
    name: 'Chinese Stock Market Crash',
    description: 'Shanghai Composite fell 40%. Government intervention to stabilize markets.',
    gdpDecline: 0,
    causes: ['Margin trading explosion', 'Retail speculation', 'Government encouragement'],
    consequences: ['$5 trillion lost', 'Trading halts', 'Yuan devaluation', 'Capital outflows']
  },
  {
    id: 'venezuela-2016-inflation',
    year: 2016,
    endYear: 2024,
    country: 'Venezuela',
    countryCode: 'VE',
    region: 'Americas',
    type: 'inflation',
    severity: 5,
    name: 'Venezuelan Hyperinflation',
    description: 'Ongoing hyperinflation with peak rates over 1 million percent annually.',
    gdpDecline: 75,
    peakInflation: 1000000,
    currencyDecline: 99.99,
    causes: ['Oil price collapse', 'Money printing', 'Price controls', 'Sanctions'],
    consequences: ['Mass emigration', 'Humanitarian crisis', 'Dollarization', 'Regime crisis']
  },
  {
    id: 'turkey-2018-currency',
    year: 2018,
    country: 'Turkey',
    countryCode: 'TR',
    region: 'Europe',
    type: 'currency',
    severity: 4,
    name: 'Turkish Currency Crisis',
    description: 'Lira lost 40% of value amid concerns over central bank independence.',
    currencyDecline: 40,
    peakInflation: 25,
    causes: ['Current account deficit', 'Foreign currency debt', 'Political interference', 'US sanctions'],
    consequences: ['Emergency rate hikes', 'Inflation surge', 'Recession', 'Ongoing instability'],
    crisisGeneration: '3rd'
  },
  {
    id: 'argentina-2018-currency',
    year: 2018,
    country: 'Argentina',
    countryCode: 'AR',
    region: 'Americas',
    type: 'currency',
    severity: 4,
    name: 'Argentine Currency Crisis',
    description: 'Peso lost 50% of value. Required $57 billion IMF bailout.',
    currencyDecline: 50,
    peakInflation: 54,
    debtToGdp: 86,
    causes: ['Fiscal deficit', 'Rising US rates', 'Inflation', 'Capital flight'],
    consequences: ['$57bn IMF deal', 'Austerity measures', 'Continued instability', 'Default 2020']
  },
  {
    id: 'global-2020-pandemic',
    year: 2020,
    country: 'Global',
    countryCode: 'WORLD',
    region: 'Global',
    type: 'stock_market',
    severity: 4,
    name: 'COVID-19 Market Crash',
    description: 'Fastest 30% decline in history. Unprecedented monetary and fiscal response.',
    gdpDecline: 3.1,
    recoveryYears: 1,
    causes: ['COVID-19 pandemic', 'Lockdowns', 'Supply chain disruption', 'Demand collapse'],
    consequences: ['Unprecedented stimulus', 'Fed QE infinity', 'Zero rates globally', 'Inflation surge']
  },
  {
    id: 'uk-2022-gilts',
    year: 2022,
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'Europe',
    type: 'sovereign_debt',
    severity: 3,
    name: 'UK Gilt Crisis',
    description: 'Mini-budget triggered gilt market crisis, requiring BoE intervention.',
    currencyDecline: 10,
    causes: ['Unfunded tax cuts', 'Pension fund leverage', 'Rising rates', 'Market confidence'],
    consequences: ['BoE intervention', 'Prime Minister resignation', 'Budget reversal', 'Pension reforms']
  },
  {
    id: 'us-2023-banking',
    year: 2023,
    country: 'United States',
    countryCode: 'US',
    region: 'Americas',
    type: 'banking',
    severity: 3,
    name: 'Regional Banking Crisis',
    description: 'SVB, Signature, and First Republic failures. Largest bank failures since 2008.',
    bankFailures: 4,
    causes: ['Rising interest rates', 'HTM portfolio losses', 'Uninsured deposits', 'Bank run via social media'],
    consequences: ['FDIC takeovers', 'Fed BTFP facility', 'Deposit guarantees', 'Regulatory review']
  }
];

// ============================================================================
// DEBT CYCLE PHASES
// ============================================================================

export const debtCyclePhases: DebtCyclePhase[] = [
  // Long-term debt cycle (post-WWII to present)
  {
    id: 'postwar-recovery',
    name: 'Post-War Recovery',
    startYear: 1945,
    endYear: 1965,
    cycleType: 'long_term',
    phase: 'early',
    description: 'Post-WWII reconstruction. Low debt, rising productivity, strong growth.',
    characteristics: [
      'Government debt declining from WWII highs',
      'Strong productivity growth',
      'Rising middle class',
      'Gold-backed dollar (Bretton Woods)',
      'Fiscal discipline'
    ],
    interestRateTrend: 'low',
    debtTrend: 'falling',
    assetPrices: 'rising'
  },
  {
    id: 'great-moderation-start',
    name: 'Expansion Era',
    startYear: 1965,
    endYear: 1980,
    cycleType: 'long_term',
    phase: 'bubble',
    description: 'Vietnam War spending, Great Society programs. Inflation rising.',
    characteristics: [
      'Rising government spending',
      'Vietnam War fiscal expansion',
      'Nixon ends gold standard (1971)',
      'Oil shocks',
      'Stagflation'
    ],
    interestRateTrend: 'rising',
    debtTrend: 'rising',
    assetPrices: 'stable'
  },
  {
    id: 'volcker-era',
    name: 'Volcker Shock',
    startYear: 1980,
    endYear: 1982,
    cycleType: 'long_term',
    phase: 'top',
    description: 'Fed raises rates to 20% to break inflation. Severe recession.',
    characteristics: [
      'Fed funds rate hits 20%',
      'Deep recession',
      'Inflation broken',
      'Dollar strength',
      'LatAm debt crisis triggered'
    ],
    interestRateTrend: 'high',
    debtTrend: 'stable',
    assetPrices: 'falling'
  },
  {
    id: 'great-moderation',
    name: 'Great Moderation',
    startYear: 1982,
    endYear: 2007,
    cycleType: 'long_term',
    phase: 'normalization',
    description: 'Long expansion with falling rates, rising asset prices, increasing private debt.',
    characteristics: [
      '25-year bull market in bonds',
      'Disinflation',
      'Financial deregulation',
      'Credit expansion',
      'Housing boom'
    ],
    interestRateTrend: 'falling',
    debtTrend: 'rising',
    assetPrices: 'rising'
  },
  {
    id: 'gfc-deleveraging',
    name: 'Financial Crisis & QE Era',
    startYear: 2008,
    endYear: 2019,
    cycleType: 'long_term',
    phase: 'deleveraging',
    description: 'Private sector deleveraging, public sector debt expansion, QE.',
    characteristics: [
      'Zero interest rates',
      'Quantitative easing',
      'Government debt surge',
      'Slow recovery',
      'Low inflation puzzle'
    ],
    interestRateTrend: 'low',
    debtTrend: 'rising',
    assetPrices: 'rising'
  },
  {
    id: 'pandemic-response',
    name: 'Pandemic Response',
    startYear: 2020,
    endYear: 2022,
    cycleType: 'long_term',
    phase: 'depression',
    description: 'Unprecedented monetary and fiscal stimulus in response to COVID-19.',
    characteristics: [
      'Unlimited QE',
      'Direct fiscal transfers',
      'Debt explosion',
      'Supply chain crisis',
      'Inflation surge'
    ],
    interestRateTrend: 'low',
    debtTrend: 'rising',
    assetPrices: 'rising'
  },
  {
    id: 'rate-normalization',
    name: 'Rate Normalization',
    startYear: 2022,
    endYear: 2026,
    cycleType: 'long_term',
    phase: 'top',
    description: 'Fastest rate hike cycle in decades to combat inflation.',
    characteristics: [
      'Fastest rate hikes since 1980s',
      'QT (balance sheet reduction)',
      'Banking stress',
      'Debt servicing strain',
      'Inflation moderating'
    ],
    interestRateTrend: 'high',
    debtTrend: 'stable',
    assetPrices: 'falling'
  },

  // Short-term business cycles (selected recent ones)
  {
    id: 'dotcom-recession',
    name: 'Dot-com Recession',
    startYear: 2001,
    endYear: 2001,
    cycleType: 'short_term',
    phase: 'depression',
    description: 'Mild recession following tech bubble burst and 9/11.',
    characteristics: ['Tech bubble burst', 'Business investment decline', '9/11 shock', 'Fed rate cuts'],
    interestRateTrend: 'falling',
    debtTrend: 'stable',
    assetPrices: 'falling'
  },
  {
    id: 'housing-boom',
    name: 'Housing Boom',
    startYear: 2003,
    endYear: 2006,
    cycleType: 'short_term',
    phase: 'bubble',
    description: 'Housing bubble fueled by low rates and subprime lending.',
    characteristics: ['Housing prices surge', 'Subprime expansion', 'CDO boom', 'Low volatility'],
    interestRateTrend: 'rising',
    debtTrend: 'rising',
    assetPrices: 'rising'
  },
  {
    id: 'great-recession',
    name: 'Great Recession',
    startYear: 2007,
    endYear: 2009,
    cycleType: 'short_term',
    phase: 'depression',
    description: 'Worst recession since Great Depression triggered by housing crash.',
    characteristics: ['Housing crash', 'Bank failures', 'Credit freeze', 'Unemployment surge'],
    interestRateTrend: 'falling',
    debtTrend: 'falling',
    assetPrices: 'falling'
  },
  {
    id: 'recovery-2010s',
    name: 'Post-Crisis Recovery',
    startYear: 2010,
    endYear: 2019,
    cycleType: 'short_term',
    phase: 'normalization',
    description: 'Slow but steady recovery from Great Recession.',
    characteristics: ['Slow growth', 'Job recovery', 'Low inflation', 'Stock market boom'],
    interestRateTrend: 'low',
    debtTrend: 'stable',
    assetPrices: 'rising'
  },
  {
    id: 'covid-recession',
    name: 'COVID Recession',
    startYear: 2020,
    endYear: 2020,
    cycleType: 'short_term',
    phase: 'depression',
    description: 'Shortest but deepest recession on record.',
    characteristics: ['Lockdown shock', 'Service sector collapse', 'Massive stimulus', 'V-shaped recovery'],
    interestRateTrend: 'falling',
    debtTrend: 'rising',
    assetPrices: 'falling'
  },
  {
    id: 'inflation-era',
    name: 'Inflation Era',
    startYear: 2021,
    endYear: 2023,
    cycleType: 'short_term',
    phase: 'bubble',
    description: 'Post-pandemic boom with highest inflation in 40 years.',
    characteristics: ['Inflation surge', 'Tight labor market', 'Asset inflation', 'Rate hikes begin'],
    interestRateTrend: 'rising',
    debtTrend: 'stable',
    assetPrices: 'stable'
  }
];

// ============================================================================
// CYCLE INDICATORS FOR CURRENT ASSESSMENT
// ============================================================================

export const cycleIndicators: CycleIndicator[] = [
  {
    name: 'US Debt-to-GDP',
    currentValue: 123,
    historicalAverage: 65,
    precrisisAverage: 95,
    warningThreshold: 90,
    dangerThreshold: 120,
    unit: '%',
    interpretation: 'Government debt relative to economic output'
  },
  {
    name: 'Private Debt-to-GDP',
    currentValue: 150,
    historicalAverage: 120,
    precrisisAverage: 160,
    warningThreshold: 150,
    dangerThreshold: 180,
    unit: '%',
    interpretation: 'Household and corporate debt relative to GDP'
  },
  {
    name: 'Real Interest Rate',
    currentValue: 2.0,
    historicalAverage: 2.5,
    precrisisAverage: 1.5,
    warningThreshold: -1,
    dangerThreshold: -2,
    unit: '%',
    interpretation: 'Interest rate minus inflation'
  },
  {
    name: 'Yield Curve Spread',
    currentValue: 0.5,
    historicalAverage: 1.5,
    precrisisAverage: 0.2,
    warningThreshold: 0,
    dangerThreshold: -0.5,
    unit: '%',
    interpretation: '10Y Treasury minus 2Y Treasury yield'
  },
  {
    name: 'Unemployment Rate',
    currentValue: 4.2,
    historicalAverage: 5.8,
    precrisisAverage: 4.5,
    warningThreshold: 4.5,
    dangerThreshold: 6,
    unit: '%',
    interpretation: 'Percentage of labor force unemployed'
  },
  {
    name: 'Inflation Rate',
    currentValue: 3.2,
    historicalAverage: 3.0,
    precrisisAverage: 2.5,
    warningThreshold: 4,
    dangerThreshold: 6,
    unit: '%',
    interpretation: 'Annual change in consumer prices'
  },
  {
    name: 'Stock Market Valuation (CAPE)',
    currentValue: 32,
    historicalAverage: 17,
    precrisisAverage: 28,
    warningThreshold: 25,
    dangerThreshold: 35,
    unit: 'ratio',
    interpretation: 'Cyclically Adjusted Price-to-Earnings ratio'
  },
  {
    name: 'Credit Spreads',
    currentValue: 1.5,
    historicalAverage: 2.0,
    precrisisAverage: 1.0,
    warningThreshold: 1.5,
    dangerThreshold: 3.0,
    unit: '%',
    interpretation: 'Corporate bond yields minus Treasury yields'
  },
  {
    name: 'Current Account Balance',
    currentValue: -3.0,
    historicalAverage: -2.5,
    precrisisAverage: -4.5,
    warningThreshold: -4,
    dangerThreshold: -6,
    unit: '% GDP',
    interpretation: 'Trade balance plus investment income'
  },
  {
    name: 'Bank Leverage Ratio',
    currentValue: 12,
    historicalAverage: 15,
    precrisisAverage: 25,
    warningThreshold: 20,
    dangerThreshold: 30,
    unit: 'x',
    interpretation: 'Assets divided by equity'
  }
];

// ============================================================================
// CRISIS GENERATION MODELS (Handbook of International Economics)
// ============================================================================

export const crisisGenerationModels: CrisisGenerationModel[] = [
  {
    generation: '1st',
    name: 'Fundamental-Based Crisis Model',
    theorists: ['Paul Krugman'],
    year: 1979,
    mechanism: 'Unsustainable fiscal policies lead to reserve depletion and speculative attacks on currency pegs.',
    description: 'First-generation models show how governments running persistent fiscal deficits and monetizing debt will eventually exhaust foreign reserves defending a fixed exchange rate. Rational speculators, anticipating the collapse, attack the currency before reserves run out, precipitating the crisis.',
    keyIndicators: [
      'Fiscal deficit / GDP ratio',
      'Foreign reserve levels',
      'Money supply growth rate',
      'Current account balance',
      'Government debt monetization'
    ],
    historicalExamples: [
      'Mexico 1982 (Latin American Debt Crisis)',
      'Argentina 1890 (Baring Crisis)',
      'UK 1976 (Sterling Crisis)',
      'Venezuela 2016-present'
    ],
    warningSignals: [
      'Persistent budget deficits above 5% of GDP',
      'Rapid reserve depletion',
      'Central bank financing of government',
      'Widening current account deficit',
      'Parallel market exchange rate premium'
    ]
  },
  {
    generation: '2nd',
    name: 'Self-Fulfilling Crisis Model',
    theorists: ['Maurice Obstfeld', 'Olivier Jeanne'],
    year: 1994,
    mechanism: 'Multiple equilibria allow self-fulfilling speculative attacks even with sound fundamentals, when policy trade-offs create vulnerability.',
    description: 'Second-generation models demonstrate that even countries with reasonable fundamentals can face currency crises if market expectations coordinate on an attack. The government faces trade-offs (e.g., unemployment vs. defending the peg) that make abandoning the peg optimal once attacked.',
    keyIndicators: [
      'Unemployment rate',
      'Interest rate differentials',
      'Political stability index',
      'Public debt service costs',
      'Market sentiment indicators'
    ],
    historicalExamples: [
      'UK 1992 (ERM Crisis / Black Wednesday)',
      'France 1992-1993 (ERM attacks)',
      'Sweden 1992 (Krona defense)',
      'Denmark 1993 (ERM pressure)'
    ],
    warningSignals: [
      'High unemployment creating political pressure',
      'Rising interest rate defense costs',
      'Speculative positioning in futures markets',
      'Political statements questioning commitment',
      'Contagion from neighboring countries'
    ]
  },
  {
    generation: '3rd',
    name: 'Balance Sheet Crisis Model',
    theorists: ['Paul Krugman', 'Roberto Chang', 'Andres Velasco'],
    year: 1999,
    mechanism: 'Currency and maturity mismatches on balance sheets create vulnerability to capital flow reversals and twin banking-currency crises.',
    description: 'Third-generation models emphasize how currency depreciation devastates balance sheets when banks, corporations, or governments have borrowed in foreign currency. The resulting credit crunch creates feedback loops between currency collapse and banking crises - the "twin crisis" phenomenon.',
    keyIndicators: [
      'Foreign currency debt / Total debt ratio',
      'Short-term external debt / Reserves',
      'Corporate foreign currency exposure',
      'Banking sector leverage',
      'Loan-to-deposit ratio'
    ],
    historicalExamples: [
      'Thailand 1997 (Asian Financial Crisis origin)',
      'Indonesia 1997-1998',
      'Korea 1997-1998',
      'Russia 1998',
      'Argentina 2001-2002',
      'Iceland 2008'
    ],
    warningSignals: [
      'Rapid credit growth in foreign currency',
      'Short-term debt exceeds reserves',
      'Currency mismatch on corporate balance sheets',
      'Banking sector asset-liability mismatch',
      'Rapid appreciation followed by sudden reversal'
    ]
  }
];

// ============================================================================
// CAPITAL FLOW EVENTS (Calvo Framework)
// ============================================================================

export const capitalFlowEvents: CapitalFlowEvent[] = [
  // Major Sudden Stops
  {
    id: 'mexico-1982-stop',
    type: 'sudden_stop',
    country: 'Mexico',
    countryCode: 'MX',
    year: 1982,
    magnitude: -8.5,
    triggers: ['US interest rate spike', 'Oil price decline', 'Debt servicing fears'],
    consequences: ['Debt default', 'Peso devaluation', 'Banking crisis', 'Lost decade begins'],
    description: 'The original "sudden stop" that triggered the Latin American debt crisis. Capital inflows reversed abruptly as US rates rose.',
    relatedCrisis: 'latam-1982-debt'
  },
  {
    id: 'mexico-1994-stop',
    type: 'sudden_stop',
    country: 'Mexico',
    countryCode: 'MX',
    year: 1994,
    endYear: 1995,
    magnitude: -7.2,
    triggers: ['Political instability', 'Rising US rates', 'Peso overvaluation', 'Reserve depletion'],
    consequences: ['Tequila Crisis', '50% peso devaluation', '$50bn bailout', 'Contagion to EM'],
    description: 'Classic sudden stop with $20bn capital outflow in weeks. Coined the term "Tequila Effect" for EM contagion.',
    relatedCrisis: 'mexico-1994-currency'
  },
  {
    id: 'thailand-1997-stop',
    type: 'sudden_stop',
    country: 'Thailand',
    countryCode: 'TH',
    year: 1997,
    magnitude: -12.8,
    triggers: ['Property bubble burst', 'Export slowdown', 'Short-term debt exposure', 'Baht speculation'],
    consequences: ['Baht float', 'Banking collapse', 'IMF bailout', 'Regional contagion'],
    description: 'Triggered the Asian Financial Crisis. Foreign investors fled en masse from short-term positions.',
    relatedCrisis: 'asia-1997-currency'
  },
  {
    id: 'korea-1997-stop',
    type: 'sudden_stop',
    country: 'South Korea',
    countryCode: 'KR',
    year: 1997,
    magnitude: -11.5,
    triggers: ['Asian contagion', 'Chaebol debt', 'Short-term bank borrowing', 'Reserve exhaustion'],
    consequences: ['Won collapse', 'IMF restructuring', 'Corporate reforms', 'Banking consolidation'],
    description: 'Korea\'s short-term external debt was 3x reserves. International banks refused to roll over loans.',
    relatedCrisis: 'asia-1997-currency'
  },
  {
    id: 'russia-1998-stop',
    type: 'sudden_stop',
    country: 'Russia',
    countryCode: 'RU',
    year: 1998,
    magnitude: -9.3,
    triggers: ['Asian contagion', 'Oil price collapse', 'GKO pyramid scheme', 'Political instability'],
    consequences: ['Debt default', 'Ruble devaluation', 'LTCM collapse', 'EM flight'],
    description: 'Combination of Asian crisis contagion and domestic fiscal problems triggered capital flight.',
    relatedCrisis: 'russia-1998-debt'
  },
  {
    id: 'argentina-2001-stop',
    type: 'sudden_stop',
    country: 'Argentina',
    countryCode: 'AR',
    year: 2001,
    magnitude: -15.2,
    triggers: ['Currency board rigidity', 'Fiscal deficit', 'Brazil devaluation', 'Global risk aversion'],
    consequences: ['$93bn default', 'Corralito', 'Peso collapse', 'Economic depression'],
    description: 'One of largest sudden stops in history. Capital outflows forced abandonment of currency board.',
    relatedCrisis: 'argentina-2001-debt'
  },
  {
    id: 'global-2008-stop',
    type: 'sudden_stop',
    country: 'Global (EM)',
    countryCode: 'WORLD',
    year: 2008,
    endYear: 2009,
    magnitude: -6.8,
    triggers: ['Lehman collapse', 'Global deleveraging', 'Risk aversion spike', 'Credit freeze'],
    consequences: ['EM currency collapses', 'Trade finance shortage', 'Coordinated intervention', 'Fed swap lines'],
    description: 'Synchronized global sudden stop affecting all emerging markets. Fed established swap lines to provide dollar liquidity.',
    relatedCrisis: 'us-2008-banking'
  },
  {
    id: 'turkey-2018-stop',
    type: 'sudden_stop',
    country: 'Turkey',
    countryCode: 'TR',
    year: 2018,
    magnitude: -5.4,
    triggers: ['Policy credibility loss', 'High foreign currency debt', 'US sanctions', 'Political interference'],
    consequences: ['Lira crash', 'Inflation surge', 'Corporate distress', 'Capital controls'],
    description: 'Modern example of sudden stop triggered by policy concerns and external pressures.',
    relatedCrisis: 'turkey-2018-currency'
  },

  // Capital Bonanzas
  {
    id: 'latam-1990s-bonanza',
    type: 'capital_bonanza',
    country: 'Latin America',
    countryCode: 'LATAM',
    year: 1990,
    endYear: 1994,
    magnitude: 5.2,
    triggers: ['Brady Plan success', 'Privatizations', 'US low rates', 'Washington Consensus'],
    consequences: ['Asset price boom', 'Currency appreciation', 'Current account deficits', 'Set up for crisis'],
    description: 'Massive capital inflows post-debt restructuring created vulnerabilities exploited in Tequila Crisis.'
  },
  {
    id: 'asia-1990s-bonanza',
    type: 'capital_bonanza',
    country: 'East Asia',
    countryCode: 'ASIA',
    year: 1990,
    endYear: 1996,
    magnitude: 7.8,
    triggers: ['High growth rates', 'Financial liberalization', 'Pegged currencies', 'Japanese investment'],
    consequences: ['Credit boom', 'Property bubble', 'Currency appreciation', 'Building crisis vulnerabilities'],
    description: 'East Asian Miracle attracted massive inflows, creating the conditions for 1997 crisis.'
  },
  {
    id: 'em-2010s-bonanza',
    type: 'capital_bonanza',
    country: 'Emerging Markets',
    countryCode: 'EM',
    year: 2009,
    endYear: 2013,
    magnitude: 4.5,
    triggers: ['QE in developed markets', 'Zero interest rates', 'Yield seeking', 'EM growth premium'],
    consequences: ['EM currency appreciation', 'Bond market boom', 'Carry trade expansion', 'Taper tantrum setup'],
    description: 'Post-GFC QE drove "search for yield" into emerging markets, reversed during 2013 Taper Tantrum.'
  },

  // Flight to Safety Events
  {
    id: 'gfc-2008-flight',
    type: 'flight_to_safety',
    country: 'United States',
    countryCode: 'US',
    year: 2008,
    magnitude: 8.5,
    triggers: ['Lehman collapse', 'Global panic', 'Deleveraging', 'USD as safe haven'],
    consequences: ['USD surge', 'Treasury yields plunge', 'EM capital outflows', 'Dollar shortage'],
    description: 'Despite US being crisis epicenter, global flight to safety drove massive USD appreciation.'
  },
  {
    id: 'euro-crisis-flight',
    type: 'flight_to_safety',
    country: 'Germany',
    countryCode: 'DE',
    year: 2011,
    endYear: 2012,
    magnitude: 6.2,
    triggers: ['Eurozone debt crisis', 'Greece concerns', 'Euro breakup fears', 'Safe asset demand'],
    consequences: ['Bund yields to 0%', 'TARGET2 imbalances', 'Peripheral spreads spike', 'ECB intervention'],
    description: 'Capital fled peripheral Eurozone to German Bunds, creating massive imbalances.'
  },
  {
    id: 'covid-2020-flight',
    type: 'flight_to_safety',
    country: 'United States',
    countryCode: 'US',
    year: 2020,
    magnitude: 7.1,
    triggers: ['COVID-19 pandemic', 'Global lockdowns', 'Risk asset collapse', 'Liquidity crisis'],
    consequences: ['USD spike', 'Treasury rally', 'EM outflows', 'Fed swap lines activated'],
    description: 'Fastest flight to safety in history. Fed expanded swap lines to 14 central banks.'
  }
];

// ============================================================================
// EXCHANGE RATE FRAMEWORKS
// ============================================================================

export const exchangeRateConcepts: ExchangeRateConcept[] = [
  {
    id: 'overshooting',
    name: 'Dornbusch Overshooting Model',
    theorist: 'Rudiger Dornbusch',
    year: 1976,
    description: 'Exchange rates overshoot their long-run equilibrium in response to monetary shocks because goods prices adjust slowly while asset prices adjust instantly.',
    mechanism: 'When money supply increases, interest rates fall immediately. Capital outflows cause instant currency depreciation beyond PPP equilibrium. As prices slowly adjust upward, currency appreciates back toward equilibrium.',
    formula: 'Δe = (1 + λ/θ) × Δm, where λ = interest rate semi-elasticity, θ = price adjustment speed',
    implications: [
      'Exchange rates more volatile than fundamentals suggest',
      'Initial depreciation exceeds long-run depreciation',
      'Monetary policy has real effects in short run',
      'Sticky prices create exchange rate dynamics'
    ],
    empiricalEvidence: 'Strong support for overshooting in response to monetary surprises. Dollar movements in 1980s consistent with model predictions.'
  },
  {
    id: 'ppp',
    name: 'Purchasing Power Parity',
    theorist: 'Gustav Cassel',
    year: 1918,
    description: 'Exchange rates adjust to equalize the price of identical goods across countries. In the long run, real exchange rates should be stable.',
    mechanism: 'If prices rise faster in country A than country B, country A\'s currency must depreciate to maintain competitiveness. Arbitrage in tradeable goods enforces this relationship.',
    formula: 'e = P / P*, where P = domestic price level, P* = foreign price level',
    implications: [
      'Long-run anchor for exchange rates',
      'Deviations create competitiveness pressures',
      'Real exchange rate misalignment signals adjustment needed',
      'Inflation differentials predict currency movements'
    ],
    empiricalEvidence: 'Holds well over very long horizons (decades) but large persistent deviations in short-to-medium term. Half-life of PPP deviations is 3-5 years.'
  },
  {
    id: 'uip',
    name: 'Uncovered Interest Parity',
    theorist: 'Various economists',
    year: 1970,
    description: 'Expected exchange rate changes should offset interest rate differentials between countries, eliminating risk-free arbitrage opportunities.',
    mechanism: 'If country A has higher interest rates than B, A\'s currency should be expected to depreciate by the interest differential. Otherwise, unlimited arbitrage profits would be possible.',
    formula: 'E[Δe] = i - i*, where i = domestic rate, i* = foreign rate',
    implications: [
      'Carry trade should not be profitable on average',
      'High-yield currencies should depreciate',
      'Interest differentials predict currency movements',
      'Risk premiums explain deviations'
    ],
    empiricalEvidence: 'Consistently violated empirically - the "forward premium puzzle." High-yield currencies tend to appreciate, not depreciate. Carry trades profitable.'
  },
  {
    id: 'impossible-trinity',
    name: 'Impossible Trinity (Mundell-Fleming Trilemma)',
    theorist: 'Robert Mundell, Marcus Fleming',
    year: 1962,
    description: 'A country cannot simultaneously maintain a fixed exchange rate, free capital mobility, and independent monetary policy - only two of three are possible.',
    mechanism: 'With fixed rates and free capital flows, any interest rate deviation causes capital flows that force intervention. Sterilized intervention depletes reserves; unsterilized surrenders monetary independence.',
    implications: [
      'Fixed rate + free capital = no monetary autonomy (Hong Kong)',
      'Fixed rate + monetary autonomy = capital controls (China pre-2015)',
      'Free capital + monetary autonomy = floating rate (US, UK)',
      'Policy regime choice determines crisis vulnerability'
    ],
    empiricalEvidence: 'Asian Crisis (1997), ERM Crisis (1992) demonstrate impossibility of maintaining all three. Countries forced to choose.'
  },
  {
    id: 'real-exchange-rate',
    name: 'Real Effective Exchange Rate',
    theorist: 'Various economists',
    year: 1970,
    description: 'Trade-weighted nominal exchange rate adjusted for relative price levels. Measures true international competitiveness.',
    mechanism: 'REER = NEER × (P_domestic / P_foreign). Appreciation means loss of competitiveness; depreciation means gain. Sustainable current accounts require stable REER.',
    formula: 'REER = Σwi × (e_i × P / P_i), where w = trade weights',
    implications: [
      'Key indicator of currency misalignment',
      'Guides assessment of external sustainability',
      'Large deviations signal adjustment pressure',
      'Important for emerging market monitoring'
    ],
    empiricalEvidence: 'REER appreciation of 25%+ often precedes currency crises. IMF uses REER models for exchange rate assessment.'
  }
];

// ============================================================================
// DEBT VULNERABILITY CONCEPTS
// ============================================================================

export const debtVulnerabilityConcepts: DebtVulnerability[] = [
  {
    id: 'debt-intolerance',
    concept: 'debt_intolerance',
    name: 'Debt Intolerance',
    theorists: ['Carmen Reinhart', 'Kenneth Rogoff', 'Miguel Savastano'],
    description: 'Many emerging markets face debt crises at debt-to-GDP levels that developed countries easily sustain. History of default creates persistent vulnerability.',
    mechanism: 'Countries with history of default, inflation, or restructuring face higher risk premiums and lower debt tolerance. Market trust, once lost, is hard to regain. "Serial defaulters" include Argentina, Venezuela, Ecuador.',
    affectedCountries: ['Argentina', 'Venezuela', 'Ecuador', 'Greece', 'Pakistan', 'Sri Lanka'],
    indicators: [
      'Historical default count',
      'Current debt-to-GDP ratio',
      'Credit rating history',
      'Spread over US Treasuries',
      'IMF program history'
    ],
    currentRelevance: 'Many EM countries approaching debt intolerance thresholds post-COVID. Sri Lanka 2022 default demonstrates continued relevance.',
    riskLevel: 'high'
  },
  {
    id: 'original-sin',
    concept: 'original_sin',
    name: 'Original Sin',
    theorists: ['Barry Eichengreen', 'Ricardo Hausmann', 'Ugo Panizza'],
    description: 'Inability of developing countries to borrow internationally in their own currency. Forces reliance on foreign currency debt, creating balance sheet vulnerabilities.',
    mechanism: 'Emerging market currencies not trusted for long-term contracts. Must borrow in USD, EUR, JPY. Currency depreciation then increases debt burden, creating vicious circle. "You cannot redeem yourself from original sin."',
    affectedCountries: ['Most emerging markets', 'Turkey', 'Argentina', 'South Africa', 'Indonesia', 'Brazil'],
    indicators: [
      'Foreign currency debt share',
      'External debt composition',
      'Local bond market depth',
      'Currency hedging costs',
      'Dollarization level'
    ],
    currentRelevance: 'Some progress in local currency bond markets, but EM corporate dollar debt has surged. Total EM FX debt estimated at $4 trillion+.',
    riskLevel: 'high'
  },
  {
    id: 'safe-haven',
    concept: 'safe_haven',
    name: 'Safe Haven Status',
    theorists: ['Robert Aliber', 'Charles Kindleberger'],
    description: 'Reserve currency issuers (US, Germany, Japan, Switzerland) benefit from flight-to-safety inflows during crises, allowing higher debt tolerance.',
    mechanism: 'During global stress, capital flows TO safe havens, not away. This lowers borrowing costs precisely when governments need to stimulate. "Exorbitant privilege" allows deficit financing at low rates.',
    affectedCountries: ['United States', 'Germany', 'Japan', 'Switzerland', 'United Kingdom'],
    indicators: [
      'Reserve currency status',
      'Currency behavior in crises',
      'Government bond yields during stress',
      'Foreign official holdings',
      'Financial market depth'
    ],
    currentRelevance: 'USD remains dominant safe haven. Question is whether this status is permanent or could shift with de-dollarization trends.',
    riskLevel: 'low'
  }
];

// ============================================================================
// COUNTRY DEBT PROFILES
// ============================================================================

export const countryDebtProfiles: CountryDebtProfile[] = [
  // Safe Haven Countries (Reserve Currency Issuers)
  {
    countryCode: 'US',
    country: 'United States',
    debtIntolerance: 5,
    originalSinIndex: 0,
    safeHavenStatus: true,
    reserveCurrencyIssuer: true,
    currentDebtToGdp: 123,
    externalDebtShare: 35,
    foreignCurrencyDebtShare: 0,
    vulnerabilityScore: 15
  },
  {
    countryCode: 'DE',
    country: 'Germany',
    debtIntolerance: 10,
    originalSinIndex: 0,
    safeHavenStatus: true,
    reserveCurrencyIssuer: true,
    currentDebtToGdp: 66,
    externalDebtShare: 45,
    foreignCurrencyDebtShare: 0,
    vulnerabilityScore: 12
  },
  {
    countryCode: 'JP',
    country: 'Japan',
    debtIntolerance: 15,
    originalSinIndex: 5,
    safeHavenStatus: true,
    reserveCurrencyIssuer: true,
    currentDebtToGdp: 263,
    externalDebtShare: 15,
    foreignCurrencyDebtShare: 5,
    vulnerabilityScore: 25
  },
  {
    countryCode: 'GB',
    country: 'United Kingdom',
    debtIntolerance: 15,
    originalSinIndex: 5,
    safeHavenStatus: true,
    reserveCurrencyIssuer: true,
    currentDebtToGdp: 101,
    externalDebtShare: 40,
    foreignCurrencyDebtShare: 5,
    vulnerabilityScore: 20
  },
  {
    countryCode: 'CH',
    country: 'Switzerland',
    debtIntolerance: 5,
    originalSinIndex: 0,
    safeHavenStatus: true,
    reserveCurrencyIssuer: false,
    currentDebtToGdp: 41,
    externalDebtShare: 50,
    foreignCurrencyDebtShare: 0,
    vulnerabilityScore: 8
  },

  // Moderate Vulnerability Countries
  {
    countryCode: 'CN',
    country: 'China',
    debtIntolerance: 35,
    originalSinIndex: 20,
    safeHavenStatus: false,
    reserveCurrencyIssuer: false,
    currentDebtToGdp: 77,
    externalDebtShare: 15,
    foreignCurrencyDebtShare: 15,
    vulnerabilityScore: 35
  },
  {
    countryCode: 'IN',
    country: 'India',
    debtIntolerance: 40,
    originalSinIndex: 35,
    safeHavenStatus: false,
    reserveCurrencyIssuer: false,
    currentDebtToGdp: 83,
    externalDebtShare: 20,
    foreignCurrencyDebtShare: 50,
    vulnerabilityScore: 42
  },
  {
    countryCode: 'BR',
    country: 'Brazil',
    debtIntolerance: 55,
    originalSinIndex: 45,
    safeHavenStatus: false,
    reserveCurrencyIssuer: false,
    currentDebtToGdp: 88,
    externalDebtShare: 25,
    foreignCurrencyDebtShare: 40,
    vulnerabilityScore: 55
  },
  {
    countryCode: 'MX',
    country: 'Mexico',
    debtIntolerance: 50,
    originalSinIndex: 50,
    safeHavenStatus: false,
    reserveCurrencyIssuer: false,
    currentDebtToGdp: 57,
    externalDebtShare: 35,
    foreignCurrencyDebtShare: 55,
    vulnerabilityScore: 50
  },
  {
    countryCode: 'ZA',
    country: 'South Africa',
    debtIntolerance: 55,
    originalSinIndex: 55,
    safeHavenStatus: false,
    reserveCurrencyIssuer: false,
    currentDebtToGdp: 72,
    externalDebtShare: 40,
    foreignCurrencyDebtShare: 45,
    vulnerabilityScore: 58
  },
  {
    countryCode: 'ID',
    country: 'Indonesia',
    debtIntolerance: 45,
    originalSinIndex: 55,
    safeHavenStatus: false,
    reserveCurrencyIssuer: false,
    currentDebtToGdp: 40,
    externalDebtShare: 35,
    foreignCurrencyDebtShare: 55,
    vulnerabilityScore: 48
  },

  // High Vulnerability Countries
  {
    countryCode: 'TR',
    country: 'Turkey',
    debtIntolerance: 70,
    originalSinIndex: 70,
    safeHavenStatus: false,
    reserveCurrencyIssuer: false,
    currentDebtToGdp: 42,
    externalDebtShare: 55,
    foreignCurrencyDebtShare: 65,
    vulnerabilityScore: 72
  },
  {
    countryCode: 'AR',
    country: 'Argentina',
    debtIntolerance: 90,
    originalSinIndex: 85,
    safeHavenStatus: false,
    reserveCurrencyIssuer: false,
    currentDebtToGdp: 85,
    externalDebtShare: 65,
    foreignCurrencyDebtShare: 80,
    vulnerabilityScore: 88
  },
  {
    countryCode: 'PK',
    country: 'Pakistan',
    debtIntolerance: 80,
    originalSinIndex: 75,
    safeHavenStatus: false,
    reserveCurrencyIssuer: false,
    currentDebtToGdp: 78,
    externalDebtShare: 45,
    foreignCurrencyDebtShare: 70,
    vulnerabilityScore: 82
  },
  {
    countryCode: 'EG',
    country: 'Egypt',
    debtIntolerance: 75,
    originalSinIndex: 70,
    safeHavenStatus: false,
    reserveCurrencyIssuer: false,
    currentDebtToGdp: 92,
    externalDebtShare: 35,
    foreignCurrencyDebtShare: 55,
    vulnerabilityScore: 75
  },
  {
    countryCode: 'LK',
    country: 'Sri Lanka',
    debtIntolerance: 95,
    originalSinIndex: 80,
    safeHavenStatus: false,
    reserveCurrencyIssuer: false,
    currentDebtToGdp: 128,
    externalDebtShare: 55,
    foreignCurrencyDebtShare: 75,
    vulnerabilityScore: 95
  }
];

// ============================================================================
// PUSH AND PULL FACTORS FOR CAPITAL FLOWS
// ============================================================================

export interface PushPullFactor {
  id: string;
  name: string;
  type: 'push' | 'pull';
  description: string;
  currentLevel: 'low' | 'medium' | 'high';
  direction: 'inflow' | 'outflow';
  indicators: string[];
}

export const pushPullFactors: PushPullFactor[] = [
  // Push Factors (from developed markets)
  {
    id: 'dm-interest-rates',
    name: 'Developed Market Interest Rates',
    type: 'push',
    description: 'Low DM rates push investors to seek yield in emerging markets. High DM rates pull capital back.',
    currentLevel: 'high',
    direction: 'outflow',
    indicators: ['Fed Funds Rate', 'ECB Deposit Rate', 'BoJ Policy Rate', 'US 10Y Treasury']
  },
  {
    id: 'global-risk-appetite',
    name: 'Global Risk Appetite',
    type: 'push',
    description: 'Risk-on sentiment pushes capital to EM; risk-off triggers outflows. VIX is key indicator.',
    currentLevel: 'medium',
    direction: 'inflow',
    indicators: ['VIX Index', 'Credit Spreads', 'EM Flows Tracker', 'Risk Parity Positioning']
  },
  {
    id: 'dm-growth-outlook',
    name: 'DM Growth Outlook',
    type: 'push',
    description: 'Weak DM growth pushes investors to EM for higher returns. Strong DM growth keeps capital home.',
    currentLevel: 'medium',
    direction: 'outflow',
    indicators: ['US GDP Growth', 'Euro Area Growth', 'Leading Economic Indicators']
  },
  {
    id: 'liquidity-conditions',
    name: 'Global Liquidity Conditions',
    type: 'push',
    description: 'Central bank balance sheet expansion pushes liquidity to EM. QT and tightening reverses flows.',
    currentLevel: 'medium',
    direction: 'outflow',
    indicators: ['Fed Balance Sheet', 'Global M2', 'Dollar Liquidity', 'TED Spread']
  },

  // Pull Factors (from emerging markets)
  {
    id: 'em-growth-premium',
    name: 'EM Growth Premium',
    type: 'pull',
    description: 'Higher EM growth rates relative to DM attract portfolio and FDI flows.',
    currentLevel: 'medium',
    direction: 'inflow',
    indicators: ['EM GDP Growth', 'Growth Differential vs DM', 'Earnings Growth']
  },
  {
    id: 'em-interest-rates',
    name: 'EM Interest Rate Differential',
    type: 'pull',
    description: 'Higher EM yields attract carry trade and fixed income flows.',
    currentLevel: 'medium',
    direction: 'inflow',
    indicators: ['EM Local Bond Yields', 'Carry vs DM', 'Real Interest Rate Gap']
  },
  {
    id: 'reform-momentum',
    name: 'Reform Momentum',
    type: 'pull',
    description: 'Structural reforms and improving governance attract long-term capital.',
    currentLevel: 'low',
    direction: 'inflow',
    indicators: ['Business Climate Rankings', 'Governance Scores', 'Trade Agreements']
  },
  {
    id: 'commodity-prices',
    name: 'Commodity Prices',
    type: 'pull',
    description: 'Rising commodity prices benefit EM exporters, attracting investment.',
    currentLevel: 'medium',
    direction: 'inflow',
    indicators: ['CRB Index', 'Oil Price', 'Metal Prices', 'Agricultural Prices']
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getCrisisTypeColor = (type: CrisisType): string => {
  const colors: Record<CrisisType, string> = {
    banking: '#ef4444',      // Red
    sovereign_debt: '#8b5cf6', // Purple
    currency: '#f59e0b',      // Amber
    inflation: '#f97316',     // Orange
    stock_market: '#3b82f6'   // Blue
  };
  return colors[type];
};

export const getCrisisTypeLabel = (type: CrisisType): string => {
  const labels: Record<CrisisType, string> = {
    banking: 'Banking Crisis',
    sovereign_debt: 'Sovereign Debt Crisis',
    currency: 'Currency Crisis',
    inflation: 'Inflation Crisis',
    stock_market: 'Stock Market Crash'
  };
  return labels[type];
};

export const getSeverityLabel = (severity: number): string => {
  const labels: Record<number, string> = {
    1: 'Minor',
    2: 'Moderate',
    3: 'Significant',
    4: 'Severe',
    5: 'Catastrophic'
  };
  return labels[severity] || 'Unknown';
};

export const getPhaseColor = (phase: string): string => {
  const colors: Record<string, string> = {
    early: '#22c55e',       // Green
    bubble: '#f59e0b',      // Amber
    top: '#ef4444',         // Red
    depression: '#7c3aed',  // Purple
    deleveraging: '#3b82f6', // Blue
    normalization: '#10b981' // Emerald
  };
  return colors[phase] || '#6b7280';
};

export const getCurrentCyclePhase = (): DebtCyclePhase | undefined => {
  const currentYear = new Date().getFullYear();
  return debtCyclePhases.find(phase => 
    phase.startYear <= currentYear && phase.endYear >= currentYear
  );
};

export const getCrisesByDecade = (decade: number): CrisisEvent[] => {
  return crisisEvents.filter(crisis => 
    crisis.year >= decade && crisis.year < decade + 10
  );
};

export const getCrisesByType = (type: CrisisType): CrisisEvent[] => {
  return crisisEvents.filter(crisis => crisis.type === type);
};

export const getCrisesByRegion = (region: string): CrisisEvent[] => {
  return crisisEvents.filter(crisis => crisis.region === region);
};

export const getEmpireAtYear = (year: number): EmpireCycle | undefined => {
  return empireCycles.find(empire => 
    empire.peakStart <= year && empire.peakEnd >= year
  );
};

// ============================================================================
// HANDBOOK HELPER FUNCTIONS
// ============================================================================

export const getCrisisGenerationColor = (generation: CrisisGeneration): string => {
  const colors: Record<CrisisGeneration, string> = {
    '1st': '#ef4444',   // Red - fundamental
    '2nd': '#f59e0b',   // Amber - self-fulfilling
    '3rd': '#8b5cf6'    // Purple - balance sheet
  };
  return colors[generation];
};

export const getCapitalFlowTypeColor = (type: CapitalFlowType): string => {
  const colors: Record<CapitalFlowType, string> = {
    sudden_stop: '#ef4444',      // Red
    capital_bonanza: '#22c55e',  // Green
    flight_to_safety: '#3b82f6'  // Blue
  };
  return colors[type];
};

export const getCapitalFlowTypeLabel = (type: CapitalFlowType): string => {
  const labels: Record<CapitalFlowType, string> = {
    sudden_stop: 'Sudden Stop',
    capital_bonanza: 'Capital Bonanza',
    flight_to_safety: 'Flight to Safety'
  };
  return labels[type];
};

export const getDebtVulnerabilityColor = (concept: DebtVulnerabilityType): string => {
  const colors: Record<DebtVulnerabilityType, string> = {
    debt_intolerance: '#ef4444',  // Red
    original_sin: '#f59e0b',      // Amber
    safe_haven: '#22c55e'         // Green
  };
  return colors[concept];
};

export const getVulnerabilityScoreColor = (score: number): string => {
  if (score < 30) return '#22c55e';      // Green - Low risk
  if (score < 50) return '#84cc16';      // Lime - Low-medium
  if (score < 65) return '#f59e0b';      // Amber - Medium
  if (score < 80) return '#f97316';      // Orange - High
  return '#ef4444';                       // Red - Critical
};

export const getVulnerabilityLevel = (score: number): string => {
  if (score < 30) return 'Low';
  if (score < 50) return 'Low-Medium';
  if (score < 65) return 'Medium';
  if (score < 80) return 'High';
  return 'Critical';
};

export const classifyCrisisGeneration = (crisis: CrisisEvent): CrisisGeneration => {
  // Classify based on crisis characteristics
  // 1st Gen: Fiscal/reserves driven
  if (crisis.type === 'sovereign_debt' || crisis.type === 'inflation') {
    if (crisis.causes.some(c => 
      c.toLowerCase().includes('fiscal') || 
      c.toLowerCase().includes('deficit') ||
      c.toLowerCase().includes('money print') ||
      c.toLowerCase().includes('reserve')
    )) {
      return '1st';
    }
  }
  
  // 2nd Gen: Self-fulfilling, policy trade-offs
  if (crisis.type === 'currency' && crisis.severity <= 3) {
    if (crisis.causes.some(c => 
      c.toLowerCase().includes('speculation') || 
      c.toLowerCase().includes('peg') ||
      c.toLowerCase().includes('erm') ||
      c.toLowerCase().includes('political')
    )) {
      return '2nd';
    }
  }
  
  // 3rd Gen: Balance sheet, twin crisis
  if (crisis.type === 'banking' || crisis.type === 'currency') {
    if (crisis.causes.some(c => 
      c.toLowerCase().includes('foreign currency') || 
      c.toLowerCase().includes('short-term') ||
      c.toLowerCase().includes('leverage') ||
      c.toLowerCase().includes('mismatch') ||
      c.toLowerCase().includes('balance sheet')
    )) {
      return '3rd';
    }
  }
  
  // Default classification based on era and type
  if (crisis.year < 1990) return '1st';
  if (crisis.year >= 1990 && crisis.year < 1997) return '2nd';
  return '3rd';
};

export const getCapitalFlowsByType = (type: CapitalFlowType): CapitalFlowEvent[] => {
  return capitalFlowEvents.filter(event => event.type === type);
};

export const getCapitalFlowsByCountry = (countryCode: string): CapitalFlowEvent[] => {
  return capitalFlowEvents.filter(event => event.countryCode === countryCode);
};

export const getCountryDebtProfile = (countryCode: string): CountryDebtProfile | undefined => {
  return countryDebtProfiles.find(profile => profile.countryCode === countryCode);
};

export const getSafeHavenCountries = (): CountryDebtProfile[] => {
  return countryDebtProfiles.filter(profile => profile.safeHavenStatus);
};

export const getHighVulnerabilityCountries = (threshold: number = 70): CountryDebtProfile[] => {
  return countryDebtProfiles.filter(profile => profile.vulnerabilityScore >= threshold);
};

export const getCurrentPushPullBalance = (): { push: number; pull: number; net: 'inflow' | 'outflow' | 'neutral' } => {
  let pushScore = 0;
  let pullScore = 0;
  
  pushPullFactors.forEach(factor => {
    const score = factor.currentLevel === 'high' ? 3 : factor.currentLevel === 'medium' ? 2 : 1;
    if (factor.type === 'push') {
      pushScore += factor.direction === 'outflow' ? score : -score;
    } else {
      pullScore += factor.direction === 'inflow' ? score : -score;
    }
  });
  
  const net = pullScore > pushScore + 2 ? 'inflow' : pushScore > pullScore + 2 ? 'outflow' : 'neutral';
  return { push: pushScore, pull: pullScore, net };
};

export default {
  empireCycles,
  crisisEvents,
  debtCyclePhases,
  cycleIndicators,
  crisisGenerationModels,
  capitalFlowEvents,
  exchangeRateConcepts,
  debtVulnerabilityConcepts,
  countryDebtProfiles,
  pushPullFactors
};


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
    description: 'Widely regarded as the first modern international financial crisis, the Panic of 1825 erupted after a speculative frenzy in Latin American bonds and mining ventures following the independence movements across South America. The Bank of England had fueled the boom by loosening credit in the post-Napoleonic War era, and when commodity prices collapsed and Latin American investments proved worthless, a cascade of bank failures swept through London and the provinces. Over 70 banks collapsed, credit markets froze, and the crisis spread to continental Europe, marking the first time a financial shock in one country transmitted rapidly across borders through interconnected banking systems.',
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
    description: 'The Panic of 1837 precipitated one of the longest economic depressions in American history, lasting six years. President Andrew Jackson\'s destruction of the Second Bank of the United States removed the nation\'s central financial regulator, while his Specie Circular of 1836 — requiring payment for government lands in gold or silver — drained liquidity from state banks. Rampant speculation in western lands, combined with a contraction in credit from the Bank of England, triggered a wave of bank failures: 343 of the nation\'s 850 banks closed entirely, and another 62 partially failed. Unemployment soared, cotton prices halved, and multiple states defaulted on their debts, damaging American credit in European markets for decades.',
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
    description: 'The Great Irish Famine (An Gorta Mór) was one of the most devastating economic and humanitarian catastrophes of the 19th century. When the potato blight Phytophthora infestans destroyed successive harvests from 1845 to 1852, roughly one million people died of starvation and disease while another million emigrated, reducing Ireland\'s population by 25%. British laissez-faire economic policies under the Corn Laws, absentee landlordism, and the continued export of grain from Ireland during the famine compounded the disaster. The crisis permanently altered Ireland\'s demographic trajectory — its population would not recover to pre-famine levels even by the 21st century — and fueled generations of political resentment toward British rule.',
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
    description: 'The Panic of 1857 is considered the first truly worldwide economic crisis, as telegraph networks and expanding global trade allowed the contagion to spread rapidly from the United States to Europe, South America, and beyond. The collapse was triggered by the failure of the Ohio Life Insurance and Trust Company, which had heavy exposure to railroad securities. As railroads had overbuilt ahead of demand and grain prices declined due to the end of the Crimean War, investor confidence evaporated. Over 5,000 American businesses failed, and 900 banks suspended operations. The crisis demonstrated for the first time how interconnected the global economy had become through trade, capital flows, and the gold standard.',
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
    description: 'The Panic of 1873 triggered what contemporaries called the "Great Depression" — a six-year global downturn that was not surpassed in severity until the 1930s. The crisis began with the spectacular failure of Jay Cooke & Company, the most prestigious investment bank in America and financier of the Union during the Civil War, due to its overexposure to the Northern Pacific Railway. The New York Stock Exchange closed for ten days — the first time in its history. The underlying causes ran deeper: post-Civil War railroad overbuilding, speculative land grants, and the demonetization of silver (the "Crime of \'73") tightened the money supply. Over 18,000 businesses failed, unemployment exceeded 14%, and the crisis sparked violent labor unrest including the Great Railroad Strike of 1877.',
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
    description: 'The Baring Crisis of 1890 was a landmark event in the history of sovereign debt defaults and international finance. Argentina had borrowed heavily from British banks — principally Baring Brothers, then one of the oldest and most prestigious merchant banks in London — to fund railroads, public works, and land speculation during a period of exuberant growth. When Argentina\'s bubble burst amid political instability and a failed coup, the government could not service its debts, and Baring Brothers faced insolvency. Only a rescue organized by the Bank of England, with contributions from major London banks and the Rothschild family, prevented a systemic collapse of the British financial system. The crisis foreshadowed the pattern of emerging-market debt crises that would recur throughout the 20th century.',
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
    description: 'The Panic of 1893 was the worst economic crisis the United States had yet experienced, ushering in a four-year depression with unemployment peaking near 18%. The crisis began when the Philadelphia and Reading Railroad declared bankruptcy in February, followed by a run on gold reserves as investors feared the U.S. would abandon the gold standard. Over 500 banks failed, 15,000 businesses closed, and 74 railroads went into receivership. The human toll was severe: "Coxey\'s Army" — a protest march of unemployed workers on Washington — became a symbol of the era\'s desperation. The crisis deepened the political divide between gold-standard advocates and silver populists, culminating in William Jennings Bryan\'s famous "Cross of Gold" speech in 1896.',
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
    description: 'The Panic of 1907 was the last great financial crisis of the pre-Federal Reserve era, and it was the direct catalyst for the creation of America\'s central bank. The crisis began when a failed attempt by F. Augustus Heinze and Charles Morse to corner the copper market exposed the fragility of trust companies — lightly regulated financial institutions that had grown to rival banks. When the Knickerbocker Trust Company collapsed, panic spread across New York\'s financial system. With no central bank to act as lender of last resort, the 70-year-old financier J.P. Morgan personally organized a private bailout, locking bankers in his library until they agreed to commit funds. The stock market fell nearly 50% from its 1906 peak. The episode convinced Congress that the nation needed a permanent central banking system, leading to the Federal Reserve Act of 1913.',
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
    description: 'The Weimar hyperinflation remains the most studied case of monetary collapse in history and a cautionary tale about the dangers of unchecked money printing. Burdened by punitive war reparations imposed at Versailles and the French-Belgian occupation of the industrial Ruhr region in 1923, the German government resorted to printing money at an accelerating pace to meet its obligations. By November 1923, prices were doubling every 3.7 days; a loaf of bread cost 200 billion marks; workers were paid twice daily and rushed to spend wages before they lost value. The middle class was financially annihilated, as lifetime savings became worthless overnight. The crisis was resolved only by the introduction of the Rentenmark and the Dawes Plan for reparations restructuring, but the deep social trauma contributed to the political radicalization that would eventually bring the Nazi party to power.',
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
    description: 'Winston Churchill\'s 1925 decision as Chancellor of the Exchequer to return Britain to the gold standard at the pre-war parity of $4.86 per pound was described by John Maynard Keynes as a "featherbed for the rentier" that made British exports uncompetitive. The pound was overvalued by an estimated 10-15%, devastating coal mining and manufacturing regions in the north of England and Wales. The resulting deflation and unemployment contributed directly to the 1926 General Strike, Britain\'s largest industrial action. When the Great Depression hit in 1931, Britain was forced to abandon gold entirely — a decision that ironically allowed the economy to recover faster than countries that clung to the standard. The episode became a landmark case study in the costs of prioritizing exchange-rate prestige over domestic economic welfare.',
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
    description: 'The Wall Street Crash of October 1929 and the ensuing Great Depression constituted the most catastrophic economic event of the modern era. Between September 1929 and July 1932, the Dow Jones Industrial Average fell 89%, wiping out an entire generation\'s wealth. The crash exposed the fragility of an economy built on margin lending (investors could buy stocks with just 10% down), rampant speculation, and an unregulated banking system. Over 9,000 banks failed, evaporating $140 billion in deposits. Unemployment reached 25%, industrial production fell by nearly half, and international trade collapsed by 65% as countries erected tariff barriers. The crisis spread globally through the gold standard, with the Smoot-Hawley Tariff Act deepening the worldwide contraction. The political and economic response — Roosevelt\'s New Deal, the creation of the SEC and FDIC, and the Glass-Steagall Act separating commercial and investment banking — fundamentally reshaped American capitalism and the role of government in the economy.',
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
    description: 'The German banking crisis of 1931 was a pivotal moment in the Great Depression\'s spread across Europe. Triggered by the contagion from Austria\'s Credit-Anstalt collapse in May, German banks faced massive capital flight as foreign creditors — particularly American — withdrew short-term loans. The Darmstädter und Nationalbank (Danat Bank), Germany\'s second-largest bank, failed on July 13 after its exposure to a collapsed textile conglomerate became public. Chancellor Brüning declared a bank holiday and imposed capital controls, but confidence was shattered. The crisis deepened Germany\'s already severe depression, with unemployment reaching 30%, and created the conditions of desperation and resentment that facilitated the Nazi party\'s rise to power in the 1933 elections.',
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
    description: 'The collapse of Credit-Anstalt in May 1931 is widely considered the event that transformed the American stock market crash into a full-blown global depression. Austria\'s largest bank, controlling over 70% of the country\'s industrial assets, had been weakened by forced mergers with smaller failing institutions and heavy exposure to the depressed agricultural sector. When it revealed losses exceeding its capital, depositors panicked, triggering bank runs that spread to Hungary, Czechoslovakia, Romania, Poland, and ultimately Germany. The Austrian government\'s failed attempt to impose capital controls only deepened the panic. The crisis demonstrated how a single institutional failure in a small country could cascade through the international financial system, a pattern that would repeat with eerie similarity in the 2008 crisis.',
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
    description: 'The 1976 Sterling Crisis marked the nadir of Britain\'s post-imperial economic decline and remains one of the most politically significant financial crises in UK history. Facing double-digit inflation driven by the 1973 oil shock and powerful trade unions demanding wage increases, the pound fell sharply on foreign exchange markets as investors lost confidence in the Labour government\'s fiscal management. Chancellor Denis Healey was forced to seek a $3.9 billion loan from the International Monetary Fund — the largest ever requested at that time — subjecting Britain, a former imperial superpower, to the humiliation of externally imposed austerity conditions. The IMF demanded deep public spending cuts, which alienated Labour\'s union base and set the stage for Margaret Thatcher\'s election in 1979 and the subsequent monetarist revolution in British economic policy.',
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
    description: 'The Latin American Debt Crisis began in August 1982 when Mexico\'s finance minister informed the U.S. government that Mexico could no longer service its $80 billion in foreign debt, sending shockwaves through global financial markets. The crisis had been building for a decade: Latin American countries had borrowed heavily from U.S. and European banks during the 1970s commodity boom, often at variable interest rates. When Federal Reserve Chairman Paul Volcker raised U.S. interest rates to nearly 20% to combat inflation, the debt burden became unsustainable. Brazil, Argentina, Venezuela, and a dozen other countries followed Mexico into default or restructuring. The resulting "Lost Decade" saw per-capita income decline across the region, poverty rates soar, and a generation of development gains erased. The crisis was eventually resolved through the 1989 Brady Plan, which converted bank loans into tradeable bonds, creating the modern emerging-market debt architecture.',
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
    description: 'Black Monday, October 19, 1987, saw the largest single-day percentage decline in stock market history, with the Dow Jones falling 22.6% in a single session. The collapse was amplified by computerized portfolio insurance strategies that automatically sold futures as prices fell, creating a self-reinforcing downward spiral. Panic spread globally: Hong Kong fell 45%, Australia 41%, and London 26% over the crisis period. Newly appointed Fed Chairman Alan Greenspan responded by pledging the Federal Reserve\'s readiness to provide liquidity, establishing what became known as the "Greenspan Put." The crash led to the implementation of circuit breakers to halt trading during extreme moves, and the rapid recovery reinforced expectations of central bank backstops.',
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
    description: 'The bursting of Japan\'s asset bubble in 1990 ushered in what became known as the "Lost Decades" — a prolonged period of economic stagnation and deflation from which Japan has arguably never fully recovered. During the late 1980s, loose monetary policy and speculative mania drove the Nikkei stock index to nearly 39,000 and Tokyo real estate prices to levels where the Imperial Palace grounds were theoretically worth more than all of California. When the Bank of Japan raised interest rates in 1989-90 to cool speculation, both markets collapsed: the Nikkei eventually fell 80% and commercial real estate lost up to 90% of its value. Japanese banks, heavily exposed to real estate collateral, became "zombie banks" — technically insolvent but kept alive by government forbearance. The crisis demonstrated how a balance-sheet recession, where the private sector prioritizes paying down debt over spending and investment, can trap an economy in decades of stagnation even at zero interest rates.',
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
    description: 'Black Wednesday, September 16, 1992, saw the British government humiliatingly forced to withdraw the pound from the European Exchange Rate Mechanism (ERM) after failing to defend its currency peg against massive speculative selling. George Soros\'s Quantum Fund famously shorted $10 billion worth of sterling, earning an estimated $1 billion profit in a single day. The Bank of England raised interest rates twice in one day — from 10% to 12%, then to 15% — and spent billions in foreign reserves, but the selling was overwhelming. The Treasury lost an estimated 3.3 billion pounds. Paradoxically, Britain\'s forced exit proved economically beneficial: freed from the overvalued peg, the pound depreciated, exports recovered, and the UK entered a sustained period of growth. The episode led to the adoption of inflation targeting as the UK\'s monetary framework and deepened British skepticism toward European monetary integration.',
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
    description: 'The Tequila Crisis erupted in December 1994 when the newly inaugurated Mexican government was forced to abandon the peso\'s crawling peg to the dollar, triggering a 50% currency collapse. Throughout 1994, political shocks — the Zapatista uprising in Chiapas, the assassination of presidential candidate Luis Donaldo Colosio, and kidnappings of prominent businessmen — had steadily eroded investor confidence. Mexico\'s central bank depleted its foreign reserves defending the peg while the current account deficit ballooned to 7% of GDP. The crisis required an unprecedented $50 billion international rescue package, with the U.S. contributing $20 billion from its Exchange Stabilization Fund (bypassing Congressional approval). The crisis spread to Argentina and Brazil — the so-called "Tequila Effect" — and became a template for the emerging-market crises that would follow in Asia and Russia.',
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
    description: 'The Asian Financial Crisis began on July 2, 1997, when Thailand floated the baht after exhausting its foreign reserves defending a dollar peg, triggering the most severe emerging-market crisis since the 1930s. The contagion spread with terrifying speed to Indonesia, South Korea, Malaysia, and the Philippines as foreign investors fled the region. Currencies lost 40-80% of their value, stock markets crashed, and economies that had been celebrated as "Asian Tigers" contracted sharply — Indonesia\'s GDP fell 13%. The crisis exposed fundamental vulnerabilities: crony capitalism, weak banking regulation, massive short-term foreign-currency borrowing, and implicit government guarantees that encouraged moral hazard. The IMF\'s controversial bailout programs, which imposed fiscal austerity and structural reforms, were criticized for worsening the downturn. The crisis reshaped Asian economic policy for a generation, as countries built massive foreign-reserve buffers and moved to floating exchange rates to avoid a repeat.',
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
    description: 'Russia\'s 1998 financial crisis stunned global markets when the government simultaneously defaulted on its domestic GKO treasury bonds, declared a moratorium on foreign debt payments, and devalued the ruble — a triple shock that violated investors\' assumptions about sovereign creditworthiness. The crisis had been building as oil prices fell to $10 per barrel, the Asian crisis reduced global demand, and Russia\'s tax collection collapsed amid post-Soviet oligarch capitalism. The ruble lost 70% of its value, inflation surged, and the middle class saw their savings destroyed for the second time in a decade. The global repercussions were severe: the hedge fund Long-Term Capital Management (LTCM), which had massive leveraged bets on bond convergence, lost $4.6 billion and required a $3.6 billion private-sector bailout coordinated by the New York Fed to prevent systemic contagion. The crisis paved the way for Vladimir Putin\'s rise to the presidency in 2000.',
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
    description: 'Argentina\'s 2001-02 crisis was one of the most devastating sovereign defaults in history, with $93 billion in bonds repudiated — the largest default ever recorded at that time. The crisis stemmed from the Convertibility Plan of 1991, which had pegged the peso 1:1 to the U.S. dollar. While this initially tamed hyperinflation, it progressively made Argentine exports uncompetitive and required constant foreign borrowing to maintain. When capital markets closed to Argentina in 2001, the government imposed the "corralito" — a freeze on bank withdrawals that enraged the middle class. Riots erupted, President De la Rua fled the presidential palace by helicopter, and the country cycled through five presidents in two weeks. The peso eventually lost 70% of its value, GDP contracted 18%, and over half the population fell below the poverty line. Argentina\'s recovery, driven by commodity exports and heterodox economic policies, challenged the prevailing "Washington Consensus" orthodoxy.',
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
    description: 'The dot-com bubble collapse between March 2000 and October 2002 wiped out $5 trillion in market value as the speculative mania surrounding internet companies gave way to reality. During the bubble, companies with no revenue, no profits, and sometimes no viable business model achieved multi-billion-dollar valuations simply by appending ".com" to their names. The NASDAQ Composite, which had surged from 1,000 in 1995 to over 5,000 by March 2000, ultimately fell 78% to its trough. Iconic failures like Pets.com, Webvan, and WorldCom became symbols of the excess. Yet the bubble also funded the infrastructure — fiber-optic networks, data centers, and software platforms — that would underpin the genuine internet revolution that followed. The Fed\'s aggressive rate cuts in response (from 6.5% to 1%) would later be criticized for sowing the seeds of the housing bubble that led to the 2008 crisis.',
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
    description: 'The Global Financial Crisis of 2008-09 was the worst systemic financial meltdown since the Great Depression, originating in the U.S. subprime mortgage market and cascading through the interconnected global banking system. The crisis had its roots in the securitization of risky mortgages into complex derivatives (CDOs) that spread toxic assets throughout the financial system while credit rating agencies assigned them AAA ratings. When housing prices began falling in 2006-07, the entire edifice unraveled. The September 2008 collapse of Lehman Brothers — the largest bankruptcy in U.S. history at $639 billion — triggered a global panic: interbank lending froze, stock markets crashed worldwide, and the global economy teetered on the brink of total collapse. The response was unprecedented: the $700 billion TARP bailout, the Fed\'s quantitative easing programs, and coordinated global stimulus. The crisis led to the Dodd-Frank Act, permanently transformed central banking, and fueled a populist backlash that would reshape politics across the Western world.',
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
    description: 'Iceland\'s 2008 financial crisis was extraordinary in its scale relative to the country\'s size: the combined assets of its three largest banks — Kaupthing, Landsbanki, and Glitnir — had grown to roughly 10 times Iceland\'s GDP through aggressive international expansion funded by short-term wholesale borrowing. When global credit markets froze after Lehman Brothers\' collapse, all three banks failed within a single week in October 2008, making it the largest banking collapse relative to economic size in history. The krona lost 50% of its value, inflation surged, and Iceland became the first Western country to receive an IMF bailout since the UK in 1976. Uniquely, Iceland chose not to bail out the banks\' foreign creditors, imposed capital controls, and prosecuted senior bankers — an approach that contrasted sharply with other nations and became a subject of intense academic and political debate about crisis management.',
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
    description: 'The Greek debt crisis, which erupted in late 2009 when the incoming government revealed that budget deficits had been systematically understated for years, became the defining crisis of the Eurozone era. Greece\'s actual deficit was 12.7% of GDP — more than four times the EU limit — and its debt-to-GDP ratio was heading toward 180%. Unable to devalue its currency (being locked into the euro), Greece was forced to accept three successive bailout programs totaling 289 billion euros, the largest sovereign rescue in history, conditioned on brutal austerity measures. The economy contracted by 25% — a peacetime depression rivaling the 1930s — unemployment reached 27%, and youth unemployment exceeded 60%. The crisis raised existential questions about the euro\'s viability, sparked the rise of populist parties across Europe, and demonstrated the fundamental tension in a monetary union without fiscal integration.',
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
    description: 'The 2013 Cypriot financial crisis was notable for introducing the unprecedented concept of a depositor "bail-in" to the Eurozone, fundamentally changing how banking crises would be handled in Europe thereafter. Cyprus\'s outsized banking sector — with assets roughly eight times GDP, heavily funded by Russian deposits — had become dangerously exposed to Greek government bonds, which lost 75% of their face value in the 2012 Greek debt restructuring. When the banks became insolvent, the initial EU/ECB/IMF bailout proposal shocked markets by proposing a levy on all deposits, including those under the 100,000 euro insurance threshold. After public outrage and a parliamentary rejection, the final deal imposed losses of up to 47.5% on uninsured deposits at the Bank of Cyprus, while Laiki Bank was wound down entirely. Capital controls — the first ever in the Eurozone — remained in place for two years.',
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
    description: 'China\'s 2015 stock market crash was a dramatic illustration of the risks when government policy actively encourages speculative retail participation in equity markets. State media had promoted stock ownership as patriotic, and margin lending exploded as millions of first-time retail investors borrowed heavily to buy shares. The Shanghai Composite doubled in less than a year before reversing violently in June 2015, eventually losing over 40% and wiping out $5 trillion in market value. The government\'s response was extraordinary: it suspended IPOs, banned major shareholders from selling, deployed state funds to buy stocks, detained financial journalists, and arrested short-sellers. The episode exposed tensions between China\'s desire for market-driven capital allocation and its instinct for state control, and triggered the first significant bout of capital flight that pressured the yuan and depleted foreign reserves by $500 billion.',
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
    description: 'Venezuela\'s economic collapse, accelerating from 2016 onward, represents the most severe peacetime economic disaster in Latin American history. What was once South America\'s wealthiest nation, sitting atop the world\'s largest proven oil reserves, descended into hyperinflation exceeding 1,000,000% annually at its peak in 2018. The crisis stemmed from decades of mismanagement under the Chavez-Maduro governments: oil revenue dependence, price controls that destroyed domestic production, expropriation of private businesses, unchecked money printing, and massive corruption. GDP contracted by approximately 75% between 2013 and 2021 — a collapse exceeding that of any country not at war. Over 7 million Venezuelans (roughly 25% of the population) fled the country in one of the largest displacement crises in modern history. The economy has partially dollarized informally, as citizens abandoned the bolivar entirely for transactions in U.S. dollars.',
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
    description: 'Turkey\'s 2018 currency crisis was triggered by a toxic combination of economic fundamentals and political interference in monetary policy. President Erdogan\'s publicly stated belief that high interest rates cause inflation (the opposite of mainstream economics) and his pressure on the central bank to keep rates low despite surging prices terrified investors. When diplomatic tensions with the United States escalated over the detention of American pastor Andrew Brunson, resulting in U.S. sanctions and tariff threats, the lira collapsed 40% against the dollar in a matter of weeks. Turkey\'s large current account deficit and heavy corporate foreign-currency borrowing — estimated at over $200 billion — amplified the crisis. Emergency overnight rate hikes to 24% eventually stabilized the currency, but the episode marked the beginning of a prolonged period of economic turbulence, persistent inflation above 60%, and unorthodox monetary experiments that continued to undermine confidence.',
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
    description: 'Argentina\'s 2018 currency crisis was the country\'s latest episode in a recurring pattern of boom-bust cycles driven by fiscal indiscipline and external vulnerability. President Macri\'s market-friendly government had attracted foreign capital by issuing dollar-denominated debt, including a remarkable 100-year bond in 2017. But when the Federal Reserve raised U.S. rates and the dollar strengthened globally, capital fled emerging markets, and Argentina — with persistent fiscal deficits, high inflation, and large foreign-currency obligations — was hit hardest. The peso lost 50% of its value in 2018, and the government was forced to negotiate a record $57 billion IMF standby arrangement, the largest in the Fund\'s history. The austerity conditions attached to the program contributed to Macri\'s electoral defeat in 2019, and Argentina defaulted again in 2020, its ninth sovereign default — underscoring the seemingly intractable nature of the country\'s debt problems.',
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
    description: 'The COVID-19 market crash of February-March 2020 was the fastest bear market in history, with the S&P 500 falling 34% in just 23 trading days as a novel coronavirus pandemic forced governments worldwide to shut down economic activity. Oil prices briefly turned negative for the first time ever as demand collapsed. The policy response was equally unprecedented in its speed and scale: the Federal Reserve cut rates to zero, launched unlimited quantitative easing, and established emergency lending facilities totaling trillions of dollars; Congress passed the $2.2 trillion CARES Act; and governments globally deployed fiscal stimulus worth over $10 trillion combined. Markets recovered with extraordinary speed — the S&P 500 hit new highs by August 2020 — but the massive monetary and fiscal intervention laid the groundwork for the inflation surge of 2021-2023 that would force the most aggressive central bank tightening cycle in four decades.',
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
    description: 'The UK gilt crisis of September 2022 was a dramatic demonstration of how quickly modern financial markets can punish fiscal recklessness. New Chancellor Kwasi Kwarteng\'s "mini-budget" announced 45 billion pounds in unfunded tax cuts — the largest since 1972 — without an accompanying fiscal assessment from the Office for Budget Responsibility. The bond market reaction was immediate and violent: 30-year gilt yields surged by the most in a single day since records began, the pound fell to a record low against the dollar, and a doom loop emerged as pension funds using leveraged liability-driven investment (LDI) strategies faced massive margin calls, forcing them to sell gilts, which pushed yields higher still. The Bank of England was forced to intervene with emergency bond purchases to prevent a systemic pension fund collapse. Within weeks, Kwarteng was fired and Prime Minister Liz Truss resigned after just 45 days in office — the shortest tenure in British history.',
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
    description: 'The 2023 regional banking crisis revealed how the Federal Reserve\'s rapid interest rate increases — from near-zero to over 5% in barely a year — had created hidden vulnerabilities in the banking system. Silicon Valley Bank (SVB), the 16th-largest U.S. bank, collapsed in just 48 hours on March 10, 2023, after disclosing $1.8 billion in losses on its bond portfolio, triggering the first viral bank run in the social media age as depositors withdrew $42 billion in a single day via mobile banking. Signature Bank and First Republic Bank followed in quick succession. The three failures represented the second-, third-, and fourth-largest bank collapses in U.S. history (after Washington Mutual in 2008). Regulators responded by guaranteeing all deposits — even uninsured ones — and the Fed created the Bank Term Funding Program (BTFP), allowing banks to borrow against bonds at par value rather than marking losses. The episode highlighted the unique risks of concentrated, uninsured deposit bases and unrealized losses in held-to-maturity portfolios.',
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


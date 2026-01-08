// Currency Hierarchy Data
// Static and curated data for currency hierarchy features

// ============================================
// TYPES
// ============================================

export type CurrencyCode = 
  | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'CNY' | 'CNH' | 'CHF' 
  | 'AUD' | 'CAD' | 'NZD' | 'HKD' | 'SGD' | 'SEK' | 'NOK'
  | 'MXN' | 'BRL' | 'INR' | 'ZAR' | 'RUB' | 'TRY';

export type RegimeType = 'free_float' | 'managed_float' | 'pegged' | 'currency_board' | 'dollarized';
export type SafeHavenCategory = 'primary' | 'secondary' | 'neutral' | 'risk_on';
export type EventImportance = 'high' | 'medium' | 'low';

export interface CentralBankRate {
  currency: CurrencyCode;
  bank: string;
  bankAbbrev: string;
  rate: number;
  previousRate: number;
  lastUpdated: string;
  nextMeeting: string;
  trend: 'rising' | 'falling' | 'stable';
}

export interface CurrencyRegime {
  currency: CurrencyCode;
  type: RegimeType;
  description: string;
  peggedTo: string | null;
  flexibility: number; // 1-5 scale
  details: string;
}

export interface ReserveShare {
  year: number;
  USD: number;
  EUR: number;
  JPY: number;
  GBP: number;
  CNY: number;
  CHF: number;
  AUD: number;
  CAD: number;
  other: number;
}

export interface SafeHavenCurrency {
  currency: CurrencyCode;
  category: SafeHavenCategory;
  score: number; // 1-100
  description: string;
  characteristics: string[];
}

export interface REERData {
  currency: CurrencyCode;
  current: number;
  historicalAverage: number;
  deviation: number; // percentage
  isOvervalued: boolean;
  trend: 'appreciating' | 'depreciating' | 'stable';
  lastUpdated: string;
}

export interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  event: string;
  currency: CurrencyCode;
  importance: EventImportance;
  forecast?: string;
  previous?: string;
  description: string;
}

export interface HistoricalRate {
  date: string;
  rate: number;
}

export interface CurrencyHistoricalData {
  baseCurrency: CurrencyCode;
  quoteCurrency: CurrencyCode;
  rates: HistoricalRate[];
}

export interface CurrencyCorrelation {
  currency1: CurrencyCode;
  currency2: CurrencyCode;
  correlation: number; // -1 to 1
  period: string;
}

// ============================================
// CENTRAL BANK RATES
// ============================================

export const CENTRAL_BANK_RATES: CentralBankRate[] = [
  {
    currency: 'USD',
    bank: 'Federal Reserve',
    bankAbbrev: 'Fed',
    rate: 5.25,
    previousRate: 5.25,
    lastUpdated: '2024-12-18',
    nextMeeting: '2025-01-29',
    trend: 'stable'
  },
  {
    currency: 'EUR',
    bank: 'European Central Bank',
    bankAbbrev: 'ECB',
    rate: 4.00,
    previousRate: 4.25,
    lastUpdated: '2024-12-12',
    nextMeeting: '2025-01-30',
    trend: 'falling'
  },
  {
    currency: 'JPY',
    bank: 'Bank of Japan',
    bankAbbrev: 'BoJ',
    rate: 0.25,
    previousRate: 0.10,
    lastUpdated: '2024-12-19',
    nextMeeting: '2025-01-24',
    trend: 'rising'
  },
  {
    currency: 'GBP',
    bank: 'Bank of England',
    bankAbbrev: 'BoE',
    rate: 4.75,
    previousRate: 5.00,
    lastUpdated: '2024-12-19',
    nextMeeting: '2025-02-06',
    trend: 'falling'
  },
  {
    currency: 'CHF',
    bank: 'Swiss National Bank',
    bankAbbrev: 'SNB',
    rate: 0.50,
    previousRate: 1.00,
    lastUpdated: '2024-12-12',
    nextMeeting: '2025-03-20',
    trend: 'falling'
  },
  {
    currency: 'CAD',
    bank: 'Bank of Canada',
    bankAbbrev: 'BoC',
    rate: 3.25,
    previousRate: 3.75,
    lastUpdated: '2024-12-11',
    nextMeeting: '2025-01-29',
    trend: 'falling'
  },
  {
    currency: 'AUD',
    bank: 'Reserve Bank of Australia',
    bankAbbrev: 'RBA',
    rate: 4.35,
    previousRate: 4.35,
    lastUpdated: '2024-12-10',
    nextMeeting: '2025-02-18',
    trend: 'stable'
  },
  {
    currency: 'NZD',
    bank: 'Reserve Bank of New Zealand',
    bankAbbrev: 'RBNZ',
    rate: 4.25,
    previousRate: 4.75,
    lastUpdated: '2024-11-27',
    nextMeeting: '2025-02-19',
    trend: 'falling'
  },
  {
    currency: 'CNY',
    bank: "People's Bank of China",
    bankAbbrev: 'PBoC',
    rate: 3.10,
    previousRate: 3.35,
    lastUpdated: '2024-12-20',
    nextMeeting: '2025-01-20',
    trend: 'falling'
  },
  {
    currency: 'SEK',
    bank: 'Sveriges Riksbank',
    bankAbbrev: 'Riksbank',
    rate: 2.50,
    previousRate: 2.75,
    lastUpdated: '2024-12-19',
    nextMeeting: '2025-01-29',
    trend: 'falling'
  },
  {
    currency: 'NOK',
    bank: 'Norges Bank',
    bankAbbrev: 'NB',
    rate: 4.50,
    previousRate: 4.50,
    lastUpdated: '2024-12-19',
    nextMeeting: '2025-01-23',
    trend: 'stable'
  },
  {
    currency: 'MXN',
    bank: 'Banco de Mexico',
    bankAbbrev: 'Banxico',
    rate: 10.00,
    previousRate: 10.25,
    lastUpdated: '2024-12-19',
    nextMeeting: '2025-02-06',
    trend: 'falling'
  },
  {
    currency: 'BRL',
    bank: 'Banco Central do Brasil',
    bankAbbrev: 'BCB',
    rate: 12.25,
    previousRate: 11.25,
    lastUpdated: '2024-12-11',
    nextMeeting: '2025-01-29',
    trend: 'rising'
  },
  {
    currency: 'INR',
    bank: 'Reserve Bank of India',
    bankAbbrev: 'RBI',
    rate: 6.50,
    previousRate: 6.50,
    lastUpdated: '2024-12-06',
    nextMeeting: '2025-02-07',
    trend: 'stable'
  },
  {
    currency: 'ZAR',
    bank: 'South African Reserve Bank',
    bankAbbrev: 'SARB',
    rate: 7.75,
    previousRate: 8.00,
    lastUpdated: '2024-11-21',
    nextMeeting: '2025-01-30',
    trend: 'falling'
  },
  {
    currency: 'TRY',
    bank: 'Central Bank of Turkey',
    bankAbbrev: 'TCMB',
    rate: 50.00,
    previousRate: 50.00,
    lastUpdated: '2024-12-26',
    nextMeeting: '2025-01-23',
    trend: 'stable'
  },
  {
    currency: 'RUB',
    bank: 'Bank of Russia',
    bankAbbrev: 'CBR',
    rate: 21.00,
    previousRate: 19.00,
    lastUpdated: '2024-12-20',
    nextMeeting: '2025-02-14',
    trend: 'rising'
  }
];

// ============================================
// CURRENCY REGIMES
// ============================================

export const CURRENCY_REGIMES: CurrencyRegime[] = [
  {
    currency: 'USD',
    type: 'free_float',
    description: 'Free Floating',
    peggedTo: null,
    flexibility: 5,
    details: 'The US dollar floats freely, determined by market forces. As the world\'s primary reserve currency, it serves as the benchmark for other currencies.'
  },
  {
    currency: 'EUR',
    type: 'free_float',
    description: 'Free Floating',
    peggedTo: null,
    flexibility: 5,
    details: 'The euro floats freely against other major currencies. Managed by the ECB for 20 eurozone countries.'
  },
  {
    currency: 'JPY',
    type: 'free_float',
    description: 'Free Floating',
    peggedTo: null,
    flexibility: 5,
    details: 'The yen floats freely but BoJ occasionally intervenes to prevent excessive volatility.'
  },
  {
    currency: 'GBP',
    type: 'free_float',
    description: 'Free Floating',
    peggedTo: null,
    flexibility: 5,
    details: 'Sterling floats freely since leaving the ERM in 1992 (Black Wednesday).'
  },
  {
    currency: 'CHF',
    type: 'managed_float',
    description: 'Managed Float',
    peggedTo: null,
    flexibility: 4,
    details: 'Floats freely but SNB intervenes to prevent excessive appreciation. Previously had EUR floor (2011-2015).'
  },
  {
    currency: 'CNY',
    type: 'managed_float',
    description: 'Managed Float',
    peggedTo: 'USD basket',
    flexibility: 2,
    details: 'Daily fixing rate set by PBoC with ±2% band. Referenced to a basket of currencies dominated by USD.'
  },
  {
    currency: 'CNH',
    type: 'managed_float',
    description: 'Offshore Managed Float',
    peggedTo: 'CNY reference',
    flexibility: 3,
    details: 'Offshore yuan trades more freely than onshore CNY but closely tracks the onshore rate.'
  },
  {
    currency: 'HKD',
    type: 'currency_board',
    description: 'Currency Board (USD Peg)',
    peggedTo: 'USD',
    flexibility: 1,
    details: 'Pegged to USD at 7.75-7.85 range since 1983. HKMA maintains full foreign reserve backing.'
  },
  {
    currency: 'SGD',
    type: 'managed_float',
    description: 'Managed Float (Basket)',
    peggedTo: 'Trade-weighted basket',
    flexibility: 3,
    details: 'MAS manages SGD against undisclosed trade-weighted basket within policy band.'
  },
  {
    currency: 'AUD',
    type: 'free_float',
    description: 'Free Floating',
    peggedTo: null,
    flexibility: 5,
    details: 'Floated in 1983. Major commodity currency closely tied to China trade.'
  },
  {
    currency: 'NZD',
    type: 'free_float',
    description: 'Free Floating',
    peggedTo: null,
    flexibility: 5,
    details: 'Floated in 1985. Small, open economy with free capital flows.'
  },
  {
    currency: 'CAD',
    type: 'free_float',
    description: 'Free Floating',
    peggedTo: null,
    flexibility: 5,
    details: 'Floated since 1970. Commodity currency influenced by oil prices and US trade.'
  },
  {
    currency: 'SEK',
    type: 'free_float',
    description: 'Free Floating',
    peggedTo: null,
    flexibility: 5,
    details: 'Floated since 1992 after ERM crisis. Inflation targeting regime.'
  },
  {
    currency: 'NOK',
    type: 'free_float',
    description: 'Free Floating',
    peggedTo: null,
    flexibility: 5,
    details: 'Floated since 1992. Major oil currency managed under inflation targeting.'
  },
  {
    currency: 'MXN',
    type: 'free_float',
    description: 'Free Floating',
    peggedTo: null,
    flexibility: 5,
    details: 'Floated since 1994 peso crisis. Now one of most traded EM currencies.'
  },
  {
    currency: 'BRL',
    type: 'free_float',
    description: 'Free Floating',
    peggedTo: null,
    flexibility: 4,
    details: 'Floated since 1999. BCB occasionally intervenes via swaps and spot market.'
  },
  {
    currency: 'INR',
    type: 'managed_float',
    description: 'Managed Float',
    peggedTo: null,
    flexibility: 3,
    details: 'RBI manages rupee to prevent excessive volatility. Gradual capital account liberalization.'
  },
  {
    currency: 'ZAR',
    type: 'free_float',
    description: 'Free Floating',
    peggedTo: null,
    flexibility: 5,
    details: 'Floated since 1995. High volatility due to twin deficits and EM sentiment.'
  },
  {
    currency: 'TRY',
    type: 'free_float',
    description: 'Free Floating',
    peggedTo: null,
    flexibility: 5,
    details: 'Officially free floating but subject to heavy political influence. High inflation environment.'
  },
  {
    currency: 'RUB',
    type: 'managed_float',
    description: 'Managed Float',
    peggedTo: null,
    flexibility: 2,
    details: 'Heavy capital controls since 2022. CBR manages rate through interventions and regulations.'
  }
];

// ============================================
// RESERVE CURRENCY SHARES (IMF COFER Data)
// ============================================

export const RESERVE_SHARES: ReserveShare[] = [
  { year: 2000, USD: 71.1, EUR: 18.3, JPY: 6.1, GBP: 2.8, CNY: 0.0, CHF: 0.3, AUD: 0.0, CAD: 0.0, other: 1.4 },
  { year: 2001, USD: 71.5, EUR: 19.2, JPY: 5.0, GBP: 2.7, CNY: 0.0, CHF: 0.3, AUD: 0.0, CAD: 0.0, other: 1.3 },
  { year: 2002, USD: 67.1, EUR: 23.8, JPY: 4.4, GBP: 2.8, CNY: 0.0, CHF: 0.4, AUD: 0.0, CAD: 0.0, other: 1.5 },
  { year: 2003, USD: 65.9, EUR: 25.2, JPY: 4.0, GBP: 2.8, CNY: 0.0, CHF: 0.2, AUD: 0.0, CAD: 0.0, other: 1.9 },
  { year: 2004, USD: 65.9, EUR: 24.8, JPY: 3.9, GBP: 3.4, CNY: 0.0, CHF: 0.2, AUD: 0.0, CAD: 0.0, other: 1.8 },
  { year: 2005, USD: 66.5, EUR: 24.0, JPY: 3.6, GBP: 3.6, CNY: 0.0, CHF: 0.1, AUD: 0.0, CAD: 0.0, other: 2.2 },
  { year: 2006, USD: 65.5, EUR: 25.1, JPY: 3.1, GBP: 4.4, CNY: 0.0, CHF: 0.2, AUD: 0.0, CAD: 0.0, other: 1.7 },
  { year: 2007, USD: 64.1, EUR: 26.1, JPY: 2.9, GBP: 4.7, CNY: 0.0, CHF: 0.2, AUD: 0.0, CAD: 0.0, other: 2.0 },
  { year: 2008, USD: 64.1, EUR: 26.4, JPY: 3.1, GBP: 4.0, CNY: 0.0, CHF: 0.1, AUD: 0.0, CAD: 0.0, other: 2.3 },
  { year: 2009, USD: 62.1, EUR: 27.7, JPY: 2.9, GBP: 4.2, CNY: 0.0, CHF: 0.1, AUD: 0.0, CAD: 0.0, other: 3.0 },
  { year: 2010, USD: 62.2, EUR: 26.0, JPY: 3.7, GBP: 3.9, CNY: 0.0, CHF: 0.1, AUD: 0.0, CAD: 0.0, other: 4.1 },
  { year: 2011, USD: 62.6, EUR: 24.4, JPY: 3.6, GBP: 3.8, CNY: 0.0, CHF: 0.1, AUD: 0.0, CAD: 0.0, other: 5.5 },
  { year: 2012, USD: 61.5, EUR: 24.1, JPY: 4.1, GBP: 4.0, CNY: 0.0, CHF: 0.2, AUD: 1.5, CAD: 1.4, other: 3.2 },
  { year: 2013, USD: 61.2, EUR: 24.2, JPY: 3.8, GBP: 4.0, CNY: 0.0, CHF: 0.3, AUD: 1.8, CAD: 1.8, other: 2.9 },
  { year: 2014, USD: 63.3, EUR: 22.0, JPY: 3.9, GBP: 3.8, CNY: 0.0, CHF: 0.3, AUD: 1.9, CAD: 1.9, other: 2.9 },
  { year: 2015, USD: 65.7, EUR: 19.1, JPY: 3.8, GBP: 4.7, CNY: 0.0, CHF: 0.3, AUD: 1.8, CAD: 1.8, other: 2.8 },
  { year: 2016, USD: 65.4, EUR: 19.1, JPY: 4.0, GBP: 4.3, CNY: 1.1, CHF: 0.2, AUD: 1.7, CAD: 1.9, other: 2.3 },
  { year: 2017, USD: 62.7, EUR: 20.2, JPY: 4.9, GBP: 4.5, CNY: 1.2, CHF: 0.2, AUD: 1.8, CAD: 2.0, other: 2.5 },
  { year: 2018, USD: 61.7, EUR: 20.7, JPY: 5.2, GBP: 4.4, CNY: 1.9, CHF: 0.1, AUD: 1.6, CAD: 1.8, other: 2.6 },
  { year: 2019, USD: 60.9, EUR: 20.6, JPY: 5.9, GBP: 4.6, CNY: 2.0, CHF: 0.2, AUD: 1.7, CAD: 1.9, other: 2.2 },
  { year: 2020, USD: 59.0, EUR: 21.2, JPY: 6.0, GBP: 4.7, CNY: 2.3, CHF: 0.2, AUD: 1.8, CAD: 2.1, other: 2.7 },
  { year: 2021, USD: 58.8, EUR: 20.6, JPY: 5.6, GBP: 4.8, CNY: 2.8, CHF: 0.2, AUD: 1.8, CAD: 2.4, other: 3.0 },
  { year: 2022, USD: 58.4, EUR: 20.5, JPY: 5.5, GBP: 4.9, CNY: 2.7, CHF: 0.2, AUD: 1.9, CAD: 2.4, other: 3.5 },
  { year: 2023, USD: 58.4, EUR: 20.0, JPY: 5.7, GBP: 4.8, CNY: 2.4, CHF: 0.2, AUD: 2.0, CAD: 2.5, other: 4.0 },
  { year: 2024, USD: 57.8, EUR: 19.8, JPY: 5.6, GBP: 4.9, CNY: 2.2, CHF: 0.2, AUD: 2.1, CAD: 2.6, other: 4.8 }
];

// ============================================
// SAFE HAVEN CLASSIFICATIONS
// ============================================

export const SAFE_HAVEN_CURRENCIES: SafeHavenCurrency[] = [
  {
    currency: 'USD',
    category: 'primary',
    score: 95,
    description: 'Ultimate safe haven - global reserve currency',
    characteristics: ['Reserve currency', 'Deep liquid markets', 'US Treasury backing', 'Flight to quality destination']
  },
  {
    currency: 'JPY',
    category: 'primary',
    score: 90,
    description: 'Traditional safe haven - low yields drive repatriation flows',
    characteristics: ['Net creditor nation', 'Current account surplus', 'Carry trade unwind beneficiary', 'Low inflation history']
  },
  {
    currency: 'CHF',
    category: 'primary',
    score: 88,
    description: 'Classic safe haven - Swiss neutrality and banking secrecy',
    characteristics: ['Political neutrality', 'Strong banking system', 'Low debt', 'Current account surplus']
  },
  {
    currency: 'EUR',
    category: 'secondary',
    score: 70,
    description: 'Partial safe haven - second largest reserve currency',
    characteristics: ['Large economy', 'Liquid markets', 'But: sovereign debt concerns', 'Fragmented fiscal policy']
  },
  {
    currency: 'GBP',
    category: 'secondary',
    score: 65,
    description: 'Partial safe haven - historical reserve currency',
    characteristics: ['Deep markets', 'Rule of law', 'But: twin deficits', 'Brexit uncertainty']
  },
  {
    currency: 'SGD',
    category: 'secondary',
    score: 60,
    description: 'Regional safe haven - Asian financial hub',
    characteristics: ['Strong reserves', 'AAA rating', 'Political stability', 'Regional hub']
  },
  {
    currency: 'CAD',
    category: 'neutral',
    score: 50,
    description: 'Neutral - commodity exposure offsets safe haven traits',
    characteristics: ['Stable democracy', 'Resource rich', 'But: commodity sensitivity', 'US economic linkage']
  },
  {
    currency: 'AUD',
    category: 'risk_on',
    score: 35,
    description: 'Risk-on currency - commodity and China exposure',
    characteristics: ['Commodity exporter', 'China trade dependent', 'Higher yields', 'Risk sentiment sensitive']
  },
  {
    currency: 'NZD',
    category: 'risk_on',
    score: 30,
    description: 'Risk-on currency - small open economy',
    characteristics: ['Small open economy', 'Commodity sensitive', 'Higher yields', 'Carry trade target']
  },
  {
    currency: 'SEK',
    category: 'neutral',
    score: 45,
    description: 'Neutral with risk-on bias - eurozone exposure',
    characteristics: ['Export dependent', 'Strong fundamentals', 'But: eurozone sensitivity', 'Small float']
  },
  {
    currency: 'NOK',
    category: 'risk_on',
    score: 40,
    description: 'Petrocurrency - oil price sensitive',
    characteristics: ['Oil dependent', 'Strong SWF', 'But: commodity volatility', 'Small market']
  },
  {
    currency: 'MXN',
    category: 'risk_on',
    score: 20,
    description: 'High-beta EM currency - US trade dependent',
    characteristics: ['US trade linkage', 'High yields', 'EM risk premium', 'Carry trade target']
  },
  {
    currency: 'BRL',
    category: 'risk_on',
    score: 15,
    description: 'High-beta EM currency - commodity and political risk',
    characteristics: ['Commodity exporter', 'Political volatility', 'High inflation history', 'Carry trade target']
  },
  {
    currency: 'ZAR',
    category: 'risk_on',
    score: 15,
    description: 'High-beta EM currency - twin deficits',
    characteristics: ['Current account deficit', 'Political risk', 'High yields', 'EM bellwether']
  },
  {
    currency: 'TRY',
    category: 'risk_on',
    score: 5,
    description: 'Extreme risk currency - policy uncertainty',
    characteristics: ['Hyperinflation risk', 'Policy unpredictability', 'Political interference', 'External vulnerabilities']
  },
  {
    currency: 'RUB',
    category: 'risk_on',
    score: 10,
    description: 'Sanctioned currency - geopolitical risk',
    characteristics: ['Sanctions exposure', 'Capital controls', 'Commodity dependent', 'Geopolitical risk']
  },
  {
    currency: 'INR',
    category: 'risk_on',
    score: 25,
    description: 'Managed EM currency - growth story',
    characteristics: ['Current account deficit', 'Managed exchange rate', 'Growth premium', 'RBI intervention']
  },
  {
    currency: 'CNY',
    category: 'neutral',
    score: 40,
    description: 'Managed currency - increasingly global',
    characteristics: ['Capital controls', 'Managed rate', 'Growing reserves use', 'Policy driven']
  }
];

// ============================================
// REER DATA (Real Effective Exchange Rate)
// ============================================

export const REER_DATA: REERData[] = [
  { currency: 'USD', current: 116.5, historicalAverage: 100, deviation: 16.5, isOvervalued: true, trend: 'appreciating', lastUpdated: '2024-Q4' },
  { currency: 'EUR', current: 94.2, historicalAverage: 100, deviation: -5.8, isOvervalued: false, trend: 'depreciating', lastUpdated: '2024-Q4' },
  { currency: 'JPY', current: 71.3, historicalAverage: 100, deviation: -28.7, isOvervalued: false, trend: 'depreciating', lastUpdated: '2024-Q4' },
  { currency: 'GBP', current: 88.4, historicalAverage: 100, deviation: -11.6, isOvervalued: false, trend: 'stable', lastUpdated: '2024-Q4' },
  { currency: 'CHF', current: 127.8, historicalAverage: 100, deviation: 27.8, isOvervalued: true, trend: 'appreciating', lastUpdated: '2024-Q4' },
  { currency: 'CNY', current: 95.6, historicalAverage: 100, deviation: -4.4, isOvervalued: false, trend: 'depreciating', lastUpdated: '2024-Q4' },
  { currency: 'AUD', current: 89.7, historicalAverage: 100, deviation: -10.3, isOvervalued: false, trend: 'depreciating', lastUpdated: '2024-Q4' },
  { currency: 'CAD', current: 93.2, historicalAverage: 100, deviation: -6.8, isOvervalued: false, trend: 'stable', lastUpdated: '2024-Q4' },
  { currency: 'NZD', current: 91.5, historicalAverage: 100, deviation: -8.5, isOvervalued: false, trend: 'depreciating', lastUpdated: '2024-Q4' },
  { currency: 'SEK', current: 82.4, historicalAverage: 100, deviation: -17.6, isOvervalued: false, trend: 'depreciating', lastUpdated: '2024-Q4' },
  { currency: 'NOK', current: 84.1, historicalAverage: 100, deviation: -15.9, isOvervalued: false, trend: 'depreciating', lastUpdated: '2024-Q4' },
  { currency: 'MXN', current: 118.2, historicalAverage: 100, deviation: 18.2, isOvervalued: true, trend: 'appreciating', lastUpdated: '2024-Q4' },
  { currency: 'BRL', current: 78.5, historicalAverage: 100, deviation: -21.5, isOvervalued: false, trend: 'depreciating', lastUpdated: '2024-Q4' },
  { currency: 'INR', current: 97.8, historicalAverage: 100, deviation: -2.2, isOvervalued: false, trend: 'stable', lastUpdated: '2024-Q4' },
  { currency: 'ZAR', current: 72.3, historicalAverage: 100, deviation: -27.7, isOvervalued: false, trend: 'depreciating', lastUpdated: '2024-Q4' },
  { currency: 'TRY', current: 45.2, historicalAverage: 100, deviation: -54.8, isOvervalued: false, trend: 'depreciating', lastUpdated: '2024-Q4' },
  { currency: 'RUB', current: 108.5, historicalAverage: 100, deviation: 8.5, isOvervalued: true, trend: 'appreciating', lastUpdated: '2024-Q4' }
];

// ============================================
// ECONOMIC CALENDAR
// ============================================

export const ECONOMIC_CALENDAR: EconomicEvent[] = [
  // January 2025
  {
    id: 'fomc-jan-25',
    date: '2025-01-29',
    time: '19:00 UTC',
    event: 'FOMC Interest Rate Decision',
    currency: 'USD',
    importance: 'high',
    forecast: '5.25%',
    previous: '5.25%',
    description: 'Federal Reserve monetary policy decision and statement'
  },
  {
    id: 'ecb-jan-25',
    date: '2025-01-30',
    time: '13:15 UTC',
    event: 'ECB Interest Rate Decision',
    currency: 'EUR',
    importance: 'high',
    forecast: '3.75%',
    previous: '4.00%',
    description: 'European Central Bank monetary policy decision'
  },
  {
    id: 'boj-jan-25',
    date: '2025-01-24',
    time: '03:00 UTC',
    event: 'BoJ Interest Rate Decision',
    currency: 'JPY',
    importance: 'high',
    forecast: '0.25%',
    previous: '0.25%',
    description: 'Bank of Japan monetary policy statement'
  },
  {
    id: 'boc-jan-25',
    date: '2025-01-29',
    time: '15:00 UTC',
    event: 'BoC Interest Rate Decision',
    currency: 'CAD',
    importance: 'high',
    forecast: '3.00%',
    previous: '3.25%',
    description: 'Bank of Canada overnight rate decision'
  },
  {
    id: 'norges-jan-25',
    date: '2025-01-23',
    time: '09:00 UTC',
    event: 'Norges Bank Rate Decision',
    currency: 'NOK',
    importance: 'medium',
    forecast: '4.50%',
    previous: '4.50%',
    description: 'Norwegian central bank policy rate decision'
  },
  {
    id: 'riksbank-jan-25',
    date: '2025-01-29',
    time: '08:30 UTC',
    event: 'Riksbank Rate Decision',
    currency: 'SEK',
    importance: 'medium',
    forecast: '2.25%',
    previous: '2.50%',
    description: 'Swedish central bank repo rate decision'
  },
  // February 2025
  {
    id: 'boe-feb-25',
    date: '2025-02-06',
    time: '12:00 UTC',
    event: 'BoE Interest Rate Decision',
    currency: 'GBP',
    importance: 'high',
    forecast: '4.50%',
    previous: '4.75%',
    description: 'Bank of England bank rate decision'
  },
  {
    id: 'rba-feb-25',
    date: '2025-02-18',
    time: '03:30 UTC',
    event: 'RBA Interest Rate Decision',
    currency: 'AUD',
    importance: 'high',
    forecast: '4.35%',
    previous: '4.35%',
    description: 'Reserve Bank of Australia cash rate decision'
  },
  {
    id: 'rbnz-feb-25',
    date: '2025-02-19',
    time: '01:00 UTC',
    event: 'RBNZ Interest Rate Decision',
    currency: 'NZD',
    importance: 'high',
    forecast: '4.00%',
    previous: '4.25%',
    description: 'Reserve Bank of New Zealand OCR decision'
  },
  {
    id: 'banxico-feb-25',
    date: '2025-02-06',
    time: '19:00 UTC',
    event: 'Banxico Interest Rate Decision',
    currency: 'MXN',
    importance: 'medium',
    forecast: '9.75%',
    previous: '10.00%',
    description: 'Banco de Mexico overnight rate decision'
  },
  {
    id: 'rbi-feb-25',
    date: '2025-02-07',
    time: '05:00 UTC',
    event: 'RBI Interest Rate Decision',
    currency: 'INR',
    importance: 'medium',
    forecast: '6.25%',
    previous: '6.50%',
    description: 'Reserve Bank of India repo rate decision'
  },
  // Other key events
  {
    id: 'us-nfp-jan-25',
    date: '2025-01-10',
    time: '13:30 UTC',
    event: 'US Non-Farm Payrolls',
    currency: 'USD',
    importance: 'high',
    forecast: '+175K',
    previous: '+227K',
    description: 'Monthly US employment report'
  },
  {
    id: 'us-cpi-jan-25',
    date: '2025-01-15',
    time: '13:30 UTC',
    event: 'US CPI Inflation',
    currency: 'USD',
    importance: 'high',
    forecast: '2.8% YoY',
    previous: '2.7% YoY',
    description: 'US Consumer Price Index monthly release'
  },
  {
    id: 'eu-gdp-jan-25',
    date: '2025-01-30',
    time: '10:00 UTC',
    event: 'Eurozone GDP Flash',
    currency: 'EUR',
    importance: 'high',
    forecast: '0.8% YoY',
    previous: '0.9% YoY',
    description: 'Eurozone preliminary GDP estimate'
  },
  {
    id: 'china-pmi-jan-25',
    date: '2025-01-31',
    time: '01:30 UTC',
    event: 'China Manufacturing PMI',
    currency: 'CNY',
    importance: 'high',
    forecast: '50.2',
    previous: '50.1',
    description: 'Official NBS Manufacturing PMI'
  }
];

// ============================================
// HISTORICAL EXCHANGE RATE DATA (Sample)
// ============================================

const generateHistoricalData = (
  base: CurrencyCode,
  quote: CurrencyCode,
  startRate: number,
  volatility: number,
  years: number
): CurrencyHistoricalData => {
  const rates: HistoricalRate[] = [];
  let currentRate = startRate;
  const today = new Date();
  
  for (let i = years * 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Random walk with mean reversion
    const change = (Math.random() - 0.5) * volatility;
    const meanReversion = (startRate - currentRate) * 0.001;
    currentRate = currentRate * (1 + change + meanReversion);
    
    rates.push({
      date: date.toISOString().split('T')[0],
      rate: parseFloat(currentRate.toFixed(4))
    });
  }
  
  return { baseCurrency: base, quoteCurrency: quote, rates };
};

export const HISTORICAL_RATES: { [key: string]: CurrencyHistoricalData } = {
  'EUR/USD': generateHistoricalData('EUR', 'USD', 1.08, 0.005, 5),
  'GBP/USD': generateHistoricalData('GBP', 'USD', 1.26, 0.006, 5),
  'USD/JPY': generateHistoricalData('USD', 'JPY', 148, 0.007, 5),
  'USD/CHF': generateHistoricalData('USD', 'CHF', 0.88, 0.005, 5),
  'AUD/USD': generateHistoricalData('AUD', 'USD', 0.65, 0.008, 5),
  'USD/CAD': generateHistoricalData('USD', 'CAD', 1.36, 0.005, 5),
  'NZD/USD': generateHistoricalData('NZD', 'USD', 0.61, 0.008, 5),
  'EUR/GBP': generateHistoricalData('EUR', 'GBP', 0.86, 0.004, 5),
  'EUR/JPY': generateHistoricalData('EUR', 'JPY', 160, 0.007, 5),
  'GBP/JPY': generateHistoricalData('GBP', 'JPY', 186, 0.008, 5)
};

// ============================================
// CURRENCY CORRELATIONS
// ============================================

export const CURRENCY_CORRELATIONS: CurrencyCorrelation[] = [
  // USD correlations
  { currency1: 'EUR', currency2: 'USD', correlation: -0.95, period: '1Y' },
  { currency1: 'GBP', currency2: 'USD', correlation: -0.78, period: '1Y' },
  { currency1: 'JPY', currency2: 'USD', correlation: -0.42, period: '1Y' },
  { currency1: 'CHF', currency2: 'USD', correlation: -0.88, period: '1Y' },
  { currency1: 'AUD', currency2: 'USD', correlation: -0.72, period: '1Y' },
  { currency1: 'CAD', currency2: 'USD', correlation: -0.65, period: '1Y' },
  { currency1: 'NZD', currency2: 'USD', correlation: -0.68, period: '1Y' },
  
  // EUR correlations
  { currency1: 'EUR', currency2: 'GBP', correlation: 0.82, period: '1Y' },
  { currency1: 'EUR', currency2: 'CHF', correlation: 0.91, period: '1Y' },
  { currency1: 'EUR', currency2: 'SEK', correlation: 0.75, period: '1Y' },
  { currency1: 'EUR', currency2: 'NOK', correlation: 0.68, period: '1Y' },
  
  // Commodity currencies
  { currency1: 'AUD', currency2: 'NZD', correlation: 0.89, period: '1Y' },
  { currency1: 'AUD', currency2: 'CAD', correlation: 0.72, period: '1Y' },
  { currency1: 'NZD', currency2: 'CAD', correlation: 0.65, period: '1Y' },
  { currency1: 'NOK', currency2: 'CAD', correlation: 0.58, period: '1Y' },
  
  // EM correlations
  { currency1: 'MXN', currency2: 'BRL', correlation: 0.62, period: '1Y' },
  { currency1: 'MXN', currency2: 'ZAR', correlation: 0.55, period: '1Y' },
  { currency1: 'BRL', currency2: 'ZAR', correlation: 0.68, period: '1Y' },
  { currency1: 'TRY', currency2: 'ZAR', correlation: 0.45, period: '1Y' },
  
  // Safe haven correlations
  { currency1: 'JPY', currency2: 'CHF', correlation: 0.72, period: '1Y' },
  { currency1: 'JPY', currency2: 'GBP', correlation: 0.38, period: '1Y' },
  { currency1: 'CHF', currency2: 'GBP', correlation: 0.65, period: '1Y' }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getCentralBankRate = (currency: CurrencyCode): CentralBankRate | undefined => {
  return CENTRAL_BANK_RATES.find(rate => rate.currency === currency);
};

export const getCurrencyRegime = (currency: CurrencyCode): CurrencyRegime | undefined => {
  return CURRENCY_REGIMES.find(regime => regime.currency === currency);
};

export const getSafeHavenInfo = (currency: CurrencyCode): SafeHavenCurrency | undefined => {
  return SAFE_HAVEN_CURRENCIES.find(sh => sh.currency === currency);
};

export const getREERData = (currency: CurrencyCode): REERData | undefined => {
  return REER_DATA.find(reer => reer.currency === currency);
};

export const getUpcomingEvents = (currency?: CurrencyCode, days: number = 30): EconomicEvent[] => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);
  
  return ECONOMIC_CALENDAR
    .filter(event => {
      const eventDate = new Date(event.date);
      const isInRange = eventDate >= today && eventDate <= futureDate;
      const matchesCurrency = !currency || event.currency === currency;
      return isInRange && matchesCurrency;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getCorrelation = (currency1: CurrencyCode, currency2: CurrencyCode): number | undefined => {
  const correlation = CURRENCY_CORRELATIONS.find(
    c => (c.currency1 === currency1 && c.currency2 === currency2) ||
         (c.currency1 === currency2 && c.currency2 === currency1)
  );
  
  if (!correlation) return undefined;
  
  // If reversed, return the same correlation (symmetric)
  return correlation.correlation;
};

export const getHistoricalRates = (pair: string): HistoricalRate[] | undefined => {
  return HISTORICAL_RATES[pair]?.rates;
};

export const getLatestReserveShares = (): ReserveShare => {
  return RESERVE_SHARES[RESERVE_SHARES.length - 1];
};

// Export default for convenience
export default {
  CENTRAL_BANK_RATES,
  CURRENCY_REGIMES,
  RESERVE_SHARES,
  SAFE_HAVEN_CURRENCIES,
  REER_DATA,
  ECONOMIC_CALENDAR,
  HISTORICAL_RATES,
  CURRENCY_CORRELATIONS,
  getCentralBankRate,
  getCurrencyRegime,
  getSafeHavenInfo,
  getREERData,
  getUpcomingEvents,
  getCorrelation,
  getHistoricalRates,
  getLatestReserveShares
};

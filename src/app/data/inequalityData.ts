// ─────────────────────────────────────────────────────────────────────────────
// Inequality Data — rooted in Piketty's "Capital in the Twenty-First Century"
// ─────────────────────────────────────────────────────────────────────────────

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface RvsGPoint {
  year: number;
  rateOfReturn: number; // r — pure rate of return on capital (%)
  growthRate: number;    // g — growth rate of world output (%)
  era: string;
}

export interface CapitalIncomeRatioPoint {
  year: number;
  country: string;
  beta: number; // capital/income ratio (%)
}

export interface TopSharePoint {
  year: number;
  country: string;
  top1: number;    // top 1% share (%)
  top10: number;   // top 10% share (%)
  bottom50: number; // bottom 50% share (%)
}

export interface TopWealthPoint {
  year: number;
  country: string;
  top1: number;
  top10: number;
}

export interface KuznetsPoint {
  country: string;
  gdpPerCapita: number; // PPP USD
  gini: number;
  region: string;
}

export interface KuznetsCurvePoint {
  gdpPerCapita: number;
  gini: number;
}

export interface ElephantCurvePoint {
  percentile: number;
  growthRate: number; // cumulative real income growth 1988-2008 (%)
}

export interface InheritanceFlowPoint {
  year: number;
  annualFlow: number; // % of national income
  country: string;
}

export interface TaxHistoryPoint {
  year: number;
  country: string;
  topMarginalRate: number;
  capitalGainsRate: number | null;
}

export interface InequalityMilestone {
  year: number;
  event: string;
  impact: string;
  direction: 'equalising' | 'disequalising' | 'neutral';
}

export interface AcademicSource {
  author: string;
  year: number;
  title: string;
  keyInsight: string;
  category: 'primary' | 'supporting';
}

export interface PikettyLaw {
  name: string;
  formula: string;
  explanation: string;
  implication: string;
}

export interface WealthComposition {
  country: string;
  year: number;
  housing: number;    // % of total wealth
  financial: number;
  business: number;
  pensions: number;
  other: number;
}

export interface CountryTrajectory {
  country: string;
  color: string;
  points: { year: number; gdpPerCapita: number; gini: number }[];
}

// ── Piketty's Three Fundamental Laws ─────────────────────────────────────────

export const PIKETTY_LAWS: PikettyLaw[] = [
  {
    name: 'The First Fundamental Law of Capitalism',
    formula: 'α = r × β',
    explanation: 'The share of capital income in national income (α) equals the rate of return on capital (r) multiplied by the capital/income ratio (β). If the capital stock is 600% of national income and the average return is 5%, then capital\'s share of income is 30%.',
    implication: 'This is an accounting identity that holds in all economies. It links three key variables: the capital share, the return on capital, and the stock of capital relative to income.',
  },
  {
    name: 'The Second Fundamental Law of Capitalism',
    formula: 'β = s / g',
    explanation: 'In the long run, the capital/income ratio (β) tends toward the savings rate (s) divided by the growth rate (g). A country that saves 12% of national income and grows at 2% will accumulate capital equal to 600% of national income.',
    implication: 'Low-growth societies automatically accumulate enormous capital stocks. As growth slows in the 21st century, capital/income ratios will rise to levels not seen since the Belle Époque, amplifying the power of inherited wealth.',
  },
  {
    name: 'The Central Contradiction of Capitalism',
    formula: 'r > g',
    explanation: 'When the rate of return on capital (r) exceeds the growth rate of the economy (g), wealth concentrates automatically. Past wealth grows faster than the economy, so inherited fortunes dominate earned income. This has been the historical norm — the 20th century was the exception.',
    implication: 'Piketty\'s central thesis: r > g is the "fundamental force for divergence." Without progressive taxation or other interventions, wealth inequality will return to 19th-century levels. The egalitarian mid-20th century was produced by wars and deliberate policy, not by market forces.',
  },
];

// ── r vs g: Rate of Return on Capital vs Growth ──────────────────────────────
// Based on Piketty (2014) Figure 10.9-10.11

export const PIKETTY_R_VS_G: RvsGPoint[] = [
  { year: 0, rateOfReturn: 4.5, growthRate: 0.1, era: 'Antiquity' },
  { year: 200, rateOfReturn: 4.5, growthRate: 0.1, era: 'Antiquity' },
  { year: 500, rateOfReturn: 4.5, growthRate: 0.1, era: 'Early Medieval' },
  { year: 800, rateOfReturn: 4.5, growthRate: 0.2, era: 'Medieval' },
  { year: 1000, rateOfReturn: 4.5, growthRate: 0.2, era: 'Medieval' },
  { year: 1200, rateOfReturn: 4.5, growthRate: 0.3, era: 'High Medieval' },
  { year: 1500, rateOfReturn: 4.5, growthRate: 0.3, era: 'Early Modern' },
  { year: 1700, rateOfReturn: 4.5, growthRate: 0.5, era: 'Pre-Industrial' },
  { year: 1750, rateOfReturn: 4.5, growthRate: 0.6, era: 'Early Industrial' },
  { year: 1800, rateOfReturn: 5.0, growthRate: 0.8, era: 'Industrial Revolution' },
  { year: 1820, rateOfReturn: 5.0, growthRate: 1.0, era: 'Industrial Revolution' },
  { year: 1850, rateOfReturn: 5.0, growthRate: 1.5, era: 'Railway Age' },
  { year: 1870, rateOfReturn: 5.0, growthRate: 1.5, era: 'Gilded Age' },
  { year: 1900, rateOfReturn: 5.0, growthRate: 2.0, era: 'Belle Époque' },
  { year: 1913, rateOfReturn: 5.0, growthRate: 2.1, era: 'Pre-WWI Peak' },
  { year: 1920, rateOfReturn: 3.5, growthRate: 1.5, era: 'Post-WWI' },
  { year: 1930, rateOfReturn: 2.5, growthRate: -1.0, era: 'Great Depression' },
  { year: 1940, rateOfReturn: 2.0, growthRate: 3.0, era: 'WWII' },
  { year: 1950, rateOfReturn: 3.0, growthRate: 4.0, era: 'Golden Age' },
  { year: 1960, rateOfReturn: 3.5, growthRate: 4.5, era: 'Golden Age' },
  { year: 1970, rateOfReturn: 3.5, growthRate: 3.5, era: 'Golden Age Ends' },
  { year: 1980, rateOfReturn: 4.5, growthRate: 3.0, era: 'Neoliberal Turn' },
  { year: 1990, rateOfReturn: 4.5, growthRate: 3.0, era: 'Globalisation' },
  { year: 2000, rateOfReturn: 4.5, growthRate: 3.5, era: 'Dot-com Era' },
  { year: 2010, rateOfReturn: 4.5, growthRate: 3.0, era: 'Post-Crisis' },
  { year: 2020, rateOfReturn: 4.5, growthRate: 2.0, era: 'Pandemic Era' },
  { year: 2030, rateOfReturn: 4.5, growthRate: 2.5, era: 'Projected' },
  { year: 2050, rateOfReturn: 4.5, growthRate: 2.0, era: 'Projected' },
  { year: 2070, rateOfReturn: 4.5, growthRate: 1.5, era: 'Projected' },
  { year: 2100, rateOfReturn: 4.5, growthRate: 1.5, era: 'Projected' },
];

// ── Capital / Income Ratio (β) ───────────────────────────────────────────────
// Based on Piketty (2014) Figures 3.1, 3.2, 4.6, 5.1-5.3

export const CAPITAL_INCOME_RATIO: CapitalIncomeRatioPoint[] = [
  // United Kingdom
  { year: 1700, country: 'UK', beta: 700 },
  { year: 1750, country: 'UK', beta: 680 },
  { year: 1800, country: 'UK', beta: 700 },
  { year: 1850, country: 'UK', beta: 650 },
  { year: 1880, country: 'UK', beta: 680 },
  { year: 1910, country: 'UK', beta: 700 },
  { year: 1920, country: 'UK', beta: 550 },
  { year: 1930, country: 'UK', beta: 500 },
  { year: 1940, country: 'UK', beta: 400 },
  { year: 1950, country: 'UK', beta: 300 },
  { year: 1960, country: 'UK', beta: 320 },
  { year: 1970, country: 'UK', beta: 360 },
  { year: 1980, country: 'UK', beta: 400 },
  { year: 1990, country: 'UK', beta: 470 },
  { year: 2000, country: 'UK', beta: 520 },
  { year: 2010, country: 'UK', beta: 550 },
  { year: 2020, country: 'UK', beta: 570 },

  // France
  { year: 1700, country: 'France', beta: 700 },
  { year: 1750, country: 'France', beta: 690 },
  { year: 1780, country: 'France', beta: 700 },
  { year: 1800, country: 'France', beta: 680 },
  { year: 1850, country: 'France', beta: 650 },
  { year: 1880, country: 'France', beta: 680 },
  { year: 1910, country: 'France', beta: 700 },
  { year: 1920, country: 'France', beta: 500 },
  { year: 1930, country: 'France', beta: 520 },
  { year: 1940, country: 'France', beta: 350 },
  { year: 1950, country: 'France', beta: 280 },
  { year: 1960, country: 'France', beta: 340 },
  { year: 1970, country: 'France', beta: 370 },
  { year: 1980, country: 'France', beta: 400 },
  { year: 1990, country: 'France', beta: 450 },
  { year: 2000, country: 'France', beta: 510 },
  { year: 2010, country: 'France', beta: 600 },
  { year: 2020, country: 'France', beta: 620 },

  // Germany
  { year: 1870, country: 'Germany', beta: 650 },
  { year: 1910, country: 'Germany', beta: 660 },
  { year: 1920, country: 'Germany', beta: 350 },
  { year: 1930, country: 'Germany', beta: 380 },
  { year: 1940, country: 'Germany', beta: 300 },
  { year: 1950, country: 'Germany', beta: 220 },
  { year: 1960, country: 'Germany', beta: 300 },
  { year: 1970, country: 'Germany', beta: 330 },
  { year: 1980, country: 'Germany', beta: 350 },
  { year: 1990, country: 'Germany', beta: 380 },
  { year: 2000, country: 'Germany', beta: 420 },
  { year: 2010, country: 'Germany', beta: 440 },
  { year: 2020, country: 'Germany', beta: 460 },

  // United States
  { year: 1770, country: 'USA', beta: 300 },
  { year: 1800, country: 'USA', beta: 350 },
  { year: 1850, country: 'USA', beta: 400 },
  { year: 1880, country: 'USA', beta: 450 },
  { year: 1910, country: 'USA', beta: 500 },
  { year: 1920, country: 'USA', beta: 480 },
  { year: 1930, country: 'USA', beta: 460 },
  { year: 1940, country: 'USA', beta: 380 },
  { year: 1950, country: 'USA', beta: 380 },
  { year: 1960, country: 'USA', beta: 400 },
  { year: 1970, country: 'USA', beta: 400 },
  { year: 1980, country: 'USA', beta: 420 },
  { year: 1990, country: 'USA', beta: 430 },
  { year: 2000, country: 'USA', beta: 460 },
  { year: 2010, country: 'USA', beta: 480 },
  { year: 2020, country: 'USA', beta: 500 },
];

// ── Top Income Shares ────────────────────────────────────────────────────────
// Based on Piketty & Saez (2003), World Inequality Database

export const TOP_INCOME_SHARES: TopSharePoint[] = [
  // United States
  { year: 1910, country: 'USA', top1: 18, top10: 45, bottom50: 18 },
  { year: 1920, country: 'USA', top1: 18, top10: 44, bottom50: 18 },
  { year: 1928, country: 'USA', top1: 24, top10: 50, bottom50: 14 },
  { year: 1932, country: 'USA', top1: 15, top10: 44, bottom50: 16 },
  { year: 1940, country: 'USA', top1: 16, top10: 44, bottom50: 17 },
  { year: 1944, country: 'USA', top1: 11, top10: 33, bottom50: 20 },
  { year: 1950, country: 'USA', top1: 11, top10: 33, bottom50: 20 },
  { year: 1960, country: 'USA', top1: 10, top10: 33, bottom50: 20 },
  { year: 1970, country: 'USA', top1: 9, top10: 33, bottom50: 20 },
  { year: 1975, country: 'USA', top1: 8, top10: 33, bottom50: 21 },
  { year: 1980, country: 'USA', top1: 10, top10: 34, bottom50: 20 },
  { year: 1985, country: 'USA', top1: 12, top10: 37, bottom50: 18 },
  { year: 1990, country: 'USA', top1: 14, top10: 40, bottom50: 16 },
  { year: 1995, country: 'USA', top1: 15, top10: 42, bottom50: 15 },
  { year: 2000, country: 'USA', top1: 22, top10: 47, bottom50: 13 },
  { year: 2005, country: 'USA', top1: 22, top10: 48, bottom50: 13 },
  { year: 2007, country: 'USA', top1: 24, top10: 50, bottom50: 12 },
  { year: 2010, country: 'USA', top1: 20, top10: 47, bottom50: 13 },
  { year: 2015, country: 'USA', top1: 22, top10: 47, bottom50: 13 },
  { year: 2020, country: 'USA', top1: 21, top10: 46, bottom50: 13 },
  { year: 2022, country: 'USA', top1: 21, top10: 47, bottom50: 13 },

  // France
  { year: 1910, country: 'France', top1: 22, top10: 48, bottom50: 13 },
  { year: 1920, country: 'France', top1: 18, top10: 44, bottom50: 15 },
  { year: 1930, country: 'France', top1: 18, top10: 44, bottom50: 15 },
  { year: 1940, country: 'France', top1: 14, top10: 38, bottom50: 17 },
  { year: 1945, country: 'France', top1: 10, top10: 32, bottom50: 20 },
  { year: 1950, country: 'France', top1: 10, top10: 33, bottom50: 20 },
  { year: 1960, country: 'France', top1: 9, top10: 33, bottom50: 21 },
  { year: 1970, country: 'France', top1: 9, top10: 32, bottom50: 22 },
  { year: 1980, country: 'France', top1: 8, top10: 30, bottom50: 23 },
  { year: 1990, country: 'France', top1: 8, top10: 32, bottom50: 22 },
  { year: 2000, country: 'France', top1: 10, top10: 33, bottom50: 21 },
  { year: 2010, country: 'France', top1: 11, top10: 33, bottom50: 21 },
  { year: 2020, country: 'France', top1: 12, top10: 34, bottom50: 21 },

  // United Kingdom
  { year: 1910, country: 'UK', top1: 22, top10: 50, bottom50: 12 },
  { year: 1920, country: 'UK', top1: 19, top10: 45, bottom50: 15 },
  { year: 1930, country: 'UK', top1: 17, top10: 42, bottom50: 16 },
  { year: 1940, country: 'UK', top1: 14, top10: 38, bottom50: 18 },
  { year: 1950, country: 'UK', top1: 12, top10: 33, bottom50: 20 },
  { year: 1960, country: 'UK', top1: 9, top10: 30, bottom50: 22 },
  { year: 1970, country: 'UK', top1: 8, top10: 28, bottom50: 23 },
  { year: 1978, country: 'UK', top1: 6, top10: 27, bottom50: 24 },
  { year: 1980, country: 'UK', top1: 7, top10: 29, bottom50: 23 },
  { year: 1990, country: 'UK', top1: 10, top10: 36, bottom50: 19 },
  { year: 2000, country: 'UK', top1: 13, top10: 39, bottom50: 18 },
  { year: 2010, country: 'UK', top1: 13, top10: 39, bottom50: 18 },
  { year: 2020, country: 'UK', top1: 14, top10: 39, bottom50: 18 },

  // Germany
  { year: 1910, country: 'Germany', top1: 18, top10: 44, bottom50: 17 },
  { year: 1920, country: 'Germany', top1: 13, top10: 38, bottom50: 19 },
  { year: 1930, country: 'Germany', top1: 15, top10: 40, bottom50: 18 },
  { year: 1938, country: 'Germany', top1: 16, top10: 42, bottom50: 17 },
  { year: 1950, country: 'Germany', top1: 12, top10: 34, bottom50: 20 },
  { year: 1960, country: 'Germany', top1: 11, top10: 32, bottom50: 22 },
  { year: 1970, country: 'Germany', top1: 11, top10: 32, bottom50: 22 },
  { year: 1980, country: 'Germany', top1: 10, top10: 31, bottom50: 23 },
  { year: 1990, country: 'Germany', top1: 10, top10: 33, bottom50: 22 },
  { year: 2000, country: 'Germany', top1: 12, top10: 36, bottom50: 19 },
  { year: 2010, country: 'Germany', top1: 13, top10: 37, bottom50: 18 },
  { year: 2020, country: 'Germany', top1: 13, top10: 37, bottom50: 18 },

  // Japan
  { year: 1910, country: 'Japan', top1: 20, top10: 44, bottom50: 16 },
  { year: 1930, country: 'Japan', top1: 19, top10: 43, bottom50: 16 },
  { year: 1940, country: 'Japan', top1: 18, top10: 42, bottom50: 17 },
  { year: 1945, country: 'Japan', top1: 8, top10: 28, bottom50: 24 },
  { year: 1950, country: 'Japan', top1: 8, top10: 29, bottom50: 24 },
  { year: 1960, country: 'Japan', top1: 8, top10: 30, bottom50: 23 },
  { year: 1970, country: 'Japan', top1: 8, top10: 31, bottom50: 23 },
  { year: 1980, country: 'Japan', top1: 8, top10: 32, bottom50: 22 },
  { year: 1990, country: 'Japan', top1: 9, top10: 35, bottom50: 21 },
  { year: 2000, country: 'Japan', top1: 10, top10: 36, bottom50: 20 },
  { year: 2010, country: 'Japan', top1: 10, top10: 35, bottom50: 20 },
  { year: 2020, country: 'Japan', top1: 10, top10: 35, bottom50: 20 },

  // Sweden
  { year: 1910, country: 'Sweden', top1: 27, top10: 52, bottom50: 11 },
  { year: 1920, country: 'Sweden', top1: 22, top10: 47, bottom50: 14 },
  { year: 1930, country: 'Sweden', top1: 18, top10: 43, bottom50: 16 },
  { year: 1945, country: 'Sweden', top1: 10, top10: 32, bottom50: 21 },
  { year: 1950, country: 'Sweden', top1: 9, top10: 30, bottom50: 22 },
  { year: 1960, country: 'Sweden', top1: 7, top10: 27, bottom50: 24 },
  { year: 1970, country: 'Sweden', top1: 6, top10: 25, bottom50: 26 },
  { year: 1980, country: 'Sweden', top1: 5, top10: 23, bottom50: 27 },
  { year: 1990, country: 'Sweden', top1: 6, top10: 26, bottom50: 25 },
  { year: 2000, country: 'Sweden', top1: 8, top10: 29, bottom50: 23 },
  { year: 2010, country: 'Sweden', top1: 9, top10: 30, bottom50: 23 },
  { year: 2020, country: 'Sweden', top1: 10, top10: 31, bottom50: 22 },

  // Canada
  { year: 1920, country: 'Canada', top1: 17, top10: 43, bottom50: 17 },
  { year: 1930, country: 'Canada', top1: 16, top10: 42, bottom50: 17 },
  { year: 1940, country: 'Canada', top1: 14, top10: 39, bottom50: 18 },
  { year: 1950, country: 'Canada', top1: 11, top10: 34, bottom50: 20 },
  { year: 1960, country: 'Canada', top1: 10, top10: 33, bottom50: 21 },
  { year: 1970, country: 'Canada', top1: 9, top10: 32, bottom50: 22 },
  { year: 1980, country: 'Canada', top1: 9, top10: 33, bottom50: 22 },
  { year: 1990, country: 'Canada', top1: 11, top10: 36, bottom50: 19 },
  { year: 2000, country: 'Canada', top1: 14, top10: 40, bottom50: 17 },
  { year: 2010, country: 'Canada', top1: 13, top10: 39, bottom50: 17 },
  { year: 2020, country: 'Canada', top1: 14, top10: 39, bottom50: 17 },

  // Brazil
  { year: 1960, country: 'Brazil', top1: 28, top10: 55, bottom50: 10 },
  { year: 1970, country: 'Brazil', top1: 30, top10: 58, bottom50: 9 },
  { year: 1980, country: 'Brazil', top1: 28, top10: 55, bottom50: 10 },
  { year: 1990, country: 'Brazil', top1: 27, top10: 55, bottom50: 10 },
  { year: 2000, country: 'Brazil', top1: 27, top10: 54, bottom50: 10 },
  { year: 2010, country: 'Brazil', top1: 28, top10: 55, bottom50: 10 },
  { year: 2015, country: 'Brazil', top1: 28, top10: 55, bottom50: 10 },
  { year: 2020, country: 'Brazil', top1: 27, top10: 54, bottom50: 10 },

  // India
  { year: 1922, country: 'India', top1: 21, top10: 50, bottom50: 12 },
  { year: 1940, country: 'India', top1: 16, top10: 42, bottom50: 16 },
  { year: 1950, country: 'India', top1: 12, top10: 37, bottom50: 18 },
  { year: 1960, country: 'India', top1: 11, top10: 35, bottom50: 19 },
  { year: 1970, country: 'India', top1: 10, top10: 33, bottom50: 20 },
  { year: 1980, country: 'India', top1: 7, top10: 30, bottom50: 22 },
  { year: 1990, country: 'India', top1: 10, top10: 33, bottom50: 20 },
  { year: 2000, country: 'India', top1: 15, top10: 40, bottom50: 15 },
  { year: 2010, country: 'India', top1: 21, top10: 56, bottom50: 13 },
  { year: 2020, country: 'India', top1: 22, top10: 57, bottom50: 13 },

  // South Africa
  { year: 1950, country: 'South Africa', top1: 20, top10: 55, bottom50: 8 },
  { year: 1960, country: 'South Africa', top1: 18, top10: 54, bottom50: 8 },
  { year: 1970, country: 'South Africa', top1: 17, top10: 52, bottom50: 9 },
  { year: 1980, country: 'South Africa', top1: 15, top10: 50, bottom50: 9 },
  { year: 1993, country: 'South Africa', top1: 17, top10: 55, bottom50: 7 },
  { year: 2000, country: 'South Africa', top1: 18, top10: 58, bottom50: 6 },
  { year: 2010, country: 'South Africa', top1: 19, top10: 60, bottom50: 6 },
  { year: 2020, country: 'South Africa', top1: 19, top10: 61, bottom50: 6 },

  // China
  { year: 1978, country: 'China', top1: 6, top10: 27, bottom50: 27 },
  { year: 1985, country: 'China', top1: 7, top10: 28, bottom50: 26 },
  { year: 1990, country: 'China', top1: 8, top10: 30, bottom50: 24 },
  { year: 1995, country: 'China', top1: 9, top10: 33, bottom50: 21 },
  { year: 2000, country: 'China', top1: 11, top10: 36, bottom50: 18 },
  { year: 2005, country: 'China', top1: 13, top10: 40, bottom50: 15 },
  { year: 2010, country: 'China', top1: 14, top10: 42, bottom50: 14 },
  { year: 2015, country: 'China', top1: 14, top10: 41, bottom50: 14 },
  { year: 2020, country: 'China', top1: 14, top10: 42, bottom50: 14 },

  // Australia
  { year: 1921, country: 'Australia', top1: 12, top10: 40, bottom50: 17 },
  { year: 1940, country: 'Australia', top1: 11, top10: 36, bottom50: 19 },
  { year: 1950, country: 'Australia', top1: 10, top10: 33, bottom50: 21 },
  { year: 1960, country: 'Australia', top1: 8, top10: 31, bottom50: 22 },
  { year: 1970, country: 'Australia', top1: 7, top10: 29, bottom50: 23 },
  { year: 1980, country: 'Australia', top1: 6, top10: 28, bottom50: 24 },
  { year: 1990, country: 'Australia', top1: 7, top10: 30, bottom50: 23 },
  { year: 2000, country: 'Australia', top1: 9, top10: 34, bottom50: 20 },
  { year: 2010, country: 'Australia', top1: 10, top10: 35, bottom50: 19 },
  { year: 2020, country: 'Australia', top1: 10, top10: 35, bottom50: 19 },
];

// ── Top Wealth Shares ────────────────────────────────────────────────────────
// Based on Piketty (2014) Figures 10.1-10.6, World Inequality Database

export const TOP_WEALTH_SHARES: TopWealthPoint[] = [
  // United States
  { year: 1810, country: 'USA', top1: 25, top10: 60 },
  { year: 1850, country: 'USA', top1: 30, top10: 65 },
  { year: 1870, country: 'USA', top1: 34, top10: 72 },
  { year: 1910, country: 'USA', top1: 45, top10: 80 },
  { year: 1929, country: 'USA', top1: 45, top10: 83 },
  { year: 1940, country: 'USA', top1: 33, top10: 72 },
  { year: 1950, country: 'USA', top1: 28, top10: 68 },
  { year: 1960, country: 'USA', top1: 27, top10: 67 },
  { year: 1970, country: 'USA', top1: 25, top10: 64 },
  { year: 1978, country: 'USA', top1: 22, top10: 62 },
  { year: 1985, country: 'USA', top1: 25, top10: 65 },
  { year: 1990, country: 'USA', top1: 28, top10: 67 },
  { year: 2000, country: 'USA', top1: 33, top10: 70 },
  { year: 2010, country: 'USA', top1: 35, top10: 73 },
  { year: 2020, country: 'USA', top1: 35, top10: 72 },

  // France
  { year: 1810, country: 'France', top1: 45, top10: 80 },
  { year: 1850, country: 'France', top1: 50, top10: 85 },
  { year: 1880, country: 'France', top1: 55, top10: 87 },
  { year: 1910, country: 'France', top1: 60, top10: 90 },
  { year: 1920, country: 'France', top1: 50, top10: 82 },
  { year: 1930, country: 'France', top1: 47, top10: 80 },
  { year: 1940, country: 'France', top1: 35, top10: 70 },
  { year: 1950, country: 'France', top1: 28, top10: 62 },
  { year: 1960, country: 'France', top1: 25, top10: 58 },
  { year: 1970, country: 'France', top1: 22, top10: 55 },
  { year: 1980, country: 'France', top1: 20, top10: 52 },
  { year: 1990, country: 'France', top1: 20, top10: 53 },
  { year: 2000, country: 'France', top1: 22, top10: 55 },
  { year: 2010, country: 'France', top1: 24, top10: 56 },
  { year: 2020, country: 'France', top1: 25, top10: 57 },

  // United Kingdom
  { year: 1810, country: 'UK', top1: 55, top10: 85 },
  { year: 1850, country: 'UK', top1: 60, top10: 88 },
  { year: 1880, country: 'UK', top1: 62, top10: 90 },
  { year: 1910, country: 'UK', top1: 70, top10: 92 },
  { year: 1920, country: 'UK', top1: 60, top10: 88 },
  { year: 1930, country: 'UK', top1: 55, top10: 85 },
  { year: 1940, country: 'UK', top1: 40, top10: 73 },
  { year: 1950, country: 'UK', top1: 30, top10: 65 },
  { year: 1960, country: 'UK', top1: 25, top10: 60 },
  { year: 1970, country: 'UK', top1: 22, top10: 55 },
  { year: 1980, country: 'UK', top1: 18, top10: 50 },
  { year: 1990, country: 'UK', top1: 17, top10: 51 },
  { year: 2000, country: 'UK', top1: 20, top10: 54 },
  { year: 2010, country: 'UK', top1: 21, top10: 55 },
  { year: 2020, country: 'UK', top1: 22, top10: 55 },

  // Germany
  { year: 1870, country: 'Germany', top1: 32, top10: 72 },
  { year: 1910, country: 'Germany', top1: 40, top10: 78 },
  { year: 1920, country: 'Germany', top1: 25, top10: 60 },
  { year: 1930, country: 'Germany', top1: 28, top10: 65 },
  { year: 1950, country: 'Germany', top1: 18, top10: 50 },
  { year: 1960, country: 'Germany', top1: 17, top10: 48 },
  { year: 1970, country: 'Germany', top1: 17, top10: 48 },
  { year: 1980, country: 'Germany', top1: 16, top10: 47 },
  { year: 1990, country: 'Germany', top1: 17, top10: 48 },
  { year: 2000, country: 'Germany', top1: 20, top10: 53 },
  { year: 2010, country: 'Germany', top1: 23, top10: 57 },
  { year: 2020, country: 'Germany', top1: 24, top10: 58 },

  // Japan
  { year: 1910, country: 'Japan', top1: 35, top10: 70 },
  { year: 1930, country: 'Japan', top1: 33, top10: 68 },
  { year: 1945, country: 'Japan', top1: 12, top10: 40 },
  { year: 1950, country: 'Japan', top1: 10, top10: 38 },
  { year: 1960, country: 'Japan', top1: 11, top10: 40 },
  { year: 1970, country: 'Japan', top1: 12, top10: 42 },
  { year: 1980, country: 'Japan', top1: 14, top10: 45 },
  { year: 1990, country: 'Japan', top1: 16, top10: 50 },
  { year: 2000, country: 'Japan', top1: 18, top10: 52 },
  { year: 2010, country: 'Japan', top1: 18, top10: 52 },
  { year: 2020, country: 'Japan', top1: 19, top10: 53 },

  // Sweden
  { year: 1910, country: 'Sweden', top1: 50, top10: 88 },
  { year: 1920, country: 'Sweden', top1: 42, top10: 82 },
  { year: 1930, country: 'Sweden', top1: 38, top10: 78 },
  { year: 1950, country: 'Sweden', top1: 22, top10: 60 },
  { year: 1960, country: 'Sweden', top1: 20, top10: 55 },
  { year: 1970, country: 'Sweden', top1: 17, top10: 50 },
  { year: 1980, country: 'Sweden', top1: 15, top10: 48 },
  { year: 1990, country: 'Sweden', top1: 16, top10: 52 },
  { year: 2000, country: 'Sweden', top1: 20, top10: 58 },
  { year: 2010, country: 'Sweden', top1: 25, top10: 64 },
  { year: 2020, country: 'Sweden', top1: 26, top10: 65 },

  // Canada
  { year: 1920, country: 'Canada', top1: 25, top10: 62 },
  { year: 1940, country: 'Canada', top1: 22, top10: 58 },
  { year: 1950, country: 'Canada', top1: 20, top10: 56 },
  { year: 1960, country: 'Canada', top1: 18, top10: 53 },
  { year: 1970, country: 'Canada', top1: 17, top10: 52 },
  { year: 1980, country: 'Canada', top1: 17, top10: 53 },
  { year: 1990, country: 'Canada', top1: 20, top10: 55 },
  { year: 2000, country: 'Canada', top1: 23, top10: 58 },
  { year: 2010, country: 'Canada', top1: 25, top10: 60 },
  { year: 2020, country: 'Canada', top1: 25, top10: 60 },

  // Brazil
  { year: 1960, country: 'Brazil', top1: 40, top10: 75 },
  { year: 1970, country: 'Brazil', top1: 42, top10: 77 },
  { year: 1980, country: 'Brazil', top1: 44, top10: 78 },
  { year: 1990, country: 'Brazil', top1: 45, top10: 79 },
  { year: 2000, country: 'Brazil', top1: 44, top10: 78 },
  { year: 2010, country: 'Brazil', top1: 43, top10: 76 },
  { year: 2020, country: 'Brazil', top1: 43, top10: 76 },

  // India
  { year: 1960, country: 'India', top1: 16, top10: 45 },
  { year: 1970, country: 'India', top1: 14, top10: 42 },
  { year: 1980, country: 'India', top1: 12, top10: 40 },
  { year: 1990, country: 'India', top1: 16, top10: 45 },
  { year: 2000, country: 'India', top1: 26, top10: 56 },
  { year: 2010, country: 'India', top1: 33, top10: 65 },
  { year: 2020, country: 'India', top1: 33, top10: 65 },

  // South Africa
  { year: 1960, country: 'South Africa', top1: 45, top10: 82 },
  { year: 1970, country: 'South Africa', top1: 42, top10: 80 },
  { year: 1980, country: 'South Africa', top1: 40, top10: 78 },
  { year: 1993, country: 'South Africa', top1: 42, top10: 80 },
  { year: 2000, country: 'South Africa', top1: 48, top10: 83 },
  { year: 2010, country: 'South Africa', top1: 50, top10: 85 },
  { year: 2020, country: 'South Africa', top1: 50, top10: 86 },

  // China
  { year: 1978, country: 'China', top1: 7, top10: 27 },
  { year: 1985, country: 'China', top1: 10, top10: 32 },
  { year: 1990, country: 'China', top1: 15, top10: 40 },
  { year: 1995, country: 'China', top1: 18, top10: 45 },
  { year: 2000, country: 'China', top1: 22, top10: 50 },
  { year: 2005, country: 'China', top1: 27, top10: 57 },
  { year: 2010, country: 'China', top1: 30, top10: 62 },
  { year: 2015, country: 'China', top1: 30, top10: 63 },
  { year: 2020, country: 'China', top1: 31, top10: 63 },

  // Australia
  { year: 1920, country: 'Australia', top1: 30, top10: 65 },
  { year: 1940, country: 'Australia', top1: 22, top10: 56 },
  { year: 1950, country: 'Australia', top1: 18, top10: 50 },
  { year: 1960, country: 'Australia', top1: 16, top10: 48 },
  { year: 1970, country: 'Australia', top1: 14, top10: 46 },
  { year: 1980, country: 'Australia', top1: 13, top10: 45 },
  { year: 1990, country: 'Australia', top1: 15, top10: 48 },
  { year: 2000, country: 'Australia', top1: 18, top10: 52 },
  { year: 2010, country: 'Australia', top1: 20, top10: 55 },
  { year: 2020, country: 'Australia', top1: 21, top10: 55 },
];

// ── Kuznets Scatter Data ─────────────────────────────────────────────────────
// Cross-country GDP per capita vs Gini (contemporary snapshot)

export const KUZNETS_SCATTER: KuznetsPoint[] = [
  { country: 'Norway', gdpPerCapita: 82000, gini: 27.7, region: 'Europe' },
  { country: 'Denmark', gdpPerCapita: 68000, gini: 28.2, region: 'Europe' },
  { country: 'Sweden', gdpPerCapita: 60000, gini: 30.0, region: 'Europe' },
  { country: 'Finland', gdpPerCapita: 55000, gini: 27.4, region: 'Europe' },
  { country: 'Germany', gdpPerCapita: 56000, gini: 31.9, region: 'Europe' },
  { country: 'France', gdpPerCapita: 47000, gini: 32.4, region: 'Europe' },
  { country: 'UK', gdpPerCapita: 48000, gini: 35.1, region: 'Europe' },
  { country: 'Italy', gdpPerCapita: 42000, gini: 35.9, region: 'Europe' },
  { country: 'Spain', gdpPerCapita: 41000, gini: 34.7, region: 'Europe' },
  { country: 'Portugal', gdpPerCapita: 38000, gini: 33.8, region: 'Europe' },
  { country: 'USA', gdpPerCapita: 76000, gini: 41.4, region: 'N. America' },
  { country: 'Canada', gdpPerCapita: 54000, gini: 33.3, region: 'N. America' },
  { country: 'Japan', gdpPerCapita: 42000, gini: 32.9, region: 'Asia' },
  { country: 'South Korea', gdpPerCapita: 47000, gini: 31.4, region: 'Asia' },
  { country: 'China', gdpPerCapita: 21000, gini: 38.2, region: 'Asia' },
  { country: 'India', gdpPerCapita: 8700, gini: 35.7, region: 'Asia' },
  { country: 'Indonesia', gdpPerCapita: 14000, gini: 37.9, region: 'Asia' },
  { country: 'Thailand', gdpPerCapita: 19000, gini: 36.4, region: 'Asia' },
  { country: 'Vietnam', gdpPerCapita: 13000, gini: 35.7, region: 'Asia' },
  { country: 'Brazil', gdpPerCapita: 17000, gini: 53.4, region: 'L. America' },
  { country: 'Mexico', gdpPerCapita: 22000, gini: 45.4, region: 'L. America' },
  { country: 'Colombia', gdpPerCapita: 17000, gini: 51.3, region: 'L. America' },
  { country: 'Chile', gdpPerCapita: 29000, gini: 44.9, region: 'L. America' },
  { country: 'Argentina', gdpPerCapita: 24000, gini: 42.3, region: 'L. America' },
  { country: 'South Africa', gdpPerCapita: 16000, gini: 63.0, region: 'Africa' },
  { country: 'Nigeria', gdpPerCapita: 5900, gini: 35.1, region: 'Africa' },
  { country: 'Kenya', gdpPerCapita: 5500, gini: 40.8, region: 'Africa' },
  { country: 'Ethiopia', gdpPerCapita: 3000, gini: 35.0, region: 'Africa' },
  { country: 'Egypt', gdpPerCapita: 15000, gini: 31.5, region: 'MENA' },
  { country: 'Turkey', gdpPerCapita: 37000, gini: 41.9, region: 'MENA' },
  { country: 'Saudi Arabia', gdpPerCapita: 56000, gini: 45.9, region: 'MENA' },
  { country: 'Russia', gdpPerCapita: 30000, gini: 36.0, region: 'Europe' },
  { country: 'Poland', gdpPerCapita: 41000, gini: 29.7, region: 'Europe' },
  { country: 'Australia', gdpPerCapita: 55000, gini: 34.4, region: 'Oceania' },
  { country: 'New Zealand', gdpPerCapita: 46000, gini: 36.2, region: 'Oceania' },
];

export const KUZNETS_THEORETICAL_CURVE: KuznetsCurvePoint[] = [
  { gdpPerCapita: 1000, gini: 25 },
  { gdpPerCapita: 3000, gini: 32 },
  { gdpPerCapita: 5000, gini: 38 },
  { gdpPerCapita: 8000, gini: 43 },
  { gdpPerCapita: 12000, gini: 46 },
  { gdpPerCapita: 18000, gini: 47 },
  { gdpPerCapita: 25000, gini: 45 },
  { gdpPerCapita: 35000, gini: 42 },
  { gdpPerCapita: 50000, gini: 37 },
  { gdpPerCapita: 70000, gini: 33 },
  { gdpPerCapita: 90000, gini: 30 },
];

export const COUNTRY_TRAJECTORIES: CountryTrajectory[] = [
  {
    country: 'USA', color: '#3B82F6',
    points: [
      { year: 1950, gdpPerCapita: 15000, gini: 36 },
      { year: 1970, gdpPerCapita: 25000, gini: 34 },
      { year: 1980, gdpPerCapita: 31000, gini: 35 },
      { year: 2000, gdpPerCapita: 54000, gini: 40 },
      { year: 2020, gdpPerCapita: 76000, gini: 41 },
    ],
  },
  {
    country: 'UK', color: '#EF4444',
    points: [
      { year: 1950, gdpPerCapita: 12000, gini: 33 },
      { year: 1970, gdpPerCapita: 18000, gini: 27 },
      { year: 1980, gdpPerCapita: 22000, gini: 28 },
      { year: 2000, gdpPerCapita: 37000, gini: 35 },
      { year: 2020, gdpPerCapita: 48000, gini: 35 },
    ],
  },
  {
    country: 'Brazil', color: '#F59E0B',
    points: [
      { year: 1960, gdpPerCapita: 4000, gini: 50 },
      { year: 1980, gdpPerCapita: 9000, gini: 58 },
      { year: 2000, gdpPerCapita: 12000, gini: 59 },
      { year: 2010, gdpPerCapita: 15000, gini: 53 },
      { year: 2020, gdpPerCapita: 17000, gini: 53 },
    ],
  },
  {
    country: 'South Korea', color: '#10B981',
    points: [
      { year: 1960, gdpPerCapita: 1500, gini: 34 },
      { year: 1980, gdpPerCapita: 6000, gini: 36 },
      { year: 2000, gdpPerCapita: 25000, gini: 32 },
      { year: 2020, gdpPerCapita: 47000, gini: 31 },
    ],
  },
  {
    country: 'China', color: '#8B5CF6',
    points: [
      { year: 1980, gdpPerCapita: 800, gini: 28 },
      { year: 1990, gdpPerCapita: 1800, gini: 32 },
      { year: 2000, gdpPerCapita: 4000, gini: 39 },
      { year: 2010, gdpPerCapita: 11000, gini: 42 },
      { year: 2020, gdpPerCapita: 21000, gini: 38 },
    ],
  },
];

// ── Elephant Curve (Milanovic) ────────────────────────────────────────────────
// Cumulative real income growth by global income percentile, 1988-2008

export const ELEPHANT_CURVE: ElephantCurvePoint[] = [
  { percentile: 5, growthRate: 15 },
  { percentile: 10, growthRate: 35 },
  { percentile: 15, growthRate: 45 },
  { percentile: 20, growthRate: 52 },
  { percentile: 25, growthRate: 58 },
  { percentile: 30, growthRate: 60 },
  { percentile: 35, growthRate: 62 },
  { percentile: 40, growthRate: 65 },
  { percentile: 45, growthRate: 68 },
  { percentile: 50, growthRate: 70 },
  { percentile: 55, growthRate: 68 },
  { percentile: 60, growthRate: 60 },
  { percentile: 65, growthRate: 45 },
  { percentile: 70, growthRate: 25 },
  { percentile: 75, growthRate: 10 },
  { percentile: 80, growthRate: 5 },
  { percentile: 85, growthRate: 10 },
  { percentile: 90, growthRate: 20 },
  { percentile: 95, growthRate: 45 },
  { percentile: 99, growthRate: 65 },
  { percentile: 100, growthRate: 70 },
];

// ── Inheritance Flows ────────────────────────────────────────────────────────
// Based on Piketty (2014) Figures 11.1-11.2 — France primarily

export const INHERITANCE_FLOWS: InheritanceFlowPoint[] = [
  { year: 1820, annualFlow: 20, country: 'France' },
  { year: 1830, annualFlow: 21, country: 'France' },
  { year: 1840, annualFlow: 22, country: 'France' },
  { year: 1850, annualFlow: 22, country: 'France' },
  { year: 1860, annualFlow: 23, country: 'France' },
  { year: 1870, annualFlow: 24, country: 'France' },
  { year: 1880, annualFlow: 22, country: 'France' },
  { year: 1890, annualFlow: 23, country: 'France' },
  { year: 1900, annualFlow: 24, country: 'France' },
  { year: 1910, annualFlow: 25, country: 'France' },
  { year: 1920, annualFlow: 12, country: 'France' },
  { year: 1930, annualFlow: 10, country: 'France' },
  { year: 1940, annualFlow: 6, country: 'France' },
  { year: 1950, annualFlow: 5, country: 'France' },
  { year: 1960, annualFlow: 5, country: 'France' },
  { year: 1970, annualFlow: 6, country: 'France' },
  { year: 1980, annualFlow: 7, country: 'France' },
  { year: 1990, annualFlow: 9, country: 'France' },
  { year: 2000, annualFlow: 12, country: 'France' },
  { year: 2010, annualFlow: 15, country: 'France' },
  { year: 2020, annualFlow: 16, country: 'France' },

  { year: 1910, annualFlow: 22, country: 'UK' },
  { year: 1920, annualFlow: 13, country: 'UK' },
  { year: 1940, annualFlow: 6, country: 'UK' },
  { year: 1950, annualFlow: 5, country: 'UK' },
  { year: 1970, annualFlow: 4, country: 'UK' },
  { year: 1980, annualFlow: 5, country: 'UK' },
  { year: 1990, annualFlow: 6, country: 'UK' },
  { year: 2000, annualFlow: 8, country: 'UK' },
  { year: 2010, annualFlow: 10, country: 'UK' },
  { year: 2020, annualFlow: 12, country: 'UK' },
];

// ── Tax History ──────────────────────────────────────────────────────────────
// Based on Piketty (2014) Figures 14.1-14.2

export const TAX_HISTORY: TaxHistoryPoint[] = [
  // United States
  { year: 1900, country: 'USA', topMarginalRate: 0, capitalGainsRate: null },
  { year: 1913, country: 'USA', topMarginalRate: 7, capitalGainsRate: 7 },
  { year: 1918, country: 'USA', topMarginalRate: 77, capitalGainsRate: 77 },
  { year: 1920, country: 'USA', topMarginalRate: 73, capitalGainsRate: 73 },
  { year: 1925, country: 'USA', topMarginalRate: 25, capitalGainsRate: 12 },
  { year: 1930, country: 'USA', topMarginalRate: 25, capitalGainsRate: 12 },
  { year: 1936, country: 'USA', topMarginalRate: 79, capitalGainsRate: 31 },
  { year: 1940, country: 'USA', topMarginalRate: 81, capitalGainsRate: 30 },
  { year: 1944, country: 'USA', topMarginalRate: 94, capitalGainsRate: 25 },
  { year: 1950, country: 'USA', topMarginalRate: 91, capitalGainsRate: 25 },
  { year: 1960, country: 'USA', topMarginalRate: 91, capitalGainsRate: 25 },
  { year: 1964, country: 'USA', topMarginalRate: 77, capitalGainsRate: 25 },
  { year: 1970, country: 'USA', topMarginalRate: 70, capitalGainsRate: 27 },
  { year: 1980, country: 'USA', topMarginalRate: 70, capitalGainsRate: 28 },
  { year: 1982, country: 'USA', topMarginalRate: 50, capitalGainsRate: 20 },
  { year: 1987, country: 'USA', topMarginalRate: 38, capitalGainsRate: 28 },
  { year: 1988, country: 'USA', topMarginalRate: 28, capitalGainsRate: 28 },
  { year: 1993, country: 'USA', topMarginalRate: 40, capitalGainsRate: 28 },
  { year: 2000, country: 'USA', topMarginalRate: 40, capitalGainsRate: 20 },
  { year: 2003, country: 'USA', topMarginalRate: 35, capitalGainsRate: 15 },
  { year: 2010, country: 'USA', topMarginalRate: 35, capitalGainsRate: 15 },
  { year: 2013, country: 'USA', topMarginalRate: 40, capitalGainsRate: 20 },
  { year: 2020, country: 'USA', topMarginalRate: 37, capitalGainsRate: 20 },

  // United Kingdom
  { year: 1900, country: 'UK', topMarginalRate: 8, capitalGainsRate: null },
  { year: 1910, country: 'UK', topMarginalRate: 8, capitalGainsRate: null },
  { year: 1918, country: 'UK', topMarginalRate: 53, capitalGainsRate: null },
  { year: 1920, country: 'UK', topMarginalRate: 60, capitalGainsRate: null },
  { year: 1930, country: 'UK', topMarginalRate: 58, capitalGainsRate: null },
  { year: 1940, country: 'UK', topMarginalRate: 97, capitalGainsRate: null },
  { year: 1950, country: 'UK', topMarginalRate: 98, capitalGainsRate: 30 },
  { year: 1960, country: 'UK', topMarginalRate: 89, capitalGainsRate: 30 },
  { year: 1970, country: 'UK', topMarginalRate: 83, capitalGainsRate: 30 },
  { year: 1979, country: 'UK', topMarginalRate: 83, capitalGainsRate: 30 },
  { year: 1980, country: 'UK', topMarginalRate: 60, capitalGainsRate: 30 },
  { year: 1988, country: 'UK', topMarginalRate: 40, capitalGainsRate: 30 },
  { year: 1990, country: 'UK', topMarginalRate: 40, capitalGainsRate: 25 },
  { year: 2000, country: 'UK', topMarginalRate: 40, capitalGainsRate: 18 },
  { year: 2010, country: 'UK', topMarginalRate: 50, capitalGainsRate: 18 },
  { year: 2020, country: 'UK', topMarginalRate: 45, capitalGainsRate: 20 },

  // France
  { year: 1900, country: 'France', topMarginalRate: 0, capitalGainsRate: null },
  { year: 1914, country: 'France', topMarginalRate: 2, capitalGainsRate: null },
  { year: 1920, country: 'France', topMarginalRate: 50, capitalGainsRate: null },
  { year: 1925, country: 'France', topMarginalRate: 60, capitalGainsRate: null },
  { year: 1940, country: 'France', topMarginalRate: 60, capitalGainsRate: null },
  { year: 1950, country: 'France', topMarginalRate: 65, capitalGainsRate: null },
  { year: 1960, country: 'France', topMarginalRate: 65, capitalGainsRate: null },
  { year: 1970, country: 'France', topMarginalRate: 60, capitalGainsRate: 25 },
  { year: 1980, country: 'France', topMarginalRate: 60, capitalGainsRate: 25 },
  { year: 1990, country: 'France', topMarginalRate: 57, capitalGainsRate: 27 },
  { year: 2000, country: 'France', topMarginalRate: 54, capitalGainsRate: 26 },
  { year: 2010, country: 'France', topMarginalRate: 41, capitalGainsRate: 31 },
  { year: 2013, country: 'France', topMarginalRate: 75, capitalGainsRate: 34 },
  { year: 2020, country: 'France', topMarginalRate: 45, capitalGainsRate: 30 },

  // Germany
  { year: 1900, country: 'Germany', topMarginalRate: 4, capitalGainsRate: null },
  { year: 1920, country: 'Germany', topMarginalRate: 60, capitalGainsRate: null },
  { year: 1930, country: 'Germany', topMarginalRate: 40, capitalGainsRate: null },
  { year: 1950, country: 'Germany', topMarginalRate: 95, capitalGainsRate: 0 },
  { year: 1960, country: 'Germany', topMarginalRate: 53, capitalGainsRate: 0 },
  { year: 1970, country: 'Germany', topMarginalRate: 56, capitalGainsRate: 0 },
  { year: 1980, country: 'Germany', topMarginalRate: 56, capitalGainsRate: 0 },
  { year: 1990, country: 'Germany', topMarginalRate: 53, capitalGainsRate: 0 },
  { year: 2000, country: 'Germany', topMarginalRate: 51, capitalGainsRate: 0 },
  { year: 2005, country: 'Germany', topMarginalRate: 42, capitalGainsRate: 0 },
  { year: 2009, country: 'Germany', topMarginalRate: 45, capitalGainsRate: 25 },
  { year: 2020, country: 'Germany', topMarginalRate: 45, capitalGainsRate: 25 },
];

// ── Wealth Composition ───────────────────────────────────────────────────────

export const WEALTH_COMPOSITION: WealthComposition[] = [
  { country: 'USA', year: 2020, housing: 28, financial: 38, business: 20, pensions: 10, other: 4 },
  { country: 'UK', year: 2020, housing: 36, financial: 28, business: 14, pensions: 18, other: 4 },
  { country: 'France', year: 2020, housing: 44, financial: 22, business: 12, pensions: 8, other: 14 },
  { country: 'Germany', year: 2020, housing: 40, financial: 25, business: 15, pensions: 12, other: 8 },
  { country: 'Japan', year: 2020, housing: 25, financial: 42, business: 10, pensions: 15, other: 8 },
  { country: 'China', year: 2020, housing: 55, financial: 15, business: 18, pensions: 5, other: 7 },
];

// ── Milestones ───────────────────────────────────────────────────────────────

export const INEQUALITY_MILESTONES: InequalityMilestone[] = [
  { year: 1776, event: 'American Revolution', impact: 'Land redistribution from loyalists, but slave-based wealth concentration persisted', direction: 'neutral' },
  { year: 1789, event: 'French Revolution', impact: 'Abolished feudal privileges and aristocratic land concentration', direction: 'equalising' },
  { year: 1848, event: 'Revolutions of 1848', impact: 'Working-class movements forced political concessions across Europe', direction: 'equalising' },
  { year: 1862, event: 'Homestead Act (USA)', impact: 'Free land distribution westward, broadening property ownership', direction: 'equalising' },
  { year: 1870, event: 'Gilded Age begins', impact: 'Rapid industrialisation concentrates wealth among railroad and oil barons', direction: 'disequalising' },
  { year: 1913, event: 'US Federal Income Tax', impact: 'First modern income tax (top rate 7%), beginning of progressive taxation', direction: 'equalising' },
  { year: 1914, event: 'World War I', impact: 'Massive capital destruction and first wave of progressive taxation', direction: 'equalising' },
  { year: 1917, event: 'Russian Revolution', impact: 'Radical redistribution in Russia; fear of communism drives reforms elsewhere', direction: 'equalising' },
  { year: 1929, event: 'Great Depression', impact: 'Financial collapse wiped out fortunes and exposed systemic fragility', direction: 'equalising' },
  { year: 1933, event: 'New Deal begins', impact: 'Social Security, labour rights, progressive taxation — foundational welfare state', direction: 'equalising' },
  { year: 1939, event: 'World War II', impact: 'Unprecedented capital destruction and fiscal mobilisation', direction: 'equalising' },
  { year: 1944, event: 'Bretton Woods', impact: 'International monetary order with capital controls, stabilising wealth distribution', direction: 'equalising' },
  { year: 1944, event: 'US top rate hits 94%', impact: 'Peak of progressive taxation in modern history', direction: 'equalising' },
  { year: 1948, event: 'NHS and welfare state', impact: 'UK establishes comprehensive welfare; similar moves across Europe', direction: 'equalising' },
  { year: 1964, event: 'Civil Rights Act', impact: 'Formal end to legal discrimination — uneven economic effects', direction: 'equalising' },
  { year: 1971, event: 'Bretton Woods collapses', impact: 'End of capital controls enables financial globalisation', direction: 'disequalising' },
  { year: 1979, event: 'Thatcher elected', impact: 'Top UK rate cut from 83% to 60%, then 40%; deregulation, privatisation', direction: 'disequalising' },
  { year: 1981, event: 'Reagan tax cuts', impact: 'Top US rate slashed from 70% to 28% over 7 years', direction: 'disequalising' },
  { year: 1989, event: 'Fall of Berlin Wall', impact: 'End of Cold War removed ideological pressure for redistribution', direction: 'disequalising' },
  { year: 1994, event: 'NAFTA', impact: 'Trade liberalisation shifted manufacturing, hollowing out working-class incomes', direction: 'disequalising' },
  { year: 1999, event: 'Glass-Steagall repealed', impact: 'Financial deregulation enabled new forms of wealth accumulation', direction: 'disequalising' },
  { year: 2001, event: 'China joins WTO', impact: 'Globalisation shock compressed developed-world working-class wages', direction: 'disequalising' },
  { year: 2008, event: 'Global Financial Crisis', impact: 'Bank bailouts protected capital; austerity hit labour. Wealth rebounded via asset prices', direction: 'disequalising' },
  { year: 2014, event: 'Piketty\'s "Capital" published', impact: 'Inequality re-centred in public discourse; influenced policy debates globally', direction: 'neutral' },
  { year: 2020, event: 'COVID-19 pandemic', impact: 'Billionaire wealth surged via markets while low-wage workers bore the brunt', direction: 'disequalising' },
  { year: 2022, event: 'Cost-of-living crisis', impact: 'Inflation eroded real wages; asset owners better protected', direction: 'disequalising' },
];

// ── Academic Sources ─────────────────────────────────────────────────────────

export const ACADEMIC_SOURCES: AcademicSource[] = [
  {
    author: 'Thomas Piketty',
    year: 2014,
    title: 'Capital in the Twenty-First Century',
    keyInsight: 'When the rate of return on capital (r) exceeds economic growth (g), wealth concentrates at the top. Piketty compiled 200+ years of tax records across 20 countries to show that the egalitarian mid-20th century was a historical anomaly caused by wars and progressive taxation, not a natural stage of development. Without intervention, "patrimonial capitalism" returns.',
    category: 'primary',
  },
  {
    author: 'Simon Kuznets',
    year: 1955,
    title: 'Economic Growth and Income Inequality',
    keyInsight: 'Proposed the inverted-U hypothesis: inequality initially rises with industrialisation, peaks, then falls as economies mature. Piketty shows this was descriptively correct for 1913-1970 but the mechanism was wrong — the compression was caused by wars and policy, not by market forces. The "Kuznets curve" has been resoundingly refuted by post-1980 data.',
    category: 'supporting',
  },
  {
    author: 'Branko Milanovic',
    year: 2016,
    title: 'Global Inequality: A New Approach for the Age of Globalization',
    keyInsight: 'The "Elephant Curve" shows that globalisation (1988-2008) benefited the global middle class (especially China) and the very richest, but squeezed the lower-middle class of rich countries — the constituencies behind Brexit and Trump. Milanovic argues inequality follows "Kuznets waves" rather than a one-time curve.',
    category: 'supporting',
  },
  {
    author: 'Emmanuel Saez & Gabriel Zucman',
    year: 2019,
    title: 'The Triumph of Injustice: How the Rich Dodge Taxes and How to Make Them Pay',
    keyInsight: 'US billionaires now pay a lower effective tax rate than the working class. The tax system has become regressive at the very top due to capital gains preferences, corporate tax avoidance, and offshore wealth. They propose a progressive wealth tax and automatic tax filing.',
    category: 'supporting',
  },
  {
    author: 'Anthony Atkinson',
    year: 2015,
    title: 'Inequality: What Can Be Done?',
    keyInsight: 'Atkinson proposed 15 concrete measures: guaranteed employment, minimum inheritance, progressive property taxes, a participation income (partial basic income), and technology policy that favours workers. He argued inequality is a choice, not an inevitability — the key question is political will.',
    category: 'supporting',
  },
  {
    author: 'Angus Deaton',
    year: 2013,
    title: 'The Great Escape: Health, Wealth, and the Origins of Inequality',
    keyInsight: 'Progress always creates inequality because some escape poverty before others. But extreme inequality threatens further progress by enabling rent-seeking and state capture. The solution is not to stop growth but to ensure its benefits are widely shared — "levelling up, not levelling down."',
    category: 'supporting',
  },
  {
    author: 'Amartya Sen',
    year: 1999,
    title: 'Development as Freedom',
    keyInsight: 'Inequality should be measured not just in income or wealth but in "capabilities" — the real freedoms people have to live lives they value. Education, healthcare, political participation, and social inclusion matter as much as money. This reframes inequality as a multidimensional problem.',
    category: 'supporting',
  },
  {
    author: 'Thomas Piketty & Emmanuel Saez',
    year: 2003,
    title: 'Income Inequality in the United States, 1913-1998',
    keyInsight: 'The foundational paper that reconstructed US income shares from tax data, revealing the dramatic U-shape: extreme inequality in the 1920s, compression from WWII to the 1970s, then a rapid return to Gilded Age levels. This methodology has been replicated in 30+ countries through the World Inequality Database.',
    category: 'supporting',
  },
];

// ── Region Colour Map ────────────────────────────────────────────────────────

export const REGION_COLORS: Record<string, string> = {
  'Europe': '#3B82F6',
  'N. America': '#EF4444',
  'Asia': '#10B981',
  'L. America': '#F59E0B',
  'Africa': '#8B5CF6',
  'MENA': '#EC4899',
  'Oceania': '#06B6D4',
};

export const COUNTRY_COLORS: Record<string, string> = {
  'USA': '#3B82F6',
  'UK': '#EF4444',
  'France': '#F59E0B',
  'Germany': '#10B981',
  'Japan': '#8B5CF6',
  'China': '#EC4899',
  'Sweden': '#06B6D4',
  'Canada': '#F97316',
  'Brazil': '#84CC16',
  'India': '#14B8A6',
  'South Africa': '#A855F7',
  'Australia': '#E11D48',
};

export interface RateDecision {
  bank: string;
  currency: string;
  date: string;
  action: 'hike' | 'cut' | 'hold';
  newRate: number;
  changeAmount: number;
  statement: string;
}

export const RECENT_DECISIONS: RateDecision[] = [
  // 2026
  { bank: 'Federal Reserve', currency: 'USD', date: '2026-01-28', action: 'hold', newRate: 4.25, changeAmount: 0, statement: 'Committee maintained federal funds rate at 4.25-4.50%' },
  { bank: 'ECB', currency: 'EUR', date: '2026-01-22', action: 'hold', newRate: 2.75, changeAmount: 0, statement: 'Governing Council held deposit rate at 2.75%' },
  { bank: 'Bank of Japan', currency: 'JPY', date: '2026-01-23', action: 'hold', newRate: 0.50, changeAmount: 0, statement: 'Maintained policy rate at 0.50%' },
  { bank: 'Bank of England', currency: 'GBP', date: '2026-02-05', action: 'cut', newRate: 4.00, changeAmount: -0.25, statement: 'MPC voted to reduce Bank Rate by 25 bps to 4.00%' },
  { bank: 'Reserve Bank of Australia', currency: 'AUD', date: '2026-02-17', action: 'cut', newRate: 3.85, changeAmount: -0.25, statement: 'Board decided to lower cash rate to 3.85%' },
  { bank: 'Bank of Canada', currency: 'CAD', date: '2026-01-28', action: 'hold', newRate: 2.75, changeAmount: 0, statement: 'Maintained policy rate at 2.75%' },

  // 2025 Q4
  { bank: 'Federal Reserve', currency: 'USD', date: '2025-12-17', action: 'cut', newRate: 4.25, changeAmount: -0.25, statement: 'Lowered federal funds rate by 25 bps to 4.25-4.50%' },
  { bank: 'ECB', currency: 'EUR', date: '2025-12-18', action: 'cut', newRate: 2.75, changeAmount: -0.25, statement: 'Deposit rate cut by 25 bps to 2.75%' },
  { bank: 'Bank of Japan', currency: 'JPY', date: '2025-12-19', action: 'hold', newRate: 0.50, changeAmount: 0, statement: 'Maintained policy rate at 0.50%' },
  { bank: 'Bank of England', currency: 'GBP', date: '2025-12-18', action: 'hold', newRate: 4.25, changeAmount: 0, statement: 'MPC held Bank Rate at 4.25%' },
  { bank: 'Swiss National Bank', currency: 'CHF', date: '2025-12-11', action: 'hold', newRate: 0.25, changeAmount: 0, statement: 'Maintained policy rate at 0.25%' },
  { bank: 'Bank of Canada', currency: 'CAD', date: '2025-12-10', action: 'cut', newRate: 2.75, changeAmount: -0.25, statement: 'Lowered policy rate to 2.75%' },
  { bank: 'Reserve Bank of Australia', currency: 'AUD', date: '2025-12-09', action: 'hold', newRate: 4.10, changeAmount: 0, statement: 'Cash rate unchanged at 4.10%' },
  { bank: 'CBRT', currency: 'TRY', date: '2025-12-25', action: 'cut', newRate: 40.00, changeAmount: -2.50, statement: 'Policy rate lowered to 40.00% as disinflation continues' },
  { bank: 'BCB', currency: 'BRL', date: '2025-12-10', action: 'hike', newRate: 14.25, changeAmount: 1.00, statement: 'Selic rate raised 100 bps to 14.25% amid sticky inflation' },
  { bank: 'Federal Reserve', currency: 'USD', date: '2025-11-05', action: 'hold', newRate: 4.50, changeAmount: 0, statement: 'Committee decided to maintain rates at 4.50-4.75%' },
  { bank: 'Bank of England', currency: 'GBP', date: '2025-11-06', action: 'cut', newRate: 4.25, changeAmount: -0.25, statement: 'Bank Rate lowered to 4.25%' },
  { bank: 'Reserve Bank of New Zealand', currency: 'NZD', date: '2025-11-26', action: 'cut', newRate: 3.75, changeAmount: -0.25, statement: 'OCR reduced to 3.75%' },
  { bank: 'ECB', currency: 'EUR', date: '2025-10-30', action: 'cut', newRate: 3.00, changeAmount: -0.25, statement: 'Deposit rate cut to 3.00%' },

  // 2025 Q3
  { bank: 'Federal Reserve', currency: 'USD', date: '2025-09-17', action: 'cut', newRate: 4.50, changeAmount: -0.25, statement: 'Lowered target range by 25 bps to 4.50-4.75%' },
  { bank: 'ECB', currency: 'EUR', date: '2025-09-11', action: 'hold', newRate: 3.25, changeAmount: 0, statement: 'Governing Council maintained deposit rate at 3.25%' },
  { bank: 'Bank of Japan', currency: 'JPY', date: '2025-09-19', action: 'hold', newRate: 0.50, changeAmount: 0, statement: 'Maintained policy rate at 0.50%' },
  { bank: 'Bank of England', currency: 'GBP', date: '2025-09-18', action: 'hold', newRate: 4.50, changeAmount: 0, statement: 'MPC held Bank Rate at 4.50%' },
  { bank: 'Swiss National Bank', currency: 'CHF', date: '2025-09-18', action: 'cut', newRate: 0.25, changeAmount: -0.25, statement: 'Policy rate lowered by 25 bps to 0.25%' },
  { bank: 'Reserve Bank of Australia', currency: 'AUD', date: '2025-09-30', action: 'hold', newRate: 4.10, changeAmount: 0, statement: 'Cash rate unchanged at 4.10%' },
  { bank: 'Federal Reserve', currency: 'USD', date: '2025-07-30', action: 'hold', newRate: 4.75, changeAmount: 0, statement: 'Committee decided to maintain rates at 4.75-5.00%' },
  { bank: 'Bank of Japan', currency: 'JPY', date: '2025-07-31', action: 'hike', newRate: 0.50, changeAmount: 0.25, statement: 'Raised policy rate to 0.50%' },

  // 2025 Q2
  { bank: 'Federal Reserve', currency: 'USD', date: '2025-06-18', action: 'cut', newRate: 4.75, changeAmount: -0.25, statement: 'Lowered target range by 25 bps to 4.75-5.00%' },
  { bank: 'ECB', currency: 'EUR', date: '2025-06-05', action: 'cut', newRate: 3.25, changeAmount: -0.25, statement: 'Deposit rate cut to 3.25%' },
  { bank: 'Bank of England', currency: 'GBP', date: '2025-06-19', action: 'hold', newRate: 4.50, changeAmount: 0, statement: 'MPC held Bank Rate at 4.50%' },
  { bank: 'Reserve Bank of Australia', currency: 'AUD', date: '2025-05-20', action: 'cut', newRate: 4.10, changeAmount: -0.25, statement: 'Board cut cash rate to 4.10%' },
  { bank: 'Bank of Canada', currency: 'CAD', date: '2025-06-04', action: 'cut', newRate: 3.00, changeAmount: -0.25, statement: 'Policy rate lowered to 3.00%' },
  { bank: 'PBoC', currency: 'CNY', date: '2025-05-20', action: 'cut', newRate: 3.00, changeAmount: -0.10, statement: '1-year LPR reduced to 3.00%' },

  // 2025 Q1
  { bank: 'Federal Reserve', currency: 'USD', date: '2025-03-19', action: 'hold', newRate: 5.00, changeAmount: 0, statement: 'Committee maintained target range at 5.00-5.25%' },
  { bank: 'ECB', currency: 'EUR', date: '2025-03-06', action: 'cut', newRate: 3.50, changeAmount: -0.25, statement: 'Deposit rate lowered to 3.50%' },
  { bank: 'Bank of Japan', currency: 'JPY', date: '2025-03-14', action: 'hold', newRate: 0.25, changeAmount: 0, statement: 'Maintained policy rate at 0.25%' },
  { bank: 'Bank of England', currency: 'GBP', date: '2025-03-20', action: 'hold', newRate: 4.50, changeAmount: 0, statement: 'MPC voted 8-1 to maintain Bank Rate' },
  { bank: 'Swiss National Bank', currency: 'CHF', date: '2025-03-20', action: 'hold', newRate: 0.50, changeAmount: 0, statement: 'Policy rate maintained at 0.50%' },
  { bank: 'Reserve Bank of Australia', currency: 'AUD', date: '2025-02-18', action: 'cut', newRate: 4.35, changeAmount: -0.25, statement: 'First cut since Nov 2020, cash rate to 4.10%' },
  { bank: 'Bank of England', currency: 'GBP', date: '2025-02-06', action: 'cut', newRate: 4.50, changeAmount: -0.25, statement: 'Bank Rate lowered to 4.50%' },
  { bank: 'Reserve Bank of India', currency: 'INR', date: '2025-02-07', action: 'cut', newRate: 6.25, changeAmount: -0.25, statement: 'Repo rate cut to 6.25% to support growth' },
  { bank: 'Federal Reserve', currency: 'USD', date: '2025-01-29', action: 'hold', newRate: 5.00, changeAmount: 0, statement: 'Maintained target range at 5.00-5.25%' },
  { bank: 'ECB', currency: 'EUR', date: '2025-01-30', action: 'cut', newRate: 3.75, changeAmount: -0.25, statement: 'Deposit rate cut to 3.75% as inflation nears target' },
  { bank: 'Bank of Canada', currency: 'CAD', date: '2025-01-29', action: 'cut', newRate: 3.25, changeAmount: -0.25, statement: 'Rate lowered to 3.25% amid weak growth' },

  // 2024 Q4
  { bank: 'Federal Reserve', currency: 'USD', date: '2024-12-18', action: 'cut', newRate: 5.00, changeAmount: -0.25, statement: 'Lowered target range by 25 bps to 5.00-5.25%' },
  { bank: 'ECB', currency: 'EUR', date: '2024-12-12', action: 'cut', newRate: 4.00, changeAmount: -0.25, statement: 'Governing Council decided to lower key rates' },
  { bank: 'Bank of Japan', currency: 'JPY', date: '2024-12-19', action: 'hold', newRate: 0.25, changeAmount: 0, statement: 'Maintained policy rate at 0.25%' },
  { bank: 'Bank of England', currency: 'GBP', date: '2024-12-19', action: 'hold', newRate: 4.75, changeAmount: 0, statement: 'MPC voted to maintain Bank Rate at 4.75%' },
  { bank: 'Swiss National Bank', currency: 'CHF', date: '2024-12-12', action: 'cut', newRate: 0.50, changeAmount: -0.50, statement: 'Policy rate lowered by 50 bps to 0.50%' },
  { bank: 'Bank of Canada', currency: 'CAD', date: '2024-12-11', action: 'cut', newRate: 3.50, changeAmount: -0.50, statement: 'Jumbo cut of 50 bps amid slowing economy' },
  { bank: 'Reserve Bank of Australia', currency: 'AUD', date: '2024-12-10', action: 'hold', newRate: 4.35, changeAmount: 0, statement: 'Cash rate unchanged at 4.35%' },
  { bank: 'Reserve Bank of India', currency: 'INR', date: '2024-12-06', action: 'hold', newRate: 6.50, changeAmount: 0, statement: 'Repo rate kept at 6.50% amid inflation concerns' },
  { bank: 'CBRT', currency: 'TRY', date: '2024-12-26', action: 'cut', newRate: 47.50, changeAmount: -2.50, statement: 'Policy rate cut to 47.50% as disinflation begins' },
  { bank: 'BCB', currency: 'BRL', date: '2024-12-11', action: 'hike', newRate: 12.25, changeAmount: 1.00, statement: 'Selic rate raised 100 bps to combat inflation' },
  { bank: 'Bank of England', currency: 'GBP', date: '2024-11-07', action: 'cut', newRate: 4.75, changeAmount: -0.25, statement: 'Bank Rate lowered to 4.75%' },
  { bank: 'Federal Reserve', currency: 'USD', date: '2024-11-01', action: 'hold', newRate: 5.25, changeAmount: 0, statement: 'Committee decided to maintain rates' },
  { bank: 'PBoC', currency: 'CNY', date: '2024-10-21', action: 'cut', newRate: 3.10, changeAmount: -0.25, statement: 'LPR lowered to support economic recovery' },
  { bank: 'ECB', currency: 'EUR', date: '2024-10-17', action: 'cut', newRate: 4.25, changeAmount: -0.25, statement: 'Third consecutive rate cut in easing cycle' },
  { bank: 'Federal Reserve', currency: 'USD', date: '2024-09-18', action: 'cut', newRate: 5.25, changeAmount: -0.50, statement: 'Jumbo 50 bps cut to begin easing cycle' },
  { bank: 'ECB', currency: 'EUR', date: '2024-09-12', action: 'cut', newRate: 4.50, changeAmount: -0.25, statement: 'Second rate cut as inflation moderates' },
];

export const FORWARD_GUIDANCE: { bank: string; outlook: string; marketExpectation: string }[] = [
  { bank: 'Federal Reserve', outlook: 'Data-dependent; signaling gradual easing through 2026', marketExpectation: '2-3 additional cuts expected in 2026' },
  { bank: 'ECB', outlook: 'Continued easing as inflation settles near 2% target', marketExpectation: '2-3 cuts expected in 2026' },
  { bank: 'Bank of Japan', outlook: 'Gradual normalization as wage-price cycle strengthens', marketExpectation: '1-2 additional hikes in 2026' },
  { bank: 'Bank of England', outlook: 'Gradual approach to removing monetary restraint', marketExpectation: '2-3 cuts expected through 2026' },
  { bank: 'PBoC', outlook: 'Accommodative stance to support recovery and counter trade tensions', marketExpectation: 'Further easing likely in 2026' },
  { bank: 'Bank of Canada', outlook: 'Approaching neutral rate, pace of cuts to slow', marketExpectation: '1-2 cuts in 2026' },
  { bank: 'Reserve Bank of Australia', outlook: 'Began easing cycle, watching labor market and inflation', marketExpectation: '2-3 additional cuts in 2026' },
  { bank: 'Swiss National Bank', outlook: 'Near lower bound, monitoring franc strength', marketExpectation: 'Limited further easing room' },
  { bank: 'Reserve Bank of India', outlook: 'Shifted to accommodative stance to support growth', marketExpectation: '1-2 additional cuts in 2026' },
];

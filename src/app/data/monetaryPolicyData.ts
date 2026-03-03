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
  { bank: 'Federal Reserve', currency: 'USD', date: '2024-12-18', action: 'hold', newRate: 5.25, changeAmount: 0, statement: 'Maintaining target range at 5.25-5.50%' },
  { bank: 'Federal Reserve', currency: 'USD', date: '2024-11-01', action: 'hold', newRate: 5.25, changeAmount: 0, statement: 'Committee decided to maintain rates' },
  { bank: 'Federal Reserve', currency: 'USD', date: '2024-09-18', action: 'cut', newRate: 5.00, changeAmount: -0.25, statement: 'Lowered target range by 25 basis points' },
  { bank: 'ECB', currency: 'EUR', date: '2024-12-12', action: 'cut', newRate: 4.00, changeAmount: -0.25, statement: 'Governing Council decided to lower key rates' },
  { bank: 'ECB', currency: 'EUR', date: '2024-10-17', action: 'cut', newRate: 4.25, changeAmount: -0.25, statement: 'Third consecutive rate cut in easing cycle' },
  { bank: 'ECB', currency: 'EUR', date: '2024-09-12', action: 'cut', newRate: 4.50, changeAmount: -0.25, statement: 'Second rate cut as inflation moderates' },
  { bank: 'Bank of Japan', currency: 'JPY', date: '2024-12-19', action: 'hold', newRate: 0.25, changeAmount: 0, statement: 'Maintained policy rate at 0.25%' },
  { bank: 'Bank of Japan', currency: 'JPY', date: '2024-07-31', action: 'hike', newRate: 0.25, changeAmount: 0.15, statement: 'Raised target rate to 0.25% from 0.1%' },
  { bank: 'Bank of England', currency: 'GBP', date: '2024-12-19', action: 'hold', newRate: 4.75, changeAmount: 0, statement: 'MPC voted to maintain Bank Rate at 4.75%' },
  { bank: 'Bank of England', currency: 'GBP', date: '2024-11-07', action: 'cut', newRate: 4.75, changeAmount: -0.25, statement: 'Bank Rate lowered to 4.75%' },
  { bank: 'PBoC', currency: 'CNY', date: '2024-10-21', action: 'cut', newRate: 3.10, changeAmount: -0.25, statement: 'LPR lowered to support economic recovery' },
  { bank: 'Reserve Bank of Australia', currency: 'AUD', date: '2024-12-10', action: 'hold', newRate: 4.35, changeAmount: 0, statement: 'Cash rate unchanged at 4.35%' },
  { bank: 'Bank of Canada', currency: 'CAD', date: '2024-12-11', action: 'cut', newRate: 3.25, changeAmount: -0.50, statement: 'Jumbo cut of 50 bps amid slowing economy' },
  { bank: 'Swiss National Bank', currency: 'CHF', date: '2024-12-12', action: 'cut', newRate: 0.50, changeAmount: -0.50, statement: 'Policy rate lowered by 50 bps to 0.50%' },
  { bank: 'Reserve Bank of India', currency: 'INR', date: '2024-12-06', action: 'hold', newRate: 6.50, changeAmount: 0, statement: 'Repo rate kept at 6.50% amid inflation concerns' },
  { bank: 'CBRT', currency: 'TRY', date: '2024-12-26', action: 'cut', newRate: 47.50, changeAmount: -2.50, statement: 'Policy rate cut to 47.50% as disinflation begins' },
  { bank: 'BCB', currency: 'BRL', date: '2024-12-11', action: 'hike', newRate: 12.25, changeAmount: 1.00, statement: 'Selic rate raised 100 bps to combat inflation' },
];

export const FORWARD_GUIDANCE: { bank: string; outlook: string; marketExpectation: string }[] = [
  { bank: 'Federal Reserve', outlook: 'Data-dependent approach; expects fewer rate cuts in 2025', marketExpectation: '2-3 cuts expected by end of 2025' },
  { bank: 'ECB', outlook: 'Continued easing as inflation approaches 2% target', marketExpectation: '3-4 additional cuts in 2025' },
  { bank: 'Bank of Japan', outlook: 'Gradual normalization if wage-price cycle strengthens', marketExpectation: '1-2 hikes expected in 2025' },
  { bank: 'Bank of England', outlook: 'Gradual approach to removing monetary restraint', marketExpectation: '3-4 cuts expected in 2025' },
  { bank: 'PBoC', outlook: 'Accommodative stance to support recovery', marketExpectation: 'Further easing likely in H1 2025' },
  { bank: 'Bank of Canada', outlook: 'Ready to cut further if economy weakens', marketExpectation: 'Additional 75-100 bps of cuts in 2025' },
];

export interface TradeFlow {
  source: string;
  target: string;
  exports: number;  // billions USD
  imports: number;  // billions USD
}

export const BILATERAL_TRADE: TradeFlow[] = [
  // US trade (2025 estimates, billions USD)
  { source: 'USA', target: 'China', exports: 125, imports: 465 },
  { source: 'USA', target: 'Canada', exports: 365, imports: 435 },
  { source: 'USA', target: 'Mexico', exports: 340, imports: 485 },
  { source: 'USA', target: 'Japan', exports: 82, imports: 145 },
  { source: 'USA', target: 'Germany', exports: 78, imports: 155 },
  { source: 'USA', target: 'UK', exports: 80, imports: 68 },
  { source: 'USA', target: 'SouthKorea', exports: 68, imports: 120 },
  { source: 'USA', target: 'India', exports: 50, imports: 95 },
  { source: 'USA', target: 'France', exports: 42, imports: 65 },
  { source: 'USA', target: 'Brazil', exports: 48, imports: 40 },
  { source: 'USA', target: 'Vietnam', exports: 12, imports: 125 },
  // China trade
  { source: 'China', target: 'Japan', exports: 160, imports: 170 },
  { source: 'China', target: 'SouthKorea', exports: 155, imports: 195 },
  { source: 'China', target: 'Germany', exports: 105, imports: 100 },
  { source: 'China', target: 'Australia', exports: 75, imports: 155 },
  { source: 'China', target: 'India', exports: 125, imports: 30 },
  { source: 'China', target: 'UK', exports: 80, imports: 35 },
  { source: 'China', target: 'Russia', exports: 120, imports: 140 },
  { source: 'China', target: 'Brazil', exports: 65, imports: 125 },
  { source: 'China', target: 'Vietnam', exports: 140, imports: 68 },
  // European trade
  { source: 'Germany', target: 'France', exports: 125, imports: 85 },
  { source: 'Germany', target: 'Netherlands', exports: 115, imports: 105 },
  { source: 'Germany', target: 'UK', exports: 82, imports: 50 },
  { source: 'Germany', target: 'Italy', exports: 80, imports: 68 },
  { source: 'Germany', target: 'Poland', exports: 85, imports: 78 },
  // Asia-Pacific trade
  { source: 'Japan', target: 'SouthKorea', exports: 50, imports: 35 },
  { source: 'Japan', target: 'Australia', exports: 24, imports: 68 },
  // Other bilateral flows
  { source: 'UK', target: 'France', exports: 38, imports: 45 },
  { source: 'UK', target: 'Netherlands', exports: 42, imports: 55 },
  { source: 'India', target: 'SaudiArabia', exports: 13, imports: 45 },
  { source: 'Australia', target: 'Japan', exports: 68, imports: 24 },
  { source: 'Brazil', target: 'Argentina', exports: 18, imports: 14 },
  { source: 'SaudiArabia', target: 'China', exports: 58, imports: 38 },
  { source: 'Russia', target: 'Turkey', exports: 38, imports: 10 },
  { source: 'Indonesia', target: 'China', exports: 58, imports: 65 },
  { source: 'Mexico', target: 'Canada', exports: 18, imports: 14 },
  { source: 'Nigeria', target: 'India', exports: 15, imports: 10 },
  { source: 'SouthAfrica', target: 'China', exports: 18, imports: 25 },
];

export function getTradePartnersFor(country: string): { partner: string; exports: number; imports: number; balance: number }[] {
  const partners: Record<string, { exports: number; imports: number }> = {};
  for (const flow of BILATERAL_TRADE) {
    if (flow.source === country) {
      if (!partners[flow.target]) partners[flow.target] = { exports: 0, imports: 0 };
      partners[flow.target].exports += flow.exports;
      partners[flow.target].imports += flow.imports;
    }
    if (flow.target === country) {
      if (!partners[flow.source]) partners[flow.source] = { exports: 0, imports: 0 };
      partners[flow.source].exports += flow.imports;
      partners[flow.source].imports += flow.exports;
    }
  }
  return Object.entries(partners).map(([partner, data]) => ({
    partner,
    ...data,
    balance: data.exports - data.imports,
  })).sort((a, b) => (b.exports + b.imports) - (a.exports + a.imports));
}

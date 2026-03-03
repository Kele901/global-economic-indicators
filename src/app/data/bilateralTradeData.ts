export interface TradeFlow {
  source: string;
  target: string;
  exports: number;  // billions USD
  imports: number;  // billions USD
}

export const BILATERAL_TRADE: TradeFlow[] = [
  { source: 'USA', target: 'China', exports: 150, imports: 540 },
  { source: 'USA', target: 'Canada', exports: 352, imports: 421 },
  { source: 'USA', target: 'Mexico', exports: 323, imports: 455 },
  { source: 'USA', target: 'Japan', exports: 80, imports: 148 },
  { source: 'USA', target: 'Germany', exports: 76, imports: 160 },
  { source: 'USA', target: 'UK', exports: 76, imports: 65 },
  { source: 'USA', target: 'SouthKorea', exports: 65, imports: 115 },
  { source: 'USA', target: 'India', exports: 42, imports: 87 },
  { source: 'USA', target: 'France', exports: 40, imports: 63 },
  { source: 'USA', target: 'Brazil', exports: 45, imports: 38 },
  { source: 'China', target: 'Japan', exports: 165, imports: 175 },
  { source: 'China', target: 'SouthKorea', exports: 162, imports: 200 },
  { source: 'China', target: 'Germany', exports: 110, imports: 105 },
  { source: 'China', target: 'Australia', exports: 70, imports: 160 },
  { source: 'China', target: 'India', exports: 118, imports: 28 },
  { source: 'China', target: 'UK', exports: 78, imports: 32 },
  { source: 'China', target: 'Russia', exports: 110, imports: 128 },
  { source: 'China', target: 'Brazil', exports: 62, imports: 120 },
  { source: 'Germany', target: 'France', exports: 120, imports: 80 },
  { source: 'Germany', target: 'Netherlands', exports: 110, imports: 100 },
  { source: 'Germany', target: 'UK', exports: 85, imports: 47 },
  { source: 'Germany', target: 'Italy', exports: 78, imports: 64 },
  { source: 'Germany', target: 'Poland', exports: 80, imports: 72 },
  { source: 'Japan', target: 'SouthKorea', exports: 53, imports: 34 },
  { source: 'Japan', target: 'Australia', exports: 22, imports: 65 },
  { source: 'UK', target: 'France', exports: 35, imports: 43 },
  { source: 'UK', target: 'Netherlands', exports: 40, imports: 52 },
  { source: 'India', target: 'SaudiArabia', exports: 11, imports: 42 },
  { source: 'Australia', target: 'Japan', exports: 65, imports: 22 },
  { source: 'Brazil', target: 'Argentina', exports: 16, imports: 12 },
  { source: 'SaudiArabia', target: 'China', exports: 62, imports: 35 },
  { source: 'Russia', target: 'Turkey', exports: 35, imports: 8 },
  { source: 'Indonesia', target: 'China', exports: 55, imports: 62 },
  { source: 'Mexico', target: 'Canada', exports: 15, imports: 12 },
  { source: 'Nigeria', target: 'India', exports: 14, imports: 8 },
  { source: 'SouthAfrica', target: 'China', exports: 16, imports: 22 },
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

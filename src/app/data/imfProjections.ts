export interface Projection {
  country: string;
  metric: string;
  values: Record<number, number>;
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

export const RISKS = [
  { type: 'downside' as const, title: 'Trade Policy Uncertainty', description: 'Escalating tariff disputes and fragmentation of global trade networks could weigh on investment and growth.' },
  { type: 'downside' as const, title: 'Geopolitical Escalation', description: 'Prolonged regional conflicts and rising tensions could disrupt energy markets and supply chains.' },
  { type: 'downside' as const, title: 'China Structural Slowdown', description: 'Ongoing property sector stress and weak consumer confidence could drag on Asian and global demand.' },
  { type: 'downside' as const, title: 'Fiscal Sustainability Concerns', description: 'Elevated public debt levels in advanced economies could constrain policy space and raise borrowing costs.' },
  { type: 'upside' as const, title: 'AI-Driven Productivity Boom', description: 'Widespread deployment of AI across sectors is beginning to boost productivity in advanced economies.' },
  { type: 'upside' as const, title: 'Synchronized Easing Cycle', description: 'Coordinated central bank rate cuts globally could support stronger-than-expected investment and consumption.' },
  { type: 'upside' as const, title: 'Green Transition Investment', description: 'Accelerating clean energy investment could spur growth and create new industrial capacity.' },
];

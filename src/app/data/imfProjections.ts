export interface Projection {
  country: string;
  metric: string;
  values: Record<number, number>;
}

export const IMF_GDP_PROJECTIONS: Projection[] = [
  { country: 'World', metric: 'gdpGrowth', values: { 2024: 3.2, 2025: 3.3, 2026: 3.3, 2027: 3.2, 2028: 3.1, 2029: 3.1 } },
  { country: 'USA', metric: 'gdpGrowth', values: { 2024: 2.8, 2025: 2.2, 2026: 2.0, 2027: 2.1, 2028: 2.1, 2029: 2.0 } },
  { country: 'UK', metric: 'gdpGrowth', values: { 2024: 1.1, 2025: 1.6, 2026: 1.5, 2027: 1.5, 2028: 1.5, 2029: 1.5 } },
  { country: 'Japan', metric: 'gdpGrowth', values: { 2024: 0.3, 2025: 1.1, 2026: 0.8, 2027: 0.5, 2028: 0.5, 2029: 0.5 } },
  { country: 'Germany', metric: 'gdpGrowth', values: { 2024: 0.0, 2025: 0.8, 2026: 1.4, 2027: 1.3, 2028: 1.2, 2029: 1.2 } },
  { country: 'France', metric: 'gdpGrowth', values: { 2024: 1.1, 2025: 1.1, 2026: 1.3, 2027: 1.5, 2028: 1.6, 2029: 1.6 } },
  { country: 'China', metric: 'gdpGrowth', values: { 2024: 4.8, 2025: 4.5, 2026: 4.1, 2027: 3.8, 2028: 3.6, 2029: 3.5 } },
  { country: 'India', metric: 'gdpGrowth', values: { 2024: 7.0, 2025: 6.5, 2026: 6.5, 2027: 6.5, 2028: 6.5, 2029: 6.5 } },
  { country: 'Brazil', metric: 'gdpGrowth', values: { 2024: 3.0, 2025: 2.2, 2026: 2.2, 2027: 2.0, 2028: 2.0, 2029: 2.0 } },
  { country: 'Canada', metric: 'gdpGrowth', values: { 2024: 1.3, 2025: 2.4, 2026: 2.0, 2027: 1.8, 2028: 1.8, 2029: 1.8 } },
  { country: 'Australia', metric: 'gdpGrowth', values: { 2024: 1.2, 2025: 2.1, 2026: 2.3, 2027: 2.5, 2028: 2.5, 2029: 2.5 } },
  { country: 'Mexico', metric: 'gdpGrowth', values: { 2024: 1.5, 2025: 1.0, 2026: 1.8, 2027: 2.0, 2028: 2.2, 2029: 2.2 } },
  { country: 'SouthKorea', metric: 'gdpGrowth', values: { 2024: 2.5, 2025: 2.2, 2026: 2.1, 2027: 2.0, 2028: 2.0, 2029: 2.0 } },
  { country: 'Indonesia', metric: 'gdpGrowth', values: { 2024: 5.0, 2025: 5.1, 2026: 5.1, 2027: 5.1, 2028: 5.0, 2029: 5.0 } },
  { country: 'Russia', metric: 'gdpGrowth', values: { 2024: 3.6, 2025: 1.3, 2026: 1.2, 2027: 1.0, 2028: 0.8, 2029: 0.8 } },
  { country: 'Turkey', metric: 'gdpGrowth', values: { 2024: 3.0, 2025: 2.6, 2026: 3.2, 2027: 3.5, 2028: 3.5, 2029: 3.5 } },
];

export const IMF_INFLATION_PROJECTIONS: Projection[] = [
  { country: 'World', metric: 'inflation', values: { 2024: 5.8, 2025: 4.4, 2026: 3.8, 2027: 3.4, 2028: 3.2, 2029: 3.0 } },
  { country: 'USA', metric: 'inflation', values: { 2024: 2.9, 2025: 2.1, 2026: 2.0, 2027: 2.0, 2028: 2.0, 2029: 2.0 } },
  { country: 'UK', metric: 'inflation', values: { 2024: 2.5, 2025: 2.6, 2026: 2.0, 2027: 2.0, 2028: 2.0, 2029: 2.0 } },
  { country: 'Japan', metric: 'inflation', values: { 2024: 2.5, 2025: 2.0, 2026: 1.8, 2027: 2.0, 2028: 2.0, 2029: 2.0 } },
  { country: 'China', metric: 'inflation', values: { 2024: 0.5, 2025: 1.0, 2026: 1.5, 2027: 2.0, 2028: 2.0, 2029: 2.0 } },
  { country: 'India', metric: 'inflation', values: { 2024: 4.8, 2025: 4.2, 2026: 4.0, 2027: 4.0, 2028: 4.0, 2029: 4.0 } },
  { country: 'Brazil', metric: 'inflation', values: { 2024: 4.3, 2025: 3.6, 2026: 3.2, 2027: 3.0, 2028: 3.0, 2029: 3.0 } },
];

export const REGIONAL_GDP_PROJECTIONS = [
  { region: 'Advanced Economies', y2024: 1.8, y2025: 1.8, y2026: 1.8 },
  { region: 'Emerging Markets', y2024: 4.2, y2025: 4.2, y2026: 4.3 },
  { region: 'Developing Asia', y2024: 5.3, y2025: 5.1, y2026: 5.0 },
  { region: 'Latin America', y2024: 2.1, y2025: 2.5, y2026: 2.5 },
  { region: 'Sub-Saharan Africa', y2024: 3.8, y2025: 4.2, y2026: 4.3 },
  { region: 'Middle East', y2024: 2.7, y2025: 3.2, y2026: 3.4 },
  { region: 'Europe (Emerging)', y2024: 3.2, y2025: 2.5, y2026: 2.5 },
];

export const GLOBAL_OUTLOOK_SUMMARY = {
  worldGDP: { value: 3.3, change: 0.1, unit: '%' },
  globalInflation: { value: 4.4, change: -1.4, unit: '%' },
  tradeGrowth: { value: 3.3, change: 0.5, unit: '%' },
  oilPrice: { value: 73, change: -7, unit: '$/bbl' },
};

export const RISKS = [
  { type: 'downside' as const, title: 'Geopolitical Tensions', description: 'Escalation in trade disputes and regional conflicts could disrupt supply chains and dampen investment.' },
  { type: 'downside' as const, title: 'Sticky Inflation', description: 'Services inflation proving more persistent than expected, potentially requiring higher-for-longer interest rates.' },
  { type: 'downside' as const, title: 'China Property Downturn', description: 'Further deterioration in China real estate sector could weigh on regional and global growth.' },
  { type: 'upside' as const, title: 'AI Productivity Gains', description: 'Faster-than-expected adoption of AI technologies could boost productivity across advanced economies.' },
  { type: 'upside' as const, title: 'Faster Disinflation', description: 'Supply chain normalization and energy price declines could accelerate return to target inflation.' },
];

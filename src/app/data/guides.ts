// Single registry for the written guides. Drives the /guides index, per-guide SEO
// metadata, the sitemap and the footer links, so a new guide only needs adding here
// once rather than in four separate places.

export type GuideTopic =
  | 'Foundations'
  | 'Money & Policy'
  | 'Cycles & Markets'
  | 'Trade & Global'
  | 'Debt & Fiscal'
  | 'Technology'
  | 'Forecasting';

export type GuideLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Guide {
  slug: string;
  title: string;
  blurb: string;
  topic: GuideTopic;
  level: GuideLevel;
  /** Approximate read time in minutes. */
  minutes: number;
}

export const GUIDE_TOPICS: GuideTopic[] = [
  'Foundations',
  'Money & Policy',
  'Cycles & Markets',
  'Trade & Global',
  'Debt & Fiscal',
  'Technology',
  'Forecasting',
];

export const GUIDES: Guide[] = [
  {
    slug: 'reading-economic-data',
    title: 'How to Read Economic Data',
    blurb:
      'A beginner-friendly introduction to interpreting charts, understanding key indicators, and making sense of the numbers on our platform.',
    topic: 'Foundations',
    level: 'Beginner',
    minutes: 8,
  },
  {
    slug: 'gdp-and-national-accounts',
    title: 'GDP and National Accounts',
    blurb:
      'What GDP measures, why it matters, and how to interpret the different ways economic output is reported.',
    topic: 'Foundations',
    level: 'Beginner',
    minutes: 7,
  },
  {
    slug: 'understanding-employment-data',
    title: 'Understanding Employment Data',
    blurb:
      'What unemployment and employment metrics really measure, their limitations, and how to interpret labor market data across countries.',
    topic: 'Foundations',
    level: 'Beginner',
    minutes: 6,
  },
  {
    slug: 'emerging-vs-developed-economies',
    title: 'Emerging vs. Developed Economies',
    blurb:
      'How economists classify countries, why the distinction matters for data interpretation, and what to watch when comparing across income groups.',
    topic: 'Foundations',
    level: 'Beginner',
    minutes: 6,
  },
  {
    slug: 'development-inequality',
    title: 'Human Development & Inequality',
    blurb:
      'Why GDP alone is insufficient, how the Human Development Index captures well-being, what the Gini coefficient reveals about inequality, and how sustainability metrics connect to development.',
    topic: 'Foundations',
    level: 'Intermediate',
    minutes: 9,
  },
  {
    slug: 'understanding-interest-rates',
    title: 'Understanding Interest Rates',
    blurb:
      'A guide to how central banks set rates, why they matter, and how to interpret interest rate data on our platform.',
    topic: 'Money & Policy',
    level: 'Beginner',
    minutes: 8,
  },
  {
    slug: 'how-central-banks-work',
    title: 'How Central Banks Work',
    blurb:
      'The institutions that control monetary policy, their tools, mandates, and how their decisions ripple through the global economy.',
    topic: 'Money & Policy',
    level: 'Beginner',
    minutes: 6,
  },
  {
    slug: 'inflation-guide',
    title: 'Understanding Inflation',
    blurb:
      'What drives price increases, how inflation is measured, and why central banks treat it as a primary policy target.',
    topic: 'Money & Policy',
    level: 'Beginner',
    minutes: 8,
  },
  {
    slug: 'monetary-policy-decisions',
    title: 'Understanding Monetary Policy Decisions',
    blurb:
      'How central banks set interest rates, the tools they use beyond rate changes, and why monetary policy decisions ripple through the global economy.',
    topic: 'Money & Policy',
    level: 'Intermediate',
    minutes: 9,
  },
  {
    slug: 'monetary-policy-regimes',
    title: 'Monetary Policy Regimes Through History',
    blurb:
      'How the rules of money changed from the gold standard to floating rates, quantitative easing, and today\u2019s search for a stable normal.',
    topic: 'Money & Policy',
    level: 'Advanced',
    minutes: 9,
  },
  {
    slug: 'currencies-and-exchange-rates',
    title: 'Currencies and Exchange Rates',
    blurb:
      'How currencies work, what drives exchange rates, and why some currencies dominate global finance while others remain regional.',
    topic: 'Money & Policy',
    level: 'Intermediate',
    minutes: 8,
  },
  {
    slug: 'economic-cycles-explained',
    title: 'Economic Cycles Explained',
    blurb:
      'How economies expand and contract, why crises recur, and what frameworks like Dalio\u2019s debt cycles and Reinhart-Rogoff\u2019s crisis patterns teach us.',
    topic: 'Cycles & Markets',
    level: 'Intermediate',
    minutes: 9,
  },
  {
    slug: 'business-cycle-indicators',
    title: 'Real-Time Business Cycle Indicators',
    blurb:
      'How policymakers, investors and businesses use forward-looking data, from the yield curve to PMIs, to gauge where the economy is headed before official recession calls arrive.',
    topic: 'Cycles & Markets',
    level: 'Intermediate',
    minutes: 11,
  },
  {
    slug: 'market-cycle-indicators',
    title: 'Market Cycle Indicators',
    blurb:
      'How valuation ratios, sector behaviour, global timing and the yield curve help locate markets within the recurring rhythm from undervaluation through euphoria, stress and recovery.',
    topic: 'Cycles & Markets',
    level: 'Advanced',
    minutes: 9,
  },
  {
    slug: 'kondratiev-long-waves',
    title: 'Kondratiev Long Waves',
    blurb:
      'Multi-decade super-cycles of technology and finance: Kondratiev\u2019s original idea, the five long waves, Carlota Perez\u2019s refinement, and why the framework still sparks debate.',
    topic: 'Cycles & Markets',
    level: 'Advanced',
    minutes: 10,
  },
  {
    slug: 'minsky-financial-instability',
    title: 'Minsky\u2019s Financial Instability Hypothesis',
    blurb:
      'Why long stretches of calm in finance can plant the seeds of crisis, how hedge and Ponzi finance differ, and what policymakers watch for when credit runs ahead of the real economy.',
    topic: 'Cycles & Markets',
    level: 'Advanced',
    minutes: 9,
  },
  {
    slug: 'geopolitical-cycles',
    title: 'Geopolitical Cycles and the Global Economy',
    blurb:
      'How shifts in power, conflict and monetary order interact with macroeconomic cycles, reserve currencies and investment risk.',
    topic: 'Cycles & Markets',
    level: 'Advanced',
    minutes: 10,
  },
  {
    slug: 'global-trade-explained',
    title: 'Global Trade Explained',
    blurb:
      'How international trade works, what the key indicators measure, and how to interpret trade data on our platform.',
    topic: 'Trade & Global',
    level: 'Beginner',
    minutes: 8,
  },
  {
    slug: 'trade-networks',
    title: 'Trade Networks & Supply Chains',
    blurb:
      'How international trade connects economies, what trade balances reveal, why supply chain concentration matters, and how to read trade network visualisations.',
    topic: 'Trade & Global',
    level: 'Intermediate',
    minutes: 8,
  },
  {
    slug: 'government-debt-explained',
    title: 'Government Debt Explained',
    blurb:
      'What sovereign debt is, how it accumulates, why some countries sustain high debt levels while others default, and how to read debt metrics.',
    topic: 'Debt & Fiscal',
    level: 'Beginner',
    minutes: 7,
  },
  {
    slug: 'debt-sustainability',
    title: 'Debt Sustainability Explained',
    blurb:
      'What makes government debt sustainable, how analysts assess fiscal health, and what warning signs indicate a country may be approaching a debt crisis.',
    topic: 'Debt & Fiscal',
    level: 'Intermediate',
    minutes: 8,
  },
  {
    slug: 'technology-innovation-metrics',
    title: 'Technology and Innovation Metrics',
    blurb:
      'How nations measure innovation, what R&D and patent data reveal, and how to use our Technology page.',
    topic: 'Technology',
    level: 'Intermediate',
    minutes: 8,
  },
  {
    slug: 'digital-economy-and-ai',
    title: 'The Digital Economy and AI',
    blurb:
      'How digitisation is reshaping economies, what AI patent data reveals, and how to interpret the metrics of the digital transformation.',
    topic: 'Technology',
    level: 'Intermediate',
    minutes: 7,
  },
  {
    slug: 'economic-forecasting',
    title: 'Economic Forecasting & Outlook',
    blurb:
      'How economic forecasts are produced, what the IMF World Economic Outlook tells us, and how to interpret projections with appropriate scepticism.',
    topic: 'Forecasting',
    level: 'Intermediate',
    minutes: 8,
  },
  {
    slug: 'scenario-analysis',
    title: 'Scenario Analysis & Correlations',
    blurb:
      'How the scenario simulator uses historical correlations to project economic impacts, what correlation means (and does not mean), and how to interpret results responsibly.',
    topic: 'Forecasting',
    level: 'Advanced',
    minutes: 9,
  },
];
// Note: the glossary lives at /glossary, not under /guides. The old
// /guides/glossary route redirects there (see next.config.js).

export const GUIDE_BY_SLUG: Record<string, Guide> = Object.fromEntries(
  GUIDES.map((g) => [g.slug, g]),
);

export function getGuide(slug: string): Guide | undefined {
  return GUIDE_BY_SLUG[slug];
}

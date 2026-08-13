// Reverse-chronological, human-readable release notes for the site.
// Seeded from the last significant commits on the main branch. Add a
// new entry every meaningful release; the /changelog page renders
// these directly.

export type ChangeTag = 'feature' | 'ledger' | 'perf' | 'a11y' | 'trust' | 'data' | 'fix';

export interface ChangelogEntry {
  date: string;             // ISO date, YYYY-MM-DD
  version?: string;         // optional label (e.g. "v2.6")
  title: string;
  tags: ChangeTag[];
  highlights: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: '2026-08-13',
    version: '2.7',
    title: 'Community & extras — Wave 7',
    tags: ['feature'],
    highlights: [
      '/changelog page with searchable release history',
      'Cite-this-page dropdown (APA, MLA, Chicago, BibTeX, URL)',
      '/embed-gallery showcasing the six most-embedded charts',
      '/simulator historical presets: Replay 2008, 1973 oil shock, 2020 COVID, 2022 Ukraine shock',
      '/correlation-lab: pick any two metrics, lag by N years, Pearson coefficient + scatter',
      'Anomaly banner on the Dashboard flags 3 most-anomalous readings vs 5-year mean',
      'Defense Ledger guided tour walks readers through all 8 chapters',
      '/learn PDF export button prints every lesson body in a single view',
    ],
  },
  {
    date: '2026-08-13',
    version: '2.6',
    title: 'Accessibility — Wave 6',
    tags: ['a11y'],
    highlights: [
      'Colour-blind palette toggle (default, deuteranopia, protanopia, tritanopia) in the Navbar Info menu',
      'usePalette semantic layer so future chart edits stay palette-agnostic',
      'ChartA11yCaption: screen-reader summary announces top / median / bottom for every headline chart',
    ],
  },
  {
    date: '2026-08-13',
    version: '2.5',
    title: 'Performance — Wave 5',
    tags: ['perf'],
    highlights: [
      'next/image swap for the site logo (AVIF/WebP negotiation, preload)',
      'ISR revalidate = 3600 on all 10 ledger routes for faster cold TTFB',
      'LazyMount + IntersectionObserver defers chapters 7 & 8 of every ledger until scrolled',
    ],
  },
  {
    date: '2026-08-13',
    version: '2.4',
    title: 'Trust rollout — Wave 4',
    tags: ['trust'],
    highlights: [
      'ChartMeta stamps ("Updated X · source: Y") on every ledger hero',
      'DataQualityBadge flags: estimate, curated, frozen, revised',
      'qualityFlags registry populated for WGI governance, SIPRI fallback, IMF WEO',
    ],
  },
  {
    date: '2026-08-13',
    version: '2.3',
    title: 'Personalisation — Wave 3',
    tags: ['feature'],
    highlights: [
      'Save-to-watchlist ★ chip on country profile metrics',
      'Site-wide exploration progress badge (X/24 pages visited)',
      'RouteTracker persists visited routes locally with reset option',
    ],
  },
  {
    date: '2026-08-13',
    version: '2.2',
    title: 'Navigation & discoverability — Wave 2',
    tags: ['feature'],
    highlights: [
      'Cmd/Ctrl-K global command palette indexes pages, countries, metrics',
      'Navbar split into Ledgers vs Analysis dropdowns',
      'Breadcrumbs on every ledger page',
      'RelatedPages chip row for cross-ledger discovery',
    ],
  },
  {
    date: '2026-08-13',
    version: '2.1',
    title: 'Health, Energy & Labor Ledgers — Wave 1',
    tags: ['ledger', 'data'],
    highlights: [
      'Health Ledger: 8 chapters on spend vs outcomes, pandemic readiness, mental health, disease burden',
      'Energy Ledger: electricity mix, storage build-out, LNG flows, nuclear status, capacity factors',
      'Labor Ledger: wages, unions, informal work, demographic cliff, AI displacement, gender gap',
      'CountryBrief cross-ledger card + printable country brief',
      'Cache version bumped to 31 for the fuller country roster',
    ],
  },
  {
    date: '2026-07-30',
    version: '2.0',
    title: 'Learn starter guide',
    tags: ['feature'],
    highlights: [
      'Interactive /learn curriculum: hero, six mini-widgets, quizzes, printable certificate',
      'Homepage LearnBanner promotes the guide for a 13+ audience',
      'Top-level Navbar entry',
    ],
  },
  {
    date: '2026-07-15',
    title: 'AI Ledger + Vercel-build hardening',
    tags: ['ledger', 'fix'],
    highlights: [
      'AI/Technology Ledger with 8 chapters and Stanford AI Index / Epoch AI curated data',
      'Fix Vercel build: correct tariffRate field name in Trade Ledger; exclude vitest config from Next tsconfig',
    ],
  },
  {
    date: '2026-07-01',
    title: 'Debt, Migration, Trade ledgers + testing scaffold',
    tags: ['ledger', 'data'],
    highlights: [
      'Debt Ledger expanded from single drill-down into 8-chapter epic',
      'Migration Ledger with WB remittance/refugee data + UNHCR/DESA snapshots',
      'Trade Ledger with curated tariff/shipping/agreements data',
      'Vitest scaffold + unit tests for shared utils',
      'Server-side proxy caching, chart CSV/JSON download, health probe API',
    ],
  },
];

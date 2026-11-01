// Curated adjacency map for the RelatedPages chip row. Powers the
// "related content" chips at the bottom of ledger + explore pages.
// Order matters — first-listed = most relevant.

export const RELATED_PAGES: Record<string, { href: string; label: string }[]> = {
  '/politics-ledger': [
    { href: '/defense-ledger',   label: 'Defense Ledger' },
    { href: '/development',      label: 'Development Ledger' },
    { href: '/inequality',       label: 'Inequality Ledger' },
    { href: '/cultural-capital', label: 'Cultural Capital' },
  ],
  '/defense-ledger': [
    { href: '/politics-ledger',  label: 'Politics Ledger' },
    { href: '/trade-ledger',     label: 'Trade Ledger' },
    { href: '/ai-ledger',        label: 'AI Ledger' },
    { href: '/energy-ledger',    label: 'Energy Ledger' },
    { href: '/debt',             label: 'Debt Ledger' },
  ],
  '/climate-ledger': [
    { href: '/energy-ledger',    label: 'Energy Ledger' },
    { href: '/health-ledger',    label: 'Health Ledger' },
    { href: '/resources',        label: 'Resource Atlas' },
    { href: '/migration-ledger', label: 'Migration Ledger' },
  ],
  '/trade-ledger': [
    { href: '/trade-network',    label: 'Trade Network' },
    { href: '/economic-gravity', label: 'Economic Gravity' },
    { href: '/defense-ledger',   label: 'Defense Ledger' },
    { href: '/resources',        label: 'Resource Atlas' },
  ],
  '/migration-ledger': [
    { href: '/labor-ledger',     label: 'Labor Ledger' },
    { href: '/climate-ledger',   label: 'Climate Ledger' },
    { href: '/inequality',       label: 'Inequality Ledger' },
    { href: '/cultural-capital', label: 'Cultural Capital' },
  ],
  '/debt': [
    { href: '/monetary-policy',  label: 'Monetary Policy' },
    { href: '/trade-ledger',     label: 'Trade Ledger' },
    { href: '/simulator',        label: 'Scenario Simulator' },
    { href: '/outlook',          label: 'Forecasts & Outlook' },
  ],
  '/ai-ledger': [
    { href: '/labor-ledger',     label: 'Labor Ledger' },
    { href: '/technology',       label: 'Technology' },
    { href: '/energy-ledger',    label: 'Energy Ledger' },
    { href: '/defense-ledger',   label: 'Defense Ledger' },
  ],
  '/health-ledger': [
    { href: '/labor-ledger',     label: 'Labor Ledger' },
    { href: '/climate-ledger',   label: 'Climate Ledger' },
    { href: '/inequality',       label: 'Inequality Ledger' },
    { href: '/development',      label: 'Development Ledger' },
  ],
  '/energy-ledger': [
    { href: '/climate-ledger',   label: 'Climate Ledger' },
    { href: '/resources',        label: 'Resource Atlas' },
    { href: '/defense-ledger',   label: 'Defense Ledger' },
    { href: '/trade-ledger',     label: 'Trade Ledger' },
  ],
  '/labor-ledger': [
    { href: '/ai-ledger',        label: 'AI Ledger' },
    { href: '/health-ledger',    label: 'Health Ledger' },
    { href: '/inequality',       label: 'Inequality Ledger' },
    { href: '/migration-ledger', label: 'Migration Ledger' },
  ],
  '/inequality': [
    { href: '/development',      label: 'Development Ledger' },
    { href: '/labor-ledger',     label: 'Labor Ledger' },
    { href: '/health-ledger',    label: 'Health Ledger' },
    { href: '/migration-ledger', label: 'Migration Ledger' },
  ],
  '/development': [
    { href: '/inequality',       label: 'Inequality Ledger' },
    { href: '/health-ledger',    label: 'Health Ledger' },
    { href: '/climate-ledger',   label: 'Climate Ledger' },
    { href: '/labor-ledger',     label: 'Labor Ledger' },
    { href: '/development/where-do-you-stand', label: 'Global Income Calculator' },
  ],
  '/inflation': [
    { href: '/inflation-calculator', label: 'Inflation Calculator' },
    { href: '/monetary-policy',  label: 'Monetary Policy' },
    { href: '/outlook',          label: 'Economic Outlook' },
    { href: '/labor-ledger',     label: 'Labor Ledger' },
    { href: '/currency-hierarchy', label: 'Currency Hierarchy' },
    { href: '/global-heatmap?metric=inflationRates&view=choropleth', label: 'Global Heatmap' },
  ],
  '/inflation-calculator': [
    { href: '/inflation',        label: 'Inflation & Cost of Living' },
    { href: '/monetary-policy',  label: 'Monetary Policy' },
    { href: '/outlook',          label: 'Economic Outlook' },
  ],
  '/resources': [
    { href: '/energy-ledger',    label: 'Energy Ledger' },
    { href: '/trade-ledger',     label: 'Trade Ledger' },
    { href: '/climate-ledger',   label: 'Climate Ledger' },
    { href: '/currency-hierarchy', label: 'Currency Hierarchy' },
  ],
};

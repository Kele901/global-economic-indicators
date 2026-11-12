// The Technology page power network: the AI network plus the energy, metals,
// materials, core-tech and mobility companies around it, in 24 categories
// grouped into 9 sectors so the graph can collapse them into clusters.
// Figures follow the conventions in aiPowerNetwork.ts and share its date stamp.

import { CATEGORY_BY_ID, CHOKEPOINTS, NETWORK_LAST_UPDATED, TECH_COMPANIES, TECH_LINKS } from './aiPowerNetwork';
import { makeDataset, type Sector, type TechCategory, type TechCompany } from './network/types';
import { AUTO_COMPANIES, AUTO_LINKS } from './techNetworkAutos';
import { CORE_TECH_COMPANIES } from './techNetworkCoreTech';
import { CROSS_CHOKEPOINTS, CROSS_LINKS } from './techNetworkLinks';
import { UPSTREAM_COMPANIES } from './techNetworkUpstream';

const NEW_CATEGORIES: TechCategory[] = [
  { id: 'oil-gas',           label: 'Oil & gas',             color: '#a16207', description: 'Oil majors supplying gas and, increasingly, dedicated power plants for data centres.' },
  { id: 'nuclear-utilities', label: 'Nuclear & utilities',   color: '#f59e0b', description: 'Power producers, reactor designers and fuel suppliers selling firm electricity to tech.' },
  { id: 'batteries-grid',    label: 'Batteries & grid',      color: '#e11d48', description: 'Battery makers, cable makers and grid-equipment suppliers.' },
  { id: 'mining',            label: 'Mining & metals',       color: '#b08968', description: 'Copper, lithium, rare-earth and battery-metal producers.' },
  { id: 'materials-gases',   label: 'Materials & gases',     color: '#94a3b8', description: 'Industrial gases, glass and fibre, quartz and the specialty chemicals fabs consume.' },
  { id: 'autos',             label: 'Carmakers',             color: '#f97316', description: 'Volume and premium carmakers electrifying fleets and adopting in-car AI and autonomy stacks.' },
  { id: 'auto-tech',         label: 'Auto tech & suppliers', color: '#fb923c', description: 'Tier-1 suppliers, ADAS and robotaxi firms, and automotive chipmakers.' },
  { id: 'telecoms',          label: 'Telecoms',              color: '#818cf8', description: 'Network-equipment makers and carriers that move data between data centres and users.' },
  { id: 'software',          label: 'Software & data',       color: '#a855f7', description: 'Enterprise applications, data platforms and IT services.' },
  { id: 'cyber',             label: 'Cybersecurity',         color: '#06b6d4', description: 'Security platforms protecting endpoints, networks, clouds and AI workloads.' },
  { id: 'internet',          label: 'Consumer internet',     color: '#fb7185', description: 'Social, streaming, marketplace and mobility platforms with billions of users.' },
  { id: 'payments',          label: 'Payments',              color: '#10b981', description: 'Card networks, wallets and processors, now preparing for AI agents that pay.' },
];

export const TECH_SECTORS: Sector[] = [
  { id: 'energy',         label: 'Energy & resources',  color: '#f59e0b', categoryIds: ['oil-gas', 'nuclear-utilities', 'power', 'batteries-grid'] },
  { id: 'materials',      label: 'Materials & metals',  color: '#b08968', categoryIds: ['mining', 'materials-gases'] },
  { id: 'semis',          label: 'Semiconductors',      color: '#0ea5e9', categoryIds: ['equipment', 'foundry', 'memory', 'design'] },
  { id: 'mobility',       label: 'Mobility',            color: '#f97316', categoryIds: ['autos', 'auto-tech'] },
  { id: 'infrastructure', label: 'Infrastructure',      color: '#6366f1', categoryIds: ['networking', 'systems', 'telecoms'] },
  { id: 'ai',             label: 'AI',                  color: '#ec4899', categoryIds: ['cloud', 'labs'] },
  { id: 'software',       label: 'Software & security', color: '#a855f7', categoryIds: ['enterprise', 'software', 'cyber'] },
  { id: 'consumer',       label: 'Consumer & payments', color: '#ef4444', categoryIds: ['devices', 'internet', 'payments'] },
  { id: 'capital',        label: 'Capital',             color: '#84cc16', categoryIds: ['capital'] },
];

/** Category overrides applied only on the Technology page (AI Ledger keeps the originals). */
const CATEGORY_OVERRIDES: Record<string, string> = {
  tesla: 'autos',
};

function withCategoryOverrides(companies: TechCompany[]): TechCompany[] {
  return companies.map((c) => {
    const category = CATEGORY_OVERRIDES[c.id];
    return category && category !== c.category ? { ...c, category } : c;
  });
}

const ALL_CATEGORIES: Record<string, TechCategory> = {
  ...CATEGORY_BY_ID,
  ...Object.fromEntries(NEW_CATEGORIES.map((c) => [c.id, c])),
};

/** Categories in sector order, so neighbouring wedges of the ring belong to the same sector. */
export const TECH_NETWORK_CATEGORIES: TechCategory[] = TECH_SECTORS.flatMap((s) =>
  s.categoryIds.map((id) => ALL_CATEGORIES[id]),
);

export const TECH_NETWORK = makeDataset({
  id: 'tech',
  sourceId: 'tech-power-network',
  lastUpdated: NETWORK_LAST_UPDATED,
  categories: TECH_NETWORK_CATEGORIES,
  sectors: TECH_SECTORS,
  companies: [
    ...withCategoryOverrides(TECH_COMPANIES),
    ...UPSTREAM_COMPANIES,
    ...CORE_TECH_COMPANIES,
    ...AUTO_COMPANIES,
  ],
  links: [...TECH_LINKS, ...CROSS_LINKS, ...AUTO_LINKS],
  chokepoints: [...CHOKEPOINTS, ...CROSS_CHOKEPOINTS],
  defaultHub: 'microsoft',
  quickPicks: ['microsoft', 'nvidia', 'tsmc', 'amazon', 'constellation', 'toyota', 'byd', 'linde', 'tencent', 'visa'],
  chapterHash: '#chapter-12',
  filename: 'tech-power-network',
  shareTitle: 'The Tech Power Network',
  layersLabel: `${TECH_NETWORK_CATEGORIES.length} categories in ${TECH_SECTORS.length} sectors`,
  roleLabel: 'Role in the network',
  footnote:
    'Private-company values are the latest funding-round, buyout or deal valuation; "(approx.)" marks revenue taken '
    + 'from guidance or press estimates. AI-lab revenue is an annualised run-rate. Links show publicly announced '
    + 'relationships and are not exhaustive; commodity tags mark the physical input that flows along a supply link.',
});

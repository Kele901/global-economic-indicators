// Shared shapes for the power-network chapters (AI Ledger and Technology page).
// A NetworkDataset bundles everything one chapter renders, so the same
// components can draw a 59-company AI map or a 125-company cross-industry map.

export type CategoryId = string;

export interface TechCategory {
  id: CategoryId;
  label: string;
  color: string;
  description: string;
}

/** A group of categories that the large graph can collapse into one cluster. */
export interface Sector {
  id: string;
  label: string;
  color: string;
  categoryIds: CategoryId[];
}

export interface SourceRef {
  label: string;
  url: string;
}

export interface TechCompany {
  id: string;
  name: string;
  category: CategoryId;
  /** Internal country key used by CountryFlag, e.g. "SouthKorea". */
  hqCountry: string;
  hqCity: string;
  founded: number;
  leader?: string;
  listed: boolean;
  ticker?: string;
  revenueUsdBn: number | null;
  revenueBasis: string;
  valueUsdBn: number | null;
  valueBasis: string;
  employees?: number;
  /**
   * 'full' (default): multi-paragraph summary, contributions and products.
   * 'brief': one-paragraph summary, may omit contributions and products.
   */
  tier?: 'full' | 'brief';
  oneLiner: string;
  summary: string[];
  contributions: string[];
  keyProducts: string[];
  /** Why the company matters to this network; heading comes from NetworkDataset.roleLabel. */
  role: string;
  chokepoint?: string;
  sources: SourceRef[];
}

/**
 * supplies:    source sells products or services to target
 * customer:    source buys compute or services from target
 * investment:  source holds equity in target
 * partnership: joint development or distribution, no direction implied
 */
export type LinkKind = 'supplies' | 'customer' | 'investment' | 'partnership';

export const LINK_KINDS: { id: LinkKind; label: string; color: string }[] = [
  { id: 'supplies',    label: 'Supply',       color: '#38bdf8' },
  { id: 'customer',    label: 'Compute deal', color: '#facc15' },
  { id: 'investment',  label: 'Investment',   color: '#a3e635' },
  { id: 'partnership', label: 'Partnership',  color: '#f0abfc' },
];

export const KIND_COLOR = Object.fromEntries(LINK_KINDS.map((k) => [k.id, k.color])) as Record<LinkKind, string>;

/** Physical input that flows along a supply link, used by the commodity filter. */
export type Commodity =
  | 'electricity'
  | 'natural-gas'
  | 'uranium'
  | 'copper'
  | 'rare-earths'
  | 'lithium'
  | 'gallium-germanium'
  | 'industrial-gases'
  | 'quartz'
  | 'optical-fibre'
  | 'cables'
  | 'transformers'
  | 'batteries';

export const COMMODITIES: { id: Commodity; label: string }[] = [
  { id: 'electricity',       label: 'Electricity' },
  { id: 'natural-gas',       label: 'Natural gas' },
  { id: 'uranium',           label: 'Uranium & nuclear fuel' },
  { id: 'copper',            label: 'Copper' },
  { id: 'rare-earths',       label: 'Rare earths' },
  { id: 'lithium',           label: 'Lithium' },
  { id: 'gallium-germanium', label: 'Gallium & germanium' },
  { id: 'industrial-gases',  label: 'Industrial gases' },
  { id: 'quartz',            label: 'High-purity quartz' },
  { id: 'optical-fibre',     label: 'Optical fibre' },
  { id: 'cables',            label: 'Power cables' },
  { id: 'transformers',      label: 'Transformers & grid gear' },
  { id: 'batteries',         label: 'Batteries' },
];

export interface TechLink {
  source: string;
  target: string;
  kind: LinkKind;
  note: string;
  commodity?: Commodity;
}

export interface Chokepoint {
  id: string;
  title: string;
  /** Approximate share held by the leader(s), 0–100. */
  sharePct: number;
  shareLabel: string;
  holders: string[];
  dependency: string;
  dependents: string[];
  source: string;
  /** For chokepoints held by a country rather than a company, e.g. China for gallium. */
  holderCountry?: string;
}

export interface NetworkDataset {
  id: string;
  /** Provenance registry id rendered by ChartMeta. */
  sourceId: string;
  lastUpdated: string;
  categories: TechCategory[];
  categoryById: Record<CategoryId, TechCategory>;
  sectors?: Sector[];
  companies: TechCompany[];
  companyById: Record<string, TechCompany>;
  links: TechLink[];
  chokepoints: Chokepoint[];
  defaultHub: string;
  quickPicks: string[];
  /** Anchor appended to share links, e.g. "#chapter-9". */
  chapterHash: string;
  /** Download filename and share title. */
  filename: string;
  shareTitle: string;
  /** Wording for the "how many layers" stat tile, e.g. "12 layers of the stack". */
  layersLabel: string;
  /** Heading above TechCompany.role, e.g. "Role in AI". */
  roleLabel: string;
  footnote: string;
}

type DatasetSpec = Omit<NetworkDataset, 'categoryById' | 'companyById'>;

export function makeDataset(spec: DatasetSpec): NetworkDataset {
  return {
    ...spec,
    categoryById: Object.fromEntries(spec.categories.map((c) => [c.id, c])),
    companyById: Object.fromEntries(spec.companies.map((c) => [c.id, c])),
  };
}

// Curated snapshots for the AI/Technology Ledger. The Stanford AI Index,
// Epoch AI, EEDA, SEMI, IEA, and the various AI regulation trackers are
// PDF-first releases with no clean live API, so we bake the key tables
// in. Update CURATED_LAST_UPDATED whenever any of the tables here is
// refreshed — the StalenessBanner uses that stamp to warn users when the
// curation ages past twelve months.

export const CURATED_LAST_UPDATED = '2025-10-15';

// Roster of AI-relevant economies (Stanford AI Index Chapter 4 leaders +
// EU + notable emerging). Colour palette avoids collisions with the
// trade / climate / defense / debt palettes.
export interface AiCountryMeta {
  iso3: string;
  wbKey: string;    // matches worldbank.ts COUNTRY_NAMES
  name: string;
  color: string;
}

export const AI_COUNTRY_META: AiCountryMeta[] = [
  { iso3: 'USA', wbKey: 'USA',          name: 'United States',  color: '#2563eb' },
  { iso3: 'CHN', wbKey: 'China',        name: 'China',          color: '#dc2626' },
  { iso3: 'GBR', wbKey: 'UK',           name: 'United Kingdom', color: '#1e40af' },
  { iso3: 'ISR', wbKey: 'Israel',       name: 'Israel',         color: '#3b82f6' },
  { iso3: 'CAN', wbKey: 'Canada',       name: 'Canada',         color: '#ef4444' },
  { iso3: 'DEU', wbKey: 'Germany',      name: 'Germany',        color: '#facc15' },
  { iso3: 'FRA', wbKey: 'France',       name: 'France',         color: '#6366f1' },
  { iso3: 'IND', wbKey: 'India',        name: 'India',          color: '#f43f5e' },
  { iso3: 'JPN', wbKey: 'Japan',        name: 'Japan',          color: '#be185d' },
  { iso3: 'KOR', wbKey: 'SouthKorea',   name: 'South Korea',    color: '#8b5cf6' },
  { iso3: 'SGP', wbKey: 'Singapore',    name: 'Singapore',      color: '#14b8a6' },
  { iso3: 'AUS', wbKey: 'Australia',    name: 'Australia',      color: '#e11d48' },
  { iso3: 'CHE', wbKey: 'Switzerland',  name: 'Switzerland',    color: '#7c3aed' },
  { iso3: 'TWN', wbKey: 'Taiwan',       name: 'Taiwan',         color: '#0ea5e9' },
  { iso3: 'NLD', wbKey: 'Netherlands',  name: 'Netherlands',    color: '#f97316' },
];

// ────────────────────────────────────────────────────────────────────────
// Stanford AI Index 2024/25 — Notable ML models by country of origin.
// The AI Index counts a "notable" model per Epoch AI's registry: any
// model with ≥100M parameters or comparable training compute, plus
// selected influential smaller models. 2024 print, extended with 2025
// Epoch releases.
// ────────────────────────────────────────────────────────────────────────
export interface NotableModelsByCountry {
  iso3: string;
  name: string;
  models2019: number;
  models2020: number;
  models2021: number;
  models2022: number;
  models2023: number;
  models2024: number;
}

export const NOTABLE_MODELS_2019_2024: NotableModelsByCountry[] = [
  { iso3: 'USA', name: 'United States',  models2019: 15, models2020: 20, models2021: 22, models2022: 30, models2023: 61, models2024: 40 },
  { iso3: 'CHN', name: 'China',          models2019: 6,  models2020: 12, models2021: 9,  models2022: 9,  models2023: 15, models2024: 15 },
  { iso3: 'GBR', name: 'United Kingdom', models2019: 3,  models2020: 4,  models2021: 5,  models2022: 4,  models2023: 4,  models2024: 3  },
  { iso3: 'ISR', name: 'Israel',         models2019: 0,  models2020: 1,  models2021: 1,  models2022: 3,  models2023: 3,  models2024: 3  },
  { iso3: 'CAN', name: 'Canada',         models2019: 2,  models2020: 2,  models2021: 2,  models2022: 2,  models2023: 2,  models2024: 2  },
  { iso3: 'DEU', name: 'Germany',        models2019: 1,  models2020: 1,  models2021: 1,  models2022: 2,  models2023: 3,  models2024: 3  },
  { iso3: 'FRA', name: 'France',         models2019: 1,  models2020: 1,  models2021: 2,  models2022: 3,  models2023: 8,  models2024: 8  },
  { iso3: 'JPN', name: 'Japan',          models2019: 1,  models2020: 1,  models2021: 2,  models2022: 2,  models2023: 2,  models2024: 3  },
  { iso3: 'KOR', name: 'South Korea',    models2019: 0,  models2020: 1,  models2021: 3,  models2022: 3,  models2023: 3,  models2024: 4  },
];

// ────────────────────────────────────────────────────────────────────────
// Notable frontier LLM releases 2018-2025 with parameter counts / training
// compute estimates. Epoch AI + lab announcements.
// ────────────────────────────────────────────────────────────────────────
export interface ModelRelease {
  date: string;         // YYYY-MM-DD
  name: string;
  lab: string;
  country: string;
  params: string;       // human-readable (e.g. "175B", "MoE 8x22B", "closed")
  trainingFlops: number | null;  // 1e23 FLOP unit; null for closed / unknown
  modality: 'text' | 'multimodal' | 'reasoning';
  href?: string;
}

export const MODEL_RELEASES_2018_2025: ModelRelease[] = [
  { date: '2018-06-11', name: 'GPT-1',          lab: 'OpenAI',     country: 'USA', params: '117M',       trainingFlops: 0.00002, modality: 'text' },
  { date: '2018-10-11', name: 'BERT-Large',     lab: 'Google',     country: 'USA', params: '340M',       trainingFlops: 0.00003, modality: 'text' },
  { date: '2019-02-14', name: 'GPT-2',          lab: 'OpenAI',     country: 'USA', params: '1.5B',       trainingFlops: 0.0009,  modality: 'text' },
  { date: '2020-05-28', name: 'GPT-3',          lab: 'OpenAI',     country: 'USA', params: '175B',       trainingFlops: 3.14,    modality: 'text' },
  { date: '2021-12-08', name: 'Gopher',         lab: 'DeepMind',   country: 'UK',  params: '280B',       trainingFlops: 6.31,    modality: 'text' },
  { date: '2022-03-29', name: 'Chinchilla',     lab: 'DeepMind',   country: 'UK',  params: '70B',        trainingFlops: 5.75,    modality: 'text' },
  { date: '2022-04-05', name: 'PaLM',           lab: 'Google',     country: 'USA', params: '540B',       trainingFlops: 25.0,    modality: 'text' },
  { date: '2022-11-30', name: 'ChatGPT (GPT-3.5)', lab: 'OpenAI',  country: 'USA', params: '~175B',      trainingFlops: 3.14,    modality: 'text' },
  { date: '2023-02-24', name: 'LLaMA',          lab: 'Meta',       country: 'USA', params: '65B',        trainingFlops: 2.5,     modality: 'text' },
  { date: '2023-03-14', name: 'GPT-4',          lab: 'OpenAI',     country: 'USA', params: 'MoE ~1.8T',  trainingFlops: 210,     modality: 'multimodal' },
  { date: '2023-03-14', name: 'Claude 1',       lab: 'Anthropic',  country: 'USA', params: 'closed',     trainingFlops: null,    modality: 'text' },
  { date: '2023-07-11', name: 'Claude 2',       lab: 'Anthropic',  country: 'USA', params: 'closed',     trainingFlops: null,    modality: 'text' },
  { date: '2023-07-18', name: 'Llama 2',        lab: 'Meta',       country: 'USA', params: '70B',        trainingFlops: 8.4,     modality: 'text' },
  { date: '2023-12-06', name: 'Gemini 1.0',     lab: 'Google DeepMind', country: 'USA', params: 'MoE closed', trainingFlops: 200, modality: 'multimodal' },
  { date: '2024-02-15', name: 'Gemini 1.5 Pro', lab: 'Google DeepMind', country: 'USA', params: 'MoE closed', trainingFlops: 250, modality: 'multimodal' },
  { date: '2024-04-18', name: 'Llama 3',        lab: 'Meta',       country: 'USA', params: '70B',        trainingFlops: 15.0,    modality: 'text' },
  { date: '2024-05-13', name: 'GPT-4o',         lab: 'OpenAI',     country: 'USA', params: 'closed',     trainingFlops: null,    modality: 'multimodal' },
  { date: '2024-06-20', name: 'Claude 3.5 Sonnet', lab: 'Anthropic', country: 'USA', params: 'closed',   trainingFlops: null,    modality: 'multimodal' },
  { date: '2024-07-23', name: 'Llama 3.1 405B', lab: 'Meta',       country: 'USA', params: '405B',       trainingFlops: 38.0,    modality: 'text' },
  { date: '2024-09-12', name: 'o1',             lab: 'OpenAI',     country: 'USA', params: 'closed',     trainingFlops: null,    modality: 'reasoning' },
  { date: '2024-11-12', name: 'Qwen2.5-72B',    lab: 'Alibaba',    country: 'China', params: '72B',      trainingFlops: 12.0,    modality: 'text' },
  { date: '2024-12-26', name: 'DeepSeek-V3',    lab: 'DeepSeek',   country: 'China', params: 'MoE 671B', trainingFlops: 27.9,    modality: 'text' },
  { date: '2025-01-20', name: 'DeepSeek-R1',    lab: 'DeepSeek',   country: 'China', params: 'MoE 671B', trainingFlops: 28.0,    modality: 'reasoning' },
  { date: '2025-02-24', name: 'Claude 3.7 Sonnet', lab: 'Anthropic', country: 'USA', params: 'closed',   trainingFlops: null,    modality: 'reasoning' },
  { date: '2025-04-14', name: 'GPT-4.1',        lab: 'OpenAI',     country: 'USA', params: 'closed',     trainingFlops: null,    modality: 'multimodal' },
  { date: '2025-05-14', name: 'Claude 4',       lab: 'Anthropic',  country: 'USA', params: 'closed',     trainingFlops: null,    modality: 'reasoning' },
  { date: '2025-06-05', name: 'Gemini 2.5 Pro', lab: 'Google DeepMind', country: 'USA', params: 'closed', trainingFlops: null,   modality: 'reasoning' },
  { date: '2025-07-15', name: 'Kimi K2',        lab: 'Moonshot AI', country: 'China', params: 'MoE 1T',  trainingFlops: 45.0,    modality: 'reasoning' },
  { date: '2025-08-05', name: 'GPT-5',          lab: 'OpenAI',     country: 'USA', params: 'closed',     trainingFlops: null,    modality: 'reasoning' },
  { date: '2025-09-29', name: 'Claude 4.5 Sonnet', lab: 'Anthropic', country: 'USA', params: 'closed',   trainingFlops: null,    modality: 'reasoning' },
];

// ────────────────────────────────────────────────────────────────────────
// Foundry / fab capacity by manufacturer, Q2-2025. Percentages of global
// leading-edge (7nm and below) wafer capacity. SEMI + TrendForce.
// ────────────────────────────────────────────────────────────────────────
export interface FabCapacity {
  manufacturer: string;
  country: string;
  leadingEdgePct: number;   // % of global sub-7nm wafer capacity
  capex2024Bn: number;
  process: string;
}

export const FAB_CAPACITY_2025Q2: FabCapacity[] = [
  { manufacturer: 'TSMC',       country: 'Taiwan',       leadingEdgePct: 68, capex2024Bn: 30,   process: '2nm/3nm/5nm/7nm' },
  { manufacturer: 'Samsung',    country: 'South Korea',  leadingEdgePct: 17, capex2024Bn: 34,   process: '2nm/3nm/5nm/7nm' },
  { manufacturer: 'Intel',      country: 'United States', leadingEdgePct: 8,  capex2024Bn: 25,   process: '18A/Intel 3/Intel 4' },
  { manufacturer: 'SMIC',       country: 'China',        leadingEdgePct: 6,  capex2024Bn: 7,    process: '7nm (via DUV multi-patterning)' },
  { manufacturer: 'GlobalFoundries', country: 'United States', leadingEdgePct: 1, capex2024Bn: 2, process: '12nm (mature)' },
];

// ────────────────────────────────────────────────────────────────────────
// AI private-market investment by country and year (USD bn).
// Source: Stanford AI Index 2024/25 (Chapter 4) + CB Insights 1H-2025.
// ────────────────────────────────────────────────────────────────────────
export interface AiInvestmentPoint {
  year: number;
  usa: number;
  china: number;
  uk: number;
  israel: number;
  eu: number;   // EU-27 aggregate
  restOfWorld: number;
}

export const AI_INVESTMENT_2018_2024: AiInvestmentPoint[] = [
  { year: 2018, usa: 25.4, china: 15.5, uk: 1.7,  israel: 1.5, eu: 3.0,  restOfWorld: 2.0 },
  { year: 2019, usa: 24.7, china: 5.8,  uk: 1.6,  israel: 2.1, eu: 4.1,  restOfWorld: 2.5 },
  { year: 2020, usa: 45.1, china: 9.8,  uk: 3.2,  israel: 3.3, eu: 6.0,  restOfWorld: 3.3 },
  { year: 2021, usa: 84.0, china: 24.8, uk: 5.7,  israel: 8.1, eu: 10.1, restOfWorld: 5.5 },
  { year: 2022, usa: 47.3, china: 13.4, uk: 4.4,  israel: 3.9, eu: 6.5,  restOfWorld: 3.9 },
  { year: 2023, usa: 67.2, china: 7.8,  uk: 3.8,  israel: 1.5, eu: 6.5,  restOfWorld: 3.4 },
  { year: 2024, usa: 109.1, china: 9.3, uk: 4.5,  israel: 1.9, eu: 8.9,  restOfWorld: 5.2 },
];

// ────────────────────────────────────────────────────────────────────────
// Data-centre electricity consumption estimates (TWh/yr).
// Source: IEA Electricity 2025 report.
// ────────────────────────────────────────────────────────────────────────
export interface DataCentreEnergyPoint {
  year: number;
  usa: number;      // TWh
  china: number;
  eu: number;
  world: number;
}

export const DATA_CENTRE_ENERGY_2015_2030: DataCentreEnergyPoint[] = [
  { year: 2015, usa: 92,  china: 60,  eu: 65,  world: 240 },
  { year: 2018, usa: 106, china: 84,  eu: 80,  world: 300 },
  { year: 2020, usa: 130, china: 100, eu: 90,  world: 340 },
  { year: 2022, usa: 170, china: 152, eu: 110, world: 460 },
  { year: 2024, usa: 210, china: 218, eu: 130, world: 545 },
  { year: 2026, usa: 320, china: 335, eu: 165, world: 830 },   // IEA base case
  { year: 2030, usa: 570, china: 615, eu: 235, world: 1450 },  // IEA base case
];

// ────────────────────────────────────────────────────────────────────────
// AI regulation & policy timeline. Landmark laws, executive orders,
// safety institutes and international frameworks 2023-2025.
// ────────────────────────────────────────────────────────────────────────
export interface AiRegulationEvent {
  date: string;
  region: string;
  title: string;
  category: 'law' | 'executive' | 'institute' | 'framework' | 'court';
  impact: 'systemic' | 'sector' | 'signal';
  summary: string;
}

export const AI_REGULATION_TIMELINE: AiRegulationEvent[] = [
  { date: '2023-05-11', region: 'European Union', title: 'EU Parliament adopts AI Act mandate',   category: 'law',       impact: 'systemic', summary: 'Parliament green-lights risk-tiered AI regulation, opening trilogue with Commission and Council.' },
  { date: '2023-10-30', region: 'United States',  title: 'Biden Executive Order 14110',           category: 'executive', impact: 'systemic', summary: 'Comprehensive AI EO. Mandates safety-testing reporting for dual-use foundation models above 1e26 FLOP.' },
  { date: '2023-11-01', region: 'United Kingdom', title: 'Bletchley Declaration',                 category: 'framework', impact: 'signal',   summary: '28 countries + EU commit to shared AI safety research at first Global AI Safety Summit.' },
  { date: '2023-11-02', region: 'United Kingdom', title: 'UK AI Safety Institute founded',        category: 'institute', impact: 'systemic', summary: 'World\u2019s first state AI-safety institute, sets template for peer institutes.' },
  { date: '2023-11-06', region: 'United States',  title: 'US AI Safety Institute (NIST) founded', category: 'institute', impact: 'systemic', summary: 'Housed inside NIST with a Congressional appropriation to red-team foundation models.' },
  { date: '2024-03-13', region: 'European Union', title: 'AI Act adopted by European Parliament', category: 'law',       impact: 'systemic', summary: 'First horizontal AI law. Systemic-risk GPAI obligations, prohibited practices, and CE-mark-style conformity assessments.' },
  { date: '2024-05-02', region: 'South Korea',    title: 'Seoul Ministerial Declaration',         category: 'framework', impact: 'signal',   summary: 'Second Global AI Safety Summit; 27 countries commit to safety and inclusion frameworks.' },
  { date: '2024-08-01', region: 'European Union', title: 'AI Act enters into force',              category: 'law',       impact: 'systemic', summary: 'Prohibitions apply Feb-2025; GPAI obligations Aug-2025; high-risk regime staged through 2027.' },
  { date: '2024-08-01', region: 'China',          title: 'Interim Measures for Generative AI take effect nationwide', category: 'law', impact: 'systemic', summary: 'Content-labelling, model-filing, security-review obligations for all generative AI serving the Chinese public.' },
  { date: '2024-09-19', region: 'California',     title: 'Governor Newsom vetoes SB 1047',        category: 'law',       impact: 'signal',   summary: 'California Safe & Secure Innovation for Frontier AI Models Act vetoed after intense lobbying from industry.' },
  { date: '2024-10-24', region: 'United States',  title: 'National Security Memorandum on AI (NSM-25)', category: 'executive', impact: 'systemic', summary: 'Institutionalises frontier-AI safety inside the intelligence community and Defense Department.' },
  { date: '2025-01-23', region: 'United States',  title: 'Trump EO 14179 rescinds Biden AI EO',    category: 'executive', impact: 'systemic', summary: 'Replaces the risk-mitigation framework with an "AI leadership" mandate; strips key reporting requirements.' },
  { date: '2025-02-10', region: 'France',         title: 'Paris AI Action Summit',                 category: 'framework', impact: 'signal',   summary: 'Third Global AI Summit pivots from "safety" to "action"; US and UK withhold signatures on the closing declaration.' },
  { date: '2025-04-15', region: 'European Union', title: 'GPAI Code of Practice published',        category: 'framework', impact: 'systemic', summary: 'Voluntary GPAI code for AI Act compliance with copyright, safety, and systemic-risk chapters.' },
  { date: '2025-08-02', region: 'European Union', title: 'AI Act GPAI obligations apply',          category: 'law',       impact: 'systemic', summary: 'Foundation-model providers must publish training data summary, respect copyright, and mitigate systemic risks.' },
  { date: '2025-09-05', region: 'California',     title: 'AB 3211 signed (content provenance)',    category: 'law',       impact: 'sector',   summary: 'Requires generative AI systems to embed C2PA-style provenance metadata in generated content.' },
];

// ────────────────────────────────────────────────────────────────────────
// AI talent flows. Net "top-tier AI researcher" flows by country
// 2019-2024. Source: MacroPolo Global AI Talent Tracker + Stanford AI
// Index Chapter 4. Positive = net inflow.
// ────────────────────────────────────────────────────────────────────────
export interface AiTalentRow {
  iso3: string;
  name: string;
  netFlow2019to2024: number;    // researchers, net
  originShare: number;           // % of world's top-tier researchers by undergraduate origin
  hostShare: number;             // % of top-tier researchers currently working there
}

export const AI_TALENT_FLOWS: AiTalentRow[] = [
  { iso3: 'USA', name: 'United States',  netFlow2019to2024: +780, originShare: 18, hostShare: 60 },
  { iso3: 'CHN', name: 'China',          netFlow2019to2024: -420, originShare: 47, hostShare: 12 },
  { iso3: 'IND', name: 'India',          netFlow2019to2024: -180, originShare: 12, hostShare: 5  },
  { iso3: 'GBR', name: 'United Kingdom', netFlow2019to2024: +80,  originShare: 3,  hostShare: 6  },
  { iso3: 'CAN', name: 'Canada',         netFlow2019to2024: +55,  originShare: 2,  hostShare: 3  },
  { iso3: 'DEU', name: 'Germany',        netFlow2019to2024: +40,  originShare: 2,  hostShare: 2  },
  { iso3: 'FRA', name: 'France',         netFlow2019to2024: +25,  originShare: 2,  hostShare: 2  },
  { iso3: 'ISR', name: 'Israel',         netFlow2019to2024: +15,  originShare: 1,  hostShare: 2  },
  { iso3: 'CHE', name: 'Switzerland',    netFlow2019to2024: +30,  originShare: 1,  hostShare: 2  },
  { iso3: 'AUS', name: 'Australia',      netFlow2019to2024: +20,  originShare: 1,  hostShare: 1  },
];

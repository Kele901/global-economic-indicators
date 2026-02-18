// Technology & Innovation Indicators Data
// Contains metadata, descriptions, and color schemes for technology metrics

export interface TechIndicatorInfo {
  id: string;
  name: string;
  shortName: string;
  description: string;
  unit: string;
  source: string;
  interpretation: string;
  color: string;
  colorDark: string;
}

// Technology indicator metadata
export const technologyIndicators: { [key: string]: TechIndicatorInfo } = {
  patentApplicationsResident: {
    id: 'patentApplicationsResident',
    name: 'Patent Applications (Residents)',
    shortName: 'Patents (Res)',
    description: 'Patent applications filed by residents of a country. Patents protect inventions and indicate the level of domestic innovation activity.',
    unit: 'Number of applications',
    source: 'World Bank (WIPO)',
    interpretation: 'Higher numbers indicate stronger domestic innovation ecosystems and R&D investment.',
    color: '#3B82F6', // blue-500
    colorDark: '#60A5FA' // blue-400
  },
  patentApplicationsNonResident: {
    id: 'patentApplicationsNonResident',
    name: 'Patent Applications (Non-Residents)',
    shortName: 'Patents (Non-Res)',
    description: 'Patent applications filed by non-residents. Indicates foreign interest in protecting IP within a country\'s market.',
    unit: 'Number of applications',
    source: 'World Bank (WIPO)',
    interpretation: 'Higher numbers suggest an attractive market for foreign innovation and technology transfer.',
    color: '#8B5CF6', // violet-500
    colorDark: '#A78BFA' // violet-400
  },
  trademarkApplications: {
    id: 'trademarkApplications',
    name: 'Trademark Applications',
    shortName: 'Trademarks',
    description: 'Trademark applications filed by residents. Trademarks protect brand names, logos, and distinctive signs.',
    unit: 'Number of applications',
    source: 'World Bank (WIPO)',
    interpretation: 'Indicates commercial activity, brand development, and entrepreneurial dynamism.',
    color: '#EC4899', // pink-500
    colorDark: '#F472B6' // pink-400
  },
  rdSpending: {
    id: 'rdSpending',
    name: 'R&D Expenditure',
    shortName: 'R&D (% GDP)',
    description: 'Research and development expenditure as a percentage of GDP. Includes government, business, and higher education R&D spending.',
    unit: '% of GDP',
    source: 'World Bank (UNESCO)',
    interpretation: 'Higher spending correlates with greater innovation capacity and long-term economic competitiveness.',
    color: '#10B981', // emerald-500
    colorDark: '#34D399' // emerald-400
  },
  researchersRD: {
    id: 'researchersRD',
    name: 'Researchers in R&D',
    shortName: 'Researchers',
    description: 'Full-time equivalent researchers engaged in R&D per million people. Includes professionals conducting research and improving knowledge.',
    unit: 'Per million people',
    source: 'World Bank (UNESCO)',
    interpretation: 'Higher density indicates stronger human capital for innovation and scientific advancement.',
    color: '#F59E0B', // amber-500
    colorDark: '#FBBF24' // amber-400
  },
  techniciansRD: {
    id: 'techniciansRD',
    name: 'Technicians in R&D',
    shortName: 'Technicians',
    description: 'Full-time equivalent technicians engaged in R&D per million people. Technicians support researchers with technical tasks.',
    unit: 'Per million people',
    source: 'World Bank (UNESCO)',
    interpretation: 'Indicates the technical support infrastructure for R&D activities.',
    color: '#6366F1', // indigo-500
    colorDark: '#818CF8' // indigo-400
  },
  hightechExports: {
    id: 'hightechExports',
    name: 'High-Technology Exports',
    shortName: 'High-Tech Exports',
    description: 'High-technology exports as a percentage of manufactured exports. Includes aerospace, computers, pharmaceuticals, and scientific instruments.',
    unit: '% of manufactured exports',
    source: 'World Bank (UN Comtrade)',
    interpretation: 'Higher percentages indicate advanced manufacturing capabilities and technological sophistication.',
    color: '#EF4444', // red-500
    colorDark: '#F87171' // red-400
  },
  ictExports: {
    id: 'ictExports',
    name: 'ICT Goods Exports',
    shortName: 'ICT Exports',
    description: 'Information and communication technology goods exports as a percentage of total goods exports.',
    unit: '% of total goods exports',
    source: 'World Bank (UNCTAD)',
    interpretation: 'Indicates the importance of the digital economy and electronics manufacturing.',
    color: '#14B8A6', // teal-500
    colorDark: '#2DD4BF' // teal-400
  },
  scientificPublications: {
    id: 'scientificPublications',
    name: 'Scientific Publications',
    shortName: 'Publications',
    description: 'Scientific and technical journal articles published. Covers physics, biology, chemistry, mathematics, clinical medicine, and engineering.',
    unit: 'Number of articles',
    source: 'World Bank (NSF)',
    interpretation: 'Higher numbers indicate stronger research output and academic contribution to global knowledge.',
    color: '#06B6D4', // cyan-500
    colorDark: '#22D3EE' // cyan-400
  },
  ipReceipts: {
    id: 'ipReceipts',
    name: 'IP Receipts',
    shortName: 'IP Income',
    description: 'Charges for the use of intellectual property, receipts. Includes royalties and license fees received from abroad.',
    unit: 'Current US$',
    source: 'World Bank (IMF)',
    interpretation: 'Higher receipts indicate valuable IP assets and successful technology licensing.',
    color: '#84CC16', // lime-500
    colorDark: '#A3E635' // lime-400
  },
  ipPayments: {
    id: 'ipPayments',
    name: 'IP Payments',
    shortName: 'IP Costs',
    description: 'Charges for the use of intellectual property, payments. Includes royalties and license fees paid to foreign entities.',
    unit: 'Current US$',
    source: 'World Bank (IMF)',
    interpretation: 'Higher payments may indicate technology dependence or active licensing of foreign innovations.',
    color: '#F97316', // orange-500
    colorDark: '#FB923C' // orange-400
  },
  internetUsers: {
    id: 'internetUsers',
    name: 'Internet Users',
    shortName: 'Internet %',
    description: 'Individuals using the Internet as a percentage of the population.',
    unit: '% of population',
    source: 'World Bank (ITU)',
    interpretation: 'Higher percentages indicate better digital infrastructure and connectivity.',
    color: '#0EA5E9', // sky-500
    colorDark: '#38BDF8' // sky-400
  },
  mobileSubscriptions: {
    id: 'mobileSubscriptions',
    name: 'Mobile Subscriptions',
    shortName: 'Mobile',
    description: 'Mobile cellular subscriptions per 100 people. Includes both prepaid and postpaid subscriptions.',
    unit: 'Per 100 people',
    source: 'World Bank (ITU)',
    interpretation: 'Higher numbers indicate mobile technology adoption and telecommunications development.',
    color: '#A855F7', // purple-500
    colorDark: '#C084FC' // purple-400
  },

  // Digital Infrastructure Indicators
  broadbandSubscriptions: {
    id: 'broadbandSubscriptions',
    name: 'Fixed Broadband Subscriptions',
    shortName: 'Broadband',
    description: 'Fixed broadband subscriptions per 100 people. Includes DSL, cable, fiber, and other fixed connections.',
    unit: 'Per 100 people',
    source: 'World Bank (ITU)',
    interpretation: 'Higher numbers indicate better fixed internet infrastructure and digital connectivity.',
    color: '#0EA5E9', // sky-500
    colorDark: '#38BDF8' // sky-400
  },
  secureServers: {
    id: 'secureServers',
    name: 'Secure Internet Servers',
    shortName: 'Secure Servers',
    description: 'Secure Internet servers per million people. Servers using encryption technology for secure transactions.',
    unit: 'Per million people',
    source: 'World Bank (Netcraft)',
    interpretation: 'Higher numbers indicate stronger digital infrastructure for e-commerce and secure communications.',
    color: '#22C55E', // green-500
    colorDark: '#4ADE80' // green-400
  },
  ictGoodsImports: {
    id: 'ictGoodsImports',
    name: 'ICT Goods Imports',
    shortName: 'ICT Imports',
    description: 'Information and communication technology goods imports as a percentage of total goods imports.',
    unit: '% of total goods imports',
    source: 'World Bank (UNCTAD)',
    interpretation: 'Indicates technology adoption and demand for digital equipment.',
    color: '#F472B6', // pink-400
    colorDark: '#F9A8D4' // pink-300
  },

  // Startup & VC Indicators
  vcFunding: {
    id: 'vcFunding',
    name: 'Venture Capital Funding',
    shortName: 'VC Funding',
    description: 'Total venture capital investment received by startups in a country.',
    unit: 'Billion USD',
    source: 'Crunchbase/Dealroom',
    interpretation: 'Higher funding indicates a vibrant startup ecosystem and investor confidence.',
    color: '#8B5CF6', // violet-500
    colorDark: '#A78BFA' // violet-400
  },
  unicornCount: {
    id: 'unicornCount',
    name: 'Unicorn Companies',
    shortName: 'Unicorns',
    description: 'Number of privately held startup companies valued at over $1 billion.',
    unit: 'Number of companies',
    source: 'CB Insights/Dealroom',
    interpretation: 'Higher counts indicate successful high-growth startup ecosystems.',
    color: '#EC4899', // pink-500
    colorDark: '#F472B6' // pink-400
  },
  startupDensity: {
    id: 'startupDensity',
    name: 'Startup Density',
    shortName: 'Startups/100K',
    description: 'Number of startups per 100,000 people in the population.',
    unit: 'Per 100,000 people',
    source: 'Startup Genome',
    interpretation: 'Higher density indicates entrepreneurial culture and startup ecosystem maturity.',
    color: '#F59E0B', // amber-500
    colorDark: '#FBBF24' // amber-400
  },

  // AI & Emerging Tech Indicators
  aiPatents: {
    id: 'aiPatents',
    name: 'AI Patent Applications',
    shortName: 'AI Patents',
    description: 'Patent applications related to artificial intelligence and machine learning technologies.',
    unit: 'Number of applications',
    source: 'WIPO',
    interpretation: 'Higher numbers indicate leadership in AI research and development.',
    color: '#6366F1', // indigo-500
    colorDark: '#818CF8' // indigo-400
  },
  semiconductorTrade: {
    id: 'semiconductorTrade',
    name: 'Semiconductor Trade Balance',
    shortName: 'Chip Trade',
    description: 'Net exports of semiconductor and integrated circuit products.',
    unit: 'Billion USD',
    source: 'UN Comtrade',
    interpretation: 'Positive values indicate semiconductor manufacturing strength.',
    color: '#14B8A6', // teal-500
    colorDark: '#2DD4BF' // teal-400
  },

  // Digital Economy Indicators
  ecommerceAdoption: {
    id: 'ecommerceAdoption',
    name: 'E-commerce Adoption',
    shortName: 'E-commerce %',
    description: 'E-commerce sales as a percentage of total retail sales.',
    unit: '% of retail sales',
    source: 'eMarketer/Statista',
    interpretation: 'Higher percentages indicate digital transformation of retail sector.',
    color: '#EF4444', // red-500
    colorDark: '#F87171' // red-400
  },
  digitalPayments: {
    id: 'digitalPayments',
    name: 'Digital Payment Adoption',
    shortName: 'Digital Pay %',
    description: 'Percentage of population using digital payment methods.',
    unit: '% of population',
    source: 'World Bank (Findex)',
    interpretation: 'Higher percentages indicate financial digitization and fintech adoption.',
    color: '#84CC16', // lime-500
    colorDark: '#A3E635' // lime-400
  },
  ictServiceExports: {
    id: 'ictServiceExports',
    name: 'ICT Service Exports',
    shortName: 'ICT Services',
    description: 'Information and communication technology service exports as a percentage of total service exports.',
    unit: '% of service exports',
    source: 'World Bank (UNCTAD)',
    interpretation: 'Higher percentages indicate strength in software and digital services.',
    color: '#06B6D4', // cyan-500
    colorDark: '#22D3EE' // cyan-400
  },

  // Tech Workforce Indicators
  stemGraduates: {
    id: 'stemGraduates',
    name: 'STEM Graduates',
    shortName: 'STEM %',
    description: 'New tertiary graduates in science, technology, engineering, and mathematics as a share of all graduates.',
    unit: '% of graduates',
    source: 'OECD/UNESCO',
    interpretation: 'Higher percentages indicate strong pipeline of technical talent.',
    color: '#D946EF', // fuchsia-500
    colorDark: '#E879F9' // fuchsia-400
  },
  techEmployment: {
    id: 'techEmployment',
    name: 'Tech Sector Employment',
    shortName: 'Tech Jobs %',
    description: 'Employment in technology and information sectors as a percentage of total employment.',
    unit: '% of employment',
    source: 'OECD/ILO',
    interpretation: 'Higher percentages indicate larger tech industry presence in the economy.',
    color: '#0891B2', // cyan-600
    colorDark: '#06B6D4' // cyan-500
  }
};

// Extended country groupings for new tech categories
export const extendedTechCountryGroups = {
  vcLeaders: {
    name: 'VC Leaders',
    description: 'Countries with highest venture capital activity',
    countries: ['USA', 'China', 'UK', 'India', 'Israel'],
    color: '#8B5CF6'
  },
  digitalLeaders: {
    name: 'Digital Leaders',
    description: 'Countries with highest digital adoption',
    countries: ['Sweden', 'Netherlands', 'Singapore', 'SouthKorea', 'UK'],
    color: '#0EA5E9'
  },
  aiLeaders: {
    name: 'AI Leaders',
    description: 'Countries leading in AI patent filings',
    countries: ['USA', 'China', 'Japan', 'SouthKorea', 'Germany'],
    color: '#6366F1'
  },
  startupHubs: {
    name: 'Startup Hubs',
    description: 'Countries with highest startup density',
    countries: ['Israel', 'Singapore', 'USA', 'Sweden', 'UK'],
    color: '#F59E0B'
  }
};

// Country groupings for technology analysis
export const techCountryGroups = {
  leaders: {
    name: 'Tech Leaders',
    description: 'Countries with highest R&D spending and patent activity',
    countries: ['USA', 'Japan', 'SouthKorea', 'Germany', 'China'],
    color: '#3B82F6'
  },
  emerging: {
    name: 'Emerging Tech',
    description: 'Rapidly growing technology sectors',
    countries: ['India', 'Brazil', 'Mexico', 'Indonesia', 'Turkey'],
    color: '#10B981'
  },
  european: {
    name: 'European Innovation',
    description: 'European technology hubs',
    countries: ['Germany', 'France', 'UK', 'Netherlands', 'Sweden', 'Switzerland'],
    color: '#8B5CF6'
  },
  asian: {
    name: 'Asian Tech',
    description: 'Asian technology powerhouses',
    countries: ['Japan', 'SouthKorea', 'China', 'India', 'Indonesia'],
    color: '#F59E0B'
  }
};

// Chart color palette for multi-country visualization
export const techChartColors: { [country: string]: string } = {
  USA: '#3B82F6',      // blue
  China: '#EF4444',    // red
  Japan: '#F59E0B',    // amber
  Germany: '#10B981',  // emerald
  SouthKorea: '#8B5CF6', // violet
  UK: '#EC4899',       // pink
  France: '#06B6D4',   // cyan
  India: '#F97316',    // orange
  Canada: '#84CC16',   // lime
  Australia: '#14B8A6', // teal
  Brazil: '#A855F7',   // purple
  Mexico: '#0EA5E9',   // sky
  Italy: '#6366F1',    // indigo
  Spain: '#D946EF',    // fuchsia
  Netherlands: '#22C55E', // green
  Sweden: '#FBBF24',   // yellow
  Switzerland: '#FB7185', // rose
  Russia: '#64748B',   // slate
  Turkey: '#C026D3',   // fuchsia-600
  Poland: '#2563EB',   // blue-600
  Indonesia: '#059669', // emerald-600
  SouthAfrica: '#7C3AED', // violet-600
  Nigeria: '#16A34A',  // green-600
  Egypt: '#CA8A04',    // yellow-600
  SaudiArabia: '#0891B2', // cyan-600
  Argentina: '#9333EA', // purple-600
  Chile: '#E11D48',    // rose-600
  Norway: '#0D9488',   // teal-600
  Belgium: '#4F46E5',  // indigo-600
  Portugal: '#DB2777', // pink-600
  Israel: '#0D9488',   // teal-600
  Singapore: '#7C3AED' // violet-600
};

// Default countries to display in charts
export const defaultTechCountries = [
  'USA', 'China', 'Japan', 'Germany', 'SouthKorea', 
  'UK', 'France', 'India', 'Canada', 'Australia'
];

// Innovation ranking weights for composite score
export const innovationWeights = {
  patentApplicationsResident: 0.20,
  rdSpending: 0.25,
  researchersRD: 0.15,
  hightechExports: 0.15,
  scientificPublications: 0.10,
  internetUsers: 0.10,
  ipReceipts: 0.05
};

// Extended weights for new metrics
export const digitalEconomyWeights = {
  ecommerceAdoption: 0.25,
  digitalPayments: 0.25,
  broadbandSubscriptions: 0.20,
  ictServiceExports: 0.15,
  secureServers: 0.15
};

export const startupEcosystemWeights = {
  vcFunding: 0.35,
  unicornCount: 0.30,
  startupDensity: 0.35
};

export const aiLeadershipWeights = {
  aiPatents: 0.50,
  rdSpending: 0.30,
  stemGraduates: 0.20
};

// Format large numbers for display
export function formatNumber(value: number, decimals: number = 0): string {
  if (value >= 1e9) {
    return (value / 1e9).toFixed(1) + 'B';
  }
  if (value >= 1e6) {
    return (value / 1e6).toFixed(1) + 'M';
  }
  if (value >= 1e3) {
    return (value / 1e3).toFixed(1) + 'K';
  }
  return value.toFixed(decimals);
}

// Format percentage values
export function formatPercent(value: number, decimals: number = 1): string {
  return value.toFixed(decimals) + '%';
}

// Get trend indicator
export function getTrendIndicator(current: number, previous: number): { icon: string; color: string; change: number } {
  const change = ((current - previous) / previous) * 100;
  if (change > 5) {
    return { icon: '↗', color: 'text-green-500', change };
  }
  if (change < -5) {
    return { icon: '↘', color: 'text-red-500', change };
  }
  return { icon: '→', color: 'text-gray-500', change };
}

// Format currency values
export function formatCurrency(value: number, decimals: number = 1): string {
  if (value >= 1e9) {
    return '$' + (value / 1e9).toFixed(decimals) + 'B';
  }
  if (value >= 1e6) {
    return '$' + (value / 1e6).toFixed(decimals) + 'M';
  }
  if (value >= 1e3) {
    return '$' + (value / 1e3).toFixed(decimals) + 'K';
  }
  return '$' + value.toFixed(decimals);
}

// Format billions for VC funding display
export function formatBillions(value: number): string {
  return '$' + value.toFixed(1) + 'B';
}

// Heatmap color schemes for multi-metric visualization
export const heatmapColorSchemes = {
  performance: {
    name: 'Performance',
    colors: {
      veryHigh: { light: '#059669', dark: '#10B981' },  // green
      high: { light: '#22C55E', dark: '#4ADE80' },
      medium: { light: '#EAB308', dark: '#FACC15' },    // yellow
      low: { light: '#F97316', dark: '#FB923C' },       // orange
      veryLow: { light: '#DC2626', dark: '#EF4444' }    // red
    }
  },
  diverging: {
    name: 'Diverging',
    colors: {
      positive: { light: '#059669', dark: '#10B981' },
      neutral: { light: '#6B7280', dark: '#9CA3AF' },
      negative: { light: '#DC2626', dark: '#EF4444' }
    }
  },
  sequential: {
    name: 'Sequential',
    colors: [
      { light: '#EFF6FF', dark: '#1E3A5F' },  // blue-50 / custom dark
      { light: '#BFDBFE', dark: '#1E40AF' },  // blue-200 / blue-800
      { light: '#60A5FA', dark: '#2563EB' },  // blue-400 / blue-600
      { light: '#2563EB', dark: '#3B82F6' },  // blue-600 / blue-500
      { light: '#1E40AF', dark: '#60A5FA' }   // blue-800 / blue-400
    ]
  }
};

// Sankey diagram node colors
export const sankeyNodeColors = {
  inputs: {
    rdSpending: { light: '#2563EB', dark: '#3B82F6' },
    stemGraduates: { light: '#1D4ED8', dark: '#60A5FA' },
    vcFunding: { light: '#3730A3', dark: '#818CF8' }
  },
  process: {
    patents: { light: '#7C3AED', dark: '#8B5CF6' },
    publications: { light: '#6D28D9', dark: '#A78BFA' },
    researchers: { light: '#5B21B6', dark: '#C4B5FD' }
  },
  outputs: {
    hightechExports: { light: '#059669', dark: '#10B981' },
    techEmployment: { light: '#047857', dark: '#34D399' },
    ipReceipts: { light: '#065F46', dark: '#6EE7B7' }
  }
};

// Normalization helpers for cross-metric comparison
export interface NormalizationConfig {
  min: number;
  max: number;
  higherIsBetter: boolean;
}

export const metricNormalizationRanges: { [key: string]: NormalizationConfig } = {
  rdSpending: { min: 0, max: 5, higherIsBetter: true },
  patentApplicationsResident: { min: 0, max: 500000, higherIsBetter: true },
  researchersRD: { min: 0, max: 10000, higherIsBetter: true },
  hightechExports: { min: 0, max: 50, higherIsBetter: true },
  internetUsers: { min: 0, max: 100, higherIsBetter: true },
  vcFunding: { min: 0, max: 350, higherIsBetter: true },
  stemGraduates: { min: 0, max: 40, higherIsBetter: true },
  aiPatents: { min: 0, max: 50000, higherIsBetter: true },
  ecommerceAdoption: { min: 0, max: 40, higherIsBetter: true },
  digitalPayments: { min: 0, max: 100, higherIsBetter: true },
  trademarkApplications: { min: 0, max: 1000000, higherIsBetter: true },
  ipReceipts: { min: 0, max: 150e9, higherIsBetter: true },
  ipPayments: { min: 0, max: 100e9, higherIsBetter: false }
};

// Normalize a value to 0-100 scale based on metric config
export function normalizeValue(value: number, metricKey: string): number {
  const config = metricNormalizationRanges[metricKey];
  if (!config) return 50;
  
  const { min, max, higherIsBetter } = config;
  let normalized = ((value - min) / (max - min)) * 100;
  normalized = Math.max(0, Math.min(100, normalized));
  
  return higherIsBetter ? normalized : 100 - normalized;
}

// Calculate composite score from multiple normalized metrics
export function calculateCompositeScore(
  values: { [key: string]: number },
  weights: { [key: string]: number }
): number {
  let totalWeight = 0;
  let weightedSum = 0;
  
  Object.entries(weights).forEach(([key, weight]) => {
    if (values[key] !== undefined && values[key] !== null) {
      const normalized = normalizeValue(values[key], key);
      weightedSum += normalized * weight;
      totalWeight += weight;
    }
  });
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

// Get color for normalized value (0-100)
export function getHeatmapColor(value: number, isDarkMode: boolean): string {
  const scheme = heatmapColorSchemes.performance.colors;
  
  if (value >= 80) return isDarkMode ? scheme.veryHigh.dark : scheme.veryHigh.light;
  if (value >= 60) return isDarkMode ? scheme.high.dark : scheme.high.light;
  if (value >= 40) return isDarkMode ? scheme.medium.dark : scheme.medium.light;
  if (value >= 20) return isDarkMode ? scheme.low.dark : scheme.low.light;
  return isDarkMode ? scheme.veryLow.dark : scheme.veryLow.light;
}

// Get diverging color for balance values (positive/negative)
export function getDivergingColor(value: number, isDarkMode: boolean): string {
  const scheme = heatmapColorSchemes.diverging.colors;
  
  if (value > 0) return isDarkMode ? scheme.positive.dark : scheme.positive.light;
  if (value < 0) return isDarkMode ? scheme.negative.dark : scheme.negative.light;
  return isDarkMode ? scheme.neutral.dark : scheme.neutral.light;
}

// Calculate efficiency ratio (output per input)
export function calculateEfficiency(output: number, input: number): number {
  if (input === 0) return 0;
  return output / input;
}

// Get quadrant classification for scatter plots
export function getQuadrant(
  xValue: number, 
  yValue: number, 
  xThreshold: number, 
  yThreshold: number
): 'high-high' | 'high-low' | 'low-high' | 'low-low' {
  const isHighX = xValue >= xThreshold;
  const isHighY = yValue >= yThreshold;
  
  if (isHighX && isHighY) return 'high-high';
  if (isHighX && !isHighY) return 'high-low';
  if (!isHighX && isHighY) return 'low-high';
  return 'low-low';
}

// Quadrant labels for R&D efficiency chart
export const efficiencyQuadrantLabels = {
  'high-high': { label: 'Innovation Leaders', description: 'High investment, high output', color: '#3B82F6' },
  'high-low': { label: 'Inefficient Spenders', description: 'High investment, low output', color: '#EF4444' },
  'low-high': { label: 'Efficient Innovators', description: 'Low investment, high output', color: '#10B981' },
  'low-low': { label: 'Developing', description: 'Low investment, low output', color: '#F59E0B' }
};

// IP trade balance classification
export const ipBalanceClassification = {
  surplus: { label: 'IP Exporter', description: 'Net receiver of IP royalties', color: '#10B981' },
  deficit: { label: 'IP Importer', description: 'Net payer of IP royalties', color: '#EF4444' },
  balanced: { label: 'Balanced', description: 'Roughly equal IP flows', color: '#6B7280' }
};

// Get IP balance classification
export function getIPBalanceClass(receipts: number, payments: number): keyof typeof ipBalanceClassification {
  const balance = receipts - payments;
  const threshold = Math.max(receipts, payments) * 0.1;
  
  if (balance > threshold) return 'surplus';
  if (balance < -threshold) return 'deficit';
  return 'balanced';
}
